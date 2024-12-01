import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDoc,
  serverTimestamp,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig"; // Import Firestore instance from FirebaseConfig
import ActiveClass from "../components/ActiveClass";
import InactiveClass from "../components/InactiveClass";
import Unread from "../components/Unread";
import Submitted from "../components/Submitted";
import FormList from "../components/FormList";
import SubmissionManagement from "../components/SubmissionManagement";
import { useParams, useOutletContext, useLocation } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import UserImport from "../components/UserImport";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState("unread");
  const [user, setUser] = useOutletContext();
  const [myClass, setMyClass] = useState(null);
  const [myGroup, setMyGroup] = useState(null);
  const [newClassData, setNewClassData] = useState({
    name: "",
    level: "extern",
    startDate: "",
    endDate: "",
    active: true,
  });
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tab = queryParams.get('tab');



  const getMyClass = async () => {
    const classDoc = doc(db, "classes", user.class);
    const classQuery = await getDoc(classDoc);
    const classData = classQuery.data();
    const groupDocs = await getDocs(collection(classDoc, "groups"));
    const groupData = groupDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setMyGroup(groupData.find((group) => group.students.includes(user.id)));
    setMyClass({ ...classData, id: classQuery.id });
  };

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
    if (user && user.role === "student") {
      getMyClass();
    }
    if (user && user.role === "admin") {
      setActiveTab("activeClass");
    }
  }, [tab, user]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, you can access user information here
        console.log("User is logged in:", user);
        console.log("User ID:", user.uid);
        console.log("User Email:", user.email);
      } else {
        // User is not signed in
        console.log("No user is logged in");
        window.location.href = "/";
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClassData({ ...newClassData, [name]: value });
  };

  const handleNewClassSubmit = async () => {
    try {
      await addDoc(collection(db, "classes"), {
        ...newClassData,
        createdAt: serverTimestamp(),
      });
      alert("Class added successfully");
      // Reset form
      setNewClassData({ name: "", level: "extern", active: true });
      window.location.reload();
    } catch (error) {
      console.error("Error adding class: ", error);
    }
  };

  return (
    <div className="p-4">
      <Breadcrumbs
        links={[
          { label: "Home", value: "/" },
          { label: "Dashboard", value: "/dashboard" },
        ]}
      />
      {user && user.role === "student" && (
        <>
          <div className="flex justify-start items-center space-x-4 mb-1">
            <h2 className="text-sm md:text-xl">
              รายวิชา {myClass ? myClass.name : ""}
            </h2>
            <h2 className="badge badge-neutral">
              {myClass ? myClass.level : ""}
            </h2>
          </div>
          <div>
            <h2 className="text-sm">โรงพยาบาล{user.hospital}</h2>
            <h2 className="text-xs">กลุ่มปฏิบัติงาน/ER report/Journal กลุ่ม {user.ER_report}</h2>
            <h2 className="text-xs">กลุ่มปฏิบัติงานรพ.ศูนย์ {user.interesting_case}</h2>
          </div>
        </>
      )}
      <div className="flex justify-end space-x-4 mb-4">
        {user && user.role === "admin" && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => window.newClassModal.showModal()}
            >
              New Class
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.importStudentModal.showModal()}
            >
              Import Student
            </button>
            <button
              className="btn btn-accent"
              onClick={() => (window.location.href = `/form/create`)}
            >
              New Form
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-lifted w-4/4 md:w-2/4">
        {user && user.role != "admin" && (
          <>
            <a
              role="tab"
              className={`tab tab-bordered ${
                activeTab === "unread" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("unread")}
            >
              รอประเมิน
            </a>
            <a
              role="tab"
              className={`tab tab-bordered ${
                activeTab === "submitted" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("submitted")}
            >
              ประเมินแล้ว
            </a>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <a
              role="tab"
              className={`tab tab-bordered ${
                activeTab === "activeClass" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("activeClass")}
            >
              Active Class
            </a>
            <a
              role="tab"
              className={`tab tab-bordered ${
                activeTab === "inactiveClass" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("inactiveClass")}
            >
              Inactive Class
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
            <a
              role="tab"
              className={`tab tab-bordered ${
                activeTab === "submissions" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </a>
          </>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6 min-h-screen">
        {activeTab === "activeClass" && <ActiveClass />}
        {activeTab === "inactiveClass" && <InactiveClass />}
        {activeTab === "unread" && <Unread />}
        {activeTab === "submitted" && <Submitted />}
        {activeTab === "forms" && <FormList />}
        {activeTab === "submissions" && <SubmissionManagement />}
      </div>

      {/* New Class Modal */}
      <dialog id="newClassModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Add New Class</h3>
          <div className="py-4">
            <input
              type="text"
              placeholder="Class Name"
              className="input input-bordered w-full mb-4"
              name="name"
              value={newClassData.name}
              onChange={handleInputChange}
            />
            <select
              className="select select-bordered w-full mb-4"
              name="level"
              value={newClassData.level}
              onChange={handleInputChange}
            >
              <option value="5thyear">5th year</option>
              <option value="extern">Extern</option>
            </select>
            <label className="label">Start and End Date</label>
            <div className="flex justify-center items-center gap-2">
              <input
                type="date"
                className="input input-bordered w-full mb-4"
                name="startDate"
                placeholder="Start Date"
                value={newClassData.startDate}
                onChange={handleInputChange}
              />
              <div className="h-full p-2 pb-5">-</div>
              <input
                type="date"
                className="input input-bordered w-full mb-4"
                placeholder="End Date"
                name="endDate"
                value={newClassData.endDate}
                onChange={handleInputChange}
              />
            </div>

            <label className="cursor-pointer label">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                name="active"
                checked={newClassData.active}
                onChange={(e) =>
                  setNewClassData({ ...newClassData, active: e.target.checked })
                }
              />
            </label>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleNewClassSubmit}>
              Save
            </button>
            <button
              className="btn"
              onClick={() => window.newClassModal.close()}
            >
              Close
            </button>
          </div>
        </form>
      </dialog>

      <dialog id="importStudentModal" className="modal">
        <form method="dialog" className="modal-box">
          <UserImport />
          <div className="modal-action">
            <button
              className="btn"
              onClick={() => window.newClassModal.close()}
            >
              Close
            </button>
          </div>
        </form>
      </dialog>

      {user && user.role === "student" && (
        <div>
          <a
            className="btn btn-primary text-white text-2xl btn-circle fixed bottom-5 right-5 "
            href="/submit"
          >
            +
          </a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
