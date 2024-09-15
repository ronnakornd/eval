import React, { useState, useEffect } from "react";
import {
  collection,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { query } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import ReactPaginate from "react-paginate";

const ActiveClass = () => {
  const [classes, setClasses] = useState([]);
  const [itemsPerPage] = useState(5);
  const [classToEdit, setClassToEdit] = useState(null);
  const [classToDelete, setClassToDelete] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedClasses = classes.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(classes.length / itemsPerPage);

  const fetchClasses = async () => {
    const q = query(
      collection(db, "classes"),
      where("active", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const fetchedClasses = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setClasses(fetchedClasses);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const classRef = doc(db, "classes", id);
    await updateDoc(classRef, { active: !currentStatus });
    setClasses(
      classes.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c))
    );
    fetchClasses();
  };

  const handleUpdateClass = async () => {
    if (classToEdit) {
      try {
        const classRef = doc(db, "classes", classToEdit.id);
        await updateDoc(classRef, { name: classToEdit.name });
        fetchClasses();
        setClassToEdit(null);
        window.editClassModal.close();
      } catch (error) {
        console.error("Error updating class: ", error);
      }
    }
  };

  const handleDeleteClass = async () => {
    if (classToDelete) {
      try {
        await deleteDoc(doc(db, "classes", classToDelete.id));
        setClasses(classes.filter((c) => c.id !== classToDelete.id));
        setClassToDelete(null);
        window.deleteClassModal.close();
        fetchClasses();
      } catch (error) {
        console.error("Error deleting class: ", error);
      }
    }
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % classes.length;
    setItemOffset(newOffset);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr className="border border-black text-sm bg-slate-300 font-bold">
            <th className="w-2/4 border-r border-black">Name</th>
            <th className="border-r border-black">Level</th>
            <th className="border-r border-black">Created At</th>
            <th className="border-r border-black">Active</th>
            <th className="border-r border-black">Edit</th>
            <th className="flex justify-center items-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          {selectedClasses.map((cls) => (
            <tr
              key={cls.id}
              className="border border-black bg-slate-100  hover cursor-pointer"
              onClick={() => (window.location.href = `/class/${cls.id}`)}
            >
              <td className="border-r border-black">{cls.name}</td>
              <td className="border-r border-black">{cls.level}</td>
              <td className="border-r border-black">{cls.createdAt?.toDate().toLocaleString()}</td>
              <td className="border-r border-black">
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={cls.active}
                    onChange={() => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusToggle(cls.id, cls.active);
                    }}
                  />
                </label>
              </td>
              <td className="border-r border-black">
                <button
                  className="btn btn-neutral w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setClassToEdit({ name: cls.name, id: cls.id });
                    window.editClassModal.showModal();
                  }}
                >
                  Edit
                </button>
              </td>
              <td className="flex justify-center items-center">
                <button
                  className="btn btn-error w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setClassToDelete({ name: cls.name, id: cls.id });
                    window.deleteClassModal.showModal();
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
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

      {/* Edit Class Modal */}
      <dialog id="editClassModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Edit Class</h3>
          <input
            type="text"
            className="input input-bordered w-full"
            value={classToEdit ? classToEdit.name : ""}
            onChange={(e) =>
              setClassToEdit({ ...classToEdit, name: e.target.value })
            }
          />
          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleUpdateClass}>
              Save
            </button>
            <button className="btn" onClick={() => setClassToEdit(null)}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog id="deleteClassModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p>
            Are you sure you want to delete{" "}
            <b>{classToDelete ? classToDelete.name : ""}</b>?
          </p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={handleDeleteClass}>
              Yes, Delete
            </button>
            <button className="btn" onClick={() => setClassToDelete(null)}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
};

export default ActiveClass;
