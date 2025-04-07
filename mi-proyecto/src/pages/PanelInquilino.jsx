const PanelInquilino = () => {
  return (
    <div className="flex h-screen bg-teal-50">
      {/* Barra lateral */}
      <aside className="w-1/4 bg-teal-100 p-6 flex flex-col items-center">
        <div className="mb-6 text-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full mb-4 mx-auto"></div>
          <h2 className="font-bold text-lg">Mi Conjunto</h2>
          <p className="text-gray-600">Juan Sebastian Cadena Varela</p>
        </div>
        <nav className="flex flex-col space-y-4 w-full">
          <button className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200">
            Foro
          </button>
          <button className="py-2 px-4 bg-blue-100 rounded hover:bg-blue-200">
            Editar Perfil
          </button>
          <button className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Villa Campestre</h1>
        </div>

        <div className="bg-white p-6 rounded shadow-md text-center mb-6">
          <p className="text-lg font-semibold">Apartamento 1</p>
          <p className="text-gray-600">Dirección: Carrera 3 Norte # 4 - 25</p>
        </div>

        <div className="bg-white p-6 rounded shadow-md flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full mr-4"></div>
            <div>
              <p className="font-bold">Juan Cadena</p>
              <p className="text-gray-600">N° Contrato - 1116.070.995</p>
              <p className="text-gray-600">Apartamento 1</p>
              <p className="text-gray-600">Fecha Pago: 26/03</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Total: 1.000.000</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Visitas
          </button>
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Reservar
          </button>
          <button className="py-2 px-6 bg-teal-500 text-white rounded hover:bg-teal-600">
            Pagar
          </button>
        </div>
      </main>
    </div>
  );
};

export default PanelInquilino;