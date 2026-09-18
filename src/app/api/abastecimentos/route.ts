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

const SELECT_QUERY = `
  *,
  clientes(nome, telefone),
  pontos_abastecimento(identificacao, bairro),
  servicos(nome, unidade),
  user_profiles(nome)
`;

// GET /api/abastecimentos — list all
export async function GET() {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  const { data, error } = await admin
    .from('abastecimentos')
    .select(SELECT_QUERY)
    .order('data_abastecimento', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// POST /api/abastecimentos — create
export async function POST(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { cliente_id, ponto_id, servico_id, quantidade, preco_unitario, data_abastecimento, estado } = body;

    if (!cliente_id || !ponto_id || !servico_id || !quantidade || !preco_unitario || !data_abastecimento) {
      return NextResponse.json({ error: 'Campos obrigatórios em falta.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('abastecimentos')
      .insert([{ cliente_id, ponto_id, servico_id, quantidade, preco_unitario, data_abastecimento, estado: estado || 'solicitado' }])
      .select(SELECT_QUERY)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// PUT /api/abastecimentos — update
export async function PUT(req: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Configuração do servidor em falta.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório.' }, { status: 400 });
    }

    const { data, error } = await admin
      .from('abastecimentos')
      .update(fields)
      .eq('id', id)
      .select(SELECT_QUERY)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 });
  }
}

// DELETE /api/abastecimentos — delete
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
      .from('abastecimentos')
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
