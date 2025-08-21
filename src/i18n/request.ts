import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import prisma from '@lib/prisma';

async function loadMessages(locale: string) {
  const translations = await prisma.translation.findMany({
    where: { locale }
  });

  const messages: Record<string, any> = {};

  for (const t of translations) {
    if (!messages[t.namespace]) {
      messages[t.namespace] = {};
    }
    messages[t.namespace][t.key] = t.value;
  }

  return messages;
}

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale)
  };
});