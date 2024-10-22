import React, { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  where,
  query,
  deleteDoc,
  updateDoc,
  doc,
  and,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useOutletContext } from "react-router-dom";
import ReactPaginate from "react-paginate";
import ExportSubmission from "./ExportSubmission";


function SubmissionManagement() {
  const [user, setUser] = useOutletContext();
  const [forms, setForms] = useState([]);
  const [itemsPerPage] = useState(10);
  const [formToDelete, setFormToDelete] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedForms = forms.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(forms.length / itemsPerPage);

  const fetchForm = async () => {
    const q = query(collection(db, "submissions"));
    const formDocs = await getDocs(q);
    const formData = formDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log(formData);
    setForms(formData.sort((a, b) => {
        const dateA = new Date(a.submitDate);
        const dateB = new Date(b.submitDate);
        return dateB - dateA;
      }));
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % forms.length;
    setItemOffset(newOffset);
  };

  const handleDeleteForm = async () => {
    if (formToDelete) {
      try {
        await deleteDoc(doc(db, "submissions", formToDelete.id));
        setForms(forms.filter((c) => c.id !== formToDelete.id));
        setFormToDelete(null);
        window.deleteClassModal.close();
        fetchForm();
      } catch (error) {
        console.error("Error deleting class: ", error);
      }
    }
  };

 

  const updateSubmissionClass = async (classId) => {
    try {
      await Promise.all(
        forms.map(async (form) => {
          const submissionDoc = doc(db, "submissions", form.id);
          await updateDoc(submissionDoc, {
            class: classId,
          });
        })
      );
      alert("Submissions updated successfully");
      fetchForm();
    } catch (error) {
      console.error("Error updating submissions: ", error);
    }
  };


  useEffect(() => {
    fetchForm();
  }, [user]);
  return (
    <div className="overflow-x-auto min-h-screen flex flex-col justify-between">
      <div className="hidden md:block">
        <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold">Submission Management</h1>
            <button className="btn bg-green-800 text-white" onClick={()=> window.exportSubmissionModal.showModal()}>
                Export to Excel
            </button>
        </div>
        <table className="table table-zebra">
          <thead>
            <tr className="border-b border-t border-l border-r border-black text-sm font-bold bg-slate-300">
              <th className="w-4/12 border-r border-black">ชื่อแบบประเมิน</th>
              <th className="border-r border-black">ผุ้ส่ง</th>
              <th className="border-r border-black">ผู้ประเมิน</th>
              <th className="border-r border-black">วันที่ส่ง</th>
              <th className="border-r border-black">ประเมินแล้ว</th>
              <th className="flex justify-center items-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {selectedForms.map((cls) => (
              <tr
                key={cls.id}
                className="border border-black bg-slate-100 hover cursor-pointer"
              >
                <td className="border-r border-black">
                  {" "}
                  <a className="link" href={`/form/update/${cls.id}`}>
                    {cls.form ? cls.form.form.name : ""}
                  </a>
                </td>
                <td className="border-r border-black">
                  {cls.user ? cls.user.name : ""}
                </td>
                <td className="border-r border-black">
                  {cls.instructor ? cls.instructor.name : ""}
                </td>
                <td className="border-r border-black">
                  {new Date(cls.submitDate).toLocaleString().substring(0, 10)}
                </td>
                <td className="border-r border-black text-center">
                  {cls.approve ? (
                    <svg
                      width="24"
                      height="24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      class="bi bi-check"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      class="bi bi-x"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  )}
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
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {selectedForms.map((cls) => (
          <a
            href={`/form/update/${cls.id}`}
            className="card bg-slate-50 p-4 shadow-sm"
          >
            <div className="card-title text-xs">
              {cls.form ? cls.form.form.name : ""}
            </div>
            <div>
              <p className="text-xs text-stone-500">
                {cls.submitDate ? cls.submitDate : ""}
              </p>
            </div>
            {user.role == "instructor" && (
              <div>
                <p className="text-xs">{cls.user ? cls.user.name : ""}</p>
              </div>
            )}
            {user.role == "student" && (
              <div>
                <p className="text-xs">
                  ผู้ประเมิน: {cls.instructor ? cls.instructor.name : ""}
                </p>
              </div>
            )}
          </a>
        ))}
      </div>
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
            <button className="btn btn-error" onClick={handleDeleteForm}>
              Yes, Delete
            </button>
            <button className="btn" onClick={() => setFormToDelete(null)}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>

      <dialog id="exportSubmissionModal" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="font-bold text-lg">Export แบบประเมิน</h3>
         <ExportSubmission submissions={forms}/>
          <div className="modal-action">
            <button className="btn" onClick={() => setFormToDelete(null)}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export default SubmissionManagement;
