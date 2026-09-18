-- SGAA — Sistema de Gestão de Abastecimento de Água
-- Full schema migration with all tables, relationships, RLS, and seed data

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS public.usuario_tipo CASCADE;
CREATE TYPE public.usuario_tipo AS ENUM ('administrador', 'funcionario');

DROP TYPE IF EXISTS public.usuario_estado CASCADE;
CREATE TYPE public.usuario_estado AS ENUM ('ativo', 'inativo');

DROP TYPE IF EXISTS public.ponto_tipo CASCADE;
CREATE TYPE public.ponto_tipo AS ENUM ('residencial', 'comercial', 'institucional', 'outro');

DROP TYPE IF EXISTS public.ponto_estado CASCADE;
CREATE TYPE public.ponto_estado AS ENUM ('ativo', 'inativo');

DROP TYPE IF EXISTS public.servico_estado CASCADE;
CREATE TYPE public.servico_estado AS ENUM ('ativo', 'inativo');

DROP TYPE IF EXISTS public.abastecimento_estado CASCADE;
CREATE TYPE public.abastecimento_estado AS ENUM ('solicitado', 'em_andamento', 'concluido', 'cancelado');

DROP TYPE IF EXISTS public.pagamento_estado CASCADE;
CREATE TYPE public.pagamento_estado AS ENUM ('pago', 'pendente', 'cancelado');

