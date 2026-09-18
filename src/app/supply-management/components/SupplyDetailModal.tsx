'use client';

import React from 'react';
import { X, Edit3, Droplets, MapPin, Wrench, User, Calendar, Hash } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { Abastecimento, AbastecimentoEstado } from '@/lib/supabase/abastecimentos';

const ESTADO_LABELS: Record<AbastecimentoEstado, string> = {
  solicitado: 'Solicitado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

interface Props {
  item: Abastecimento;
  onClose: () => void;
  onEdit: (item: Abastecimento) => void;
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function SupplyDetailModal({ item, onClose, onEdit }: Props) {
  const clienteNome = item.clientes?.nome ?? '—';
  const pontoIdentificacao = item.pontos_abastecimento?.identificacao ?? '—';
  const pontoBairro = item.pontos_abastecimento?.bairro ?? '';
  const servicoNome = item.servicos?.nome ?? '—';
  const servicoUnidade = item.servicos?.unidade ?? '';
  const funcionarioNome = item.user_profiles?.nome ?? '—';
  const estadoLabel = ESTADO_LABELS[item.estado] ?? item.estado;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplets size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Detalhe do Abastecimento</h2>
              <p className="text-xs text-muted-foreground font-mono">{item.id.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <Edit3 size={13} /> Editar
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status + Subtotal hero */}
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado actual</p>
              <StatusBadge status={estadoLabel} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{item.subtotal.toLocaleString('pt-MZ')} <span className="text-base font-medium text-muted-foreground">MT</span></p>
            </div>
          </div>

          {/* Client + Point */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Localização</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                <User size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium text-foreground truncate">{clienteNome}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Ponto</p>
                  <p className="text-sm font-medium text-foreground font-mono">{pontoIdentificacao}</p>
                  {pontoBairro && <p className="text-xs text-muted-foreground">{pontoBairro}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Service details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Serviço</h3>
            <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
              <Wrench size={15} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Serviço / Plano</p>
                <p className="text-sm font-medium text-foreground">{servicoNome}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Quantidade</p>
                <p className="text-base font-bold text-foreground tabular-nums">{item.quantidade}</p>
                <p className="text-xs text-muted-foreground">{servicoUnidade}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Preço Unit.</p>
                <p className="text-base font-bold text-foreground tabular-nums">{item.preco_unitario.toLocaleString('pt-MZ')}</p>
                <p className="text-xs text-muted-foreground">MT</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <p className="text-xs text-green-700 mb-1">Subtotal</p>
                <p className="text-base font-bold text-green-800 tabular-nums">{item.subtotal.toLocaleString('pt-MZ')}</p>
                <p className="text-xs text-green-700">MT</p>
              </div>
            </div>
          </div>

          {/* Date + Operator */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Registo</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                <Calendar size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium text-foreground tabular-nums">{formatDate(item.data_abastecimento)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                <User size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Funcionário</p>
                  <p className="text-sm font-medium text-foreground">{funcionarioNome}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ID reference */}
          <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-dashed border-border">
            <Hash size={13} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">Referência interna:</p>
            <p className="text-xs font-mono font-medium text-foreground">{item.id.toUpperCase()}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}