"use client";

import { BillRecord } from "@/types";
import { BUSINESS_INFO } from "@/lib/billing";
import { usePosStore } from "@/lib/pos-store";
import { formatCurrency, formatTime } from "@/lib/utils";

interface ThermalReceiptProps {
  bill: BillRecord;
  printableId?: string;
  compact?: boolean;
}

export default function ThermalReceipt({
  bill,
  printableId,
  compact = false,
}: ThermalReceiptProps) {
  const { settings } = usePosStore();
  const isPaid = bill.paymentStatus === "paid";

  return (
    <div
      id={printableId}
      className={
        compact
          ? "rounded-xl border border-zinc-200 bg-white p-4 font-mono text-xs text-zinc-900"
          : "mx-auto max-w-sm rounded-xl border border-zinc-200 bg-white p-5 font-mono text-xs text-zinc-900 shadow-xs"
      }
    >
      <div className="border-b border-dashed border-zinc-300 pb-3 text-center">
        <p className="text-base font-bold tracking-tight text-zinc-900">
          {settings.name.toUpperCase()}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-600">{settings.address}</p>
        <p className="text-[11px] text-zinc-600">
          Ph: {settings.phone} · GSTIN: {settings.gstin}
        </p>
      </div>

      <div className="space-y-1 border-b border-dashed border-zinc-300 py-3 text-[11px]">
        <div className="flex justify-between">
          <span className="text-zinc-500">Bill No:</span>
          <span className="font-bold text-zinc-900">{bill.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Date &amp; Time:</span>
          <span>
            {new Date(bill.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {", "}
            {formatTime(bill.createdAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Order Type:</span>
          <span className="font-semibold uppercase">
            {bill.type}
            {bill.tableNumber ? ` · T-${bill.tableNumber}` : ""}
            {bill.guestCount ? ` (${bill.guestCount}p)` : ""}
          </span>
        </div>
        {bill.waiterName && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Server:</span>
            <span>{bill.waiterName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Cashier:</span>
          <span>{bill.cashierName}</span>
        </div>
        {bill.customerName && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Guest:</span>
            <span>
              {bill.customerName}
              {bill.customerPhone ? ` (${bill.customerPhone})` : ""}
            </span>
          </div>
        )}
      </div>

      <table className="w-full border-b border-dashed border-zinc-300 py-2 text-[11px]">
        <thead>
          <tr className="border-b border-dashed border-zinc-300 text-left text-zinc-500">
            <th className="py-1.5 font-semibold">Item</th>
            <th className="py-1.5 text-center font-semibold">Qty</th>
            <th className="py-1.5 text-right font-semibold">Rate</th>
            <th className="py-1.5 text-right font-semibold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="py-1 pr-2">
                <p className="font-medium text-zinc-900">{item.name}</p>
                <p className="text-[10px] text-zinc-400">
                  HSN {item.hsnCode} · GST {item.gstRate}%
                </p>
                {item.notes && (
                  <p className="text-[10px] italic text-zinc-500">* {item.notes}</p>
                )}
              </td>
              <td className="py-1 text-center">{item.quantity}</td>
              <td className="py-1 text-right">{item.price}</td>
              <td className="py-1 text-right font-medium">
                {formatCurrency(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-b border-dashed border-zinc-300 py-3 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>
        {bill.discount > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>
              Discount{bill.discountLabel ? ` (${bill.discountLabel})` : ""}
            </span>
            <span>-{formatCurrency(bill.discount)}</span>
          </div>
        )}
        {bill.cgst5 + bill.sgst5 > 0 && (
          <>
            <div className="flex justify-between text-zinc-600">
              <span>CGST @ 2.5%</span>
              <span>{formatCurrency(bill.cgst5)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>SGST @ 2.5%</span>
              <span>{formatCurrency(bill.sgst5)}</span>
            </div>
          </>
        )}
        {bill.cgst18 + bill.sgst18 > 0 && (
          <>
            <div className="flex justify-between text-zinc-600">
              <span>CGST @ 9%</span>
              <span>{formatCurrency(bill.cgst18)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>SGST @ 9%</span>
              <span>{formatCurrency(bill.sgst18)}</span>
            </div>
          </>
        )}
        {bill.serviceCharge > 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Service Charge (5%)</span>
            <span>{formatCurrency(bill.serviceCharge)}</span>
          </div>
        )}
        {bill.roundOff !== 0 && (
          <div className="flex justify-between text-zinc-600">
            <span>Round Off</span>
            <span>
              {bill.roundOff > 0 ? "+" : ""}
              {bill.roundOff.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-b border-dashed border-zinc-300 py-3 text-sm font-bold">
        <span>GRAND TOTAL</span>
        <span className="text-base">{formatCurrency(bill.total)}</span>
      </div>

      <div className="pt-3 text-center text-[11px]">
        {isPaid ? (
          <div className="rounded bg-emerald-50 px-2 py-1.5 text-emerald-800">
            <p className="font-bold uppercase">PAID VIA {bill.paymentMode}</p>
            {bill.paymentMode === "cash" &&
              bill.paymentDetails?.tendered !== undefined && (
                <p className="text-[10px]">
                  Tendered: {formatCurrency(bill.paymentDetails.tendered)} · Change:{" "}
                  {formatCurrency(bill.paymentDetails.change ?? 0)}
                </p>
              )}
            {bill.paymentMode === "split" && bill.paymentDetails && (
              <p className="text-[10px]">
                Cash {formatCurrency(bill.paymentDetails.cash ?? 0)} · UPI{" "}
                {formatCurrency(bill.paymentDetails.upi ?? 0)} · Card{" "}
                {formatCurrency(bill.paymentDetails.card ?? 0)}
              </p>
            )}
            {bill.paymentDetails?.reference && (
              <p className="text-[10px]">Ref: {bill.paymentDetails.reference}</p>
            )}
          </div>
        ) : (
          <p className="rounded bg-amber-50 px-2 py-1 font-semibold text-amber-800">
            PROFORMA / UNPAID BILL
          </p>
        )}
        <p className="mt-2 text-zinc-500">SAC: {BUSINESS_INFO.sac} · E.&amp;O.E.</p>
        <p className="font-medium text-zinc-700">Thank you for dining with us!</p>
      </div>
    </div>
  );
}

