export const RETAIL_FILES_TYPES = {
  Repository: Symbol.for("RetailFilesRepository"),
  Service: Symbol.for("RetailFilesService"),
  Controller: Symbol.for("RetailFilesController"),
  Router: Symbol.for("RetailFilesRouter"),
} as const;

export const FILES_RESOURCE = "files" as const;
