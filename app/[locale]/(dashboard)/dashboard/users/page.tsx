import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import UsersPageContent from './users-page-content';

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getAuthSession();

  if (!session || session.user.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }

  const supabase = await createClient();
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at')
    .order('created_at', { ascending: false });

  return <UsersPageContent users={users || []} />;
}
