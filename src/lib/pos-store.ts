"use client";

import { useSyncExternalStore } from "react";
import {
  customers as seedCustomers,
  inventory as seedInventory,
  kotItems as seedKots,
  menuItems as seedMenuItems,
  orders as seedOrders,
  staff as seedStaff,
  tables as seedTables,
} from "@/data/seed";
import {
  BillRecord,
  BusinessSettings,
  CartItem,
  Customer,
  InventoryItem,
  KOTItem,
  MenuItem,
  Order,
  PaymentDetails,
  Staff,
  Table,
} from "@/types";
import { BUSINESS_INFO, DEFAULT_BUSINESS_SETTINGS } from "./billing";

const STORAGE_KEY = "restrodesk_pos_state_v1";

export interface PosState {
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  kotItems: KOTItem[];
  customers: Customer[];
  staff: Staff[];
  inventory: InventoryItem[];
  bills: BillRecord[];
  settings: BusinessSettings;
  nextInvoiceSeq: number;
}

const listeners = new Set<() => void>();
let hydrated = false;

function createInitialBills(): BillRecord[] {
  return seedOrders
    .filter((o) => o.status === "completed")
    .map((o, idx) => {
      const seq = String(idx + 5).padStart(3, "0");
      return {
        id: `bill-${o.id}`,
        invoiceNumber: `${BUSINESS_INFO.invoicePrefix}${seq}`,
        orderId: o.id,
        type: o.type,
        tableNumber: o.tableId ? Number(o.tableId.replace("t", "")) : undefined,
        guestCount: o.guestCount,
        waiterName: o.waiterName,
        items: o.items,
        subtotal: o.subtotal,
        discount: o.discount,
        cgst5: o.cgst,
        sgst5: o.sgst,
        cgst18: 0,
        sgst18: 0,
        cgst: o.cgst,
        sgst: o.sgst,
        serviceCharge: o.serviceCharge,
        roundOff: 0,
        total: o.total,
        paymentStatus: "paid" as const,
        paymentMode: o.paymentMode ?? "cash",
        createdAt: o.createdAt,
        settledAt: o.completedAt ?? o.createdAt,
        cashierName: BUSINESS_INFO.cashierName,
      };
    });
}

function createSeedState(): PosState {
  return {
    menuItems: seedMenuItems.map((m) => ({
      ...m,
      ingredients: m.ingredients ? [...m.ingredients] : undefined,
    })),
    tables: seedTables.map((t) => ({ ...t })),
    orders: seedOrders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i })) })),
    kotItems: seedKots.map((k) => ({ ...k, items: k.items.map((i) => ({ ...i })) })),
    customers: seedCustomers.map((c) => ({ ...c, tags: [...c.tags] })),
    staff: seedStaff.map((s) => ({ ...s })),
    inventory: seedInventory.map((i) => ({ ...i })),
    bills: createInitialBills(),
    settings: { ...DEFAULT_BUSINESS_SETTINGS },
    nextInvoiceSeq: 7,
  };
}

let state: PosState = createSeedState();

function persistState(next: PosState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or privacy restrictions
  }
}

function emit(next: PosState, persist = true) {
  state = next;
  if (persist) persistState(next);
  listeners.forEach((listener) => listener());
}

