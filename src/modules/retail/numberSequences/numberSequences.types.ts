export const RETAIL_NUMBER_SEQUENCES_TYPES = {
  Repository: Symbol.for("RetailNumberSequencesRepository"),
  Service: Symbol.for("RetailNumberSequencesService"),
  Controller: Symbol.for("RetailNumberSequencesController"),
  Router: Symbol.for("RetailNumberSequencesRouter"),
} as const;

export const NUMBERSEQUENCES_RESOURCE = "number-sequences" as const;
