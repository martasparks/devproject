export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laipni lūdzam admin panelī</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Tulkojumi</h2>
          <p className="text-gray-600">Pārvaldi tulkojumus visām valodām.</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Produkti</h2>
          <p className="text-gray-600">Pievieno un labot produktus.</p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Lietotāji</h2>
          <p className="text-gray-600">Pārvaldi lietotāju kontus un lomas.</p>
        </div>
      </div>
    </div>
  );
}
