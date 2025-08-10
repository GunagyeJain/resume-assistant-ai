import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeAnalysis } from './components/ResumeAnalysis';
import axios from 'axios';
import './App.css';

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
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (content: string, file?: File) => {
    if (file && content === 'FILE_UPLOAD') {
      // Handle file upload (PDF/DOCX)
      setResumeFile(file);
      setResumeText('');
    } else {
      // Handle text content
      setResumeText(content);
      setResumeFile(null);
    }
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText && !resumeFile) {
      setError('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please provide a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (resumeFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('job_description', jobDescription);
        
        response = await axios.post('http://localhost:8000/resume/analyze-file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Handle text input
        response = await axios.post('http://localhost:8000/resume/analyze', {
          text: resumeText
        });
      }

      setAnalysis(response.data.analysis);
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Resume & Portfolio Assistant</h1>
        <p>Upload PDF, DOCX, or TXT files for AI-powered resume analysis</p>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="upload-section">
          <div className="card">
            <h2>📄 Upload Resume</h2>
            <FileUpload onFileUpload={handleFileUpload} />
            {(resumeText || resumeFile) && (
              <div className="success-message">
                ✅ Resume {resumeFile ? `file (${resumeFile.name})` : 'text'} uploaded successfully!
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
            className={`analyze-button ${loading ? 'loading' : ''}`}
            onClick={handleAnalyze}
            disabled={(!resumeText && !resumeFile) || !jobDescription || loading}
          >
            {loading ? '🔄 Analyzing...' : '🔍 Analyze Resume'}
          </button>
        </div>

        {analysis && (
          <div className="results-section">
            <ResumeAnalysis analysis={analysis} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
