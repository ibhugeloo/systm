export const i18n = {
  defaultLocale: 'fr' as const,
  locales: ['fr'] as const,
};

export type Locale = (typeof i18n)['locales'][number];
