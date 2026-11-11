"use client";

import { useState } from "react";
import {
  Check,
  ChefHat,
  Clock,
  FileText,
  PauseCircle,
  Printer,
  Receipt,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { BillRecord, Customer, DiscountType, KOTItem, Order, Table } from "@/types";
import { cn, formatCurrency, formatTime } from "@/lib/utils";

/* ---------------- Discount Modal ---------------- */
interface DiscountModalProps {
  subtotal: number;
  initialType: DiscountType;
  initialValue: number;
  initialReason: string;
  onApply: (type: DiscountType, value: number, reason: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function DiscountModal({
  subtotal,
  initialType,
  initialValue,
  initialReason,
  onApply,
  onClear,
  onClose,
}: DiscountModalProps) {
  const [type, setType] = useState<DiscountType>(initialType);
  const [value, setValue] = useState<string>(initialValue > 0 ? String(initialValue) : "");
  const [reason, setReason] = useState<string>(initialReason);

  const numericVal = Math.max(0, Number(value) || 0);
  const previewDiscount =
    type === "percent"
      ? Math.round((subtotal * Math.min(100, numericVal)) / 100)
      : Math.min(subtotal, numericVal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-96 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Apply Discount</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {(["percent", "flat"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-md py-1.5 text-xs font-semibold transition-colors",
                type === t
                  ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              )}
            >
              {t === "percent" ? "Percentage (%)" : "Flat Amount (₹)"}
            </button>
          ))}
        </div>

        {type === "percent" && (
          <div className="mb-3 grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  onApply("percent", pct, reason);
                  onClose();
                }}
                className="rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {type === "percent" ? "Discount Percentage (%)" : "Discount Amount (₹)"}
            </label>
            <input
              type="number"
              min={0}
              max={type === "percent" ? 100 : subtotal}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "e.g. 10" : "e.g. 100"}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Reason (optional)
            </label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["VIP Guest", "Promo", "Staff", "Complimentary"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setReason(reason === tag ? "" : tag)}
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    reason === tag
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">Discount Preview</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(previewDiscount)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => {
              onClear();
              onClose();
            }}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => {
              onApply(type, numericVal, reason);
              onClose();
            }}
            className="flex-1 rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Customer Modal ---------------- */
interface CustomerModalProps {
  customers: Customer[];
  selectedCustomerId: string | null;
  onSelect: (customer: Customer | null) => void;
  onCreate: (data: { name: string; phone: string; email?: string }) => Customer;
  onClose: () => void;
}

