const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "miconjunto-166a5-firebase-adminsdk-fbsvc-0c4edf1dbd.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Ruta básica para la raíz
app.get("/", (req, res) => {
    res.send("Servidor backend funcionando correctamente.");
  });
  
  // Ruta para eliminar un usuario de Firebase Authentication
  app.post("/eliminarUsuario", async (req, res) => {
    const { uid } = req.body;
  
    try {
      // Eliminar el usuario de Firebase Authentication
      await admin.auth().deleteUser(uid);
      res.status(200).send("Usuario eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(500).send("Error al eliminar el usuario.");
    }
  });

  // Ruta para editar un usuario de Firebase Authentication
app.post("/editarUsuario", async (req, res) => {
    const { uid, email, nombre } = req.body;
  
    try {
      // Actualizar el usuario en Firebase Authentication
      await admin.auth().updateUser(uid, { email });
  
      // Opcional: Si tienes campos personalizados en Firestore, puedes actualizarlos aquí
      res.status(200).send("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al editar el usuario:", error);
      res.status(500).send("Error al editar el usuario.");
    }
  });

  // Ruta para editar un usuario de Firebase Authentication
// Ruta para editar un usuario de Firebase Authentication
app.post("/editarUsuario", async (req, res) => {
    const { uid, email } = req.body;
  
    try {
      // Actualizar el usuario en Firebase Authentication
      await admin.auth().updateUser(uid, { email });
  
      res.status(200).send("Usuario actualizado correctamente.");
    } catch (error) {
      console.error("Error al editar el usuario:", error);
      res.status(500).send("Error al editar el usuario.");
    }
  });

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});