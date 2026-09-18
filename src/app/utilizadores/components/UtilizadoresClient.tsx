'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserCog, RefreshCw, Shield, User, Mail, Calendar, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import FuncionarioFormModal from './FuncionarioFormModal';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  tipo: 'administrador' | 'funcionario';
  estado: 'ativo' | 'inativo';
  created_at: string;
}

const TIPO_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  funcionario: 'Funcionário',
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

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function UtilizadoresClient() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/utilizadores');
      const json = await res.json();
      if (!res.ok || json.error) {
        console.error('Erro ao carregar utilizadores:', json.error);
      } else {
        setUsers(json as UserProfile[]);
      }
    } catch (err) {
      console.error('Erro de rede ao carregar utilizadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleRegister = async (formData: { nome: string; email: string; password: string; tipo: 'administrador' | 'funcionario' }) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/register-funcionario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        showToast('error', json.error || 'Erro ao cadastrar funcionário.');
      } else {
        showToast('success', `Funcionário "${formData.nome}" cadastrado com sucesso!`);
        setModalOpen(false);
        await loadUsers();
      }
    } catch {
      showToast('error', 'Erro de rede. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} className="flex-shrink-0" /> : <AlertCircle size={16} className="flex-shrink-0" />}
          <span className="flex-1">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <UserCog size={22} className="text-primary" />
            Utilizadores
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? 'A carregar...' : `${users.length} utilizador(es) registado(s)`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all duration-150 active:scale-95"
          >
            <UserPlus size={15} />
            <span className="hidden sm:inline">Cadastrar Funcionário</span>
            <span className="sm:hidden">Cadastrar</span>
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Utilizador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <div className="flex items-center gap-1.5"><Mail size={12} />Email</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <div className="flex items-center gap-1.5"><Shield size={12} />Perfil</div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <div className="flex items-center gap-1.5"><Calendar size={12} />Registo</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <UserCog size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground">Nenhum utilizador encontrado</p>
                      <p className="text-sm text-muted-foreground">Cadastre o primeiro funcionário usando o botão acima.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors duration-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{user.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${user.tipo === 'administrador' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'}`}>
                        <Shield size={10} />
                        {TIPO_LABELS[user.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ESTADO_COLORS[user.estado]}`}>
                        {user.estado === 'ativo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(user.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Nota:</span> Para que o cadastro de funcionários funcione sem confirmação de email, adicione a variável <code className="text-xs bg-muted px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> nas configurações de ambiente.
        </p>
      </div>

      <FuncionarioFormModal
        open={modalOpen}
        saving={saving}
        onSave={handleRegister}
        onClose={() => !saving && setModalOpen(false)}
      />
    </div>
  );
}
