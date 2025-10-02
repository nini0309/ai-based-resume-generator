import React from "react";
import { FaSave, FaTimes } from "react-icons/fa";

const EditResume = ({ resumeData, setResume, onCancel }) => {
  const [formData, setFormData] = React.useState(resumeData);

  const handleChange = (path, value) => {
    // update nested fields dynamically using path
    setFormData((prev) => {
      const updated = { ...prev };
      let temp = updated;
      const keys = path.split(".");
      keys.slice(0, -1).forEach((k) => {
        temp[k] = { ...temp[k] };
        temp = temp[k];
      });
      temp[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated[section] = [...updated[section]];
      updated[section][index] = {
        ...updated[section][index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleSave = () => {
    setResume(JSON.stringify(formData)); // pass back updated resume
    onCancel(); // exit edit mode
  };

  return (
    <div className="bg-base-200 shadow-lg rounded-lg p-6 max-w-4xl w-full">
      <h2 className="text-2xl font-bold mb-4">Edit Resume</h2>

      {/* Personal Info */}
      <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
      {Object.keys(formData.personalInformation).map((key) => (
        <div key={key} className="mb-3">
          <label className="block font-semibold capitalize">{key}</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={formData.personalInformation[key] || ""}
            onChange={(e) =>
              handleChange(`personalInformation.${key}`, e.target.value)
            }
          />
        </div>
      ))}

      {/* Summary */}
      <div className="mb-4">
        <label className="block font-semibold">Summary</label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={formData.summary || ""}
          onChange={(e) => handleChange("summary", e.target.value)}
        />
      </div>

      {/* Skills */}
      <h3 className="text-lg font-semibold mb-2">Skills</h3>
      {formData.skills.map((skill, i) => (
        <div key={i} className="mb-3">
          <input
            type="text"
            className="input input-bordered w-1/2 mr-2"
            value={skill.title}
            onChange={(e) =>
              handleArrayChange("skills", i, "title", e.target.value)
            }
          />
          <input
            type="text"
            className="input input-bordered w-1/3"
            value={skill.level}
            onChange={(e) =>
              handleArrayChange("skills", i, "level", e.target.value)
            }
          />
        </div>
      ))}

      {/* Experience */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Experience</h3>
      {formData.experience.map((exp, i) => (
        <div key={i} className="mb-4 border-b pb-3">
          <input
            className="input input-bordered w-full mb-2"
            placeholder="Job Title"
            value={exp.jobTitle}
            onChange={(e) =>
              handleArrayChange("experience", i, "jobTitle", e.target.value)
            }
          />
          <input
            className="input input-bordered w-full mb-2"
            placeholder="Company"
            value={exp.company}
            onChange={(e) =>
              handleArrayChange("experience", i, "company", e.target.value)
            }
          />
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Responsibility"
            value={exp.responsibility}
            onChange={(e) =>
              handleArrayChange(
                "experience",
                i,
                "responsibility",
                e.target.value
              )
            }
          />
        </div>
      ))}

      {/* Education */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Education</h3>
      {formData.education.map((edu, i) => (
        <div key={i} className="mb-4 border-b pb-3">
          <input
            className="input input-bordered w-full mb-2"
            value={edu.degree}
            onChange={(e) =>
              handleArrayChange("education", i, "degree", e.target.value)
            }
          />
          <input
            className="input input-bordered w-full mb-2"
            value={edu.university}
            onChange={(e) =>
              handleArrayChange("education", i, "university", e.target.value)
            }
          />
        </div>
      ))}

      {/* Certifications */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Certifications</h3>
      {formData.certifications.map((cert, i) => (
        <div key={i} className="mb-3">
          <input
            className="input input-bordered w-1/2 mr-2"
            value={cert.title}
            onChange={(e) =>
              handleArrayChange("certifications", i, "title", e.target.value)
            }
          />
          <input
            className="input input-bordered w-1/3"
            value={cert.year}
            onChange={(e) =>
              handleArrayChange("certifications", i, "year", e.target.value)
            }
          />
        </div>
      ))}

      {/* Projects */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Projects</h3>
      {formData.projects.map((proj, i) => (
        <div key={i} className="mb-4 border-b pb-3">
          <input
            className="input input-bordered w-full mb-2"
            placeholder="Project Title"
            value={proj.title}
            onChange={(e) =>
              handleArrayChange("projects", i, "title", e.target.value)
            }
          />
          <textarea
            className="textarea textarea-bordered w-full mb-2"
            placeholder="Description"
            value={proj.description}
            onChange={(e) =>
              handleArrayChange("projects", i, "description", e.target.value)
            }
          />
        </div>
      ))}

      {/* Achievements */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Achievements</h3>
      {formData.achievements.map((ach, i) => (
        <div key={i} className="mb-3">
          <input
            className="input input-bordered w-2/3 mr-2"
            value={ach.title}
            onChange={(e) =>
              handleArrayChange("achievements", i, "title", e.target.value)
            }
          />
          <input
            className="input input-bordered w-1/4"
            value={ach.year}
            onChange={(e) =>
              handleArrayChange("achievements", i, "year", e.target.value)
            }
          />
        </div>
      ))}

      {/* Languages */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Languages</h3>
      {formData.languages.map((lang, i) => (
        <input
          key={i}
          className="input input-bordered w-1/2 mb-2"
          value={lang.name}
          onChange={(e) =>
            handleArrayChange("languages", i, "name", e.target.value)
          }
        />
      ))}

      {/* Interests */}
      <h3 className="text-lg font-semibold mb-2 mt-4">Interests</h3>
      {formData.interests.map((interest, i) => (
        <input
          key={i}
          className="input input-bordered w-1/2 mb-2"
          value={interest.name}
          onChange={(e) =>
            handleArrayChange("interests", i, "name", e.target.value)
          }
        />
      ))}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} className="btn btn-success flex gap-2">
          <FaSave /> Save
        </button>
        <button onClick={onCancel} className="btn btn-error flex gap-2">
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  );
};

export default EditResume;
