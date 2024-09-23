import React, { useState, useEffect } from "react";

const ScoreQuestion = ({ questionId, onSave, setting }) => {
  const [score, setScore] = useState(0);
  const [choicesNumber, setChoicesNumber] = useState(5);
  const [choices, setChoices] = useState([]);
  const handleSave = () => {
    onSave(questionId, { defaultScore: score, choicesNumber, choices });
  };

  useEffect(() => {
    handleSave();
    if (choices.length < choicesNumber) {
      const newChoices = [...choices];
      for (let i = choices.length; i < choicesNumber; i++) {
        newChoices.push({ text: ``, enable: true, score: 0 });
      }
      setChoices(newChoices);
    }
    if (choices.length > choicesNumber) {
      const newChoices = choices.slice(0, choicesNumber);
      setChoices(newChoices);
    }
  }, [score, choicesNumber, choices]);

  useEffect(() => {
    if (setting) {
      setScore(setting.defaultScore);
      setChoicesNumber(setting.choicesNumber);
      if (setting.choices) {
        setChoices(setting.choices);
      }
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg  space-y-4">
      <label htmlFor="defaultRating" className="label">
        Default score
      </label>
      <input
        id="defaultRating"
        type="number"
        value={score}
        className="input input-bordered w-full"
        onChange={(e) => setScore(parseInt(e.target.value))}
      />
      <label htmlFor="choicesNumber" className="label">
        No. of choices
      </label>
      <input
        id="maxRating"
        type="number"
        value={choicesNumber}
        className="input input-bordered w-full"
        onChange={(e) => setChoicesNumber(parseInt(e.target.value))}
      />
      <div className="space-y-4">
        {choices.map((choice, index) => (
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <label htmlFor={`choice-${index}`} className="label">
                ข้อที่ {index + 1}
              </label>

              <input
                type="number"
                value={choice.score}
                className="input input-bordered w-1/4"
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[index] = {
                    ...newChoices[index],
                    score: parseInt(e.target.value),
                  };
                  setChoices(newChoices);
                }}
                disabled={!choice.enable}
              />
              <label htmlFor={`score-${index}`} className="label">
                คะแนน
              </label>
            </div>
            <input
              key={index}
              type="text"
              value={choice.text}
              className="input input-bordered w-full"
              onChange={(e) => {
                const newChoices = [...choices];
                newChoices[index] = {
                  ...newChoices[index],
                  text: e.target.value,
                };
                setChoices(newChoices);
              }}
              disabled={!choice.enable}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreQuestion;
