'use client';

import React, { useState } from 'react';
import { GitBranch, Users, Layers, ArrowRightLeft, MessageSquare } from 'lucide-react';

type DiagramTab = 'usecase' | 'class' | 'sequence' | 'communication';

interface Tab {
  id: DiagramTab;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: Tab[] = [
  { id: 'usecase', label: 'Casos de Uso', icon: <Users size={16} />, description: 'Actores e funcionalidades do sistema SGAA' },
  { id: 'class', label: 'Classes', icon: <Layers size={16} />, description: 'Estrutura das entidades e relações do sistema' },
  { id: 'sequence', label: 'Sequência', icon: <ArrowRightLeft size={16} />, description: 'Fluxo de interacções entre componentes' },
  { id: 'communication', label: 'Comunicação', icon: <MessageSquare size={16} />, description: 'Colaboração entre objectos do sistema' },
];

/* ─── USE CASE DIAGRAM ─── */
function UseCaseDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 900 620" className="w-full min-w-[700px] h-auto" style={{ fontFamily: 'inherit' }}>
        {/* Background */}
        <rect width="900" height="620" fill="#f8fafc" rx="12" />

        {/* System boundary */}
        <rect x="160" y="40" width="580" height="540" rx="10" fill="white" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8,4" />
        <text x="450" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#64748b">Sistema SGAA</text>

        {/* ── Actors ── */}
        {/* Administrador */}
        <circle cx="60" cy="160" r="18" fill="none" stroke="#3b82f6" strokeWidth="2" />
        <line x1="60" y1="178" x2="60" y2="220" stroke="#3b82f6" strokeWidth="2" />
        <line x1="35" y1="195" x2="85" y2="195" stroke="#3b82f6" strokeWidth="2" />
        <line x1="60" y1="220" x2="40" y2="248" stroke="#3b82f6" strokeWidth="2" />
        <line x1="60" y1="220" x2="80" y2="248" stroke="#3b82f6" strokeWidth="2" />
        <text x="60" y="265" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1e40af">Administrador</text>

        {/* Funcionário */}
        <circle cx="60" cy="390" r="18" fill="none" stroke="#8b5cf6" strokeWidth="2" />
        <line x1="60" y1="408" x2="60" y2="450" stroke="#8b5cf6" strokeWidth="2" />
        <line x1="35" y1="425" x2="85" y2="425" stroke="#8b5cf6" strokeWidth="2" />
        <line x1="60" y1="450" x2="40" y2="478" stroke="#8b5cf6" strokeWidth="2" />
        <line x1="60" y1="450" x2="80" y2="478" stroke="#8b5cf6" strokeWidth="2" />
        <text x="60" y="495" textAnchor="middle" fontSize="11" fontWeight="600" fill="#6d28d9">Funcionário</text>

        {/* Cliente (external) */}
        <circle cx="840" cy="300" r="18" fill="none" stroke="#10b981" strokeWidth="2" />
        <line x1="840" y1="318" x2="840" y2="360" stroke="#10b981" strokeWidth="2" />
        <line x1="815" y1="335" x2="865" y2="335" stroke="#10b981" strokeWidth="2" />
        <line x1="840" y1="360" x2="820" y2="388" stroke="#10b981" strokeWidth="2" />
        <line x1="840" y1="360" x2="860" y2="388" stroke="#10b981" strokeWidth="2" />
        <text x="840" y="405" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065f46">Cliente</text>

        {/* ── Use Cases ── */}
        {/* Auth */}
        <ellipse cx="310" cy="100" rx="100" ry="26" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="310" y="104" textAnchor="middle" fontSize="11" fill="#1e40af">Autenticar no Sistema</text>

        {/* Gestão Utilizadores */}
        <ellipse cx="310" cy="175" rx="100" ry="26" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="310" y="179" textAnchor="middle" fontSize="11" fill="#1e40af">Gerir Utilizadores</text>

