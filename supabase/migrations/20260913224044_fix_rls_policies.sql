-- Fix RLS policies for all tables to ensure authenticated users can perform all CRUD operations

-- ============================================================
-- Re-apply RLS policies for clientes
-- ============================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_clientes" ON public.clientes;
CREATE POLICY "authenticated_manage_clientes" ON public.clientes
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Re-apply RLS policies for servicos
-- ============================================================
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_servicos" ON public.servicos;
CREATE POLICY "authenticated_manage_servicos" ON public.servicos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Re-apply RLS policies for pontos_abastecimento
-- ============================================================
ALTER TABLE public.pontos_abastecimento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_pontos" ON public.pontos_abastecimento;
CREATE POLICY "authenticated_manage_pontos" ON public.pontos_abastecimento
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Re-apply RLS policies for abastecimentos
-- ============================================================
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_abastecimentos" ON public.abastecimentos;
CREATE POLICY "authenticated_manage_abastecimentos" ON public.abastecimentos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Re-apply RLS policies for pagamentos
-- ============================================================
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_manage_pagamentos" ON public.pagamentos;
CREATE POLICY "authenticated_manage_pagamentos" ON public.pagamentos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Re-apply RLS policies for user_profiles
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_read_all_profiles" ON public.user_profiles;
CREATE POLICY "users_read_all_profiles" ON public.user_profiles
  FOR SELECT TO authenticated
  USING (true);
