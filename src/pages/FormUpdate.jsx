import React, { useState, useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import {
  getDocs,
  where,
  doc,
  collection,
  getDoc,
  updateDoc,
  query,
  addDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useParams, useOutletContext } from "react-router-dom";
import FormViewer from "../components/FormViewer";

function FormUpdate() {
  const { form_id } = useParams();
  const [user, setUser] = useOutletContext();
  const [selectedForm, setSelectedForm] = useState(null);
  const [submission, setSubmission] = useState(null);

  const fetchForm = async () => {
    const formDoc = doc(db, "submissions", form_id);
    const formQuery = await getDoc(formDoc);
    const formData = { id: formQuery.id, ...formQuery.data() };
    console.log(formData);
    setSubmission(formData);
    setSelectedForm(formData.form);
    
  };

  const handleChange = (questions) => {
    setSelectedForm((prev) => ({
      ...prev,
      form: { ...prev.form, questions },
    }));
  };

  const submitForm = async () => {
    const data = {
      form: selectedForm,
      user: submission.user,
      instructor: submission.instructor,
      submitDate: submission.submitDate,
      approve: user.role === "instructor" ? true : false,
    };
    await updateDoc(doc(db, "submissions", form_id), data).then(() => {
      alert("Form submitted successfully");
      window.location.href = "/dashboard";
    });
  };

  useEffect(() => {
    fetchForm();
  }, [user, form_id]);

  return (
    <div className="p-4">
      <Breadcrumbs
        links={[
          { label: "Home", value: "/" },
          { label: "Dashboard", value: "/dashboard" },
          { label: "Update Form", value: `/form/update/${form_id}` },
        ]}
      />
      <h1 className="mt-5 text-2xl w-full text-center font-opunbold">ตอบแบบประเมิน</h1>
      <div className="my-5">
        <label className="label" htmlFor="">
          ชื่อแบบประเมิน
        </label>
        <h1 className="text-sm md:text-lg text-stone-600 fontbold p-2">
          {selectedForm ? selectedForm.form.name : ""}
        </h1>
        <label className="label " htmlFor="">
          ชื่อนักศึกษา
        </label>
        <h1 className="text-sm md:text-lg text-stone-600 fontbold p-2">
          {submission ? submission.user.name : ""}
        </h1>
        <label className="label " htmlFor="">
          อาจารย์ผู้ประเมิน
        </label>
        <h1 className="text-sm md:text-lg text-stone-600 fontbold p-2">
          {submission ? submission.instructor.name : ""}
        </h1>
        <label className="label " htmlFor="">
          วันที่ส่งประเมิน
        </label>
        <h1 className="text-sm md:text-lg text-stone-600 fontbold p-2">
          {submission ? submission.submitDate : ""}
        </h1>
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

export default FormUpdate;
