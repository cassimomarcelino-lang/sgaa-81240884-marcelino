'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-card rounded-xl shadow-xl border border-border w-full max-w-md fade-in">
        <div className="flex items-start gap-4 p-6">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle size={20} className={variant === 'danger' ? 'text-red-600' : 'text-amber-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <button onClick={onCancel} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-150 active:scale-95 ${
              variant === 'danger' ?'bg-red-600 hover:bg-red-700' :'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}