"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillRecord, KOTItem, Order } from "@/types";
import { orderToDraftBill } from "@/lib/billing";
import {
  billRecordToInput,
  cancelOrder,
  generateBillRecord,
  sendKot,
  usePosStore,
} from "@/lib/pos-store";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import BillModal from "@/components/BillModal";
import CreateOrderModal from "@/components/CreateOrderModal";
import { KotModal } from "@/components/BillingModals";
import {
  ChefHat,
  Clock,
  FileText,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react";

const statusBadges: Record<Order["status"], string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  held: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function OrdersPage() {
  const store = usePosStore();
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [billModalOrder, setBillModalOrder] = useState<BillRecord | null>(null);
  const [sentKot, setSentKot] = useState<KOTItem | null>(null);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return store.orders.filter((o) => {
      const matchStatus = filter === "all" || o.status === filter;
      const tableStr = o.tableId ? `table ${o.tableId.replace("t", "")}` : o.type;
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        tableStr.toLowerCase().includes(q) ||
        (o.waiterName?.toLowerCase().includes(q) ?? false) ||
        o.items.some((i) => i.name.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [store.orders, filter, search]);

  const counts = useMemo(() => {
    const c = { all: store.orders.length, active: 0, held: 0, completed: 0, cancelled: 0 };
    store.orders.forEach((o) => {
      c[o.status]++;
    });
    return c;
  }, [store.orders]);

  const openGenerateBill = (order: Order) => {
    const existingUnpaid = store.bills.find(
      (b) => b.orderId === order.id && b.paymentStatus === "unpaid"
    );
    const customer = order.customerId
      ? store.customers.find((c) => c.id === order.customerId) ?? null
      : null;
    setBillModalOrder(existingUnpaid ?? orderToDraftBill(order, null, customer));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Order Management
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create table, takeaway, or delivery orders and generate bills
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/billing"
            className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Open POS Terminal
          </Link>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={16} />
            Create New Order
          </button>
        </div>
      </div>

      {/* Summary & Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, table, waiter, or item..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        {(["all", "active", "held", "completed", "cancelled"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize",
              filter === status
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {status} ({counts[status]})
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => {
          const table = order.tableId
            ? store.tables.find((t) => t.id === order.tableId)
            : undefined;
          const customer = order.customerId
            ? store.customers.find((c) => c.id === order.customerId)
            : undefined;
          const isOpen = order.status === "active" || order.status === "held";

          return (
            <div
              key={order.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-500">
                        {order.id.toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          statusBadges[order.status]
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                    <h3 className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-50">
                      {order.type === "dine-in"
                        ? `Table ${table?.number ?? order.tableId?.replace("t", "")}`
                        : order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    </h3>
                  </div>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(order.total)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(order.createdAt)}
                  </span>
                  {order.guestCount && (
                    <span className="inline-flex items-center gap-1">
                      <Users size={11} />
                      {order.guestCount} guests
                    </span>
                  )}
                  {order.waiterName && <span>· {order.waiterName}</span>}
                  {customer && <span>· {customer.name}</span>}
                </div>

                {order.notes && (
                  <p className="mt-2 rounded bg-zinc-50 px-2 py-1 text-[11px] italic text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Note: {order.notes}
                  </p>
                )}

                <div className="mt-3 space-y-1 border-t border-zinc-100 pt-2.5 text-xs dark:border-zinc-800">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-zinc-700 dark:text-zinc-300">
                      <span>
                        {item.name} ×{item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                {isOpen ? (
                  <>
                    <Link
                      href={`/billing?order=${order.id}`}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      Edit Items
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        const res = sendKot({
                          orderId: order.id,
                          type: order.type,
                          tableNumber: table?.number ?? null,
                          guestCount: order.guestCount,
                          waiterName: order.waiterName,
                          customerId: order.customerId ?? null,
                          items: order.items,
                          subtotal: order.subtotal,
                          discount: order.discount,
                          cgst: order.cgst,
                          sgst: order.sgst,
                          serviceCharge: order.serviceCharge,
                          total: order.total,
                        });
                        setSentKot(res.kot);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    >
                      <ChefHat size={13} />
                      KOT
                    </button>
                    <button
                      type="button"
                      onClick={() => openGenerateBill(order)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      <FileText size={13} />
                      Generate Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelOrder(order.id)}
                      title="Cancel Order"
                      className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const bill = store.bills.find((b) => b.orderId === order.id);
                      if (bill) setBillModalOrder(bill);
                    }}
                    disabled={!store.bills.some((b) => b.orderId === order.id)}
                    className="w-full rounded-lg border border-zinc-200 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {order.status === "completed" ? "View Generated Bill" : "Order Cancelled"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onOrderCreated={({ kot, billDraft }) => {
            if (kot) setSentKot(kot);
            if (billDraft) setBillModalOrder(billDraft);
          }}
        />
      )}

      {sentKot && <KotModal kot={sentKot} onClose={() => setSentKot(null)} />}

      {billModalOrder && (
        <BillModal
          bill={billModalOrder}
          isPreviewOnly={billModalOrder.invoiceNumber === "PREVIEW"}
          onSaveUnpaid={() => generateBillRecord(billRecordToInput(billModalOrder))}
          onSettle={(mode, details) =>
            generateBillRecord(billRecordToInput(billModalOrder), {
              paymentMode: mode,
              paymentDetails: details,
            })
          }
          onClose={() => setBillModalOrder(null)}
          onNewOrder={() => setBillModalOrder(null)}
        />
      )}
    </div>
  );
}
