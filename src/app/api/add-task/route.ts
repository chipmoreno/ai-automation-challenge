import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  const { task, user_identifier } = await request.json();

  if (!task || !user_identifier) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([{ task, user_identifier, is_complete: false }])
    .select();

  if (error) {
    console.error('Error inserting task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Success', data }, { status: 200 });
}
