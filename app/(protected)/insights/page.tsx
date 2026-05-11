'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Brain,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Insight {
  id: string
  type: 'recommendation' | 'burnout_alert' | 'prediction'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  actionItems: string[]
  dismissed: boolean
}

const sampleInsights: Insight[] = [
  {
    id: '1',
    type: 'burnout_alert',
    title: 'Potential Burnout Detected',
    content:
      'Your productivity has decreased by 20% over the past week, and your sleep pattern shows signs of stress. Consider taking a break or adjusting your goals.',
    priority: 'high',
    actionItems: [
      'Take a 30-minute walk',
      'Practice meditation',
      'Review and adjust goals',
    ],
    dismissed: false,
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Optimize Your Morning Routine',
    content:
      'Analysis shows your productivity peaks at 9-10 AM. Scheduling important tasks during this window could increase your completion rate by 30%.',
    priority: 'medium',
    actionItems: [
      'Move coding tasks to morning',
      'Schedule meetings in afternoon',
      'Adjust wake-up time',
    ],
    dismissed: false,
  },
  {
    id: '3',
    type: 'prediction',
    title: 'Goal Achievement Prediction',
    content:
      'Based on current progress rate, you have a 85% chance of completing your "Learn TypeScript Deeply" goal by the deadline.',
    priority: 'low',
    actionItems: [
      'Maintain current pace',
      'Weekly review sessions',
      'Track milestone completion',
    ],
    dismissed: false,
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Habit Synergy Opportunity',
    content:
      'Your meditation habit correlates strongly with exercise performance. Consider scheduling them together to boost overall consistency.',
    priority: 'medium',
    actionItems: [
      'Schedule meditation before workout',
      'Track combined habit performance',
      'Set reminder for both',
    ],
    dismissed: false,
  },
]

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

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return <AlertTriangle className="w-6 h-6" />
    case 'prediction':
      return <TrendingUp className="w-6 h-6" />
    default:
      return <Lightbulb className="w-6 h-6" />
  }
}

const getInsightBorderColor = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return 'border-red-500/30 bg-red-500/5'
    case 'prediction':
      return 'border-green-500/30 bg-green-500/5'
    default:
      return 'border-cyan-500/20'
  }
}

