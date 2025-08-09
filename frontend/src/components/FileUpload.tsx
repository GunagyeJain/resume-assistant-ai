import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (content: string) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content);
      };
      
      reader.readAsText(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div 
      {...getRootProps()} 
      style={{
        border: '2px dashed #cbd5e0',
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isDragActive ? '#ebf4ff' : '#f7fafc',
        borderColor: isDragActive ? '#667eea' : '#cbd5e0'
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: '3rem', opacity: 0.6 }}>📄</div>
      <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', margin: '12px 0' }}>
        {isDragActive
          ? "Drop your resume here..."
          : "Click to upload or drag and drop"
        }
      </p>
      <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>
        Supports TXT, PDF files (max 10MB)
      </p>
    </div>
  );
}