export function hydratePosStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<PosState>;
    const seed = createSeedState();
    emit(
      {
        menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : seed.menuItems,
        tables: Array.isArray(parsed.tables) ? parsed.tables : seed.tables,
        orders: Array.isArray(parsed.orders) ? parsed.orders : seed.orders,
        kotItems: Array.isArray(parsed.kotItems) ? parsed.kotItems : seed.kotItems,
        customers: Array.isArray(parsed.customers) ? parsed.customers : seed.customers,
        staff: Array.isArray(parsed.staff) ? parsed.staff : seed.staff,
        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : seed.inventory,
        bills: Array.isArray(parsed.bills) ? parsed.bills : seed.bills,
        settings: parsed.settings
          ? { ...seed.settings, ...parsed.settings }
          : seed.settings,
        nextInvoiceSeq:
          typeof parsed.nextInvoiceSeq === "number"
            ? parsed.nextInvoiceSeq
            : seed.nextInvoiceSeq,
      },
      false
    );
  } catch {
    // Ignore corrupt localStorage payload
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PosState {
  return state;
}

export function usePosStore(): PosState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getPosState(): PosState {
  return state;
}

function formatInvoiceNumber(seq: number): string {
  return `${state.settings.invoicePrefix}${String(seq).padStart(3, "0")}`;
}

export interface SaveOrderInput {
  orderId?: string | null;
  type: "dine-in" | "takeaway" | "delivery";
  tableNumber: number | null;
  guestCount?: number;
  waiterName?: string;
  notes?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  customerId?: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  total: number;
}

function upsertOrderRecord(
  orders: Order[],
  tables: Table[],
  input: SaveOrderInput,
  status: Order["status"],
  extra?: { kotPrinted?: boolean; paymentMode?: Order["paymentMode"]; completedAt?: string }
): { orders: Order[]; tables: Table[]; order: Order } {
  const now = new Date().toISOString();
  const table = input.tableNumber
    ? tables.find((t) => t.number === input.tableNumber)
    : undefined;
  const orderId = input.orderId ?? `o${Date.now().toString().slice(-5)}`;
  const existing = orders.find((o) => o.id === orderId);

  const nextOrder: Order = {
    id: orderId,
    tableId: input.type === "dine-in" && table ? table.id : undefined,
    type: input.type,
    status,
    guestCount: input.type === "dine-in" ? input.guestCount ?? existing?.guestCount : undefined,
    waiterName: input.waiterName ?? existing?.waiterName,
    notes: input.notes ?? existing?.notes,
    deliveryPhone:
      input.type === "delivery" ? input.deliveryPhone ?? existing?.deliveryPhone : undefined,
    deliveryAddress:
      input.type === "delivery" ? input.deliveryAddress ?? existing?.deliveryAddress : undefined,
    items: input.items.map((i) => ({ ...i })),
    subtotal: input.subtotal,
    cgst: input.cgst,
    sgst: input.sgst,
    discount: input.discount,
    serviceCharge: input.serviceCharge,
    total: input.total,
    customerId: input.customerId ?? undefined,
    createdAt: existing?.createdAt ?? now,
    completedAt: extra?.completedAt ?? existing?.completedAt,
    paymentMode: extra?.paymentMode ?? existing?.paymentMode,
    kotPrinted: extra?.kotPrinted ?? existing?.kotPrinted ?? false,
  };

  const nextOrders = existing
    ? orders.map((o) => (o.id === orderId ? nextOrder : o))
    : [nextOrder, ...orders];

  const nextTables = tables.map((t) => {
    if (status === "completed" && (t.currentOrderId === orderId || (table && t.id === table.id))) {
      return { ...t, status: "dirty" as const, currentOrderId: undefined };
    }
    if (status === "cancelled" && t.currentOrderId === orderId) {
      return { ...t, status: "available" as const, currentOrderId: undefined };
    }
    if (status === "active" && input.type === "dine-in" && table && t.id === table.id) {
      return { ...t, status: "occupied" as const, currentOrderId: orderId };
    }
    return t;
  });

  return { orders: nextOrders, tables: nextTables, order: nextOrder };
}

export function createOrUpdateOrder(
  input: SaveOrderInput,
  options?: { sendKotToKitchen?: boolean }
): { order: Order; kot?: KOTItem } {
  const sendToKitchen = options?.sendKotToKitchen ?? false;
  const { orders, tables, order } = upsertOrderRecord(
    state.orders,
    state.tables,
    input,
    "active",
    sendToKitchen ? { kotPrinted: true } : undefined
  );

  let kot: KOTItem | undefined;
  let nextKots = state.kotItems;

  if (sendToKitchen) {
    kot = {
      id: `k${state.kotItems.length + 1}`,
      orderId: order.id,
      tableNumber: input.type === "dine-in" ? input.tableNumber ?? undefined : undefined,
      items: input.items.map((i) => ({ name: i.name, quantity: i.quantity, notes: i.notes })),
      status: "pending",
      createdAt: new Date().toISOString(),
      type: input.type,
    };
    nextKots = [kot, ...state.kotItems];
  }

  emit({
    ...state,
    orders,
    tables,
    kotItems: nextKots,
  });

  return { order, kot };
}

export function cancelOrder(orderId: string) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return;

  emit({
    ...state,
    orders: state.orders.map((o) =>
      o.id === orderId ? { ...o, status: "cancelled" } : o
    ),
    tables: state.tables.map((t) =>
      t.currentOrderId === orderId
        ? { ...t, status: "available", currentOrderId: undefined }
        : t
    ),
  });
}

export function sendKot(input: SaveOrderInput): { orderId: string; kot: KOTItem } {
  const { order, kot } = createOrUpdateOrder(input, { sendKotToKitchen: true });
  return {
    orderId: order.id,
    kot: kot!,
  };
}

