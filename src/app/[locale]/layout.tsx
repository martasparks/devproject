import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { routing } from '@/i18n/routing';
import prisma from '@lib/prisma';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

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

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  const messages = await loadMessages(locale);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <CategoriesProvider>
        {children}
      </CategoriesProvider>
    </NextIntlClientProvider>
  );
}
