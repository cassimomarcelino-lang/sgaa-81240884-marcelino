import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/clientes — list all
export async function GET() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  const { data, error } = await admin
    .from('clientes')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/clientes — create
export async function POST(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { nome, telefone, email, documento, endereco } = body;

    if (!nome || !telefone) {
      return NextResponse.json({ error: 'Nome e telefone são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('clientes')
      .insert([{ nome, telefone, email: email || null, documento: documento || null, endereco: endereco || null }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// PUT /api/clientes — update
export async function PUT(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, nome, telefone, email, documento, endereco } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('clientes')
      .update({ nome, telefone, email: email || null, documento: documento || null, endereco: endereco || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// DELETE /api/clientes — delete
export async function DELETE(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { error } = await admin
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}
