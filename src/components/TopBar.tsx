"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { BillRecord, KOTItem } from "@/types";
import { getRouteLabel } from "@/lib/nav";
import {
  billRecordToInput,
  generateBillRecord,
  hydratePosStore,
  usePosStore,
} from "@/lib/pos-store";
import ThemeToggle from "./ThemeToggle";
import CreateOrderModal from "./CreateOrderModal";
import BillModal from "./BillModal";
import { KotModal } from "./BillingModals";

export default function TopBar() {
  const pathname = usePathname();
  const label = getRouteLabel(pathname);
  const { settings } = usePosStore();

  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [createdKot, setCreatedKot] = useState<KOTItem | null>(null);
  const [createdBillDraft, setCreatedBillDraft] = useState<BillRecord | null>(null);

  useEffect(() => {
    hydratePosStore();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 pl-12 md:px-6 md:pl-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{label}</span>
          <span className="hidden text-zinc-300 sm:inline dark:text-zinc-700">/</span>
          <span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">{settings.name}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setShowCreateOrder(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 sm:px-3 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Order</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {showCreateOrder && (
        <CreateOrderModal
          onClose={() => setShowCreateOrder(false)}
          onOrderCreated={({ kot, billDraft }) => {
            if (kot) setCreatedKot(kot);
            if (billDraft) setCreatedBillDraft(billDraft);
          }}
        />
      )}

      {createdKot && (
        <KotModal kot={createdKot} onClose={() => setCreatedKot(null)} />
      )}

      {createdBillDraft && (
        <BillModal
          bill={createdBillDraft}
          isPreviewOnly={createdBillDraft.invoiceNumber === "PREVIEW"}
          onSaveUnpaid={() => generateBillRecord(billRecordToInput(createdBillDraft))}
          onSettle={(mode, details) =>
            generateBillRecord(billRecordToInput(createdBillDraft), {
              paymentMode: mode,
              paymentDetails: details,
            })
          }
          onClose={() => setCreatedBillDraft(null)}
          onNewOrder={() => setCreatedBillDraft(null)}
        />
      )}
    </>
  );
}
