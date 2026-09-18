import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardKPIs from '@/app/dashboard/components/DashboardKPIs';
import DashboardCharts from '@/app/dashboard/components/DashboardCharts';
import RecentSupplies from '@/app/dashboard/components/RecentSupplies';
import PendingPayments from '@/app/dashboard/components/PendingPayments';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-7">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visão geral operacional — 13 de Setembro de 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Sistema operacional</span>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Actualizado às 18:11</span>
          </div>
        </div>

        {/* KPIs */}
        <DashboardKPIs />

        {/* Charts */}
        <DashboardCharts />

        {/* Bottom panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <RecentSupplies />
          <PendingPayments />
        </div>
      </div>
    </AppLayout>
  );
}