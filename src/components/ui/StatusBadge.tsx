import React from 'react';

type StatusType =
  | 'Solicitado'
  | 'Em andamento' |'Concluído' |'Cancelado' |'Pago' |'Pendente' |'Ativo' |'Inativo';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const statusConfig: Record<StatusType, { className: string; dot: string }> = {
  'Solicitado': { className: 'status-solicitado', dot: 'bg-blue-500' },
  'Em andamento': { className: 'status-andamento', dot: 'bg-amber-500' },
  'Concluído': { className: 'status-concluido', dot: 'bg-green-600' },
  'Cancelado': { className: 'status-cancelado', dot: 'bg-red-600' },
  'Pago': { className: 'status-pago', dot: 'bg-green-600' },
  'Pendente': { className: 'status-pendente', dot: 'bg-amber-500' },
  'Ativo': { className: 'status-ativo', dot: 'bg-green-600' },
  'Inativo': { className: 'status-inativo', dot: 'bg-slate-400' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.className} ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {status}
    </span>
  );
}