import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Wand2, Copy, Download, CheckCircle } from "lucide-react";
import axios from "axios";

interface CoverLetterGeneratorProps {
  resumeText: string;
  jobDescription: string;
}

export function CoverLetterGenerator({
  resumeText,
  jobDescription,
}: CoverLetterGeneratorProps) {
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tone, setTone] = useState<string>("professional");
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateCoverLetter = async () => {
    console.log("=== COVER LETTER DEBUG START ===");
    console.log("Resume text available:", !!resumeText);
    console.log("Resume text length:", resumeText?.length);
    console.log("Job description available:", !!jobDescription);
    console.log("Job description length:", jobDescription?.length);
    console.log("Tone:", tone);

    if (!resumeText || !jobDescription) {
      setError("Please provide both resume and job description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        resume_text: resumeText,
        job_description: jobDescription,
        tone: tone,
      };

      console.log("Making request to backend...");
      const response = await axios.post(
        "http://localhost:8000/cover-letter/generate",
        requestData
      );

      console.log("Backend response status:", response.status);
      console.log("Full backend response:", response.data);

      // Replace this section in your generateCoverLetter function:
      if (response.data && response.data.cover_letter) {
        const coverLetterData = response.data.cover_letter;
        console.log("Cover letter data structure:", coverLetterData);

        // Use EXACT SAME logic as the analysis component
        let letterText = "Could not extract cover letter text";

        try {
          console.log("Attempting to extract text from cover letter...");

          // Check if coverLetterData exists
          if (!coverLetterData) {
            console.log("No cover letter data");
            letterText = "No cover letter data received";
          }
          // Check for error first
          else if (coverLetterData.error) {
            console.log("Cover letter contains error:", coverLetterData.error);
            letterText = `Cover Letter Error: ${coverLetterData.error}`;
          }
          // Check candidates array
          else if (
            !coverLetterData.candidates ||
            !Array.isArray(coverLetterData.candidates)
          ) {
            console.log("No candidates array found in cover letter");
            letterText = "No candidates in cover letter response";
          } else if (coverLetterData.candidates.length === 0) {
            console.log("Empty candidates array in cover letter");
            letterText = "Empty candidates array in cover letter response";
          } else {
            const firstCandidate = coverLetterData.candidates[0];
            console.log("Cover letter first candidate:", firstCandidate);

            // Check content structure
            if (!firstCandidate.content) {
              console.log("No content in first cover letter candidate");
              letterText = "No content in cover letter candidate";
            } else if (
              !firstCandidate.content.parts ||
              !Array.isArray(firstCandidate.content.parts)
            ) {
              console.log("No parts array in cover letter content");
              letterText = "No parts array in cover letter content";
            } else if (firstCandidate.content.parts.length === 0) {
              console.log("Empty parts array in cover letter");
              letterText = "Empty parts array in cover letter";
            } else {
              const firstPart = firstCandidate.content.parts[0];
              console.log("Cover letter first part:", firstPart);

              if (!firstPart.text) {
                console.log("No text in first cover letter part");
                letterText = "No text field in cover letter part";
              } else {
                const extractedText = firstPart.text.trim();
                console.log("✅ Successfully extracted cover letter text!");
                console.log("Cover letter text length:", extractedText.length);
                console.log(
                  "Cover letter text preview:",
                  extractedText.substring(0, 200) + "..."
                );
                letterText = extractedText;
              }
            }
          }
        } catch (error) {
          console.error("Error extracting cover letter text:", error);
          letterText = `Error extracting cover letter: ${error.message}`;
        }

        console.log(
          "Final cover letter text to display:",
          letterText.substring(0, 100) + "..."
        );
        setCoverLetter(letterText);
      } else {
        console.log("❌ No cover_letter field in response");
        setError("No cover letter data received from server");
      }
    } catch (err) {
      console.error("Cover letter generation error:", err);
      console.error("Error response:", err.response?.data);
      setError(`Failed to generate cover letter: ${err.message}`);
    } finally {
      setLoading(false);
      console.log("=== COVER LETTER DEBUG END ===");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cover-letter.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2px",
        borderRadius: "20px",
        marginTop: "30px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "18px",
          padding: "30px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              borderRadius: "12px",
              padding: "12px",
              marginRight: "16px",
            }}
          >
            <FileText size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#1a202c" }}>
              📝 AI Cover Letter Generator
            </h2>
            <p style={{ margin: "4px 0 0", color: "#718096" }}>
              Create personalized cover letters tailored to your target job
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              color: "#dc2626",
              marginBottom: "20px",
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Tone Selector */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Cover Letter Tone:
          </label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { value: "professional", label: "👔 Professional" },
              { value: "enthusiastic", label: "⚡ Enthusiastic" },
              { value: "creative", label: "🎨 Creative" },
              { value: "confident", label: "💪 Confident" },
            ].map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTone(option.value)}
                style={{
                  padding: "8px 16px",
                  border: `2px solid ${
                    tone === option.value ? "#10b981" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  background: tone === option.value ? "#f0fdf4" : "white",
                  color: tone === option.value ? "#10b981" : "#6b7280",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateCoverLetter}
          disabled={loading || !resumeText || !jobDescription}
          style={{
            background: loading
              ? "#9ca3af"
              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "16px 32px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Wand2 size={20} />
              </motion.div>
              Generating Magic...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              Generate Cover Letter
            </>
          )}
        </motion.button>

        {/* Cover Letter Output */}
        <AnimatePresence>
          {coverLetter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <h3 style={{ margin: 0, color: "#374151", fontSize: "1.1rem" }}>
                  Your Generated Cover Letter
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyToClipboard}
                    style={{
                      background: copied ? "#10b981" : "transparent",
                      border: "1px solid #10b981",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: copied ? "white" : "#10b981",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    {copied ? "Copied!" : "Copy"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={downloadCoverLetter}
                    style={{
                      background: "transparent",
                      border: "1px solid #6366f1",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      color: "#6366f1",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Download size={14} />
                    Download
                  </motion.button>
                </div>
              </div>

              {/* Cover Letter Content */}
              <div
                style={{
                  padding: "24px",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.7",
                  fontSize: "1rem",
                  color: "#374151",
                  fontFamily: "Georgia, serif",
                }}
              >
                {coverLetter}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
