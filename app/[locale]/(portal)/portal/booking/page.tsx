'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video } from 'lucide-react';

export default function BookingPage() {
  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Prendre rendez-vous</h1>
        <p className="text-muted-foreground mt-1">
          Planifiez un appel avec notre équipe
        </p>
      </div>

      {/* Cal.com Embed */}
      <Card>
        <CardHeader>
          <CardTitle>Choisissez un créneau</CardTitle>
        </CardHeader>
        <CardContent>
          {process.env.NEXT_PUBLIC_CALCOM_URL ? (
            <iframe
              src={process.env.NEXT_PUBLIC_CALCOM_URL}
              className="w-full h-[600px] border-0 rounded-lg"
              title="Calendrier de réservation"
            />
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-6">
                  Le système de réservation sera bientôt disponible.
                  <br />
                  En attendant, contactez-nous directement.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Video className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Appel de suivi</p>
                      <p className="text-sm text-muted-foreground">30 minutes</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href="mailto:contact@systm.re?subject=Demande de rendez-vous - Suivi">
                          Demander
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Clock className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">Démo approfondie</p>
                      <p className="text-sm text-muted-foreground">60 minutes</p>
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <a href="mailto:contact@systm.re?subject=Demande de rendez-vous - Démo">
                          Demander
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
