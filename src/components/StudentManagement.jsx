import React, { useState, useEffect } from "react";
import Select from "react-select";
import { db } from "../FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage, deleteObject  } from "firebase/storage";
import ReactPaginate from "react-paginate";

function StudentManagement({
  students,
  setStudents,
  groups,
  setGroups,
  class_id,
  fetchClassData
}) {
  const [profileImageToUpload, setProfileImageToUpload] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentsOptions, setStudentsOptions] = useState([]);
  const [groupsOptions, setGroupsOptions] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [currentSort, setCurrentSort] = useState("id");
  const [itemsPerPage] = useState(10);
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const selectedStudents = students.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(students.length / itemsPerPage);
  const fetchStudents = async () => {
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const studentDocs = await getDocs(q);
    const studentData = studentDocs.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setAvailableStudents(studentData);
    setStudentsOptions(
      studentData
        .filter((student) => {
          return !students.map((student) => student.id).includes(student.id);
        })
        .map((student) => ({
          value: student.id,
          label: student.name,
        }))
    );
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    setProfileImageToUpload(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    fetchStudents();
    setStudents(students.sort(defaultSort));
  }, [students]);

  const defaultSort = (a, b) => {
    if (a.hospital !== b.hospital) {
      return a.hospital.localeCompare(b.hospital);
    } else if (a.ER_report !== b.ER_report) {
      return a.ER_report.localeCompare(b.ER_report);
    } else {
      return a.student_id.localeCompare(b.student_id);
    }
  };

  const handleAddStudent = async (selectedOption) => {
    const studentId = selectedOption.value;
    if (class_id && studentId) {
      const studentDoc = doc(db, "users", studentId);
      const studentData = await getDoc(studentDoc);
      if (!studentData.exists()) return;
      if (studentData.data().class == class_id) return;
      await updateDoc(studentDoc, {
        class: class_id,
      });
      setStudents([
        ...students,
        availableStudents.find((student) => student.id === studentId),
      ]);
    }
  };

  const handleRemoveStudent = async () => {
    if (class_id && studentToRemove) {
      const studentDoc = doc(db, "users", studentToRemove);
      await updateDoc(studentDoc, {
        class: null,
      });
      setStudents(students.filter((student) => student.id !== studentToRemove));
      setStudentToRemove(null);
    }
  };

  const getStudentGroup = (studentId) => {
    const group = groups.find((group) => group.students.includes(studentId));
    if (group) {
      return groupsOptions.find((option) => option.value === group.id);
    }
    return null;
  };

  const updateProfilePic = async () => {

    if (profileImageToUpload) {
      if(studentToEdit.profileImageUrl){
        const oldImageRef = ref(getStorage(), studentToEdit.profileImageUrl);
        await deleteObject(oldImageRef);
      }     
      const storageRef = ref(getStorage(), `profileImages/${studentToEdit.id}`);
      await uploadBytes(storageRef, profileImageToUpload);
      const profileImageUrl = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", studentToEdit.id), {
        profileImageUrl,
      });
      setStudentToEdit(null);
      setProfileImageToUpload(null);
      setProfileImagePreview(null);
      fetchClassData();
    }
  };

  const sortStudents = (column) => {
    let sortedStudents = [...students];
    switch (column) {
      case "id":
        sortedStudents.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "name":
        sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "group":
        sortedStudents.sort((a, b) => {
          const groupA = getStudentGroup(a.id);
          const groupB = getStudentGroup(b.id);
          if (groupA && groupB) {
            return groupA.label.localeCompare(groupB.label);
          } else if (groupA) {
            return -1;
          } else if (groupB) {
            return 1;
          } else {
            return 0;
          }
        });
        break;
      default:
        break;
    }
    setStudents(sortedStudents);
  };

  const handlePageClick = (data) => {
    const newOffset = (data.selected * itemsPerPage) % students.length;
    setItemOffset(newOffset);
  };

  return (
    <div>
      <label className="text-lg" htmlFor="">
        เพิ่มผู้เรียน
      </label>
      <Select options={studentsOptions} onChange={handleAddStudent} />
      <div className="h-4"></div>
      <div>
        <table className="table table-zebra-zebra">
          <thead className="border border-slate-700 bg-stone-300">
            <tr className="table-row">
              <th className="">
                <p
                  className={`${
                    currentSort === "id" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("id");
                    sortStudents("id");
                  }}
                >
                  รหัสนักศึกษา
                </p>
              </th>
              <th className="border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "id" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("id");
                    sortStudents("id");
                  }}
                >
                  รูป
                </p>
              </th>
              <th className=" border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "name" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("name");
                    sortStudents("name");
                  }}
                >
                  ชื่อ
                </p>
              </th>
              <th className=" border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "group" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("group");
                    sortStudents("group");
                  }}
                >
                  โรงพยาบาล
                </p>
              </th>
              <th className=" border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "group" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("group");
                    sortStudents("group");
                  }}
                >
                  กลุ่มปฏิบัติงาน
                </p>
              </th>
              <th className=" border-l border-slate-700">
                <p
                  className={`${
                    currentSort === "group" ? "underline" : ""
                  } cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("group");
                    sortStudents("group");
                  }}
                >
                  กลุ่ม interesting case
                </p>
              </th>
              <th className=" border-l border-slate-700">Delete</th>
            </tr>
          </thead>
          <tbody>
            {selectedStudents.map((student, index) => {
              return (
                <tr className="table-row border-b border-black" key={index}>
                  <td className="border-l border-black">
                    {student.student_id}
                  </td>
                  <td className="border-l border-black">
                    <img
                      src={student.profileImageUrl}
                      alt=""
                      className="w-32 h-32 bg-slate-300 text-black rounded-sm"
                      onClick={() => {
                        document
                          .getElementById("upload_profile_image_modal")
                          .showModal();
                        setProfileImagePreview(student.profileImageUrl);
                        setStudentToEdit(student);
                      }}
                    />
                  </td>
                  <td className="border-l border-black">{student.name}</td>
                  <td className="border-l border-black">{student.hospital}</td>
                  <td className="border-l border-r border-black ">
                    {student.ER_report}
                  </td>
                  <td className="border-l border-r border-black ">
                    {student.interesting_case}
                  </td>
                  <td className="border-l border-r border-black ">
                    <button
                      className="btn btn-error w-full"
                      onClick={(e) => {
                        document
                          .getElementById("remove_student_modal")
                          .showModal();
                        setStudentToRemove(student.id);
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

      <dialog id="remove_student_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">ยืนยันการลบผู้เรียน</h3>
          <p className="py-4">คุณแน่ใจหรือไม่ที่จะลบผู้เรียนนี้ออกจากกลุ่ม?</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-error" onClick={handleRemoveStudent}>
                Delete
              </button>
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="upload_profile_image_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">อัปโหลดรูปโปรไฟล์</h3>
          <div className="p-5 flex justify-center items-center">
            <img
              id="profile_image_preview"
              className="w-32 h-32 mt-4 bg-slate-300 rounded-sm"
              alt=""
              src={profileImagePreview}
            />
            <input
              className="input file-input file-input-sm file-input-bordered"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleProfileImageChange(e);
              }}
            />
          </div>
          <div className="modal-action">
            <button
              className="btn btn-neutral"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                updateProfilePic();
              }}
            >
              Upload
            </button>
            <button
              className="btn"
              onClick={() =>
                document.getElementById("upload_profile_image_modal").close()
              }
            >
              Close
            </button>
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

export default StudentManagement;
