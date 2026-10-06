import { DataSource, EntityManager, QueryRunner } from "typeorm";
import DatabaseConfig from "@/database/database";
import { injectable } from "inversify";
import logger from "@/shared/utils/logger";

@injectable()
export class TransactionManager {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = DatabaseConfig;
  }

  async withTransaction<T>(operation: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      if (!queryRunner.isReleased) {
        await queryRunner.commitTransaction();
      }
      return result;
    } catch (error) {
      if (!queryRunner.isReleased) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (rollbackError) {
          logger.error("TransactionManager: rollback failed", rollbackError);
        }
      }
      throw error;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  async withTransactionCallback<T>(callback: (manager: EntityManager) => Promise<T>): Promise<T> {
    return await this.dataSource.transaction(async (manager) => {
      return await callback(manager);
    });
  }
}
