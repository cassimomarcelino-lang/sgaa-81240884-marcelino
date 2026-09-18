import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getDashboardStats() {
  const supabase = getSupabase();
  const [c, p, a, pg] = await Promise.all([
    supabase.from('clientes').select('id', { count: 'exact' }),
    supabase.from('pontos_abastecimento').select('id', { count: 'exact' }),
    supabase.from('abastecimentos').select('*', { count: 'exact' }),
    supabase.from('pagamentos').select('*', { count: 'exact' }),
  ]);
  
  const pagamentos = pg.data || [];
  const abastecimentos = a.data || [];

  return {
    totalClientes: c.count || 0,
    totalPontosAtivos: p.count || 0,
    totalAbastecimentos: a.count || 0,
    totalPagamentos: pg.count || 0,
    receitaTotal: pagamentos.reduce((s: any, x: any) => s + Number(x.valor || x.total || x.quantia || 0), 0),
    pagamentosPendentesCount: pagamentos.filter((x: any) => x.status === 'pendente').length,
    pagamentosPendentesValor: pagamentos.filter((x: any) => x.status === 'pendente').reduce((s: any, x: any) => s + Number(x.valor || 0), 0),
    abastecimentosConcluidos: abastecimentos.filter((x: any) => x.status === 'concluido' || x.status === 'Concluido').length,
  };
}

export async function getRecentSupplies(limit = 6) {
  const supabase = getSupabase();
  const { data } = await supabase.from('abastecimentos').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getPendingPayments() {
  const supabase = getSupabase();
  const { data } = await supabase.from('pagamentos').select('*').eq('status', 'pendente').limit(5);
  return data || [];
}

export async function getRecentPayments(limit = 5) {
  const supabase = getSupabase();
  const { data } = await supabase.from('pagamentos').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getDashboardCharts() {
  return { abastecimentosPorMes: [], receitaPorMes: [] };
}