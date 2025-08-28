export function processSliderButtonUrl(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('#')
  ) {
    return trimmedUrl;
  }

  let processedUrl = trimmedUrl;
  
  if (processedUrl.startsWith('/')) {
    processedUrl = processedUrl.substring(1);
  }

  const locales = ['lv', 'en', 'ru'];
  for (const locale of locales) {
    if (processedUrl.startsWith(`${locale}/`)) {
      processedUrl = processedUrl.substring(locale.length + 1);
      break;
    }
  }

  return processedUrl;
}

export function getLocalizedSliderUrl(storedUrl: string, locale: string): string {
  if (!storedUrl || storedUrl.trim() === '') {
    return '#';
  }

  const trimmedUrl = storedUrl.trim();

  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('#')
  ) {
    return trimmedUrl;
  }

  return `/${locale}/${trimmedUrl}`;
}

export function getUrlPlaceholderExamples(locale: string = 'lv'): {
  internal: string;
  external: string;
  phone: string;
} {
  const examples = {
    lv: {
      internal: 'mebeles/izpardosana vai produkti/krēsli',
      external: 'https://example.com',
      phone: 'tel:+37122722280'
    },
    en: {
      internal: 'furniture/sale or products/chairs', 
      external: 'https://example.com',
      phone: 'tel:+37122722280'
    },
    ru: {
      internal: 'мебель/распродажа или товары/стулья',
      external: 'https://example.com', 
      phone: 'tel:+37122722280'
    }
  };

  return examples[locale as keyof typeof examples] || examples.lv;
}

export function displaySliderButtonUrl(storedUrl: string): string {
  return storedUrl || '';
}