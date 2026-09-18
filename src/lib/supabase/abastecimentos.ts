export type AbastecimentoEstado = 'solicitado' | 'em_andamento' | 'concluido' | 'cancelado';

export interface Abastecimento {
  id: string;
  cliente_id: string;
  ponto_id: string;
  servico_id: string;
  usuario_id: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  data_abastecimento: string;
  estado: AbastecimentoEstado;
  clientes?: { nome: string; telefone: string } | null;
  pontos_abastecimento?: { identificacao: string; bairro: string | null } | null;
  servicos?: { nome: string; unidade: string } | null;
  user_profiles?: { nome: string } | null;
}

export interface AbastecimentoFormData {
  cliente_id: string;
  ponto_id: string;
  servico_id: string;
  quantidade: number;
  preco_unitario: number;
  data_abastecimento: string;
  estado: AbastecimentoEstado;
}

export async function getAbastecimentos(): Promise<Abastecimento[]> {
  try {
    const res = await fetch('/api/abastecimentos', { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || json.error) return [];
    return json.data as Abastecimento[];
  } catch {
    return [];
  }
}

export async function createAbastecimento(form: AbastecimentoFormData): Promise<{ data: Abastecimento | null; error: string | null }> {
  try {
    const res = await fetch('/api/abastecimentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok || json.error) return { data: null, error: json.error || 'Erro ao criar abastecimento.' };
    return { data: json.data as Abastecimento, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Erro interno.' };
  }
}

export async function updateAbastecimento(id: string, form: Partial<AbastecimentoFormData>): Promise<{ data: Abastecimento | null; error: string | null }> {
  try {
    const res = await fetch('/api/abastecimentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form }),
    });
    const json = await res.json();
    if (!res.ok || json.error) return { data: null, error: json.error || 'Erro ao atualizar abastecimento.' };
    return { data: json.data as Abastecimento, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Erro interno.' };
  }
}

export async function updateAbastecimentoEstado(id: string, estado: AbastecimentoEstado): Promise<{ error: string | null }> {
  try {
    const res = await fetch('/api/abastecimentos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado }),
    });
    const json = await res.json();
    if (!res.ok || json.error) return { error: json.error || 'Erro ao atualizar estado.' };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Erro interno.' };
  }
}

export async function deleteAbastecimento(id: string): Promise<{ error: string | null }> {
  try {
    const res = await fetch(`/api/abastecimentos?id=${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || json.error) return { error: json.error || 'Erro ao eliminar abastecimento.' };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Erro interno.' };
  }
}
