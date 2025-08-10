import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: theme.cardBackground,
        border: `2px solid ${theme.border}`,
        borderRadius: '50px',
        padding: '12px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        color: theme.textPrimary,
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      }}
    >
      <motion.div
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? (
          <Moon size={20} color={theme.accent} />
        ) : (
          <Sun size={20} color={theme.accent} />
        )}
      </motion.div>
      
      <span style={{ display: 'none' }}>
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
      
      {/* Toggle Switch */}
      <div style={{
        width: '40px',
        height: '20px',
        background: isDarkMode ? theme.accent : theme.border,
        borderRadius: '10px',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        <motion.div
          animate={{ x: isDarkMode ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: '16px',
            height: '16px',
            background: 'white',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: '2px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>
    </motion.button>
  );
}
