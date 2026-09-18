'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, MapPin, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Trash2, Edit3, X, User,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  PontoAbastecimento, PontoFormData,
  getPontos, createPonto, updatePonto, deletePonto,
} from '@/lib/supabase/pontos';
import { getClientes, Cliente } from '@/lib/supabase/clientes';

const PAGE_SIZE = 10;

const TIPO_LABELS: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  institucional: 'Institucional',
  outro: 'Outro',
};

const ESTADO_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700 border-green-200',
  inativo: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

interface FormState {
  cliente_id: string;
  identificacao: string;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: 'residencial' | 'comercial' | 'institucional' | 'outro';
  estado: 'ativo' | 'inativo';
}

const EMPTY_FORM: FormState = {
  cliente_id: '',
  identificacao: '',
  endereco: '',
  bairro: '',
  cidade: '',
  tipo: 'residencial',
  estado: 'ativo',
};

function PontoFormModal({
  open, editItem, saving, clientes, onSave, onClose,
}: {
  open: boolean;
  editItem: PontoAbastecimento | null;
  saving: boolean;
  clientes: Cliente[];
  onSave: (data: PontoFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (editItem) {
      setForm({
        cliente_id: editItem.cliente_id,
        identificacao: editItem.identificacao,
        endereco: editItem.endereco ?? '',
        bairro: editItem.bairro ?? '',
        cidade: editItem.cidade ?? '',
        tipo: editItem.tipo,
        estado: editItem.estado,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editItem, open]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.cliente_id) errs.cliente_id = 'Seleccione um cliente';
    if (!form.identificacao.trim()) errs.identificacao = 'Identificação é obrigatória';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, identificacao: form.identificacao.trim(), endereco: form.endereco.trim(), bairro: form.bairro.trim(), cidade: form.cidade.trim() });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {editItem ? 'Editar Ponto' : 'Novo Ponto de Abastecimento'}
            </h2>
          </div>
          <button onClick={onClose} disabled={saving} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Cliente <span className="text-red-500">*</span></label>
              <select value={form.cliente_id} onChange={set('cliente_id')} className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.cliente_id ? 'border-red-400' : 'border-border'}`}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {errors.cliente_id && <p className="mt-1 text-xs text-red-600">⚠ {errors.cliente_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Identificação <span className="text-red-500">*</span></label>
              <input type="text" value={form.identificacao} onChange={set('identificacao')} placeholder="Ex: PA-001 / Casa Principal" className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.identificacao ? 'border-red-400' : 'border-border'}`} />
              {errors.identificacao && <p className="mt-1 text-xs text-red-600">⚠ {errors.identificacao}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                <select value={form.tipo} onChange={set('tipo')} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="institucional">Institucional</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
                <select value={form.estado} onChange={set('estado')} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                  <option value="ativo">Activo</option>
                  <option value="inativo">Inactivo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bairro</label>
                <input type="text" value={form.bairro} onChange={set('bairro')} placeholder="Ex: Bairro Central" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Cidade</label>
                <input type="text" value={form.cidade} onChange={set('cidade')} placeholder="Ex: Maputo" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Endereço</label>
              <textarea value={form.endereco} onChange={set('endereco')} rows={2} placeholder="Ex: Av. Eduardo Mondlane, nº 123" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-border">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-60">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Guardar alterações' : 'Criar ponto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PontosManagementClient() {
  const [data, setData] = useState<PontoAbastecimento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'identificacao' | 'tipo' | 'estado' | 'created_at'>('identificacao');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PontoAbastecimento | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const [pontos, clientesList] = await Promise.all([getPontos(), getClientes()]);
    setData(pontos);
    setClientes(clientesList);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.identificacao.toLowerCase().includes(q) ||
        (p.clientes?.nome ?? '').toLowerCase().includes(q) ||
        (p.bairro ?? '').toLowerCase().includes(q) ||
        (p.cidade ?? '').toLowerCase().includes(q) ||
        TIPO_LABELS[p.tipo].toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const av = (a[sortField] ?? '').toString().toLowerCase();
      const bv = (b[sortField] ?? '').toString().toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSave = async (formData: PontoFormData) => {
    setSaving(true);
    if (editTarget) {
      const { data: updated, error } = await updatePonto(editTarget.id, formData);
      if (error) showToast(`Erro: ${error}`, 'error');
      else if (updated) {
        setData(prev => prev.map(p => p.id === updated.id ? updated : p));
        showToast('Ponto actualizado com sucesso');
      }
    } else {
      const { data: created, error } = await createPonto(formData);
      if (error) showToast(`Erro: ${error}`, 'error');
      else if (created) {
        setData(prev => [created, ...prev]);
        showToast('Ponto criado com sucesso');
      }
    }
    setSaving(false);
    setCreateOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deletePonto(deleteTarget);
    if (error) showToast(`Erro ao eliminar: ${error}`, 'error');
    else {
      setData(prev => prev.filter(p => p.id !== deleteTarget));
      showToast('Ponto eliminado com sucesso');
    }
    setDeleteTarget(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-primary" /> : <ChevronDown size={13} className="text-primary" />;
  };

  const deleteTargetName = data.find(p => p.id === deleteTarget)?.identificacao ?? '';

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
            <MapPin size={22} className="text-primary" />
            Pontos de Abastecimento
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'A carregar...' : `${filtered.length} ponto(s) encontrado(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95">
            <Plus size={16} />
            <span>Novo Ponto</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Pesquisar por identificação, cliente, bairro ou cidade..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"><X size={15} /></button>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {([
                  { key: 'identificacao', label: 'Identificação' },
                  { key: 'cliente', label: 'Cliente', sortable: false },
                  { key: 'tipo', label: 'Tipo' },
                  { key: 'bairro', label: 'Bairro / Cidade', sortable: false },
                  { key: 'estado', label: 'Estado' },
                  { key: 'created_at', label: 'Registo' },
                ] as const).map(col => (
                  <th key={col.key} onClick={'sortable' in col && col.sortable === false ? undefined : () => handleSort(col.key as typeof sortField)} className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${'sortable' in col && col.sortable === false ? '' : 'cursor-pointer hover:text-foreground select-none'}`}>
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {(!('sortable' in col) || col.sortable !== false) && <SortIcon field={col.key as typeof sortField} />}
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <MapPin size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Nenhum ponto encontrado</p>
                      <p className="text-sm text-muted-foreground">{search ? 'Tente ajustar a pesquisa.' : 'Registe o primeiro ponto de abastecimento.'}</p>
                      {!search && (
                        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-1">
                          <Plus size={16} /> Novo Ponto
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(ponto => (
                  <tr key={ponto.id} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{ponto.identificacao}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-primary" />
                        </div>
                        <span className="text-foreground">{ponto.clientes?.nome ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{TIPO_LABELS[ponto.tipo]}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[ponto.bairro, ponto.cidade].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[ponto.estado]}`}>
                        {ponto.estado === 'ativo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(ponto.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditTarget(ponto)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Editar">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(ponto.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      <PontoFormModal
        open={createOpen || editTarget !== null}
        editItem={editTarget}
        saving={saving}
        clientes={clientes}
        onSave={handleSave}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Eliminar Ponto"
        description={`Tem a certeza que deseja eliminar o ponto "${deleteTargetName}"? Esta acção não pode ser revertida.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
