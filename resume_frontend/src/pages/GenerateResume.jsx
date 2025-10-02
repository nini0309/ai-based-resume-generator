import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBrain, FaTrash, FaPaperPlane } from "react-icons/fa";
import { generateResume } from "../api/ResumeService";
import Resume from "../components/Resume";
import EditResume from "../components/EditResume";

const GenerateResume = () => {
  const [showEditUI, setShowEditUI] = useState(false);
  const [showResumeUI, setShowResumeUI] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(true);

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState("");

  const handleGenerate = async () => {
    console.log(description);
    // server call to get resume

    try {
      setLoading(true);
      const responseData = await generateResume(description);
      setResume(responseData);

      toast.success("Resume Generated Successfully!", {
        duration: 3000,
        position: "top-center",
      });
      setShowPromptInput(false);
      setShowResumeUI(true);
    } catch (error) {
      console.log(error);
      toast.error("Error Generating Resume!");
    } finally {
      setLoading(false);
      setDescription("");
    }
  };

  const handleClear = () => {
    setDescription("");
  };

  function ShowInputField() {
    return (
      <div className="bg-base-200 shadow-lg rounded-lg p-10 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6 flex items-center justify-center gap-2">
          <FaBrain className="text-accent" /> AI Resume Description Input
        </h1>
        <p className="mb-4 text-lg text-gray-600">
          Enter a detailed description about yourself to generate your
          professional resume.
        </p>
        <textarea
          disabled={loading}
          className="textarea textarea-bordered w-full h-48 mb-6 resize-none"
          placeholder="Type your description here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <div className="flex justify-center gap-4">
          <button
            disabled={loading}
            onClick={handleGenerate}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading && <span className="loading loading-spinner"></span>}
            <FaPaperPlane />
            Generate Resume
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FaTrash /> Clear
          </button>
        </div>
      </div>
    );
  }
  function showResume() {
    console.log("inside show resume");
    return (
      <div>
        {/* {resume} */}
        <Resume data={JSON.parse(resume)} />

        <div className="flex mt-5 justify-center gap-2">
          <div
            onClick={() => {
              setShowPromptInput(true);
              setShowResumeUI(false);
            }}
            className="btn btn-accent"
          >
            Generate Another
          </div>
          <div
            onClick={() => {
              setShowPromptInput(false);
              setShowEditUI(true);
              setShowResumeUI(false);
            }}
            className="btn btn-success"
          >
            Edit
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 p-10 flex flex-col gap-3 items-center justify-center font-sans">
      {showEditUI && (
        <EditResume
          resumeData={JSON.parse(resume)}
          setResume={setResume}
          onCancel={() => {
            setShowEditUI(false);
            setShowResumeUI(true);
          }}
        />
      )}
      {showPromptInput && ShowInputField()}
      {showResumeUI && showResume()}
    </div>
  );
};

export default GenerateResume;