export function holdCurrentOrder(input: SaveOrderInput): string {
  const { orders, tables, order } = upsertOrderRecord(state.orders, state.tables, input, "held");
  emit({ ...state, orders, tables });
  return order.id;
}

export interface BillInput extends SaveOrderInput {
  existingBillId?: string | null;
  existingInvoiceNumber?: string | null;
  discountLabel?: string;
  cgst5: number;
  sgst5: number;
  cgst18: number;
  sgst18: number;
  roundOff: number;
}

export function billRecordToInput(bill: BillRecord): BillInput {
  return {
    existingBillId: bill.id.startsWith("draft") ? null : bill.id,
    existingInvoiceNumber: bill.invoiceNumber === "PREVIEW" ? null : bill.invoiceNumber,
    orderId: bill.orderId === "new" ? null : bill.orderId,
    type: bill.type,
    tableNumber: bill.tableNumber ?? null,
    guestCount: bill.guestCount,
    waiterName: bill.waiterName,
    customerId: bill.customerId ?? null,
    items: bill.items,
    subtotal: bill.subtotal,
    discount: bill.discount,
    discountLabel: bill.discountLabel,
    cgst5: bill.cgst5,
    sgst5: bill.sgst5,
    cgst18: bill.cgst18,
    sgst18: bill.sgst18,
    cgst: bill.cgst,
    sgst: bill.sgst,
    serviceCharge: bill.serviceCharge,
    roundOff: bill.roundOff,
    total: bill.total,
  };
}

export function generateBillRecord(
  input: BillInput,
  settlement?: {
    paymentMode: "cash" | "card" | "upi" | "split";
    paymentDetails?: PaymentDetails;
  }
): BillRecord {
  const now = new Date().toISOString();
  const isPaid = Boolean(settlement);

  const { orders, tables, order } = upsertOrderRecord(
    state.orders,
    state.tables,
    input,
    isPaid ? "completed" : "active",
    settlement
      ? { paymentMode: settlement.paymentMode, completedAt: now }
      : undefined
  );

  const existingBill = input.existingBillId
    ? state.bills.find((b) => b.id === input.existingBillId)
    : state.bills.find((b) => b.orderId === order.id && b.paymentStatus === "unpaid");

  const invoiceNumber =
    existingBill?.invoiceNumber ??
    input.existingInvoiceNumber ??
    formatInvoiceNumber(state.nextInvoiceSeq);
  const nextInvoiceSeq =
    existingBill || input.existingInvoiceNumber
      ? state.nextInvoiceSeq
      : state.nextInvoiceSeq + 1;

  const customer = input.customerId
    ? state.customers.find((c) => c.id === input.customerId)
    : undefined;

  const bill: BillRecord = {
    id: existingBill?.id ?? `bill-${Date.now()}`,
    invoiceNumber,
    orderId: order.id,
    type: input.type,
    tableNumber: input.type === "dine-in" ? input.tableNumber ?? undefined : undefined,
    guestCount: input.guestCount ?? order.guestCount,
    waiterName: input.waiterName ?? order.waiterName,
    customerId: customer?.id,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    items: input.items.map((i) => ({ ...i })),
    subtotal: input.subtotal,
    discount: input.discount,
    discountLabel: input.discountLabel,
    cgst5: input.cgst5,
    sgst5: input.sgst5,
    cgst18: input.cgst18,
    sgst18: input.sgst18,
    cgst: input.cgst,
    sgst: input.sgst,
    serviceCharge: input.serviceCharge,
    roundOff: input.roundOff,
    total: input.total,
    paymentStatus: isPaid ? "paid" : "unpaid",
    paymentMode: settlement?.paymentMode,
    paymentDetails: settlement?.paymentDetails,
    createdAt: existingBill?.createdAt ?? now,
    settledAt: isPaid ? now : undefined,
    cashierName: BUSINESS_INFO.cashierName,
  };

  const nextBills = existingBill
    ? state.bills.map((b) => (b.id === existingBill.id ? bill : b))
    : [bill, ...state.bills];

  const nextCustomers =
    isPaid && customer
      ? state.customers.map((c) =>
          c.id === customer.id
            ? {
                ...c,
                visits: c.visits + 1,
                totalSpent: c.totalSpent + input.total,
                loyaltyPoints: c.loyaltyPoints + Math.floor(input.total / 10),
                lastVisit: now.slice(0, 10),
              }
            : c
        )
      : state.customers;

  emit({
    ...state,
    orders,
    tables,
    bills: nextBills,
    customers: nextCustomers,
    nextInvoiceSeq,
  });

  return bill;
}

