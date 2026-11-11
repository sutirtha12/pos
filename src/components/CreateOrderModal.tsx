"use client";

import { useMemo, useState } from "react";
import { BillRecord, CartItem, KOTItem, MenuItem, Order } from "@/types";
import { calculateBillTotals, orderToDraftBill } from "@/lib/billing";
import { createOrUpdateOrder, usePosStore } from "@/lib/pos-store";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Bike,
  CheckCircle2,
  ChefHat,
  FileText,
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface CreateOrderModalProps {
  onClose: () => void;
  onOrderCreated?: (result: {
    order: Order;
    kot?: KOTItem;
    billDraft?: BillRecord;
  }) => void;
}

export default function CreateOrderModal({
  onClose,
  onOrderCreated,
}: CreateOrderModalProps) {
  const store = usePosStore();
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [waiterName, setWaiterName] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");
  const [menuSearch, setMenuSearch] = useState("");
  const [draftItems, setDraftItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const availableMenu = useMemo(
    () =>
      store.menuItems.filter((m) => {
        const matchCat = menuCategory === "All" || m.category === menuCategory;
        const matchSearch = m.name.toLowerCase().includes(menuSearch.trim().toLowerCase());
        return m.available && matchCat && matchSearch;
      }),
    [store.menuItems, menuCategory, menuSearch]
  );

  const draftTotals = useMemo(
    () =>
      calculateBillTotals({
        items: draftItems,
        orderType,
        discountType: "flat",
        discountValue: 0,
        includeServiceCharge: true,
        serviceChargeRate: store.settings.serviceChargeRate,
        roundOffEnabled: store.settings.roundOffEnabled,
      }),
    [draftItems, orderType, store.settings.serviceChargeRate, store.settings.roundOffEnabled]
  );

  const addDraftItem = (item: MenuItem) => {
    setError(null);
    setDraftItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateDraftQty = (id: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleSubmit = (action: "order" | "kot" | "bill") => {
    if (draftItems.length === 0) {
      setError("Add at least one menu item to create the order.");
      return;
    }
    if (orderType === "dine-in" && !tableNumber) {
      setError("Please select a table for a Dine-in order.");
      return;
    }

    const { order, kot } = createOrUpdateOrder(
      {
        type: orderType,
        tableNumber: orderType === "dine-in" ? tableNumber : null,
        guestCount: orderType === "dine-in" ? guestCount : undefined,
        waiterName: waiterName || undefined,
        notes: notes.trim() || undefined,
        deliveryPhone: orderType === "delivery" ? deliveryPhone.trim() || undefined : undefined,
        deliveryAddress: orderType === "delivery" ? deliveryAddress.trim() || undefined : undefined,
        customerId: customerId || null,
        items: draftItems,
        subtotal: draftTotals.subtotal,
        discount: 0,
        cgst: draftTotals.cgst,
        sgst: draftTotals.sgst,
        serviceCharge: draftTotals.serviceCharge,
        total: draftTotals.total,
      },
      { sendKotToKitchen: action === "kot" }
    );

    const customer = customerId
      ? store.customers.find((c) => c.id === customerId) ?? null
      : null;

    const billDraft =
      action === "bill" ? orderToDraftBill(order, null, customer) : undefined;

    onClose();
    onOrderCreated?.({ order, kot, billDraft });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Create New Order
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Assign table, guests, waiter, and add items — then generate bill when ready
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create order modal"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
          {/* Left: Order Setup & Menu Picker */}
          <div className="space-y-4 border-b border-zinc-200 p-5 md:col-span-7 md:border-r md:border-b-0 dark:border-zinc-800">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                1. Order Type
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {([
                  ["dine-in", "Dine-in", UtensilsCrossed],
                  ["takeaway", "Takeaway", ShoppingBag],
                  ["delivery", "Delivery", Bike],
                ] as const).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOrderType(key)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold",
                      orderType === key
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    )}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {orderType === "dine-in" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  2. Select Available Table
                </label>
                <div className="mt-1.5 grid grid-cols-5 gap-2">
                  {store.tables.map((t) => {
                    const occupied = t.status === "occupied";
                    const selected = tableNumber === t.number;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        disabled={occupied}
                        onClick={() => {
                          setError(null);
                          setTableNumber(t.number);
                          setGuestCount((g) => Math.min(g, t.capacity));
                        }}
                        className={cn(
                          "rounded-xl border p-2 text-center transition-all",
                          occupied
                            ? "cursor-not-allowed border-zinc-200 bg-zinc-100 opacity-45 dark:border-zinc-800 dark:bg-zinc-800"
                            : selected
                              ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30 dark:border-emerald-500 dark:bg-emerald-950"
                              : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950"
                        )}
                      >
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                          T-{t.number}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {t.capacity}p · {t.status}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {orderType === "delivery" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Phone</label>
                  <input
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="Customer phone"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Address</label>
                  <input
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery address"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {orderType === "dine-in" && (
                <div>
                  <label className="text-xs font-medium text-zinc-500">Guests (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-zinc-500">Assign Waiter</label>
                <select
                  value={waiterName}
                  onChange={(e) => setWaiterName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">Select Waiter</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={cn(orderType !== "dine-in" && "col-span-2")}>
                <label className="text-xs font-medium text-zinc-500">Guest (Optional)</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">Walk-in Guest</option>
                  {store.customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500">Order Notes</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (e.g., Less spicy, serve starters first)"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                3. Add Menu Items
              </label>
              <input
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu items..."
                className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setMenuCategory(cat)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      menuCategory === cat
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="mt-2 grid max-h-44 grid-cols-2 gap-1.5 overflow-y-auto pr-1">
                {availableMenu.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addDraftItem(item)}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-left text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </span>
                    <span className="ml-2 shrink-0 font-bold text-zinc-700 dark:text-zinc-300">
                      {formatCurrency(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Draft Order Summary */}
          <div className="flex flex-col justify-between p-5 md:col-span-5">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                Order Summary
              </h3>
              {error && (
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {draftItems.length === 0 ? (
                  <p className="py-10 text-center text-xs text-zinc-400">
                    Select menu items on the left to build this order.
                  </p>
                ) : (
                  draftItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 text-xs dark:border-zinc-800"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {item.name}
                        </p>
                        <p className="text-zinc-500">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateDraftQty(item.id, -1)}
                          className="rounded bg-zinc-100 p-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-5 text-center font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateDraftQty(item.id, 1)}
                          className="rounded bg-zinc-100 p-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="ml-3 w-14 text-right font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(draftTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (CGST + SGST)</span>
                  <span>{formatCurrency(draftTotals.cgst + draftTotals.sgst)}</span>
                </div>
                {draftTotals.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charge</span>
                    <span>{formatCurrency(draftTotals.serviceCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold text-zinc-900 dark:border-zinc-700 dark:text-zinc-50">
                  <span>Total</span>
                  <span>{formatCurrency(draftTotals.total)}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit("order")}
                  className="flex items-center justify-center gap-1 rounded-xl border border-zinc-300 bg-white py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <CheckCircle2 size={14} />
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit("kot")}
                  className="flex items-center justify-center gap-1 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                >
                  <ChefHat size={14} />
                  Create &amp; KOT
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSubmit("bill")}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <FileText size={14} />
                Create Order &amp; Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

