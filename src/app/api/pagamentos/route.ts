import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('pagamentos')
    .select('*, clientes(nome, telefone)')
    .order('data_pagamento', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const supabase = getServiceClient();
  const body = await req.json();
  const { id, estado } = body;
  if (!id || !estado) return NextResponse.json({ error: 'id e estado são obrigatórios' }, { status: 400 });
  const { error } = await supabase
    .from('pagamentos')
    .update({ estado })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = getServiceClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  const { error } = await supabase.from('pagamentos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
