interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: Category | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
}

export function getProductUrl(product: Product, locale: string = 'lv'): string {
  const categoryPath = getCategoryPath(product.category);
  return `/${locale}/mebeles/${categoryPath}/${product.slug}`;
}

function getCategoryPath(category: Category): string {
  const paths: string[] = [];
  
  let currentCategory: Category | null = category;
  while (currentCategory) {
    paths.unshift(currentCategory.slug);
    currentCategory = currentCategory.parent || null;
  }
  
  return paths.join('/');
}

export function parseProductUrl(segments: string[]): { categoryPath: string[]; productSlug: string } | null {
  if (segments.length < 2) {
    return null;
  }
  
  const categoryPath = segments.slice(0, -1);
  const productSlug = segments[segments.length - 1];
  
  return {
    categoryPath,
    productSlug
  };
}

export async function findProductByUrlPath(categoryPath: string[], productSlug: string) {
  const { default: prisma } = await import('@lib/prisma');
  
  const product = await prisma.product.findUnique({
    where: { 
      slug: productSlug,
      isActive: true 
    },
    include: {
      category: {
        include: {
          parent: {
            include: {
              parent: {
                include: {
                  parent: true
                }
              }
            }
          }
        }
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true,
          deliveryTime: true,
          logoUrl: true,
          description: true
        }
      },
      images: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!product) {
    return null;
  }

  const actualCategoryPath = getCategoryPath(product.category);
  const expectedCategoryPath = categoryPath.join('/');

  if (actualCategoryPath !== expectedCategoryPath) {
    return null;
  }

  return product;
}
