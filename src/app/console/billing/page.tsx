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
import { costSeries, usageMetrics } from "@/lib/eoc/data";
import { useEocStore } from "@/lib/eoc/store";
import { formatCurrency, formatNumber } from "@/lib/eoc/format";
import { cn } from "@/lib/utils";

const invTone: Record<string, Tone> = { paid: "success", due: "info", overdue: "danger", processing: "warning" };
const subTone: Record<string, Tone> = { active: "success", trialing: "info", past_due: "danger", paused: "warning", canceled: "neutral" };
const txTone: Record<string, Tone> = { succeeded: "success", pending: "warning", failed: "danger" };

export default function BillingPage() {
  const [tab, setTab] = React.useState<"invoices" | "transactions" | "subscriptions">("invoices");
  const invoices = useEocStore((s) => s.invoices);
  const transactions = useEocStore((s) => s.transactions);
  const subscriptions = useEocStore((s) => s.subscriptions);
  const payInvoice = useEocStore((s) => s.payInvoice);

  const monthlySpend = subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.amount, 0) || 48250;
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + i.amount, 0);

  const handlePay = (id: string, number: string) => {
    payInvoice(id);
    toast.success(`${number} paid`, { description: "A receipt has been emailed to billing." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financial operations"
        title="Billing & Payments"
        description="Subscriptions, usage-based billing, invoices and payment activity — a premium, trustworthy financial control center."
        actions={
          <>
            <EButton variant="secondary" onClick={() => toast.success("Statement downloaded", { description: "Trailing 12 months exported as PDF." })}><Download className="h-4 w-4" /> Statements</EButton>
            <EButton variant="primary" onClick={() => toast.success("Payment method added", { description: "UPI / card saved to your wallet." })}><Plus className="h-4 w-4" /> Add payment method</EButton>
          </>
        }
      />

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
        <MiniStat icon={Wallet} label="Wallet balance" value={formatCurrency(1240000)} />
        <MiniStat icon={CreditCard} label="AI credits" value="318k" />
        <MiniStat label="Outstanding" value={formatCurrency(outstanding)} tone={outstanding > 0 ? "warning" : "success"} />
        <MiniStat label="Payment success" value="99.4%" tone="success" />
      </div>

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
                      <button onClick={() => toast.success(`${inv.number} downloaded`)} className="text-xs text-eoc-accent hover:text-eoc-fg">Download</button>
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
