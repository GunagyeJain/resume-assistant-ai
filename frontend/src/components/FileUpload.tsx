import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (content: string, file?: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      
      // For text files, read directly in frontend
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileUpload(content, file);
        };
        reader.readAsText(file);
      } else {
        // For PDF/DOCX, just pass the file object
        // Backend will handle the parsing
        onFileUpload('FILE_UPLOAD', file);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div>
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
        <div style={{ fontSize: '3rem', opacity: 0.6 }}>
          {uploadedFile?.type.includes('pdf') ? '📄' : 
           uploadedFile?.type.includes('word') || uploadedFile?.name.endsWith('.docx') ? '📝' : 
           '📄'}
        </div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2d3748', margin: '12px 0' }}>
          {isDragActive
            ? "Drop your resume here..."
            : "Click to upload or drag and drop"
          }
        </p>
        <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>
          Supports TXT, PDF, DOC, DOCX files (max 10MB)
        </p>
      </div>
      
      {uploadedFile && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#c6f6d5', 
          borderRadius: '8px',
          color: '#2d5016'
        }}>
          <strong>📎 Uploaded:</strong> {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
        </div>
      )}
    </div>
  );
}
