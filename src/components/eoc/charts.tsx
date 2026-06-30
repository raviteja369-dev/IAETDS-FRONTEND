"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AXIS = { stroke: "#52525b", fontSize: 11 };
const GRID = "rgba(255,255,255,0.05)";

function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-eoc-border bg-eoc-elevated/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label != null && <p className="mb-1 font-medium text-eoc-fg2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-eoc-muted">{p.name}</span>
          <span className="ml-auto font-medium text-eoc-fg">
            {formatter ? formatter(p.value) : p.value?.toLocaleString?.() ?? p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AreaTrend({
  data,
  dataKey,
  xKey = "m",
  color = "#4F7CFF",
  height = 200,
  formatter,
}: {
  data: any[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  formatter?: (v: number) => string;
}) {
  const id = React.useId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id={`a-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS} />
        <YAxis tickLine={false} axisLine={false} tick={AXIS} width={48} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ stroke: GRID }} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#a-${id})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({
  data,
  lines,
  xKey = "t",
  height = 240,
  formatter,
}: {
  data: any[];
  lines: { key: string; color: string; name: string }[];
  xKey?: string;
  height?: number;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} tick={AXIS} width={48} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ stroke: GRID }} />
        {lines.map((l) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({
  data,
  bars,
  xKey = "m",
  height = 240,
  stacked,
  formatter,
}: {
  data: any[];
  bars: { key: string; color: string; name: string }[];
  xKey?: string;
  height?: number;
  stacked?: boolean;
  formatter?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barCategoryGap="28%">
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS} />
        <YAxis tickLine={false} axisLine={false} tick={AXIS} width={48} />
        <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        {bars.map((b) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name}
            stackId={stacked ? "s" : undefined}
            fill={b.color}
            radius={stacked ? [0, 0, 0, 0] : [5, 5, 0, 0]}
            maxBarSize={42}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  height = 200,
  inner = 58,
  outer = 86,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  inner?: number;
  outer?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={outer} paddingAngle={3} strokeWidth={0}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
