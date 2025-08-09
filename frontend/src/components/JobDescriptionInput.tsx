import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here...

Example:
- Software Developer position
- Required: Python, React, FastAPI
- 3+ years experience
- Build and maintain web applications"
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '12px 16px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'inherit',
          lineHeight: '1.5',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.2s ease'
        }}
        onFocus={(e) => e.target.style.borderColor = '#667eea'}
        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  );
}
