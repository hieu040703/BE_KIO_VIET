export const RETAIL_EMPLOYEE_DOCUMENTS_TYPES = {
  Repository: Symbol.for("RetailEmployeeDocumentsRepository"),
  Service: Symbol.for("RetailEmployeeDocumentsService"),
  Controller: Symbol.for("RetailEmployeeDocumentsController"),
  Router: Symbol.for("RetailEmployeeDocumentsRouter"),
} as const;

export const EMPLOYEEDOCUMENTS_RESOURCE = "employee-documents" as const;
