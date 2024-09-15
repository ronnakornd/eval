import React from "react";
import Select from "react-select";

const StudentSelect = ({ availableStudents, handleAddStudent }) => {
  const studentOptions = availableStudents.map((student) => ({
    value: student.id,
    label: student.name,
  }));

  return (
    <Select
      options={studentOptions}
      onChange={handleAddStudent}
      placeholder="Search and add student"
      className="mt-4 mb-4"
    />
  );
};

export default StudentSelect;
