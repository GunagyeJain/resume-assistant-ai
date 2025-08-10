import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function ExportReport() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    setLoading(true);
    try {
      // Render the report div to canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('ResumeAnalysisReport.pdf');
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* This div wraps everything you want in the PDF */}
      <div ref={reportRef} id="report-content" style={{ padding: 20 }}>
        {/* The parent component should render EnhancedResumeAnalysis and CoverLetterGenerator here */}
      </div>

      {/* Download button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDownload}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px'
        }}
      >
        <Download size={18} />
        {loading ? 'Generating PDF...' : 'Download Report'}
      </motion.button>
    </>
  );
}
