import React, { useState, useEffect } from "react";
import Select from "react-select";
import { db } from "../FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import ReactPaginate from "react-paginate";

function FormManagement({ forms, setForms, fetchClassData, class_id }) {
  const [formOptions, setFormOptions] = useState([]);
  const [formToRemove, setFormToRemove] = useState(null);
  const [currentSort, setCurrentSort] = useState("id");
  const [itemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedForms = forms.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(forms.length / itemsPerPage);
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchForms = async () => {
    const q = query(collection(db, "forms"));
    const formDocs = await getDocs(q);
    const formData = formDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setFormOptions(
      formData
        .filter((item) => {
          return !forms.map((form) => form.id).includes(item.id);
        })
        .map((form) => ({
          value: form.id,
          label: form.form.name,
        }))
    );
  };
  useEffect(() => {
    fetchForms();
    console.log("forms", forms);
  },[]);

  const handleAddForms = async (selectedOption) => {
    const formId = selectedOption.value;
    if (class_id && formId) {
      const classDoc = doc(db, "classes", class_id);
      let formsIds = forms.map((form) => form.id);
      if (formsIds.includes(formId)) return;
      await updateDoc(classDoc, {
        forms: [...formsIds, formId],
      });
      fetchClassData();
    }
  };

    const handleRemoveForm = async () => {
    if (formToRemove) {
        const classDoc = doc(db, "classes", class_id);
        let formsIds = forms.map((form) => form.id);
        formsIds = formsIds.filter((formId) => formId !== formToRemove);
        await updateDoc(classDoc, {
            forms: formsIds,
        });
        fetchClassData();
        document.getElementById("remove_form_modal").close();
    }
    };

  const sortForms = (column) => {
    let sortedForms = [...forms];
    switch (column) {
      case "id":
        sortedForms.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "name":
        sortedForms.sort((a, b) => a.form.name.localeCompare(b.form.name));
        break;
      default:
        break;
    }
    setStudents(sortedForms);
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % forms.length;
    setItemOffset(newOffset);
}


  return (
    <div>
      <label className="text-lg" htmlFor="">
        เพิ่มแบบประเมิน
      </label>
      <Select options={formOptions} onChange={handleAddForms} />
      <div className="h-4"></div>
      <div>
        <table className="table table-zebra-zebra">
          <thead className="border border-slate-700 bg-stone-300">
            <tr className="table-row">
              <th className="w-5/12 border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "name" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("name");
                    sortForms("name");
                  }}
                >
                  Name
                </p>
              </th>
              <th className="w-1/12 border-l border-slate-700">Delete</th>
            </tr>
          </thead>
          <tbody>
            {selectedForms.map((form, index) => {
              return (
                <tr className="table-row border-b border-black" key={index}>
                  <td className="border-l border-black">{form.form.name}</td>
                  <td className="border-l border-r border-black ">
                    <button
                      className="btn btn-error w-full"
                      onClick={() => {
                        document
                          .getElementById("remove_form_modal")
                          .showModal();
                        setFormToRemove(form.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog id="remove_form_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการลบแบบประเมิน</h3>
          <p className="py-4">คุณแน่ใจหรือไม่ที่จะลบแบบประเมินนี้ออกจากกลุ่ม?</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error" onClick={handleRemoveForm}>
                Delete
              </button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

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
    </div>
  );
}

export default FormManagement;
