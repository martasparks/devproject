export function getCategoryUrl(category: any, locale: string) {
  const path = [];
  let current = category;

  while (current) {
    path.unshift(current.slug);
    current = current.parent;
  }

  return `/${locale}/mebeles/${path.join('/')}`;
}