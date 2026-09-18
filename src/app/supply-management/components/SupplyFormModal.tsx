'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Loader2, Calculator, AlertCircle } from 'lucide-react';
import { getClientes, Cliente } from '@/lib/supabase/clientes';
import { getPontos, PontoAbastecimento } from '@/lib/supabase/pontos';
import { getServicos, Servico } from '@/lib/supabase/servicos';
import { Abastecimento, AbastecimentoEstado, createAbastecimento, updateAbastecimento } from '@/lib/supabase/abastecimentos';

interface Props {
  open: boolean;
  editItem: Abastecimento | null;
  onSave: (item: Abastecimento) => void;
  onClose: () => void;
}

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function SupplyFormModal({ open, editItem, onSave, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Real data from Supabase
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [allPontos, setAllPontos] = useState<PontoAbastecimento[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  // Form state
  const [clienteId, setClienteId] = useState('');
  const [pontoId, setPontoId] = useState('');
  const [servicoId, setServicoId] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [data, setData] = useState(todayISO());
  const [estado, setEstado] = useState<AbastecimentoEstado>('solicitado');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived
  const availablePontos = allPontos.filter(p => p.cliente_id === clienteId && p.estado === 'ativo');
  const selectedServico = servicos.find(s => s.id === servicoId);
  const precoUnitario = selectedServico?.preco_unitario ?? 0;
  const subtotal = precoUnitario * (Number(quantidade) || 0);

  const loadReferenceData = useCallback(async () => {
    setIsFetching(true);
    const [cls, pts, srvs] = await Promise.all([getClientes(), getPontos(), getServicos()]);
    setClientes(cls);
    setAllPontos(pts);
    setServicos(srvs.filter(s => s.estado === 'ativo'));
    setIsFetching(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadReferenceData();
      if (editItem) {
        setClienteId(editItem.cliente_id);
        setPontoId(editItem.ponto_id);
        setServicoId(editItem.servico_id);
        setQuantidade(editItem.quantidade);
        setData(editItem.data_abastecimento.slice(0, 10));
        setEstado(editItem.estado);
      } else {
        setClienteId('');
        setPontoId('');
        setServicoId('');
        setQuantidade('');
        setData(todayISO());
        setEstado('solicitado');
      }
      setErrors({});
    }
  }, [open, editItem, loadReferenceData]);

  // Reset ponto when cliente changes
  useEffect(() => {
    setPontoId('');
  }, [clienteId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!clienteId) errs.clienteId = 'Seleccione um cliente';
    if (!pontoId) errs.pontoId = 'Seleccione um ponto de abastecimento';
    if (!servicoId) errs.servicoId = 'Seleccione um serviço';
    if (!quantidade || Number(quantidade) <= 0) errs.quantidade = 'A quantidade deve ser maior que zero';
    if (!data) errs.data = 'A data é obrigatória';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    const formData = {
      cliente_id: clienteId,
      ponto_id: pontoId,
      servico_id: servicoId,
      quantidade: Number(quantidade),
      preco_unitario: precoUnitario,
      data_abastecimento: new Date(data).toISOString(),
      estado,
    };

    let result;
    if (editItem) {
      result = await updateAbastecimento(editItem.id, formData);
    } else {
      result = await createAbastecimento(formData);
    }

    setIsLoading(false);
    if (result.error) {
      setErrors({ submit: result.error });
      return;
    }
    if (result.data) onSave(result.data);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">
            {editItem ? 'Editar Abastecimento' : 'Registar Novo Abastecimento'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X size={20} />
          </button>
        </div>

        {isFetching ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">A carregar dados...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">
              {errors.submit && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} />
                  {errors.submit}
                </div>
              )}

              {/* Client + Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Cliente <span className="text-red-500">*</span>
                  </label>
                  {clientes.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                      <AlertCircle size={14} />
                      Nenhum cliente cadastrado. Cadastre clientes primeiro.
                    </div>
                  ) : (
                    <select
                      value={clienteId}
                      onChange={e => setClienteId(e.target.value)}
                      className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.clienteId ? 'border-red-400' : 'border-border'}`}
                    >
                      <option value="">— Seleccionar cliente —</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  )}
                  {errors.clienteId && <p className="mt-1 text-xs text-red-600">⚠ {errors.clienteId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Ponto de Abastecimento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pontoId}
                    onChange={e => setPontoId(e.target.value)}
                    disabled={!clienteId}
                    className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${errors.pontoId ? 'border-red-400' : 'border-border'}`}
                  >
                    <option value="">— Seleccionar ponto —</option>
                    {availablePontos.map(p => (
                      <option key={p.id} value={p.id}>{p.identificacao}{p.bairro ? ` · ${p.bairro}` : ''}</option>
                    ))}
                  </select>
                  {!clienteId && (
                    <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle size={12} /> Seleccione primeiro um cliente
                    </p>
                  )}
                  {clienteId && availablePontos.length === 0 && (
                    <p className="mt-1 text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle size={12} /> Este cliente não tem pontos de abastecimento activos
                    </p>
                  )}
                  {errors.pontoId && <p className="mt-1 text-xs text-red-600">⚠ {errors.pontoId}</p>}
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Serviço / Plano <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mb-1.5">Apenas serviços com estado Activo estão disponíveis</p>
                {servicos.length === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    <AlertCircle size={14} />
                    Nenhum serviço activo disponível. Cadastre serviços primeiro.
                  </div>
                ) : (
                  <select
                    value={servicoId}
                    onChange={e => setServicoId(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.servicoId ? 'border-red-400' : 'border-border'}`}
                  >
                    <option value="">— Seleccionar serviço —</option>
                    {servicos.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} · {s.preco_unitario.toLocaleString('pt-MZ')} MT/{s.unidade}</option>
                    ))}
                  </select>
                )}
                {errors.servicoId && <p className="mt-1 text-xs text-red-600">⚠ {errors.servicoId}</p>}
              </div>

              {/* Quantity + Subtotal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Quantidade <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="0"
                    value={quantidade}
                    onChange={e => setQuantidade(e.target.value === '' ? '' : Number(e.target.value))}
                    className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.quantidade ? 'border-red-400' : 'border-border'}`}
                  />
                  {errors.quantidade && <p className="mt-1 text-xs text-red-600">⚠ {errors.quantidade}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Preço Unitário (MT)</label>
                  <div className="px-3 py-2.5 text-sm bg-muted border border-border rounded-lg text-muted-foreground tabular-nums">
                    {precoUnitario > 0 ? precoUnitario.toLocaleString('pt-MZ') : '—'}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Preenchido automaticamente</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <span className="flex items-center gap-1"><Calculator size={14} /> Subtotal (MT)</span>
                  </label>
                  <div className={`px-3 py-2.5 text-sm border rounded-lg font-semibold tabular-nums transition-colors ${subtotal > 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-muted border-border text-muted-foreground'}`}>
                    {subtotal > 0 ? `${subtotal.toLocaleString('pt-MZ')} MT` : '—'}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Qtd × Preço unitário</p>
                </div>
              </div>

              {/* Date + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className={`w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${errors.data ? 'border-red-400' : 'border-border'}`}
                  />
                  {errors.data && <p className="mt-1 text-xs text-red-600">⚠ {errors.data}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Estado</label>
                  <select
                    value={estado}
                    onChange={e => setEstado(e.target.value as AbastecimentoEstado)}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  >
                    <option value="solicitado">Solicitado</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-muted/20 sticky bottom-0">
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">*</span> Campos obrigatórios
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-border rounded-lg transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] min-w-[140px] justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    editItem ? 'Guardar alterações' : 'Registar abastecimento'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}