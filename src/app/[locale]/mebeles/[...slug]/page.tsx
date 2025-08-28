import TopBar from '../../components/TopBar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BottomMenu from '../../components/BottomMenu';
import CategoryContent from './components/CategoryContent';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  
  // Join the slug array to create the full category path
  const categoryPath = slug.join('/');

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <TopBar />
      <Header />
      <CategoryContent locale={locale} categoryPath={categoryPath} />
      <Footer />
      <BottomMenu />
    </div>
  );
}