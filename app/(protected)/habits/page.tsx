'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Zap, CheckCircle2, Circle, Flame, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Habit {
  id: string
  name: string
  description: string
  frequency: 'daily' | 'weekly'
  category: string
  streak: number
  completedToday: boolean
  color: string
}

const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Morning Meditation',
    description: '20 minutes of mindfulness',
    frequency: 'daily',
    category: 'Health',
    streak: 12,
    completedToday: true,
    color: '#00d4ff',
  },
  {
    id: '2',
    name: 'Read 30 minutes',
    description: 'Fiction or non-fiction',
    frequency: 'daily',
    category: 'Learning',
    streak: 8,
    completedToday: false,
    color: '#ff00ff',
  },
  {
    id: '3',
    name: 'Gym Workout',
    description: 'Strength training',
    frequency: 'weekly',
    category: 'Fitness',
    streak: 4,
    completedToday: false,
    color: '#00ff88',
  },
  {
    id: '4',
    name: 'Journaling',
    description: 'Reflect on the day',
    frequency: 'daily',
    category: 'Mental',
    streak: 5,
    completedToday: true,
    color: '#ffaa00',
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

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Health: 'text-green-400 bg-green-500/10',
    Learning: 'text-cyan-400 bg-cyan-500/10',
    Fitness: 'text-magenta-400 bg-magenta-500/10',
    Mental: 'text-purple-400 bg-purple-500/10',
  }
  return colors[category] || 'text-gray-400 bg-gray-500/10'
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'Health',
  })

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)

      if (habitsError) throw habitsError

      let currentHabitsData = habitsData || []

      if (currentHabitsData.length === 0) {
        const sampleInserts = sampleHabits.map(h => ({
          user_id: user.id,
          name: h.name,
          description: h.description,
          frequency: h.frequency,
          category: h.category,
          target_count: h.streak,
          color: h.color
        }))
        await supabase.from('habits').insert(sampleInserts)
        
        const { data: newHabitsData } = await supabase.from('habits').select('*').eq('user_id', user.id)
        if (newHabitsData) {
          currentHabitsData = newHabitsData
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('habit_id')
        .eq('logged_date', today)
        .eq('completed', true)
        
      if (logsError) throw logsError

      const completedHabitIds = new Set(logsData?.map((log: any) => log.habit_id))

      const formattedHabits = currentHabitsData.map((h: any) => ({
        id: h.id,
        name: h.name,
        description: h.description || '',
        frequency: h.frequency,
        category: h.category || 'Other',
        streak: h.target_count || 0,
        completedToday: completedHabitIds.has(h.id),
        color: h.color || '#00d4ff',
      }))
      setHabits(formattedHabits)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleHabit = async (id: string, currentlyCompleted: boolean) => {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, completedToday: !currentlyCompleted } : h
      )
    )

    try {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      
      if (!currentlyCompleted) {
        await supabase.from('habit_logs').insert({ habit_id: id, logged_date: today, completed: true })
      } else {
        await supabase.from('habit_logs').delete().match({ habit_id: id, logged_date: today })
      }
    } catch (err: any) {
      alert(err.message)
      fetchHabits()
    }
  }

  const deleteHabit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const supabase = createClient()
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
      setHabits(habits.filter((h) => h.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('habits').insert({
        user_id: user.id,
        name: newHabit.name,
        description: newHabit.description,
        frequency: newHabit.frequency,
        category: newHabit.category,
      })

      if (error) throw error
      
      setShowModal(false)
      setNewHabit({ name: '', description: '', frequency: 'daily', category: 'Health' })
      fetchHabits()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-cyan mb-2">Habits</h1>
          <p className="text-gray-400">Build consistent behaviors and track your streaks</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-semibold flex items-center gap-2 glow-success"
        >
          <Plus size={20} />
          New Habit
        </Button>
      </motion.div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
          {/* Habit Statistics */}
          <motion.div variants={itemVariants} className="space-y-4 mb-8">
            <h2 className="text-xl font-bold">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                variants={itemVariants}
                className="glass rounded-xl p-6 border border-cyan-500/20"
              >
                <p className="text-gray-400 text-sm mb-2">Total Habits</p>
                <p className="text-3xl font-bold text-cyan-400">{habits.length}</p>
                <p className="text-xs text-gray-500 mt-2">Active habits tracked</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="glass rounded-xl p-6 border border-green-500/20"
              >
                <p className="text-gray-400 text-sm mb-2">Completed Today</p>
                <p className="text-3xl font-bold text-green-400">
                  {habits.filter((h) => h.completedToday).length}
                </p>
                <p className="text-xs text-gray-500 mt-2">out of {habits.length}</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="glass rounded-xl p-6 border border-orange-500/20"
              >
                <p className="text-gray-400 text-sm mb-2">Best Streak</p>
                <p className="text-3xl font-bold text-orange-400">
                  {habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">consecutive days</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Today's Habits */}
          <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold">Today&apos;s Habits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              variants={itemVariants}
              className={`glass rounded-xl p-6 border transition-all cursor-pointer group ${
                habit.completedToday
                  ? 'border-green-500/50 bg-green-500/5'
                  : 'border-cyan-500/20 hover:border-cyan-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => toggleHabit(habit.id, habit.completedToday)}
                      className="transition-all"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 transition" />
                      )}
                    </button>
                    <div>
                      <h3 className={`font-semibold transition ${
                        habit.completedToday ? 'text-green-400 line-through' : 'text-white'
                      }`}>
                        {habit.name}
                      </h3>
                      <p className="text-xs text-gray-500">{habit.description}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => deleteHabit(habit.id, e)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Streak and Category */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
                  habit.category
                )}`}>
                  <span>{habit.category}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-orange-400">
                  <Flame size={16} />
                  <span>{habit.streak} day streak</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* Empty state */}
      {habits.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-12 border border-cyan-500/20 text-center"
        >
          <Zap className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
          <p className="text-gray-400 mb-6">Create your first habit to build consistency!</p>
          <Button onClick={() => setShowModal(true)} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400">
            Create Your First Habit
          </Button>
        </motion.div>
      )}
      </>)}

      {/* Add Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 border border-green-500/20 w-full max-w-md bg-[#0f0f1e]"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Habit</h2>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input required value={newHabit.name} onChange={e => setNewHabit({...newHabit, name: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-green-500/30 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea value={newHabit.description} onChange={e => setNewHabit({...newHabit, description: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-green-500/30 rounded p-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Frequency</label>
                  <select value={newHabit.frequency} onChange={e => setNewHabit({...newHabit, frequency: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-green-500/30 rounded p-2 text-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <select value={newHabit.category} onChange={e => setNewHabit({...newHabit, category: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-green-500/30 rounded p-2 text-white">
                    <option value="Health">Health</option>
                    <option value="Learning">Learning</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Mental">Mental</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1 border border-green-500/30 hover:bg-green-500/10 text-white">Cancel</Button>
                <Button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-black">Create Habit</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
