'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Menu,
  Target,
  Zap,
  IndianRupee,
  BookOpen,
  BarChart3,
  Lightbulb,
  Settings,
  LogOut,
  Home,
  X,
  Activity,
  Sparkles,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'text-white group-hover:text-cyan-400' },
  { href: '/goals', label: 'Goals', icon: Target, color: 'text-white group-hover:text-cyan-400' },
  { href: '/habits', label: 'Habits', icon: Zap, color: 'text-white group-hover:text-yellow-400' },
  { href: '/expenses', label: 'Expenses', icon: IndianRupee, color: 'text-white group-hover:text-green-400' },
  { href: '/study', label: 'Study', icon: BookOpen, color: 'text-white group-hover:text-blue-400' },
  { href: '/health', label: 'Health', icon: Activity, color: 'text-white group-hover:text-rose-400' },
  { href: '/career', label: 'Career', icon: Briefcase, color: 'text-white group-hover:text-orange-400' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-white group-hover:text-purple-400' },
  { href: '/insights', label: 'AI Insights', icon: Lightbulb, color: 'text-white group-hover:text-magenta-400' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'text-white group-hover:text-gray-300' },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-[#030303] text-white overflow-hidden relative">
      {/* Abstract Background for internal pages */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating Glass Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col p-4 z-20 h-full w-72">
        <div className="glass rounded-[2rem] flex flex-col h-full overflow-hidden border-white/5 shadow-[0_0_30px_rgba(0,229,255,0.05)]">
          {/* Logo */}
          <div className="p-6 pt-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">LifeOS AI</h1>
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest mt-1 font-semibold">Operating System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide mt-4 pb-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative block"
                >
                  <motion.div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]'
                        : 'hover:bg-white/5'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                      />
                    )}
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : item.color}`} />
                    <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white font-semibold' : 'text-gray-400 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 mt-auto">
            <div className="glass-light rounded-2xl p-4 flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                  U
                </div>
                <div>
                  <p className="text-sm font-bold text-white">User</p>
                  <p className="text-xs text-gray-400">Pro Plan</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-[300px] z-50 p-4"
            >
              <div className="glass rounded-[2rem] flex flex-col h-full overflow-hidden border-white/10">
                <div className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-white">LifeOS AI</span>
                    </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white/5 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-4 mt-auto border-t border-white/5">
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5">
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Mobile Header */}
        <header className="md:hidden h-20 glass-light border-b border-white/5 flex items-center justify-between px-6 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <Menu size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(0,229,255,0.3)]">
            U
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
