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

// GET /api/pontos — list all
export async function GET() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  const { data, error } = await admin
    .from('pontos_abastecimento')
    .select('*, clientes(nome, telefone)')
    .order('identificacao', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/pontos — create
export async function POST(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { cliente_id, identificacao, endereco, bairro, cidade, tipo, estado } = body;

    if (!cliente_id || !identificacao) {
      return NextResponse.json({ error: 'Cliente e identificação são obrigatórios.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('pontos_abastecimento')
      .insert([{
        cliente_id,
        identificacao,
        endereco: endereco || null,
        bairro: bairro || null,
        cidade: cidade || null,
        tipo,
        estado,
      }])
      .select('*, clientes(nome, telefone)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// PUT /api/pontos — update
export async function PUT(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, cliente_id, identificacao, endereco, bairro, cidade, tipo, estado } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('pontos_abastecimento')
      .update({
        cliente_id,
        identificacao,
        endereco: endereco || null,
        bairro: bairro || null,
        cidade: cidade || null,
        tipo,
        estado,
      })
      .eq('id', id)
      .select('*, clientes(nome, telefone)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// DELETE /api/pontos — delete
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
      .from('pontos_abastecimento')
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
