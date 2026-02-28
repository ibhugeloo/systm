import { Locale } from './i18n-config';

interface Dictionary {
  common: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  onboarding: Record<string, string>;
  mvp: Record<string, string>;
  handoff: Record<string, string>;
  portal: Record<string, string>;
}

export async function getDictionary(_locale?: Locale): Promise<Dictionary> {
  const dictionary = await import('@/dictionaries/fr.json');
  return dictionary.default as Dictionary;
}
