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

// GET /api/servicos — list all
export async function GET() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  const { data, error } = await admin
    .from('servicos')
    .select('*')
    .order('nome', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/servicos — create
export async function POST(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { nome, descricao, unidade, preco_unitario, estado } = body;

    if (!nome || !unidade) {
      return NextResponse.json({ error: 'Nome e unidade são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('servicos')
      .insert([{
        nome,
        descricao: descricao || null,
        unidade,
        preco_unitario,
        estado: estado || 'ativo',
      }])
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

// PUT /api/servicos — update
export async function PUT(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, nome, descricao, unidade, preco_unitario, estado } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('servicos')
      .update({
        nome,
        descricao: descricao || null,
        unidade,
        preco_unitario,
        estado,
      })
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

// DELETE /api/servicos — delete
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
      .from('servicos')
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
