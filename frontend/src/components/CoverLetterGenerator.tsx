import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, Copy, Download, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './CoverLetterGenerator.css'

interface CoverLetterGeneratorProps {
  resumeText: string;
  jobDescription: string;
}

export function CoverLetterGenerator({
  resumeText,
  jobDescription,
}: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [tone, setTone] = useState<string>('professional');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoverLetter = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please provide both resume and job description');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/cover-letter/generate', {
        resume_text: resumeText,
        job_description: jobDescription,
        tone,
      });
      const candidates = response.data.cover_letter?.candidates;
      const text =
        candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        'No cover letter content found';
      setCoverLetter(text);
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover-letter.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="cover-letter-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="cover-letter-header">
        <div className="icon-wrapper">
          <FileText size={24} color="#fff" />
        </div>
        <div>
          <h2>AI Cover Letter Generator</h2>
          <p>Create personalized cover letters tailored to your target job</p>
        </div>
      </div>

      {error && <div className="cover-letter-error">{error}</div>}

      <div className="cover-letter-tone-selector">
        <label>Cover Letter Tone</label>
        <div className="tone-buttons">
          {[
            { value: 'professional', label: 'Professional' },
            { value: 'enthusiastic', label: 'Enthusiastic' },
            { value: 'creative', label: 'Creative' },
            { value: 'confident', label: 'Confident' },
          ].map(opt => (
            <button
              key={opt.value}
              className={tone === opt.value ? 'selected' : ''}
              onClick={() => setTone(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cover-letter-generate">
        <button onClick={generateCoverLetter} disabled={loading}>
          <Wand2 size={20} />
          {loading ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>

      <AnimatePresence>
        {coverLetter && (
          <motion.div
            className="cover-letter-output"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="output-header">
              <h3>Your Cover Letter</h3>
              <div className="actions">
                <button
                  onClick={copyToClipboard}
                  className={copied ? 'copied' : ''}
                >
                  <Copy size={14} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={downloadCoverLetter}>
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
            <div className="output-body">{coverLetter}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
