import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function obterSupabaseAdmin() {
  const url = `https://aqfxsuvpclomkmkqqjds.supabase.co`
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET() {
  try {
    const supabase = obterSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}