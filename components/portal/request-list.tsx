'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Request {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

interface RequestListProps {
  requests: Request[];
  locale?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  in_review: 'En cours',
  done: 'Terminé',
  rejected: 'Rejeté',
};

const TYPE_LABELS: Record<string, string> = {
  feature: 'Fonctionnalité',
  bug: 'Bug',
  meeting: 'Réunion',
  question: 'Question',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function RequestList({ requests, locale = 'fr' }: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune requête pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Card key={req.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{req.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABELS[req.type] || req.type}
                  </Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[req.priority] || ''}`}>
                    {req.priority}
                  </span>
                </div>
                {req.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {req.description}
                  </p>
                )}
              </div>
              <Badge variant={req.status === 'done' ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
                {STATUS_LABELS[req.status] || req.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(req.created_at).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
