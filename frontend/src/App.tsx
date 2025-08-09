import { useState } from 'react';
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
  const [jobDescription, setJobDescription] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (content: string) => {
    setResumeText(content);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
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
      const response = await axios.post('http://localhost:8000/resume/analyze', {
        text: resumeText
      });

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
        <p>Get AI-powered insights to optimize your resume for any job</p>
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
            {resumeText && (
              <div className="success-message">
                ✅ Resume uploaded successfully!
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
            disabled={!resumeText || !jobDescription || loading}
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
