

export interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  unidade: string;
  preco_unitario: number;
  estado: 'ativo' | 'inativo';
  created_at: string;
}

export interface ServicoFormData {
  nome: string;
  descricao: string;
  unidade: string;
  preco_unitario: number;
  estado: 'ativo' | 'inativo';
}

export async function getServicos(): Promise<Servico[]> {
  try {
    const res = await fetch('/api/servicos');
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data as Servico[]) ?? [];
  } catch {
    return [];
  }
}

export async function createServico(form: ServicoFormData): Promise<{ data: Servico | null; error: string | null }> {
  try {
    const res = await fetch('/api/servicos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        descricao: form.descricao || null,
        unidade: form.unidade,
        preco_unitario: form.preco_unitario,
        estado: form.estado,
      }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || 'Erro ao criar serviço.' };
    return { data: json.data as Servico, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Erro interno.' };
  }
}

export async function updateServico(id: string, form: ServicoFormData): Promise<{ data: Servico | null; error: string | null }> {
  try {
    const res = await fetch('/api/servicos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        nome: form.nome,
        descricao: form.descricao || null,
        unidade: form.unidade,
        preco_unitario: form.preco_unitario,
        estado: form.estado,
      }),
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || 'Erro ao actualizar serviço.' };
    return { data: json.data as Servico, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Erro interno.' };
  }
}

export async function deleteServico(id: string): Promise<{ error: string | null }> {
  try {
    const res = await fetch(`/api/servicos?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Erro ao eliminar serviço.' };
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Erro interno.' };
  }
}
