import React from "react";

function FormViewer({ questions, setQuestions, role }) {
  const handleValueChange = (questionId, value) => {
    setQuestions(
      questions.map((question) =>
        question.id === questionId ? { ...question, answer: value } : question
      )
    );
  };

  return (
    <div className="mt-6 space-y-4">
      <>
        {questions
          .filter((question) => {
            if (role === "student") {
              if (question.section === "student") {
                return true;
              }
            } else {
              return true;
            }
          })
          .map((question, index) => (
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
              <p className="text-md font bold mb-2">
                {" "}
                {index + 1}. {question.question}
              </p>

              {question.type === "text" && (
                <input
                  type="text"
                  className="input text-sm input-bordered w-full"
                  placeholder="Enter answer"
                  value={question.answer}
                  onChange={(e) =>
                    handleValueChange(question.id, e.target.value)
                  }
                />
              )}

              {question.type === "number" && (
                <input
                  type="number"
                  className="input text-sm input-bordered w-full"
                  placeholder="Enter answer"
                  value={question.answer}
                  onChange={(e) =>
                    handleValueChange(question.id, e.target.value)
                  }
                />
              )}

              {question.type === "date" && (
                <input
                  type="date"
                  className="input text-sm input-bordered w-full"
                  placeholder="Enter answer"
                  value={question.answer}
                  onChange={(e) =>
                    handleValueChange(question.id, e.target.value)
                  }
                />
              )}

              {question.type === "multipleChoice" && (
                <div>
                  <select
                    className="input text-sm input-bordered w-full"
                    name=""
                    id=""
                    value={question.answer}
                    onChange={(e) =>
                      handleValueChange(question.id, e.target.value)
                    }
                  >
                    <option value="">Select choice</option>
                    {question.choices.map((choice) => (
                      <option key={choice.id} value={choice.text}>
                        {choice.text}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {question.type === "rating" && (
                <div className="flex items-start flex-col text-xs gap-2 ">
                  {question.rating.choices.map((choice, i) => (
                    <div className="flex  items-center gap-2">
                      {choice.enable && (
                        <>
                          <input
                            className="radio-xs md:radio"
                            type="radio"
                            id={i}
                            name={question.id}
                            value={i + 1}
                            onChange={(e) =>
                              handleValueChange(question.id, e.target.value)
                            }
                            checked={question.answer === (i + 1).toString()}
                          />
                          <label htmlFor={index}>{choice.text}</label>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </>
    </div>
  );
}

export default FormViewer;
