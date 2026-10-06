export const RETAIL_JOBS_TYPES = {
  Repository: Symbol.for("RetailJobsRepository"),
  Service: Symbol.for("RetailJobsService"),
  Controller: Symbol.for("RetailJobsController"),
  Router: Symbol.for("RetailJobsRouter"),
} as const;

export const JOBS_RESOURCE = "jobs" as const;
