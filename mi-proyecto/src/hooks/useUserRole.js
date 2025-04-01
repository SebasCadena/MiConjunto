import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";

const useUserRole = () => {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userRef = doc(db, "users", user.uid); // Asume que los roles están en "users/{uid}"
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setRol(docSnap.data().rol); // Se usa "rol" en vez de "role"
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return { rol, loading };
};

export default useUserRole;