const getInsightIconColor = (type: string) => {
  switch (type) {
    case 'burnout_alert':
      return 'text-red-400'
    case 'prediction':
      return 'text-green-400'
    default:
      return 'text-cyan-400'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-400 bg-red-500/10 border-red-500/30'
    case 'medium':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    default:
      return 'text-green-400 bg-green-500/10 border-green-500/30'
  }
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAndGenerateInsights()
  }, [])

  const fetchAndGenerateInsights = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch existing insights
      const { data: existingInsights, error: fetchErr } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      const existingTitles = new Set((existingInsights || []).map(i => i.title))
      const newInsightsToInsert = []

      // 1. Goal consistency / load
      const { count: goalsCount } = await supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      if ((goalsCount || 0) > 5 && !existingTitles.has('High Goal Load')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'burnout_alert',
          title: 'High Goal Load',
          content: 'You have more than 5 active goals. This might lead to decreased focus. Consider pausing some goals to maintain high consistency.',
          priority: 'high',
          actionable_items: ['Review active goals', 'Pause 1-2 low priority goals'],
        })
      }

      // 2. Expense Budget Alert
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: expData } = await supabase.from('expenses').select('amount').eq('user_id', user.id).gte('date', startOfMonth)
      const { data: catData } = await supabase.from('expense_categories').select('monthly_budget').eq('user_id', user.id)

      const totalSpent = (expData || []).reduce((sum, e) => sum + Number(e.amount), 0)
      const totalBudget = (catData || []).reduce((sum, c) => sum + Number(c.monthly_budget || 0), 0)

      if (totalBudget > 0 && totalSpent > totalBudget * 0.8 && !existingTitles.has('Approaching Budget Limit')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Approaching Budget Limit',
          content: `You have spent ₹${totalSpent.toFixed(2)} which is over 80% of your total budget. Track your remaining expenses carefully.`,
          priority: 'medium',
          actionable_items: ['Review recent expenses', 'Hold off on non-essential purchases'],
        })
      }

      // 3. Habit consistency
      const today = new Date().toISOString().split('T')[0]
      const { count: habitsDoneCount } = await supabase.from('habit_logs').select('*', { count: 'exact', head: true }).eq('logged_date', today).eq('completed', true)
      const { count: totalHabitsCount } = await supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', user.id)

      if (totalHabitsCount && totalHabitsCount > 0) {
        const completionRate = (habitsDoneCount || 0) / totalHabitsCount
        if (completionRate < 0.5 && !existingTitles.has('Low Habit Completion')) {
          newInsightsToInsert.push({
            user_id: user.id,
            insight_type: 'prediction',
            title: 'Low Habit Completion',
            content: 'Your habit completion rate is below 50% today. Try knocking out a quick habit to build momentum.',
            priority: 'low',
            actionable_items: ['Complete a 5-minute habit', 'Review habit difficulty'],
          })
        }
      }

      // 4. Study deadline alerts
      const { data: studySessions } = await supabase.from('study_sessions').select('deadline').eq('user_id', user.id).not('deadline', 'is', null)
      const upcomingDeadlines = (studySessions || []).filter((s: any) => {
        if (!s.deadline) return false
        const deadlineDate = new Date(s.deadline)
        const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilDeadline <= 3 && daysUntilDeadline >= 0
      })
      if (upcomingDeadlines.length > 0 && !existingTitles.has('Study Deadline Approaching')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'burnout_alert',
          title: 'Study Deadline Approaching',
          content: `You have ${upcomingDeadlines.length} study session(s) with deadlines in the next 3 days. Prioritize these to stay on track.`,
          priority: 'high',
          actionable_items: ['Review study schedule', 'Focus on upcoming deadlines', 'Adjust study plan if needed'],
        })
      }

      // 5. Low study consistency warning
      const { data: recentStudySessions } = await supabase.from('study_sessions').select('date, duration_minutes').eq('user_id', user.id).gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      const studyDays = new Set((recentStudySessions || []).map((s: any) => s.date))
      if (studyDays.size < 3 && !existingTitles.has('Low Study Consistency')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Low Study Consistency',
          content: 'You have studied on fewer than 3 days in the past week. Consistent study habits improve retention and progress.',
          priority: 'medium',
          actionable_items: ['Create a daily study schedule', 'Set study reminders', 'Start with short study sessions'],
        })
      }

      // 6. Poor sleep / burnout warning
      const { data: healthLogs } = await supabase.from('health_logs').select('sleep_hours, mood').eq('user_id', user.id).gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).order('date', { ascending: false }).limit(7)
      if (healthLogs && healthLogs.length >= 3) {
        const avgSleep = healthLogs.reduce((sum: number, h: any) => sum + (h.sleep_hours || 0), 0) / healthLogs.length
        const lowMoodCount = healthLogs.filter((h: any) => h.mood === 'tired' || h.mood === 'stressed').length
        if (avgSleep < 6 || lowMoodCount >= 3) {
          if (!existingTitles.has('Sleep and Mood Alert')) {
            newInsightsToInsert.push({
              user_id: user.id,
              insight_type: 'burnout_alert',
              title: 'Sleep and Mood Alert',
              content: avgSleep < 6 
                ? `Your average sleep over the past week is ${avgSleep.toFixed(1)} hours. Consider getting more rest to prevent burnout.`
                : 'You have reported feeling tired or stressed frequently. Consider taking a break and prioritizing self-care.',
              priority: 'high',
              actionable_items: ['Aim for 7-8 hours of sleep', 'Take short breaks during work', 'Practice relaxation techniques'],
            })
          }
        }
      }

      // 7. Low water intake reminder
      const { data: todayHealthLog } = await supabase.from('health_logs').select('water_intake_liters').eq('user_id', user.id).eq('date', today).single()
      if (todayHealthLog && todayHealthLog.water_intake_liters < 1.5 && !existingTitles.has('Low Water Intake')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Low Water Intake',
          content: `You have only consumed ${todayHealthLog.water_intake_liters}L of water today. Aim for at least 2L for optimal health and cognitive function.`,
          priority: 'low',
          actionable_items: ['Drink a glass of water now', 'Set water intake reminders', 'Track water consumption'],
        })
      }

      // 8. Career goal progress reminder
      const { data: careerGoals } = await supabase.from('career_goals').select('progress, target_date').eq('user_id', user.id)
      const stalledCareerGoals = (careerGoals || []).filter((g: any) => {
        if (!g.target_date) return false
        const daysUntilTarget = Math.ceil((new Date(g.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return (g.progress || 0) < 50 && daysUntilTarget <= 30 && daysUntilTarget >= 0
      })
      if (stalledCareerGoals.length > 0 && !existingTitles.has('Career Goal Progress Alert')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Career Goal Progress Alert',
          content: `You have ${stalledCareerGoals.length} career goal(s) with less than 50% progress and deadlines within 30 days. Take action to stay on track.`,
          priority: 'medium',
          actionable_items: ['Review career goals', 'Break down goals into smaller tasks', 'Adjust timeline if needed'],
        })
      }

      // 9. Job application follow-up reminder
      const { data: jobApplications } = await supabase.from('job_applications').select('applied_date, status').eq('user_id', user.id).in('status', ['applied', 'under_review'])
      const pendingFollowUp = (jobApplications || []).filter((j: any) => {
        if (!j.applied_date) return false
        const daysSinceApplied = Math.floor((new Date().getTime() - new Date(j.applied_date).getTime()) / (1000 * 60 * 60 * 24))
        return daysSinceApplied >= 7 && daysSinceApplied <= 14
      })
      if (pendingFollowUp.length > 0 && !existingTitles.has('Job Application Follow-up')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Job Application Follow-up',
          content: `You have ${pendingFollowUp.length} job application(s) that haven't been updated in 7-14 days. Consider following up with the recruiters.`,
          priority: 'medium',
          actionable_items: ['Send follow-up emails', 'Check application status', 'Update application tracker'],
        })
      }

      // 10. Skill progress recommendation
      const { data: skillRoadmap } = await supabase.from('skill_roadmap').select('progress').eq('user_id', user.id)
      const lowProgressSkills = (skillRoadmap || []).filter((s: any) => (s.progress || 0) < 30)
      if (lowProgressSkills.length >= 2 && !existingTitles.has('Skill Development Focus')) {
        newInsightsToInsert.push({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Skill Development Focus',
          content: `You have ${lowProgressSkills.length} skill(s) with less than 30% progress. Focus on one skill at a time for better results.`,
          priority: 'low',
          actionable_items: ['Prioritize one key skill', 'Create a learning plan', 'Set daily practice goals'],
        })
      }

      // Insert new insights
      if (newInsightsToInsert.length > 0) {
        await supabase.from('ai_insights').insert(newInsightsToInsert)
      }

      // Fetch all insights again to get the IDs of the newly inserted ones
      const { data: finalInsights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const formatted = (finalInsights || []).map((i: any) => ({
        id: i.id,
        type: i.insight_type,
        title: i.title,
        content: i.content,
        priority: i.priority,
        actionItems: i.actionable_items || [],
        dismissed: i.dismissed
      }))

      setInsights(formatted)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const activeInsights = insights.filter((i) => !i.dismissed)

  const dismissInsight = async (id: string) => {
    setInsights(
      insights.map((i) => (i.id === id ? { ...i, dismissed: true } : i))
    )
    try {
      const supabase = createClient()
      await supabase.from('ai_insights').update({ dismissed: true }).eq('id', id)
    } catch (err) {
      console.error(err)
    }
  }

  const restoreInsight = async (id: string) => {
    setInsights(
      insights.map((i) => (i.id === id ? { ...i, dismissed: false } : i))
    )
    try {
      const supabase = createClient()
      await supabase.from('ai_insights').update({ dismissed: false }).eq('id', id)
    } catch (err) {
      console.error(err)
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Insights</h1>
          <p className="text-gray-400 text-sm mt-1">Personalized recommendations and alerts</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-3xl font-bold text-cyan-400">{activeInsights.length}</p>
          <p className="text-xs text-gray-500">Active insights</p>
        </div>
      </motion.div>

    {error && (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">{error}</div>
    )}

    {loading ? (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    ) : (
      <div className="space-y-10">
        {/* Active Insights */}
        {activeInsights.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {activeInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  variants={itemVariants}
                  className={`glass rounded-xl border border-cyan-500/20 p-6 group transition-all duration-300 ${insight.type === 'burnout_alert' ? 'border-red-500/20' : ''
                    }`}
                >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.type === 'burnout_alert'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                          }`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-semibold text-white">{insight.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityColor(insight.priority)}`}>
                              {insight.priority}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{insight.type.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <p className="text-gray-300 leading-relaxed text-sm mb-4">
                        {insight.content}
                      </p>

                      {insight.actionItems.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">Action items</p>
                          <div className="space-y-2">
                            {insight.actionItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-gray-300 text-xs">
                                <Zap size={12} className="text-cyan-400" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                    <div className="lg:w-40 flex flex-col gap-2 justify-center">
                      <Button
                        onClick={() => {
                          if (insight.title.includes('Habit')) {
                            router.push('/habits')
                          } else if (insight.title.includes('Budget')) {
                            router.push('/expenses')
                          } else if (insight.title.includes('Goal')) {
                            router.push('/goals')
                          } else {
                            router.push('/dashboard')
                          }
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white w-full"
                      >
                        Take Action
                        <ArrowRight size={14} className="ml-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => dismissInsight(insight.id)}
                        className="border border-cyan-500/30 hover:bg-cyan-500/10 text-white w-full"
                      >
                        Dismiss
                      </Button>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {activeInsights.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="glass rounded-xl border border-cyan-500/20 p-12 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-lg bg-cyan-500/20 flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">No active insights</h3>
              <p className="text-gray-400 mb-6 max-w-md">No recommendations or alerts at this time.</p>
            </motion.div>
        )}

        {/* Dismissed Insights */}
        {insights.some((i) => i.dismissed) && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Dismissed</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights
                  .filter((i) => i.dismissed)
                  .map((insight) => (
                    <motion.div
                      key={insight.id}
                      variants={itemVariants}
                      className="glass rounded-xl border border-gray-700 p-4 flex items-center justify-between opacity-50 hover:opacity-100 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 ${getInsightIconColor(insight.type)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{insight.title}</p>
                          <p className="text-xs text-gray-500">Dismissed</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => restoreInsight(insight.id)}
                        className="border border-cyan-500/30 hover:bg-cyan-500/10 text-white h-8 px-3 text-xs"
                      >
                        Restore
                      </Button>
                    </motion.div>
                  ))}
              </div>
            </div>
        )}

        {/* AI Info Card */}
          <motion.div variants={itemVariants} className="glass rounded-xl border border-cyan-500/20 p-6">
            <h2 className="text-lg font-bold text-white mb-6">How AI Insights Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Brain size={20} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase">Behavioral Engine</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Analyzes your habits and goals to identify patterns.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <TrendingUp size={20} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase">Predictive Modeling</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Forecasts burnout risks and goal completion probabilities.</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                  <Lightbulb size={20} />
                </div>
                <h4 className="text-xs font-bold text-white uppercase">Optimization</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Generates actionable recommendations to improve efficiency.</p>
              </div>
            </div>
          </motion.div>
      </div>
    )}
    </motion.div>
  )
}
