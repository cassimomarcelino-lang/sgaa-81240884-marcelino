'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

interface FuncionarioFormData {
  nome: string;
  email: string;
  password: string;
  tipo: 'administrador' | 'funcionario';
}

interface Props {
  open: boolean;
  saving: boolean;
  onSave: (data: FuncionarioFormData) => void;
  onClose: () => void;
}

const EMPTY: FuncionarioFormData = { nome: '', email: '', password: '', tipo: 'funcionario' };

export default function FuncionarioFormModal({ open, saving, onSave, onClose }: Props) {
  const [form, setForm] = React.useState<FuncionarioFormData>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FuncionarioFormData, string>>>({});
  const [showPassword, setShowPassword] = React.useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setErrors({});
      setShowPassword(false);
    }
  }, [open]);

  const set = (field: keyof FuncionarioFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FuncionarioFormData, string>> = {};
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório';
    if (!form.email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.password) errs.password = 'Senha é obrigatória';
    else if (form.password.length < 6) errs.password = 'Senha deve ter pelo menos 6 caracteres';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, nome: form.nome.trim(), email: form.email.trim() });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus size={16} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Cadastrar Funcionário</h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
          >
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
                placeholder="Ex: Ana Maria Machava"
                className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.nome ? 'border-red-400' : 'border-border'}`}
              />
              {errors.nome && <p className="mt-1 text-xs text-red-600">⚠ {errors.nome}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="Ex: ana.machava@sgaa.co.mz"
                className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.email ? 'border-red-400' : 'border-border'}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">⚠ {errors.email}</p>}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full px-3 py-2.5 pr-10 text-sm bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.password ? 'border-red-400' : 'border-border'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">⚠ {errors.password}</p>}
            </div>

            {/* Tipo / Perfil */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Perfil de acesso
              </label>
              <select
                value={form.tipo}
                onChange={set('tipo')}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="funcionario">Funcionário</option>
                <option value="administrador">Administrador</option>
              </select>
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
              <UserPlus size={15} />
              Cadastrar funcionário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
