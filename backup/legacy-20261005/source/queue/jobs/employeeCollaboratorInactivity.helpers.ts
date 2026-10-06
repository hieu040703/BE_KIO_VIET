export const COLLABORATOR_INACTIVITY_DAYS = 5;
export const COLLABORATOR_INACTIVITY_NOTE =
  "Đặt tự đồng về nghỉ việc do quá 5 ngày chưa phát sinh giờ công";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const getCollaboratorInactivityCutoff = (now: Date): Date =>
  new Date(now.getTime() - COLLABORATOR_INACTIVITY_DAYS * MILLISECONDS_PER_DAY);

export const hasCollaboratorWorkedWithinInactivityWindow = (
  lastWorkedAt: Date | null | undefined,
  now: Date,
): boolean => {
  if (!lastWorkedAt) {
    return false;
  }

  const cutoff = getCollaboratorInactivityCutoff(now).getTime();
  const workedAt = lastWorkedAt.getTime();

  return workedAt >= cutoff && workedAt <= now.getTime();
};

export const shouldDeactivateCollaborator = (
  lastWorkedAt: Date | null | undefined,
  now: Date,
  employeeStartDate?: Date | null,
): boolean => {
  if (lastWorkedAt) {
    return !hasCollaboratorWorkedWithinInactivityWindow(lastWorkedAt, now);
  }

  if (!employeeStartDate) {
    return true;
  }

  return employeeStartDate.getTime() < getCollaboratorInactivityCutoff(now).getTime();
};
