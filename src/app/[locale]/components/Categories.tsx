const categories = [
  { name: "Elektronika", image: "📱", description: "Telefoni, planšetes, datori" },
  { name: "Apģērbs", image: "👕", description: "Modes preces visai ģimenei" },
  { name: "Mājas preces", image: "🏠", description: "Dekori, mēbeles, virtuves preces" },
  { name: "Sports", image: "⚽", description: "Sporta inventārs un aprīkojums" },
  { name: "Grāmatas", image: "📚", description: "Izglītības un izklaides literatūra" },
  { name: "Kosmētika", image: "💄", description: "Skaistumkopšanas produkti" }
];

export default function Categories() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12">Populārās kategorijas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">{category.image}</div>
              <h4 className="text-xl font-semibold mb-2">{category.name}</h4>
              <p className="text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}