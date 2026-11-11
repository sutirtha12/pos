"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillRecord, Order } from "@/types";
import { formatBillText, orderToDraftBill } from "@/lib/billing";
import {
  billRecordToInput,
  generateBillRecord,
  usePosStore,
} from "@/lib/pos-store";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import BillModal from "@/components/BillModal";
import ThermalReceipt from "@/components/ThermalReceipt";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
} from "lucide-react";

export default function BillsPage() {
  const store = usePosStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "paid">("all");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(
    () => store.bills[0]?.id ?? null
  );
  const [modalBill, setModalBill] = useState<BillRecord | null>(null);

  const openOrders = store.orders.filter(
    (o) => o.status === "active" || o.status === "held"
  );

  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.bills.filter((b) => {
      const matchStatus = statusFilter === "all" || b.paymentStatus === statusFilter;
      const matchQuery =
        !q ||
        b.invoiceNumber.toLowerCase().includes(q) ||
        (b.customerName?.toLowerCase().includes(q) ?? false) ||
        (b.tableNumber ? `table ${b.tableNumber}`.includes(q) : false) ||
        b.type.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [store.bills, search, statusFilter]);

  const activePreviewBill =
    store.bills.find((b) => b.id === selectedBillId) ?? filteredBills[0] ?? null;

  const openGenerateForOrder = (order: Order) => {
    const existingUnpaid = store.bills.find(
      (b) => b.orderId === order.id && b.paymentStatus === "unpaid"
    );
    const customer = order.customerId
      ? store.customers.find((c) => c.id === order.customerId) ?? null
      : null;
    setModalBill(existingUnpaid ?? orderToDraftBill(order, null, customer));
  };

  const handleDownload = (bill: BillRecord) => {
    const blob = new Blob([formatBillText(bill, store.settings)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bill.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const unpaidCount = store.bills.filter((b) => b.paymentStatus === "unpaid").length;
  const paidTotal = store.bills
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Bill Generation &amp; Invoices
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate bills from open tables, print GST receipts, and settle payments
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          New Bill in POS
        </Link>
      </div>

      {/* Summary Strip */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Open Orders Ready to Bill
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {openOrders.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Unpaid Proforma Bills
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {unpaidCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Settled Bills Total
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(paidTotal)}
          </p>
        </div>
      </div>

      {/* Open Tables & Orders Ready to Bill */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Open Tables &amp; Active Orders — Generate Bill
        </h2>
        {openOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No active or held orders right now. Start a new order in{" "}
            <Link href="/billing" className="font-semibold text-zinc-900 underline dark:text-zinc-100">
              Billing / POS
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {openOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {order.tableId
                        ? `Table ${order.tableId.replace("t", "")}`
                        : `${order.type.charAt(0).toUpperCase() + order.type.slice(1)} · ${order.id.toUpperCase()}`}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        order.status === "held"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <Clock size={11} />
                    {formatTime(order.createdAt)} · {order.items.length} items
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                  </p>
                </div>

                <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    <span>Est. Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/billing?order=${order.id}`}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => openGenerateForOrder(order)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-900 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <FileText size={13} />
                      Generate Bill
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices List + Live Thermal Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice #, table, or guest..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {(["all", "unpaid", "paid"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium capitalize",
                  statusFilter === status
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const isSelected = activePreviewBill?.id === bill.id;
                  return (
                    <tr
                      key={bill.id}
                      onClick={() => setSelectedBillId(bill.id)}
                      className={cn(
                        "cursor-pointer border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50",
                        isSelected && "bg-zinc-50 dark:bg-zinc-800/60"
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                        {bill.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 dark:text-zinc-300">
                        {bill.tableNumber ? `Table ${bill.tableNumber}` : bill.type}
                        {bill.customerName ? ` · ${bill.customerName}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            bill.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          )}
                        >
                          {bill.paymentStatus === "paid" && <CheckCircle2 size={10} />}
                          {bill.paymentStatus === "paid"
                            ? bill.paymentMode ?? "paid"
                            : "unpaid"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                        {formatCurrency(bill.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalBill(bill);
                          }}
                          className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          {bill.paymentStatus === "paid" ? "View / Print" : "Settle"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Bill Thermal Preview */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          {activePreviewBill ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-zinc-500" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {activePreviewBill.invoiceNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(activePreviewBill)}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    <Download size={13} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <Printer size={13} />
                    Print Bill
                  </button>
                </div>
              </div>
              <ThermalReceipt
                bill={activePreviewBill}
                printableId={modalBill ? undefined : "printable-bill"}
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-zinc-400">
              <Receipt size={32} strokeWidth={1} />
              <p className="mt-2 text-sm">Select an invoice to preview receipt</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for generating / settling / printing */}
      {modalBill && (
        <BillModal
          bill={modalBill}
          isPreviewOnly={modalBill.invoiceNumber === "PREVIEW"}
          onSaveUnpaid={() => {
            const saved = generateBillRecord(billRecordToInput(modalBill));
            setSelectedBillId(saved.id);
            return saved;
          }}
          onSettle={(mode, details) => {
            const finalized = generateBillRecord(billRecordToInput(modalBill), {
              paymentMode: mode,
              paymentDetails: details,
            });
            setSelectedBillId(finalized.id);
            return finalized;
          }}
          onClose={() => setModalBill(null)}
          onNewOrder={() => setModalBill(null)}
        />
      )}
    </div>
  );
}

