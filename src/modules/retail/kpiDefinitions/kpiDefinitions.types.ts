export const RETAIL_KPI_DEFINITIONS_TYPES = {
  Repository: Symbol.for("RetailKpiDefinitionsRepository"),
  Service: Symbol.for("RetailKpiDefinitionsService"),
  Controller: Symbol.for("RetailKpiDefinitionsController"),
  Router: Symbol.for("RetailKpiDefinitionsRouter"),
} as const;

export const KPIDEFINITIONS_RESOURCE = "kpi-definitions" as const;
