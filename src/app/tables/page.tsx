"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addTable, updateTableStatus, usePosStore } from "@/lib/pos-store";
import { Table } from "@/types";
import { cn, formatCurrency, formatTime } from "@/lib/utils";
import { Users, Clock, ArrowRight, X, Receipt, Plus } from "lucide-react";

const statusColors: Record<Table["status"], string> = {
  available: "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950",
  occupied: "border-blue-300 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950",
  reserved: "border-amber-300 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950",
  dirty: "border-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800",
};

export default function TablesPage() {
  const router = useRouter();
  const { tables, orders } = usePosStore();
  const [section, setSection] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNumber, setNewNumber] = useState(() => String(tables.length + 1));
  const [newCapacity, setNewCapacity] = useState("4");
  const [newSection, setNewSection] = useState("Indoor");

  const sections = ["All", ...Array.from(new Set(tables.map((t) => t.section)))];
  const filtered = section === "All" ? tables : tables.filter((t) => t.section === section);
  const counts = { available: 0, occupied: 0, reserved: 0, dirty: 0 };
  tables.forEach((t) => counts[t.status]++);

  const selected = selectedId ? tables.find((t) => t.id === selectedId) ?? null : null;
  const selectedOrder = selected?.currentOrderId
    ? orders.find((o) => o.id === selected.currentOrderId)
    : null;

  const handleAddTable = () => {
    const num = Number(newNumber);
    const cap = Number(newCapacity);
    if (!num || num < 1 || !cap || cap < 1) return;
    if (tables.some((t) => t.number === num)) return;
    addTable({ number: num, capacity: cap, section: newSection.trim() || "Indoor" });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Table Management</h1>
          <p className="text-sm text-zinc-500">Floor plan &middot; {tables.length} tables</p>
        </div>
        <button
          type="button"
          onClick={() => {
            const maxNum = tables.reduce((m, t) => Math.max(m, t.number), 0);
            setNewNumber(String(maxNum + 1));
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          Add Table
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
        {(["available", "occupied", "reserved", "dirty"] as const).map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <div className={`h-3 w-3 rounded-sm border ${statusColors[s]}`} />
            <span className="capitalize text-zinc-600 dark:text-zinc-400">{s} ({counts[s]})</span>
          </div>
        ))}
      </div>

      {/* Section filter */}
      <div className="mb-4 flex gap-2">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              section === s ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5">
        {filtered.map((table) => (
          <button
            key={table.id}
            onClick={() => setSelectedId(table.id)}
            className={cn("flex flex-col items-center rounded-xl border-2 p-4 transition-all", statusColors[table.status])}
          >
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{table.number}</span>
            <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <Users size={12} />
              <span>{table.capacity} seats</span>
            </div>
            <span className={cn(
              "mt-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
              table.status === "available" && "bg-emerald-200 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200",
              table.status === "occupied" && "bg-blue-200 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200",
              table.status === "reserved" && "bg-amber-200 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200",
              table.status === "dirty" && "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
            )}>
              {table.status}
            </span>
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-full border-l border-zinc-200 bg-white p-5 shadow-xl sm:w-96 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Table {selected.number}</h2>
            <button onClick={() => setSelectedId(null)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Section</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{selected.section}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Capacity</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{selected.capacity} seats</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Status</span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold uppercase text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">{selected.status}</span>
            </div>
            {selectedOrder && (
              <>
                <hr className="border-zinc-200 dark:border-zinc-700" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Current Order</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Order ID</span>
                  <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{selectedOrder.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Items</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{selectedOrder.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Started</span>
                  <span className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100"><Clock size={12} />{formatTime(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="space-y-1">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between rounded bg-zinc-50 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {selected.status === "available" && (
                <button
                  onClick={() => router.push(`/billing?table=${selected.number}`)}
                  className="col-span-2 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <ArrowRight size={14} className="mr-1 inline" />New Order
                </button>
              )}
              {selected.status === "occupied" && (
                <>
                  <button
                    onClick={() => router.push(`/billing?table=${selected.number}`)}
                    className="rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    View Order
                  </button>
                  <button
                    onClick={() => router.push(`/billing?table=${selected.number}&action=bill`)}
                    className="flex items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <Receipt size={14} />Generate Bill
                  </button>
                </>
              )}
              {selected.status === "dirty" && (
                <button
                  onClick={() => updateTableStatus(selected.id, "available")}
                  className="col-span-2 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Mark Clean
                </button>
              )}
              {selected.status === "reserved" && (
                <button
                  onClick={() => {
                    updateTableStatus(selected.id, "occupied");
                    router.push(`/billing?table=${selected.number}`);
                  }}
                  className="col-span-2 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Seat Guests &amp; Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-96 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Add New Table</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-500">Table Number</label>
                <input
                  type="number"
                  min={1}
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Seating Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Section</label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Terrace">Terrace</option>
                  <option value="Private Dining">Private Dining</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddTable}
                className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
