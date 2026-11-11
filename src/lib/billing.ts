import {
  BillRecord,
  BusinessSettings,
  CartItem,
  Customer,
  DiscountType,
  Order,
} from "@/types";
import { formatCurrency } from "./utils";

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: "RestroDesk Cafe",
  address: "123, MG Road, Bengaluru, Karnataka - 560001",
  phone: "9800000001",
  email: "info@restrodesk.com",
  gstin: "29AABCT1234F1ZP",
  state: "Karnataka",
  stateCode: "29",
  sac: "9963",
  invoicePrefix: "INV-2026-",
  serviceChargeRate: 5,
  roundOffEnabled: true,
  upiId: "restrodesk@upi",
};

export const BUSINESS_INFO = {
  name: "RestroDesk Cafe",
  address: "123, MG Road, Bengaluru, Karnataka - 560001",
  phone: "9800000001",
  gstin: "29AABCT1234F1ZP",
  sac: "9963",
  invoicePrefix: "INV-2026-",
  upiId: "restrodesk@upi",
  cashierName: "Rajesh Verma",
} as const;

export interface BillCalculationInput {
  items: CartItem[];
  orderType: "dine-in" | "takeaway" | "delivery";
  discountType: DiscountType;
  discountValue: number;
  discountReason?: string;
  includeServiceCharge: boolean;
  serviceChargeRate?: number;
  roundOffEnabled: boolean;
}

