const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, "miconjunto-166a5-firebase-adminsdk-fbsvc-bc3077e943.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Ruta básica para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente.");
});

// Ruta para obtener los datos de un usuario desde Firestore
app.get("/obtenerUsuario/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Buscando usuario con ID:", userId);

    // Obtener el documento del usuario desde Firestore
    const userDocRef = admin.firestore().collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error("Usuario no encontrado:", userId);
      return res.status(404).send({ error: "Usuario no encontrado." });
    }

    const userData = userDoc.data();
    console.log("Usuario encontrado:", userData);

    // Verificar si los datos del usuario están completos
    if (!userData.email || !userData.nombre) {
      console.error("Datos incompletos para el usuario:", userId);
      return res.status(400).send({ error: "Datos incompletos del usuario." });
    }

    res.status(200).send(userData);
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).send({ error: "Error interno del servidor." });
  }
});

// Ruta para eliminar un usuario de Firebase Authentication
app.post("/eliminarUsuario", async (req, res) => {
  const { uid } = req.body;

  try {
    console.log("Eliminando usuario con UID:", uid);

    // Eliminar el usuario de Firebase Authentication
    await admin.auth().deleteUser(uid);
    res.status(200).send("Usuario eliminado correctamente.");
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).send({ error: "Error al eliminar el usuario." });
  }
});

// Ruta para editar un usuario de Firebase Authentication y Firestore
app.post("/editarUsuario", async (req, res) => {
  const { uid, email, nombre } = req.body;

  try {
    console.log("Editando usuario con UID:", uid);

    // Actualizar el usuario en Firebase Authentication
    const updateData = {};
    if (email) updateData.email = email;
    if (nombre) updateData.displayName = nombre;

    await admin.auth().updateUser(uid, updateData);

    // Actualizar Firestore
    const userDocRef = admin.firestore().collection("users").doc(uid);
    await userDocRef.update({ email, nombre });

    console.log("Usuario actualizado correctamente.");
    res.status(200).send("Usuario actualizado correctamente.");
  } catch (error) {
    console.error("Error al editar el usuario:", error);
    res.status(500).send({ error: "Error al editar el usuario." });
  }
});

// Iniciar el servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});