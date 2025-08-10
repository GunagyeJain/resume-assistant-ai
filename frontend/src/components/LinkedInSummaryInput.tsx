import React from 'react';

export function LinkedInSummaryInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label htmlFor="linkedin-summary" style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
        LinkedIn "About" / Summary (Paste here)
      </label>
      <textarea
        id="linkedin-summary"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste your LinkedIn About/Summary section here"
        rows={4}
        style={{
          width: '100%',
          padding: 8,
          fontSize: '1rem',
          borderRadius: 6,
          border: '1px solid #ccc',
          marginBottom: 12,
        }}
      />
    </div>
  );
}
