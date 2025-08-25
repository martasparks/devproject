export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="text-lg font-semibold mb-4">E-Veikals</h5>
            <p className="text-gray-400">Jūsu uzticamais partneris tiešsaistes iepirkšanās pieredzē.</p>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Saites</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Par mums</a></li>
              <li><a href="#" className="hover:text-white">Kontakti</a></li>
              <li><a href="#" className="hover:text-white">Piegāde</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Kategorijas</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Elektronika</a></li>
              <li><a href="#" className="hover:text-white">Apģērbs</a></li>
              <li><a href="#" className="hover:text-white">Mājas preces</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Palīdzība</h5>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Atbalsts</a></li>
              <li><a href="#" className="hover:text-white">Privātuma politika</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 E-Veikals. Visas tiesības aizsargātas.</p>
        </div>
      </div>
    </footer>
  );
}