/* ---------------- Menu CRUD ---------------- */
export function addMenuItem(item: Omit<MenuItem, "id">): MenuItem {
  const newItem: MenuItem = {
    ...item,
    id: `m${Date.now().toString().slice(-5)}`,
  };
  emit({ ...state, menuItems: [newItem, ...state.menuItems] });
  return newItem;
}

export function updateMenuItem(id: string, patch: Partial<MenuItem>) {
  emit({
    ...state,
    menuItems: state.menuItems.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  });
}

export function toggleMenuItemAvailability(id: string) {
  emit({
    ...state,
    menuItems: state.menuItems.map((m) =>
      m.id === id ? { ...m, available: !m.available } : m
    ),
  });
}

/* ---------------- Tables CRUD ---------------- */
export function addTable(data: { number: number; capacity: number; section: string }): Table {
  const newTable: Table = {
    id: `t${data.number}-${Date.now().toString().slice(-3)}`,
    number: data.number,
    capacity: data.capacity,
    section: data.section,
    status: "available",
  };
  emit({
    ...state,
    tables: [...state.tables, newTable].sort((a, b) => a.number - b.number),
  });
  return newTable;
}

export function updateTableStatus(tableId: string, status: Table["status"]) {
  emit({
    ...state,
    tables: state.tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            status,
            currentOrderId: status === "available" ? undefined : t.currentOrderId,
          }
        : t
    ),
  });
}

/* ---------------- Customers CRUD ---------------- */
export function addQuickCustomer(data: {
  name: string;
  phone: string;
  email?: string;
  tags?: string[];
}): Customer {
  const newCustomer: Customer = {
    id: `c${Date.now().toString().slice(-5)}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    visits: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    lastVisit: new Date().toISOString().slice(0, 10),
    tags: data.tags && data.tags.length > 0 ? data.tags : ["new"],
  };

  emit({
    ...state,
    customers: [newCustomer, ...state.customers],
  });

  return newCustomer;
}

export function updateCustomerPoints(customerId: string, delta: number) {
  emit({
    ...state,
    customers: state.customers.map((c) =>
      c.id === customerId
        ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints + delta) }
        : c
    ),
  });
}

/* ---------------- Inventory CRUD ---------------- */
export function addInventoryItem(item: Omit<InventoryItem, "id" | "lastRestocked">): InventoryItem {
  const newItem: InventoryItem = {
    ...item,
    id: `i${Date.now().toString().slice(-5)}`,
    lastRestocked: new Date().toISOString().slice(0, 10),
  };
  emit({ ...state, inventory: [newItem, ...state.inventory] });
  return newItem;
}

export function restockInventoryItem(id: string, addedQty: number) {
  emit({
    ...state,
    inventory: state.inventory.map((i) =>
      i.id === id
        ? {
            ...i,
            currentStock: Math.max(0, i.currentStock + addedQty),
            lastRestocked: new Date().toISOString().slice(0, 10),
          }
        : i
    ),
  });
}

/* ---------------- Staff CRUD ---------------- */
export function addStaffMember(member: Omit<Staff, "id" | "joinDate" | "salesTotal">): Staff {
  const newStaff: Staff = {
    ...member,
    id: `s${Date.now().toString().slice(-5)}`,
    joinDate: new Date().toISOString().slice(0, 10),
    salesTotal: 0,
  };
  emit({ ...state, staff: [...state.staff, newStaff] });
  return newStaff;
}

export function updateStaffMember(id: string, patch: Partial<Staff>) {
  emit({
    ...state,
    staff: state.staff.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  });
}

/* ---------------- Kitchen KOT ---------------- */
export function advanceKotStatus(id: string) {
  const nextMap: Record<string, KOTItem["status"]> = {
    pending: "preparing",
    preparing: "ready",
    ready: "served",
  };

  emit({
    ...state,
    kotItems: state.kotItems.map((k) =>
      k.id === id ? { ...k, status: nextMap[k.status] ?? k.status } : k
    ),
  });
}

/* ---------------- Settings & Reset ---------------- */
export function updateBusinessSettings(patch: Partial<BusinessSettings>) {
  emit({
    ...state,
    settings: { ...state.settings, ...patch },
  });
}

export function resetDemoData() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
  emit(createSeedState(), false);
}
