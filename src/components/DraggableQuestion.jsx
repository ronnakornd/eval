import React from "react";
import { useDrag, useDrop } from "react-dnd";

const DraggableQuestion = ({ id, index, moveQuestion, children }) => {
  const [, ref] = useDrag({
    type: "question",
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: "question",
    hover: (item) => {
      if (item.index !== index) {
        moveQuestion(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="cursor-move">
      {children}
    </div>
  );
};

export default DraggableQuestion;
