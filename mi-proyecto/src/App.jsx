import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import PanelDueño from "./pages/PanelDueño";
import PanelInquilino from "./pages/PanelInquilino";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dueño" element={<PanelDueño />} />
        <Route path="/inquilino" element={<PanelInquilino />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
