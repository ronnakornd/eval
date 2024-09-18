import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import DraggableQuestion from "./DraggableQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import RatingQuestion from "./RatingQuestion";
import {
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import "tailwindcss/tailwind.css";
import "daisyui/dist/full.css";

const FormBuilder = ({ currentForm }) => {
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState("");
  const [questionSection, setQuestionSection] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [formName, setFormName] = useState("");
  const [formId, setFormId] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        type: questionType,
        question: "",
        section: questionSection,
      },
    ]);
  };

  const moveQuestion = (fromIndex, toIndex) => {
    const updatedQuestions = [...questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    setQuestions(updatedQuestions);
  };

  const handleQuestionChange = (id, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, question: value } : q))
    );
  };

  const handleChoiceChange = (questionId, choices) => {
    setQuestions(
      questions.map((q) => (q.id === questionId ? { ...q, choices } : q))
    );
  };

  const handleRatingChange = (questionId, rating) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, rating, answer: rating.defaultRating } : q
      )
    );
  };

  const handleDelete = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    const form = {
      name: formName,
      questions,
    };
    if (currentForm) {
      const formDoc = doc(db, "forms", currentForm.id);
      await updateDoc(formDoc, { form });
      alert("Form updated successfully");
      return;
    }
    await addDoc(collection(db, "forms"), {
      form,
      createdAt: serverTimestamp(),
    }).then((docRef) => {
      window.location.href = `/form/edit/${docRef.id}`;
    });
  };

  useEffect(() => {
    if (currentForm) {
      console.log(currentForm);
      let data = currentForm.form;
      setFormName(data.name);
      setQuestions(data.questions);
    }
  }, [currentForm]);

  return (
    <div className="min-h-screen p-2">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">สร้างแบบประเมิน</h1>
        {!isPreview && (
          <div className="mt-6 space-y-4">
            <div className="w-100">
              <label htmlFor="" className="label label-text">
                ชื่อแบบประเมิน
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="ชื่อแบบประเมิน"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                name=""
                id=""
              />
            </div>
            {questions.map((question, index) => (
              <DraggableQuestion
                key={question.id}
                id={question.id}
                index={index}
                moveQuestion={moveQuestion}
              >
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <p className="p-5 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        {index + 1}
                      </p>
                      <p
                        className={`badge ${
                          question.section == "student"
                            ? "badge-neutral"
                            : "badge-accent"
                        }`}
                      >
                        {question.section}
                      </p>
                    </div>
                    <div
                      className="btn btn-circle bg-white"
                      onClick={() => handleDelete(question.id)}
                    >
                      <p className="text-red-500">✖</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    className="input input-bordered w-full mb-4"
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) =>
                      handleQuestionChange(question.id, e.target.value)
                    }
                  />

                  {question.type === "text" && (
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Enter answer"
                    />
                  )}

                  {question.type === "number" && (
                    <input
                      type="number"
                      className="input input-bordered w-full"
                      placeholder="Enter answer"
                    />
                  )}

                  {question.type === "date" && (
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      placeholder="Enter answer"
                    />
                  )}

                  {question.type === "textarea" && (
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Enter answer"
                    />
                  )}

                  {question.type === "multipleChoice" && (
                    <div>
                      <MultipleChoiceQuestion
                        questionId={question.id}
                        onSave={handleChoiceChange}
                        formChoices={question.choices}
                      />
                    </div>
                  )}
                  {question.type === "rating" && (
                    <div>
                      <RatingQuestion
                        questionId={question.id}
                        onSave={handleRatingChange}
                        setting={question.rating}
                      />
                    </div>
                  )}
                </div>
              </DraggableQuestion>
            ))}
          </div>
        )}

        {isPreview && (
          <>
            <h1 className="text-xl mb-4">{formName}</h1>
            {questions.map((question, index) => (
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                <p className="text-md font bold mb-2">
                  {" "}
                  {index + 1}. {question.question}
                </p>

                {question.type === "text" && (
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter answer"
                  />
                )}

                {question.type === "textarea" && (
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter answer"
                  />
                )}

                {question.type === "number" && (
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    placeholder="Enter answer"
                  />
                )}

                {question.type === "date" && (
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    placeholder="Enter answer"
                  />
                )}

                {question.type === "multipleChoice" && (
                  <div>
                    <select
                      className="input input-bordered w-full"
                      name=""
                      id=""
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
                  <div className="rating">
                    {[...Array(question.rating.maxRating)].map((_, i) => (
                      <input
                        type="radio"
                        name="rating-1"
                        className="mask mask-star"
                        value={i + 1}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        <div className="space-y-4 mt-4">
          {!isPreview && (
            <>
              <div className="flex items-center gap-2 w-full">
                <select
                  name=""
                  id=""
                  className="input input-bordered w-full"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                  placeholder="เลือกชนิดคำถาม"
                >
                  <option value="">เลือกชนิดคำถาม</option>
                  <option value="text">Text</option>
                  <option value="textarea">Description</option>
                  <option value="number">Number</option>
                  <option value="multipleChoice">Multiple Choice</option>
                  <option value="rating">Rating</option>
                  <option value="date">Date</option>
                </select>
                <select
                  name=""
                  id=""
                  value={questionSection}
                  className="input input-bordered w-full"
                  onChange={(e) => setQuestionSection(e.target.value)}
                >
                  <option value="">เลือกผู้ตอบคำถาม</option>
                  <option value="student">ผู้เรียน</option>
                  <option value="instructor">ผู้สอน</option>
                </select>
                <button className="btn btn-neutral" onClick={addQuestion}>
                  Add question
                </button>
              </div>

              <button className="btn btn-success w-full" onClick={handleSave}>
                {currentForm ? "Update Form" : "Create Form"}
              </button>
            </>
          )}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="text-xl font bold">Preview</span>
              <input
                type="checkbox"
                className="toggle"
                value={isPreview}
                onClick={() => setIsPreview(!isPreview)}
                checked={isPreview}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
