import React, { useState, useEffect } from "react";

const RatingQuestion = ({ questionId, onSave, setting }) => {
  const [rating, setRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [choices, setChoices] = useState([]);
  const handleSave = () => {
    onSave(questionId, { defaultRating: rating, maxRating, choices });
  };

  useEffect(() => {
    handleSave();
    if (choices.length < maxRating) {
      const newChoices = [...choices];
      for (let i = choices.length; i < maxRating; i++) {
        newChoices.push({ text: `` , enable: true});
      }
      setChoices(newChoices);
    }
    if (choices.length > maxRating) {
      const newChoices = choices.slice(0, maxRating);
      setChoices(newChoices);
    }
  }, [rating, maxRating, choices]);

  useEffect(() => {
    if (setting) {
      setRating(setting.defaultRating);
      setMaxRating(setting.maxRating);
      if (setting.choices) {
        setChoices(setting.choices);
      }
    }
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg  space-y-4">
      <label htmlFor="defaultRating" className="label">
        Default rating
      </label>
      <input
        id="defaultRating"
        type="number"
        value={rating}
        className="input input-bordered w-full"
        onChange={(e) => setRating(e.target.value)}
      />
      <label htmlFor="maxRating" className="label">
        Max rating
      </label>
      <input
        id="maxRating"
        type="number"
        value={maxRating}
        className="input input-bordered w-full"
        onChange={(e) => setMaxRating(e.target.value)}
      />
      <div className="space-y-4">
        {choices.map((choice, index) => (
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <label htmlFor={`choice-${index}`} className="label">
                คะแนน {index + 1}
              </label>
              <input
                type="checkbox"
                name="enable"
                id=""
                onChange={(e) => {
                  const newChoices = [...choices];
                  newChoices[index] = {
                    ...newChoices[index],
                    enable: e.target.checked,
                  };
                  setChoices(newChoices);
                }}
                checked={choice.enable}
              />
            </div>
            <input
              key={index}
              type="text"
              value={choice.text}
              className="input input-bordered w-full"
              onChange={(e) => {
                const newChoices = [...choices];
                newChoices[index] = { ...newChoices[index] ,text: e.target.value };
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

export default RatingQuestion;
