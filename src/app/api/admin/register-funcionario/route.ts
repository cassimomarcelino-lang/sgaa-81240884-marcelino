import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { nome, email, password, tipo } = await req.json();

    if (!nome || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // Fallback: use anon key with signUp (user will need to confirm email)
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) {
        return NextResponse.json({ error: 'Configuração do Supabase em falta.' }, { status: 500 });
      }

      const supabase = createClient(supabaseUrl, anonKey);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nome } },
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      if (authData.user) {
        await supabase.from('user_profiles').upsert({
          id: authData.user.id,
          nome,
          email,
          tipo: tipo || 'funcionario',
          estado: 'ativo',
        });
      }

      return NextResponse.json({ success: true, user: authData.user });
    }

    // Use service role to create user without email confirmation
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nome },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (authData.user) {
      const { error: profileError } = await adminSupabase.from('user_profiles').insert({
        id: authData.user.id,
        nome,
        email,
        tipo: tipo || 'funcionario',
        estado: 'ativo',
      });

      if (profileError) {
        // Rollback: delete the auth user
        await adminSupabase.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
