import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../pages/firebaseConfig";

const FirestoreContext = createContext();

export const FirestoreProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Usuario autenticado
  const [apartamentos, setApartamentos] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratos, setContratos] = useState([]);

  // Escuchar cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Funciones para manejar Firestore
  const getCollection = async (collectionName) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const addDocument = async (collectionName, id, data) => {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, data);
  };

  const updateDocument = async (collectionName, id, data) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  };

  const deleteDocument = async (collectionName, id) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      const fetchedApartamentos = await getCollection("apartamentos");
      const fetchedInquilinos = await getCollection("inquilinos");
      const fetchedContratos = await getCollection("contratos");

      setApartamentos(fetchedApartamentos);
      setInquilinos(fetchedInquilinos);
      setContratos(fetchedContratos);
    };

    fetchData();
  }, []);

  return (
    <FirestoreContext.Provider
      value={{
        user,
        apartamentos,
        inquilinos,
        contratos,
        getCollection,
        addDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => useContext(FirestoreContext);