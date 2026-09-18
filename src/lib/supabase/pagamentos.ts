export interface Pagamento {
  id: string;
  abastecimento_id: string;
  cliente_id: string;
  valor: number;
  metodo: 'dinheiro' | 'mpesa' | 'emola' | 'transferencia' | 'outro';
  referencia: string | null;
  data_pagamento: string;
  estado: 'pago' | 'pendente' | 'cancelado';
  clientes?: { nome: string; telefone: string } | null;
}

export interface PagamentoFormData {
  abastecimento_id: string;
  cliente_id: string;
  valor: number;
  metodo: 'dinheiro' | 'mpesa' | 'emola' | 'transferencia' | 'outro';
  referencia: string;
  data_pagamento: string;
  estado: 'pago' | 'pendente' | 'cancelado';
}

export async function getPagamentos(): Promise<Pagamento[]> {
  const res = await fetch('/api/pagamentos', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function updatePagamentoEstado(id: string, estado: 'pago' | 'pendente' | 'cancelado'): Promise<{ error: string | null }> {
  const res = await fetch('/api/pagamentos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, estado }),
  });
  if (!res.ok) {
    const data = await res.json();
    return { error: data.error ?? 'Erro ao actualizar pagamento' };
  }
  return { error: null };
}

export async function deletePagamento(id: string): Promise<{ error: string | null }> {
  const res = await fetch(`/api/pagamentos?id=${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json();
    return { error: data.error ?? 'Erro ao eliminar pagamento' };
  }
  return { error: null };
}
