'use client';

import React, { useEffect } from 'react';
import { X, Loader2, User } from 'lucide-react';
import { Cliente, ClienteFormData } from '@/lib/supabase/clientes';

interface Props {
  open: boolean;
  editItem: Cliente | null;
  saving: boolean;
  onSave: (data: ClienteFormData) => void;
  onClose: () => void;
}

interface FormState {
  nome: string;
  telefone: string;
  email: string;
  documento: string;
  endereco: string;
}

const EMPTY: FormState = { nome: '', telefone: '', email: '', documento: '', endereco: '' };

export default function ClienteFormModal({ open, editItem, saving, onSave, onClose }: Props) {
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<FormState>>({});

  useEffect(() => {
    if (editItem) {
      setForm({
        nome: editItem.nome,
        telefone: editItem.telefone,
        email: editItem.email ?? '',
        documento: editItem.documento ?? '',
        endereco: editItem.endereco ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editItem, open]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!form.telefone.trim()) errs.telefone = 'Telefone é obrigatório';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ nome: form.nome.trim(), telefone: form.telefone.trim(), email: form.email.trim(), documento: form.documento.trim(), endereco: form.endereco.trim() });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {editItem ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
          </div>
          <button onClick={onClose} disabled={saving} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={set('nome')}
                placeholder="Ex: João Manuel Sitoe"
                className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.nome ? 'border-red-400' : 'border-border'}`}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-600">⚠ {errors.nome}</p>}
            </div>

            {/* Telefone + Documento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={set('telefone')}
                  placeholder="Ex: +258 84 000 0000"
                  className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.telefone ? 'border-red-400' : 'border-border'}`}
                />
                {errors.telefone && <p className="mt-1 text-xs text-red-600">⚠ {errors.telefone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Documento / NUIT
                </label>
                <input
                  type="text"
                  value={form.documento}
                  onChange={set('documento')}
                  placeholder="Ex: 123456789"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="Ex: joao.sitoe@email.com"
                className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.email ? 'border-red-400' : 'border-border'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">⚠ {errors.email}</p>}
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Endereço
              </label>
              <textarea
                value={form.endereco}
                onChange={set('endereco')}
                rows={3}
                placeholder="Ex: Av. Eduardo Mondlane, Bairro Central, Maputo"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {editItem ? 'Guardar alterações' : 'Criar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
