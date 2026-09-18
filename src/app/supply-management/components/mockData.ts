export type SupplyEstado = 'Solicitado' | 'Em andamento' | 'Concluído' | 'Cancelado';

export interface Abastecimento {
  id: string;
  clienteId: string;
  cliente: string;
  pontoId: string;
  ponto: string;
  bairro: string;
  servicoId: string;
  servico: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  data: string;
  hora: string;
  funcionarioId: string;
  funcionario: string;
  estado: SupplyEstado;
  observacoes?: string;
}

export interface Cliente {
  id: string;
  nome: string;
}

export interface PontoAbastecimento {
  id: string;
  clienteId: string;
  identificacao: string;
  bairro: string;
  cidade: string;
  estado: 'Ativo' | 'Inativo';
}

export interface Servico {
  id: string;
  nome: string;
  unidade: string;
  precoUnitario: number;
  estado: 'Ativo' | 'Inativo';
}

export const mockClientes: Cliente[] = [
  { id: 'cli-001', nome: 'Família Cossa' },
  { id: 'cli-002', nome: 'Escola Primária Malhangalene' },
  { id: 'cli-003', nome: 'Supermercado Shoprite Sommerschield' },
  { id: 'cli-004', nome: 'Complexo Residencial Polana' },
  { id: 'cli-005', nome: 'Clínica Agostinho Neto' },
  { id: 'cli-006', nome: 'Família Muiambo' },
  { id: 'cli-007', nome: 'Mercado Municipal Xipamanine' },
  { id: 'cli-008', nome: 'Escola Secundária Josina Machel' },
  { id: 'cli-009', nome: 'Família Zimba' },
  { id: 'cli-010', nome: 'Hotel Cardoso' },
];

