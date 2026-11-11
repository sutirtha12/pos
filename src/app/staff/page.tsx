"use client";

import { useState } from "react";
import { Staff } from "@/types";
import { addStaffMember, updateStaffMember, usePosStore } from "@/lib/pos-store";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Plus, Search, UserCog, Shield, Clock, X } from "lucide-react";

const roleColors: Record<string, string> = {
  owner: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  cashier: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  waiter: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  chef: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export default function StaffPage() {
  const { staff } = usePosStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Staff["role"]>("waiter");
  const [phone, setPhone] = useState("");
  const [shift, setShift] = useState<Staff["shift"]>("morning");
  const [active, setActive] = useState(true);

  const roles = ["all", ...Array.from(new Set(staff.map((s) => s.role)))];

  const filtered = staff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = staff.filter((s) => s.active).length;

  const openAdd = () => {
    setEditingStaff(null);
    setName("");
    setRole("waiter");
    setPhone("");
    setShift("morning");
    setActive(true);
    setModalOpen(true);
  };

  const openEdit = (member: Staff) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setShift(member.shift);
    setActive(member.active);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) return;
    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name: name.trim(),
        role,
        phone: phone.trim(),
        shift,
        active,
      });
    } else {
      addStaffMember({
        name: name.trim(),
        role,
        phone: phone.trim(),
        shift,
        active,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Staff Management</h1>
          <p className="text-sm text-zinc-500">
            {activeCount} active of {staff.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Shift Overview */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {(["morning", "evening", "night"] as const).map((sh) => {
          const count = staff.filter((s) => s.shift === sh && s.active).length;
          return (
            <div
              key={sh}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-zinc-400" />
                <span className="text-xs font-medium capitalize text-zinc-500">{sh} Shift</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {count} staff
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize",
              roleFilter === r
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className={cn(
              "rounded-xl border bg-white p-4 dark:bg-zinc-900",
              s.active
                ? "border-zinc-200 dark:border-zinc-800"
                : "border-dashed border-zinc-300 opacity-60 dark:border-zinc-700"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.name}</p>
                  <span
                    className={cn(
                      "inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                      roleColors[s.role]
                    )}
                  >
                    {s.role}
                  </span>
                </div>
              </div>
              {!s.active && (
                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-bold text-zinc-600">
                  Inactive
                </span>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-zinc-500">Phone</span>
                <p className="font-medium text-zinc-700 dark:text-zinc-300">{s.phone}</p>
              </div>
              <div>
                <span className="text-zinc-500">Shift</span>
                <p className="font-medium capitalize text-zinc-700 dark:text-zinc-300">{s.shift}</p>
              </div>
              <div>
                <span className="text-zinc-500">Joined</span>
                <p className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatDate(s.joinDate)}
                </p>
              </div>
              {s.role !== "chef" && s.role !== "owner" && (
                <div>
                  <span className="text-zinc-500">Sales</span>
                  <p className="font-medium text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(s.salesTotal)}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(s)}
                className="flex-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <UserCog size={12} className="mr-1 inline" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => updateStaffMember(s.id, { active: !s.active })}
                className="flex-1 rounded-lg border border-zinc-200 bg-white py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Shield size={12} className="mr-1 inline" />
                {s.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-96 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
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
                <label className="text-xs font-medium text-zinc-500">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Arjun Nair"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Staff["role"])}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="cashier">Cashier</option>
                    <option value="chef">Chef</option>
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Shift</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as Staff["shift"])}
                    className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9800000010"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active staff member
              </label>
              <button
                type="button"
                onClick={handleSave}
                className="mt-2 w-full rounded-lg bg-zinc-900 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {editingStaff ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
