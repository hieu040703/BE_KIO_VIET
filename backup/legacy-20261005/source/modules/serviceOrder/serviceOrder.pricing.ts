import { IQuoteItem } from "@/database/models/ServiceOrder";
import { OrderFeeCategoryCodeEnum, ServiceOrderTypeEnum } from "@/shared/constants/constance";

const MANAGED_QUOTE_CODES = new Set<OrderFeeCategoryCodeEnum>([
  OrderFeeCategoryCodeEnum.URGENT,
  OrderFeeCategoryCodeEnum.FRAGILE_ITEM,
  OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT,
  OrderFeeCategoryCodeEnum.POINTS_DISCOUNT,
]);

export type BuildServiceOrderPricingInput = {
  baseItems: IQuoteItem[];
  isUrgent?: boolean;
  urgentSurchargePercent?: number | null;
  hasFragileItems?: boolean;
  fragileItemSurchargePercent?: number | null;
  voucherDiscountAmount?: number | null;
  hasVat?: boolean | null;
  vat?: number | null;
};

export type ServiceOrderPricingResult = {
  quote: IQuoteItem[];
  basePrice: number;
  preVatAmount: number;
  vatAmount: number;
  amount: number;
};

export type EstimatedServiceOrderPriceInput = BuildServiceOrderPricingInput & {
  type: ServiceOrderTypeEnum;
  servicePrices: Array<{
    price?: number | null;
    quantity?: number | null;
    includedQuantity?: number | null;
    excessUnitPrice?: number | null;
  }>;
  employeeCount?: number | null;
  distanceKm?: number | null;
};

export type EstimatedServiceOrderPriceResult = {
  items: IQuoteItem[];
  basePrice: number;
  preVatAmount: number;
  vat: number;
  vatAmount: number;
  totalPrice: number;
  isUrgent: boolean;
};

const money = (value?: number | null): number => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const packageQuantity = (value?: number | null): number => (value == null ? 1 : money(value));

const signedTotal = (items: IQuoteItem[]): number =>
  items.reduce((sum, item) => sum + (item.type === "dec" ? -money(item.value) : money(item.value)), 0);

export const isUrgentServiceOrder = (input: {
  enabled: boolean;
  urgentOrderHours: number;
  timeAt: Date;
  now?: Date;
}): boolean => {
  if (!input.enabled || input.urgentOrderHours < 0) return false;
  const differenceMs = input.timeAt.getTime() - (input.now ?? new Date()).getTime();
  return differenceMs >= 0 && differenceMs <= input.urgentOrderHours * 60 * 60 * 1000;
};

export const buildServiceOrderPricing = (input: BuildServiceOrderPricingInput): ServiceOrderPricingResult => {
  const baseItems = input.baseItems.filter((item) => item.code == null || !MANAGED_QUOTE_CODES.has(item.code));
  const basePrice = baseItems
    .filter((item) => item.code === null && item.type === "inc")
    .reduce((sum, item) => sum + money(item.value), 0);
  const quote = [...baseItems];

  const addPercentageFee = (
    enabled: boolean | undefined,
    percent: number,
    code: OrderFeeCategoryCodeEnum,
    key: string,
  ) => {
    const value = enabled ? (basePrice * percent) / 100 : 0;
    if (value > 0) quote.push({ key, value, code, type: "inc" });
  };

  addPercentageFee(
    input.isUrgent,
    money(input.urgentSurchargePercent),
    OrderFeeCategoryCodeEnum.URGENT,
    "Phụ phí đơn gấp",
  );
  addPercentageFee(
    input.hasFragileItems,
    money(input.fragileItemSurchargePercent),
    OrderFeeCategoryCodeEnum.FRAGILE_ITEM,
    "Phụ phí hàng dễ vỡ",
  );

  const voucherDiscount = Math.min(money(input.voucherDiscountAmount), Math.max(signedTotal(quote), 0));
  if (voucherDiscount > 0) {
    quote.push({
      key: "Giảm giá voucher",
      value: voucherDiscount,
      code: OrderFeeCategoryCodeEnum.VOUCHER_DISCOUNT,
      type: "dec",
    });
  }

  const preVatAmount = Math.max(signedTotal(quote), 0);
  const vatAmount = input.hasVat ? (preVatAmount * money(input.vat)) / 100 : 0;
  return { quote, basePrice, preVatAmount, vatAmount, amount: preVatAmount + vatAmount };
};

export const calculateEstimatedServiceOrderPrice = (
  input: EstimatedServiceOrderPriceInput,
): EstimatedServiceOrderPriceResult => {
  let serviceFee = input.servicePrices.reduce(
    (sum, item) => sum + money(item.price) * packageQuantity(item.quantity),
    0,
  );

  if (input.type === ServiceOrderTypeEnum.BOC_XEP_THEO_CA) {
    serviceFee *= money(input.employeeCount);
  }

  if (input.type === ServiceOrderTypeEnum.DICH_VU_VAN_TAI) {
    serviceFee = input.servicePrices.reduce((sum, item) => {
      const excessDistanceKm = Math.max(money(input.distanceKm) - money(item.includedQuantity), 0);
      return sum + (money(item.price) + excessDistanceKm * money(item.excessUnitPrice)) * packageQuantity(item.quantity);
    }, 0);
  }

  const pricing = buildServiceOrderPricing({
    ...input,
    baseItems: [{ key: "Phí dịch vụ", value: serviceFee, code: null, type: "inc" }],
  });
  return {
    items: pricing.quote,
    basePrice: pricing.basePrice,
    preVatAmount: pricing.preVatAmount,
    vat: input.hasVat ? money(input.vat) : 0,
    vatAmount: pricing.vatAmount,
    totalPrice: pricing.amount,
    isUrgent: Boolean(input.isUrgent),
  };
};

export const mapServiceOrderQuoteToOrderPricing = (quote: IQuoteItem[] | null | undefined) => ({
  discountAmount: (quote ?? [])
    .filter((item) => item.type === "dec")
    .reduce((sum, item) => sum + money(item.value), 0),
  details: (quote ?? [])
    .filter((item) => item.type === "inc")
    .map((item) => ({
      name: item.key,
      quantity: 1,
      price: item.value,
      unit: "ca",
      total: item.value,
    })),
});
