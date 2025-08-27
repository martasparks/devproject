/**
 * Processes URL for storage - removes any locale prefixes and keeps clean path
 * Examples:
 * - "mebeles/izpardosana" -> "mebeles/izpardosana"
 * - "/lv/products/chairs" -> "products/chairs" 
 * - "https://external.com" -> "https://external.com" (unchanged)
 * - "tel:+37122722280" -> "tel:+37122722280" (unchanged)
 * - "mailto:info@example.com" -> "mailto:info@example.com" (unchanged)
 */
export function processSliderButtonUrl(url: string): string {
  if (!url || url.trim() === '') {
    return '';
  }

  const trimmedUrl = url.trim();

  // Return external URLs, protocols, anchors as-is
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('#')
  ) {
    return trimmedUrl;
  }

  // Handle relative URLs - remove any locale prefix for clean storage
  let processedUrl = trimmedUrl;
  
  // Remove leading slash if present
  if (processedUrl.startsWith('/')) {
    processedUrl = processedUrl.substring(1);
  }

  // Remove locale prefixes if present (lv/, en/, ru/)
  const locales = ['lv', 'en', 'ru'];
  for (const locale of locales) {
    if (processedUrl.startsWith(`${locale}/`)) {
      processedUrl = processedUrl.substring(locale.length + 1);
      break;
    }
  }

  return processedUrl;
}

/**
 * Converts stored URL to localized URL for frontend rendering
 * Examples:
 * - "mebeles/izpardosana" + "ru" -> "/ru/mebeles/izpardosana"
 * - "products/chairs" + "en" -> "/en/products/chairs"
 * - "https://external.com" + "lv" -> "https://external.com" (unchanged)
 */
export function getLocalizedSliderUrl(storedUrl: string, locale: string): string {
  if (!storedUrl || storedUrl.trim() === '') {
    return '#';
  }

  const trimmedUrl = storedUrl.trim();

  // Return external URLs, protocols, anchors as-is
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('tel:') ||
    trimmedUrl.startsWith('mailto:') ||
    trimmedUrl.startsWith('#')
  ) {
    return trimmedUrl;
  }

  // For internal URLs, add the current locale prefix
  return `/${locale}/${trimmedUrl}`;
}

/**
 * Get examples for the placeholder based on locale
 */
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

/**
 * For backward compatibility and form display
 */
export function displaySliderButtonUrl(storedUrl: string): string {
  // Since we now store URLs without locale, just return as-is
  return storedUrl || '';
}