import React, { useState, useEffect } from "react";

const RatingQuestion = ({ questionId, onSave, setting }) => {
  const [rating, setRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  const handleSave = () => {
    onSave(questionId, { defaultRating: rating, maxRating });
  };

  useEffect(() => {
    handleSave();
  }, [rating, maxRating]);

  useEffect(() => {
    if(setting){
      setRating(setting.defaultRating);
      setMaxRating(setting.maxRating);
    }
  }
  ,[]);

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
    </div>
  );
};

export default RatingQuestion;
