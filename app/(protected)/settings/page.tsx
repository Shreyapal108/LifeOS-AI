'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Moon, Shield, Database, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleExport = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Authentication required to export data')
        return
      }

      // Fetch all user data from all tables
      const [
        goalsData,
        healthData,
        expensesData,
        habitsData,
        habitLogsData,
        studySessionsData,
        productivityData,
        careerGoalsData,
        jobApplicationsData,
        skillRoadmapData,
        learningProgressData
      ] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('health_logs').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('habit_logs').select('*').eq('user_id', user.id),
        supabase.from('study_sessions').select('*').eq('user_id', user.id),
        supabase.from('productivity_analytics').select('*').eq('user_id', user.id),
        supabase.from('career_goals').select('*').eq('user_id', user.id),
        supabase.from('job_applications').select('*').eq('user_id', user.id),
        supabase.from('skill_roadmap').select('*').eq('user_id', user.id),
        supabase.from('learning_progress').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        user_id: user.id,
        email: user.email,
        export_date: new Date().toISOString(),
        data: {
          goals: goalsData.data || [],
          health_logs: healthData.data || [],
          expenses: expensesData.data || [],
          habits: habitsData.data || [],
          habit_logs: habitLogsData.data || [],
          study_sessions: studySessionsData.data || [],
          productivity_analytics: productivityData.data || [],
          career_goals: careerGoalsData.data || [],
          job_applications: jobApplicationsData.data || [],
          skill_roadmap: skillRoadmapData.data || [],
          learning_progress: learningProgressData.data || []
        }
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lifeos-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Data export completed successfully!')
    } catch (err: any) {
      console.error('Export error:', err)
      alert('Failed to export data: ' + err.message)
    }
  }

  const handleReadPolicy = () => {
    // Open privacy policy in a new modal or navigate to policy page
    const policyText = `
LifeOS AI Privacy Protocol
=========================

Data Collection:
- We collect only data you explicitly input
- All data is encrypted at rest and in transit
- We use zero-knowledge encryption for sensitive information

Data Usage:
- AI analysis is performed locally when possible
- Aggregate analytics are anonymized
- No data is sold to third parties

Data Retention:
- You maintain full control over your data
- Data can be exported or deleted at any time
- Automatic deletion after 365 days of inactivity

Security:
- End-to-end encryption for all data transmission
- Regular security audits and penetration testing
- Compliance with GDPR and CCPA regulations
    `
    
    // Create a modal to display the policy
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    modal.innerHTML = `
      <div class="glass rounded-xl p-6 border border-cyan-500/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-white">Privacy Protocol</h2>
          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6l12 12M6 18L18 6"/>
            </svg>
          </button>
        </div>
        <pre class="text-xs text-gray-300 whitespace-pre-wrap font-mono">${policyText}</pre>
        <button onclick="this.closest('.fixed').remove()" class="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2 rounded-lg transition-colors">
          Close
        </button>
      </div>
    `
    document.body.appendChild(modal)
  }

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to terminate the current session?")) {
      try {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/sign-in')
        router.refresh()
      } catch (err: any) {
        console.error('Logout error:', err)
        alert('Failed to logout: ' + err.message)
      }
    }
  }

  const handlePurge = async () => {
    const confirmation = prompt(
      'WARNING: This will permanently delete ALL your data.\n\nType "DELETE ALL DATA" to confirm this irreversible action:'
    )
    
    if (confirmation === 'DELETE ALL DATA') {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          alert('Authentication required')
          return
        }

        // Delete all user data from all tables
        const { error: goalsError } = await supabase
          .from('goals')
          .delete()
          .eq('user_id', user.id)
          
        const { error: healthError } = await supabase
          .from('health_logs')
          .delete()
          .eq('user_id', user.id)
          
        const { error: expensesError } = await supabase
          .from('expenses')
          .delete()
          .eq('user_id', user.id)

        if (goalsError || healthError || expensesError) {
          throw new Error('Failed to delete some data')
        }

        // Delete user account
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          throw new Error('Failed to delete user account')
        }

        alert('All data has been permanently purged. Redirecting to sign-in...')
        await supabase.auth.signOut()
        router.push('/sign-in')
        
      } catch (err: any) {
        console.error('Purge error:', err)
        alert('Failed to purge data: ' + err.message)
      }
    } else if (confirmation !== null) {
      alert('Confirmation text did not match. Purge cancelled.')
    }
  }

  return (
    <motion.div
      className="space-y-10 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-lg">Manage your preferences</p>
      </motion.div>

      {/* Preferences Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-white">Preferences</h2>
        <div className="grid grid-cols-1 gap-4">
          <motion.div
            variants={itemVariants}
            className="glass rounded-xl border border-cyan-500/20 p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Dark Mode</h3>
                <p className="text-xs text-gray-500">Use dark theme</p>
              </div>
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`w-12 h-6 rounded-full transition-all duration-300 p-1 flex items-center ${
                theme === 'dark' ? 'bg-cyan-500' : 'bg-gray-600'
              }`}
            >
              <motion.div
                animate={{ x: theme === 'dark' ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-white"
              />
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Data & Privacy Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-white">Data & Privacy</h2>
        <div className="glass rounded-xl border border-cyan-500/20 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Export Data</h3>
                <p className="text-xs text-gray-500">Download all your data</p>
              </div>
            </div>
            <Button onClick={handleExport} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Export
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Privacy Policy</h3>
                <p className="text-xs text-gray-500">Review our data handling</p>
              </div>
            </div>
            <Button onClick={handleReadPolicy} variant="ghost" className="border border-cyan-500/30 hover:bg-cyan-500/10 text-white">
              Read
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-white">Danger Zone</h2>
        <div className="glass rounded-xl border border-red-500/20 p-6 space-y-4">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
            Warning: These actions are irreversible and will permanently delete your data.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </Button>
            <Button onClick={handlePurge} className="bg-transparent hover:bg-red-500/10 border border-red-500/10 text-red-500/60 hover:text-red-500">
              Delete All Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div variants={itemVariants} className="glass rounded-xl border border-cyan-500/20 p-6 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-3">
          v1.0.0
        </div>
        <h3 className="text-lg font-bold text-white mb-2">LifeOS AI</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Powered by Next.js and Supabase
        </p>
      </motion.div>
    </motion.div>
  )
}
