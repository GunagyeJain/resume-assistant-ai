import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target,
  FileText,
  Zap,
} from "lucide-react";

interface AnalysisResult {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: string;
}

interface EnhancedResumeAnalysisProps {
  analysis: AnalysisResult;
}

export function EnhancedResumeAnalysis({
  analysis,
}: EnhancedResumeAnalysisProps) {
  // Add debug logging at the top
  console.log("=== ANALYSIS COMPONENT DEBUG ===");
  console.log("Analysis prop received:", analysis);

  const [atsScore, setAtsScore] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Fixed text extraction with proper debugging
  const analysisText = (() => {
    try {
      console.log("Attempting to extract text from analysis...");

      // Check if analysis exists
      if (!analysis) {
        console.log("No analysis object provided");
        return "No analysis data received";
      }

      // Check for error first
      if (analysis.error) {
        console.log("Analysis contains error:", analysis.error);
        return `Analysis Error: ${analysis.error}`;
      }

      // Check candidates array
      if (!analysis.candidates || !Array.isArray(analysis.candidates)) {
        console.log("No candidates array found");
        return "No candidates in analysis response";
      }

      if (analysis.candidates.length === 0) {
        console.log("Empty candidates array");
        return "Empty candidates array in response";
      }

      const firstCandidate = analysis.candidates[0];
      console.log("First candidate:", firstCandidate);

      // Check content structure
      if (!firstCandidate.content) {
        console.log("No content in first candidate");
        return "No content in analysis candidate";
      }

      if (
        !firstCandidate.content.parts ||
        !Array.isArray(firstCandidate.content.parts)
      ) {
        console.log("No parts array in content");
        return "No parts array in analysis content";
      }

      if (firstCandidate.content.parts.length === 0) {
        console.log("Empty parts array");
        return "Empty parts array in analysis";
      }

      const firstPart = firstCandidate.content.parts[0];
      console.log("First part:", firstPart);

      if (!firstPart.text) {
        console.log("No text in first part");
        return "No text field in analysis part";
      }

      const extractedText = firstPart.text.trim();
      console.log("Successfully extracted text. Length:", extractedText.length);
      console.log("Text preview:", extractedText.substring(0, 200) + "...");

      return extractedText;
    } catch (error) {
      console.error("Error extracting analysis text:", error);
      return `Error extracting text: ${error.message}`;
    }
  })();

  console.log("Final analysisText:", analysisText.substring(0, 100) + "...");
  console.log("=== END ANALYSIS DEBUG ===");

  // Extract scores from AI text using multiple patterns
  useEffect(() => {
    console.log("useEffect: Analyzing text for scores...");
    console.log("Text to analyze:", analysisText.substring(0, 300) + "...");

    // Try different patterns to extract ATS score
    const atsPatterns = [
      /ATS.*?SCORE.*?(\d+)/i,
      /ATS.*?(\d+)\/100/i,
      /COMPATIBILITY.*?(\d+)/i,
      /Score.*?(\d+)/i,
    ];

    const ratingPatterns = [
      /Overall Rating.*?(\d+)/i,
      /Rating.*?(\d+)\/10/i,
      /Assessment.*?(\d+)/i,
    ];

    let extractedAtsScore = 75; // Default fallback
    let extractedRating = 7; // Default fallback

    // Try to extract ATS score
    for (const pattern of atsPatterns) {
      const match = analysisText.match(pattern);
      if (match) {
        extractedAtsScore = Math.min(100, Math.max(0, parseInt(match[1])));
        console.log(
          "Found ATS score:",
          extractedAtsScore,
          "using pattern:",
          pattern
        );
        break;
      }
    }

    // Try to extract rating
    for (const pattern of ratingPatterns) {
      const match = analysisText.match(pattern);
      if (match) {
        extractedRating = Math.min(10, Math.max(0, parseInt(match[1])));
        console.log(
          "Found rating:",
          extractedRating,
          "using pattern:",
          pattern
        );
        break;
      }
    }

    console.log(
      "Final scores - ATS:",
      extractedAtsScore,
      "Rating:",
      extractedRating
    );

    setAtsScore(extractedAtsScore);
    setOverallRating(extractedRating);

    // Animated score counter
    let counter = 0;
    const interval = setInterval(() => {
      counter += 2;
      setAnimatedScore(Math.min(counter, extractedAtsScore));
      if (counter >= extractedAtsScore) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [analysisText]);

  // Parse strengths and weaknesses from text
  // Parse strengths and weaknesses from text
  const parseSection = (text: string, sectionName: string): string[] => {
    try {
      if (!text || typeof text !== "string") {
        console.log(`parseSection: Invalid text for ${sectionName}`);
        return [];
      }

      const regex = new RegExp(
        `${sectionName}[:\\s]*([^\\n]*(?:\\n\\s*[-•].*)*)`,
        "i"
      );
      const match = text.match(regex);

      if (match && match[1]) {
        const result = match[1]
          .split(/[-•]/)
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
          .slice(0, 4);

        console.log(
          `parseSection: Found ${result.length} items for ${sectionName}:`,
          result
        );
        return result;
      } else {
        console.log(`parseSection: No matches found for ${sectionName}`);
        return [];
      }
    } catch (error) {
      console.error(`parseSection error for ${sectionName}:`, error);
      return [];
    }
  };

  const strengths = parseSection(analysisText, "Key Strengths|Strengths");
  const improvements = parseSection(
    analysisText,
    "Critical Issues|Improvements|Areas for"
  );
  const recommendations = parseSection(
    analysisText,
    "Recommendations|Quick Wins"
  );

  // Mock skills data (you can enhance this by parsing from AI response)
  const skillsData = [
    {
      name: "Technical Skills",
      current: Math.floor(atsScore / 12),
      recommended: 10,
    },
    { name: "Keywords", current: Math.floor(atsScore / 15), recommended: 9 },
    { name: "Format/ATS", current: Math.floor(atsScore / 11), recommended: 8 },
    { name: "Experience", current: Math.floor(atsScore / 13), recommended: 10 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10B981"; // Green
    if (score >= 60) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2px",
        borderRadius: "20px",
        marginTop: "20px",
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "12px",
              padding: "12px",
              marginRight: "16px",
            }}
          >
            <Target size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#1a202c" }}>
              🎯 AI-Powered Analysis Results
            </h2>
            <p style={{ margin: "4px 0 0", color: "#718096" }}>
              Professional resume evaluation with ATS optimization
            </p>
          </div>
        </motion.div>

        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              background: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            <strong>Debug Info:</strong>
            <br />
            Analysis Text Length: {analysisText.length}
            <br />
            Has Candidates: {analysis?.candidates ? "Yes" : "No"}
            <br />
            ATS Score: {atsScore}, Rating: {overallRating}
          </div>
        )}

        {/* Score Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* ATS Compatibility Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              border: `2px solid ${getScoreColor(atsScore)}`,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100px",
                height: "100px",
                margin: "0 auto 16px",
                position: "relative",
              }}
            >
              <CircularProgressbar
                value={animatedScore}
                text={`${animatedScore}`}
                styles={buildStyles({
                  pathColor: getScoreColor(atsScore),
                  textColor: getScoreColor(atsScore),
                  trailColor: "#f1f5f9",
                  textSize: "24px",
                  pathTransition: "stroke-dashoffset 0.8s ease 0s",
                })}
              />
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.2rem",
                color: "#2d3748",
              }}
            >
              ATS Compatibility
            </h3>
            <p
              style={{
                margin: 0,
                color: getScoreColor(atsScore),
                fontWeight: "bold",
                fontSize: "1.1rem",
              }}
            >
              {getScoreLabel(atsScore)}
            </p>
          </motion.div>

          {/* Overall Rating */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: "linear-gradient(135deg, #ebf4ff 0%, #dbeafe 100%)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              border: "2px solid #3b82f6",
              boxShadow: "0 8px 25px rgba(59, 130, 246, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: i < overallRating ? 1.2 : 0.4,
                    opacity: i < overallRating ? 1 : 0.3,
                  }}
                  transition={{ delay: 0.1 * i, type: "spring" }}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: i < overallRating ? "#3b82f6" : "#e5e7eb",
                    margin: "0 2px",
                    boxShadow:
                      i < overallRating
                        ? "0 2px 4px rgba(59, 130, 246, 0.3)"
                        : "none",
                  }}
                />
              ))}
            </div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.2rem",
                color: "#2d3748",
              }}
            >
              Overall Rating
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#3b82f6",
              }}
            >
              {overallRating}/10
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: "linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)",
              borderRadius: "16px",
              padding: "24px",
              border: "2px solid #10b981",
              boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap size={32} color="#10b981" />
              </motion.div>
            </div>
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "1.2rem",
                color: "#2d3748",
                textAlign: "center",
              }}
            >
              Quick Actions
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "#10b981",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                📄 Generate Cover Letter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "2px solid #10b981",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#10b981",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                📊 Download Report
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Key Insights Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {/* Strengths */}
          {strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #a7f3d0",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#065f46",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <CheckCircle size={18} style={{ marginRight: "8px" }} />
                Key Strengths
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#047857" }}>
                {strengths.slice(0, 3).map((strength, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Improvements */}
          {improvements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #f59e0b",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <AlertTriangle size={18} style={{ marginRight: "8px" }} />
                Areas to Improve
              </h4>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "#b45309" }}>
                {improvements.slice(0, 3).map((improvement, i) => (
                  <li key={i} style={{ marginBottom: "4px" }}>
                    {improvement}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Skills Analysis Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "30px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px",
              display: "flex",
              alignItems: "center",
              color: "#2d3748",
            }}
          >
            <TrendingUp size={20} style={{ marginRight: "8px" }} />
            Skills Gap Analysis
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="current"
                fill="#667eea"
                name="Current Level"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="recommended"
                fill="#764ba2"
                name="Target Level"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Detailed Analysis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid #e5e5e5",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              display: "flex",
              alignItems: "center",
              color: "#2d3748",
            }}
          >
            <FileText size={20} style={{ marginRight: "8px" }} />
            Complete AI Analysis
          </h3>
          <div
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.6",
              fontSize: "0.95rem",
              color: "#4a5568",
              maxHeight: "300px",
              overflowY: "auto",
              padding: "16px",
              background: "white",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            {analysisText}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
