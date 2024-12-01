import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FormBuilder from "../components/FormBuilder";
import { useParams, useLocation } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import Breadcrumbs from "../components/Breadcrumbs";

function FormEdit() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const form_id = queryParams.get('id');
  const [form, setForm] = useState(null);

  const fetchForm = async (id) => {
    const formDoc = doc(db, "forms", id);
    const formSnap = await getDoc(formDoc);
    if (formSnap.exists()) {
      setForm({ ...formSnap.data(), id: formSnap.id });
    } else {
      console.log("No such document!");
    }
  };

  useEffect(() => {
    if (form_id) {
      fetchForm(form_id);
    }
  }, [form_id]);

  return (
    <div className="">
      <div className="p-4">
        <Breadcrumbs
          links={[
            { label: "Home", value: "/" },
            { label: "Dashboard", value: "/dashboard?tab=forms" },
            { label: "Edit Form", value: `/form_edit?id=${form_id}` },
          ]}
        />
      </div>

      <DndProvider backend={HTML5Backend}>
        <FormBuilder currentForm={form} />
      </DndProvider>
    </div>
  );
}

export default FormEdit;
