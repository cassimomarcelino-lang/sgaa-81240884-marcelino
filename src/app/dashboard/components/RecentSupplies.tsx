'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { Droplets, ArrowRight } from 'lucide-react';
import { getRecentSupplies, type RecentSupply } from '@/lib/supabase/dashboard';

function formatMT(value: number): string {
  return value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MT';
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
}

function mapEstado(estado: string): 'Em andamento' | 'Concluído' | 'Solicitado' | 'Cancelado' {
  const map: Record<string, 'Em andamento' | 'Concluído' | 'Solicitado' | 'Cancelado'> = {
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    solicitado: 'Solicitado',
    cancelado: 'Cancelado',
  };
  return map[estado] ?? 'Solicitado';
}

export default function RecentSupplies() {
  const [supplies, setSupplies] = useState<RecentSupply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentSupplies(6)
      .then(setSupplies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-primary" />
          <h3 className="text-base font-semibold text-foreground">Abastecimentos Recentes</h3>
        </div>
        <Link href="/supply-management" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="w-16 h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : supplies.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nenhum abastecimento registado.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {supplies.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors duration-150 group">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Droplets size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.cliente}</p>
                <p className="text-xs text-muted-foreground truncate">{s.servico} · {s.funcionario}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-sm font-semibold text-foreground tabular-nums">{formatMT(s.subtotal)}</p>
                <p className="text-xs text-muted-foreground">{formatTime(s.data_abastecimento)}</p>
              </div>
              <StatusBadge status={mapEstado(s.estado)} size="sm" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}