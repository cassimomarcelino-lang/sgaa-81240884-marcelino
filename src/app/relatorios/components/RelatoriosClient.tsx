'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import {
  BarChart3, TrendingUp, Users, Droplets, CreditCard, RefreshCw,
  FileDown, MapPin, Wrench, CheckCircle2, Clock,
} from 'lucide-react';

interface Stats {
  totalClientes: number;
  totalPontos: number;
  totalServicos: number;
  totalAbastecimentos: number;
  totalPagamentos: number;
  receitaTotal: number;
  receitaPendente: number;
  abastecimentosConcluidos: number;
  abastecimentosPendentes: number;
  monthlyRevenue: { month: string; receita: number; pendente: number }[];
  monthlyAbast: { month: string; total: number; concluidos: number }[];
  topClientes: { nome: string; count: number; valor: number }[];
  estadoDistribution: { name: string; value: number }[];
  recentAbastecimentos: { cliente: string; data: string; quantidade: number; valor: number; estado: string }[];
}

function formatCurrency(value: number): string {
  return `${value.toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M MT`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K MT`;
  return `${value.toFixed(0)} MT`;
}

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

async function exportPDF(stats: Stats) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Helper ──────────────────────────────────────────────────────────────────
  const addHeader = (title: string) => {
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, pageW, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SGAA — Sistema de Gestão de Abastecimento de Água', 14, 7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(title, 14, 13);
    doc.text(dateStr, pageW - 14, 13, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = (pageNum: number, total: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Página ${pageNum} de ${total}`, pageW / 2, pageH - 8, { align: 'center' });
    doc.text('Gerado automaticamente pelo SGAA', 14, pageH - 8);
    doc.setTextColor(0, 0, 0);
  };

  // ── PAGE 1: Capa ─────────────────────────────────────────────────────────────
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageW, 80, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('SGAA', pageW / 2, 35, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestão de Abastecimento de Água', pageW / 2, 45, { align: 'center' });
  doc.setFontSize(11);
  doc.text('Relatório Completo do Sistema', pageW / 2, 55, { align: 'center' });
  doc.setFontSize(9);
  doc.text(dateStr, pageW / 2, 65, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 14, 95);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summary = [
    `Este relatório apresenta o estado actual do Sistema de Gestão de Abastecimento de Água (SGAA),`,
    `incluindo dados de clientes, abastecimentos, pagamentos e receitas. Os dados foram extraídos`,
    `directamente da base de dados em ${dateStr}.`,
  ];
  summary.forEach((line, i) => doc.text(line, 14, 103 + i * 6));

  // KPI boxes on cover
  const kpiData = [
    { label: 'Clientes', value: String(stats.totalClientes) },
    { label: 'Abastecimentos', value: String(stats.totalAbastecimentos) },
    { label: 'Receita Recebida', value: formatCurrencyShort(stats.receitaTotal) },
    { label: 'Receita Pendente', value: formatCurrencyShort(stats.receitaPendente) },
  ];
  const boxW = (pageW - 28 - 9) / 4;
  kpiData.forEach((k, i) => {
    const x = 14 + i * (boxW + 3);
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(15, 118, 110);
    doc.roundedRect(x, 125, boxW, 22, 2, 2, 'FD');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 118, 110);
    doc.text(k.value, x + boxW / 2, 135, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(k.label, x + boxW / 2, 142, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);

  // ── PAGE 2: Resumo Financeiro ─────────────────────────────────────────────────
  doc.addPage();
  addHeader('Resumo Financeiro');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 14, 28);

  autoTable(doc, {
    startY: 33,
    head: [['Indicador', 'Valor']],
    body: [
      ['Receita Total Recebida', formatCurrency(stats.receitaTotal)],
      ['Receita Pendente de Cobrança', formatCurrency(stats.receitaPendente)],
      ['Receita Total Projectada', formatCurrency(stats.receitaTotal + stats.receitaPendente)],
      ['Total de Pagamentos Registados', String(stats.totalPagamentos)],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  const afterFinancial = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Receita Mensal (Últimos 6 Meses)', 14, afterFinancial);

  autoTable(doc, {
    startY: afterFinancial + 5,
    head: [['Mês', 'Receita Recebida (MT)', 'Receita Pendente (MT)']],
    body: stats.monthlyRevenue.map(m => [
      m.month,
      formatCurrency(m.receita),
      formatCurrency(m.pendente),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
  });

  // ── PAGE 3: Abastecimentos ────────────────────────────────────────────────────
  doc.addPage();
  addHeader('Abastecimentos');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo de Abastecimentos', 14, 28);

  autoTable(doc, {
    startY: 33,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de Abastecimentos', String(stats.totalAbastecimentos)],
      ['Abastecimentos Concluídos', String(stats.abastecimentosConcluidos)],
      ['Abastecimentos Pendentes/Em Andamento', String(stats.abastecimentosPendentes)],
      ['Taxa de Conclusão', stats.totalAbastecimentos > 0 ? `${((stats.abastecimentosConcluidos / stats.totalAbastecimentos) * 100).toFixed(1)}%` : '0%'],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  const afterAbastSummary = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Abastecimentos por Mês (Últimos 6 Meses)', 14, afterAbastSummary);

  autoTable(doc, {
    startY: afterAbastSummary + 5,
    head: [['Mês', 'Total', 'Concluídos']],
    body: stats.monthlyAbast.map(m => [m.month, String(m.total), String(m.concluidos)]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
  });

  // ── PAGE 4: Clientes & Entidades ──────────────────────────────────────────────
  doc.addPage();
  addHeader('Clientes e Entidades');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Entidades do Sistema', 14, 28);

  autoTable(doc, {
    startY: 33,
    head: [['Entidade', 'Total Registado']],
    body: [
      ['Clientes', String(stats.totalClientes)],
      ['Pontos de Abastecimento', String(stats.totalPontos)],
      ['Serviços', String(stats.totalServicos)],
    ],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
  });

  const afterEntidades = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 5 Clientes por Abastecimentos', 14, afterEntidades);

  autoTable(doc, {
    startY: afterEntidades + 5,
    head: [['#', 'Cliente', 'Abastecimentos', 'Valor Total (MT)']],
    body: stats.topClientes.map((c, i) => [
      String(i + 1),
      c.nome,
      String(c.count),
      formatCurrency(c.valor),
    ]),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 2: { halign: 'center' }, 3: { halign: 'right' } },
  });

  // ── PAGE 5: Abastecimentos Recentes ───────────────────────────────────────────
  doc.addPage();
  addHeader('Abastecimentos Recentes');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Últimos 20 Abastecimentos', 14, 28);

  autoTable(doc, {
    startY: 33,
    head: [['Cliente', 'Data', 'Qtd.', 'Valor (MT)', 'Estado']],
    body: stats.recentAbastecimentos.map(a => [
      a.cliente,
      a.data,
      String(a.quantidade),
      formatCurrency(a.valor),
      a.estado,
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'center' },
    },
  });

  // ── Add footers ───────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addFooter(p, totalPages);
  }

  doc.save(`SGAA_Relatorio_${now.toISOString().slice(0, 10)}.pdf`);
}

export default function RelatoriosClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/relatorios');
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error || 'Erro ao carregar dados.');
      } else {
        setStats(json);
      }
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleExportPDF = async () => {
    if (!stats) return;
    setExporting(true);
    try {
      await exportPDF(stats);
    } catch (e) {
      console.error('PDF export error', e);
    } finally {
      setExporting(false);
    }
  };

  const kpis = stats ? [
    { label: 'Total de Clientes', value: String(stats.totalClientes), icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pontos de Abastecimento', value: String(stats.totalPontos), icon: <MapPin size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Serviços Registados', value: String(stats.totalServicos), icon: <Wrench size={18} />, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Total Abastecimentos', value: String(stats.totalAbastecimentos), icon: <Droplets size={18} />, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Concluídos', value: String(stats.abastecimentosConcluidos), icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
    { label: 'Pendentes', value: String(stats.abastecimentosPendentes), icon: <Clock size={18} />, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
    { label: 'Receita Recebida', value: formatCurrency(stats.receitaTotal), icon: <CreditCard size={18} />, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    { label: 'Receita Pendente', value: formatCurrency(stats.receitaPendente), icon: <TrendingUp size={18} />, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  ] : [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 size={22} className="text-primary" />
            Relatórios
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Resumo geral do sistema de abastecimento</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-150 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading || !stats || exporting}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-150 disabled:opacity-50"
          >
            <FileDown size={15} className={exporting ? 'animate-bounce' : ''} />
            <span>{exporting ? 'A gerar...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-3" />
              <div className="h-7 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {kpis.map(kpi => (
              <div key={kpi.label} className={`rounded-xl border p-4 ${kpi.bg}`}>
                <div className={`flex items-center gap-1.5 mb-1.5 ${kpi.color}`}>
                  {kpi.icon}
                  <p className="text-xs font-semibold uppercase tracking-wide leading-tight">{kpi.label}</p>
                </div>
                <p className={`text-xl font-bold tabular-nums ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Monthly Revenue */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Receita Mensal (Últimos 6 Meses)</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrencyShort} tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="receita" name="Recebida" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pendente" name="Pendente" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Abastecimentos */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-cyan-600" />
                <h2 className="text-sm font-semibold text-foreground">Abastecimentos por Mês</h2>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.monthlyAbast} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" name="Total" stroke="#0891b2" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="concluidos" name="Concluídos" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Estado Distribution */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Estado dos Abastecimentos</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.estadoDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.estadoDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Clients */}
            <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-foreground">Top 5 Clientes por Abastecimentos</h2>
              </div>
              {stats.topClientes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem dados disponíveis</p>
              ) : (
                <div className="space-y-3">
                  {stats.topClientes.map((c, i) => {
                    const maxCount = stats.topClientes[0]?.count || 1;
                    const pct = (c.count / maxCount) * 100;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-4 text-right">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground truncate">{c.nome}</span>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{c.count} abast.</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-green-600 w-24 text-right flex-shrink-0">
                          {formatCurrencyShort(c.valor)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Resumo Financeiro</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Receita Total Recebida', value: formatCurrency(stats.receitaTotal), color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Receita Pendente de Cobrança', value: formatCurrency(stats.receitaPendente), color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { label: 'Receita Total Projectada', value: formatCurrency(stats.receitaTotal + stats.receitaPendente), color: 'text-primary', bg: 'bg-primary/5' },
              ].map(row => (
                <div key={row.label} className={`rounded-lg p-4 ${row.bg}`}>
                  <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
                  <p className={`text-lg font-bold tabular-nums ${row.color}`}>{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
