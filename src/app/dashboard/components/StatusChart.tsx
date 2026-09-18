'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const data = [
  { id: 'bar-solicitado', estado: 'Solicitado', total: 23, color: '#3b82f6' },
  { id: 'bar-andamento', estado: 'Em Andamento', total: 17, color: '#f59e0b' },
  { id: 'bar-concluido', estado: 'Concluído', total: 61, color: '#16a34a' },
  { id: 'bar-cancelado', estado: 'Cancelado', total: 8, color: '#ef4444' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground tabular-nums">{payload[0].value} abastecimentos</p>
      </div>
    );
  }
  return null;
};

export default function StatusChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={36}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="estado"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.id} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}