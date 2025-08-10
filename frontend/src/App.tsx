import React, { useState, useRef } from "react";
import { FileUpload } from "./components/FileUpload";
import { JobDescriptionInput } from "./components/JobDescriptionInput";
import { EnhancedResumeAnalysis } from "./components/EnhancedResumeAnalysis";
import { CoverLetterGenerator } from "./components/CoverLetterGenerator";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./contexts/ThemeContext";
import { Download, Upload, ClipboardList, Search } from "lucide-react";

import { GitHubProfileInput } from "./components/GitHubProfileInput";
import { LinkedInSummaryInput } from "./components/LinkedInSummaryInput";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
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
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [linkedInSummary, setLinkedInSummary] = React.useState("");
  const [gitHubProfile, setGitHubProfile] = React.useState<any>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExportLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(pdfW / canvas.width, pdfH / canvas.height);
      const imgW = canvas.width * ratio;
      const imgH = canvas.height * ratio;
      const x = (pdfW - imgW) / 2;
      const y = 20;

      pdf.addImage(imgData, "PNG", x, y, imgW, imgH);
      pdf.save(
        `Resume_Analysis_Report_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

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
    // ✅ Basic validation
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

      // Prepare optional extra data
      const githubData = gitHubProfile
        ? {
            login: gitHubProfile.login,
            name: gitHubProfile.name,
            bio: gitHubProfile.bio,
            public_repos: gitHubProfile.public_repos,
            followers: gitHubProfile.followers,
            url: gitHubProfile.html_url,
          }
        : null;

      const linkedinData = linkedInSummary?.trim() || null;

      if (resumeFile) {
        // ✅ If a file was uploaded, send it as FormData
        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("job_description", jobDescription);
        if (githubData)
          formData.append("github_profile", JSON.stringify(githubData));
        if (linkedinData) formData.append("linkedin_summary", linkedinData);

        response = await axios.post(
          "http://localhost:8000/resume/analyze-file",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // ✅ If text content was provided instead of file
        response = await axios.post("http://localhost:8000/resume/analyze", {
          text: resumeText,
          job_description: jobDescription,
          github_profile: githubData,
          linkedin_summary: linkedinData,
        });
      }

      // ✅ Save the AI analysis result
      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <ThemeToggle />

      <div className="app">
        <header className="app-header">
          <h1>
            <ClipboardList size={32} /> AI Resume &amp; Portfolio Assistant
          </h1>
          <p>
            Upload PDF, DOCX, or TXT files for AI-powered resume analysis and
            cover letter generation
          </p>
        </header>

        <main className="app-main">
          {error && <div className="error-message">{error}</div>}

          <div className="upload-section">
            {/* Upload Resume */}
            <div className="card">
              <h2>
                <Upload size={20} /> Upload Resume
              </h2>
              <FileUpload onFileUpload={handleFileUpload} />
              {(resumeText || resumeFile) && (
                <div className="success-message">
                  {resumeFile ? `File (${resumeFile.name})` : "Text"} uploaded
                  successfully
                </div>
              )}
            </div>

            {/* Profile Insights */}
            <div className="card">
              <h2>Profile Insights</h2>
              <GitHubProfileInput onProfileFetched={setGitHubProfile} />
              <LinkedInSummaryInput
                value={linkedInSummary}
                onChange={setLinkedInSummary}
              />
              {gitHubProfile && (
                <div className="profile-card">
                  <img
                    src={gitHubProfile.avatar_url}
                    alt="Avatar"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 56,
                      marginBottom: 8,
                    }}
                  />
                  <div style={{ fontWeight: "700", marginBottom: 4 }}>
                    {gitHubProfile.name || gitHubProfile.login}
                  </div>
                  <div
                    style={{ color: "var(--text-secondary)", marginBottom: 6 }}
                  >
                    {gitHubProfile.bio}
                  </div>
                  <div
                    style={{
                      fontSize: "0.92rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <strong>{gitHubProfile.public_repos}</strong> public repos •{" "}
                    <strong>{gitHubProfile.followers}</strong> followers
                  </div>
                  <a
                    href={gitHubProfile.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginTop: 8,
                      display: "inline-block",
                      color: "var(--accent)",
                      fontWeight: 500,
                    }}
                  >
                    View GitHub &rarr;
                  </a>
                </div>
              )}
              {linkedInSummary && (
                <div className="profile-card">
                  <div style={{ fontWeight: 700 }}>LinkedIn Summary</div>
                  <div
                    style={{
                      fontSize: "0.96rem",
                      color: "var(--text-secondary)",
                      marginTop: 6,
                    }}
                  >
                    {linkedInSummary}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="card">
              <h2>
                <ClipboardList size={20} /> Job Description
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
            >
              <Search size={18} />
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>
          </div>

          {analysis && (
            <>
              <div ref={reportRef} className="results-wrapper">
                <EnhancedResumeAnalysis analysis={analysis} />
                <CoverLetterGenerator
                  resumeText={resumeText || "Resume content from uploaded file"}
                  jobDescription={jobDescription}
                />
              </div>

              <div className="export-section">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportPDF}
                  disabled={exportLoading}
                  className="analyze-button"
                >
                  <Download size={18} />
                  {exportLoading
                    ? "Generating PDF..."
                    : "Download Complete Report"}
                </motion.button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
