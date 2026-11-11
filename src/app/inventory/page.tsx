"use client";

import { useState } from "react";
import { suppliers } from "@/data/seed";
import { addInventoryItem, restockInventoryItem, usePosStore } from "@/lib/pos-store";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Search, AlertTriangle, Package, TrendingDown, Plus, X } from "lucide-react";

export default function InventoryPage() {
  const { inventory } = usePosStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"stock" | "suppliers">("stock");

  const [showAddModal, setShowAddModal] = useState(false);
  const [mode, setMode] = useState<"restock" | "new">("restock");
  const [restockItemId, setRestockItemId] = useState(() => inventory[0]?.id ?? "");
  const [restockQty, setRestockQty] = useState("5");

  const [itemName, setItemName] = useState("");
  const [itemCat, setItemCat] = useState("Vegetables");
  const [itemUnit, setItemUnit] = useState("kg");
  const [itemStock, setItemStock] = useState("10");
  const [itemMin, setItemMin] = useState("5");
  const [itemCost, setItemCost] = useState("100");
  const [itemSupplier, setItemSupplier] = useState("Fresh Farms");

  const categories = ["All", ...Array.from(new Set(inventory.map((i) => i.category)))];

  const filtered = inventory.filter((i) => {
    const matchCat = category === "All" || i.category === category;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const lowStock = inventory.filter((i) => i.currentStock <= i.minStock);
  const totalValue = inventory.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  const handleSave = () => {
    if (mode === "restock") {
      const qty = Number(restockQty);
      if (!restockItemId || !qty || qty <= 0) return;
      restockInventoryItem(restockItemId, qty);
      setShowAddModal(false);
      return;
    }

    if (!itemName.trim()) return;
    addInventoryItem({
      name: itemName.trim(),
      category: itemCat.trim() || "General",
      unit: itemUnit.trim() || "kg",
      currentStock: Number(itemStock) || 0,
      minStock: Number(itemMin) || 0,
      costPerUnit: Number(itemCost) || 0,
      supplier: itemSupplier.trim() || "Fresh Farms",
    });
    setItemName("");
    setShowAddModal(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Inventory</h1>
          <p className="text-sm text-zinc-500">
            {inventory.length} items &middot; Stock value: {formatCurrency(totalValue)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRestockItemId(inventory[0]?.id ?? "");
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          Add Stock
        </button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-950">
          <AlertTriangle size={16} className="text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            {lowStock.length} items below minimum stock: {lowStock.map((i) => i.name).join(", ")}
          </span>
        </div>
      )}

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("stock")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            tab === "stock"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500"
          )}
        >
          <Package size={14} className="mr-1 inline" />
          Stock
        </button>
        <button
          type="button"
          onClick={() => setTab("suppliers")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium",
            tab === "suppliers"
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-500"
          )}
        >
          Suppliers
        </button>
      </div>

      {tab === "stock" && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..."
                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium",
                  category === cat
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
                  <th className="px-3 py-3 sm:px-4">Item</th>
                  <th className="px-3 py-3 sm:px-4">Category</th>
                  <th className="px-3 py-3 sm:px-4">Stock</th>
                  <th className="px-3 py-3 sm:px-4">Min</th>
                  <th className="px-3 py-3 sm:px-4">Cost/Unit</th>
                  <th className="px-3 py-3 sm:px-4">Value</th>
                  <th className="hidden px-3 py-3 md:table-cell sm:px-4">Supplier</th>
                  <th className="hidden px-3 py-3 md:table-cell sm:px-4">Last Restocked</th>
                  <th className="px-3 py-3 text-right sm:px-4">Quick</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isLow = item.currentStock <= item.minStock;
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b border-zinc-100 dark:border-zinc-800",
                        isLow && "bg-red-50/50 dark:bg-red-950/20"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isLow && <TrendingDown size={14} className="text-red-500" />}
                          <span className="font-medium text-zinc-900 dark:text-zinc-50">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-semibold",
                            isLow ? "text-red-600" : "text-zinc-900 dark:text-zinc-50"
                          )}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(item.costPerUnit)}/{item.unit}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(item.currentStock * item.costPerUnit)}
                      </td>
                      <td className="hidden px-3 py-3 text-zinc-600 md:table-cell sm:px-4 dark:text-zinc-400">{item.supplier}</td>
                      <td className="hidden px-3 py-3 text-zinc-500 md:table-cell sm:px-4">{formatDate(item.lastRestocked)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => restockInventoryItem(item.id, 5)}
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          +5 {item.unit}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "suppliers" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{s.name}</h3>
              <p className="mt-1 text-xs text-zinc-500">{s.phone}</p>
              {s.gstin && <p className="mt-0.5 font-mono text-xs text-zinc-400">GSTIN: {s.gstin}</p>}
              <div className="mt-2 flex flex-wrap gap-1">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                Add Inventory Stock
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setMode("restock")}
                className={cn(
                  "rounded-md py-1.5 text-xs font-semibold",
                  mode === "restock"
                    ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500"
                )}
              >
                Restock Existing
              </button>
              <button
                type="button"
                onClick={() => setMode("new")}
                className={cn(
                  "rounded-md py-1.5 text-xs font-semibold",
                  mode === "new"
                    ? "bg-white text-zinc-900 shadow-2xs dark:bg-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500"
                )}
              >
                Add New Item
              </button>
            </div>

            {mode === "restock" ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Inventory Item</label>
                  <select
                    value={restockItemId}
                    onChange={(e) => setRestockItemId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {inventory.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.currentStock} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Quantity to Add</label>
                  <input
                    type="number"
                    min={1}
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Item Name</label>
                  <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Mozzarella Cheese"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Category</label>
                    <input
                      value={itemCat}
                      onChange={(e) => setItemCat(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Unit</label>
                    <input
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      placeholder="kg / ltr / pcs"
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Stock</label>
                    <input
                      type="number"
                      value={itemStock}
                      onChange={(e) => setItemStock(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Min</label>
                    <input
                      type="number"
                      value={itemMin}
                      onChange={(e) => setItemMin(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">Cost/Unit</label>
                    <input
                      type="number"
                      value={itemCost}
                      onChange={(e) => setItemCost(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Supplier</label>
                  <input
                    value={itemSupplier}
                    onChange={(e) => setItemSupplier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="mt-4 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {mode === "restock" ? "Add Stock" : "Create Inventory Item"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
