import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, query, collection } from "firebase/firestore";
import { db, auth } from "../FirebaseConfig";
import Select from "react-select";

const UserImport = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleFileChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleSelectClass = (selectedOption) => {
    setSelectedClass(selectedOption.value); 
};


  const fetchClasses = async () => {
    const q = query(collection(db, "classes"));
    const classDocs = await getDocs(q);
    const classData = classDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log(classData);
    setClasses(classData);
    setClassOptions(
      classData.map((classItem) => ({
        value: classItem.id,
        label: classItem.name,
      }))
    );
  };

  const handleFileUpload = () => {
    if (!csvFile) {
      alert("Please upload a CSV file.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const usersData = results.data;

        for (let userData of usersData) {
          try {
            // Destructure userData from CSV columns
            const { name, email, password, student_id, role, ER_report, interesting_case, hospital } = userData;

            // Create user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );
            const userId = userCredential.user.uid;

            // Add user details to Firestore
            await setDoc(doc(db, "users", userId), {
              name,
              email,
              role,
              student_id,
              ER_report,
              interesting_case,
              hospital,
              class: selectedClass,
            });

            console.log(`User ${name} registered successfully.`);
          } catch (error) {
            console.error("Error registering user:", error);
          }
        }

        alert("All users have been processed.");
        await signOut(auth);
        window.location.href = "/";
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
      },
    });
  };
  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl">Upload CSV to Register Users</h2>
      <input
        className="file-input file-input-bordered"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
      />
      <Select options={classOptions} onChange={handleSelectClass} />
      <button className="btn btn-primary text-white" onClick={handleFileUpload}>Import</button>
    </div>
  );
};

export default UserImport;
