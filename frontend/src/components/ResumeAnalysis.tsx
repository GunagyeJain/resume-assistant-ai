import React from 'react';

interface AnalysisResult {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface ResumeAnalysisProps {
  analysis: AnalysisResult;
}

export function ResumeAnalysis({ analysis }: ResumeAnalysisProps) {
  const analysisText = analysis.candidates[0]?.content.parts[0]?.text || 'No analysis available';

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        color: '#2d3748',
        margin: '0 0 20px 0',
        fontWeight: 600
      }}>
        📊 AI Analysis Results
      </h2>
      
      <div style={{
        background: '#f7fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        fontSize: '0.95rem'
      }}>
        {analysisText}
      </div>
    </div>
  );
}
