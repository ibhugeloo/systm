import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/get-dictionaries";
import MvpClientWrapper from "@/components/mvp/mvp-client-wrapper";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MvpPageProps {
  params: Promise<{
    locale: string;
    clientId: string;
  }>;
}

export default async function MvpPage({ params }: MvpPageProps) {
  const { locale, clientId } = await params;
  const supabase = await createClient();

  // Fetch client data
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    notFound();
  }

  const dict = await getDictionary(locale as "fr");

  // Fetch MVP for this client
  const { data: mvp } = await supabase
    .from("mvps")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // If no MVP exists, show generate CTA
  if (!mvp) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <h1 className="text-3xl font-bold">{dict.mvp.title}</h1>
          <p className="text-lg text-gray-600 max-w-md text-center">
            {dict.mvp.subtitle} - {client.company_name}
          </p>
          <Link href={`/${locale}/dashboard/clients/${clientId}/onboarding`}>
            <Button size="lg">{dict.onboarding.form_submitted}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 -m-6">
      <MvpClientWrapper
        initialCanvas={mvp.canvas_data as any}
        mvpId={mvp.id}
        currentUserId="local-admin-goat"
      />
    </div>
  );
}
