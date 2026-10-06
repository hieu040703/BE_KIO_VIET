export const RETAIL_EXPENSE_CATEGORIES_TYPES = {
  Repository: Symbol.for("RetailExpenseCategoriesRepository"),
  Service: Symbol.for("RetailExpenseCategoriesService"),
  Controller: Symbol.for("RetailExpenseCategoriesController"),
  Router: Symbol.for("RetailExpenseCategoriesRouter"),
} as const;

export const EXPENSECATEGORIES_RESOURCE = "expense-categories" as const;
