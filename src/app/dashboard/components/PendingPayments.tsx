'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import { getPendingPayments, type PendingPayment } from '@/lib/supabase/dashboard';

function formatMT(value: number): string {
  return value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MT';
}

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function mapMetodo(metodo: string): string {
  const map: Record<string, string> = {
    mpesa: 'M-Pesa',
    emola: 'E-Mola',
    transferencia: 'Transferência',
    dinheiro: 'Dinheiro',
    outro: 'Outro',
  };
  return map[metodo] ?? metodo;
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPendente, setTotalPendente] = useState(0);

  useEffect(() => {
    getPendingPayments(6)
      .then(data => {
        setPayments(data);
        setTotalPendente(data.reduce((sum, p) => sum + p.valor, 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500" />
          <h3 className="text-base font-semibold text-foreground">Pagamentos Pendentes</h3>
          {!loading && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums">
              {payments.length}
            </span>
          )}
        </div>
        <Link href="/pagamentos" className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
          Gerir <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="w-20 h-4 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">
          Sem pagamentos pendentes.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {payments.map(p => {
            const dias = daysSince(p.data_pagamento);
            return (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors duration-150">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dias > 3 ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <CreditCard size={14} className={dias > 3 ? 'text-red-600' : 'text-amber-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.cliente}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.abastecimento_ref} · {mapMetodo(p.metodo)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-foreground tabular-nums">{formatMT(p.valor)}</p>
                  {dias > 0 ? (
                    <p className="text-xs text-red-600 font-medium">{dias}d atraso</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Hoje</p>
                  )}
                </div>
                <StatusBadge status="Pendente" size="sm" />
              </div>
            );
          })}
        </div>
      )}

      {!loading && payments.length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center justify-between">
          <span className="text-xs text-amber-700 font-medium">Total em aberto</span>
          <span className="text-sm font-bold text-amber-800 tabular-nums">{formatMT(totalPendente)}</span>
        </div>
      )}
    </div>
  );
}