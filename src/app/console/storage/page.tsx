"use client";

import * as React from "react";
import { Database, FileText, HardDrive, Image, Archive, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EButton } from "@/components/eoc/page-header";
import { IconTile, ProgressBar, ScoreRing, SectionHeader, Surface } from "@/components/eoc/primitives";
import { AreaTrend, DonutChart } from "@/components/eoc/charts";
import { Modal, Field, SelectInput } from "@/components/eoc/modal";
import { useEocStore } from "@/lib/eoc/store";

const buckets = [
  { name: "Documents", icon: FileText, size: "1.4 TB", pct: 33, accent: "#4F7CFF" },
  { name: "Media", icon: Image, size: "1.1 TB", pct: 26, accent: "#A855F7" },
  { name: "Backups", icon: Archive, size: "920 GB", pct: 21, accent: "#22C55E" },
  { name: "Knowledge", icon: BookOpen, size: "480 GB", pct: 11, accent: "#F59E0B" },
  { name: "App Assets", icon: Database, size: "380 GB", pct: 9, accent: "#3B82F6" },
];

const donut = buckets.map((b) => ({ name: b.name, value: b.pct, color: b.accent }));

const growth = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  cost: 2.4 + i * 0.16 + Math.random() * 0.1,
}));

export default function StoragePage() {
  const storageTotalTb = useEocStore((s) => s.storageTotalTb);
  const storageAdditions = useEocStore((s) => s.storageAdditions);
  const addStorageCapacity = useEocStore((s) => s.addStorageCapacity);

  const usedTb = 4.2;
  const usedPct = Math.min(100, Math.round((usedTb / storageTotalTb) * 100));

  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("1");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tb = Number(amount);
    if (!tb || tb <= 0) {
      toast.error("Select a valid capacity amount");
      return;
    }
    addStorageCapacity(tb);
    toast.success("Capacity added", { description: `${tb} TB provisioned to your workspace.` });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Enterprise storage"
        title="Storage"
        description="Documents, media, backups and knowledge files with encryption, retention policies and forecasting."
        actions={<EButton variant="secondary" onClick={() => toast.info("Retention policies", { description: "Lifecycle and retention rules per bucket." })}><HardDrive className="h-4 w-4" /> Retention policies</EButton>}
      />

      <Modal open={open} onOpenChange={setOpen} title="Add capacity" description="Provision additional storage for your workspace.">
        <form onSubmit={submit} className="space-y-4 p-5">
          <Field label="Additional capacity" htmlFor="cap-amt">
            <SelectInput id="cap-amt" value={amount} onChange={(e) => setAmount(e.target.value)}>
              <option value="1">1 TB</option>
              <option value="2">2 TB</option>
              <option value="5">5 TB</option>
              <option value="10">10 TB</option>
            </SelectInput>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <EButton type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</EButton>
            <EButton type="submit" variant="primary">Add capacity</EButton>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Surface className="flex items-center gap-5 p-6">
          <ScoreRing value={usedPct} label="Used" sub={`${usedTb} / ${storageTotalTb} TB`} color="#4F7CFF" />
          <div>
            <p className="text-sm font-semibold text-eoc-fg">Capacity</p>
            <p className="mt-1 text-xs text-eoc-fg2">Total provisioned: {storageTotalTb} TB</p>
            <EButton size="sm" variant="secondary" className="mt-3" onClick={() => setOpen(true)}>Add capacity</EButton>
          </div>
        </Surface>

        <Surface className="p-5 lg:col-span-2">
          <SectionHeader title="Storage breakdown" description="By category" />
          <div className="mt-2 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <DonutChart data={donut} height={180} />
            <div className="space-y-2.5">
              {buckets.map((b) => (
                <div key={b.name} className="flex items-center gap-3">
                  <IconTile icon={b.icon} accent={b.accent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-xs"><span className="text-eoc-fg">{b.name}</span><span className="text-eoc-muted">{b.size}</span></div>
                    <ProgressBar value={b.pct * 3} tone="info" className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>

      {storageAdditions.length > 0 && (
        <Surface className="p-5">
          <SectionHeader title="Capacity additions" description="Recently provisioned storage" />
          <ul className="mt-4 space-y-2">
            {storageAdditions.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl border border-eoc-border bg-white/[0.02] px-4 py-3 text-sm">
                <span className="font-medium text-eoc-fg">+{a.amount} TB</span>
                <span className="text-xs text-eoc-muted">Added {a.addedAt}</span>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      <Surface className="p-5">
        <SectionHeader title="Storage cost trend" description="Trailing 12 months (₹K/mo)" />
        <div className="mt-4"><AreaTrend data={growth} dataKey="cost" xKey="m" color="#22C55E" height={200} formatter={(v) => `₹${v.toFixed(1)}k`} /></div>
      </Surface>
    </div>
  );
}
