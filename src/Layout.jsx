import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { auth,db } from "./FirebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function Layout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDoc(doc(db, "users", user.uid)).then((doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setUser(userData);
          } else {
            console.log("No such document!"); // use
            // User document does not exist
          }
        }).catch((error) => {
           console.error("Error getting user document:", error);
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="">
      <div className="bg-gray-200">
        <Header user={user} />
        <Outlet context={[user, setUser]} />
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
