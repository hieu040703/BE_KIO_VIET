import { container } from "@/modules/container";
import type { EmployeeRepository } from "@/modules/employee/employee.repository";
import { EMPLOYEE_TYPES } from "@/modules/employee/employee.types";
import { EmployeeStatusType, PositionDefaultEnum } from "@/shared/constants/constance";
import logger from "@/shared/utils/logger";
import { Cron } from "croner";
import {
  COLLABORATOR_INACTIVITY_NOTE,
  getCollaboratorInactivityCutoff,
} from "./employeeCollaboratorInactivity.helpers";

export const EMPLOYEE_COLLABORATOR_INACTIVITY_CRON = "0 0 1 * * *";

export async function deactivateInactiveCollaborators(now: Date = new Date()): Promise<number> {
  const employeeRepository = container.get<EmployeeRepository>(EMPLOYEE_TYPES.EmployeeRepository);
  const cutoff = getCollaboratorInactivityCutoff(now);
  const rows = (await employeeRepository.getRepository().manager.query(
    `
      WITH active_collaborators AS (
        SELECT
          employee."id",
          COALESCE(
            (
              SELECT order_employee."timeAt"
              FROM "order_employees" AS order_employee
              WHERE order_employee."employeeId" = employee."id"
                AND order_employee."deletedAt" IS NULL
                AND order_employee."startTime" IS NOT NULL
                AND order_employee."timeAt" <= $6
              ORDER BY order_employee."timeAt" DESC, order_employee."id" DESC
              LIMIT 1
            ),
            employee."startDate"::timestamp with time zone
          ) AS "inactivityReferenceAt"
        FROM "employees" AS employee
        WHERE employee."position" = $3
          AND employee."status" = $4
          AND employee."deletedAt" IS NULL
      )
      UPDATE "employees" AS employee
      SET
        "status" = $1,
        "note" = $2,
        "updatedAt" = CURRENT_TIMESTAMP
      FROM active_collaborators AS candidate
      WHERE employee."id" = candidate."id"
        AND employee."position" = $3
        AND employee."status" = $4
        AND employee."deletedAt" IS NULL
        AND (
          candidate."inactivityReferenceAt" IS NULL
          OR candidate."inactivityReferenceAt" < $5
        )
      RETURNING employee."id"
    `,
    [
      EmployeeStatusType.INACTIVE,
      COLLABORATOR_INACTIVITY_NOTE,
      PositionDefaultEnum.COLLABORATORS,
      EmployeeStatusType.ACTIVE,
      cutoff,
      now,
    ],
  )) as Array<{ id: string }>;

  return rows.length;
}

async function process(): Promise<void> {
  try {
    const affected = await deactivateInactiveCollaborators();
    logger.info(`EMPLOYEE COLLABORATOR INACTIVITY JOB: deactivated ${affected} employee(s)`);
  } catch (error) {
    logger.error("Error in Employee Collaborator Inactivity Job:", error);
  }
}

let job: Cron | null = null;
let isProcessing = false;

export const JobEmployeeCollaboratorInactivity = {
  start: () => {
    if (!job) {
      job = new Cron(
        EMPLOYEE_COLLABORATOR_INACTIVITY_CRON,
        { timezone: "Asia/Ho_Chi_Minh" },
        async () => {
          if (isProcessing) {
            logger.warn("EMPLOYEE COLLABORATOR INACTIVITY JOB: previous run is still processing");
            return;
          }

          isProcessing = true;
          logger.info("START EMPLOYEE COLLABORATOR INACTIVITY JOB: " + new Date().toISOString());
          try {
            await process();
          } finally {
            isProcessing = false;
          }
        },
      );
    }
  },
  stop: () => {
    if (job) {
      job.stop();
      job = null;
      logger.info("STOP EMPLOYEE COLLABORATOR INACTIVITY JOB");
    }
  },
};
