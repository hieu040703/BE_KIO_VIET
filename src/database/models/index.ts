import { RetailAttendance } from "./retail/RetailAttendance";
import { RetailBranch } from "./retail/RetailBranch";
import { RetailCustomer } from "./retail/RetailCustomer";
import { RetailEmployee } from "./retail/RetailEmployee";
import { RetailInventory } from "./retail/RetailInventory";
import { RetailOrder } from "./retail/RetailOrder";
import { RetailOrderItem } from "./retail/RetailOrderItem";
import { RetailPayment } from "./retail/RetailPayment";
import { RetailPayroll } from "./retail/RetailPayroll";
import { RetailProduct } from "./retail/RetailProduct";
import { RetailProductVariant } from "./retail/RetailProductVariant";
import { RetailStockLedger } from "./retail/RetailStockLedger";
import { RetailTenant } from "./retail/RetailTenant";
import { RetailUser } from "./retail/RetailUser";
import { RetailWarehouse } from "./retail/RetailWarehouse";
import { retailGenericEntities, retailGenericTableEntities } from "./retail/RetailGenericEntities";

export const entities = [
  RetailTenant,
  RetailBranch,
  RetailWarehouse,
  RetailUser,
  RetailEmployee,
  RetailAttendance,
  RetailPayroll,
  RetailProduct,
  RetailProductVariant,
  RetailStockLedger,
  RetailInventory,
  RetailCustomer,
  RetailOrder,
  RetailOrderItem,
  RetailPayment,
  ...retailGenericEntities,
];

export const retailEntitiesByTable: Record<string, EntityTarget<any>> = {
  tenants: RetailTenant,
  branches: RetailBranch,
  warehouses: RetailWarehouse,
  users: RetailUser,
  employees: RetailEmployee,
  attendances: RetailAttendance,
  payrolls: RetailPayroll,
  products: RetailProduct,
  product_variants: RetailProductVariant,
  stock_ledgers: RetailStockLedger,
  inventories: RetailInventory,
  customers: RetailCustomer,
  orders: RetailOrder,
  order_items: RetailOrderItem,
  payments: RetailPayment,
  ...Object.fromEntries(retailGenericTableEntities.map(({ tableName, entity }) => [tableName, entity])),
};

export {
  RetailAttendance,
  RetailBranch,
  RetailCustomer,
  RetailEmployee,
  RetailInventory,
  RetailOrder,
  RetailOrderItem,
  RetailPayment,
  RetailPayroll,
  RetailProduct,
  RetailProductVariant,
  RetailStockLedger,
  RetailTenant,
  RetailUser,
  RetailWarehouse,
};
import type { EntityTarget } from "typeorm";
