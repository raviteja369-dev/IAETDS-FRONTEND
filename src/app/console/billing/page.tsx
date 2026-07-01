"use client";

import * as React from "react";
import { CreditCard, Download, Plus, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import {
  AnimatedNumber,
  Delta,
  ProgressBar,
  SectionHeader,
  StatusPill,
  Surface,
  type Tone,
} from "@/components/eoc/primitives";
import { AreaTrend } from "@/components/eoc/charts";
import { Modal, Field, TextInput, SelectInput } from "@/components/eoc/modal";
import { costSeries, usageMetrics } from "@/lib/eoc/data";
import { downloadJson } from "@/lib/eoc/export";
import { useEocStore } from "@/lib/eoc/store";
import { formatCurrency, formatNumber } from "@/lib/eoc/format";
import { cn } from "@/lib/utils";

const invTone: Record<string, Tone> = { paid: "success", due: "info", overdue: "danger", processing: "warning" };
const subTone: Record<string, Tone> = { active: "success", trialing: "info", past_due: "danger", paused: "warning", canceled: "neutral" };
const txTone: Record<string, Tone> = { succeeded: "success", pending: "warning", failed: "danger" };

type PmType = "UPI" | "Card" | "Net banking" | "Wallet";
interface PmField {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
  type?: string;
  maxLength?: number;
  validate?: (v: string) => string | null;
}

const PM_FIELDS: Record<PmType, PmField[]> = {
  UPI: [
    { key: "vpa", label: "UPI ID", placeholder: "name@bank", validate: (v) => (/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v) ? null : "Enter a valid UPI ID (e.g. name@okhdfc)") },
  ],
  Card: [
    { key: "number", label: "Card number", placeholder: "1234 5678 9012 3456", maxLength: 19, validate: (v) => (v.replace(/\s/g, "").length >= 12 ? null : "Enter a valid card number") },
    { key: "name", label: "Name on card", placeholder: "As printed on card" },
    { key: "expiry", label: "Expiry (MM/YY)", placeholder: "MM/YY", maxLength: 5, validate: (v) => (/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? null : "Enter expiry as MM/YY") },
    { key: "cvv", label: "CVV", placeholder: "•••", type: "password", maxLength: 4, validate: (v) => (/^\d{3,4}$/.test(v) ? null : "Enter a valid CVV") },
  ],
  "Net banking": [
    { key: "bank", label: "Bank", options: ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank", "Punjab National Bank", "Yes Bank", "Bank of Baroda"] },
    { key: "account", label: "Account number", placeholder: "Your account number", validate: (v) => (/^\d{6,18}$/.test(v) ? null : "Enter a valid account number") },
    { key: "ifsc", label: "IFSC code", placeholder: "e.g. HDFC0001234", maxLength: 11, validate: (v) => (/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(v) ? null : "Enter a valid 11-character IFSC code") },
  ],
  Wallet: [
    { key: "provider", label: "Wallet provider", options: ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge"] },
    { key: "mobile", label: "Linked mobile", placeholder: "10-digit mobile number", maxLength: 10, validate: (v) => (/^[6-9]\d{9}$/.test(v) ? null : "Enter a valid 10-digit mobile number") },
  ],
};

function buildPmDefaults(type: PmType): Record<string, string> {
  const d: Record<string, string> = {};
  PM_FIELDS[type].forEach((f) => {
    if (f.options) d[f.key] = f.options[0];
  });
  return d;
}

export default function BillingPage() {
  const [tab, setTab] = React.useState<"invoices" | "transactions" | "subscriptions">("invoices");
  const invoices = useEocStore((s) => s.invoices);
  const transactions = useEocStore((s) => s.transactions);
  const subscriptions = useEocStore((s) => s.subscriptions);
  const walletBalance = useEocStore((s) => s.walletBalance);
  const paymentMethods = useEocStore((s) => s.paymentMethods);
  const payInvoice = useEocStore((s) => s.payInvoice);
  const makePayment = useEocStore((s) => s.makePayment);
  const savePaymentMethod = useEocStore((s) => s.addPaymentMethod);
  const removePaymentMethod = useEocStore((s) => s.removePaymentMethod);

  const monthlySpend = subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0) || 48250;
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  const handlePay = (id: string, number: string) => {
    if (paymentMethods.length === 0) {
      toast.error("Add a payment method first", { description: "Save a UPI, card, or bank account before paying invoices." });
      setPmOpen(true);
      return;
    }
    const ok = payInvoice(id);
    if (!ok) {
      toast.error("Payment failed", { description: "This invoice may already be paid or is unavailable." });
      return;
    }
    toast.success(`${number} paid`, { description: "A receipt has been emailed to billing." });
  };

  const [payOpen, setPayOpen] = React.useState(false);
  const [payAmount, setPayAmount] = React.useState("");
  const [payPurpose, setPayPurpose] = React.useState("Wallet top-up");
  const [payMethod, setPayMethod] = React.useState("UPI");
  const [payMode, setPayMode] = React.useState<"wallet" | "payment">("wallet");

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Math.round(Number(payAmount.replace(/[^0-9.]/g, "")));
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount greater than ₹0");
      return;
    }
    if (!payPurpose.trim()) {
      toast.error("Please enter a purpose");
      return;
    }
    const toWallet = payMode === "wallet";
    if (!toWallet && payMethod === "Wallet" && walletBalance < amount) {
      toast.error("Insufficient wallet balance", { description: `Available: ${formatCurrency(walletBalance, true)}` });
      return;
    }
    const ok = makePayment({ amount, method: payMethod, purpose: payPurpose.trim(), toWallet });
    if (!ok) {
      toast.error("Payment could not be processed");
      return;
    }
    toast.success(toWallet ? "Funds added to wallet" : "Payment successful", {
      description: `${formatCurrency(amount)} · ${payMethod}`,
    });
    setPayAmount("");
    setPayPurpose("Wallet top-up");
    setPayOpen(false);
  };

  const exportStatements = () => {
    downloadJson(`billing-statement-${Date.now()}.json`, {
      walletBalance,
      monthlySpend,
      outstanding,
      invoices,
      transactions: transactions.slice(0, 50),
      subscriptions,
      paymentMethods: paymentMethods.map((p) => ({ type: p.type, label: p.label, addedAt: p.addedAt })),
    });
    toast.success("Statement downloaded", { description: "Billing summary exported as JSON." });
  };

  const downloadInvoice = (inv: (typeof invoices)[number]) => {
    downloadJson(`${inv.number}.json`, inv);
    toast.success(`${inv.number} downloaded`);
  };

  const [pmOpen, setPmOpen] = React.useState(false);
  const [pmType, setPmType] = React.useState<PmType>("UPI");
  const [pm, setPm] = React.useState<Record<string, string>>(() => buildPmDefaults("UPI"));

  const changePmType = (type: PmType) => {
    setPmType(type);
    setPm(buildPmDefaults(type));
  };

  const setPmField = (key: string, value: string) => setPm((prev) => ({ ...prev, [key]: value }));

  const addPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of PM_FIELDS[pmType]) {
      const value = (pm[f.key] ?? "").trim();
      if (!value) {
        toast.error(`Please enter ${f.label}`);
        return;
      }
      const err = f.validate?.(value);
      if (err) {
        toast.error(err);
        return;
      }
    }
    const summary =
      pmType === "Card"
        ? `Card •• ${(pm.number ?? "").replace(/\s/g, "").slice(-4)}`
        : pmType === "UPI"
          ? pm.vpa
          : pmType === "Net banking"
            ? `${pm.bank} •• ${(pm.account ?? "").slice(-4)}`
            : `${pm.provider} · ${pm.mobile}`;
    savePaymentMethod({ type: pmType, label: pmType, detail: summary });
    toast.success("Payment method added", { description: `${pmType} · ${summary}` });
    setPm(buildPmDefaults(pmType));
    setPmOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financial operations"
        title="Billing & Payments"
        description="Subscriptions, usage-based billing, invoices and payment activity — a premium, trustworthy financial control center."
        actions={
          <>
            <EButton variant="secondary" onClick={exportStatements}><Download className="h-4 w-4" /> Statements</EButton>
            <EButton variant="secondary" onClick={() => setPmOpen(true)}><Plus className="h-4 w-4" /> Add payment method</EButton>
            <EButton variant="primary" onClick={() => setPayOpen(true)}><Wallet className="h-4 w-4" /> Make a payment</EButton>
          </>
        }
      />

      <Modal open={pmOpen} onOpenChange={setPmOpen} title="Add payment method" description="Securely save a method for future payments.">
        <form onSubmit={addPaymentMethod} className="space-y-4 p-5">
          <Field label="Method type" htmlFor="pm-type">
            <SelectInput id="pm-type" value={pmType} onChange={(e) => changePmType(e.target.value as PmType)}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net banking">Net banking</option>
              <option value="Wallet">Wallet</option>
            </SelectInput>
          </Field>

          {PM_FIELDS[pmType].map((f, i) => (
            <Field key={f.key} label={f.label} htmlFor={`pm-${f.key}`}>
              {f.options ? (
                <SelectInput id={`pm-${f.key}`} value={pm[f.key] ?? f.options[0]} onChange={(e) => setPmField(f.key, e.target.value)}>
                  {f.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </SelectInput>
              ) : (
                <TextInput
                  id={`pm-${f.key}`}
                  type={f.type}
                  inputMode={f.key === "mobile" || f.key === "account" || f.key === "cvv" || f.key === "number" ? "numeric" : undefined}
                  maxLength={f.maxLength}
                  value={pm[f.key] ?? ""}
                  onChange={(e) => setPmField(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  autoFocus={i === 0}
                />
              )}
            </Field>
          ))}

          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setPmOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Save method</EButton>
          </div>
        </form>
      </Modal>

      <Modal open={payOpen} onOpenChange={setPayOpen} title="Make a payment" description="Add funds to your wallet or make a one-time payment.">
        <form onSubmit={submitPayment} className="space-y-4 p-5">
          <Field label="Type" htmlFor="pay-mode">
            <SelectInput
              id="pay-mode"
              value={payMode}
              onChange={(e) => {
                const mode = e.target.value as "wallet" | "payment";
                setPayMode(mode);
                setPayPurpose(mode === "wallet" ? "Wallet top-up" : "One-time payment");
              }}
            >
              <option value="wallet">Add funds to wallet</option>
              <option value="payment">One-time payment</option>
            </SelectInput>
          </Field>
          <Field label="Amount (₹)" htmlFor="pay-amount" hint={payAmount ? `You will be charged ${formatCurrency(Math.round(Number(payAmount.replace(/[^0-9.]/g, "")) || 0))}` : "Enter the amount you want to pay"}>
            <TextInput id="pay-amount" inputMode="numeric" value={payAmount} onChange={(e) => setPayAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 5000" autoFocus />
          </Field>
          <Field label="Purpose" htmlFor="pay-purpose">
            <TextInput id="pay-purpose" value={payPurpose} onChange={(e) => setPayPurpose(e.target.value)} placeholder="What is this payment for?" />
          </Field>
          <Field label="Pay using" htmlFor="pay-method">
            <SelectInput id="pay-method" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net banking">Net banking</option>
              <option value="Wallet">Wallet (balance {formatCurrency(walletBalance, true)})</option>
            </SelectInput>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setPayOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">{payMode === "wallet" ? "Add funds" : "Pay now"}</EButton>
          </div>
        </form>
      </Modal>

      {/* Plan + wallet + spend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <Surface className="relative h-full overflow-hidden p-6">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-eoc-accent/20 blur-3xl" />
            <div className="flex items-center justify-between">
              <StatusPill tone="info">Enterprise Plan</StatusPill>
              <CreditCard className="h-5 w-5 text-eoc-muted" />
            </div>
            <p className="mt-6 text-xs text-eoc-muted">Monthly spend</p>
            <AnimatedNumber value={monthlySpend} unit="₹" className="text-3xl font-semibold text-eoc-fg" />
            <div className="mt-1"><Delta value={-3.4} /></div>
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-xs"><span className="text-eoc-muted">Budget used</span><span className="text-eoc-fg">{formatCurrency(monthlySpend, true)} / {formatCurrency(6000000, true)}</span></div>
              <ProgressBar value={Math.min(100, Math.round((monthlySpend / 6000000) * 100))} tone="info" />
            </div>
            <p className="mt-4 text-xs text-eoc-muted">Renews Jul 15, 2026 · UPI · HDFC •• 4242</p>
          </Surface>
        </motion.div>

        <Surface className="p-6 lg:col-span-2">
          <SectionHeader title="Spend trend & forecast" description="Trailing 12 months with projected spend" action={<StatusPill tone="success">On budget</StatusPill>} />
          <div className="mt-4">
            <AreaTrend data={costSeries} dataKey="cost" xKey="m" color="#4F7CFF" height={200} formatter={(v) => formatCurrency(v)} />
          </div>
        </Surface>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat icon={Wallet} label="Wallet balance" value={formatCurrency(walletBalance)} />
        <MiniStat icon={CreditCard} label="AI credits" value="318k" />
        <MiniStat label="Outstanding" value={formatCurrency(outstanding)} tone={outstanding > 0 ? "warning" : "success"} />
        <MiniStat label="Payment success" value="99.4%" tone="success" />
      </div>

      {/* Saved payment methods */}
      <Surface className="p-5">
        <SectionHeader
          title="Saved payment methods"
          description="Methods you've added are saved to your account and available at checkout."
          action={<EButton size="sm" variant="secondary" onClick={() => setPmOpen(true)}><Plus className="h-4 w-4" /> Add</EButton>}
        />
        {paymentMethods.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-eoc-border bg-white/[0.02] p-6 text-center">
            <CreditCard className="mx-auto h-6 w-6 text-eoc-muted" />
            <p className="mt-2 text-sm text-eoc-fg2">No payment methods saved yet</p>
            <p className="text-xs text-eoc-muted">Add a UPI ID, card, bank account or wallet to get started.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paymentMethods.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-eoc-border bg-white/[0.02] p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-eoc-fg2">
                  {p.type === "Wallet" ? <Wallet className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-eoc-fg">{p.label}</p>
                  <p className="truncate text-xs text-eoc-muted">{p.detail} · added {p.addedAt}</p>
                </div>
                <button onClick={() => { removePaymentMethod(p.id); toast.success("Payment method removed"); }} className="text-xs font-medium text-eoc-danger hover:text-eoc-fg">Remove</button>
              </div>
            ))}
          </div>
        )}
      </Surface>

      {/* Usage billing */}
      <Surface className="p-5">
        <SectionHeader title="Usage-based billing" description="Metered consumption this cycle with forecast" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {usageMetrics.map((u) => {
            const pct = Math.round((u.used / u.included) * 100);
            return (
              <div key={u.key} className="rounded-xl border border-eoc-border bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-eoc-fg">{u.label}</p>
                  <span className="text-xs text-eoc-fg2">{formatCurrency(u.cost)}</span>
                </div>
                <p className="mt-1 text-xs text-eoc-muted">
                  {formatNumber(u.used)} / {formatNumber(u.included)} {u.unit}
                </p>
                <ProgressBar value={pct} tone={pct > 90 ? "danger" : pct > 75 ? "warning" : "info"} className="mt-2.5" />
                <p className="mt-2 text-[11px] text-eoc-muted">Forecast: {formatNumber(u.forecast)} {u.unit}</p>
              </div>
            );
          })}
        </div>
      </Surface>

      {/* Ledger tabs */}
      <Surface className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-eoc-border bg-white/[0.03] p-1">
            {(["invoices", "transactions", "subscriptions"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors", tab === t ? "bg-white/10 text-eoc-fg" : "text-eoc-muted hover:text-eoc-fg2")}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {tab === "invoices" && (
            <Table head={["Invoice", "Organization", "Issued", "Amount", "Status", ""]}>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-eoc-border text-sm">
                  <Td className="font-mono text-xs text-eoc-fg2">{inv.number}</Td>
                  <Td>{inv.org}</Td>
                  <Td className="text-eoc-muted">{inv.issued}</Td>
                  <Td className="font-medium text-eoc-fg">{formatCurrency(inv.amount)}</Td>
                  <Td><StatusPill tone={invTone[inv.status]}>{inv.status}</StatusPill></Td>
                  <Td className="text-right">
                    {inv.status === "paid" ? (
                      <button onClick={() => downloadInvoice(inv)} className="text-xs text-eoc-accent hover:text-eoc-fg">Download</button>
                    ) : (
                      <button onClick={() => handlePay(inv.id, inv.number)} className="text-xs font-medium text-eoc-success hover:text-eoc-fg">Pay now</button>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
          {tab === "transactions" && (
            <Table head={["Description", "Method", "Date", "Amount", "Status"]}>
              {transactions.map((t) => (
                <tr key={t.id} className="border-t border-eoc-border text-sm">
                  <Td>{t.description}</Td>
                  <Td className="text-eoc-muted">{t.method}</Td>
                  <Td className="text-eoc-muted">{t.at}</Td>
                  <Td className={cn("font-medium", t.amount < 0 ? "text-eoc-success" : "text-eoc-fg")}>
                    {t.amount < 0 ? "−" : ""}{formatCurrency(Math.abs(t.amount))}
                  </Td>
                  <Td><StatusPill tone={txTone[t.status]}>{t.status}</StatusPill></Td>
                </tr>
              ))}
            </Table>
          )}
          {tab === "subscriptions" && (
            <Table head={["Application", "Plan", "Seats", "Amount", "Renews", "Status"]}>
              {subscriptions.map((s) => (
                <tr key={s.id} className="border-t border-eoc-border text-sm">
                  <Td className="font-medium text-eoc-fg">{s.app}</Td>
                  <Td>{s.plan}</Td>
                  <Td className="text-eoc-muted">{s.seats.toLocaleString()}</Td>
                  <Td className="text-eoc-fg">{s.amount ? `${formatCurrency(s.amount)}/mo` : "—"}</Td>
                  <Td className="text-eoc-muted">{s.renews}</Td>
                  <Td><StatusPill tone={subTone[s.status]}>{s.status.replace("_", " ")}</StatusPill></Td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </Surface>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon?: React.ElementType; label: string; value: string; tone?: Tone }) {
  return (
    <Surface hover className="flex items-center gap-3 p-4">
      {Icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-eoc-fg2"><Icon className="h-4 w-4" /></span>
      )}
      <div>
        <p className="text-xs text-eoc-muted">{label}</p>
        <p className={cn("text-lg font-semibold", tone === "warning" ? "text-eoc-warning" : tone === "success" ? "text-eoc-success" : "text-eoc-fg")}>{value}</p>
      </div>
    </Surface>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[640px]">
      <thead>
        <tr className="text-left text-[11px] uppercase tracking-wide text-eoc-muted">
          {head.map((h, i) => (
            <th key={i} className={cn("pb-3 font-medium", i === head.length - 1 && "text-right")}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-3 pr-4 text-eoc-fg2", className)}>{children}</td>;
}
