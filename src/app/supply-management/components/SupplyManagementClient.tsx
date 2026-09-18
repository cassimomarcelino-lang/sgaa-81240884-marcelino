'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Droplets, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, Edit3, Eye, X } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SupplyFormModal from '@/app/supply-management/components/SupplyFormModal';
import SupplyDetailModal from '@/app/supply-management/components/SupplyDetailModal';
import {
  Abastecimento,
  AbastecimentoEstado,
  getAbastecimentos,
  updateAbastecimentoEstado,
  deleteAbastecimento,
} from '@/lib/supabase/abastecimentos';
import { createClient } from '@/lib/supabase/client';

type SortField = 'cliente' | 'ponto' | 'servico' | 'quantidade' | 'subtotal' | 'data_abastecimento' | 'estado';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const ESTADO_LABELS: Record<AbastecimentoEstado, string> = {
  solicitado: 'Solicitado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const STATUS_OPTIONS: Array<AbastecimentoEstado | 'todos'> = ['todos', 'solicitado', 'em_andamento', 'concluido', 'cancelado'];

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function getClienteNome(row: Abastecimento): string {
  return row.clientes?.nome ?? '—';
}

function getPontoInfo(row: Abastecimento): string {
  return row.pontos_abastecimento?.identificacao ?? '—';
}

function getPontoBairro(row: Abastecimento): string {
  return row.pontos_abastecimento?.bairro ?? '';
}

function getServicoNome(row: Abastecimento): string {
  return row.servicos?.nome ?? '—';
}

function getServicoUnidade(row: Abastecimento): string {
  return row.servicos?.unidade ?? '';
}

export default function SupplyManagementClient() {
  const [data, setData] = useState<Abastecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AbastecimentoEstado | 'todos'>('todos');
  const [sortField, setSortField] = useState<SortField>('data_abastecimento');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Abastecimento | null>(null);
  const [detailTarget, setDetailTarget] = useState<Abastecimento | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setData(await getAbastecimentos());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time subscription for abastecimentos table
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel('abastecimentos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'abastecimentos' },
        () => { loadData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (statusFilter !== 'todos') result = result.filter(a => a.estado === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        getClienteNome(a).toLowerCase().includes(q) ||
        getPontoInfo(a).toLowerCase().includes(q) ||
        getServicoNome(a).toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortField === 'cliente') { av = getClienteNome(a); bv = getClienteNome(b); }
      else if (sortField === 'ponto') { av = getPontoInfo(a); bv = getPontoInfo(b); }
      else if (sortField === 'servico') { av = getServicoNome(a); bv = getServicoNome(b); }
      else if (sortField === 'quantidade') { av = a.quantidade; bv = b.quantidade; }
      else if (sortField === 'subtotal') { av = a.subtotal; bv = b.subtotal; }
      else if (sortField === 'data_abastecimento') { av = a.data_abastecimento; bv = b.data_abastecimento; }
      else if (sortField === 'estado') { av = a.estado; bv = b.estado; }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map(a => a.id)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteAbastecimento(id);
    if (error) showToast(`Erro: ${error}`, 'error');
    else {
      setData(prev => prev.filter(a => a.id !== id));
      showToast('Abastecimento eliminado com sucesso');
    }
    setDeleteTarget(null);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    let hasError = false;
    for (const id of ids) {
      const { error } = await deleteAbastecimento(id);
      if (error) { hasError = true; break; }
    }
    if (hasError) showToast('Erro ao eliminar alguns registos', 'error');
    else {
      setData(prev => prev.filter(a => !selectedIds.has(a.id)));
      showToast(`${ids.length} abastecimento(s) eliminado(s)`);
    }
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  const handleSave = (item: Abastecimento) => {
    if (editTarget) {
      setData(prev => prev.map(a => a.id === item.id ? item : a));
      showToast('Abastecimento actualizado com sucesso');
    } else {
      setData(prev => [item, ...prev]);
      showToast('Abastecimento registado com sucesso');
    }
    setCreateOpen(false);
    setEditTarget(null);
  };

  const handleStatusChange = async (id: string, newEstado: AbastecimentoEstado) => {
    const { error } = await updateAbastecimentoEstado(id, newEstado);
    if (error) showToast(`Erro: ${error}`, 'error');
    else {
      setData(prev => prev.map(a => a.id === id ? { ...a, estado: newEstado } : a));
      showToast(`Estado actualizado para "${ESTADO_LABELS[newEstado]}"`);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-primary" /> : <ChevronDown size={13} className="text-primary" />;
  };

  const clearFilters = () => { setSearch(''); setStatusFilter('todos'); setPage(1); };
  const hasActiveFilters = search || statusFilter !== 'todos';

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {toast && (
        <div className={`fixed top-5 right-4 left-4 sm:left-auto sm:right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium slide-up ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Droplets size={22} className="text-primary" />
            Abastecimentos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'A carregar...' : `${filtered.length} registo(s) encontrado(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
          >
            <Plus size={16} />
            <span>Novo Abastecimento</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, ponto ou serviço..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(s => (
              <button
                key={`filter-${s}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 ${
                  statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {s === 'todos' ? 'Todos' : ESTADO_LABELS[s]}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <X size={13} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="slide-up bg-primary text-primary-foreground rounded-xl px-4 sm:px-5 py-3 mb-4 flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{selectedIds.size} seleccionado(s)</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setBulkDeleteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
            >
              <Trash2 size={14} /> <span className="hidden sm:inline">Eliminar selecção</span>
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                </th>
                {([
                  { key: 'cliente', label: 'Cliente', sortable: true },
                  { key: 'ponto', label: 'Ponto', sortable: true },
                  { key: 'servico', label: 'Serviço', sortable: true },
                  { key: 'quantidade', label: 'Qtd.', sortable: true },
                  { key: 'subtotal', label: 'Subtotal (MT)', sortable: true },
                  { key: 'data_abastecimento', label: 'Data', sortable: true },
                  { key: 'estado', label: 'Estado', sortable: true },
                ] as const).map(col => (
                  <th
                    key={`th-${col.key}`}
                    className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-foreground select-none' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key as SortField) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon field={col.key as SortField} />}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Droplets size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Nenhum abastecimento encontrado</p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {hasActiveFilters ? 'Tente ajustar os filtros ou a pesquisa.' : 'Registe o primeiro abastecimento para começar.'}
                      </p>
                      {!hasActiveFilters && (
                        <button
                          onClick={() => setCreateOpen(true)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-1"
                        >
                          <Plus size={16} /> Registar Abastecimento
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`group hover:bg-muted/40 transition-colors duration-100 ${idx % 2 === 0 ? '' : 'bg-muted/10'} ${selectedIds.has(row.id) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="w-4 h-4 rounded border-border accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-[160px]">
                      <p className="truncate" title={getClienteNome(row)}>{getClienteNome(row)}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <span className="font-mono text-xs">{getPontoInfo(row)}</span>
                      {getPontoBairro(row) && <span className="text-xs text-muted-foreground/70 ml-1">· {getPontoBairro(row)}</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-[140px]">
                      <p className="truncate text-sm" title={getServicoNome(row)}>{getServicoNome(row)}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">{row.quantidade} {getServicoUnidade(row)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground whitespace-nowrap">
                      {row.subtotal.toLocaleString('pt-MZ')} MT
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {formatDate(row.data_abastecimento)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown
                        current={row.estado}
                        onChange={(s) => handleStatusChange(row.id, s)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <ActionButton
                          icon={<Eye size={15} />}
                          label="Ver detalhes"
                          onClick={() => setDetailTarget(row)}
                          color="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        />
                        <ActionButton
                          icon={<Edit3 size={15} />}
                          label="Editar abastecimento"
                          onClick={() => setEditTarget(row)}
                          color="text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                        />
                        <ActionButton
                          icon={<Trash2 size={15} />}
                          label="Eliminar"
                          onClick={() => setDeleteTarget(row.id)}
                          color="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrar</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PAGE_SIZE_OPTIONS.map(n => (
                  <option key={`ps-${n}`} value={n}>{n}</option>
                ))}
              </select>
              <span>por página · {filtered.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-muted transition-colors">«</button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={`page-${p}`}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors">
                <ChevronRight size={15} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed rounded-md hover:bg-muted transition-colors">»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar abastecimento"
        description="Tem a certeza que deseja eliminar este registo? Esta acção não pode ser desfeita."
        confirmLabel="Sim, eliminar"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
      <ConfirmModal
        open={bulkDeleteOpen}
        title={`Eliminar ${selectedIds.size} abastecimento(s)`}
        description="Os registos seleccionados serão eliminados permanentemente."
        confirmLabel={`Eliminar ${selectedIds.size} registos`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
        variant="danger"
      />
      {(createOpen || !!editTarget) && (
        <SupplyFormModal
          open={createOpen || !!editTarget}
          editItem={editTarget}
          onSave={handleSave}
          onClose={() => { setCreateOpen(false); setEditTarget(null); }}
        />
      )}
      {detailTarget && (
        <SupplyDetailModal
          item={detailTarget as any}
          onClose={() => setDetailTarget(null)}
          onEdit={(item: any) => { setDetailTarget(null); setEditTarget(item); }}
        />
      )}
    </div>
  );
}

function ActionButton({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 active:scale-90 ${color}`}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function StatusDropdown({ current, onChange }: { current: AbastecimentoEstado; onChange: (s: AbastecimentoEstado) => void }) {
  const [open, setOpen] = useState(false);
  const options: AbastecimentoEstado[] = ['solicitado', 'em_andamento', 'concluido', 'cancelado'];

  // Map to StatusBadge-compatible strings
  const statusMap: Record<AbastecimentoEstado, string> = {
    solicitado: 'Solicitado',
    em_andamento: 'Em andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="focus:outline-none">
        <StatusBadge status={statusMap[current]} size="sm" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[160px] fade-in">
            {options.map(opt => (
              <button
                key={`status-opt-${opt}`}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors ${opt === current ? 'bg-muted/60' : ''}`}
              >
                <StatusBadge status={statusMap[opt]} size="sm" />
                {opt === current && <span className="ml-auto text-primary text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}