'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { id: 'week-1', semana: 'S28', receita: 298400 },
  { id: 'week-2', semana: 'S29', receita: 341200 },
  { id: 'week-3', semana: 'S30', receita: 287600 },
  { id: 'week-4', semana: 'S31', receita: 412800 },
  { id: 'week-5', semana: 'S32', receita: 378900 },
  { id: 'week-6', semana: 'S33', receita: 445200 },
  { id: 'week-7', semana: 'S34', receita: 391700 },
  { id: 'week-8', semana: 'S35', receita: 491950 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground tabular-nums">
          {payload[0].value.toLocaleString('pt-MZ')} MT
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="semana"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="receita"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 5, fill: 'var(--primary)', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}