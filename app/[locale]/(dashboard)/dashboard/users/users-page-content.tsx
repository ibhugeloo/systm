'use client';

import { useState } from 'react';
import { Plus, Shield, Users2, UserCheck, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import UserFormDialog from '@/components/users/user-form-dialog';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
}

const roleBadge: Record<string, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  admin: {
    label: 'Administrateur',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    icon: Shield,
  },
  team_member: {
    label: 'Équipe',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Users2,
  },
  client: {
    label: 'Client',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: UserCheck,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UsersPageContent({ users }: { users: User[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreate = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const count = users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">
            {count} utilisateur{count > 1 ? 's' : ''}
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Aucun utilisateur</p>
            <Button className="gap-2" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Créer un utilisateur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Utilisateur</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Rôle</th>
                    <th className="p-4 font-medium">Créé le</th>
                    <th className="p-4 font-medium w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const badge = roleBadge[user.role] || roleBadge.client;
                    const BadgeIcon = badge.icon;

                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-xs">
                                {getInitials(user.full_name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.full_name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badge.className}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingUser ? 'edit' : 'create'}
        userId={editingUser?.id}
        initialData={
          editingUser
            ? {
                full_name: editingUser.full_name || '',
                email: editingUser.email || '',
                role: editingUser.role || 'team_member',
              }
            : undefined
        }
      />
    </div>
  );
}
