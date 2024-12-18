import React, { useState, useEffect } from "react";
import { collection, getDocs, query, sum, where } from "firebase/firestore";
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
  const [students, setStudents] = useState([]);

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

  const fetchStudents = async () => {
    const q = query(
      collection(db, "users"),
      where("class", "==", selectedClass),
      where("role", "==", "student")
    );
    const studentDocs = await getDocs(q);
    const studentData = studentDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setStudents(studentData);
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
      return (
        submission.class === selectedClass &&
        submission.form.id === selectedForm &&
        submission.approve
      );
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

    const hospitalList = [];
    const dataByHospital = {};

    students.forEach((student) => {
      if (student.hospital && !hospitalList.includes(student.hospital)) {
        hospitalList.push(student.hospital);
        dataByHospital[student.hospital] = [];
      }
    });

    // Map the selected submissions to include questions and answers
    const selectedSubmissionsData = selectedSubmissions.map((submission) => {
      const submissionData = {
        ชื่อแบบประเมิน: submission.form.form.name,
        ผู้ส่ง: submission.user.name,
        โรงพยาบาลต้นสังกัด: students.find(
          (student) => student.id === submission.user.id
        ).hospital,
        ผู้ประเมิน: submission.instructor.name,
        วันที่ส่ง: submission.submitDate,
      };

      let totalScore = 0;
      let sumScore = 0;
      // Add questions and answers to the submission data
      submission.form.form.questions.forEach((question) => {
        submissionData[question.question] =
          question.type == "rating" || question.type == "score"
            ? parseInt(question.answer)
            : question.answer;
        if (question.type == "rating") {
          totalScore += parseInt(question.rating.maxRating);
          sumScore += parseInt(question.answer);
        }
        if (question.type == "score") {
          totalScore +=
            question.setting.choices[question.setting.choices.length - 1].score;
          sumScore += parseInt(question.answer);
        }
      });
      submissionData["คะแนนที่ได้"] = sumScore;
      submissionData["คะแนนรวม"] = totalScore;
      submissionData["คะแนนรวม (%)"] = (sumScore / totalScore) * 100;
      return submissionData;
    });
    const wb = XLSX.utils.book_new();
    // Create a worksheet for each hospital
    hospitalList.forEach((hospital) => {
      const hospitalData = selectedSubmissionsData.filter(
        (submission) => submission["โรงพยาบาลต้นสังกัด"] === hospital
      );

      // Sort the hospital data by user name first
      hospitalData.sort((a, b) => a["ผู้ส่ง"].localeCompare(b["ผู้ส่ง"]));
      // Then sort by "ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)" within the same user
      hospitalData.sort((a, b) => {
        if (a["ผู้ส่ง"] === b["ผู้ส่ง"]) {
          if (
            a["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"] &&
            b["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"]
          ) {
            return a["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"].localeCompare(
              b["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"]
            );
          }
        }
        return 0;
      });

      // Create the worksheet with the hospital data
      const ws = XLSX.utils.json_to_sheet(hospitalData);

      // Add the question columns to the worksheet
      questionArray.forEach((question, index) => {
        const col = XLSX.utils.encode_col(5 + index); // Start from the 6th column (index 5)
        ws[`${col}1`] = { t: "s", v: question }; // Set the header row
      });

      // Append the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, hospital);

      // Create a new sheet for calculated scores
      const calculatedData = students
        .filter((student) => student.hospital === hospital)
        .map((student) => {
          const studentData = {
            ชื่อนักศึกษา: student.name,
            รหัสนักศึกษา: student.student_id,
            กลุ่มปฏิบัติงาน_ER_report_Journal: parseInt(student.ER_report),
            กลุ่มInteresting_case: student.interesting_case,
          };

          const studentSubmissions = selectedSubmissionsData.filter(
            (submission) => submission["ผู้ส่ง"] === student.name
          );

          if (hospital === "ศรีนครินทร์" && selectedFormName.includes("ปฏิบัติงาน")) {
            const snkSubmissions = studentSubmissions.filter(
              (submission) =>
                submission["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"] ===
                "โรงพยาบาลศรีนครินทร์"
            );
            const otherSubmissions = studentSubmissions.filter(
              (submission) =>
                submission["ฝึกปฏิบัติงาน (แผนก/หน่วย/โรงพยาบาล)"] !==
                "โรงพยาบาลศรีนครินทร์"
            );

            const snkTotalScore = snkSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนที่ได้"],
              0
            );
            const snkMaxScore = snkSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนรวม"],
              0
            );

            const otherTotalScore = otherSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนที่ได้"],
              0
            );
            const otherMaxScore = otherSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนรวม"],
              0
            );
            studentData["รพศรีนครินทร์ (เต็ม 25)"] = snkMaxScore
              ? Math.round((snkTotalScore / snkMaxScore) * 25)
              : 0;
            studentData["รพสมทบ (เต็ม 5)"] = otherMaxScore
              ? Math.round((otherTotalScore / otherMaxScore) * 5)
              : 0;
            studentData["คะแนน (เต็ม 30)"] =
              studentData["รพศรีนครินทร์ (เต็ม 25)"] +
              studentData["รพสมทบ (เต็ม 5)"];
          } else {
            let roundScore = 0;
            if(selectedFormName.includes("ปฏิบัติงาน")){
                roundScore = 30;
            }else if (selectedFormName.includes("ER Report")){
                roundScore = 10;
            }else if (selectedFormName.includes("Journal")){
                roundScore = 2.5;
            }else if (selectedFormName.includes("Interesting Case")){
                roundScore = 2.5;
            }
            const totalScore = studentSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนที่ได้"],
              0
            );
            const maxScore = studentSubmissions.reduce(
              (acc, curr) => acc + curr["คะแนนรวม"],
              0
            );
            studentData[`คะแนน (เต็ม ${roundScore})`] = maxScore
              ? ((totalScore / maxScore) * roundScore).toFixed(1)
              : 0;
          }
          return studentData;
        });

      calculatedData.sort((a, b) => {
        if (a.กลุ่มปฏิบัติงาน_ER_report_Journal !== b.กลุ่มปฏิบัติงาน_ER_report_Journal) {
          return a.กลุ่มปฏิบัติงาน_ER_report_Journal - b.กลุ่มปฏิบัติงาน_ER_report_Journal;
        }
        return b.กลุ่มInteresting_case - a.กลุ่มInteresting_case;
      });
      const wsCalculated = XLSX.utils.json_to_sheet(calculatedData);
      XLSX.utils.book_append_sheet(wb, wsCalculated, `${hospital}_calculated`);
    });

    // Write the workbook to a file
    XLSX.writeFile(wb, `${selectedClassName} - ${selectedFormName}.xlsx`);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchForms(classes.find((c) => c.id === selectedClass));
      fetchStudents();
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
