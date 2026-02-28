export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { getDictionary } from '@/lib/get-dictionaries';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface TeamPageProps {
  params: Promise<{ locale: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { locale } = await params;
  const supabase = await createClient();
  const dict = await getDictionary(locale as 'fr' | 'en');

  // Fetch team members
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'team_member'])
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.team}</h1>
        <p className="text-muted-foreground mt-1">
          {members?.length || 0} membre{(members?.length || 0) > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(members || []).map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {member.full_name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{member.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                  {member.role === 'admin' ? 'Admin' : 'Membre'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
