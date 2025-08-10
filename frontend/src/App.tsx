import React, { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { EnhancedResumeAnalysis } from "./components/EnhancedResumeAnalysis";
import { CoverLetterGenerator } from "./components/CoverLetterGenerator";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./contexts/ThemeContext";
import { ExportReport } from "./components/ExportReport";

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
  const { theme } = useTheme();
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (content: string, file?: File) => {
    if (file && content === "FILE_UPLOAD") {
      setResumeFile(file);
      setResumeText("");
    } else {
      setResumeText(content);
      setResumeFile(null);
    }
    setError(null);
  };

  const handleAnalyze = async () => {
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

      if (resumeFile) {
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
      } else {
        response = await axios.post("http://localhost:8000/resume/analyze", {
          text: resumeText,
        });
      }

      console.log("Current analysis:", response.data.analysis);
      setAnalysis(response.data.analysis);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.cardBackground} 100%)`,
        transition: "all 0.3s ease",
      }}
    >
      <ThemeToggle />

      <div
        className="app"
        style={{
          background: "transparent",
          color: theme.textPrimary,
        }}
      >
        <header className="app-header">
          <h1 style={{ color: theme.textPrimary }}>
            🤖 AI Resume & Portfolio Assistant
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Upload PDF, DOCX, or TXT files for AI-powered resume analysis +
            cover letter generation
          </p>
        </header>

        <main className="app-main">
          {error && (
            <div
              style={{
                background: `${theme.error}20`,
                color: theme.error,
                border: `1px solid ${theme.error}40`,
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div className="upload-section">
            <div
              style={{
                background: theme.cardBackground,
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: `1px solid ${theme.border}`,
                transition: "all 0.3s ease",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: theme.textPrimary,
                  margin: "0 0 20px 0",
                  fontWeight: 600,
                }}
              >
                📄 Upload Resume
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {(resumeText || resumeFile) && (
                <div
                  style={{
                    background: `${theme.success}20`,
                    color: theme.success,
                    border: `1px solid ${theme.success}40`,
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginTop: "16px",
                  }}
                >
                  ✅ Resume {resumeFile ? `file (${resumeFile.name})` : "text"}{" "}
                  uploaded successfully!
                </div>
              )}
            </div>

            <div
              style={{
                background: theme.cardBackground,
                padding: "24px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                border: `1px solid ${theme.border}`,
                transition: "all 0.3s ease",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  color: theme.textPrimary,
                  margin: "0 0 20px 0",
                  fontWeight: 600,
                }}
              >
                📋 Job Description
              </h2>
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
              style={{
                background: loading
                  ? theme.border
                  : `linear-gradient(135deg, ${theme.accent} 0%, ${theme.success} 100%)`,
                color: "white",
                border: "none",
                padding: "16px 32px",
                borderRadius: "8px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                minWidth: "200px",
                opacity:
                  (!resumeText && !resumeFile) || !jobDescription || loading
                    ? 0.6
                    : 1,
              }}
            >
              {loading ? "🔄 Analyzing..." : "🔍 Analyze Resume"}
            </button>
          </div>

          {analysis && (
            <div className="results-section">
              <EnhancedResumeAnalysis analysis={analysis} />
              <CoverLetterGenerator
                resumeText={resumeText || "Resume content from file"}
                jobDescription={jobDescription}
              />
              <ExportReport />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
