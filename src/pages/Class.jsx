import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useParams } from "react-router-dom";
import Select from "react-select";
import StudentManagement from "../components/StudentManagement";
import GroupManagement from "../components/GroupManagement";
import Breadcrumbs from "../components/Breadcrumbs";
import FormManagement from "../components/FormManagement";

const Class = () => {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [forms, setForms] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const { class_id } = useParams();
  const [activeTab, setActiveTab] = useState("student");
  const fetchClassData = async () => {
    if (class_id) {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const studentDocs = await getDocs(q);
      const studentData = studentDocs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setStudents(
        studentData.filter((student) => student.class === class_id)
      );
      const formsDocs = await getDocs(query(collection(db, "forms")));
      const formsData = formsDocs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      getDoc(doc(db, "classes", class_id))
        .then((doc) => {
          if (doc.exists()) {
            let data = doc.data();
            setCurrentClass({ ...data, id: doc.id });
            setForms(formsData.filter((item) => data.forms? data.forms.includes(item.id): false));
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error getting user document:", error);
        });
      const classDoc = doc(db, "classes", class_id);
      const groupDocs = await getDocs(collection(classDoc, "groups"));
      const groupData = groupDocs.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setGroups(groupData);
    }
  };
  useEffect(() => {
    fetchClassData();
  }, [class_id]);

  const getLevelText = (level) => {
    switch (level) {
      case "extern":
        return "Extern";
      case "intern":
        return "Intern";
      case "5thyear":
        return "5th Year";
      default:
        return "";
    }
  };

  return (
    <div className="p-4">
      <Breadcrumbs
        links={[
          { label: "Home", value: "/" },
          { label: "Classes", value: "/dashboard/activeClass" },
          {
            label: currentClass ? currentClass.name : "",
            value: `/class/${currentClass ? currentClass.id : ""}`,
          },
        ]}
      />
      <h1 className="pt-4 text-3xl">{currentClass ? currentClass.name : ""}</h1>
      <h2 className="badge badge-neutral mb-4">
        {currentClass ? getLevelText(currentClass.level) : ""}
      </h2>
      <div role="tablist" className="tabs tabs-lifted w-4/4 md:w-2/4">
        <a
          role="tab"
          className={`tab tab-bordered ${
            activeTab === "student" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("student")}
        >
          Students
        </a>
        <a
          role="tab"
          className={`tab tab-bordered ${
            activeTab === "group" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("group")}
        >
          Groups
        </a>
        <a
          role="tab"
          className={`tab tab-bordered ${
            activeTab === "forms" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("forms")}
        >
          Forms
        </a>
      </div>

      {/* Tab Content */}
      <div className="mt-6 min-h-screen">
        {activeTab === "student" && (
          <StudentManagement
            students={students}
            setStudents={setStudents}
            groups={groups}
            setGroups={setGroups}
            class_id={currentClass ? currentClass.id : null}
            fetchClassData={fetchClassData}
          />
        )}
        {activeTab === "group" && (
          <GroupManagement
            groups={groups}
            setGroups={setGroups}
            fetchClassData={fetchClassData}
            class_id={currentClass ? currentClass.id : null}
          />
        )}
        {activeTab === "forms" && (
          <FormManagement
            forms={forms}
            setForms={setForms}
            class_id={currentClass ? currentClass.id : null}
            fetchClassData={fetchClassData}
          ></FormManagement>
        )}
      </div>
    </div>
  );
};

export default Class;
