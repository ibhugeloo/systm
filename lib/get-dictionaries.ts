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

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  try {
    const dictionary = await import(`@/dictionaries/${locale}.json`);
    return dictionary.default as Dictionary;
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    throw new Error(`Dictionary not found for locale: ${locale}`);
  }
}
