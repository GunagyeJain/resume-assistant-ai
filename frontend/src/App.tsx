import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { EnhancedResumeAnalysis } from "./components/EnhancedResumeAnalysis";
import { CoverLetterGenerator } from "./components/CoverLetterGenerator";
import axios from "axios";
import "./App.css";

interface AnalysisResult {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

function App() {
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (content: string, file?: File) => {
    console.log("File uploaded:", {
      content: content?.substring(0, 100),
      fileName: file?.name,
    });

    if (file && content === "FILE_UPLOAD") {
      setResumeFile(file);
      setResumeText(""); // Clear text when file is uploaded
      console.log("File mode - resume file set");
    } else {
      setResumeText(content);
      setResumeFile(null);
      console.log("Text mode - resume text set");
    }
    setError(null);
  };

  const handleAnalyze = async () => {
    console.log("Analyze button clicked");
    console.log("Current state:", {
      hasResumeText: !!resumeText,
      hasResumeFile: !!resumeFile,
      hasJobDescription: !!jobDescription,
    });

    if (!resumeText && !resumeFile) {
      setError("Please upload a resume first");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please provide a job description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      let actualResumeText = "";

      if (resumeFile) {
        console.log("Using file upload endpoint");
        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("job_description", jobDescription);

        response = await axios.post(
          "http://localhost:8000/resume/analyze-file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // For cover letter, we'll need the extracted text
        // This is a limitation - we need to extract the text somehow
        actualResumeText = "File uploaded - text extracted by backend";
      } else {
        console.log("Using text analysis endpoint");
        response = await axios.post("http://localhost:8000/resume/analyze", {
          text: resumeText,
        });
        actualResumeText = resumeText;
      }

      console.log("Analysis response:", response.data);
      setAnalysis(response.data.analysis);

      // Store the resume text for cover letter generation
      if (resumeFile) {
        // TODO: We need to get the extracted text back from backend
        setResumeText(actualResumeText);
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debug: Log current analysis data
  console.log("Current analysis:", analysis);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Resume & Portfolio Assistant</h1>
        <p>
          Upload PDF, DOCX, or TXT files for AI-powered resume analysis + cover
          letter generation
        </p>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        <div className="upload-section">
          <div className="card">
            <h2>📄 Upload Resume</h2>
            <FileUpload onFileUpload={handleFileUpload} />
            {(resumeText || resumeFile) && (
              <div className="success-message">
                ✅ Resume {resumeFile ? `file (${resumeFile.name})` : "text"}{" "}
                uploaded successfully!
                {/* Debug info */}
                <div
                  style={{ fontSize: "0.8rem", marginTop: "4px", opacity: 0.7 }}
                >
                  Debug: Text length: {resumeText.length}, File:{" "}
                  {resumeFile?.name || "none"}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>📋 Job Description</h2>
            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />
          </div>
        </div>

        <div className="analyze-section">
          <button
            className={`analyze-button ${loading ? "loading" : ""}`}
            onClick={handleAnalyze}
            disabled={
              (!resumeText && !resumeFile) || !jobDescription || loading
            }
          >
            {loading ? "🔄 Analyzing..." : "🔍 Analyze Resume"}
          </button>
        </div>

        {analysis && (
          <div className="results-section">
            <EnhancedResumeAnalysis analysis={analysis} />

            {/* Add Cover Letter Generator with debug */}
            <CoverLetterGenerator
              resumeText={resumeFile ? "FILE_CONTENT_PLACEHOLDER" : resumeText}
              jobDescription={jobDescription}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
