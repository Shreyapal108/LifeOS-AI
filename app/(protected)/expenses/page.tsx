'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, IndianRupee, TrendingDown, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
}

interface BudgetCategory {
  name: string
  limit: number
  spent: number
  color: string
}

const sampleExpenses: Expense[] = [
  { id: '1', description: 'Coffee', amount: 5.5, category: 'Food', date: '2024-05-09' },
  { id: '2', description: 'Gym Membership', amount: 50, category: 'Health', date: '2024-05-08' },
  { id: '3', description: 'Movie Tickets', amount: 30, category: 'Entertainment', date: '2024-05-07' },
  { id: '4', description: 'Groceries', amount: 120, category: 'Food', date: '2024-05-06' },
  { id: '5', description: 'Gas', amount: 45, category: 'Transportation', date: '2024-05-05' },
]

const budgets: BudgetCategory[] = [
  { name: 'Food', limit: 300, spent: 175.5, color: 'from-orange-500 to-red-500' },
  { name: 'Transportation', limit: 200, spent: 95, color: 'from-blue-500 to-cyan-500' },
  { name: 'Entertainment', limit: 150, spent: 60, color: 'from-purple-500 to-magenta-500' },
  { name: 'Health', limit: 200, spent: 180, color: 'from-green-500 to-emerald-500' },
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<BudgetCategory[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch Categories
      let { data: catData, error: catError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('user_id', user.id)

      if (catError) throw catError

      // Seed default categories if none exist
      if (catData && catData.length === 0) {
        const defaultCats = [
          { name: 'Food', monthly_budget: 300, color: 'from-orange-500 to-red-500' },
          { name: 'Transportation', monthly_budget: 200, color: 'from-blue-500 to-cyan-500' },
          { name: 'Entertainment', monthly_budget: 150, color: 'from-purple-500 to-magenta-500' },
          { name: 'Health', monthly_budget: 200, color: 'from-green-500 to-emerald-500' }
        ]
        const { data: newCats, error: seedError } = await supabase
          .from('expense_categories')
          .insert(defaultCats.map(c => ({ ...c, user_id: user.id })))
          .select()
        
        if (!seedError && newCats) catData = newCats
      }

      // Fetch Expenses
      const { data: expData, error: expError } = await supabase
        .from('expenses')
        .select(`*, expense_categories(name)`)
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (expError) throw expError

      // Map Categories to Budgets
      const budgetsMap = (catData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        limit: Number(c.monthly_budget) || 0,
        spent: 0,
        color: c.color || 'from-green-500 to-emerald-500',
      }))

      // Map Expenses
      const formattedExpenses = (expData || []).map((e: any) => {
        const b = budgetsMap.find(b => b.id === e.category_id)
        if (b) b.spent += Number(e.amount)

        return {
          id: e.id,
          description: e.description || '',
          amount: Number(e.amount),
          category: e.expense_categories?.name || 'Uncategorized',
          date: e.date,
        }
      })

      setCategories(catData || [])
      setBudgets(budgetsMap)
      setExpenses(formattedExpenses)
      
      if (catData && catData.length > 0 && !newExpense.category_id) {
        setNewExpense(prev => ({ ...prev, category_id: catData![0].id }))
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('expenses').insert({
        user_id: user.id,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        category_id: newExpense.category_id || null,
        date: newExpense.date,
      })

      if (error) throw error
      
      setShowModal(false)
      setNewExpense({ description: '', amount: '', category_id: categories[0]?.id || '', date: new Date().toISOString().split('T')[0] })
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const budgetTotal = budgets.reduce((sum, b) => sum + b.limit, 0)

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
          <h1 className="text-2xl font-bold gradient-text-cyan mb-2">Expenses</h1>
          <p className="text-gray-400">Track spending and manage your budget</p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold flex items-center gap-2 glow-magenta"
        >
          <Plus size={20} />
          Log Expense
        </Button>
      </motion.div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
      {/* Summary Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-cyan-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Total Budget</p>
          <p className="text-3xl font-bold text-cyan-400">₹{budgetTotal}</p>
          <p className="text-xs text-gray-500 mt-2">Monthly limit</p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-orange-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Spent This Month</p>
          <p className="text-3xl font-bold text-orange-400">₹{totalSpent.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">
            {(((totalSpent / budgetTotal) * 100).toFixed(0))}% of budget
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-6 border border-green-500/20"
        >
          <p className="text-gray-400 text-sm mb-2">Remaining</p>
          <p className="text-3xl font-bold text-green-400">
            ₹{(budgetTotal - totalSpent).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Available balance</p>
        </motion.div>
      </motion.div>

      {/* Budget Categories */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold">Budget by Category</h2>
        <div className="space-y-4">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.limit) * 100
            const isOverBudget = percentage > 100

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`glass rounded-xl p-6 border transition-all ${
                  isOverBudget ? 'border-red-500/30' : 'border-cyan-500/20'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{budget.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>₹{budget.spent.toFixed(2)}</span>
                      <span>/</span>
                      <span>₹{budget.limit.toFixed(2)}</span>
                    </div>
                  </div>

                  {isOverBudget && (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-[rgba(0,212,255,0.1)] rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${budget.color} transition-all`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {isOverBudget && (
                  <p className="text-xs text-red-400 mt-2">
                    Over budget by ₹{(budget.spent - budget.limit).toFixed(2)}
                  </p>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Recent Expenses */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-bold">Recent Expenses</h2>
        <div className="glass rounded-xl border border-cyan-500/20 overflow-hidden">
          <div className="divide-y divide-cyan-500/10">
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 hover:bg-cyan-500/5 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <IndianRupee className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold">₹{expense.amount.toFixed(2)}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="glass rounded-xl p-12 border border-cyan-500/20 text-center"
        >
          <TrendingDown className="w-16 h-16 text-cyan-400/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No expenses logged</h3>
          <p className="text-gray-400 mb-6">Start tracking your spending to see insights</p>
          <Button onClick={() => setShowModal(true)} className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400">
            Log Your First Expense
          </Button>
        </motion.div>
      )}
      </>)}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-xl p-6 border border-purple-500/20 w-full max-w-md bg-[#0f0f1e]"
          >
            <h2 className="text-2xl font-bold mb-4">Log Expense</h2>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input required value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-purple-500/30 rounded p-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Amount (₹)</label>
                  <input type="number" step="0.01" required value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-purple-500/30 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Date</label>
                  <input type="date" required value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-purple-500/30 rounded p-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Category</label>
                <select value={newExpense.category_id} onChange={e => setNewExpense({...newExpense, category_id: e.target.value})} className="w-full bg-[rgba(26,26,46,0.8)] border border-purple-500/30 rounded p-2 text-white">
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1 border border-purple-500/30 hover:bg-purple-500/10 text-white">Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">Log Expense</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
