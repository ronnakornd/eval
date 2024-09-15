import React, { useState,useEffect } from "react";

const MultipleChoiceQuestion = ({ questionId, onSave, formChoices }) => {
  const [choices, setChoices] = useState([{ id: 1, text: "" }]);
  const [nextId, setNextId] = useState(2);

  const handleAddChoice = () => {
    setChoices([...choices, { id: nextId, text: "" }]);
    setNextId(nextId + 1);
  };

  const handleEditChoice = (id, newText) => {
    setChoices(
      choices.map((choice) =>
        choice.id === id ? { ...choice, text: newText } : choice
      )
    );
  };

  const handleDeleteChoice = (id) => {
    setChoices(choices.filter((choice) => choice.id !== id));
  };

  const handleSave = () => {
    onSave(questionId,choices);
  };

  useEffect(() => {
     handleSave();
  },[choices]);

  useEffect(() => {
    if(formChoices){
      setChoices(formChoices);
    }
  }
  ,[]);

  return (
    <div className="bg-white p-4 rounded-lg space-y-4">
      {choices.map((choice) => (
        <div key={choice.id} className="flex items-center space-x-2">
          <input
            type="text"
            className="input input-bordered flex-grow"
            placeholder="Enter choice"
            value={choice.text}
            onChange={(e) => handleEditChoice(choice.id, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => handleDeleteChoice(choice.id)}
          >
            Delete
          </button>
        </div>
      ))}

      <div className="space-x-2">
        <button className="btn btn-secondary" onClick={handleAddChoice}>
          Add Choice
        </button>
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
