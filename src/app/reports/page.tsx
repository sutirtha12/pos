"use client";
import { useState } from "react";
import { dailyStats, weeklySalesData, categoryBreakdown } from "@/data/seed";
import { billRecordToInput, generateBillRecord, usePosStore } from "@/lib/pos-store";
import { BillRecord } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import BillModal from "@/components/BillModal";
import { BarChart3, Download, TrendingUp, Receipt, FileText } from "lucide-react";

const hourlyData = [
  { hour: "10 AM", sales: 1200, orders: 3 },
  { hour: "11 AM", sales: 3400, orders: 5 },
  { hour: "12 PM", sales: 5800, orders: 8 },
  { hour: "1 PM", sales: 7200, orders: 10 },
  { hour: "2 PM", sales: 4100, orders: 6 },
  { hour: "3 PM", sales: 2200, orders: 3 },
  { hour: "4 PM", sales: 1800, orders: 2 },
  { hour: "5 PM", sales: 800, orders: 1 },
  { hour: "6 PM", sales: 3200, orders: 5 },
  { hour: "7 PM", sales: 5600, orders: 7 },
  { hour: "8 PM", sales: 6800, orders: 9 },
  { hour: "9 PM", sales: 4200, orders: 6 },
];

const topItems = [
  { name: "Butter Chicken", qty: 12, revenue: 4560 },
  { name: "Chicken Biryani", qty: 10, revenue: 3500 },
  { name: "Paneer Tikka", qty: 9, revenue: 2520 },
  { name: "Dal Makhani", qty: 8, revenue: 2240 },
  { name: "Butter Naan", qty: 35, revenue: 2100 },
  { name: "Cappuccino", qty: 11, revenue: 1980 },
  { name: "Garlic Naan", qty: 20, revenue: 1600 },
  { name: "Cold Coffee", qty: 8, revenue: 1200 },
];

