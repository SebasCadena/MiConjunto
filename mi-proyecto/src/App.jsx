import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import PanelDueño from "./pages/PanelDueño";
import PanelInquilino from "./pages/PanelInquilino";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
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
  );
};

export default App;