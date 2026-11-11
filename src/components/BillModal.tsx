"use client";

import { useState } from "react";
import {
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  FileText,
  Printer,
  QrCode,
  Receipt,
  Smartphone,
  SplitSquareHorizontal,
  X,
} from "lucide-react";
import { BillRecord, PaymentDetails } from "@/types";
import { formatBillText } from "@/lib/billing";
import { usePosStore } from "@/lib/pos-store";
import { cn, formatCurrency } from "@/lib/utils";
import ThermalReceipt from "./ThermalReceipt";

interface BillModalProps {
  bill: BillRecord;
  isPreviewOnly?: boolean;
  onSaveUnpaid: () => BillRecord;
  onSettle: (
    mode: "cash" | "upi" | "card" | "split",
    details?: PaymentDetails
  ) => BillRecord;
  onClose: () => void;
  onNewOrder: () => void;
}

export default function BillModal({
  bill,
  isPreviewOnly = false,
  onSaveUnpaid,
  onSettle,
  onClose,
  onNewOrder,
}: BillModalProps) {
  const { settings } = usePosStore();
  const [activeBill, setActiveBill] = useState<BillRecord>(bill);
  const [wasSettledHere, setWasSettledHere] = useState(false);
  const [mode, setMode] = useState<"cash" | "upi" | "card" | "split">(
    bill.paymentMode ?? "cash"
  );
  const [cashTendered, setCashTendered] = useState<string>(String(bill.total));
  const [reference, setReference] = useState<string>("");
  const [splitCash, setSplitCash] = useState<string>(String(Math.floor(bill.total / 2)));
  const [splitUpi, setSplitUpi] = useState<string>(
    String(Number((bill.total - Math.floor(bill.total / 2)).toFixed(2)))
  );
  const [splitCard, setSplitCard] = useState<string>("0");
  const [copied, setCopied] = useState(false);

  const isPaid = activeBill.paymentStatus === "paid";
  const tenderedNum = Number(cashTendered) || 0;
  const cashChange = Math.max(0, Number((tenderedNum - activeBill.total).toFixed(2)));
  const cashInsufficient = mode === "cash" && tenderedNum < activeBill.total;

  const sCash = Number(splitCash) || 0;
  const sUpi = Number(splitUpi) || 0;
  const sCard = Number(splitCard) || 0;
  const splitSum = Number((sCash + sUpi + sCard).toFixed(2));
  const splitRemaining = Number((activeBill.total - splitSum).toFixed(2));
  const splitInvalid = mode === "split" && Math.abs(splitRemaining) > 0.01;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatBillText(activeBill, settings));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
    }
  };

  const handleDownload = () => {
    const content = formatBillText(activeBill, settings);
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeBill.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateUnpaid = () => {
    const saved = onSaveUnpaid();
    setActiveBill(saved);
  };

  const handleConfirmPayment = () => {
    let details: PaymentDetails | undefined;
    if (mode === "cash") {
      details = {
        cash: activeBill.total,
        tendered: tenderedNum,
        change: cashChange,
      };
    } else if (mode === "upi") {
      details = {
        upi: activeBill.total,
        reference: reference.trim() || undefined,
      };
    } else if (mode === "card") {
      details = {
        card: activeBill.total,
        reference: reference.trim() || undefined,
      };
    } else {
      details = {
        cash: sCash,
        upi: sUpi,
        card: sCard,
      };
    }

    const finalized = onSettle(mode, details);
    setActiveBill(finalized);
    setWasSettledHere(true);
  };

  const handleDismiss = () => {
    if (wasSettledHere) {
      onNewOrder();
    } else {
      onClose();
    }
  };

  const statusBadge = isPaid
    ? { label: "Paid", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" }
    : isPreviewOnly && activeBill.invoiceNumber === "PREVIEW"
      ? { label: "Draft Preview", cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" }
      : { label: "Unpaid Bill", cls: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Receipt size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {activeBill.invoiceNumber === "PREVIEW"
                    ? "Generate Bill & Tax Invoice"
                    : `Bill ${activeBill.invoiceNumber}`}
                </h3>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", statusBadge.cls)}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeBill.type === "dine-in"
                  ? activeBill.tableNumber
                    ? `Dine-in · Table ${activeBill.tableNumber}`
                    : "Dine-in"
                  : activeBill.type.charAt(0).toUpperCase() + activeBill.type.slice(1)}
                {" · "}
                {activeBill.items.reduce((s, i) => s + i.quantity, 0)} items
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close bill modal"
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto md:grid-cols-12">
          {/* Left: Printable Thermal Receipt Preview */}
          <div className="border-b border-zinc-200 bg-zinc-50 p-5 md:col-span-6 md:border-r md:border-b-0 dark:border-zinc-800 dark:bg-zinc-950/60">
            <ThermalReceipt bill={activeBill} printableId="printable-bill" />
          </div>

          {/* Right: Settlement & Print Actions */}
          <div className="flex flex-col justify-between p-5 md:col-span-6">
            <div>
              {/* Quick Receipt Export Row */}
              <div className="mb-5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <Printer size={14} />
                  Print Bill
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Text"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>

              {!isPaid ? (
                <>
                  {/* Proforma / Unpaid Bill Generation */}
                  <div className="mb-5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                          {activeBill.invoiceNumber === "PREVIEW"
                            ? "Need to drop the bill at the table first?"
                            : `Unpaid bill ${activeBill.invoiceNumber} is active`}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {activeBill.invoiceNumber === "PREVIEW"
                            ? "Generate an official invoice number and keep the table open until paid."
                            : "Print & present to guest, then settle below once paid."}
                        </p>
                      </div>
                      {activeBill.invoiceNumber === "PREVIEW" && (
                        <button
                          type="button"
                          onClick={handleGenerateUnpaid}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <FileText size={13} />
                          Generate Unpaid Bill
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Mode Tabs */}
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Settle Payment ({formatCurrency(activeBill.total)})
                  </p>
                  <div className="mb-4 grid grid-cols-4 gap-2">
                    {([
                      ["cash", "Cash", Banknote],
                      ["upi", "UPI", Smartphone],
                      ["card", "Card", CreditCard],
                      ["split", "Split", SplitSquareHorizontal],
                    ] as const).map(([key, label, Icon]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setMode(key)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors",
                          mode === key
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                            : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Mode-specific Controls */}
                  {mode === "cash" && (
                    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: `Exact (${formatCurrency(activeBill.total)})`, value: activeBill.total },
                          { label: "₹500", value: 500 },
                          { label: "₹1,000", value: 1000 },
                          { label: "₹2,000", value: 2000 },
                        ].map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setCashTendered(String(preset.value))}
                            className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Cash Tendered (₹)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={cashTendered}
                          onChange={(e) => setCashTendered(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                        <span className="text-zinc-500 dark:text-zinc-400">Change to Return</span>
                        <span
                          className={cn(
                            "font-bold",
                            cashInsufficient
                              ? "text-red-600 dark:text-red-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {cashInsufficient
                            ? `Short by ${formatCurrency(activeBill.total - tenderedNum)}`
                            : formatCurrency(cashChange)}
                        </span>
                      </div>
                    </div>
                  )}

                  {mode === "upi" && (
                    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950/40">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-purple-700 shadow-2xs dark:bg-zinc-900 dark:text-purple-300">
                          <QrCode size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                            Collect {formatCurrency(activeBill.total)} via UPI
                          </p>
                          <p className="font-mono text-[11px] text-purple-700 dark:text-purple-300">
                            UPI ID: {settings.upiId}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          UTR / Transaction Ref (optional)
                        </label>
                        <input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="e.g., 431209876543"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                    </div>
                  )}

                  {mode === "card" && (
                    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <div>
                        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Card Last 4 Digits / Auth Code (optional)
                        </label>
                        <input
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="e.g., VISA ••4219 / Auth 8841"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>
                    </div>
                  )}

                  {mode === "split" && (
                    <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Cash (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={splitCash}
                            onChange={(e) => setSplitCash(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            UPI (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={splitUpi}
                            onChange={(e) => setSplitUpi(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Card (₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={splitCard}
                            onChange={(e) => setSplitCard(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Allocated: {formatCurrency(splitSum)}
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            splitInvalid
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {splitRemaining === 0
                            ? "Exact match"
                            : splitRemaining > 0
                              ? `Remaining: ${formatCurrency(splitRemaining)}`
                              : `Over by ${formatCurrency(Math.abs(splitRemaining))}`}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900 dark:bg-emerald-950/50">
                  <CheckCircle2
                    size={36}
                    className="mx-auto mb-2 text-emerald-600 dark:text-emerald-400"
                  />
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Bill Generated &amp; Payment Settled
                  </h4>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                    Invoice <span className="font-mono font-semibold">{activeBill.invoiceNumber}</span>{" "}
                    · {formatCurrency(activeBill.total)} paid via{" "}
                    <span className="uppercase font-semibold">{activeBill.paymentMode}</span>
                  </p>
                  {activeBill.tableNumber && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Table {activeBill.tableNumber} marked for cleaning.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-6 flex gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              {!isPaid ? (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Back to Order
                  </button>
                  <button
                    type="button"
                    disabled={cashInsufficient || splitInvalid}
                    onClick={handleConfirmPayment}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Confirm &amp; Generate Bill · {formatCurrency(activeBill.total)}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Printer size={15} />
                    Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={onNewOrder}
                    className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Start New Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
