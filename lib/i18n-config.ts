export const i18n = {
  defaultLocale: 'fr' as const,
  locales: ['fr', 'en'] as const,
};

export type Locale = (typeof i18n)['locales'][number];
