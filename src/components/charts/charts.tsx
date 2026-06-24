"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/status";
import { titleCase } from "@/lib/utils";

const AXIS = { stroke: "hsl(var(--muted-foreground))", fontSize: 11 };
const GRID = "hsl(var(--border))";

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-floating">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-foreground">{label}</p>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill }}
          />
          <span className="capitalize">{titleCase(p.name)}:</span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number"
              ? p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AreaTrend({
  data,
  keys,
  height = 280,
  labels,
}: {
  data: Record<string, number | string>[];
  keys: string[];
  height?: number;
  labels?: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <defs>
          {keys.map((k, i) => (
            <linearGradient key={k} id={`area-${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[i]} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<TooltipBox />} />
        {keys.map((k, i) => (
          <Area
            key={k}
            type="monotone"
            dataKey={k}
            name={labels?.[i] ?? k}
            stroke={CHART_COLORS[i]}
            strokeWidth={2}
            fill={`url(#area-${k})`}
            isAnimationActive
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({
  data,
  dataKey,
  height = 280,
  color = CHART_COLORS[0],
  horizontal = false,
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  height?: number;
  color?: string;
  horizontal?: boolean;
}) {
  const key = dataKey ?? "value";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ left: horizontal ? 8 : -18, right: 8, top: 8 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={GRID}
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} />
          </>
        )}
        <Tooltip content={<TooltipBox />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey={key} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={42}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MultiBar({
  data,
  height = 280,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<TooltipBox />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 260,
  innerRadius = 62,
}: {
  data: { label: string; value: number }[];
  height?: number;
  innerRadius?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 28}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<TooltipBox />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(v) => (
            <span className="text-xs capitalize text-muted-foreground">
              {titleCase(String(v))}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  keys,
  height = 280,
  labels,
}: {
  data: Record<string, number | string>[];
  keys: string[];
  height?: number;
  labels?: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={<TooltipBox />} />
        {keys.map((k, i) => (
          <Line
            key={k}
            type="monotone"
            dataKey={k}
            name={labels?.[i] ?? k}
            stroke={CHART_COLORS[i]}
            strokeWidth={2}
            dot={false}
            isAnimationActive
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
