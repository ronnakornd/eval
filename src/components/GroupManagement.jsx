import React, { useState, useEffect } from "react";
import { addDoc, collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import ReactPaginate from "react-paginate";

function GroupManagement({ groups, setGroups, fetchClassData, class_id }) {
  const [currentSort, setCurrentSort] = useState("name");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [itemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedGroups = groups.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(groups.length / itemsPerPage);

  const handleSort = (columnName) => {
    // Sort the groups array based on the given column name
    const sortedGroups = [...groups].sort((a, b) => {
      if (a[columnName] < b[columnName]) {
        return -1;
      }
      if (a[columnName] > b[columnName]) {
        return 1;
      }
      return 0;
    });
    // Update the sorted groups in the state
    setGroups(sortedGroups);
  };

  useEffect(() => {
    handleSort("name");
  }, []);

  const handleCreateGroup = async () => {
    if (class_id && newGroupName) {
      const classDoc = doc(db, "classes", class_id);
      await addDoc(collection(classDoc, "groups"), {
        name: newGroupName,
        students: [],
      });
      fetchClassData();
      handleSort("name");
      setCurrentSort("name");
    }
  };

  const handleDeleteGroup = async () => {
    if (class_id) {
      const groupDoc = doc(db, "classes", class_id, "groups", groupToDelete);
      await deleteDoc(groupDoc);
      fetchClassData();
      handleSort("name");
      setCurrentSort("name");
    }
  };

  const handleEditGroup = async () => {
    if (class_id) {
      const groupDoc = doc(db, "classes", class_id, "groups", groupToEdit);
      await updateDoc(groupDoc, { name: newGroupName });
      fetchClassData();
      setGroupToEdit(null);
      setNewGroupName("");
    }
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % groups.length;
    setItemOffset(newOffset);
  };

  // Render the table header with sort buttons
  return (
    <div>
      <div className="flex items-start gap-2 mb-4">
      <input placeholder="new group name..." type="text" className="input input-bordered" value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} />
      <button className="btn btn-primary" onClick={handleCreateGroup}>Create Group</button>
      </div>
      <table className="table table-zebra-zebra">
        <thead className="border border-slate-700 bg-stone-300">
          <tr className="table-row">
            <th className="w-2/12">
              <p
                className={`${
                  currentSort === "id" ? "underline" : ""
                } cursor-pointer`}
                onClick={() => {
                  setCurrentSort("id");
                  handleSort("id");
                }}
              >
                ID
              </p>
            </th>
            <th className="w-4/12 border-l border-slate-700">
              <p
                className={`${
                  currentSort === "name" ? "underline" : ""
                } cursor-pointer`}
                onClick={() => {
                  setCurrentSort("name");
                  handleSort("name");
                }}
              >
                Name
              </p>
            </th>
            <th className="w-1/12 border-l border-black">Edit</th>
            <th className="w-1/12 border-l border-black">Forms</th>
            <th className="w-1/12 border-l border-slate-700">Delete</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id} className="table-row border-b border-black">
              <td className="border-l border-black">{group.id}</td>
              <td className="border-l border-black">{group.name}</td>
              <td className="border-l border-black">
                <button className="btn btn-neutral font-thin" onClick={()=>{
                  const modal = document.getElementById("edit_group_modal");
                  modal.showModal();
                  setGroupToEdit(group.id);
                  setNewGroupName(group.name);
                }}>แก้ไข</button>
              </td>
              <td className="border-l border-black">
                <button className="btn btn-secondary font-thin" >ดูข้อมูล</button>
              </td>
              <td className="border-l border-r border-black">
                <button className="btn btn-error"
                  onClick={() => {
                    const modal = document.getElementById("remove_group_modal");
                    modal.showModal();
                    setGroupToDelete(group.id);
                  }}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-center my-4">
        <ReactPaginate
          previousLabel={"<"}
          nextLabel={">"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          onClick={handlePageClick}
          containerClassName={""}
          pageClassName={"btn btn-sm"}
          pageLinkClassName={""}
          previousClassName={"btn btn-sm"}
          previousLinkClassName={""}
          nextClassName={"btn btn-sm"}
          nextLinkClassName={""}
          breakClassName={"btn btn-sm"}
          activeClassName={"btn-primary"}
        />
      </div>

      <dialog id="remove_group_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการลบกลุ่ม</h3>
          <p className="py-4">คุณแน่ใจหรือไม่ที่จะลบกลุ่มนี้?</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error" onClick={()=>{
                handleDeleteGroup();
                const modal = document.getElementById("remove_group_modal");
                modal.close();
              }}>
                Delete
              </button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="edit_group_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">แก้ไขชื่อกลุ่ม</h3>
          <p className="py-4">กรุณากรอกชื่อกลุ่มใหม่</p>
          <input type="text" className="input input-bordered" value={newGroupName} onChange={(e)=> setNewGroupName(e.currentTarget.value)} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-neutral" onClick={handleEditGroup}>
                Edit
              </button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
export default GroupManagement;
