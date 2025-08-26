import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import prisma from '@lib/prisma';

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale || routing.defaultLocale;
  
  const translations = await prisma.translation.findMany({
    where: {
      locale: locale
    }
  });

  const messages: Record<string, any> = {};
  
  translations.forEach((translation) => {
    if (!messages[translation.namespace]) {
      messages[translation.namespace] = {};
    }
    messages[translation.namespace][translation.key] = translation.value;
  });
  
  return {
    locale,
    messages
  };
});