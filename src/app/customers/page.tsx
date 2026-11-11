"use client";

import { useState } from "react";
import { addQuickCustomer, updateCustomerPoints, usePosStore } from "@/lib/pos-store";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Search, Plus, Star, Gift, Phone, Mail, Award, X } from "lucide-react";

export default function CustomersPage() {
  const { customers } = usePosStore();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "vip" | "new">("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [tag, setTag] = useState("new");

  const selected = selectedId ? customers.find((c) => c.id === selectedId) ?? null : null;

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "vip" && c.tags.includes("vip")) ||
      (filter === "new" && c.tags.includes("new"));
    return matchSearch && matchFilter;
  });

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);

  const handleAddCustomer = () => {
    if (!name.trim() || !phone.trim()) return;
    const created = addQuickCustomer({
      name,
      phone,
      email,
      tags: [tag],
    });
    setShowAddModal(false);
    setSelectedId(created.id);
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Customers</h1>
          <p className="text-sm text-zinc-500">
            {customers.length} customers &middot; Total revenue: {formatCurrency(totalSpent)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Total Customers</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">VIP Members</p>
          <p className="text-2xl font-bold text-amber-600">
            {customers.filter((c) => c.tags.includes("vip")).length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Avg Spend</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(customers.length ? totalSpent / customers.length : 0)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Active Points</p>
          <p className="text-2xl font-bold text-violet-600">{totalPoints.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        {(["all", "vip", "new"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize",
              filter === f
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-3 sm:px-4">Customer</th>
              <th className="px-3 py-3 sm:px-4">Phone</th>
              <th className="px-3 py-3 sm:px-4">Visits</th>
              <th className="px-3 py-3 sm:px-4">Total Spent</th>
              <th className="hidden px-3 py-3 sm:table-cell sm:px-4">Loyalty Points</th>
              <th className="hidden px-3 py-3 md:table-cell sm:px-4">Last Visit</th>
              <th className="px-3 py-3 sm:px-4">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className="cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</p>
                      {c.email && <p className="text-[10px] text-zinc-400">{c.email}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.phone}</td>
                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{c.visits}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(c.totalSpent)}
                </td>
                <td className="hidden px-3 py-3 sm:table-cell sm:px-4">
                  <div className="flex items-center gap-1">
                    <Award size={12} className="text-violet-500" />
                    <span className="font-medium text-violet-600">{c.loyaltyPoints}</span>
                  </div>
                </td>
                <td className="hidden px-3 py-3 text-zinc-500 md:table-cell sm:px-4">{formatDate(c.lastVisit)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                          t === "vip"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : t === "new"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        )}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer detail panel */}
      {selected && (
        <div className="fixed inset-y-0 right-0 z-50 w-full border-l border-zinc-200 bg-white p-5 shadow-xl sm:w-96 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selected.name}</h2>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <Phone size={14} />
              {selected.phone}
            </div>
            {selected.email && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Mail size={14} />
                {selected.email}
              </div>
            )}
            <hr className="border-zinc-200 dark:border-zinc-700" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xs text-zinc-500">Visits</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{selected.visits}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xs text-zinc-500">Total Spent</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(selected.totalSpent)}
                </p>
              </div>
              <div className="rounded-lg bg-violet-50 p-3 text-center dark:bg-violet-950">
                <p className="text-xs text-violet-500">Loyalty Points</p>
                <p className="text-xl font-bold text-violet-600">{selected.loyaltyPoints}</p>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800">
                <p className="text-xs text-zinc-500">Last Visit</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  {formatDate(selected.lastVisit)}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selected.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateCustomerPoints(selected.id, 100)}
                className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Star size={14} />
                +100 Points
              </button>
              <button
                type="button"
                disabled={selected.loyaltyPoints < 100}
                onClick={() => updateCustomerPoints(selected.id, -100)}
                className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-45 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Gift size={14} />
                Redeem 100
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-96 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Add New Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-500">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rohan Mehta"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876500000"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@email.com"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Segment Tag</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="new">New</option>
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddCustomer}
                className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
