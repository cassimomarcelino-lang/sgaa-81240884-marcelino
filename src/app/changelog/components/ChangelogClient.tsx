'use client';

import React from 'react';
import { History, CheckCircle2, Wrench, Database, Shield, Users, CreditCard, Droplets, MapPin, FileText } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'fix' | 'improvement';
  icon: React.ReactNode;
  items: string[];
}

const entries: ChangelogEntry[] = [
  {
    version: 'v1.8',
    date: 'Set 2026',
    title: 'Relatórios Avançados & Exportação PDF',
    description: 'Relatórios com gráficos interactivos e exportação completa em PDF.',
    type: 'feature',
    icon: <FileText size={18} />,
    items: [
      'Exportação de relatório completo em PDF com dados reais do sistema',
      'Gráficos de receita mensal (últimos 6 meses)',
      'Gráficos de abastecimentos por mês',
      'Distribuição de estados dos abastecimentos (gráfico circular)',
      'Top 5 clientes por número de abastecimentos',
      'Tabela de abastecimentos recentes no PDF',
      'Página de histórico de funcionalidades (changelog)',
    ],
  },
  {
    version: 'v1.7',
    date: 'Set 2026',
    title: 'Correcção de Relatórios e Utilizadores',
    description: 'Resolução de erros críticos na aba de relatórios e gestão de utilizadores.',
    type: 'fix',
    icon: <Wrench size={18} />,
    items: [
      'API de relatórios com service role key para contornar RLS',
      'Exibição correcta de todos os dados estatísticos na aba Relatórios',
      'API de utilizadores com service role key para listar todos os perfis',
      'Correcção do carregamento de trabalhadores na aba Utilizadores',
    ],
  },
  {
    version: 'v1.6',
    date: 'Set 2026',
    title: 'Correcção de Pagamentos',
    description: 'Actualização da aba de pagamentos para reconhecer dados registados.',
    type: 'fix',
    icon: <CreditCard size={18} />,
    items: [
      'API de pagamentos via server-side com service role key',
      'Correcção do reconhecimento de dados já registados',
      'Actualização de estado de pagamentos (pago/pendente)',
      'Mesma correcção aplicada a clientes, serviços, pontos e abastecimentos',
    ],
  },
  {
    version: 'v1.5',
    date: 'Set 2026',
    title: 'Políticas RLS e Segurança',
    description: 'Correcção forçada das políticas de segurança ao nível de linha.',
    type: 'fix',
    icon: <Shield size={18} />,
    items: [
      'Migração para corrigir políticas RLS em todas as tabelas',
      'Correcção específica da tabela clientes (force_fix_clientes_rls)',
      'Eliminação de recursão infinita nas políticas de segurança',
      'Acesso correcto para administradores e funcionários',
    ],
  },
  {
    version: 'v1.4',
    date: 'Set 2026',
    title: 'Gestão de Utilizadores',
    description: 'Sistema completo de gestão de utilizadores e funcionários.',
    type: 'feature',
    icon: <Users size={18} />,
    items: [
      'Listagem de todos os utilizadores do sistema',
      'Adição de novos funcionários com formulário dedicado',
      'API de registo de funcionários com validação',
      'Controlo de acesso por papel (Administrador / Funcionário)',
      'Perfis de utilizador com nome, email e papel',
    ],
  },
  {
    version: 'v1.3',
    date: 'Set 2026',
    title: 'Módulo de Pagamentos',
    description: 'Gestão completa de pagamentos e receitas.',
    type: 'feature',
    icon: <CreditCard size={18} />,
    items: [
      'Listagem de todos os pagamentos com estado',
      'Actualização de estado de pagamento (pendente → pago)',
      'Cálculo automático de receita total e pendente',
      'Filtros por estado de pagamento',
      'Integração com abastecimentos para geração automática de pagamentos',
    ],
  },
  {
    version: 'v1.2',
    date: 'Set 2026',
    title: 'Gestão de Abastecimentos',
    description: 'Sistema completo de registo e acompanhamento de abastecimentos.',
    type: 'feature',
    icon: <Droplets size={18} />,
    items: [
      'Registo de novos abastecimentos com formulário completo',
      'Associação de cliente, ponto de abastecimento e serviço',
      'Acompanhamento de estado (solicitado, em andamento, concluído, cancelado)',
      'Modal de detalhes do abastecimento',
      'Listagem com filtros e pesquisa',
      'Geração automática de pagamento ao concluir abastecimento',
    ],
  },
  {
    version: 'v1.1',
    date: 'Set 2026',
    title: 'Clientes, Pontos e Serviços',
    description: 'Módulos de gestão de entidades base do sistema.',
    type: 'feature',
    icon: <MapPin size={18} />,
    items: [
      'Gestão completa de clientes (CRUD)',
      'Gestão de pontos de abastecimento com localização',
      'Catálogo de serviços com unidade e preço',
      'Formulários modais para criação e edição',
      'Pesquisa e filtros em todas as listagens',
    ],
  },
  {
    version: 'v1.0',
    date: 'Set 2026',
    title: 'Fundação do Sistema SGAA',
    description: 'Lançamento inicial com autenticação, dashboard e base de dados.',
    type: 'feature',
    icon: <Database size={18} />,
    items: [
      'Autenticação com Supabase (login e registo)',
      'Dashboard com KPIs e gráficos de resumo',
      'Esquema completo da base de dados (sgaa_schema)',
      'Sidebar de navegação com controlo de acesso',
      'Layout responsivo para desktop e mobile',
      'Integração com Supabase para persistência de dados',
      'Contexto de autenticação global (AuthContext)',
    ],
  },
];

const typeConfig = {
  feature: { label: 'Nova Funcionalidade', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  fix: { label: 'Correcção', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  improvement: { label: 'Melhoria', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
};

export default function ChangelogClient() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <History size={22} className="text-primary" />
          Histórico de Funcionalidades
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Registo de todas as funcionalidades implementadas no sistema SGAA</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Versões', value: entries.length, color: 'text-primary' },
          { label: 'Funcionalidades', value: entries.filter(e => e.type === 'feature').length, color: 'text-blue-600' },
          { label: 'Correcções', value: entries.filter(e => e.type === 'fix').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-6">
          {entries.map((entry, idx) => {
            const tc = typeConfig[entry.type];
            return (
              <div key={idx} className="relative pl-14">
                {/* Dot */}
                <div className={`absolute left-4 top-5 w-4 h-4 rounded-full border-2 border-background ${tc.dot} shadow-sm`} />

                <div className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow duration-150">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        {entry.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-muted-foreground">{entry.version}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tc.color}`}>{tc.label}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mt-0.5">{entry.title}</h3>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.date}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{entry.description}</p>

                  <ul className="space-y-1.5">
                    {entry.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
