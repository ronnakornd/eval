import React, { useState, useEffect } from "react";
import {
  collection,
  where,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  doc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { query } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import ReactPaginate from "react-paginate";

const formList = () => {
  const [forms, setForms] = useState([]);
  const [itemsPerPage] = useState(5);
  const [formToEdit, setFormToEdit] = useState(null);
  const [formToDelete, setFormToDelete] = useState(null);
  const [formToDuplicate, setFormToDuplicate] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const [newFormName, setNewFormName] = useState("");
  const endOffset = itemOffset + itemsPerPage;
  const selectedForms = forms.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(forms.length / itemsPerPage);

  const fetchForms = async () => {
    const q = query(collection(db, "forms"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedClasses = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setForms(fetchedClasses);
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleStatusToggle = async (id, currentStatus) => {
    const classRef = doc(db, "forms", id);
    await updateDoc(classRef, { active: !currentStatus });
    setForms(
      forms.map((c) => (c.id === id ? { ...c, active: !currentStatus } : c))
    );
    fetchForms();
  };

  const handleUpdateClass = async () => {
    if (formToEdit) {
      try {
        const classRef = doc(db, "classes", formToEdit.id);
        await updateDoc(classRef, { name: formToEdit.name });
        fetchForms();
        setFormToEdit(null);
        window.editClassModal.close();
      } catch (error) {
        console.error("Error updating class: ", error);
      }
    }
  };

  const handleDeleteClass = async () => {
    if (formToDelete) {
      try {
        await deleteDoc(doc(db, "forms", formToDelete.id));
        setForms(forms.filter((c) => c.id !== formToDelete.id));
        setFormToDelete(null);
        window.deleteClassModal.close();
        fetchForms();
      } catch (error) {
        console.error("Error deleting class: ", error);
      }
    }
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % forms.length;
    setItemOffset(newOffset);
  };

  const handleDuplicateForm = async () => {
    if (formToDuplicate) {
      try {
        const formRef = doc(db, "forms", formToDuplicate.id);
        const formDoc = await getDoc(formRef);
        const form = formDoc.data();
        form.form.name = newFormName;
        const newForm = {
          form: form.form,
          createdAt: new Date(),
        };
        const newFormRef = await addDoc(collection(db, "forms"), newForm);
        fetchForms();
        setFormToDuplicate(null);
        setNewFormName("");
        document.getElementById("duplicate_modal").close();
      } catch (error) {
        console.error("Error duplicating form: ", error);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr className="border-b border-t border-l border-r border-black text-sm font-bold bg-slate-300">
            <th className="w-2/4 border-r border-black">Name</th>
            <th className="border-r border-black">Created At</th>
            <th className="border-r border-black">Edit</th>
            <th className="border-r border-black">Duplicate</th>
            <th className="flex justify-center items-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          {selectedForms.map((cls) => (
            <tr
              key={cls.id}
              className="border border-black bg-slate-100 hover cursor-pointer"
            >
              <td className="border-r border-black">{cls.form.name}</td>
              <td className="border-r border-black">
                {cls.createdAt?.toDate().toLocaleString()}
              </td>
              <td className="border-r border-black">
                <a
                  className="btn btn-neutral w-full"
                  href={`/form_edit?id=${cls.id}`}
                >
                  Edit
                </a>
              </td>
              <td className="border-l border-r border-black ">
                <button
                  className="btn btn-warning w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setNewFormName(cls.form.name);
                    document.getElementById("duplicate_modal").showModal();
                    setFormToDuplicate({ name: cls.form.name, id: cls.id });
                  }}
                >
                  Duplicate
                </button>
              </td>
              <td className="flex justify-center items-center">
                <button
                  className="btn btn-error w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFormToDelete({ name: cls.name, id: cls.id });
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

      {/* Delete Confirmation Modal */}
      <dialog id="deleteClassModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p>
            Are you sure you want to delete{" "}
            <b>{formToDelete ? formToDelete.name : ""}</b>?
          </p>
          <div className="modal-action">
            <button className="btn btn-error" onClick={handleDeleteClass}>
              Yes, Delete
            </button>
            <button className="btn" onClick={() => setFormToDelete(null)}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      {/* Duplicate Confirmation Modal */}
      <dialog id="duplicate_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Duplicate</h3>
          <p>
            Are you sure you want to duplicate{" "}
            <b>{formToDuplicate ? formToDuplicate.name : ""}</b>?
          </p>
          <input
            type="text"
            className="input input-bordered w-full mt-4"
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            placeholder="Enter new form name"
          />
          <div className="modal-action">
            <button className="btn btn-neutral" onClick={handleDuplicateForm}>
              Yes, Duplicate
            </button>
            <button
              className="btn"
              onClick={() => {
                setFormToDuplicate(null);
                window.duplicate_modal.close(); 
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default formList;
