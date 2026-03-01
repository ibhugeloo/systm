import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession, hashPassword } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { full_name, email, password, role } = await request.json();

  if (!full_name || !email || !password || !role) {
    return NextResponse.json(
      { error: 'Tous les champs sont requis' },
      { status: 400 }
    );
  }

  if (!['admin', 'team_member', 'client'].includes(role)) {
    return NextResponse.json(
      { error: 'Rôle invalide' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Un utilisateur avec cet email existe déjà' },
      { status: 409 }
    );
  }

  const password_hash = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('profiles')
    .insert({
      full_name,
      email,
      password_hash,
      role,
    })
    .select('id, email, full_name, role, avatar_url, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(user, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id, full_name, email, password, role } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  const supabase = await createClient();

  const updates: Record<string, string> = {};
  if (full_name) updates.full_name = full_name;
  if (email) updates.email = email;
  if (role && ['admin', 'team_member', 'client'].includes(role)) updates.role = role;
  if (password) updates.password_hash = await hashPassword(password);

  const { data: user, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id, email, full_name, role, avatar_url, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest) {
  const session = await getAuthSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 });
  }

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas supprimer votre propre compte' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
