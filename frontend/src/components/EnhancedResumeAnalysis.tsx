import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, Target, FileText, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface AnalysisResult {
  candidates?: Array<{
    content: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: string;
}

interface EnhancedResumeAnalysisProps {
  analysis: AnalysisResult;
}

export function EnhancedResumeAnalysis({ analysis }: EnhancedResumeAnalysisProps) {
  const { theme } = useTheme();

  // Safely extract analysis text
  const analysisText = (() => {
    if (!analysis) return 'No analysis data received';
    if (analysis.error) return `Analysis Error: ${analysis.error}`;
    const candidates = analysis.candidates;
    if (!candidates?.length) return 'No analysis content available';
    const parts = candidates[0].content?.parts;
    if (!parts?.length) return 'No analysis content available';
    const text = parts.text;
    if (typeof text !== 'string') return 'No analysis text found';
    return text.trim();
  })();

  const [atsScore, setAtsScore] = useState(0);
  const [overallRating, setOverallRating] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Extract numeric scores
  useEffect(() => {
    let score = 75, rating = 7;
    const atsMatch = analysisText.match(/ATS.*?(\d+)(?:\/100)?/i);
    if (atsMatch) score = Math.min(100, Math.max(0, parseInt(atsMatch[1])));
    const rateMatch = analysisText.match(/Overall Rating.*?(\d+)(?:\/10)?/i);
    if (rateMatch) rating = Math.min(10, Math.max(0, parseInt(rateMatch[1])));
    setAtsScore(score);
    setOverallRating(rating);
    let counter = 0;
    const iv = setInterval(() => {
      counter += 2;
      setAnimatedScore(Math.min(counter, score));
      if (counter >= score) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [analysisText]);

  // Robust section parser
  const parseSection = (text: string, header: string): string[] => {
    if (typeof text !== 'string') return [];
    const regex = new RegExp(`${header}[:\\s]*([^\\n]*(?:\\n\\s*[-•].*)*)`, 'i');
    const match = text.match(regex);
    if (!match || typeof match[1] !== 'string') return [];
    return match[1]
      .split(/[-•]/)
      .map(s => s.trim())
      .filter(s => s)
      .slice(0, 4);
  };

  const strengths = parseSection(analysisText, 'Key Strengths|Strengths');
  const improvements = parseSection(analysisText, 'Critical Issues|Improvements|Areas for');
  const recommendations = parseSection(analysisText, 'Recommendations|Quick Wins');

  const skillsData = [
    { name: 'Technical', current: Math.floor(atsScore / 12), recommended: 10 },
    { name: 'Keywords', current: Math.floor(atsScore / 15), recommended: 9 },
    { name: 'Format', current: Math.floor(atsScore / 11), recommended: 8 },
    { name: 'Experience', current: Math.floor(atsScore / 13), recommended: 10 },
  ];

  const getScoreColor = (s: number) =>
    s >= 80 ? theme.success : s >= 60 ? theme.warning : theme.error;
  const getScoreLabel = (s: number) =>
    s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : 'Needs Work';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: theme.accent,
        padding: 2,
        borderRadius: 20,
        marginTop: 20,
      }}
    >
      <div
        style={{
          background: theme.cardBackground,
          borderRadius: 18,
          padding: 30,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}
        >
          <div
            style={{
              background: theme.accent,
              borderRadius: 12,
              padding: 12,
              marginRight: 16,
            }}
          >
            <Target size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: theme.textPrimary }}>
              🎯 AI-Powered Analysis Results
            </h2>
            <p style={{ margin: '4px 0 0', color: theme.textSecondary }}>
              Professional resume evaluation with ATS optimization
            </p>
          </div>
        </motion.div>

        {/* Score Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 20,
            marginBottom: 30,
          }}
        >
          {/* ATS Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: theme.cardBackground,
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              border: `2px solid ${getScoreColor(atsScore)}`,
            }}
          >
            <div style={{ width: 100, height: 100, margin: '0 auto 16px' }}>
              <CircularProgressbar
                value={animatedScore}
                text={`${animatedScore}`}
                styles={buildStyles({
                  pathColor: getScoreColor(atsScore),
                  textColor: getScoreColor(atsScore),
                  trailColor: theme.border,
                  textSize: '24px',
                })}
              />
            </div>
            <h3 style={{ margin: '0 0 8px', color: theme.textPrimary }}>
              ATS Compatibility
            </h3>
            <p
              style={{
                margin: 0,
                color: getScoreColor(atsScore),
                fontWeight: 'bold',
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
              background: theme.cardBackground,
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              border: `2px solid ${theme.accent}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: i < overallRating ? 1.2 : 0.4,
                    opacity: i < overallRating ? 1 : 0.3,
                  }}
                  transition={{ delay: 0.1 * i, type: 'spring' }}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor:
                      i < overallRating ? theme.accent : theme.border,
                    margin: '0 2px',
                  }}
                />
              ))}
            </div>
            <h3 style={{ margin: '0 0 8px', color: theme.textPrimary }}>
              Overall Rating
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 'bold',
                color: theme.accent,
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
              background: theme.cardBackground,
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              border: `2px solid ${theme.success}`,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Zap size={32} color={theme.success} />
              </motion.div>
            </div>
            <h3 style={{ margin: '0 0 16px', color: theme.textPrimary }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: theme.success,
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                }}
              >
                📄 Generate Cover Letter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'transparent',
                  border: `2px solid ${theme.success}`,
                  color: theme.success,
                  borderRadius: 8,
                  padding: '8px 16px',
                }}
              >
                📊 Download Report
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Insights Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
            marginBottom: 30,
          }}
        >
          {strengths.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                background: theme.success + '20',
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${theme.success}`,
              }}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', color: theme.success }}>
                <CheckCircle size={18} style={{ marginRight: 8 }} /> Key Strengths
              </h4>
              <ul style={{ paddingLeft: 20, color: theme.textPrimary }}>
                {strengths.map((s, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
          {improvements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              style={{
                background: theme.warning + '20',
                borderRadius: 12,
                padding: 20,
                border: `1px solid ${theme.warning}`,
              }}
            >
              <h4 style={{ display: 'flex', alignItems: 'center', color: theme.warning }}>
                <AlertTriangle size={18} style={{ marginRight: 8 }} /> Areas to Improve
              </h4>
              <ul style={{ paddingLeft: 20, color: theme.textPrimary }}>
                {improvements.map((imp, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {imp}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Skills Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            background: theme.cardBackground,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', color: theme.textPrimary }}>
            <TrendingUp size={20} style={{ marginRight: 8 }} /> Skills Gap Analysis
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={theme.textSecondary} />
              <YAxis stroke={theme.textSecondary} />
              <Tooltip />
              <Bar dataKey="current" fill={theme.accent} name="Current Level" />
              <Bar dataKey="recommended" fill={theme.accent} opacity={0.6} name="Target Level" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Full Analysis Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            background: theme.cardBackground,
            borderRadius: 12,
            padding: 24,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', color: theme.textPrimary }}>
            <FileText size={20} style={{ marginRight: 8 }} /> Complete AI Analysis
          </h3>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              color: theme.textPrimary,
              maxHeight: 300,
              overflowY: 'auto',
              background: 'white',
              padding: 16,
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
            }}
          >
            {analysisText}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
