export interface EmployeeEstimatedCompletionRow {
  employeeId: string;
  estimatedCompletionAt: Date | string | null;
}

const parseValidDate = (value: Date | string | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getLatestEstimatedCompletionAtByEmployeeId = (
  rows: EmployeeEstimatedCompletionRow[],
): Map<string, Date> => {
  const latestByEmployeeId = new Map<string, Date>();

  rows.forEach((row) => {
    const estimatedCompletionAt = parseValidDate(row.estimatedCompletionAt);
    if (!estimatedCompletionAt) {
      return;
    }

    const currentLatest = latestByEmployeeId.get(row.employeeId);
    if (!currentLatest || estimatedCompletionAt > currentLatest) {
      latestByEmployeeId.set(row.employeeId, estimatedCompletionAt);
    }
  });

  return latestByEmployeeId;
};

export const calculateEstimatedAvailableHours = (
  estimatedCompletionAt: Date | string | null | undefined,
  now: Date = new Date(),
): number | null => {
  const completionAt = parseValidDate(estimatedCompletionAt);
  const nowTime = now.getTime();

  if (!completionAt || Number.isNaN(nowTime)) {
    return null;
  }

  return Number(((completionAt.getTime() - nowTime) / (60 * 60 * 1000)).toFixed(2));
};
