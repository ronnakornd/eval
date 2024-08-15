import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig"; // Import Firestore instance from FirebaseConfig
import ActiveClass from "../components/ActiveClass";
import InactiveClass from "../components/InactiveClass";
import Unread from "../components/Unread";
import Submitted from "../components/Submitted";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("unread");
  const [newClassData, setNewClassData] = useState({
    name: "",
    level: "extern",
    active: true,
  });

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
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mb-4">
        <button
          className="btn btn-primary"
          onClick={() => window.newClassModal.showModal()}
        >
          New Class
        </button>
        <button className="btn btn-secondary">New Student</button>
        <button className="btn btn-accent">New Form</button>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-lifted w-4/4 md:w-2/4">
        <a
          role="tab"
          className={`tab tab-bordered ${
            activeTab === "unread" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("unread")}
        >
          My form
        </a>
        <a
          role="tab"
          className={`tab tab-bordered ${
            activeTab === "submitted" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("submitted")}
        >
          Submitted
        </a>
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
      </div>

      {/* Tab Content */}
      <div className="mt-6 min-h-screen">
        {activeTab === "activeClass" && <ActiveClass />}
        {activeTab === "inactiveClass" && <InactiveClass />}
        {activeTab === "unread" && <Unread />}
        {activeTab === "submitted" && <Submitted />}
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
    </div>
  );
};

export default Dashboard;
