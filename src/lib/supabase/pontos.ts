export interface PontoAbastecimento {
  id: string;
  cliente_id: string;
  identificacao: string;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  tipo: 'residencial' | 'comercial' | 'institucional' | 'outro';
  estado: 'ativo' | 'inativo';
  created_at: string;
  clientes?: { nome: string; telefone: string } | null;
}

export interface PontoFormData {
  cliente_id: string;
  identificacao: string;
  endereco: string;
  bairro: string;
  cidade: string;
  tipo: 'residencial' | 'comercial' | 'institucional' | 'outro';
  estado: 'ativo' | 'inativo';
}

export async function getPontos(): Promise<PontoAbastecimento[]> {
  const res = await fetch('/api/pontos');
  if (!res.ok) return [];
  const { data } = await res.json();
  return data || [];
}

export async function createPonto(form: PontoFormData): Promise<{ data: PontoAbastecimento | null; error: string | null }> {
  const res = await fetch('/api/pontos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error || 'Erro ao criar ponto.' };
  return { data: json.data, error: null };
}

export async function updatePonto(id: string, form: PontoFormData): Promise<{ data: PontoAbastecimento | null; error: string | null }> {
  const res = await fetch('/api/pontos', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...form }),
  });
  const json = await res.json();
  if (!res.ok) return { data: null, error: json.error || 'Erro ao atualizar ponto.' };
  return { data: json.data, error: null };
}

export async function deletePonto(id: string): Promise<{ error: string | null }> {
  const res = await fetch(`/api/pontos?id=${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) return { error: json.error || 'Erro ao eliminar ponto.' };
  return { error: null };
}
