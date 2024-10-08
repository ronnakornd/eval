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
import ReactPaginate from "react-paginate";

function StudentManagement({
  students,
  setStudents,
  groups,
  setGroups,
  class_id,
  fetchClassData
}) {
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
    setGroupsOptions(
      groups.map((group) => ({
        value: group.id,
        label: group.name,
      }))
    );
  };
  useEffect(() => {
    fetchStudents();
  }, [students,groups]);

  const handleAddStudent = async (selectedOption) => {
    const studentId = selectedOption.value;
    if (class_id && studentId) {
      const studentDoc = doc(db, "users", studentId);
      const studentData = await getDoc(studentDoc);
      if (!studentData.exists()) return;
      if ( studentData.data().class == class_id ) return;
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

  const changeStudentGroup = async (studentId, groupId) => {
    const sourceGroup = groups.find((group) =>
      group.students.includes(studentId)
    );
    const destinationGroup = groups.find((group) => group.id === groupId);
    if (sourceGroup) {
      if (sourceGroup.id === destinationGroup.id) return;
      const updatedSourceGroup = {
        ...sourceGroup,
        students: sourceGroup.students.filter((id) => id !== studentId),
      };
      const sourceGroupDoc = doc(
        db,
        "classes",
        class_id,
        "groups",
        sourceGroup.id
      );
      await updateDoc(sourceGroupDoc, {
        students: updatedSourceGroup.students,
      });
    }

    const updatedDestinationGroup = {
      ...destinationGroup,
      students: [...destinationGroup.students, studentId],
    };
    const destinationGroupDoc = doc(
      db,
      "classes",
      class_id,
      "groups",
      destinationGroup.id
    );
    await updateDoc(destinationGroupDoc, {
      students: updatedDestinationGroup.students,
    });
     fetchClassData();
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
              <th className="w-2/12">
                <p
                  className={`${currentSort === "id" ? "underline" : ""} cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("id");
                    sortStudents("id");
                  }}
                >
                  ID 
                </p>
              </th>
              <th className="w-3/12 border-l border-slate-700">
                <p
                  className={`${currentSort === "name" ? "underline" : ""} cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("name");
                    sortStudents("name");
                  }}
                >
                  Name
                </p>
              </th>
              <th className="w-2/12 border-l border-slate-700">
                <p
                  className={`${currentSort === "group" ? "underline" : ""} cursor-pointer`}
                  onClick={() => {
                    setCurrentSort("group");
                    sortStudents("group");
                  }}
                >
                  Group
                </p>
              </th>
              <th className="w-1/12 border-l border-black">Forms</th>
              <th className="w-1/12 border-l border-slate-700">Delete</th>
            </tr>
          </thead>
          <tbody>
            {selectedStudents.map((student, index) => {
              return (
                <tr className="table-row border-b border-black" key={index}>
                  <td className="border-l border-black">{student.id}</td>
                  <td className="border-l border-black">{student.name}</td>
                  <td className="border-l border-black">
                    <Select
                      options={groupsOptions}
                      defaultValue={getStudentGroup(student.id)}
                      value={getStudentGroup(student.id)}
                      onChange={(selectedOption) =>
                        changeStudentGroup(student.id, selectedOption.value)
                      }
                    />
                  </td>
                  <td className="border-l border-r border-black ">
                    <button
                      className="btn btn-neutral font-thin w-full"
                      onClick={() => {
                        document
                          .getElementById("remove_student_modal")
                          .showModal();
                        setStudentToRemove(student.id);
                      }}
                    >
                      ดูข้อมูล
                    </button>
                  </td>
                  <td className="border-l border-r border-black ">
                    <button
                      className="btn btn-error w-full"
                      onClick={() => {
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