export function CustomerModal({
  customers,
  selectedCustomerId,
  onSelect,
  onCreate,
  onClose,
}: CustomerModalProps) {
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query)
  );

  const handleCreate = () => {
    if (!name.trim() || !phone.trim()) return;
    const created = onCreate({ name, phone });
    onSelect(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Attach Guest to Bill
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or phone..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <UserPlus size={14} />
              New
            </button>
          </div>

          {showNew && (
            <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/60">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Add Walk-in Customer
              </p>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                disabled={!name.trim() || !phone.trim()}
                onClick={handleCreate}
                className="w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Save &amp; Attach
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
          {selectedCustomerId && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="mb-2 w-full rounded-lg border border-dashed border-zinc-300 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Clear Attached Customer
            </button>
          )}
          {filtered.map((c) => {
            const isSelected = c.id === selectedCustomerId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors",
                  isSelected
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/60"
                    : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                )}
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {c.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {c.phone} · {c.loyaltyPoints} pts
                  </p>
                </div>
                {isSelected && <Check size={16} className="text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------- KOT Ticket Modal ---------------- */
interface KotModalProps {
  kot: KOTItem;
  onClose: () => void;
}

export function KotModal({ kot, onClose }: KotModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-80 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              KOT Sent to Kitchen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X size={16} />
          </button>
        </div>

        <div
          id="printable-kot"
          className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 font-mono text-xs text-zinc-900"
        >
          <div className="border-b border-dashed border-zinc-300 pb-2 text-center">
            <p className="text-sm font-bold">KITCHEN ORDER TICKET</p>
            <p className="text-[11px] text-zinc-500">
              KOT #{kot.id.toUpperCase()} · {formatTime(kot.createdAt)}
            </p>
          </div>
          <div className="flex justify-between border-b border-dashed border-zinc-300 py-2 text-[11px] font-bold">
            <span className="uppercase">{kot.type}</span>
            <span>{kot.tableNumber ? `TABLE ${kot.tableNumber}` : "COUNTER"}</span>
          </div>
          <div className="space-y-1.5 pt-2">
            {kot.items.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-medium">
                  <span>{item.name}</span>
                  <span className="font-bold">x{item.quantity}</span>
                </div>
                {item.notes && (
                  <p className="text-[10px] italic text-zinc-500">* {item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Printer size={14} />
            Print KOT
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-zinc-900 py-2 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Active / Held / Recent Bills Drawer ---------------- */
interface BillsDrawerProps {
  orders: Order[];
  bills: BillRecord[];
  onLoadOrder: (order: Order) => void;
  onOpenBill: (bill: BillRecord) => void;
  onClose: () => void;
}

export function BillsDrawer({
  orders,
  bills,
  onLoadOrder,
  onOpenBill,
  onClose,
}: BillsDrawerProps) {
  const [tab, setTab] = useState<"open" | "invoices">("open");

  const activeOrders = orders.filter((o) => o.status === "active");
  const heldOrders = orders.filter((o) => o.status === "held");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Active Orders &amp; Bills
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Resume open tables, held carts, or view generated bills
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1 border-b border-zinc-200 p-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setTab("open")}
            className={cn(
              "rounded-lg py-1.5 text-xs font-semibold",
              tab === "open"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Open &amp; Held ({activeOrders.length + heldOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("invoices")}
            className={cn(
              "rounded-lg py-1.5 text-xs font-semibold",
              tab === "invoices"
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
          >
            Generated Bills ({bills.length})
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {tab === "open" && (
            <>
              {heldOrders.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Held Bills ({heldOrders.length})
                  </p>
                  {heldOrders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <PauseCircle size={14} className="text-amber-600" />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {o.tableId ? `Table ${o.tableId.replace("t", "")}` : o.type}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(o.total)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                        {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadOrder(o);
                          onClose();
                        }}
                        className="mt-2 w-full rounded-lg bg-zinc-900 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                      >
                        Resume in Billing
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  Active Orders ({activeOrders.length})
                </p>
                {activeOrders.map((o) => (
                  <div
                    key={o.id}
                    className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {o.tableId
                            ? `Table ${o.tableId.replace("t", "")}`
                            : `${o.type.charAt(0).toUpperCase() + o.type.slice(1)} · ${o.id.toUpperCase()}`}
                        </span>
                        <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-zinc-400">
                          <Clock size={11} />
                          {formatTime(o.createdAt)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(o.total)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadOrder(o);
                        onClose();
                      }}
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      Load Order &amp; Generate Bill
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "invoices" && (
            <div className="space-y-2">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-zinc-400" />
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-50">
                        {bill.invoiceNumber}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          bill.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        )}
                      >
                        {bill.paymentStatus}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(bill.total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {bill.tableNumber ? `Table ${bill.tableNumber} · ` : `${bill.type} · `}
                    {bill.items.length} items
                    {bill.paymentMode ? ` · ${bill.paymentMode.toUpperCase()}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBill(bill);
                      onClose();
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-zinc-200 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Receipt size={13} />
                    {bill.paymentStatus === "paid" ? "View / Reprint Bill" : "Settle / Print Bill"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Visual Floor Table Picker Modal ---------------- */
interface TablePickerModalProps {
  tables: Table[];
  orders: Order[];
  selectedTableNumber: number | null;
  onSelect: (table: Table) => void;
  onClose: () => void;
}

export function TablePickerModal({
  tables,
  orders,
  selectedTableNumber,
  onSelect,
  onClose,
}: TablePickerModalProps) {
  const sections = Array.from(new Set(tables.map((t) => t.section)));

  const statusClasses: Record<Table["status"], string> = {
    available:
      "border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/50",
    occupied:
      "border-blue-300 bg-blue-50/90 hover:border-blue-500 dark:border-blue-800 dark:bg-blue-950/60",
    reserved:
      "border-amber-200 bg-amber-50/80 hover:border-amber-400 dark:border-amber-900 dark:bg-amber-950/50",
    dirty:
      "border-zinc-300 bg-zinc-100 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
              Select Table from Floor Plan
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose an available table to create a new order, or an occupied table to edit / bill
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {sections.map((section) => (
            <div key={section}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {section}
              </h4>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {tables
                  .filter((t) => t.section === section)
                  .map((table) => {
                    const activeOrder = table.currentOrderId
                      ? orders.find((o) => o.id === table.currentOrderId)
                      : undefined;
                    const isSelected = selectedTableNumber === table.number;
                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => {
                          onSelect(table);
                          onClose();
                        }}
                        className={cn(
                          "flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all",
                          statusClasses[table.status],
                          isSelected && "ring-2 ring-zinc-900 dark:ring-zinc-100"
                        )}
                      >
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                          T-{table.number}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <Users size={11} />
                          {table.capacity} seats
                        </span>
                        <span className="mt-1.5 text-[10px] font-bold uppercase text-zinc-700 dark:text-zinc-200">
                          {activeOrder ? formatCurrency(activeOrder.total) : table.status}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


