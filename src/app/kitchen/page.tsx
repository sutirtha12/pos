"use client";
import { useState } from "react";
import { advanceKotStatus, usePosStore } from "@/lib/pos-store";
import { KOTItem } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { Clock, ChefHat, CheckCircle2, AlertCircle, Flame } from "lucide-react";

const statusConfig = {
  pending: { color: "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950", badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300", icon: AlertCircle },
  preparing: { color: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300", icon: Flame },
  ready: { color: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300", icon: CheckCircle2 },
  served: { color: "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800", badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300", icon: CheckCircle2 },
};

export default function KitchenPage() {
  const { kotItems: kots } = usePosStore();
  const [filter, setFilter] = useState<"all" | KOTItem["status"]>("all");

  const filtered = filter === "all" ? kots : kots.filter((k) => k.status === filter);

  const advanceStatus = (id: string) => {
    advanceKotStatus(id);
  };

  const counts = { pending: 0, preparing: 0, ready: 0, served: 0 };
  kots.forEach((k) => counts[k.status]++);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
            <ChefHat size={22} className="mr-1.5 inline sm:mr-2" />Kitchen Display
          </h1>
          <p className="text-sm text-zinc-500">Live order tickets</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
            <AlertCircle size={12} />Pending: {counts.pending}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Flame size={12} />Cooking: {counts.preparing}
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 size={12} />Ready: {counts.ready}
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(["all", "pending", "preparing", "ready", "served"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize",
              filter === s ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {filtered.map((kot) => {
          const config = statusConfig[kot.status];
          const Icon = config.icon;
          return (
            <div key={kot.id} className={cn("rounded-xl border-2 p-4", config.color)}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", config.badge)}>
                    <Icon size={10} className="mr-0.5 inline" />{kot.status}
                  </span>
                  <span className="text-xs font-medium text-zinc-500">
                    {kot.tableNumber ? `Table ${kot.tableNumber}` : "Takeaway"}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock size={10} />{formatTime(kot.createdAt)}
                </span>
              </div>

              <div className="space-y-2">
                {kot.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2 dark:bg-zinc-900/40">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{item.name}</span>
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-bold text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100">x{item.quantity}</span>
                  </div>
                ))}
                {kot.items.some((i) => i.notes) && (
                  <p className="text-xs italic text-zinc-500">Note: {kot.items.find((i) => i.notes)?.notes}</p>
                )}
              </div>

              {kot.status !== "served" && (
                <button
                  onClick={() => advanceStatus(kot.id)}
                  className={cn(
                    "mt-3 w-full rounded-lg py-2 text-sm font-semibold text-white",
                    kot.status === "pending" && "bg-amber-600 hover:bg-amber-700",
                    kot.status === "preparing" && "bg-emerald-600 hover:bg-emerald-700",
                    kot.status === "ready" && "bg-blue-600 hover:bg-blue-700",
                  )}
                >
                  {kot.status === "pending" && "Start Preparing"}
                  {kot.status === "preparing" && "Mark Ready"}
                  {kot.status === "ready" && "Mark Served"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
