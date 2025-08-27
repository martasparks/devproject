import TopBar from "./components/TopBar";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import Categories from "./components/Categories";
import FeaturedProducts from "./components/FeaturedProducts";
import Features from "./components/Features";
import Footer from "./components/Footer";
import BottomMenu from "./components/BottomMenu";
import prisma from "@lib/prisma";
import Menu from "./components/Menu";

async function getActiveSliders() {
  try {
    const sliders = await prisma.slider.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return sliders;
  } catch (error) {
    console.error('Error fetching active sliders:', error);
    return [];
  }
}

export default async function HomePage() {
  const sliders = await getActiveSliders();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <TopBar />
      <Header />
      <Menu />
      <HeroSlider initialSliders={sliders} />
      <Categories />
      <FeaturedProducts />
      <Features />
      <Footer />
      <BottomMenu />
    </div>
  );
}
