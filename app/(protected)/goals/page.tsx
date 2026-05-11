'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, ChevronRight, Calendar, Flag, Trash2, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Goal {
  id: string
  title: string
  description: string
  type: 'yearly' | 'monthly' | 'weekly'
  progress: number
  priority: 'low' | 'medium' | 'high'
  startDate: string
  endDate: string
  status: 'active' | 'completed' | 'failed'
}

const sampleGoals: Goal[] = [
  {
    id: '1',
    title: 'Learn TypeScript Deeply',
    description: 'Master advanced TypeScript concepts and patterns',
    type: 'yearly',
    progress: 65,
    priority: 'high',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
  },
  {
    id: '2',
    title: 'Complete Project X',
    description: 'Finish the main product launch',
    type: 'monthly',
    progress: 45,
    priority: 'high',
    startDate: '2024-05-01',
    endDate: '2024-05-31',
    status: 'active',
  },
  {
    id: '3',
    title: 'Weekly Exercise Routine',
    description: '5 workouts per week',
    type: 'weekly',
    progress: 80,
    priority: 'medium',
    startDate: '2024-05-06',
    endDate: '2024-05-12',
    status: 'active',
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'yearly':
      return 'from-cyan-500/20 to-cyan-600/20'
    case 'monthly':
      return 'from-magenta-500/20 to-magenta-600/20'
    default:
      return 'from-green-500/20 to-green-600/20'
  }
}

export default function GoalsPage() {
  const [goalsData, setGoalsData] = useState<Goal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'monthly',
    priority: 'medium',
    endDate: ''
  })

  useEffect(() => {
    fetchGoals()

    const supabase = createClient()
    const channel = supabase
      .channel('goals_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        fetchGoals(false)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchGoals = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const formattedGoals = (goals || []).map((g: any) => ({
        id: g.id,
        title: g.title,
        description: g.description || '',
        type: g.type,
        progress: g.progress || 0,
        priority: g.priority,
        startDate: g.start_date || g.created_at,
        endDate: g.end_date,
        status: g.status,
      }))
      setGoalsData(formattedGoals)
    } catch (err: any) {
      console.error('Goals sync error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          description: newGoal.description,
          type: newGoal.type,
          priority: newGoal.priority,
          end_date: newGoal.endDate || new Date().toISOString().split('T')[0],
          status: 'active'
        })

      if (error) throw error
      
      setShowModal(false)
      setNewGoal({ title: '', description: '', type: 'monthly', priority: 'medium', endDate: '' })
      fetchGoals()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteGoal = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const supabase = createClient()
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
      setGoalsData(goalsData.filter(g => g.id !== id))
    } catch (err: any) {
      alert(err.message)
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 text-sm">Track your objectives and progress</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus size={16} className="mr-2" />
          Add Goal
        </Button>
      </motion.div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {goalsData.map((goal) => (
            <motion.div
              key={goal.id}
              variants={itemVariants}
              className="glass rounded-xl p-6 border border-cyan-500/20"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${goal.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          goal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                          {goal.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {goal.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400"
                    onClick={(e) => handleDeleteGoal(goal.id, e)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {goal.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Progress</span>
                    <span className="text-xs font-bold text-cyan-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
                  <span>{new Date(goal.startDate).toLocaleDateString()}</span>
                  <ArrowRight size={12} className="text-gray-600" />
                  <span>{new Date(goal.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-xl p-6 border border-cyan-500/20 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4 text-white">Add Goal</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <input
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full bg-[rgba(26,26,46,0.8)] border border-cyan-500/30 rounded p-2 text-white"
                    placeholder="E.g., Complete project"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full bg-[rgba(26,26,46,0.8)] border border-cyan-500/30 rounded p-2 text-white h-20 resize-none"
                    placeholder="Describe your goal..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={newGoal.type}
                      onChange={e => setNewGoal({ ...newGoal, type: e.target.value })}
                      className="w-full bg-[rgba(26,26,46,0.8)] border border-cyan-500/30 rounded p-2 text-white"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Priority</label>
                    <select
                      value={newGoal.priority}
                      onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
                      className="w-full bg-[rgba(26,26,46,0.8)] border border-cyan-500/30 rounded p-2 text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newGoal.endDate}
                    onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="w-full bg-[rgba(26,26,46,0.8)] border border-cyan-500/30 rounded p-2 text-white"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                    className="flex-1 border border-cyan-500/30 hover:bg-cyan-500/10 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Add Goal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
