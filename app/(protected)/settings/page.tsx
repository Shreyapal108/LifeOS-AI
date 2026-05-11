'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Bell, Moon, Shield, Database, LogOut } from 'lucide-react'
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

interface SettingToggle {
  id: string
  label: string
  description: string
  enabled: boolean
  icon: React.ReactNode
}

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: 'darkMode',
      label: 'Dark Mode',
      description: 'Use dark theme for the interface',
      enabled: mounted ? theme === 'dark' : true,
      icon: <Moon className="w-5 h-5" />,
    },
  ])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setSettings(prev => prev.map(s => 
        s.id === 'darkMode' ? { ...s, enabled: theme === 'dark' } : s
      ))
    }
  }, [theme, mounted])

  const toggleSetting = (id: string) => {
    if (id === 'darkMode') {
      // Toggle the actual theme
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      setTheme(newTheme)
    } else {
      // Toggle other settings normally
      setSettings(
        settings.map((s) =>
          s.id === id ? { ...s, enabled: !s.enabled } : s
        )
      )
    }
  }

  const handleExport = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Authentication required to export data')
        return
      }

      // Fetch all user data
      const [goalsData, healthData, expensesData] = await Promise.all([
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('health_logs').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        user_id: user.id,
        email: user.email,
        export_date: new Date().toISOString(),
        data: {
          goals: goalsData.data || [],
          health_logs: healthData.data || [],
          expenses: expensesData.data || []
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
        <h1 className="text-2xl font-bold text-foreground tracking-tight transition-colors duration-300">Settings</h1>
        <p className="text-muted-foreground text-lg transition-colors duration-300">System configuration and user preferences</p>
      </motion.div>

      {/* Preferences Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight transition-colors duration-300">Core Preferences</h2>
        <div className="grid grid-cols-1 gap-4">
          {settings.map((setting) => (
            <motion.div
              key={setting.id}
              variants={itemVariants}
              className="glass p-6 flex items-center justify-between group transition-all duration-500 hover:border-primary/20 transition-colors duration-300"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all duration-500">
                  {setting.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1 transition-colors duration-300">{setting.label}</h3>
                  <p className="text-xs text-muted-foreground font-medium transition-colors duration-300">{setting.description}</p>
                </div>
              </div>

              <button
                onClick={() => toggleSetting(setting.id)}
                className={`w-14 h-7 rounded-full transition-all duration-500 p-1 flex items-center ${
                  setting.enabled ? 'bg-primary shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_40%,transparent)]' : 'bg-muted'
                }`}
              >
                <motion.div
                  animate={{ x: setting.enabled ? 28 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 rounded-full bg-foreground shadow-lg transition-colors duration-300"
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data & Privacy Section */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight transition-colors duration-300">Intelligence & Security</h2>
        <div className="glass p-8 space-y-8 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border transition-colors duration-300">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent transition-colors duration-300">
                <Database size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1 transition-colors duration-300">Knowledge Export</h3>
                <p className="text-xs text-muted-foreground font-medium transition-colors duration-300">Generate a comprehensive audit of all stored behavioral data</p>
              </div>
            </div>
            <Button onClick={handleExport} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-8 text-[10px] font-bold uppercase tracking-widest transition-all duration-300">
              Export JSON
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success transition-colors duration-300">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1 transition-colors duration-300">Privacy Protocol</h3>
                <p className="text-xs text-muted-foreground font-medium transition-colors duration-300">Review our neural data handling and protection standards</p>
              </div>
            </div>
            <Button onClick={handleReadPolicy} variant="ghost" className="h-10 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors duration-300">
              Read Policy
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-xl font-bold text-foreground tracking-tight transition-colors duration-300">Decommissioning</h2>
        <div className="glass p-8 border-destructive/10 bg-destructive/5 space-y-6 transition-colors duration-300">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium leading-relaxed transition-colors duration-300">
            Warning: The following actions will permanently terminate your account and erase all synchronized neural patterns. This procedure is irreversible.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={handleLogout} className="h-12 bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all duration-300">
              <LogOut size={16} />
              Terminate Session
            </Button>
            <Button onClick={handlePurge} className="h-12 bg-transparent hover:bg-destructive/10 border border-destructive/10 text-destructive/60 hover:text-destructive text-[10px] font-bold uppercase tracking-widest transition-all duration-300">
              Purge All Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div variants={itemVariants} className="glass p-8 text-center bg-gradient-to-br from-card/50 to-transparent transition-colors duration-300">
        <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest mb-4 transition-colors duration-300">
          Stable Build v1.0.42
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 transition-colors duration-300">LifeOS AI Operational</h3>
        <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed transition-colors duration-300">
          Powered by Next.js, Supabase real-time core, and OpenAI neural processing architectures.
        </p>
      </motion.div>
    </motion.div>
  )
}
