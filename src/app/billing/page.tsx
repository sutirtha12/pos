"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BillRecord, CartItem, Customer, DiscountType, KOTItem, MenuItem, Order } from "@/types";
import { BUSINESS_INFO, calculateBillTotals } from "@/lib/billing";
import {
  addQuickCustomer,
  billRecordToInput,
  createOrUpdateOrder,
  generateBillRecord,
  getPosState,
  holdCurrentOrder,
  sendKot,
  usePosStore,
} from "@/lib/pos-store";
import { cn, formatCurrency } from "@/lib/utils";
import BillModal from "@/components/BillModal";
import ThermalReceipt from "@/components/ThermalReceipt";
import {
  BillsDrawer,
  CustomerModal,
  DiscountModal,
  KotModal,
  TablePickerModal,
} from "@/components/BillingModals";
import {
  Bike,
  CheckCircle2,
  ChefHat,
  FileText,
  FolderClock,
  Grid3X3,
  MessageSquarePlus,
  Minus,
  PauseCircle,
  Percent,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  Trash2,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";

function resolveInitialOrder(
  initialTableNumber: number | null,
  initialOrderId: string | null
): Order | null {
  const snapshot = getPosState();
  if (initialOrderId) {
    return snapshot.orders.find((o) => o.id === initialOrderId) ?? null;
  }
  if (initialTableNumber) {
    const table = snapshot.tables.find((t) => t.number === initialTableNumber);
    if (table?.currentOrderId) {
      return snapshot.orders.find((o) => o.id === table.currentOrderId) ?? null;
    }
  }
  return null;
}

function buildDraftBill(params: {
  existingBill: BillRecord | null;
  orderId: string | null;
  orderType: "dine-in" | "takeaway" | "delivery";
  tableNumber: number | null;
  guestCount: number;
  waiterName: string;
  customer: Customer | null;
  items: CartItem[];
  totals: ReturnType<typeof calculateBillTotals>;
}): BillRecord {
  const {
    existingBill,
    orderId,
    orderType,
    tableNumber,
    guestCount,
    waiterName,
    customer,
    items,
    totals,
  } = params;

  return {
    id: existingBill?.id ?? "draft-bill",
    invoiceNumber: existingBill?.invoiceNumber ?? "PREVIEW",
    orderId: orderId ?? "new",
    type: orderType,
    tableNumber: orderType === "dine-in" ? tableNumber ?? undefined : undefined,
    guestCount: orderType === "dine-in" ? guestCount : undefined,
    waiterName: waiterName || undefined,
    customerId: customer?.id,
    customerName: customer?.name,
    customerPhone: customer?.phone,
    items,
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
    createdAt: existingBill?.createdAt ?? new Date().toISOString(),
    settledAt: existingBill?.settledAt,
    cashierName: BUSINESS_INFO.cashierName,
  };
}

interface BillingWorkspaceProps {
  initialTableNumber: number | null;
  initialOrderId: string | null;
  initialAction: "bill" | null;
}

function BillingWorkspace({
  initialTableNumber,
  initialOrderId,
  initialAction,
}: BillingWorkspaceProps) {
  const store = usePosStore();

  const [initialOrder] = useState<Order | null>(() =>
    resolveInitialOrder(initialTableNumber, initialOrderId)
  );

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    () => initialOrder?.id ?? null
  );
  const [cart, setCart] = useState<CartItem[]>(() =>
    initialOrder ? initialOrder.items.map((i) => ({ ...i })) : []
  );
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">(
    () => initialOrder?.type ?? "dine-in"
  );
  const [selectedTable, setSelectedTable] = useState<number | null>(() => {
    if (initialOrder?.tableId) return Number(initialOrder.tableId.replace("t", ""));
    return initialTableNumber;
  });
  const [guestCount, setGuestCount] = useState<number>(
    () => initialOrder?.guestCount ?? 2
  );
  const [waiterName, setWaiterName] = useState<string>(
    () => initialOrder?.waiterName ?? ""
  );
  const [orderNotes, setOrderNotes] = useState<string>(
    () => initialOrder?.notes ?? ""
  );
  const [deliveryPhone, setDeliveryPhone] = useState<string>(
    () => initialOrder?.deliveryPhone ?? ""
  );
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    () => initialOrder?.deliveryAddress ?? ""
  );
  const [customerId, setCustomerId] = useState<string | null>(
    () => initialOrder?.customerId ?? null
  );

  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [discountValue, setDiscountValue] = useState<number>(
    () => initialOrder?.discount ?? 0
  );
  const [discountReason, setDiscountReason] = useState("");
  const [includeServiceCharge, setIncludeServiceCharge] = useState(true);
  const [roundOffEnabled, setRoundOffEnabled] = useState(
    () => store.settings.roundOffEnabled
  );

  const [rightTab, setRightTab] = useState<"cart" | "preview">("cart");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showBillsDrawer, setShowBillsDrawer] = useState(false);
  const [sentKot, setSentKot] = useState<KOTItem | null>(null);
  const [billModalState, setBillModalState] = useState<{
    open: boolean;
    standaloneBill: BillRecord | null;
  }>(() => ({
    open: initialAction === "bill" && Boolean(initialOrder),
    standaloneBill: null,
  }));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(store.menuItems.map((m) => m.category)))],
    [store.menuItems]
  );

  const servers = useMemo(
    () =>
      store.staff.filter(
        (s) => s.active && (s.role === "waiter" || s.role === "manager" || s.role === "owner")
      ),
    [store.staff]
  );

  const attachedCustomer = useMemo(
    () => (customerId ? store.customers.find((c) => c.id === customerId) ?? null : null),
    [customerId, store.customers]
  );

  const selectedTableObj = useMemo(
    () => (selectedTable ? store.tables.find((t) => t.number === selectedTable) ?? null : null),
    [selectedTable, store.tables]
  );

  const filtered = useMemo(() => {
    return store.menuItems.filter((m) => {
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchVeg = !vegOnly || m.isVeg;
      return matchCat && matchSearch && matchVeg && m.available;
    });
  }, [store.menuItems, search, activeCategory, vegOnly]);

  const totals = useMemo(
    () =>
      calculateBillTotals({
        items: cart,
        orderType,
        discountType,
        discountValue,
        discountReason,
        includeServiceCharge,
        serviceChargeRate: store.settings.serviceChargeRate,
        roundOffEnabled,
      }),
    [
      cart,
      orderType,
      discountType,
      discountValue,
      discountReason,
      includeServiceCharge,
      store.settings.serviceChargeRate,
      roundOffEnabled,
    ]
  );

  const existingUnpaidBill = useMemo(() => {
    if (!activeOrderId) return null;
    return (
      store.bills.find(
        (b) => b.orderId === activeOrderId && b.paymentStatus === "unpaid"
      ) ?? null
    );
  }, [activeOrderId, store.bills]);

  const openOrders = store.orders.filter(
    (o) => o.status === "active" || o.status === "held"
  );

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const resetWorkspace = () => {
    setActiveOrderId(null);
    setCart([]);
    setSelectedTable(null);
    setGuestCount(2);
    setWaiterName("");
    setOrderNotes("");
    setDeliveryPhone("");
    setDeliveryAddress("");
    setCustomerId(null);
    setDiscountType("flat");
    setDiscountValue(0);
    setDiscountReason("");
    setEditingNoteId(null);
  };

  const loadOrderIntoWorkspace = (order: Order) => {
    setActiveOrderId(order.id);
    setOrderType(order.type);
    setSelectedTable(
      order.tableId ? Number(order.tableId.replace("t", "")) : null
    );
    setGuestCount(order.guestCount ?? 2);
    setWaiterName(order.waiterName ?? "");
    setOrderNotes(order.notes ?? "");
    setDeliveryPhone(order.deliveryPhone ?? "");
    setDeliveryAddress(order.deliveryAddress ?? "");
    setCart(order.items.map((i) => ({ ...i })));
    setCustomerId(order.customerId ?? null);
    setDiscountType("flat");
    setDiscountValue(order.discount);
    setDiscountReason("");
    setEditingNoteId(null);
  };

  const handleTableSelect = (tableNumber: number | null) => {
    setSelectedTable(tableNumber);
    if (!tableNumber) return;
    const table = store.tables.find((t) => t.number === tableNumber);
    if (table?.currentOrderId) {
      const order = store.orders.find((o) => o.id === table.currentOrderId);
      if (order) {
        loadOrderIntoWorkspace(order);
        notify(`Loaded active order ${order.id.toUpperCase()} for Table ${tableNumber}`);
        return;
      }
    }
    if (table) {
      setGuestCount((prev) => (prev > table.capacity ? table.capacity : prev));
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const updateItemNote = (id: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes: notes || undefined } : c))
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const buildOrderPayload = () => ({
    orderId: activeOrderId,
    type: orderType,
    tableNumber: orderType === "dine-in" ? selectedTable : null,
    guestCount: orderType === "dine-in" ? guestCount : undefined,
    waiterName: waiterName || undefined,
    notes: orderNotes.trim() || undefined,
    deliveryPhone: orderType === "delivery" ? deliveryPhone.trim() || undefined : undefined,
    deliveryAddress: orderType === "delivery" ? deliveryAddress.trim() || undefined : undefined,
    customerId,
    items: cart,
    subtotal: totals.subtotal,
    discount: totals.discountAmount,
    cgst: totals.cgst,
    sgst: totals.sgst,
    serviceCharge: totals.serviceCharge,
    total: totals.total,
  });

  const handleCreateOrUpdateOrder = (sendKotToo: boolean) => {
    if (cart.length === 0) return;
    if (orderType === "dine-in" && !selectedTable) {
      setShowTablePicker(true);
      notify("Select a table for Dine-in order first.");
      return;
    }
    const wasUpdate = Boolean(activeOrderId);
    const { order, kot } = createOrUpdateOrder(buildOrderPayload(), {
      sendKotToKitchen: sendKotToo,
    });
    setActiveOrderId(order.id);
    if (kot) setSentKot(kot);
    const where =
      order.type === "dine-in" && selectedTable
        ? `Table ${selectedTable}`
        : order.type.toUpperCase();
    notify(
      `${wasUpdate ? "Updated" : "Created"} Order ${order.id.toUpperCase()} (${where}) — click Generate Bill anytime to settle.`
    );
  };

  const handleSendKot = () => {
    if (cart.length === 0) return;
    const result = sendKot(buildOrderPayload());
    setActiveOrderId(result.orderId);
    setSentKot(result.kot);
  };

  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    holdCurrentOrder(buildOrderPayload());
    resetWorkspace();
    notify("Order held — open Active & Bills to resume anytime.");
  };

  const buildCurrentBillInput = () => ({
    ...buildOrderPayload(),
    existingBillId: existingUnpaidBill?.id ?? null,
    existingInvoiceNumber: existingUnpaidBill?.invoiceNumber ?? null,
    discountLabel: totals.discountLabel,
    cgst5: totals.cgst5,
    sgst5: totals.sgst5,
    cgst18: totals.cgst18,
    sgst18: totals.sgst18,
    roundOff: totals.roundOff,
  });

  const draftPreviewBill = useMemo(
    () =>
      buildDraftBill({
        existingBill: existingUnpaidBill,
        orderId: activeOrderId,
        orderType,
        tableNumber: selectedTable,
        guestCount,
        waiterName,
        customer: attachedCustomer,
        items: cart,
        totals,
      }),
    [
      existingUnpaidBill,
      activeOrderId,
      orderType,
      selectedTable,
      guestCount,
      waiterName,
      attachedCustomer,
      cart,
      totals,
    ]
  );

  const activeBillForModal = useMemo(() => {
    if (!billModalState.open) return null;
    if (billModalState.standaloneBill) return billModalState.standaloneBill;
    return draftPreviewBill;
  }, [billModalState, draftPreviewBill]);

  const resolveBillInput = () => {
    const standalone = billModalState.standaloneBill;
    return standalone ? billRecordToInput(standalone) : buildCurrentBillInput();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-white md:flex-row dark:bg-zinc-950">
      {/* Left: Menu */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b border-zinc-200 bg-white md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
        {/* Order Type, Table Picker & Quick Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-zinc-950">
          {([
            ["dine-in", UtensilsCrossed],
            ["takeaway", ShoppingBag],
            ["delivery", Bike],
          ] as const).map(([type, Icon]) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                orderType === type
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              <Icon size={14} />
              {type === "dine-in" ? "Dine-in" : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          {orderType === "dine-in" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowTablePicker(true)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Grid3X3 size={14} className="text-zinc-500" />
                {selectedTableObj
                  ? `T-${selectedTableObj.number} (${selectedTableObj.section})`
                  : "Floor Plan"}
              </button>
              <select
                aria-label="Select Table"
                value={selectedTable ?? ""}
                onChange={(e) => handleTableSelect(Number(e.target.value) || null)}
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Select Table</option>
                {store.tables.map((t) => (
                  <option key={t.id} value={t.number}>
                    Table {t.number} · {t.capacity}p ({t.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBillsDrawer(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <FolderClock size={14} />
              Active &amp; Bills ({openOrders.length})
            </button>
            <Link
              href="/bills"
              className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <FileText size={14} />
              All Bills ({store.bills.length})
            </Link>
          </div>
        </div>

        {/* Status Toast Banner */}
        {statusMessage && (
          <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
            {statusMessage}
          </div>
        )}

        {/* Search & Veg Filter */}
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="button"
            onClick={() => setVegOnly(!vegOnly)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
              vegOnly
                ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            )}
          >
            <span className="h-2.5 w-2.5 rounded-sm bg-green-600" />
            Veg
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto bg-white p-4 dark:bg-zinc-950">
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-3">
            {filtered.map((item) => {
              const inCart = cart.find((c) => c.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  className={cn(
                    "relative rounded-xl border p-3 text-left transition-all hover:shadow-sm",
                    inCart
                      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-3 w-3 rounded-sm border ${
                          item.isVeg
                            ? "border-green-600 bg-green-600"
                            : "border-red-600 bg-red-600"
                        }`}
                      />
                      <span className="text-[10px] font-medium text-zinc-400">
                        GST {item.gstRate}%
                      </span>
                    </div>
                    {inCart && (
                      <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(item.price)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Create Order & Generate Bill Panel */}
      <div className="flex w-full flex-col bg-white md:w-[380px] lg:w-[430px] dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {activeOrderId ? `Order ${activeOrderId.toUpperCase()}` : "New Order & Bill"}
                {orderType === "dine-in" && selectedTable && (
                  <span className="ml-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Table {selectedTable}
                  </span>
                )}
              </h2>
              {existingUnpaidBill && (
                <p className="mt-0.5 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Unpaid Bill: {existingUnpaidBill.invoiceNumber}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setRightTab("cart")}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                    rightTab === "cart"
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  Order
                </button>
                <button
                  type="button"
                  onClick={() => setRightTab("preview")}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-colors",
                    rightTab === "preview"
                      ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  )}
                >
                  Bill Preview
                </button>
              </div>
              {(cart.length > 0 || activeOrderId) && (
                <button
                  type="button"
                  onClick={resetWorkspace}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  New
                </button>
              )}
            </div>
          </div>

          {/* Order Meta: Guests (Pax), Waiter, Notes / Delivery */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {orderType === "dine-in" && (
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50/60 px-2.5 py-1 dark:border-zinc-800 dark:bg-zinc-950/40">
                <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <Users size={12} />
                  Guests
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                    className="rounded bg-white px-1.5 text-xs font-bold text-zinc-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    -
                  </button>
                  <span className="min-w-4 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestCount((g) => Math.min(20, g + 1))}
                    className="rounded bg-white px-1.5 text-xs font-bold text-zinc-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <select
              aria-label="Assign Waiter"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              className={cn(
                "rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                orderType !== "dine-in" && "col-span-2"
              )}
            >
              <option value="">Assign Waiter / Server</option>
              {servers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {orderType === "delivery" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                value={deliveryPhone}
                onChange={(e) => setDeliveryPhone(e.target.value)}
                placeholder="Delivery phone"
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
                className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          )}

          <input
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
            placeholder="Order note (e.g., Serve starters first, birthday table)"
            className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />

          {attachedCustomer && (
            <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs dark:bg-zinc-800">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">
                Guest: {attachedCustomer.name} ({attachedCustomer.phone})
              </span>
              <button
                type="button"
                onClick={() => setCustomerId(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Cart / Bill Preview Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 p-4 text-center dark:border-zinc-800 dark:bg-zinc-950/50">
                <Receipt size={26} strokeWidth={1.5} className="mx-auto text-zinc-400" />
                <p className="mt-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Create a new order or open an active table below
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  Pick table &amp; waiter above, tap menu items, then click Create Order or Generate Bill.
                </p>
              </div>

              {openOrders.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Active Tables &amp; Open Orders ({openOrders.length})
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowBillsDrawer(true)}
                      className="text-[11px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      View all
                    </button>
                  </div>
                  {openOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                            {order.tableId
                              ? `Table ${order.tableId.replace("t", "")}`
                              : `${order.type.charAt(0).toUpperCase() + order.type.slice(1)} · ${order.id.toUpperCase()}`}
                          </span>
                          <span className="ml-2 text-[11px] text-zinc-500">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                            {order.waiterName ? ` · ${order.waiterName}` : ""}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => loadOrderIntoWorkspace(order)}
                          className="flex-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Edit Order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            loadOrderIntoWorkspace(order);
                            setBillModalState({ open: true, standaloneBill: null });
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-900 py-1.5 text-[11px] font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          <FileText size={12} />
                          Generate Bill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : rightTab === "preview" ? (
            <ThermalReceipt bill={draftPreviewBill} compact />
          ) : (
            <div>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-zinc-100 py-2.5 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatCurrency(item.price)}</span>
                        <span>· GST {item.gstRate}%</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingNoteId(editingNoteId === item.id ? null : item.id)
                          }
                          className="inline-flex items-center gap-0.5 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <MessageSquarePlus size={11} />
                          {item.notes ? "Edit note" : "Note"}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="rounded bg-zinc-100 p-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="rounded bg-zinc-100 p-1 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="w-16 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {(editingNoteId === item.id || item.notes) && (
                    <div className="mt-1.5">
                      {editingNoteId === item.id ? (
                        <input
                          value={item.notes ?? ""}
                          onChange={(e) => updateItemNote(item.id, e.target.value)}
                          onBlur={() => setEditingNoteId(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingNoteId(null);
                          }}
                          placeholder="Kitchen instruction (e.g., Less spicy)"
                          autoFocus
                          className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                        />
                      ) : (
                        <p className="text-[11px] italic text-zinc-500">Note: {item.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + Order Creation & Bill Generation Actions */}
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span>
                  Discount{totals.discountLabel ? ` (${totals.discountLabel})` : ""}
                </span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
            )}
            {totals.cgst > 0 && (
              <>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>CGST</span>
                  <span>{formatCurrency(totals.cgst)}</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>SGST</span>
                  <span>{formatCurrency(totals.sgst)}</span>
                </div>
              </>
            )}
            {orderType === "dine-in" && (
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <label className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={includeServiceCharge}
                    onChange={(e) => setIncludeServiceCharge(e.target.checked)}
                    className="rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span>Service Charge ({store.settings.serviceChargeRate}%)</span>
                </label>
                <span>{formatCurrency(totals.serviceCharge)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={roundOffEnabled}
                  onChange={(e) => setRoundOffEnabled(e.target.checked)}
                  className="rounded border-zinc-300 accent-zinc-900 dark:accent-zinc-100"
                />
                <span>Round Off</span>
              </label>
              <span>
                {totals.roundOff > 0 ? "+" : ""}
                {totals.roundOff.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
              <span>Grand Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          {/* Quick Modifiers */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setShowDiscount(true)}
              className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Percent size={12} />
              Discount
            </button>
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <UserPlus size={12} />
              Customer
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleHoldOrder}
              className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <PauseCircle size={12} />
              Hold
            </button>
          </div>

          {/* Order Creation Row */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => handleCreateOrUpdateOrder(false)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60"
            >
              <CheckCircle2 size={14} />
              {activeOrderId ? "Update Order" : "Create Order"}
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleSendKot}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/60"
            >
              <ChefHat size={14} />
              {activeOrderId ? "Send KOT" : "Create & KOT"}
            </button>
          </div>

          {/* Bill Generation & Payment Row */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setBillModalState({ open: true, standaloneBill: null })}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-45 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <FileText size={14} />
              Generate Bill
            </button>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setBillModalState({ open: true, standaloneBill: null })}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Receipt size={14} />
              Pay {formatCurrency(totals.total)}
            </button>
          </div>
        </div>
      </div>

      {/* Floor Plan Table Picker Modal */}
      {showTablePicker && (
        <TablePickerModal
          tables={store.tables}
          orders={store.orders}
          selectedTableNumber={selectedTable}
          onSelect={(table) => handleTableSelect(table.number)}
          onClose={() => setShowTablePicker(false)}
        />
      )}

      {/* Discount Modal */}
      {showDiscount && (
        <DiscountModal
          subtotal={totals.subtotal}
          initialType={discountType}
          initialValue={discountValue}
          initialReason={discountReason}
          onApply={(type, val, reason) => {
            setDiscountType(type);
            setDiscountValue(val);
            setDiscountReason(reason);
          }}
          onClear={() => {
            setDiscountType("flat");
            setDiscountValue(0);
            setDiscountReason("");
          }}
          onClose={() => setShowDiscount(false)}
        />
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <CustomerModal
          customers={store.customers}
          selectedCustomerId={customerId}
          onSelect={(c) => setCustomerId(c?.id ?? null)}
          onCreate={(data) => addQuickCustomer(data)}
          onClose={() => setShowCustomerModal(false)}
        />
      )}

      {/* KOT Ticket Modal */}
      {sentKot && <KotModal kot={sentKot} onClose={() => setSentKot(null)} />}

      {/* Active / Held / Recent Invoices Drawer */}
      {showBillsDrawer && (
        <BillsDrawer
          orders={store.orders}
          bills={store.bills}
          onLoadOrder={(order) => loadOrderIntoWorkspace(order)}
          onOpenBill={(bill) =>
            setBillModalState({ open: true, standaloneBill: bill })
          }
          onClose={() => setShowBillsDrawer(false)}
        />
      )}

      {/* Generate Bill & Payment Modal */}
      {activeBillForModal && (
        <BillModal
          bill={activeBillForModal}
          isPreviewOnly={!billModalState.standaloneBill}
          onSaveUnpaid={() => {
            const saved = generateBillRecord(resolveBillInput());
            setActiveOrderId(saved.orderId);
            return saved;
          }}
          onSettle={(mode, details) =>
            generateBillRecord(resolveBillInput(), {
              paymentMode: mode,
              paymentDetails: details,
            })
          }
          onClose={() => setBillModalState({ open: false, standaloneBill: null })}
          onNewOrder={() => {
            setBillModalState({ open: false, standaloneBill: null });
            resetWorkspace();
          }}
        />
      )}
    </div>
  );
}

function BillingRouteReader() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const orderParam = searchParams.get("order");
  const actionParam = searchParams.get("action");

  return (
    <BillingWorkspace
      key={`${tableParam ?? ""}:${orderParam ?? ""}:${actionParam ?? ""}`}
      initialTableNumber={tableParam ? Number(tableParam) : null}
      initialOrderId={orderParam}
      initialAction={actionParam === "bill" ? "bill" : null}
    />
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center bg-white text-sm text-zinc-500 dark:bg-zinc-950">
          Loading POS terminal...
        </div>
      }
    >
      <BillingRouteReader />
    </Suspense>
  );
}