DROP TYPE IF EXISTS public.pagamento_metodo CASCADE;
CREATE TYPE public.pagamento_metodo AS ENUM ('dinheiro', 'mpesa', 'emola', 'transferencia', 'outro');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- User profiles (linked to Supabase auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo public.usuario_tipo NOT NULL DEFAULT 'funcionario'::public.usuario_tipo,
  estado public.usuario_estado NOT NULL DEFAULT 'ativo'::public.usuario_estado,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  documento TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Serviços / Planos de abastecimento
CREATE TABLE IF NOT EXISTS public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  unidade TEXT NOT NULL DEFAULT 'm³',
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado public.servico_estado NOT NULL DEFAULT 'ativo'::public.servico_estado,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pontos de abastecimento
CREATE TABLE IF NOT EXISTS public.pontos_abastecimento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  identificacao TEXT NOT NULL,
  endereco TEXT,
  bairro TEXT,
  cidade TEXT,
  tipo public.ponto_tipo NOT NULL DEFAULT 'residencial'::public.ponto_tipo,
  estado public.ponto_estado NOT NULL DEFAULT 'ativo'::public.ponto_estado,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Abastecimentos
CREATE TABLE IF NOT EXISTS public.abastecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  ponto_id UUID NOT NULL REFERENCES public.pontos_abastecimento(id) ON DELETE RESTRICT,
  servico_id UUID NOT NULL REFERENCES public.servicos(id) ON DELETE RESTRICT,
  usuario_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  quantidade NUMERIC(12,3) NOT NULL DEFAULT 0,
  preco_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(14,2) GENERATED ALWAYS AS (quantidade * preco_unitario) STORED,
  data_abastecimento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado public.abastecimento_estado NOT NULL DEFAULT 'solicitado'::public.abastecimento_estado
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abastecimento_id UUID NOT NULL REFERENCES public.abastecimentos(id) ON DELETE RESTRICT,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
  valor NUMERIC(14,2) NOT NULL DEFAULT 0,
  metodo public.pagamento_metodo NOT NULL DEFAULT 'dinheiro'::public.pagamento_metodo,
  referencia TEXT,
  data_pagamento TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado public.pagamento_estado NOT NULL DEFAULT 'pendente'::public.pagamento_estado
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(nome);
CREATE INDEX IF NOT EXISTS idx_pontos_cliente_id ON public.pontos_abastecimento(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_cliente_id ON public.abastecimentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_estado ON public.abastecimentos(estado);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_data ON public.abastecimentos(data_abastecimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_cliente_id ON public.pagamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_estado ON public.pagamentos(estado);
CREATE INDEX IF NOT EXISTS idx_pagamentos_abastecimento_id ON public.pagamentos(abastecimento_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================

-- Auto-create user_profiles on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, nome, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'funcionario')::public.usuario_tipo
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos_abastecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles: own row
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- All authenticated users can read all profiles (needed for joins)
DROP POLICY IF EXISTS "users_read_all_profiles" ON public.user_profiles;
CREATE POLICY "users_read_all_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (true);

-- clientes: all authenticated users can manage
DROP POLICY IF EXISTS "authenticated_manage_clientes" ON public.clientes;
CREATE POLICY "authenticated_manage_clientes" ON public.clientes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- servicos: all authenticated users can manage
DROP POLICY IF EXISTS "authenticated_manage_servicos" ON public.servicos;
CREATE POLICY "authenticated_manage_servicos" ON public.servicos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- pontos_abastecimento: all authenticated users can manage
DROP POLICY IF EXISTS "authenticated_manage_pontos" ON public.pontos_abastecimento;
CREATE POLICY "authenticated_manage_pontos" ON public.pontos_abastecimento
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- abastecimentos: all authenticated users can manage
DROP POLICY IF EXISTS "authenticated_manage_abastecimentos" ON public.abastecimentos;
CREATE POLICY "authenticated_manage_abastecimentos" ON public.abastecimentos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- pagamentos: all authenticated users can manage
DROP POLICY IF EXISTS "authenticated_manage_pagamentos" ON public.pagamentos;
CREATE POLICY "authenticated_manage_pagamentos" ON public.pagamentos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. SEED DATA — 12 test clients + services + supply points + supplies + payments
-- ============================================================

DO $$
DECLARE
  admin_uuid UUID := gen_random_uuid();
  func_uuid  UUID := gen_random_uuid();

  -- Client UUIDs
  c1 UUID := gen_random_uuid();
  c2 UUID := gen_random_uuid();
  c3 UUID := gen_random_uuid();
  c4 UUID := gen_random_uuid();
  c5 UUID := gen_random_uuid();
  c6 UUID := gen_random_uuid();
  c7 UUID := gen_random_uuid();
  c8 UUID := gen_random_uuid();
  c9 UUID := gen_random_uuid();
  c10 UUID := gen_random_uuid();
  c11 UUID := gen_random_uuid();
  c12 UUID := gen_random_uuid();

  -- Service UUIDs
  s1 UUID := gen_random_uuid();
  s2 UUID := gen_random_uuid();
  s3 UUID := gen_random_uuid();
  s4 UUID := gen_random_uuid();
  s5 UUID := gen_random_uuid();

  -- Supply point UUIDs
  p1 UUID := gen_random_uuid();
  p2 UUID := gen_random_uuid();
  p3 UUID := gen_random_uuid();
  p4 UUID := gen_random_uuid();
  p5 UUID := gen_random_uuid();
  p6 UUID := gen_random_uuid();
  p7 UUID := gen_random_uuid();
  p8 UUID := gen_random_uuid();
  p9 UUID := gen_random_uuid();
  p10 UUID := gen_random_uuid();
  p11 UUID := gen_random_uuid();
  p12 UUID := gen_random_uuid();

  -- Abastecimento UUIDs
  a1 UUID := gen_random_uuid();
  a2 UUID := gen_random_uuid();
  a3 UUID := gen_random_uuid();
  a4 UUID := gen_random_uuid();
  a5 UUID := gen_random_uuid();
  a6 UUID := gen_random_uuid();
  a7 UUID := gen_random_uuid();
  a8 UUID := gen_random_uuid();
  a9 UUID := gen_random_uuid();
  a10 UUID := gen_random_uuid();
  a11 UUID := gen_random_uuid();
  a12 UUID := gen_random_uuid();
  a13 UUID := gen_random_uuid();
  a14 UUID := gen_random_uuid();
  a15 UUID := gen_random_uuid();

BEGIN
  -- ---- AUTH USERS ----
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
    is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    email_change_sent_at, email_change_token_current, email_change_confirm_status,
    reauthentication_token, reauthentication_sent_at, phone, phone_change,
    phone_change_token, phone_change_sent_at
  ) VALUES
    (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'admin@sgaa.co.mz', crypt('Admin@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Administrador SGAA', 'tipo', 'administrador'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
    (func_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'joana.sitoe@sgaa.co.mz', crypt('Func@2026', gen_salt('bf', 10)), now(), now(), now(),
     jsonb_build_object('full_name', 'Joana Sitoe', 'tipo', 'funcionario'),
     jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
     false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
  ON CONFLICT (id) DO NOTHING;

  -- ---- CLIENTES (12) ----
  INSERT INTO public.clientes (id, nome, telefone, email, documento, endereco, created_at) VALUES
    (c1,  'Família Cossa',                      '+258 84 123 4567', 'cossa@email.co.mz',     '100234567A', 'Av. Julius Nyerere, 45, Maputo',        now() - interval '120 days'),
    (c2,  'Escola Primária Malhangalene',        '+258 21 456 789',  'escola.malh@edu.mz',    '200345678B', 'R. da Resistência, 12, Maputo',         now() - interval '110 days'),
    (c3,  'Supermercado Shoprite Sommerschield', '+258 21 789 012',  'shoprite@retail.co.mz', '300456789C', 'Av. Marginal, 100, Maputo',             now() - interval '100 days'),
    (c4,  'Complexo Residencial Polana',         '+258 84 234 5678', 'polana@imoveis.co.mz',  '400567890D', 'Av. Mao Tse Tung, 200, Maputo',         now() - interval '95 days'),
    (c5,  'Clínica Agostinho Neto',              '+258 21 321 654',  'clinica.an@saude.mz',   '500678901E', 'Av. Eduardo Mondlane, 33, Maputo',      now() - interval '90 days'),
    (c6,  'Família Muiambo',                     '+258 85 345 6789', 'muiambo@email.co.mz',   '600789012F', 'R. Consiglieri Pedroso, 7, Maputo',     now() - interval '85 days'),
    (c7,  'Família Zimba',                       '+258 84 456 7890', 'zimba@email.co.mz',     '700890123G', 'Av. Ho Chi Minh, 55, Maputo',           now() - interval '80 days'),
    (c8,  'Mercado Municipal Xipamanine',        '+258 21 654 321',  'mercado.xip@mun.mz',    '800901234H', 'R. Xipamanine, 1, Maputo',              now() - interval '75 days'),
    (c9,  'Escola Secundária Josina Machel',     '+258 21 987 654',  'josina.machel@edu.mz',  '900012345I', 'Av. Samora Machel, 88, Maputo',         now() - interval '70 days'),
    (c10, 'Hotel Cardoso',                       '+258 21 491 071',  'reservas@cardoso.co.mz','101234567J', 'Av. Mártires da Machava, 707, Maputo',  now() - interval '60 days'),
    (c11, 'Família Nhantumbo',                   '+258 86 567 8901', 'nhantumbo@email.co.mz', '111345678K', 'Av. Zedequias Manganhela, 22, Maputo',  now() - interval '45 days'),
    (c12, 'Centro Comunitário Maxaquene',        '+258 21 111 222',  'cc.maxaquene@mun.mz',   '121456789L', 'R. Maxaquene A, 3, Maputo',             now() - interval '30 days')
  ON CONFLICT (id) DO NOTHING;

  -- ---- SERVIÇOS ----
  INSERT INTO public.servicos (id, nome, descricao, unidade, preco_unitario, estado, created_at) VALUES
    (s1, 'Abastecimento Residencial',    'Fornecimento de água para uso residencial',         'm³',     250.00, 'ativo'::public.servico_estado,   now() - interval '200 days'),
    (s2, 'Abastecimento Comercial',      'Fornecimento de água para estabelecimentos',        'm³',     370.00, 'ativo'::public.servico_estado,   now() - interval '200 days'),
    (s3, 'Abastecimento Institucional',  'Fornecimento de água para instituições públicas',   'm³',     210.00, 'ativo'::public.servico_estado,   now() - interval '200 days'),
    (s4, 'Abastecimento por Tanque',     'Fornecimento por camião-tanque de 10.000 litros',   'tanque', 8750.00,'ativo'::public.servico_estado,   now() - interval '200 days'),
    (s5, 'Abastecimento de Emergência',  'Fornecimento urgente fora do horário normal',       'm³',     900.00, 'ativo'::public.servico_estado,   now() - interval '200 days')
  ON CONFLICT (id) DO NOTHING;

  -- ---- PONTOS DE ABASTECIMENTO (1 per client) ----
  INSERT INTO public.pontos_abastecimento (id, cliente_id, identificacao, endereco, bairro, cidade, tipo, estado, created_at) VALUES
    (p1,  c1,  'PT-0001', 'Av. Julius Nyerere, 45',       'Sommerschield', 'Maputo', 'residencial'::public.ponto_tipo,   'ativo'::public.ponto_estado, now() - interval '119 days'),
    (p2,  c2,  'PT-0002', 'R. da Resistência, 12',        'Malhangalene',  'Maputo', 'institucional'::public.ponto_tipo, 'ativo'::public.ponto_estado, now() - interval '109 days'),
    (p3,  c3,  'PT-0003', 'Av. Marginal, 100',            'Sommerschield', 'Maputo', 'comercial'::public.ponto_tipo,     'ativo'::public.ponto_estado, now() - interval '99 days'),
    (p4,  c4,  'PT-0004', 'Av. Mao Tse Tung, 200',        'Polana',        'Maputo', 'residencial'::public.ponto_tipo,   'ativo'::public.ponto_estado, now() - interval '94 days'),
    (p5,  c5,  'PT-0005', 'Av. Eduardo Mondlane, 33',     'Central',       'Maputo', 'institucional'::public.ponto_tipo, 'ativo'::public.ponto_estado, now() - interval '89 days'),
    (p6,  c6,  'PT-0006', 'R. Consiglieri Pedroso, 7',    'Catembe',       'Maputo', 'residencial'::public.ponto_tipo,   'ativo'::public.ponto_estado, now() - interval '84 days'),
    (p7,  c7,  'PT-0007', 'Av. Ho Chi Minh, 55',          'Maxaquene',     'Maputo', 'residencial'::public.ponto_tipo,   'ativo'::public.ponto_estado, now() - interval '79 days'),
    (p8,  c8,  'PT-0008', 'R. Xipamanine, 1',             'Xipamanine',    'Maputo', 'comercial'::public.ponto_tipo,     'ativo'::public.ponto_estado, now() - interval '74 days'),
    (p9,  c9,  'PT-0009', 'Av. Samora Machel, 88',        'Central',       'Maputo', 'institucional'::public.ponto_tipo, 'ativo'::public.ponto_estado, now() - interval '69 days'),
    (p10, c10, 'PT-0010', 'Av. Mártires da Machava, 707', 'Polana',        'Maputo', 'comercial'::public.ponto_tipo,     'ativo'::public.ponto_estado, now() - interval '59 days'),
    (p11, c11, 'PT-0011', 'Av. Zedequias Manganhela, 22', 'Maxaquene',     'Maputo', 'residencial'::public.ponto_tipo,   'ativo'::public.ponto_estado, now() - interval '44 days'),
    (p12, c12, 'PT-0012', 'R. Maxaquene A, 3',            'Maxaquene',     'Maputo', 'institucional'::public.ponto_tipo, 'ativo'::public.ponto_estado, now() - interval '29 days')
  ON CONFLICT (id) DO NOTHING;

  -- ---- ABASTECIMENTOS ----
  INSERT INTO public.abastecimentos (id, cliente_id, ponto_id, servico_id, usuario_id, quantidade, preco_unitario, data_abastecimento, estado) VALUES
    (a1,  c1,  p1,  s1, func_uuid,  5,   250.00, now() - interval '60 days', 'concluido'::public.abastecimento_estado),
    (a2,  c2,  p2,  s3, admin_uuid, 20,  210.00, now() - interval '55 days', 'concluido'::public.abastecimento_estado),
    (a3,  c3,  p3,  s2, func_uuid,  50,  370.00, now() - interval '50 days', 'concluido'::public.abastecimento_estado),
    (a4,  c4,  p4,  s4, admin_uuid, 1,   8750.00,now() - interval '45 days', 'concluido'::public.abastecimento_estado),
    (a5,  c5,  p5,  s5, func_uuid,  2,   900.00, now() - interval '40 days', 'cancelado'::public.abastecimento_estado),
    (a6,  c6,  p6,  s1, func_uuid,  3,   250.00, now() - interval '35 days', 'concluido'::public.abastecimento_estado),
    (a7,  c7,  p7,  s1, admin_uuid, 4,   250.00, now() - interval '30 days', 'concluido'::public.abastecimento_estado),
    (a8,  c8,  p8,  s2, func_uuid,  30,  370.00, now() - interval '25 days', 'concluido'::public.abastecimento_estado),
    (a9,  c9,  p9,  s3, admin_uuid, 15,  210.00, now() - interval '20 days', 'concluido'::public.abastecimento_estado),
    (a10, c10, p10, s2, func_uuid,  80,  370.00, now() - interval '15 days', 'concluido'::public.abastecimento_estado),
    (a11, c11, p11, s1, func_uuid,  6,   250.00, now() - interval '10 days', 'concluido'::public.abastecimento_estado),
    (a12, c12, p12, s3, admin_uuid, 10,  210.00, now() - interval '7 days',  'concluido'::public.abastecimento_estado),
    (a13, c1,  p1,  s1, func_uuid,  5,   250.00, now() - interval '3 days',  'em_andamento'::public.abastecimento_estado),
    (a14, c4,  p4,  s4, admin_uuid, 1,   8750.00,now() - interval '1 day',   'solicitado'::public.abastecimento_estado),
    (a15, c5,  p5,  s5, func_uuid,  2,   900.00, now(),                       'em_andamento'::public.abastecimento_estado)
  ON CONFLICT (id) DO NOTHING;

  -- ---- PAGAMENTOS ----
  -- Paid payments for concluded supplies
  INSERT INTO public.pagamentos (id, abastecimento_id, cliente_id, valor, metodo, referencia, data_pagamento, estado) VALUES
    (gen_random_uuid(), a1,  c1,  1250.00,  'mpesa'::public.pagamento_metodo,         'REF-001-2026', now() - interval '58 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a2,  c2,  4200.00,  'transferencia'::public.pagamento_metodo, 'REF-002-2026', now() - interval '53 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a3,  c3,  18500.00, 'transferencia'::public.pagamento_metodo, 'REF-003-2026', now() - interval '48 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a4,  c4,  8750.00,  'emola'::public.pagamento_metodo,         'REF-004-2026', now() - interval '43 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a6,  c6,  750.00,   'dinheiro'::public.pagamento_metodo,      'REF-006-2026', now() - interval '33 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a7,  c7,  1000.00,  'mpesa'::public.pagamento_metodo,         'REF-007-2026', now() - interval '28 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a8,  c8,  11100.00, 'transferencia'::public.pagamento_metodo, 'REF-008-2026', now() - interval '23 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a9,  c9,  3150.00,  'transferencia'::public.pagamento_metodo, 'REF-009-2026', now() - interval '18 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a10, c10, 29600.00, 'transferencia'::public.pagamento_metodo, 'REF-010-2026', now() - interval '13 days', 'pago'::public.pagamento_estado),
    (gen_random_uuid(), a11, c11, 1500.00,  'mpesa'::public.pagamento_metodo,         'REF-011-2026', now() - interval '8 days',  'pago'::public.pagamento_estado),
    -- Pending payments
    (gen_random_uuid(), a12, c12, 2100.00,  'transferencia'::public.pagamento_metodo, NULL,           now() - interval '7 days',  'pendente'::public.pagamento_estado),
    (gen_random_uuid(), a13, c1,  1250.00,  'mpesa'::public.pagamento_metodo,         NULL,           now() - interval '3 days',  'pendente'::public.pagamento_estado),
    (gen_random_uuid(), a14, c4,  8750.00,  'emola'::public.pagamento_metodo,         NULL,           now() - interval '1 day',   'pendente'::public.pagamento_estado),
    (gen_random_uuid(), a15, c5,  1800.00,  'transferencia'::public.pagamento_metodo, NULL,           now(),                       'pendente'::public.pagamento_estado)
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
