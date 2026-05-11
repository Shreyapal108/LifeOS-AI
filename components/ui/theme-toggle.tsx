'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-10 h-10 rounded-xl glass flex items-center justify-center group transition-all duration-300 hover:scale-105"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1))'
            : 'linear-gradient(135deg, rgba(0, 229, 255, 0.1), rgba(176, 38, 255, 0.1))'
        }}
      />
      
      {/* Icon container */}
      <motion.div
        className="relative z-10"
        initial={{ rotate: 0 }}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-foreground transition-colors duration-300" />
        ) : (
          <Sun className="w-4 h-4 text-foreground transition-colors duration-300" />
        )}
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at center, rgba(14, 165, 233, 0.2), transparent 70%)'
            : 'radial-gradient(circle at center, rgba(0, 229, 255, 0.2), transparent 70%)'
        }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.button>
  )
}

export function ThemeToggleLarge() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-14 h-7 rounded-full bg-muted animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-14 h-7 rounded-full glass flex items-center transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
    >
      {/* Track background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: isDark 
            ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.2), rgba(176, 38, 255, 0.2))'
            : 'linear-gradient(90deg, rgba(14, 165, 233, 0.2), rgba(139, 92, 246, 0.2))'
        }}
      />
      
      {/* Sliding thumb */}
      <motion.div
        className="absolute w-5 h-5 rounded-full glass flex items-center justify-center"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #00e5ff, #b026ff)'
            : 'linear-gradient(135deg, #0ea5e9, #8b5cf6)'
        }}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-white" />
          ) : (
            <Sun className="w-3 h-3 text-white" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}
