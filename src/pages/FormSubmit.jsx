import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  getDocs,
  where,
  doc,
  collection,
  getDoc,
  query,
  addDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useParams, useOutletContext } from "react-router-dom";
import Select from "react-select";
import FormViewer from "../components/FormViewer";

function FormSubmit() {
  const [user, setUser] = useOutletContext();
  const [forms, setForms] = useState([]);
  const [formOptions, setFormOptions] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [instructorOptions, setInstructorOptions] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [submitDate, setSubmitDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const fetchForm = async () => {
    const classDoc = doc(db, "classes", user.class);
    const classQuery = await getDoc(classDoc);
    const classData = classQuery.data();
    const classForm = classData.forms;
    const formDocs = await getDocs(collection(db, "forms"));
    const formData = formDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setForms(formData.filter((item) => classForm.includes(item.id)));
    setFormOptions(
      formData
        .filter((item) => {
          return !forms.map((form) => form.id).includes(item.id);
        })
        .map((form) => ({
          value: form.id,
          label: form.form.name,
        }))
    );
  };
  

  const fetchInstructor = async () => {
    const q = query(collection(db, "users"), where("role", "==", "instructor"));
    const instructorDocs = await getDocs(q);
    const fetchedInstructors = instructorDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log(fetchedInstructors);
    setInstructors(fetchedInstructors);
    setInstructorOptions(
      fetchedInstructors.map((instructor) => ({
        value: instructor.id,
        label: instructor.name,
      }))
    );
  };

  const handleChange = (questions) => {
    setSelectedForm((prev) => ({
      ...prev,
      form: { ...prev.form, questions },
    }));
  };

  const handleSelectForm = (selectedOption) => {
    let formData = forms.find((form) => form.id === selectedOption.value);
    setSelectedForm(formData);
  };

  const handleSelectInstructor = (selectedOption) => {
    setSelectedInstructor(selectedOption.value);
  };

  const submitForm = async () => {
    const data = {
      form: selectedForm,
      user: { id: user.id, name: user.name },
      instructor: {
        id: selectedInstructor,
        name: instructors.find(
          (instructor) => instructor.id === selectedInstructor
        ).name,
      },
      submitDate,
      approve: false,
    };
    await addDoc(collection(db, "submissions"), data)
      .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
    alert("Form submitted successfully");
  };

  useEffect(() => {
    fetchForm();
    fetchInstructor();
  }, [user]);



  return (
    <div className="p-4">
      <Breadcrumbs
        links={[
          { label: "Home", value: "/" },
          { label: "Dashboard", value: "/dashboard" },
          { label: "Submit Form", value: "/form/submit" },
        ]}
      />
          <h1 className="text-2xl w-full text-center font-opunbold my-5">ส่งแบบประเมิน</h1>
          <Select className="text-sm" options={formOptions} onChange={handleSelectForm} />

      <div className="my-5">
        <label className="label" htmlFor="">
          ชื่อแบบประเมิน
        </label>
        <h1 className="text-sm md:text-xl fontbold p-2">
          {selectedForm ? selectedForm.form.name : ""}
        </h1>
        <label className="label " htmlFor="">
          ชื่อนักศึกษา
        </label>
        <h1 className="text-sm md:text-xl fontbold p-2">{user ? user.name : ""}</h1>
        <label className="label " htmlFor="">
          อาจารย์ผู้ประเมิน
        </label>
        <Select className="text-sm" options={instructorOptions} onChange={handleSelectInstructor} />
        <label className="label " htmlFor="">
          วันที่ส่งประเมิน
        </label>
        <input
          type="date"
          className="input text-sm input-bordered w-full"
          value={submitDate}
          onChange={(e) => setSubmitDate(e.target.value)}
        />
      </div>
      <FormViewer
        questions={selectedForm ? selectedForm.form.questions : []}
        setQuestions={handleChange}
        role={user ? user.role : ""}
      />

      <div className="p-5">
        <div className="btn btn-neutral w-full" onClick={submitForm}>
          ส่งแบบประเมิน
        </div>
      </div>
    </div>
  );
}

export default FormSubmit;
