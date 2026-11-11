"use client";

import { useState } from "react";
import { MenuItem } from "@/types";
import {
  addMenuItem,
  toggleMenuItemAvailability,
  updateMenuItem,
  usePosStore,
} from "@/lib/pos-store";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, X } from "lucide-react";

export default function MenuPage() {
  const { menuItems: items } = usePosStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showVegOnly, setShowVegOnly] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState("");
  const [itemCategory, setItemCategory] = useState("Starters");
  const [price, setPrice] = useState("");
  const [gstRate, setGstRate] = useState("5");
  const [hsnCode, setHsnCode] = useState("9963");
  const [isVeg, setIsVeg] = useState(true);

  const categories = ["All", ...Array.from(new Set(items.map((m) => m.category)))];

  const filtered = items.filter((m) => {
    const matchCat = category === "All" || m.category === category;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchVeg = !showVegOnly || m.isVeg;
    return matchCat && matchSearch && matchVeg;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setName("");
    setItemCategory("Starters");
    setPrice("");
    setGstRate("5");
    setHsnCode("9963");
    setIsVeg(true);
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setItemCategory(item.category);
    setPrice(String(item.price));
    setGstRate(String(item.gstRate));
    setHsnCode(item.hsnCode);
    setIsVeg(item.isVeg);
    setModalOpen(true);
  };

  const handleSave = () => {
    const numericPrice = Number(price);
    if (!name.trim() || !numericPrice || numericPrice <= 0) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: name.trim(),
        category: itemCategory.trim() || "Main Course",
        price: numericPrice,
        gstRate: Number(gstRate) || 5,
        hsnCode: hsnCode.trim() || "9963",
        isVeg,
      });
    } else {
      addMenuItem({
        name: name.trim(),
        category: itemCategory.trim() || "Main Course",
        price: numericPrice,
        gstRate: Number(gstRate) || 5,
        hsnCode: hsnCode.trim() || "9963",
        isVeg,
        available: true,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Menu Management</h1>
          <p className="text-sm text-zinc-500">
            {items.length} items across {categories.length - 1} categories
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowVegOnly(!showVegOnly)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium",
            showVegOnly
              ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          )}
        >
          <span className="h-3 w-3 rounded-sm border border-green-600 bg-green-600" />
          Veg Only
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
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
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-3 sm:px-4">Item</th>
              <th className="px-3 py-3 sm:px-4">Category</th>
              <th className="px-3 py-3 sm:px-4">Price</th>
              <th className="px-3 py-3 sm:px-4">GST</th>
              <th className="hidden px-3 py-3 sm:table-cell sm:px-4">HSN</th>
              <th className="px-3 py-3 sm:px-4">Available</th>
              <th className="px-3 py-3 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.id}
                className="border-b border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-sm ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}
                    />
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.category}</td>
                <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.gstRate}%</td>
                <td className="hidden px-3 py-3 font-mono text-xs text-zinc-500 sm:table-cell sm:px-4">{item.hsnCode}</td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => toggleMenuItemAvailability(item.id)}>
                    {item.available ? (
                      <ToggleRight size={24} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={24} className="text-zinc-300 dark:text-zinc-600" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit2 size={14} className="text-zinc-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-500">Item Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Paneer Makhani Roll"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Category</label>
                  <input
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="e.g., Starters"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">GST Rate</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="5">5%</option>
                    <option value="18">18%</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">HSN Code</label>
                  <input
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="accent-green-600"
                />
                Vegetarian item
              </label>
              <button
                type="button"
                onClick={handleSave}
                className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {editingItem ? "Save Changes" : "Add to Menu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