export interface BillTotals {
  subtotal: number;
  discountAmount: number;
  discountLabel?: string;
  cgst5: number;
  sgst5: number;
  cgst18: number;
  sgst18: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  rawTotal: number;
  roundOff: number;
  total: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateBillTotals({
  items,
  orderType,
  discountType,
  discountValue,
  discountReason,
  includeServiceCharge,
  serviceChargeRate = 5,
  roundOffEnabled,
}: BillCalculationInput): BillTotals {
  const subtotal = round2(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const safeVal = Math.max(0, Number.isFinite(discountValue) ? discountValue : 0);

  let discountAmount = 0;
  let discountLabel: string | undefined;

  if (subtotal > 0 && safeVal > 0) {
    if (discountType === "percent") {
      const pct = Math.min(100, safeVal);
      discountAmount = round2((subtotal * pct) / 100);
      discountLabel = `${pct}%${discountReason ? ` (${discountReason})` : ""}`;
    } else {
      discountAmount = round2(Math.min(subtotal, safeVal));
      discountLabel = discountReason || undefined;
    }
  }

  // Apply discount proportionally across tax slabs so GST reflects net taxable value
  const discountFactor = subtotal > 0 ? (subtotal - discountAmount) / subtotal : 1;

  const gst5Base = items
    .filter((c) => c.gstRate === 5)
    .reduce((sum, c) => sum + c.price * c.quantity, 0) * discountFactor;
  const gst18Base = items
    .filter((c) => c.gstRate === 18)
    .reduce((sum, c) => sum + c.price * c.quantity, 0) * discountFactor;

  const cgst5 = round2(gst5Base * 0.025);
  const sgst5 = round2(gst5Base * 0.025);
  const cgst18 = round2(gst18Base * 0.09);
  const sgst18 = round2(gst18Base * 0.09);
  const cgst = round2(cgst5 + cgst18);
  const sgst = round2(sgst5 + sgst18);

  const serviceCharge =
    orderType === "dine-in" && includeServiceCharge
      ? round2((subtotal - discountAmount) * (Math.max(0, serviceChargeRate) / 100))
      : 0;

  const rawTotal = round2(Math.max(0, subtotal - discountAmount + cgst + sgst + serviceCharge));
  const total = roundOffEnabled ? Math.round(rawTotal) : rawTotal;
  const roundOff = round2(total - rawTotal);

  return {
    subtotal,
    discountAmount,
    discountLabel,
    cgst5,
    sgst5,
    cgst18,
    sgst18,
    cgst,
    sgst,
    serviceCharge,
    rawTotal,
    roundOff,
    total,
  };
}

export function formatBillText(
  bill: BillRecord,
  settings: BusinessSettings = DEFAULT_BUSINESS_SETTINGS
): string {
  const lines: string[] = [
    settings.name,
    settings.address,
    `Tel: ${settings.phone} | GSTIN: ${settings.gstin}`,
    "----------------------------------------",
    `Bill No : ${bill.invoiceNumber}`,
    `Date    : ${new Date(bill.createdAt).toLocaleString("en-IN")}`,
    `Type    : ${bill.type.toUpperCase()}${bill.tableNumber ? ` (Table ${bill.tableNumber})` : ""}`,
    `Cashier : ${bill.cashierName}`,
  ];

  if (bill.customerName) {
    lines.push(`Customer: ${bill.customerName}${bill.customerPhone ? ` (${bill.customerPhone})` : ""}`);
  }

  lines.push("----------------------------------------");
  lines.push("Item                    Qty    Amount");
  lines.push("----------------------------------------");

  for (const item of bill.items) {
    const name = item.name.slice(0, 22).padEnd(22, " ");
    const qty = String(item.quantity).padStart(3, " ");
    const amt = formatCurrency(item.price * item.quantity).padStart(10, " ");
    lines.push(`${name} ${qty} ${amt}`);
    if (item.notes) {
      lines.push(`  Note: ${item.notes}`);
    }
  }

  lines.push("----------------------------------------");
  lines.push(`Subtotal                ${formatCurrency(bill.subtotal).padStart(14, " ")}`);
  if (bill.discount > 0) {
    lines.push(`Discount                ${`-${formatCurrency(bill.discount)}`.padStart(14, " ")}`);
  }
  if (bill.cgst5 + bill.sgst5 > 0) {
    lines.push(`CGST 2.5%               ${formatCurrency(bill.cgst5).padStart(14, " ")}`);
    lines.push(`SGST 2.5%               ${formatCurrency(bill.sgst5).padStart(14, " ")}`);
  }
  if (bill.cgst18 + bill.sgst18 > 0) {
    lines.push(`CGST 9%                 ${formatCurrency(bill.cgst18).padStart(14, " ")}`);
    lines.push(`SGST 9%                 ${formatCurrency(bill.sgst18).padStart(14, " ")}`);
  }
  if (bill.serviceCharge > 0) {
    lines.push(`Service Charge (5%)     ${formatCurrency(bill.serviceCharge).padStart(14, " ")}`);
  }
  if (bill.roundOff !== 0) {
    const sign = bill.roundOff > 0 ? "+" : "";
    lines.push(`Round Off               ${`${sign}${bill.roundOff.toFixed(2)}`.padStart(14, " ")}`);
  }
  lines.push("========================================");
  lines.push(`GRAND TOTAL             ${formatCurrency(bill.total).padStart(14, " ")}`);
  lines.push(`Status: ${bill.paymentStatus.toUpperCase()}${bill.paymentMode ? ` (${bill.paymentMode.toUpperCase()})` : ""}`);
  lines.push("----------------------------------------");
  lines.push("Thank you for dining with us!");
  return lines.join("\n");
}

export function orderToDraftBill(
  order: Order,
  existingBill?: BillRecord | null,
  customer?: Customer | null
): BillRecord {
  const totals = calculateBillTotals({
    items: order.items,
    orderType: order.type,
    discountType: "flat",
    discountValue: order.discount,
    includeServiceCharge: order.serviceCharge > 0,
    roundOffEnabled: true,
  });

  return {
    id: existingBill?.id ?? `draft-${order.id}`,
    invoiceNumber: existingBill?.invoiceNumber ?? "PREVIEW",
    orderId: order.id,
    type: order.type,
    tableNumber: order.tableId ? Number(order.tableId.replace("t", "")) : undefined,
    guestCount: order.guestCount,
    waiterName: order.waiterName,
    customerId: customer?.id ?? order.customerId,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    items: order.items,
    subtotal: totals.subtotal,
    discount: totals.discountAmount,
    discountLabel: totals.discountLabel,
    cgst5: totals.cgst5,
    sgst5: totals.sgst5,
    cgst18: totals.cgst18,
    sgst18: totals.sgst18,
    cgst: totals.cgst,
    sgst: totals.sgst,
    serviceCharge: totals.serviceCharge,
    roundOff: totals.roundOff,
    total: totals.total,
    paymentStatus: existingBill?.paymentStatus ?? "unpaid",
    paymentMode: existingBill?.paymentMode,
    paymentDetails: existingBill?.paymentDetails,
    createdAt: existingBill?.createdAt ?? order.createdAt,
    settledAt: existingBill?.settledAt,
    cashierName: BUSINESS_INFO.cashierName,
  };
}


