export const RETAIL_BRANCHES_TYPES = {
  Repository: Symbol.for("RetailBranchesRepository"),
  Service: Symbol.for("RetailBranchesService"),
  Controller: Symbol.for("RetailBranchesController"),
  Router: Symbol.for("RetailBranchesRouter"),
} as const;

export const BRANCHES_RESOURCE = "branches" as const;
