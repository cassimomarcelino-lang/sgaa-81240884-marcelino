'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus, Search, RefreshCw, Wrench, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Trash2, Edit3, X,
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  Servico, ServicoFormData,
  getServicos, createServico, updateServico, deleteServico,
} from '@/lib/supabase/servicos';

const PAGE_SIZE = 10;

const ESTADO_COLORS: Record<string, string> = {
  ativo: 'bg-green-100 text-green-700 border-green-200',
  inativo: 'bg-gray-100 text-gray-600 border-gray-200',
};

function formatCurrency(value: number): string {
  return `${value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

interface FormState {
  nome: string;
  descricao: string;
  unidade: string;
  preco_unitario: string;
  estado: 'ativo' | 'inativo';
}

const EMPTY_FORM: FormState = { nome: '', descricao: '', unidade: 'm³', preco_unitario: '', estado: 'ativo' };

function ServicoFormModal({
  open, editItem, saving, onSave, onClose,
}: {
  open: boolean;
  editItem: Servico | null;
  saving: boolean;
  onSave: (data: ServicoFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (editItem) {
      setForm({
        nome: editItem.nome,
        descricao: editItem.descricao ?? '',
        unidade: editItem.unidade,
        preco_unitario: String(editItem.preco_unitario),
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
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!form.unidade.trim()) errs.unidade = 'Unidade é obrigatória';
    const preco = parseFloat(form.preco_unitario);
    if (isNaN(preco) || preco < 0) errs.preco_unitario = 'Preço inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      unidade: form.unidade.trim(),
      preco_unitario: parseFloat(form.preco_unitario),
      estado: form.estado,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wrench size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{editItem ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          </div>
          <button onClick={onClose} disabled={saving} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome do Serviço <span className="text-red-500">*</span></label>
              <input type="text" value={form.nome} onChange={set('nome')} placeholder="Ex: Abastecimento Residencial" className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.nome ? 'border-red-400' : 'border-border'}`} />
              {errors.nome && <p className="mt-1 text-xs text-red-600">⚠ {errors.nome}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Unidade <span className="text-red-500">*</span></label>
                <input type="text" value={form.unidade} onChange={set('unidade')} placeholder="Ex: m³, litros, kg" className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.unidade ? 'border-red-400' : 'border-border'}`} />
                {errors.unidade && <p className="mt-1 text-xs text-red-600">⚠ {errors.unidade}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Preço Unitário (MT) <span className="text-red-500">*</span></label>
                <input type="number" min="0" step="0.01" value={form.preco_unitario} onChange={set('preco_unitario')} placeholder="Ex: 150.00" className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.preco_unitario ? 'border-red-400' : 'border-border'}`} />
                {errors.preco_unitario && <p className="mt-1 text-xs text-red-600">⚠ {errors.preco_unitario}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
              <select value={form.estado} onChange={set('estado')} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
                <option value="ativo">Activo</option>
                <option value="inativo">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Descrição</label>
              <textarea value={form.descricao} onChange={set('descricao')} rows={3} placeholder="Descrição opcional do serviço..." className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-border">
            <button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-60">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {editItem ? 'Guardar alterações' : 'Criar serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServicosManagementClient() {
  const [data, setData] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'nome' | 'unidade' | 'preco_unitario' | 'estado' | 'created_at'>('nome');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Servico | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setData(await getServicos());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.nome.toLowerCase().includes(q) ||
        (s.descricao ?? '').toLowerCase().includes(q) ||
        s.unidade.toLowerCase().includes(q)
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
  }, [data, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleSave = async (formData: ServicoFormData) => {
    setSaving(true);
    if (editTarget) {
      const { data: updated, error } = await updateServico(editTarget.id, formData);
      if (error) showToast(`Erro: ${error}`, 'error');
      else if (updated) {
        setData(prev => prev.map(s => s.id === updated.id ? updated : s));
        showToast('Serviço actualizado com sucesso');
      }
    } else {
      const { data: created, error } = await createServico(formData);
      if (error) showToast(`Erro: ${error}`, 'error');
      else if (created) {
        setData(prev => [created, ...prev]);
        showToast('Serviço criado com sucesso');
      }
    }
    setSaving(false);
    setCreateOpen(false);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteServico(deleteTarget);
    if (error) showToast(`Erro ao eliminar: ${error}`, 'error');
    else {
      setData(prev => prev.filter(s => s.id !== deleteTarget));
      showToast('Serviço eliminado com sucesso');
    }
    setDeleteTarget(null);
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronUp size={13} className="text-muted-foreground/40" />;
    return sortDir === 'asc' ? <ChevronUp size={13} className="text-primary" /> : <ChevronDown size={13} className="text-primary" />;
  };

  const deleteTargetName = data.find(s => s.id === deleteTarget)?.nome ?? '';

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
            <Wrench size={22} className="text-primary" />
            Serviços
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'A carregar...' : `${filtered.length} serviço(s) encontrado(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95">
            <Plus size={16} />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Pesquisar por nome, descrição ou unidade..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"><X size={15} /></button>}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {([
                  { key: 'nome', label: 'Nome do Serviço' },
                  { key: 'unidade', label: 'Unidade' },
                  { key: 'preco_unitario', label: 'Preço Unitário' },
                  { key: 'estado', label: 'Estado' },
                  { key: 'created_at', label: 'Registo' },
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
                        <Wrench size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Nenhum serviço encontrado</p>
                      <p className="text-sm text-muted-foreground">{search ? 'Tente ajustar a pesquisa.' : 'Registe o primeiro serviço para começar.'}</p>
                      {!search && (
                        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors mt-1">
                          <Plus size={16} /> Novo Serviço
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(servico => (
                  <tr key={servico.id} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{servico.nome}</p>
                      {servico.descricao && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{servico.descricao}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{servico.unidade}</td>
                    <td className="px-4 py-3 font-medium text-foreground tabular-nums">{formatCurrency(servico.preco_unitario)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[servico.estado]}`}>
                        {servico.estado === 'ativo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(servico.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditTarget(servico)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Editar">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(servico.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
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

      <ServicoFormModal
        open={createOpen || editTarget !== null}
        editItem={editTarget}
        saving={saving}
        onSave={handleSave}
        onClose={() => { setCreateOpen(false); setEditTarget(null); }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Eliminar Serviço"
        description={`Tem a certeza que deseja eliminar o serviço "${deleteTargetName}"? Esta acção não pode ser revertida.`}
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
