import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    if (role === "dueño") {
      navigate("/dueño");
    } else if (role === "inquilino") {
      navigate("/inquilino");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      <button
        onClick={() => handleLogin("dueño")}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
      >
        Ingresar como Dueño
      </button>
      <button
        onClick={() => handleLogin("inquilino")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Ingresar como Inquilino
      </button>
    </div>
  );
}

export default Login;
