'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Zap, IndianRupee, BarChart3, TrendingUp, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { GlowCard } from '@/components/ui/spotlight-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface StatCard {
  title: string
  value: string | number
  subtitle: string
  icon: React.ReactNode
  color: string
}

const stats: StatCard[] = [
  {
    title: 'Active Goals',
    value: '5',
    subtitle: 'This month',
    icon: <Target className="w-6 h-6" />,
    color: 'primary',
  },
  {
    title: 'Habit Streak',
    value: '12',
    subtitle: 'Days consistent',
    icon: <Zap className="w-6 h-6" />,
    color: 'success',
  },
  {
    title: 'This Month Budget',
    value: '₹450',
    subtitle: 'of ₹1,000',
    icon: <IndianRupee className="w-6 h-6" />,
    color: 'accent',
  },
  {
    title: 'Productivity Score',
    value: '78%',
    subtitle: '+5% from last week',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'warning',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Active Goals', value: '-', subtitle: '...', icon: <Target className="w-6 h-6" />, color: 'primary' },
    { title: 'Habits Done Today', value: '-', subtitle: '...', icon: <Zap className="w-6 h-6" />, color: 'success' },
    { title: 'Monthly Spent', value: '-', subtitle: '...', icon: <IndianRupee className="w-6 h-6" />, color: 'accent' },
    { title: 'Productivity Score', value: '-', subtitle: '...', icon: <BarChart3 className="w-6 h-6" />, color: 'warning' },
  ])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()

    const supabase = createClient()
    
    const channel = supabase.channel('dashboard_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, () => {
        fetchDashboard(false)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchDashboard(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchDashboard = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Active Goals
      const { count: goalsCount } = await supabase
        .from('goals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Today's Habits
      const today = new Date().toISOString().split('T')[0]
      const { count: habitsDoneCount } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('logged_date', today)
        .eq('completed', true)
        
      const { count: totalHabitsCount } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Monthly Expenses
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: expData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)
      
      const totalSpent = (expData || []).reduce((sum, e) => sum + Number(e.amount), 0)

      const prodScore = totalHabitsCount ? Math.round(((habitsDoneCount || 0) / totalHabitsCount) * 100) : 0

      setStats([
        { title: 'Active Goals', value: `${goalsCount || 0}`, subtitle: 'System Objectives', icon: <Target className="w-6 h-6" />, color: 'primary' },
        { title: 'Habits Done Today', value: `${habitsDoneCount || 0}`, subtitle: 'Daily Rituals', icon: <Zap className="w-6 h-6" />, color: 'success' },
        { title: 'Monthly Spent', value: `₹${totalSpent.toLocaleString()}`, subtitle: 'Budget Audit', icon: <IndianRupee className="w-6 h-6" />, color: 'accent' },
        { title: 'Productivity Score', value: `${prodScore}%`, subtitle: 'Efficiency Level', icon: <BarChart3 className="w-6 h-6" />, color: 'warning' },
      ])

      // Recent Activity
      const { data: recentExps } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)
        
      const { data: recentGoals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3)

      const combinedActivity = [
        ...(recentExps || []).map((e: any) => ({ type: 'expense', title: e.description || 'Expense logged', desc: `₹${e.amount} spent`, date: e.date })),
        ...(recentGoals || []).map((g: any) => ({ type: 'goal', title: g.title, desc: 'New objective initialized', date: g.created_at }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)

      setActivities(combinedActivity)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none premium-text">Operational Interface</h1>
        <p className="text-foreground/60 text-base font-medium">Synchronizing biometric and behavioral data streams.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {stats.map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <GlowCard
              customSize
              glowColor={stat.color === 'primary' ? 'cyan' : stat.color === 'success' ? 'green' : stat.color === 'accent' ? 'purple' : 'orange'}
              className="p-6 flex flex-col justify-between min-h-[140px] group transition-all duration-300"
            >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border transition-all duration-500 group-hover:scale-110",
                stat.color === 'primary' ? 'text-primary group-hover:bg-primary/10' :
                stat.color === 'success' ? 'text-success group-hover:bg-success/10' :
                stat.color === 'accent' ? 'text-accent group-hover:bg-accent/10' :
                'text-warning group-hover:bg-warning/10'
              )}>
                {stat.icon}
              </div>
              {stat.title === 'Productivity Score' && (
                <TrendingUp className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-wider">{stat.subtitle}</p>
              </div>
            </div>
            </GlowCard>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground tracking-tight">System Logs</h2>
              <Button variant="ghost" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Audit History</Button>
            </div>
            <GlowCard customSize glowColor="blue" className="p-3">
              {activities.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-medium italic transition-colors duration-300">No recent system anomalies detected</div>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-card/50 transition-all duration-300 rounded-xl group border border-transparent hover:border-border">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center bg-card border border-border transition-all",
                          activity.type === 'expense' ? 'text-accent group-hover:bg-accent/10' : 'text-primary group-hover:bg-primary/10'
                        )}>
                          {activity.type === 'expense' ? <IndianRupee size={18} /> : <Target size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{activity.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{activity.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(activity.date).toLocaleDateString()}</span>
                        <div className="mt-1 flex justify-end">
                          <div className="w-1 h-1 rounded-full bg-border" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </motion.div>

          {/* AI Insights Preview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-bold text-foreground tracking-tight">System Intelligence</h2>
            <GlowCard customSize glowColor="magenta" className="p-8 relative overflow-hidden bg-gradient-to-br from-accent/10 via-transparent to-primary/10 transition-colors duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-20 h-20 text-accent" />
              </div>
              <div className="flex items-start gap-5 relative z-10">
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent shadow-lg shadow-accent/10 transition-colors duration-300">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-1 text-foreground">Productivity Optimization</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 transition-colors duration-300">
                    Based on your recent activity, your productivity has increased by <span className="text-accent font-bold">12%</span> over the past week. Maintain your current meditation streak for continued cognitive enhancement.
                  </p>
                  <Link href="/insights">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 h-9 text-[10px] font-bold uppercase tracking-wider transition-all duration-300">
                      Explore Full Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Command Center</h2>
            <div className="flex flex-col gap-3">
              {[
                { href: '/goals', icon: <Target size={20} />, title: 'Set Objectives', subtitle: 'Goal Management', color: 'cyan' },
                { href: '/habits', icon: <Zap size={20} />, title: 'Log Rituals', subtitle: 'Habit Tracking', color: 'green' },
                { href: '/expenses', icon: <IndianRupee size={20} />, title: 'Audit Finances', subtitle: 'Expense Logging', color: 'purple' },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <GlowCard
                    customSize
                    glowColor={action.color as any}
                    className="p-4 hover:translate-y-[-2px] transition-all duration-300 group flex items-center gap-5 cursor-pointer hover:shadow-[0_20px_40px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${action.color === 'cyan' ? 'bg-primary/10 text-primary group-hover:bg-primary/20' :
                      action.color === 'green' ? 'bg-success/10 text-success group-hover:bg-success/20' :
                        'bg-accent/10 text-accent group-hover:bg-accent/20'
                      }`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-0.5">{action.title}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{action.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground group-hover:translate-x-1 transition-all duration-500" />
                  </GlowCard>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Time Overview */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">System Status</h2>
            <GlowCard customSize glowColor="cyan" className="p-6 flex flex-col gap-6 bg-gradient-to-br from-card/50 to-transparent shadow-2xl transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="status-pulse-cyan" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Neural Link Sync</span>
                </div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_10%,transparent)] transition-colors duration-300">Active</span>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Core Latency</span>
                  <span className="text-xs font-bold text-foreground">12ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Last Analysis</span>
                  <span suppressHydrationWarning className="text-xs font-bold text-foreground">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">System Integrity</span>
                    <span className="text-[9px] font-bold text-success uppercase tracking-widest">Optimal</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden transition-colors duration-300">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98%' }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary to-accent transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
