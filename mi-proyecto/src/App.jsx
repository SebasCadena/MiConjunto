import { BrowserRouter as Navigate , Router, Routes, Route } from "react-router-dom";
import useUserRole from "./hooks/useUserRole";
import { useState } from "react";
import Login from "./pages/Login";
import PanelDueño from "./pages/PanelDueño";
import PanelInquilino from "./pages/PanelInquilino";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

import { db } from "./pages/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const App = () => {
  const [datos, setDatos] = useState([]);

  const { rol, loading } = useUserRole();

  if (loading) return <p>Cargando...</p>; 

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "test"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDatos(data);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Ruta protegida para dueños */}
        <Route path="/dashboard" element={rol === "dueño" ? <Dashboard /> : <Navigate to="/" />} />

        {/* Ruta protegida para inquilinos */}
        <Route path="/inquilino" element={rol === "inquilino" ? <InquilinoPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>,


    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dueño"
        element={
          <ProtectedRoute requiredRole="dueño">
            <PanelDueño />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inquilino"
        element={
          <ProtectedRoute requiredRole="inquilino">
            <PanelInquilino />
          </ProtectedRoute>
        }
      />
    </Routes>,


    <div>
      {/* Sección de Firebase */}
      <div className="p-5">
        <h1 className="text-xl font-bold">Prueba Firebase</h1>
        <button onClick={fetchData} className="bg-blue-500 text-white p-2 rounded">
          Obtener Datos
        </button>

        <ul className="mt-5">
          {datos.map((item) => (
            <li key={item.id} className="border p-2 my-2">
              {JSON.stringify(item)}
            </li>
          ))}
        </ul>
      </div>

      {/* Rutas */}
      
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dueño" element={<PanelDueño />} />
          <Route path="/inquilino" element={<PanelInquilino />} />
        </Routes>
    
    </div>
  );
}

export default App;