        {/* Gestão Clientes */}
        <ellipse cx="310" cy="260" rx="100" ry="26" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="310" y="264" textAnchor="middle" fontSize="11" fill="#6d28d9">Gerir Clientes</text>

        {/* Pontos Abastecimento */}
        <ellipse cx="310" cy="335" rx="110" ry="26" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="310" y="339" textAnchor="middle" fontSize="11" fill="#6d28d9">Gerir Pontos Abastecimento</text>

        {/* Serviços */}
        <ellipse cx="310" cy="410" rx="100" ry="26" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="310" y="414" textAnchor="middle" fontSize="11" fill="#6d28d9">Gerir Serviços</text>

        {/* Abastecimentos */}
        <ellipse cx="580" cy="175" rx="110" ry="26" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
        <text x="580" y="179" textAnchor="middle" fontSize="11" fill="#065f46">Registar Abastecimento</text>

        {/* Pagamentos */}
        <ellipse cx="580" cy="260" rx="110" ry="26" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
        <text x="580" y="264" textAnchor="middle" fontSize="11" fill="#065f46">Registar Pagamento</text>

        {/* Relatórios */}
        <ellipse cx="580" cy="345" rx="110" ry="26" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="580" y="349" textAnchor="middle" fontSize="11" fill="#92400e">Gerar Relatórios PDF</text>

        {/* Consultar Histórico */}
        <ellipse cx="580" cy="430" rx="110" ry="26" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
        <text x="580" y="434" textAnchor="middle" fontSize="11" fill="#92400e">Consultar Histórico</text>

        {/* ── Association lines ── */}
        {/* Admin → Auth */}
        <line x1="78" y1="155" x2="210" y2="105" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Admin → Gerir Utilizadores */}
        <line x1="78" y1="165" x2="210" y2="175" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Admin → Gerir Clientes */}
        <line x1="78" y1="175" x2="210" y2="255" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Admin → Pontos */}
        <line x1="78" y1="180" x2="200" y2="330" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Admin → Relatórios */}
        <line x1="78" y1="185" x2="470" y2="340" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4,3" />

        {/* Funcionário → Auth */}
        <line x1="78" y1="385" x2="210" y2="115" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Funcionário → Gerir Clientes */}
        <line x1="78" y1="390" x2="210" y2="260" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Funcionário → Serviços */}
        <line x1="78" y1="400" x2="210" y2="410" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Funcionário → Abastecimentos */}
        <line x1="78" y1="395" x2="470" y2="180" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Funcionário → Pagamentos */}
        <line x1="78" y1="400" x2="470" y2="260" stroke="#94a3b8" strokeWidth="1.2" />
        {/* Funcionário → Histórico */}
        <line x1="78" y1="405" x2="470" y2="428" stroke="#94a3b8" strokeWidth="1.2" />

        {/* Cliente → Abastecimentos (external) */}
        <line x1="822" y1="295" x2="690" y2="180" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4,3" />
        {/* Cliente → Pagamentos */}
        <line x1="822" y1="300" x2="690" y2="260" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4,3" />

        {/* Legend */}
        <rect x="170" y="555" width="12" height="2" fill="#94a3b8" />
        <text x="188" y="560" fontSize="10" fill="#64748b">Associação directa</text>
        <line x1="280" y1="558" x2="292" y2="558" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="298" y="560" fontSize="10" fill="#64748b">Associação indirecta</text>
      </svg>
    </div>
  );
}

