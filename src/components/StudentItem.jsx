import React from "react";
import { Draggable } from "react-beautiful-dnd";

const StudentItem = ({ student, index, handleRemoveStudent }) => {
  return (
    <Draggable draggableId={student.id} index={index}>
      {(provided) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex justify-between items-center border p-2 mb-2 rounded bg-gray-100"
        >
          {student.name}
          <button
            className="btn btn-error btn-sm"
            onClick={() => handleRemoveStudent(student.id)}
          >
            Remove
          </button>
        </li>
      )}
    </Draggable>
  );
};

export default StudentItem;
