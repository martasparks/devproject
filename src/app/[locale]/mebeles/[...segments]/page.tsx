import { notFound } from 'next/navigation';
import TopBar from '../../components/TopBar';
import Header from '../../components/Header';
import Menu from '../../components/Menu';
import Footer from '../../components/Footer';
import BottomMenu from '../../components/BottomMenu';
import CategoryContent from './components/CategoryContent';
import ProductDetail from './components/ProductDetail';
import { parseProductUrl, findProductByUrlPath } from '@/lib/product-utils';
import { getCategoryUrl } from '@/lib/categories';
import prisma from '@/lib/prisma';

interface DynamicPageProps {
  params: Promise<{ locale: string; segments: string[] }>;
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const { locale, segments } = await params;
  
  // Try to parse as product URL first
  const productUrlData = parseProductUrl(segments);
  
  if (productUrlData) {
    // This might be a product URL - try to find the product
    const product = await findProductByUrlPath(productUrlData.categoryPath, productUrlData.productSlug);
    
    if (product) {
      
      // Convert Decimal objects to numbers for Client Components
      const serializedProduct = {
        ...product,
        price: Number(product.price),
        salePrice: product.salePrice ? Number(product.salePrice) : null,
        width: product.width ? Number(product.width) : null,
        depth: product.depth ? Number(product.depth) : null,
        height: product.height ? Number(product.height) : null,
        weight: product.weight ? Number(product.weight) : null,
      };
      
      // This is a product page
      return (
        <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
          <TopBar />
          <Header />
          <Menu />
          <ProductDetail locale={locale} product={serializedProduct} />
          <Footer />
          <BottomMenu />
        </div>
      );
    }
  }
  
  // Not a product URL or product not found - try as category URL
  const categoryPath = segments.join('/');
  
  // Find category by the full path
  const category = await findCategoryByPath(segments);
  
  if (category) {
    // This is a category page
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <TopBar />
        <Header />
        <Menu />
        <CategoryContent locale={locale} categoryPath={categoryPath} initialCategory={category} />
        <Footer />
        <BottomMenu />
      </div>
    );
  }
  
  // Neither product nor category found
  notFound();
}

async function findCategoryByPath(segments: string[]) {
  // Try to find category by the last segment (most specific)
  const lastSegment = segments[segments.length - 1];
  
  const category = await prisma.category.findUnique({
    where: { slug: lastSegment },
    include: {
      parent: {
        include: {
          parent: {
            include: {
              parent: true
            }
          }
        }
      },
      children: {
        include: {
          _count: {
            select: { products: true }
          }
        }
      },
      _count: {
        select: { products: true }
      }
    }
  });
  
  if (!category) {
    return null;
  }
  
  // Build the actual path for this category
  const actualPath: string[] = [];
  let currentCategory = category;
  
  while (currentCategory) {
    actualPath.unshift(currentCategory.slug);
    currentCategory = currentCategory.parent;
  }
  
  // Check if the URL path matches the actual category path
  const urlPath = segments.join('/');
  const categoryPath = actualPath.join('/');
  
  if (urlPath === categoryPath) {
    return category;
  }
  
  return null;
}