export default function ReportsPage() {
  const { bills, settings } = usePosStore();
  const [tab, setTab] = useState<"sales" | "gst" | "items">("sales");
  const [period, setPeriod] = useState("today");
  const [selectedBill, setSelectedBill] = useState<BillRecord | null>(null);

  const exportCsv = () => {
    const rows = [
      ["Invoice", "Type", "Subtotal", "CGST", "SGST", "ServiceCharge", "Total", "Status", "PaymentMode"],
      ...bills.map((b) => [
        b.invoiceNumber,
        b.type,
        String(b.subtotal),
        String(b.cgst),
        String(b.sgst),
        String(b.serviceCharge),
        String(b.total),
        b.paymentStatus,
        b.paymentMode ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restrodesk-${tab}-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
            <BarChart3 size={22} className="mr-1.5 inline sm:mr-2" />Reports &amp; Analytics
          </h1>
          <p className="text-sm text-zinc-500">Business insights and tax reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Download size={14} />Export
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {([["sales", "Sales Analytics", TrendingUp], ["items", "Top Items", Receipt], ["gst", "GST Report", FileText]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as typeof tab)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium", tab === key ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {tab === "sales" && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Gross Sales</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(dailyStats.totalSales)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Net Sales (excl GST)</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(dailyStats.totalSales - dailyStats.gstCollected)}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Orders</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{dailyStats.ordersToday}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs text-zinc-500">Avg Order Value</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatCurrency(dailyStats.avgOrderValue)}</p>
            </div>
          </div>

          {/* Hourly Sales */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Hourly Sales Distribution</h3>
            <div className="flex items-end gap-2" style={{ height: 200 }}>
              {hourlyData.map((d) => {
                const max = Math.max(...hourlyData.map((h) => h.sales));
                const height = (d.sales / max) * 170;
                return (
                  <div key={d.hour} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] text-zinc-500">{formatCurrency(d.sales)}</span>
                    <div className="w-full rounded-t bg-blue-500 hover:bg-blue-600" style={{ height }} />
                    <span className="text-[9px] text-zinc-500 -rotate-45">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payment Methods</h3>
              <div className="space-y-3">
                {[
                  { label: "Cash", amount: dailyStats.cashPayments, color: "bg-green-500" },
                  { label: "UPI", amount: dailyStats.upiPayments, color: "bg-purple-500" },
                  { label: "Card", amount: dailyStats.cardPayments, color: "bg-orange-500" },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">{p.label}</span>
                      <span className="font-medium">{formatCurrency(p.amount)} ({Math.round(p.amount / dailyStats.totalSales * 100)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.amount / dailyStats.totalSales) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Category Breakdown</h3>
              <div className="space-y-3">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">{cat.category}</span>
                      <span className="font-medium">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${cat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Weekly Trend</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500">
                    <th className="pb-2">Day</th>
                    <th className="pb-2">Sales</th>
                    <th className="pb-2">Orders</th>
                    <th className="pb-2">Avg/Order</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklySalesData.map((d) => (
                    <tr key={d.day} className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="py-2 font-medium">{d.day}</td>
                      <td className="py-2">{formatCurrency(d.sales)}</td>
                      <td className="py-2">{d.orders}</td>
                      <td className="py-2">{formatCurrency(Math.round(d.sales / d.orders))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "items" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top Selling Items</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
                <th className="pb-2">#</th>
                <th className="pb-2">Item</th>
                <th className="pb-2">Qty Sold</th>
                <th className="pb-2">Revenue</th>
                <th className="pb-2">% of Sales</th>
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, i) => (
                <tr key={item.name} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 text-zinc-400">{i + 1}</td>
                  <td className="py-2 font-medium text-zinc-900 dark:text-zinc-50">{item.name}</td>
                  <td className="py-2">{item.qty}</td>
                  <td className="py-2 font-semibold">{formatCurrency(item.revenue)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.revenue / dailyStats.totalSales) * 100}%` }} />
                      </div>
                      <span className="text-xs text-zinc-500">{((item.revenue / dailyStats.totalSales) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "gst" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">GST Summary — GSTR-3B Format</h3>
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Download size={12} />Export for Tally
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold text-zinc-500 uppercase">Outward Supplies</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500">
                      <th className="pb-2">Rate</th>
                      <th className="pb-2">Taxable</th>
                      <th className="pb-2">CGST</th>
                      <th className="pb-2">SGST</th>
                      <th className="pb-2">Total Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">5%</td>
                      <td className="py-2">{formatCurrency(22000)}</td>
                      <td className="py-2">{formatCurrency(550)}</td>
                      <td className="py-2">{formatCurrency(550)}</td>
                      <td className="py-2 font-semibold">{formatCurrency(1100)}</td>
                    </tr>
                    <tr className="border-t border-zinc-100 dark:border-zinc-800">
                      <td className="py-2">18%</td>
                      <td className="py-2">{formatCurrency(1800)}</td>
                      <td className="py-2">{formatCurrency(162)}</td>
                      <td className="py-2">{formatCurrency(162)}</td>
                      <td className="py-2 font-semibold">{formatCurrency(324)}</td>
                    </tr>
                    <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 font-bold">
                      <td className="py-2">Total</td>
                      <td className="py-2">{formatCurrency(23800)}</td>
                      <td className="py-2">{formatCurrency(712)}</td>
                      <td className="py-2">{formatCurrency(712)}</td>
                      <td className="py-2 text-emerald-600">{formatCurrency(1424)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold text-zinc-500 uppercase">Business Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">GSTIN</span>
                    <span className="font-mono text-zinc-900 dark:text-zinc-50">{settings.gstin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Trade Name</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{settings.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">State</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{settings.state} ({settings.stateCode})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Filing Period</span>
                    <span className="text-zinc-900 dark:text-zinc-50">November 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">HSN Summary</span>
                    <span className="text-zinc-900 dark:text-zinc-50">{settings.sac} (Restaurant Services)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent Invoices</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-2">Invoice #</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Subtotal</th>
                  <th className="pb-2">Tax</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBill(b)}
                    className="cursor-pointer border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="py-2 font-mono text-xs">{b.invoiceNumber}</td>
                    <td className="py-2 capitalize">{b.type}</td>
                    <td className="py-2">{formatCurrency(b.subtotal)}</td>
                    <td className="py-2">{formatCurrency(b.cgst + b.sgst)}</td>
                    <td className="py-2 font-semibold">{formatCurrency(b.total)}</td>
                    <td className="py-2">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs uppercase dark:bg-zinc-800">{b.paymentMode || b.paymentStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBill && (
        <BillModal
          bill={selectedBill}
          onSaveUnpaid={() => generateBillRecord(billRecordToInput(selectedBill))}
          onSettle={(mode, details) =>
            generateBillRecord(billRecordToInput(selectedBill), {
              paymentMode: mode,
              paymentDetails: details,
            })
          }
          onClose={() => setSelectedBill(null)}
          onNewOrder={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
