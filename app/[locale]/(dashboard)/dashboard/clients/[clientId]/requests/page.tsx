import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ locale: string; clientId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { locale, clientId } = await params;
  redirect(`/${locale}/dashboard/projects/${clientId}/requests`);
}
