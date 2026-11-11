"use client";
import Link from "next/link";
import { dailyStats, weeklySalesData, categoryBreakdown } from "@/data/seed";
import { usePosStore } from "@/lib/pos-store";
import { formatCurrency } from "@/lib/utils";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  CreditCard,
  Smartphone,
  Banknote,
  Clock,
  ArrowUpRight,
  ChefHat,
  Plus,
  FileText,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { orders, kotItems, bills } = usePosStore();
  const activeOrders = orders.filter((o) => o.status === "active");
  const pendingKots = kotItems.filter((k) => k.status === "pending" || k.status === "preparing");

  const extraPaidBills = bills.filter(
    (b) => b.paymentStatus === "paid" && b.id !== "bill-o5" && b.id !== "bill-o6"
  );
  const extraSales = extraPaidBills.reduce((s, b) => s + b.total, 0);
  const extraCash = extraPaidBills.reduce(
    (s, b) => s + (b.paymentDetails?.cash ?? (b.paymentMode === "cash" ? b.total : 0)),
    0
  );
  const extraUpi = extraPaidBills.reduce(
    (s, b) => s + (b.paymentDetails?.upi ?? (b.paymentMode === "upi" ? b.total : 0)),
    0
  );
  const extraCard = extraPaidBills.reduce(
    (s, b) => s + (b.paymentDetails?.card ?? (b.paymentMode === "card" ? b.total : 0)),
    0
  );
  const extraGst = extraPaidBills.reduce((s, b) => s + b.cgst + b.sgst, 0);
  const totalSales = dailyStats.totalSales + extraSales;
  const ordersToday = dailyStats.ordersToday + extraPaidBills.length;
  const gstCollected = dailyStats.gstCollected + extraGst;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Today, 11 Nov 2026 &middot; Live Overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Order</span>
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <FileText size={15} />
            <span className="hidden sm:inline">POS &amp; Generate Bill</span>
            <span className="sm:hidden">POS</span>
          </Link>
          <div className="hidden items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm sm:flex dark:border-zinc-800 dark:bg-zinc-900">
            <Clock size={14} className="text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300">Live</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatCurrency(totalSales)} sub="+12% vs yesterday" icon={IndianRupee} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" />
        <StatCard label="Orders Today" value={String(ordersToday)} sub={`${dailyStats.dineIn} dine-in, ${dailyStats.takeaway} takeaway`} icon={ShoppingBag} color="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" />
        <StatCard label="Avg Order Value" value={formatCurrency(Math.round(totalSales / ordersToday))} sub="+5% vs last week" icon={TrendingUp} color="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400" />
        <StatCard label="Customers" value={String(dailyStats.totalCustomers)} sub={`${dailyStats.newCustomers} new today`} icon={Users} color="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Cash" value={formatCurrency(dailyStats.cashPayments + extraCash)} icon={Banknote} color="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" />
        <StatCard label="UPI" value={formatCurrency(dailyStats.upiPayments + extraUpi)} icon={Smartphone} color="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400" />
        <StatCard label="Card" value={formatCurrency(dailyStats.cardPayments + extraCard)} icon={CreditCard} color="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Weekly Sales</h3>
          <div className="flex items-end gap-2 sm:gap-3" style={{ height: 180 }}>
            {weeklySalesData.map((d) => {
              const maxSales = Math.max(...weeklySalesData.map((w) => w.sales));
              const height = (d.sales / maxSales) * 160;
              return (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <span className="hidden text-[10px] font-medium text-zinc-500 sm:block">{formatCurrency(d.sales)}</span>
                  <div
                    className="w-full rounded-t-md bg-emerald-500 transition-all hover:bg-emerald-600"
                    style={{ height }}
                  />
                  <span className="text-[10px] font-medium text-zinc-600 sm:text-xs dark:text-zinc-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Sales by Category</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-700 dark:text-zinc-300">{cat.category}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{cat.percentage}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Active Orders ({activeOrders.length})</h3>
            <Link href="/orders" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {activeOrders.map((o) => (
              <Link
                key={o.id}
                href={`/billing?order=${o.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
              >
                <div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{o.id.toUpperCase()}</span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {o.type === "dine-in" ? `Table ${o.tableId?.replace("t", "")}` : o.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">{o.items.length} items</span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{formatCurrency(o.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <ChefHat size={14} className="mr-1 inline" />
              Kitchen Queue ({pendingKots.length})
            </h3>
          </div>
          <div className="space-y-2">
            {pendingKots.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/70">
                <div>
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${k.status === "pending" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                    {k.status}
                  </span>
                  <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {k.tableNumber ? `Table ${k.tableNumber}` : "Takeaway"}
                  </span>
                </div>
                <span className="max-w-40 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {k.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Today&apos;s GST Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Taxable Amount</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(totalSales - gstCollected)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">CGST</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(gstCollected / 2)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">SGST</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(gstCollected / 2)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Total GST</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(gstCollected)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
