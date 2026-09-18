

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  documento: string | null;
  endereco: string | null;
  created_at: string;
}

export interface ClienteFormData {
  nome: string;
  telefone: string;
  email: string;
  documento: string;
  endereco: string;
}

export async function getClientes(): Promise<Cliente[]> {
  try {
    const res = await fetch('/api/clientes', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      console.error('[getClientes] API error:', json.error);
      return [];
    }
    const json = await res.json();
    return (json.data ?? []) as Cliente[];
  } catch (err: any) {
    console.error('[getClientes] fetch error:', err);
    return [];
  }
}

export async function createCliente(form: ClienteFormData): Promise<{ data: Cliente | null; error: string | null }> {
  try {
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('[createCliente] API error:', json.error);
      return { data: null, error: json.error ?? 'Erro ao criar cliente.' };
    }
    return { data: json.data as Cliente, error: null };
  } catch (err: any) {
    console.error('[createCliente] fetch error:', err);
    return { data: null, error: err.message ?? 'Erro de rede.' };
  }
}

export async function updateCliente(id: string, form: ClienteFormData): Promise<{ data: Cliente | null; error: string | null }> {
  try {
    const res = await fetch('/api/clientes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...form }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('[updateCliente] API error:', json.error);
      return { data: null, error: json.error ?? 'Erro ao actualizar cliente.' };
    }
    return { data: json.data as Cliente, error: null };
  } catch (err: any) {
    console.error('[updateCliente] fetch error:', err);
    return { data: null, error: err.message ?? 'Erro de rede.' };
  }
}

export async function deleteCliente(id: string): Promise<{ error: string | null }> {
  try {
    const res = await fetch(`/api/clientes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('[deleteCliente] API error:', json.error);
      return { error: json.error ?? 'Erro ao eliminar cliente.' };
    }
    return { error: null };
  } catch (err: any) {
    console.error('[deleteCliente] fetch error:', err);
    return { error: err.message ?? 'Erro de rede.' };
  }
}
