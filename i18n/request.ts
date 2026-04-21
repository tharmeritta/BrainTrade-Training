import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async (params) => {
  // Handle both older (locale) and newer (requestLocale) next-intl versions
  const requestLocale = (params as any).requestLocale;
  const localeParam = (params as any).locale;
  
  const locale = await (requestLocale || localeParam);
  const validLocale = (['en', 'th'].includes(locale as any) ? locale : 'th') as string;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
