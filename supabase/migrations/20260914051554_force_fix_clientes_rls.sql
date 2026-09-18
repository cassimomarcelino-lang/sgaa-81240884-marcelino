-- Force fix: drop ALL existing RLS policies on clientes and recreate them
-- This migration ensures authenticated users can perform all CRUD operations

-- Step 1: Drop every policy that may exist on clientes (by name or dynamically)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'clientes'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.clientes', pol.policyname);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Step 3: Recreate explicit policies for each operation
-- SELECT
DROP POLICY IF EXISTS "clientes_select" ON public.clientes;
CREATE POLICY "clientes_select"
  ON public.clientes
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT
DROP POLICY IF EXISTS "clientes_insert" ON public.clientes;
CREATE POLICY "clientes_insert"
  ON public.clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE
DROP POLICY IF EXISTS "clientes_update" ON public.clientes;
CREATE POLICY "clientes_update"
  ON public.clientes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE
DROP POLICY IF EXISTS "clientes_delete" ON public.clientes;
CREATE POLICY "clientes_delete"
  ON public.clientes
  FOR DELETE
  TO authenticated
  USING (true);
