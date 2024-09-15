import React, { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  where,
  query,
  deleteDoc,
  doc,
  and,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { useOutletContext } from "react-router-dom";
import ReactPaginate from "react-paginate";

function Unread() {
  const [user, setUser] = useOutletContext();
  const [forms, setForms] = useState([]);
  const [itemsPerPage] = useState(5);
  const [formToDelete, setFormToDelete] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedForms = forms.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(forms.length / itemsPerPage);

  const fetchUnapprove = async () => {
    const q = query(
      collection(db, "submissions"),
      where("approve", "==", false),
      user.role == "instructor"
        ? where("instructor", "==", { id: user.id, name: user.name })
        : where("user", "==", { id: user.id, name: user.name })
    );
    const formDocs = await getDocs(q);
    const formData = formDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log(formData);
    setForms(formData);
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
        fetchUnapprove();
      } catch (error) {
        console.error("Error deleting class: ", error);
      }
    }
  };

  useEffect(() => {
    fetchUnapprove();
  }, [user]);
  return (
    <div className="overflow-x-auto min-h-screen flex flex-col justify-between">
      <div className="hidden md:block">
        <table className="table table-zebra">
          <thead>
            <tr className="border-b border-t border-l border-r border-black text-sm font-bold bg-slate-300">
              <th className="w-2/4 border-r border-black">ชื่อแบบประเมิน</th>
              <th className="border-r border-black">ผุ้ส่ง</th>
              <th className="border-r border-black">ผู้ประเมิน</th>
              <th className="border-r border-black">วันที่ส่ง</th>
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
                    {cls.form.form.name}
                  </a>
                </td>
                <td className="border-r border-black">{cls.user.name}</td>
                <td className="border-r border-black">{cls.instructor.name}</td>
                <td className="border-r border-black">
                  {new Date(cls.submitDate).toLocaleString().substring(0, 10)}
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
          <a href={`/form/update/${cls.id}`} className="card bg-slate-50 p-4 shadow-sm">
            <div className="card-title text-xs">{cls.form.form.name}</div>
            <div>
              <p className="text-xs text-stone-500">{cls.submitDate}</p>
            </div>
            {user.role == "instructor" && (
              <div>
                <p className="text-xs">{cls.user.name}</p>
              </div>
            )}
            {user.role == "student" && (
              <div>
                <p className="text-xs">ผู้ประเมิน: {cls.instructor.name}</p>
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
    </div>
  );
}

export default Unread;
