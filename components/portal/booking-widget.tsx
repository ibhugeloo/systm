'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video } from 'lucide-react';

interface BookingWidgetProps {
  calcomUrl?: string;
}

export default function BookingWidget({ calcomUrl }: BookingWidgetProps) {
  if (calcomUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prendre rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            src={calcomUrl}
            className="w-full h-[500px] border-0 rounded-lg"
            title="Calendrier de réservation"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prendre rendez-vous</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Contactez notre équipe pour planifier un appel
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Video className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Appel de suivi</p>
              <p className="text-xs text-muted-foreground">30 min</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:contact@systm.re?subject=Rendez-vous - Suivi">
                Demander
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Démo approfondie</p>
              <p className="text-xs text-muted-foreground">60 min</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:contact@systm.re?subject=Rendez-vous - Démo">
                Demander
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
