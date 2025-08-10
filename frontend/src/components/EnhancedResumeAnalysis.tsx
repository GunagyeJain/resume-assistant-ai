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

  // Safely extract the raw analysis text
  const analysisText = (() => {
    if (!analysis) return 'No analysis data received';
    if (analysis.error) return `Analysis Error: ${analysis.error}`;
    const parts = analysis.candidates?.[0]?.content?.parts;
    const raw = parts && parts.length > 0 ? parts[0].text : undefined;
    if (typeof raw !== 'string') return 'No analysis text found';
    return raw.trim();
  })();

  // Numeric scores
  const atsScore = parseInt(analysisText.match(/ATS.*?(\d+)(?:\/100)?/i)?.[1] || '0', 10);
  const overallRating = parseInt(analysisText.match(/Overall Rating.*?(\d+)(?:\/10)?/i)?.[1] || '0', 10);

  // Animate ATS score
  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    let counter = 0;
    const interval = setInterval(() => {
      counter += 2;
      setAnimatedScore(Math.min(counter, atsScore));
      if (counter >= atsScore) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [atsScore]);

  // Helper to parse bullet lists under a given section header
  const parseSection = (header: string): string[] => {
    const regex = new RegExp(`${header}[:\\s]*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
    const match = analysisText.match(regex);
    if (!match || typeof match[1] !== 'string') return [];
    return match[1]
      .split(/[-•]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  };

  const strengths = parseSection('Key Strengths');
  const issues = parseSection('Critical Issues');
  const recommendations = parseSection('Recommendations');

  // Skills chart data (example: found vs. missing)
  const skillsFound = parseSection('Technical Skills Found');
  const missingKeywords = parseSection('Missing Industry Keywords');
  const skillsData = [
    { name: 'Found', value: skillsFound.length },
    { name: 'Missing', value: missingKeywords.length },
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
      <div style={{ background: theme.cardBackground, borderRadius: 18, padding: 30 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
          <div style={{
            background: theme.accent, borderRadius: 12, padding: 12, marginRight: 16
          }}>
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

        {/* Scores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 30,
        }}>
          {/* ATS Score */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: theme.cardBackground, borderRadius: 16, padding: 24,
              textAlign: 'center', border: `2px solid ${getScoreColor(atsScore)}`
            }}>
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
            <h3 style={{ margin: '0 0 8px', color: theme.textPrimary }}>ATS Compatibility</h3>
            <p style={{ margin: 0, color: getScoreColor(atsScore), fontWeight: 'bold' }}>
              {getScoreLabel(atsScore)}
            </p>
          </motion.div>

          {/* Overall Rating */}
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              background: theme.cardBackground, borderRadius: 16, padding: 24,
              textAlign: 'center', border: `2px solid ${theme.accent}`
            }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} style={{
                  width: 12, height: 12, borderRadius: '50%',
                  background: i < overallRating ? theme.accent : theme.border,
                  margin: '0 2px',
                }} />
              ))}
            </div>
            <h3 style={{ margin: '0 0 8px', color: theme.textPrimary }}>Overall Rating</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: theme.accent }}>
              {overallRating}/10
            </p>
          </motion.div>
        </div>

        {/* Sections */}
        {!!strengths.length && (
          <Section title="Key Strengths" icon={<CheckCircle color={theme.success} />} items={strengths} theme={theme} />
        )}
        {!!issues.length && (
          <Section title="Critical Issues" icon={<AlertTriangle color={theme.warning} />} items={issues} theme={theme} />
        )}
        {!!recommendations.length && (
          <Section title="Recommendations" icon={<Zap color={theme.accent} />} items={recommendations} theme={theme} />
        )}

        {/* Skills Chart */}
        <div style={{
          background: theme.cardBackground, padding: 24, borderRadius: 16,
          border: `1px solid ${theme.border}`, marginBottom: 30
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', color: theme.textPrimary }}>
            <TrendingUp color={theme.accent} style={{ marginRight: 8 }} /> Skills Gap Analysis
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={skillsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={theme.textSecondary} />
              <YAxis stroke={theme.textSecondary} />
              <Tooltip />
              <Bar dataKey="value" fill={theme.accent} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full Text */}
        <div style={{
          background: theme.cardBackground, padding: 24, borderRadius: 16,
          border: `1px solid ${theme.border}`
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', color: theme.textPrimary }}>
            <FileText color={theme.accent} style={{ marginRight: 8 }} /> Complete AI Analysis
          </h3>
          <pre style={{
            whiteSpace: 'pre-wrap', color: theme.textPrimary
          }}>
            {analysisText}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

// Reusable Section component
function Section({ title, icon, items, theme }: { title: string; icon: React.ReactNode; items: string[]; theme: any }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ display: 'flex', alignItems: 'center', color: theme.textPrimary }}>
        {icon} <span style={{ marginLeft: 8 }}>{title}</span>
      </h3>
      <ul style={{ paddingLeft: 20, color: theme.textPrimary }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 8 }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
