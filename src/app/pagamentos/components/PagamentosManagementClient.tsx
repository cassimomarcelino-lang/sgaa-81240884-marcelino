'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, CreditCard, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, X, CheckCircle, Clock, XCircle,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Pagamento,
  getPagamentos, updatePagamentoEstado,
} from '@/lib/supabase/pagamentos';
import { createClient } from '@/lib/supabase/client';

const PAGE_SIZE = 10;

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pago: { label: 'Pago', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={12} /> },
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-600 border-red-200', icon: <XCircle size={12} /> },
};

const METODO_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  mpesa: 'M-Pesa',
  emola: 'e-Mola',
  transferencia: 'Transferência',
  outro: 'Outro',
};

function formatCurrency(value: number): string {
  return `${value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function PagamentosManagementClient() {
  const [data, setData] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [sortField, setSortField] = useState<'data_pagamento' | 'valor' | 'estado' | 'metodo'>('data_pagamento');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; action: 'pago' | 'cancelado' } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setData(await getPagamentos());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time subscription for pagamentos table
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel('pagamentos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pagamentos' },
        () => { loadData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterEstado !== 'todos') result = result.filter(p => p.estado === filterEstado);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.clientes?.nome ?? '').toLowerCase().includes(q) ||
        (p.referencia ?? '').toLowerCase().includes(q) ||
        METODO_LABELS[p.metodo].toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = String(a[sortField] ?? '').toLowerCase();
      const bv = String(b[sortField] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, filterEstado, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleUpdateEstado = async () => {
    if (!confirmTarget) return;
    const { error } = await updatePagamentoEstado(confirmTarget.id, confirmTarget.action);
    if (error) showToast(`Erro: ${error}`, 'error');
    else {
      setData(prev => prev.map(p => p.id === confirmTarget.id ? { ...p, estado: confirmTarget.action } : p));
      showToast(`Pagamento marcado como ${confirmTarget.action === 'pago' ? 'pago' : 'cancelado'}`);
    }
    setConfirmTarget(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-primary" /> : <ChevronDown size={13} className="text-primary" />;
  };

  const totalPago = data.filter(p => p.estado === 'pago').reduce((s, p) => s + p.valor, 0);
  const totalPendente = data.filter(p => p.estado === 'pendente').reduce((s, p) => s + p.valor, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-4 left-4 sm:left-auto sm:right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium slide-up ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard size={22} className="text-primary" />
            Pagamentos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'A carregar...' : `${filtered.length} pagamento(s) encontrado(s)`}
          </p>
        </div>
        <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        {[
          { label: 'Total Recebido', value: formatCurrency(totalPago), color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
          { label: 'Total Pendente', value: formatCurrency(totalPendente), color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Total Pagamentos', value: String(data.length), color: 'text-primary', bg: 'bg-primary/5 border-primary/20' },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
            <p className={`text-xl font-bold mt-1 tabular-nums ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Pesquisar por cliente, referência ou método..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"><X size={15} /></button>}
        </div>
        <select value={filterEstado} onChange={e => { setFilterEstado(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
          <option value="todos">Todos os estados</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                {([
                  { key: 'valor', label: 'Valor' },
                  { key: 'metodo', label: 'Método' },
                  { key: 'data_pagamento', label: 'Data' },
                  { key: 'estado', label: 'Estado' },
                ] as const).map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-foreground select-none">
                    <div className="flex items-center gap-1.5">{col.label}<SortIcon field={col.key} /></div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Nenhum pagamento encontrado</p>
                      <p className="text-sm text-muted-foreground">{search || filterEstado !== 'todos' ? 'Tente ajustar os filtros.' : 'Os pagamentos aparecerão aqui após os abastecimentos.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(pag => {
                  const estado = ESTADO_CONFIG[pag.estado];
                  return (
                    <tr key={pag.id} className="hover:bg-muted/30 transition-colors duration-100">
                      <td className="px-4 py-3 font-medium text-foreground">{pag.clientes?.nome ?? '—'}</td>
                      <td className="px-4 py-3 font-semibold text-foreground tabular-nums">{formatCurrency(pag.valor)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{METODO_LABELS[pag.metodo]}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(pag.data_pagamento)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${estado.color}`}>
                          {estado.icon}{estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {pag.estado === 'pendente' && (
                            <>
                              <button onClick={() => setConfirmTarget({ id: pag.id, action: 'pago' })} className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors" title="Marcar como pago">
                                Confirmar
                              </button>
                              <button onClick={() => setConfirmTarget({ id: pag.id, action: 'cancelado' })} className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors" title="Cancelar pagamento">
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-foreground px-2">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmTarget !== null}
        title={confirmTarget?.action === 'pago' ? 'Confirmar Pagamento' : 'Cancelar Pagamento'}
        description={confirmTarget?.action === 'pago' ?'Tem a certeza que deseja marcar este pagamento como pago?' :'Tem a certeza que deseja cancelar este pagamento?'}
        confirmLabel={confirmTarget?.action === 'pago' ? 'Confirmar' : 'Cancelar Pagamento'}
        onConfirm={handleUpdateEstado}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
