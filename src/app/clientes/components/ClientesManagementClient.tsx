'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, RefreshCw, Users, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, Edit3, X, Phone, Mail, MapPin, FileText, Filter, Calendar, Download, Eye, CheckCircle2,  } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ClienteFormModal from '@/app/clientes/components/ClienteFormModal';
import {
  Cliente, ClienteFormData,
  getClientes, createCliente, updateCliente, deleteCliente,
} from '@/lib/supabase/clientes';
import { createClient } from '@/lib/supabase/client';

type SortField = 'nome' | 'telefone' | 'email' | 'documento' | 'created_at';
type SortDir = 'asc' | 'desc';
type FilterEmail = 'all' | 'with' | 'without';
type FilterDoc = 'all' | 'with' | 'without';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function exportCSV(data: Cliente[]) {
  const headers = ['Nome', 'Telefone', 'Email', 'Documento/NUIT', 'Endereço', 'Data de Cadastro'];
  const rows = data.map(c => [
    c.nome,
    c.telefone,
    c.email ?? '',
    c.documento ?? '',
    c.endereco ?? '',
    formatDate(c.created_at),
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clientes_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ClientesManagementClient() {
  const [data, setData] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEmail, setFilterEmail] = useState<FilterEmail>('all');
  const [filterDoc, setFilterDoc] = useState<FilterDoc>('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cliente | null>(null);
  const [viewTarget, setViewTarget] = useState<Cliente | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success\' | \'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    let result = await getClientes();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel('clientes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => { loadData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const activeFilterCount = [
    filterEmail !== 'all',
    filterDoc !== 'all',
    !!filterDateFrom,
    !!filterDateTo,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterEmail('all');
    setFilterDoc('all');
    setFilterDateFrom('');
    setFilterDateTo('');
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.nome.toLowerCase().includes(q) ||
        c.telefone.toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.documento ?? '').toLowerCase().includes(q) ||
        (c.endereco ?? '').toLowerCase().includes(q)
      );
    }
    if (filterEmail === 'with') result = result.filter(c => !!c.email);
    if (filterEmail === 'without') result = result.filter(c => !c.email);
    if (filterDoc === 'with') result = result.filter(c => !!c.documento);
    if (filterDoc === 'without') result = result.filter(c => !c.documento);
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      result = result.filter(c => new Date(c.created_at) >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(c => new Date(c.created_at) <= to);
    }
    result.sort((a, b) => {
      const av = (a[sortField] ?? '').toString().toLowerCase();
      const bv = (b[sortField] ?? '').toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, filterEmail, filterDoc, filterDateFrom, filterDateTo, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const handleSave = async (formData: ClienteFormData) => {
    setSaving(true);
    if (editTarget) {
      const { data: updated, error } = await updateCliente(editTarget.id, formData);
      if (error) { showToast(`Erro: ${error}`, 'error'); }
      else if (updated) {
        setData(prev => prev.map(c => c.id === updated.id ? updated : c));
        showToast('Cliente actualizado com sucesso');
        if (viewTarget?.id === updated.id) setViewTarget(updated);
      }
    } else {
      const { data: created, error } = await createCliente(formData);
      if (error) { showToast(`Erro: ${error}`, 'error'); }
      else if (created) {
        setData(prev => [created, ...prev]);
        showToast('Cliente criado com sucesso');
      }
    }
    setSaving(false);
    setCreateOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteCliente(deleteTarget);
    if (error) showToast(`Erro ao eliminar: ${error}`, 'error');
    else {
      setData(prev => prev.filter(c => c.id !== deleteTarget));
      showToast('Cliente eliminado com sucesso');
      if (viewTarget?.id === deleteTarget) setViewTarget(null);
    }
    setDeleteTarget(null);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-muted-foreground/30" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const deleteTargetName = data.find(c => c.id === deleteTarget)?.nome ?? '';

  // KPI stats
  const stats = useMemo(() => ({
    total: data.length,
    withEmail: data.filter(c => !!c.email).length,
    withDoc: data.filter(c => !!c.documento).length,
    thisMonth: data.filter(c => {
      const d = new Date(c.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  }), [data]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-4 left-4 sm:left-auto sm:right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />}
          <span className="flex-1">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={18} className="text-primary" />
            </div>
            Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-0.5">
            Gestão completa de clientes — crie, edite, filtre e exporte
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            disabled={loading || filtered.length === 0}
            title="Exportar para CSV"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-40"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            title="Actualizar lista"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">Novo Cliente</span>
            <span className="xs:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
        {[
          { label: 'Total de Clientes', value: loading ? '—' : stats.total, icon: <Users size={16} />, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Com Email', value: loading ? '—' : stats.withEmail, icon: <Mail size={16} />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Com Documento', value: loading ? '—' : stats.withDoc, icon: <FileText size={16} />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Novos este Mês', value: loading ? '—' : stats.thisMonth, icon: <Calendar size={16} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((kpi, i) => (
          <div key={`kpi-${i}`} className="bg-card border border-border rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 flex items-center gap-2 sm:gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${kpi.bg} flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              <p className="text-lg sm:text-xl font-bold text-foreground tabular-nums">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone, email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-9 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors duration-150 ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary/10 border-primary/30 text-primary' :'bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Mail size={12} /> Email
              </label>
              <select
                value={filterEmail}
                onChange={e => { setFilterEmail(e.target.value as FilterEmail); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todos</option>
                <option value="with">Com email</option>
                <option value="without">Sem email</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <FileText size={12} /> Documento / NUIT
              </label>
              <select
                value={filterDoc}
                onChange={e => { setFilterDoc(e.target.value as FilterDoc); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todos</option>
                <option value="with">Com documento</option>
                <option value="without">Sem documento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Cadastro — De
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                <Calendar size={12} /> Cadastro — Até
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            {activeFilterCount > 0 && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors"
                >
                  <X size={13} /> Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            {loading ? 'A carregar...' : (
              filtered.length !== data.length
                ? `${filtered.length} de ${data.length} cliente(s) — filtros activos`
                : `${filtered.length} cliente(s) no total`
            )}
          </span>
          {(search || activeFilterCount > 0) && !loading && (
            <button onClick={() => { setSearch(''); clearFilters(); }} className="text-xs text-primary hover:underline">
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* Main content: Table + optional detail panel */}
      <div className={`flex gap-4 ${viewTarget ? 'items-start' : ''}`}>
        {/* Table */}
        <div className={`bg-card border border-border rounded-xl overflow-hidden flex-1 min-w-0 transition-all duration-300`}>
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {([
                    { key: 'nome', label: 'Nome' },
                    { key: 'telefone', label: 'Telefone', icon: <Phone size={11} /> },
                    { key: 'email', label: 'Email', icon: <Mail size={11} /> },
                    { key: 'documento', label: 'Doc. / NUIT', icon: <FileText size={11} /> },
                    { key: 'endereco', label: 'Endereço', icon: <MapPin size={11} />, sortable: false },
                    { key: 'created_at', label: 'Cadastro', icon: <Calendar size={11} /> },
                  ] as const).map(col => (
                    <th
                      key={`th-${col.key}`}
                      onClick={'sortable' in col && col.sortable === false ? undefined : () => handleSort(col.key as SortField)}
                      className={`px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${
                        'sortable' in col && col.sortable === false ? '' : 'cursor-pointer hover:text-foreground select-none'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {'icon' in col && col.icon && <span className="opacity-50">{col.icon}</span>}
                        {col.label}
                        {(!('sortable' in col) || col.sortable !== false) && <SortIcon field={col.key as SortField} />}
                      </div>
                    </th>
                  ))}
                  <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acções</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skel-${i}`} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={`skel-${i}-${j}`} className="px-3 sm:px-4 py-3.5">
                          <div className={`h-3.5 bg-muted rounded ${j === 0 ? 'w-4/5' : 'w-3/5'}`} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 sm:py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <Users size={26} className="text-muted-foreground/50" />
                        </div>
                        <p className="text-base font-semibold text-foreground">Nenhum cliente encontrado</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          {search || activeFilterCount > 0
                            ? 'Tente ajustar a pesquisa ou os filtros activos.' :'Registe o primeiro cliente para começar.'}
                        </p>
                        {!search && activeFilterCount === 0 && (
                          <button
                            onClick={() => setCreateOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-1"
                          >
                            <Plus size={16} /> Novo Cliente
                          </button>
                        )}
                        {(search || activeFilterCount > 0) && (
                          <button
                            onClick={() => { setSearch(''); clearFilters(); }}
                            className="text-sm text-primary hover:underline mt-1"
                          >
                            Limpar filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, idx) => {
                    const isViewing = viewTarget?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        className={`group transition-colors duration-100 cursor-pointer ${
                          isViewing
                            ? 'bg-primary/5 border-l-2 border-l-primary'
                            : idx % 2 !== 0 ? 'bg-muted/10 hover:bg-muted/30' : 'hover:bg-muted/20'
                        }`}
                        onClick={() => setViewTarget(isViewing ? null : row)}
                      >
                        <td className="px-3 sm:px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${
                              isViewing ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {row.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[160px]" title={row.nome}>{row.nome}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{row.telefone}</td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground max-w-[140px] sm:max-w-[160px]">
                          {row.email
                            ? <span className="truncate block text-xs" title={row.email}>{row.email}</span>
                            : <span className="text-muted-foreground/30 text-xs italic">—</span>
                          }
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                          {row.documento || <span className="text-muted-foreground/30 not-italic text-xs">—</span>}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground max-w-[140px] sm:max-w-[180px]">
                          <span className="truncate block text-xs" title={row.endereco ?? ''}>
                            {row.endereco || <span className="text-muted-foreground/30 text-xs italic">—</span>}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-muted-foreground whitespace-nowrap text-xs tabular-nums">
                          {formatDate(row.created_at)}
                        </td>
                        <td className="px-3 sm:px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(isViewing ? null : row)}
                              title="Ver detalhes"
                              className={`w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 active:scale-90 ${
                                isViewing
                                  ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-primary hover:bg-primary/10'
                              }`}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setEditTarget(row)}
                              title="Editar cliente"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-all duration-150 active:scale-90"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(row.id)}
                              title="Eliminar cliente"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-150 active:scale-90"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border bg-muted/20">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrar</span>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="px-2 py-1 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {PAGE_SIZE_OPTIONS.map(n => <option key={`ps-${n}`} value={n}>{n}</option>)}
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
                    <button key={`page-${p}`} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>{p}</button>
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

        {/* Detail Panel — sidebar on desktop, bottom sheet on mobile */}
        {viewTarget && (
          <>
            {/* Mobile overlay */}
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setViewTarget(null)}
            />
            {/* Panel */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:static lg:z-auto lg:w-72 lg:flex-shrink-0 bg-card border border-border rounded-t-2xl lg:rounded-xl overflow-hidden shadow-2xl lg:shadow-none max-h-[85vh] lg:max-h-none overflow-y-auto">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 sticky top-0">
                <span className="text-sm font-semibold text-foreground">Detalhes do Cliente</span>
                <button onClick={() => setViewTarget(null)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X size={15} />
                </button>
              </div>

              {/* Avatar + Name */}
              <div className="px-4 py-5 flex flex-col items-center text-center border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-3">
                  {viewTarget.nome.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-foreground text-base leading-tight">{viewTarget.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">Cadastrado em {formatDate(viewTarget.created_at)}</p>
              </div>

              {/* Fields */}
              <div className="px-4 py-4 space-y-3">
                <DetailRow icon={<Phone size={14} />} label="Telefone" value={viewTarget.telefone} />
                <DetailRow icon={<Mail size={14} />} label="Email" value={viewTarget.email} />
                <DetailRow icon={<FileText size={14} />} label="Documento / NUIT" value={viewTarget.documento} mono />
                <DetailRow icon={<MapPin size={14} />} label="Endereço" value={viewTarget.endereco} multiline />
              </div>

              {/* Panel Actions */}
              <div className="px-4 pb-6 lg:pb-4 pt-2 flex flex-col gap-2 border-t border-border mt-1">
                <button
                  onClick={() => { setEditTarget(viewTarget); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
                >
                  <Edit3 size={15} /> Editar Cliente
                </button>
                <button
                  onClick={() => setDeleteTarget(viewTarget.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-150 active:scale-95"
                >
                  <Trash2 size={15} /> Eliminar
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar cliente"
        description={`Tem a certeza que deseja eliminar "${deleteTargetName}"? Esta acção não pode ser desfeita e todos os dados associados serão afectados.`}
        confirmLabel="Sim, eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />

      <ClienteFormModal
        open={createOpen || !!editTarget}
        editItem={editTarget}
        saving={saving}
        onSave={handleSave}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
      />
    </div>
  );
}

function DetailRow({
  icon, label, value, mono = false, multiline = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {value ? (
          <p className={`text-sm text-foreground break-words ${mono ? 'font-mono' : 'font-medium'} ${multiline ? '' : 'truncate'}`}>
            {value}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/40 italic">Não informado</p>
        )}
      </div>
    </div>
  );
}
