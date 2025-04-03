import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PanelDueño from "./pages/PanelDueño";
import PanelInquilino from "./pages/PanelInquilino";
import ProtectedRoute from "./components/ProtectedRoute";
import { FirestoreProvider } from "./context/FirestoreContext"; // Importa el FirestoreProvider

const App = () => {
  return (
    <FirestoreProvider> {/* Envuelve toda la aplicación */}
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
      </Routes>
    </FirestoreProvider>
  );
};

export default App;