export const mockPontos: PontoAbastecimento[] = [
  { id: 'pt-001', clienteId: 'cli-001', identificacao: 'PT-0841', bairro: 'Sommerschield', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-002', clienteId: 'cli-001', identificacao: 'PT-0842', bairro: 'Sommerschield', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-003', clienteId: 'cli-002', identificacao: 'PT-0234', bairro: 'Malhangalene', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-004', clienteId: 'cli-003', identificacao: 'PT-1102', bairro: 'Sommerschield', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-005', clienteId: 'cli-004', identificacao: 'PT-0677', bairro: 'Polana', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-006', clienteId: 'cli-005', identificacao: 'PT-0512', bairro: 'Catembe', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-007', clienteId: 'cli-006', identificacao: 'PT-0988', bairro: 'Maxaquene', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-008', clienteId: 'cli-007', identificacao: 'PT-0634', bairro: 'Xipamanine', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-009', clienteId: 'cli-008', identificacao: 'PT-0598', bairro: 'Josina Machel', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-010', clienteId: 'cli-009', identificacao: 'PT-0722', bairro: 'Mafalala', cidade: 'Maputo', estado: 'Ativo' },
  { id: 'pt-011', clienteId: 'cli-010', identificacao: 'PT-1044', bairro: 'Polana', cidade: 'Maputo', estado: 'Ativo' },
];

export const mockServicos: Servico[] = [
  { id: 'srv-001', nome: 'Residencial 3m³', unidade: 'm³', precoUnitario: 250, estado: 'Ativo' },
  { id: 'srv-002', nome: 'Residencial 5m³', unidade: 'm³', precoUnitario: 250, estado: 'Ativo' },
  { id: 'srv-003', nome: 'Comercial 20m³', unidade: 'm³', precoUnitario: 310, estado: 'Ativo' },
  { id: 'srv-004', nome: 'Comercial 50m³', unidade: 'm³', precoUnitario: 370, estado: 'Ativo' },
  { id: 'srv-005', nome: 'Institucional 20m³', unidade: 'm³', precoUnitario: 210, estado: 'Ativo' },
  { id: 'srv-006', nome: 'Tanque 10.000L', unidade: 'Tanque', precoUnitario: 8750, estado: 'Ativo' },
  { id: 'srv-007', nome: 'Tanque 5.000L', unidade: 'Tanque', precoUnitario: 4600, estado: 'Ativo' },
  { id: 'srv-008', nome: 'Emergência 2m³', unidade: 'm³', precoUnitario: 900, estado: 'Ativo' },
  { id: 'srv-009', nome: 'Limpeza de Cisterna', unidade: 'Serviço', precoUnitario: 3500, estado: 'Inativo' },
];

export const mockAbastecimentos: Abastecimento[] = [
  { id: 'abs-001', clienteId: 'cli-001', cliente: 'Família Cossa', pontoId: 'pt-001', ponto: 'PT-0841', bairro: 'Sommerschield', servicoId: 'srv-002', servico: 'Residencial 5m³', unidade: 'm³', quantidade: 5, precoUnitario: 250, subtotal: 1250, data: '13/09/2026', hora: '17:48', funcionarioId: 'usr-002', funcionario: 'Joana Sitoe', estado: 'Em andamento' },
  { id: 'abs-002', clienteId: 'cli-002', cliente: 'Escola Primária Malhangalene', pontoId: 'pt-003', ponto: 'PT-0234', bairro: 'Malhangalene', servicoId: 'srv-005', servico: 'Institucional 20m³', unidade: 'm³', quantidade: 20, precoUnitario: 210, subtotal: 4200, data: '13/09/2026', hora: '17:12', funcionarioId: 'usr-003', funcionario: 'Marco Tembe', estado: 'Concluído' },
  { id: 'abs-003', clienteId: 'cli-003', cliente: 'Supermercado Shoprite Sommerschield', pontoId: 'pt-004', ponto: 'PT-1102', bairro: 'Sommerschield', servicoId: 'srv-004', servico: 'Comercial 50m³', unidade: 'm³', quantidade: 50, precoUnitario: 370, subtotal: 18500, data: '13/09/2026', hora: '16:55', funcionarioId: 'usr-004', funcionario: 'Abel Nhantumbo', estado: 'Concluído' },
  { id: 'abs-004', clienteId: 'cli-004', cliente: 'Complexo Residencial Polana', pontoId: 'pt-005', ponto: 'PT-0677', bairro: 'Polana', servicoId: 'srv-006', servico: 'Tanque 10.000L', unidade: 'Tanque', quantidade: 1, precoUnitario: 8750, subtotal: 8750, data: '13/09/2026', hora: '16:30', funcionarioId: 'usr-001', funcionario: 'Carlos Machava', estado: 'Solicitado' },
  { id: 'abs-005', clienteId: 'cli-005', cliente: 'Clínica Agostinho Neto', pontoId: 'pt-006', ponto: 'PT-0512', bairro: 'Catembe', servicoId: 'srv-008', servico: 'Emergência 2m³', unidade: 'm³', quantidade: 2, precoUnitario: 900, subtotal: 1800, data: '13/09/2026', hora: '15:44', funcionarioId: 'usr-002', funcionario: 'Joana Sitoe', estado: 'Cancelado' },
  { id: 'abs-006', clienteId: 'cli-006', cliente: 'Família Muiambo', pontoId: 'pt-007', ponto: 'PT-0988', bairro: 'Maxaquene', servicoId: 'srv-001', servico: 'Residencial 3m³', unidade: 'm³', quantidade: 3, precoUnitario: 250, subtotal: 750, data: '13/09/2026', hora: '15:20', funcionarioId: 'usr-003', funcionario: 'Marco Tembe', estado: 'Concluído' },
  { id: 'abs-007', clienteId: 'cli-007', cliente: 'Mercado Municipal Xipamanine', pontoId: 'pt-008', ponto: 'PT-0634', bairro: 'Xipamanine', servicoId: 'srv-003', servico: 'Comercial 20m³', unidade: 'm³', quantidade: 20, precoUnitario: 310, subtotal: 6200, data: '12/09/2026', hora: '14:30', funcionarioId: 'usr-004', funcionario: 'Abel Nhantumbo', estado: 'Concluído' },
  { id: 'abs-008', clienteId: 'cli-008', cliente: 'Escola Secundária Josina Machel', pontoId: 'pt-009', ponto: 'PT-0598', bairro: 'Josina Machel', servicoId: 'srv-005', servico: 'Institucional 20m³', unidade: 'm³', quantidade: 20, precoUnitario: 210, subtotal: 4200, data: '12/09/2026', hora: '13:15', funcionarioId: 'usr-002', funcionario: 'Joana Sitoe', estado: 'Concluído' },
  { id: 'abs-009', clienteId: 'cli-009', cliente: 'Família Zimba', pontoId: 'pt-010', ponto: 'PT-0722', bairro: 'Mafalala', servicoId: 'srv-001', servico: 'Residencial 3m³', unidade: 'm³', quantidade: 3, precoUnitario: 250, subtotal: 750, data: '12/09/2026', hora: '11:00', funcionarioId: 'usr-003', funcionario: 'Marco Tembe', estado: 'Concluído' },
  { id: 'abs-010', clienteId: 'cli-010', cliente: 'Hotel Cardoso', pontoId: 'pt-011', ponto: 'PT-1044', bairro: 'Polana', servicoId: 'srv-007', servico: 'Tanque 5.000L', unidade: 'Tanque', quantidade: 2, precoUnitario: 4600, subtotal: 9200, data: '11/09/2026', hora: '09:30', funcionarioId: 'usr-001', funcionario: 'Carlos Machava', estado: 'Concluído' },
  { id: 'abs-011', clienteId: 'cli-001', cliente: 'Família Cossa', pontoId: 'pt-002', ponto: 'PT-0842', bairro: 'Sommerschield', servicoId: 'srv-001', servico: 'Residencial 3m³', unidade: 'm³', quantidade: 3, precoUnitario: 250, subtotal: 750, data: '11/09/2026', hora: '08:45', funcionarioId: 'usr-002', funcionario: 'Joana Sitoe', estado: 'Concluído' },
  { id: 'abs-012', clienteId: 'cli-004', cliente: 'Complexo Residencial Polana', pontoId: 'pt-005', ponto: 'PT-0677', bairro: 'Polana', servicoId: 'srv-006', servico: 'Tanque 10.000L', unidade: 'Tanque', quantidade: 1, precoUnitario: 8750, subtotal: 8750, data: '10/09/2026', hora: '16:00', funcionarioId: 'usr-004', funcionario: 'Abel Nhantumbo', estado: 'Concluído' },
];