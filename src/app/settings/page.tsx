"use client";
import { useState } from "react";
import { DEFAULT_BUSINESS_SETTINGS } from "@/lib/billing";
import { resetDemoData, updateBusinessSettings, usePosStore } from "@/lib/pos-store";
import { cn } from "@/lib/utils";
import { Store, Receipt, Printer, CreditCard, Bell, Shield, RotateCcw } from "lucide-react";

const sections = [
  { id: "business", label: "Business Info", icon: Store },
  { id: "billing", label: "Billing & Tax", icon: Receipt },
  { id: "printer", label: "Printers", icon: Printer },
  { id: "payment", label: "Payment Modes", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { settings } = usePosStore();
  const [active, setActive] = useState("business");
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const [bizName, setBizName] = useState(settings.name);
  const [gstin, setGstin] = useState(settings.gstin);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [stateName, setStateName] = useState(settings.state);
  const [stateCode, setStateCode] = useState(settings.stateCode);

  const notify = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast((prev) => (prev === msg ? null : prev)), 2500);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Settings</h1>
          <p className="text-sm text-zinc-500">Configure your POS system</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetDemoData();
            setBizName(DEFAULT_BUSINESS_SETTINGS.name);
            setGstin(DEFAULT_BUSINESS_SETTINGS.gstin);
            setPhone(DEFAULT_BUSINESS_SETTINGS.phone);
            setEmail(DEFAULT_BUSINESS_SETTINGS.email);
            setAddress(DEFAULT_BUSINESS_SETTINGS.address);
            setStateName(DEFAULT_BUSINESS_SETTINGS.state);
            setStateCode(DEFAULT_BUSINESS_SETTINGS.stateCode);
            notify("Demo data restored to defaults.");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={14} />
          Reset Demo Data
        </button>
      </div>

      {savedToast && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200">
          {savedToast}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {/* Settings Nav */}
        <div className="flex gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:w-full",
                active === id ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              )}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {active === "business" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Business Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500">Business Name</label>
                  <input value={bizName} onChange={(e) => setBizName(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">GSTIN</label>
                  <input value={gstin} onChange={(e) => setGstin(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-500">Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" rows={2} />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">State</label>
                  <input value={stateName} onChange={(e) => setStateName(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500">State Code</label>
                  <input value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateBusinessSettings({
                    name: bizName.trim() || settings.name,
                    gstin: gstin.trim() || settings.gstin,
                    phone: phone.trim() || settings.phone,
                    email: email.trim() || settings.email,
                    address: address.trim() || settings.address,
                    state: stateName.trim() || settings.state,
                    stateCode: stateCode.trim() || settings.stateCode,
                  });
                  notify("Business info saved — reflected on new & printed bills.");
                }}
                className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
              >
                Save Changes
              </button>
            </div>
          )}

          {active === "billing" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Billing &amp; Tax Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Service Charge</p>
                    <p className="text-xs text-zinc-500">Applied on dine-in orders</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={settings.serviceChargeRate}
                      onChange={(e) =>
                        updateBusinessSettings({ serviceChargeRate: Number(e.target.value) || 0 })
                      }
                      className="w-16 rounded border border-zinc-200 bg-white px-2 py-1 text-center text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <span className="text-sm text-zinc-500">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">UPI ID</p>
                    <p className="text-xs text-zinc-500">Displayed in payment settlement</p>
                  </div>
                  <input
                    value={settings.upiId}
                    onChange={(e) => updateBusinessSettings({ upiId: e.target.value })}
                    className="w-40 rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Invoice Prefix</p>
                    <p className="text-xs text-zinc-500">Prefix for invoice numbers</p>
                  </div>
                  <input
                    value={settings.invoicePrefix}
                    onChange={(e) => updateBusinessSettings({ invoicePrefix: e.target.value })}
                    className="w-32 rounded border border-zinc-200 bg-white px-2 py-1 text-sm font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Round Off Total</p>
                    <p className="text-xs text-zinc-500">Round bill to nearest rupee</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateBusinessSettings({ roundOffEnabled: !settings.roundOffEnabled })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      settings.roundOffEnabled
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                    )}
                  >
                    {settings.roundOffEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === "printer" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Printer Setup</h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Bill Printer</p>
                      <p className="text-xs text-zinc-500">Thermal 80mm — Cashier Counter</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Connected</span>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">KOT Printer</p>
                      <p className="text-xs text-zinc-500">Thermal 58mm — Kitchen</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Connected</span>
                  </div>
                </div>
                <div className="rounded-lg border border-dashed border-zinc-300 p-4 dark:border-zinc-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-400">Add Another Printer</p>
                      <p className="text-xs text-zinc-400">Bar, second kitchen, etc.</p>
                    </div>
                    <button className="rounded-lg border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">+ Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "payment" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Payment Modes</h2>
              <div className="space-y-3">
                {[
                  { name: "Cash", enabled: true },
                  { name: "UPI (PhonePe/GPay)", enabled: true },
                  { name: "Credit/Debit Card", enabled: true },
                  { name: "Paytm Wallet", enabled: false },
                  { name: "Sodexo / Meal Cards", enabled: false },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                    <span className="text-sm font-medium">{p.name}</span>
                    <button className={cn("rounded-full px-3 py-1 text-xs font-bold", p.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400")}>
                      {p.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Notifications</h2>
              <div className="space-y-3">
                {[
                  { name: "Low Stock Alerts", desc: "When inventory drops below minimum", enabled: true },
                  { name: "Daily Sales Summary", desc: "WhatsApp report at day-end", enabled: true },
                  { name: "New Order Sound", desc: "Audio alert for new orders", enabled: true },
                  { name: "Customer Birthday", desc: "Reminder for VIP customer birthdays", enabled: false },
                ].map((n) => (
                  <div key={n.name} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                    <div>
                      <p className="text-sm font-medium">{n.name}</p>
                      <p className="text-xs text-zinc-500">{n.desc}</p>
                    </div>
                    <button className={cn("rounded-full px-3 py-1 text-xs font-bold", n.enabled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400")}>
                      {n.enabled ? "On" : "Off"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "security" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Security & Access</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">PIN Lock</p>
                    <p className="text-xs text-zinc-500">Require PIN to access POS</p>
                  </div>
                  <button className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Enabled</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Manager Override</p>
                    <p className="text-xs text-zinc-500">Require manager PIN for discounts &gt; 20%</p>
                  </div>
                  <button className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Enabled</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div>
                    <p className="text-sm font-medium">Auto-Logout</p>
                    <p className="text-xs text-zinc-500">Logout after inactivity</p>
                  </div>
                  <select className="rounded border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