/* ─── CLASS DIAGRAM ─── */
function ClassDiagram() {
  const classBox = (x: number, y: number, name: string, attrs: string[], methods: string[], color: string, textColor: string) => {
    const rowH = 18;
    const headerH = 28;
    const totalH = headerH + (attrs.length + methods.length) * rowH + (methods.length > 0 ? 6 : 0) + 8;
    const w = 170;
    return (
      <g key={name}>
        <rect x={x} y={y} width={w} height={totalH} rx="6" fill="white" stroke={color} strokeWidth="1.5" />
        <rect x={x} y={y} width={w} height={headerH} rx="6" fill={color} />
        <rect x={x} y={y + headerH - 6} width={w} height={6} fill={color} />
        <text x={x + w / 2} y={y + 18} textAnchor="middle" fontSize="12" fontWeight="700" fill={textColor}>{name}</text>
        {attrs.map((a, i) => (
          <text key={i} x={x + 8} y={y + headerH + 14 + i * rowH} fontSize="10" fill="#374151">{a}</text>
        ))}
        {methods.length > 0 && (
          <line x1={x} y1={y + headerH + attrs.length * rowH + 4} x2={x + w} y2={y + headerH + attrs.length * rowH + 4} stroke={color} strokeWidth="1" />
        )}
        {methods.map((m, i) => (
          <text key={i} x={x + 8} y={y + headerH + attrs.length * rowH + 18 + i * rowH} fontSize="10" fill="#6d28d9">{m}</text>
        ))}
      </g>
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 980 700" className="w-full min-w-[800px] h-auto" style={{ fontFamily: 'inherit' }}>
        <rect width="980" height="700" fill="#f8fafc" rx="12" />

        {/* Perfil */}
        {classBox(20, 30, 'Perfil', [
          '+ id: uuid (PK)',
          '+ nome: varchar',
          '+ email: varchar',
          '+ cargo: varchar',
          '+ role: enum',
          '+ criado_em: timestamp',
        ], ['+ autenticar()', '+ obterPerfil()'], '#3b82f6', 'white')}

        {/* Cliente */}
        {classBox(220, 30, 'Cliente', [
          '+ id: uuid (PK)',
          '+ nome: varchar',
          '+ tipo: enum',
          '+ nuit: varchar',
          '+ telefone: varchar',
          '+ email: varchar',
          '+ endereco: text',
        ], ['+ listar()', '+ criar()', '+ actualizar()'], '#8b5cf6', 'white')}

        {/* PontoAbastecimento */}
        {classBox(420, 30, 'PontoAbastecimento', [
          '+ id: uuid (PK)',
          '+ nome: varchar',
          '+ localizacao: text',
          '+ tipo: enum',
          '+ capacidade: numeric',
          '+ activo: boolean',
        ], ['+ listar()', '+ criar()'], '#10b981', 'white')}

        {/* Servico */}
        {classBox(620, 30, 'Servico', [
          '+ id: uuid (PK)',
          '+ nome: varchar',
          '+ descricao: text',
          '+ preco_unitario: numeric',
          '+ unidade: varchar',
          '+ activo: boolean',
        ], ['+ listar()', '+ criar()'], '#f59e0b', '#1c1917')}

        {/* Abastecimento */}
        {classBox(120, 320, 'Abastecimento', [
          '+ id: uuid (PK)',
          '+ cliente_id: uuid (FK)',
          '+ ponto_id: uuid (FK)',
          '+ servico_id: uuid (FK)',
          '+ funcionario_id: uuid (FK)',
          '+ quantidade: numeric',
          '+ preco_total: numeric',
          '+ estado: enum',
          '+ data: timestamp',
        ], ['+ criar()', '+ actualizar()', '+ listar()'], '#ef4444', 'white')}

        {/* Pagamento */}
        {classBox(520, 320, 'Pagamento', [
          '+ id: uuid (PK)',
          '+ abastecimento_id: uuid (FK)',
          '+ valor: numeric',
          '+ metodo: enum',
          '+ estado: enum',
          '+ data_pagamento: timestamp',
          '+ referencia: varchar',
        ], ['+ registar()', '+ listar()'], '#0ea5e9', 'white')}

        {/* ── Relationships ── */}
        {/* Perfil → Abastecimento (1..N) */}
        <line x1="105" y1="200" x2="200" y2="320" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="130" y="270" fontSize="9" fill="#64748b">1</text>
        <text x="195" y="315" fontSize="9" fill="#64748b">N</text>

        {/* Cliente → Abastecimento (1..N) */}
        <line x1="305" y1="210" x2="240" y2="320" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="285" y="275" fontSize="9" fill="#64748b">1</text>
        <text x="245" y="315" fontSize="9" fill="#64748b">N</text>

        {/* PontoAbastecimento → Abastecimento (1..N) */}
        <line x1="505" y1="210" x2="290" y2="320" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="450" y="270" fontSize="9" fill="#64748b">1</text>
        <text x="295" y="315" fontSize="9" fill="#64748b">N</text>

        {/* Servico → Abastecimento (1..N) */}
        <line x1="705" y1="210" x2="290" y2="325" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="650" y="270" fontSize="9" fill="#64748b">1</text>
        <text x="295" y="320" fontSize="9" fill="#64748b">N</text>

        {/* Abastecimento → Pagamento (1..1) */}
        <line x1="290" y1="430" x2="520" y2="430" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="300" y="425" fontSize="9" fill="#64748b">1</text>
        <text x="510" y="425" fontSize="9" fill="#64748b">1</text>

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Legend */}
        <rect x="20" y="650" width="940" height="36" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <text x="40" y="672" fontSize="10" fill="#64748b" fontWeight="600">Legenda:</text>
        <rect x="100" y="660" width="12" height="12" rx="2" fill="#3b82f6" />
        <text x="118" y="671" fontSize="10" fill="#374151">Autenticação</text>
        <rect x="220" y="660" width="12" height="12" rx="2" fill="#8b5cf6" />
        <text x="238" y="671" fontSize="10" fill="#374151">Entidades</text>
        <rect x="320" y="660" width="12" height="12" rx="2" fill="#ef4444" />
        <text x="338" y="671" fontSize="10" fill="#374151">Transacções</text>
        <rect x="440" y="660" width="12" height="12" rx="2" fill="#0ea5e9" />
        <text x="458" y="671" fontSize="10" fill="#374151">Financeiro</text>
        <line x1="560" y1="666" x2="580" y2="666" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <text x="588" y="671" fontSize="10" fill="#374151">Associação (1..N)</text>
      </svg>
    </div>
  );
}

