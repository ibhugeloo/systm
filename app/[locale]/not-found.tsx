import { FileQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardContent className="flex flex-col items-center text-center py-12 gap-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold">Page introuvable</h2>
          <p className="text-muted-foreground text-sm">
            Cette page n&apos;existe pas.
          </p>
          <Link href="/fr/dashboard">
            <Button variant="outline">Retour au tableau de bord</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
