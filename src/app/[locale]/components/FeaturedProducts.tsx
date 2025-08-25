const featuredProducts = [
  { name: "iPhone 15 Pro", price: "999€", image: "📱" },
  { name: "Samsung Galaxy", price: "799€", image: "📱" },
  { name: "Nike Air Max", price: "129€", image: "👟" },
  { name: "MacBook Air", price: "1199€", image: "💻" }
];

export default function FeaturedProducts() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Populārākie produkti</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-6xl mb-4">{product.image}</div>
              <h4 className="text-lg font-semibold mb-2">{product.name}</h4>
              <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
                Pirkt
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}