/* ─── SEQUENCE DIAGRAM ─── */
function SequenceDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 860 620" className="w-full min-w-[700px] h-auto" style={{ fontFamily: 'inherit' }}>
        <rect width="860" height="620" fill="#f8fafc" rx="12" />

        {/* Title */}
        <text x="430" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">Sequência: Registar Abastecimento</text>

        {/* Lifeline headers */}
        {[
          { x: 80, label: 'Utilizador', color: '#3b82f6', bg: '#eff6ff' },
          { x: 230, label: 'UI (Browser)', color: '#8b5cf6', bg: '#f5f3ff' },
          { x: 400, label: 'Next.js API', color: '#10b981', bg: '#ecfdf5' },
          { x: 570, label: 'Supabase', color: '#f59e0b', bg: '#fffbeb' },
          { x: 740, label: 'Base de Dados', color: '#ef4444', bg: '#fef2f2' },
        ].map(({ x, label, color, bg }) => (
          <g key={label}>
            <rect x={x - 55} y="42" width="110" height="32" rx="6" fill={bg} stroke={color} strokeWidth="1.5" />
            <text x={x} y="62" textAnchor="middle" fontSize="11" fontWeight="600" fill={color}>{label}</text>
            <line x1={x} y1="74" x2={x} y2="590" stroke={color} strokeWidth="1" strokeDasharray="5,4" opacity="0.5" />
          </g>
        ))}

        {/* ── Messages ── */}
        {/* 1. Login */}
        <rect x="60" y="95" width="40" height="20" rx="3" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
        <line x1="80" y1="105" x2="175" y2="105" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="128" y="100" textAnchor="middle" fontSize="10" fill="#1e40af">1: login(email, senha)</text>

        {/* 2. API auth */}
        <line x1="230" y1="125" x2="345" y2="125" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="288" y="120" textAnchor="middle" fontSize="10" fill="#6d28d9">2: POST /api/auth</text>

        {/* 3. Supabase auth */}
        <line x1="400" y1="145" x2="515" y2="145" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="458" y="140" textAnchor="middle" fontSize="10" fill="#065f46">3: signInWithPassword()</text>

        {/* 4. Return session */}
        <line x1="515" y1="165" x2="400" y2="165" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="458" y="160" textAnchor="middle" fontSize="10" fill="#92400e">4: session token</text>

        {/* 5. Return 200 */}
        <line x1="345" y1="185" x2="230" y2="185" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="288" y="180" textAnchor="middle" fontSize="10" fill="#065f46">5: 200 OK + token</text>

        {/* Separator */}
        <line x1="40" y1="205" x2="820" y2="205" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
        <text x="430" y="218" textAnchor="middle" fontSize="10" fill="#94a3b8" fontStyle="italic">— Utilizador autenticado — Registo de Abastecimento —</text>

        {/* 6. Preenche formulário */}
        <rect x="60" y="228" width="40" height="20" rx="3" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1" />
        <line x1="80" y1="238" x2="175" y2="238" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="128" y="233" textAnchor="middle" fontSize="10" fill="#1e40af">6: preenche formulário</text>

        {/* 7. POST abastecimento */}
        <line x1="230" y1="258" x2="345" y2="258" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="288" y="253" textAnchor="middle" fontSize="10" fill="#6d28d9">7: POST /api/abastecimentos</text>

        {/* 8. Valida dados */}
        <rect x="380" y="268" width="40" height="20" rx="3" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
        <text x="400" y="282" textAnchor="middle" fontSize="9" fill="#065f46">valida</text>

        {/* 9. Insert Supabase */}
        <line x1="400" y1="298" x2="515" y2="298" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="458" y="293" textAnchor="middle" fontSize="10" fill="#065f46">8: supabase.insert()</text>

        {/* 10. SQL INSERT */}
        <line x1="570" y1="318" x2="685" y2="318" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="628" y="313" textAnchor="middle" fontSize="10" fill="#92400e">9: INSERT abastecimentos</text>

        {/* 11. Return row */}
        <line x1="685" y1="338" x2="570" y2="338" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="628" y="333" textAnchor="middle" fontSize="10" fill="#b91c1c">10: row inserida</text>

        {/* 12. Return data */}
        <line x1="515" y1="358" x2="400" y2="358" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="458" y="353" textAnchor="middle" fontSize="10" fill="#92400e">11: data</text>

        {/* 13. 201 Created */}
        <line x1="345" y1="378" x2="230" y2="378" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="288" y="373" textAnchor="middle" fontSize="10" fill="#065f46">12: 201 Created</text>

        {/* 14. Actualiza UI */}
        <line x1="175" y1="398" x2="80" y2="398" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="128" y="393" textAnchor="middle" fontSize="10" fill="#6d28d9">13: actualiza lista</text>

        {/* Separator 2 */}
        <line x1="40" y1="420" x2="820" y2="420" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
        <text x="430" y="433" textAnchor="middle" fontSize="10" fill="#94a3b8" fontStyle="italic">— Registo de Pagamento —</text>

        {/* 15. Registar pagamento */}
        <line x1="80" y1="448" x2="175" y2="448" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="128" y="443" textAnchor="middle" fontSize="10" fill="#1e40af">14: registar pagamento</text>

        {/* 16. POST pagamentos */}
        <line x1="230" y1="468" x2="345" y2="468" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="288" y="463" textAnchor="middle" fontSize="10" fill="#6d28d9">15: POST /api/pagamentos</text>

        {/* 17. Insert pagamento */}
        <line x1="400" y1="488" x2="515" y2="488" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="458" y="483" textAnchor="middle" fontSize="10" fill="#065f46">16: supabase.insert()</text>

        {/* 18. SQL INSERT pagamento */}
        <line x1="570" y1="508" x2="685" y2="508" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#seqArrow)" />
        <text x="628" y="503" textAnchor="middle" fontSize="10" fill="#92400e">17: INSERT pagamentos</text>

        {/* 19. Return */}
        <line x1="685" y1="528" x2="400" y2="528" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="543" y="523" textAnchor="middle" fontSize="10" fill="#b91c1c">18: confirmação</text>

        {/* 20. Notifica UI */}
        <line x1="345" y1="548" x2="80" y2="548" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,3" markerEnd="url(#seqArrowDash)" />
        <text x="213" y="543" textAnchor="middle" fontSize="10" fill="#065f46">19: pagamento confirmado</text>

        {/* Arrows defs */}
        <defs>
          <marker id="seqArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
          <marker id="seqArrowDash" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

/* ─── COMMUNICATION DIAGRAM ─── */
function CommunicationDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 860 560" className="w-full min-w-[700px] h-auto" style={{ fontFamily: 'inherit' }}>
        <rect width="860" height="560" fill="#f8fafc" rx="12" />
        <text x="430" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e293b">Comunicação: Objectos do Sistema SGAA</text>

        {/* ── Objects (rounded rectangles) ── */}
        {/* AuthContext */}
        <rect x="340" y="50" width="180" height="44" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
        <text x="430" y="68" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1e40af">:AuthContext</text>
        <text x="430" y="84" textAnchor="middle" fontSize="9" fill="#3b82f6">gestão de sessão</text>

        {/* Sidebar */}
        <rect x="50" y="200" width="160" height="44" rx="8" fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
        <text x="130" y="218" textAnchor="middle" fontSize="11" fontWeight="700" fill="#6d28d9">:Sidebar</text>
        <text x="130" y="234" textAnchor="middle" fontSize="9" fill="#8b5cf6">navegação principal</text>

        {/* AppLayout */}
        <rect x="340" y="200" width="180" height="44" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
        <text x="430" y="218" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065f46">:AppLayout</text>
        <text x="430" y="234" textAnchor="middle" fontSize="9" fill="#10b981">layout principal</text>

        {/* SupplyManagement */}
        <rect x="640" y="200" width="180" height="44" rx="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="2" />
        <text x="730" y="218" textAnchor="middle" fontSize="11" fontWeight="700" fill="#92400e">:SupplyManagement</text>
        <text x="730" y="234" textAnchor="middle" fontSize="9" fill="#f59e0b">gestão abastecimentos</text>

        {/* API Route */}
        <rect x="50" y="380" width="160" height="44" rx="8" fill="#fef2f2" stroke="#ef4444" strokeWidth="2" />
        <text x="130" y="398" textAnchor="middle" fontSize="11" fontWeight="700" fill="#b91c1c">:API Route</text>
        <text x="130" y="414" textAnchor="middle" fontSize="9" fill="#ef4444">Next.js handler</text>

        {/* SupabaseClient */}
        <rect x="340" y="380" width="180" height="44" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />
        <text x="430" y="398" textAnchor="middle" fontSize="11" fontWeight="700" fill="#15803d">:SupabaseClient</text>
        <text x="430" y="414" textAnchor="middle" fontSize="9" fill="#16a34a">cliente Supabase</text>

        {/* Database */}
        <rect x="640" y="380" width="180" height="44" rx="8" fill="#fdf4ff" stroke="#a855f7" strokeWidth="2" />
        <text x="730" y="398" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7e22ce">:PostgreSQL</text>
        <text x="730" y="414" textAnchor="middle" fontSize="9" fill="#a855f7">base de dados</text>

        {/* ── Communication links ── */}
        {/* AuthContext ↔ AppLayout */}
        <line x1="430" y1="94" x2="430" y2="200" stroke="#10b981" strokeWidth="1.5" />
        <text x="445" y="152" fontSize="10" fill="#065f46" fontWeight="600">1: provideSession()</text>

        {/* AuthContext ↔ Sidebar */}
        <line x1="340" y1="72" x2="210" y2="200" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="230" y="140" fontSize="10" fill="#6d28d9" fontWeight="600">2: userRole</text>

        {/* AppLayout ↔ Sidebar */}
        <line x1="340" y1="222" x2="210" y2="222" stroke="#10b981" strokeWidth="1.5" />
        <text x="255" y="215" fontSize="10" fill="#065f46" fontWeight="600">3: render()</text>

        {/* AppLayout ↔ SupplyManagement */}
        <line x1="520" y1="222" x2="640" y2="222" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="545" y="215" fontSize="10" fill="#92400e" fontWeight="600">4: mountPage()</text>

        {/* SupplyManagement ↔ API Route */}
        <line x1="730" y1="244" x2="730" y2="340" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="730" y1="340" x2="210" y2="380" stroke="#ef4444" strokeWidth="1.5" />
        <text x="480" y="360" fontSize="10" fill="#b91c1c" fontWeight="600">5: fetch('/api/abastecimentos')</text>

        {/* API Route ↔ SupabaseClient */}
        <line x1="210" y1="402" x2="340" y2="402" stroke="#16a34a" strokeWidth="1.5" />
        <text x="240" y="395" fontSize="10" fill="#15803d" fontWeight="600">6: query()</text>

        {/* SupabaseClient ↔ PostgreSQL */}
        <line x1="520" y1="402" x2="640" y2="402" stroke="#a855f7" strokeWidth="1.5" />
        <text x="545" y="395" fontSize="10" fill="#7e22ce" fontWeight="600">7: SQL</text>

        {/* PostgreSQL → SupabaseClient (return) */}
        <line x1="640" y1="418" x2="520" y2="418" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="545" y="435" fontSize="10" fill="#7e22ce" fontWeight="600">8: rows[ ]</text>

        {/* SupabaseClient → API Route (return) */}
        <line x1="340" y1="418" x2="210" y2="418" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="240" y="435" fontSize="10" fill="#15803d" fontWeight="600">9: data</text>

        {/* API Route → SupplyManagement (return) */}
        <line x1="130" y1="380" x2="130" y2="300" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
        <line x1="130" y1="300" x2="640" y2="244" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="350" y="295" fontSize="10" fill="#b91c1c" fontWeight="600">10: JSON response</text>

        {/* SupplyManagement → AppLayout (re-render) */}
        <line x1="640" y1="210" x2="520" y2="210" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="545" y="203" fontSize="10" fill="#92400e" fontWeight="600">11: setState()</text>

        {/* Legend */}
        <rect x="20" y="510" width="820" height="36" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <text x="40" y="532" fontSize="10" fill="#64748b" fontWeight="600">Legenda:</text>
        <line x1="100" y1="528" x2="130" y2="528" stroke="#64748b" strokeWidth="1.5" />
        <text x="138" y="532" fontSize="10" fill="#374151">Chamada síncrona</text>
        <line x1="240" y1="528" x2="270" y2="528" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,3" />
        <text x="278" y="532" fontSize="10" fill="#374151">Retorno / resposta</text>
        <text x="420" y="532" fontSize="10" fill="#374151">Números = ordem de execução das mensagens</text>
      </svg>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function UMLClient() {
  const [activeTab, setActiveTab] = useState<DiagramTab>('usecase');

  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={22} className="text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Diagramas UML</h1>
          </div>
          <p className="text-sm text-muted-foreground">Modelação do sistema SGAA — Casos de Uso, Classes, Sequência e Comunicação</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">v1.9 — UML</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab description */}
      <div className="mb-4 px-4 py-3 bg-muted/50 border border-border rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{activeTabData.label}:</span>{' '}
          {activeTabData.description}
        </p>
      </div>

      {/* Diagram card */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
        {activeTab === 'usecase' && <UseCaseDiagram />}
        {activeTab === 'class' && <ClassDiagram />}
        {activeTab === 'sequence' && <SequenceDiagram />}
        {activeTab === 'communication' && <CommunicationDiagram />}
      </div>

      {/* Footer note */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Diagramas gerados com base na arquitectura real do sistema SGAA — Supabase + Next.js 15 + TypeScript
      </p>
    </div>
  );
}
