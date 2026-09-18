'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });
const StatusChart = dynamic(() => import('./StatusChart'), { ssr: false });

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Receita Semanal</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Últimas 8 semanas — MT</p>
          </div>
          <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-lg font-medium">+8,4%</span>
        </div>
        <RevenueChart />
      </div>
      <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Abastecimentos por Estado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Período actual</p>
          </div>
        </div>
        <StatusChart />
      </div>
    </div>
  );
}