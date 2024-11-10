import React, { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import Select from "react-select";
import * as XLSX from "xlsx";

function ExportSubmission({ submissions }) {
  const [classes, setClasses] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [forms, setForms] = useState([]);
  const [formOptions, setFormOptions] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  const fetchClasses = async () => {
    const q = query(collection(db, "classes"));
    const classDocs = await getDocs(q);
    const classData = classDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setClasses(classData);
    setClassOptions(
      classData.map((classItem) => ({
        value: classItem.id,
        label: classItem.name,
      }))
    );
  };

  const fetchForms = async ({ forms }) => {
    const q = query(collection(db, "forms"));
    const formDocs = await getDocs(q);
    const formData = formDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const availableForms = formData.filter((item) => forms.includes(item.id));
    setForms(availableForms);
    setFormOptions(
      availableForms.map((form) => ({
        value: form.id,
        label: form.form.name,
      }))
    );
  };

  const exportToExcel = (e) => {
    e.preventDefault();
    const selectedSubmissions = submissions.filter((submission) => {
      return submission.class === selectedClass && submission.form.id === selectedForm && submission.approve;
    });
  
    const selectedFormObj = forms.find((form) => form.id === selectedForm);
    const selectedClassName = classes.find((c) => c.id === selectedClass).name;
    const selectedFormName = selectedFormObj.form.name;
  
    // Create a set to store unique question names
    const questionSet = new Set();
    selectedSubmissions.forEach((submission) => {
      submission.form.form.questions.forEach((question) => {
        questionSet.add(question.question);
      });
    });
  
    // Convert the set to an array
    const questionArray = Array.from(questionSet);
  
    // Map the selected submissions to include questions and answers
    const selectedSubmissionsData = selectedSubmissions.map((submission) => {
      const submissionData = {
        "ชื่อแบบประเมิน": submission.form.form.name,
        "ผู้ส่ง": submission.user.name,
        "ผู้ประเมิน": submission.instructor.name,
        "วันที่ส่ง": submission.submitDate,
      };
  
      // Add questions and answers to the submission data
      submission.form.form.questions.forEach((question) => {
        submissionData[question.question] = question.type == "rating"? parseInt(question.answer):question.answer;
      });
  
      return submissionData;
    });
  
    // Create the worksheet with the selected submissions data
    const ws = XLSX.utils.json_to_sheet(selectedSubmissionsData);
  
    // Add the question columns to the worksheet
    questionArray.forEach((question, index) => {
      const col = XLSX.utils.encode_col(4 + index); // Start from the 5th column (index 4)
      ws[`${col}1`] = { t: "s", v: question }; // Set the header row
    });
  
    // Create the workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
    // Write the workbook to a file
    XLSX.writeFile(wb, `${selectedClassName} - ${selectedFormName}.xlsx`);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchForms(classes.find((c) => c.id === selectedClass));
    }
  }, [selectedClass]);

  return (
    <div className="flex flex-col gap-2 mt-5">
      <label htmlFor="">กลุ่ม</label>
      <Select
        options={classOptions}
        onChange={(selectedOption) => setSelectedClass(selectedOption.value)}
      />
      {selectedClass && (
        <>
          <label htmlFor="">แบบฟอร์ม</label>
          <Select
            options={formOptions}
            onChange={(selectedOption) => setSelectedForm(selectedOption.value)}
          />
        </>
      )}

      <button className="btn btn-neutral" onClick={(e) => exportToExcel(e)}>
        Export
      </button>
    </div>
  );
}

export default ExportSubmission;
