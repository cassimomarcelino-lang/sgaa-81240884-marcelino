import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [
      clientesRes,
      pontosRes,
      servicosRes,
      abastecimentosRes,
      pagamentosRes,
      pagamentosDataRes,
      abastConcRes,
      abastPendRes,
      abastAllRes,
      clientesListRes,
    ] = await Promise.all([
      supabase.from('clientes').select('*', { count: 'exact', head: true }),
      supabase.from('pontos_abastecimento').select('*', { count: 'exact', head: true }),
      supabase.from('servicos').select('*', { count: 'exact', head: true }),
      supabase.from('abastecimentos').select('*', { count: 'exact', head: true }),
      supabase.from('pagamentos').select('*', { count: 'exact', head: true }),
      supabase.from('pagamentos').select('valor, estado, created_at'),
      supabase.from('abastecimentos').select('*', { count: 'exact', head: true }).eq('estado', 'concluido'),
      supabase.from('abastecimentos').select('*', { count: 'exact', head: true }).in('estado', ['solicitado', 'em_andamento']),
      supabase.from('abastecimentos').select('id, estado, quantidade, preco_unitario, data_abastecimento, cliente_id, clientes(nome)').order('data_abastecimento', { ascending: false }),
      supabase.from('clientes').select('id, nome'),
    ]);

    const pagamentos = pagamentosDataRes.data ?? [];
    const receitaTotal = pagamentos.filter((p: any) => p.estado === 'pago').reduce((s: number, p: any) => s + (p.valor ?? 0), 0);
    const receitaPendente = pagamentos.filter((p: any) => p.estado === 'pendente').reduce((s: number, p: any) => s + (p.valor ?? 0), 0);

    // Monthly revenue breakdown (last 6 months)
    const now = new Date();
    const monthlyRevenue: { month: string; receita: number; pendente: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-MZ', { month: 'short', year: '2-digit' });
      const monthPagamentos = pagamentos.filter((p: any) => {
        const created = p.created_at ? p.created_at.substring(0, 7) : '';
        return created === monthKey;
      });
      monthlyRevenue.push({
        month: label,
        receita: monthPagamentos.filter((p: any) => p.estado === 'pago').reduce((s: number, p: any) => s + (p.valor ?? 0), 0),
        pendente: monthPagamentos.filter((p: any) => p.estado === 'pendente').reduce((s: number, p: any) => s + (p.valor ?? 0), 0),
      });
    }

    // Abastecimentos per month (last 6 months)
    const abastAll = abastAllRes.data ?? [];
    const monthlyAbast: { month: string; total: number; concluidos: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('pt-MZ', { month: 'short', year: '2-digit' });
      const monthAbast = abastAll.filter((a: any) => {
        const date = a.data_abastecimento ? a.data_abastecimento.substring(0, 7) : '';
        return date === monthKey;
      });
      monthlyAbast.push({
        month: label,
        total: monthAbast.length,
        concluidos: monthAbast.filter((a: any) => a.estado === 'concluido').length,
      });
    }

    // Top clients by abastecimentos count
    const clienteMap: Record<string, { nome: string; count: number; valor: number }> = {};
    for (const a of abastAll) {
      const cid = a.cliente_id;
      if (!cid) continue;
      const nome = (a.clientes as any)?.nome ?? 'Desconhecido';
      if (!clienteMap[cid]) clienteMap[cid] = { nome, count: 0, valor: 0 };
      clienteMap[cid].count += 1;
      clienteMap[cid].valor += (a.quantidade ?? 0) * (a.preco_unitario ?? 0);
    }
    const topClientes = Object.values(clienteMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Estado distribution
    const estadoDistribution = [
      { name: 'Concluído', value: abastConcRes.count ?? 0 },
      { name: 'Pendente', value: abastPendRes.count ?? 0 },
      { name: 'Cancelado', value: abastAll.filter((a: any) => a.estado === 'cancelado').length },
    ];

    // Recent abastecimentos for PDF table
    const recentAbastecimentos = abastAll.slice(0, 20).map((a: any) => ({
      cliente: (a.clientes as any)?.nome ?? '-',
      data: a.data_abastecimento ?? '-',
      quantidade: a.quantidade ?? 0,
      valor: (a.quantidade ?? 0) * (a.preco_unitario ?? 0),
      estado: a.estado ?? '-',
    }));

    return NextResponse.json({
      totalClientes: clientesRes.count ?? 0,
      totalPontos: pontosRes.count ?? 0,
      totalServicos: servicosRes.count ?? 0,
      totalAbastecimentos: abastecimentosRes.count ?? 0,
      totalPagamentos: pagamentosRes.count ?? 0,
      receitaTotal,
      receitaPendente,
      abastecimentosConcluidos: abastConcRes.count ?? 0,
      abastecimentosPendentes: abastPendRes.count ?? 0,
      monthlyRevenue,
      monthlyAbast,
      topClientes,
      estadoDistribution,
      recentAbastecimentos,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
