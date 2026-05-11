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
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, color: 'text-foreground group-hover:text-primary' },
  { href: '/goals', label: 'Goals', icon: Target, color: 'text-foreground group-hover:text-primary' },
  { href: '/habits', label: 'Habits', icon: Zap, color: 'text-foreground group-hover:text-success' },
  { href: '/expenses', label: 'Expenses', icon: IndianRupee, color: 'text-foreground group-hover:text-accent' },
  { href: '/study', label: 'Study', icon: BookOpen, color: 'text-foreground group-hover:text-primary' },
  { href: '/health', label: 'Health', icon: Activity, color: 'text-foreground group-hover:text-destructive' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-foreground group-hover:text-accent' },
  { href: '/insights', label: 'AI Insights', icon: Lightbulb, color: 'text-foreground group-hover:text-accent' },
  { href: '/settings', label: 'Settings', icon: Settings, color: 'text-foreground group-hover:text-muted-foreground' },
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative transition-colors duration-300">
      {/* Abstract Background for internal pages */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-300">
        <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[150px] transition-colors duration-300" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[150px] transition-colors duration-300" />
      </div>

      {/* Floating Glass Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col p-4 z-20 h-full w-72">
        <div className="glass rounded-[2rem] flex flex-col h-full overflow-hidden border-border shadow-[0_0_30px_color-mix(in_srgb,var(--primary)_5%,transparent)] transition-colors duration-300">
          {/* Logo */}
          <div className="p-6 pt-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors duration-300">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-none transition-colors duration-300">LifeOS AI</h1>
              <p className="text-[10px] text-primary uppercase tracking-widest mt-1 font-semibold transition-colors duration-300">Operating System</p>
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
                        ? 'bg-primary/10 shadow-[inset_0_0_20px_color-mix(in_srgb,var(--primary)_5%,transparent)]'
                        : 'hover:bg-card/50'
                    }`}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-indicator"
                        className="absolute left-0 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_80%,transparent)] transition-colors duration-300"
                      />
                    )}
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-primary drop-shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_80%,transparent)]' : item.color}`} />
                    <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-foreground font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 mt-auto">
            <div className="glass-light rounded-2xl p-4 flex items-center justify-between group hover:bg-card/50 transition-colors cursor-pointer border border-border transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors duration-300">
                  U
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground transition-colors duration-300">User</p>
                  <p className="text-xs text-muted-foreground transition-colors duration-300">Pro Plan</p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground hover:bg-card/50 rounded-lg transition-colors duration-300">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-colors duration-300"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[80%] max-w-[300px] z-50 p-4"
            >
              <div className="glass rounded-[2rem] flex flex-col h-full overflow-hidden border-border transition-colors duration-300">
                <div className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center transition-colors duration-300">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-foreground transition-colors duration-300">LifeOS AI</span>
                    </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 bg-card/50 hover:bg-card rounded-full transition-colors duration-300">
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
                          isActive ? 'bg-primary/10' : 'hover:bg-card/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary drop-shadow-[0_0_8px_color-mix(in_srgb,var(--primary)_80%,transparent)]' : 'text-muted-foreground'} transition-colors duration-300`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'} transition-colors duration-300`}>{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-4 mt-auto border-t border-border transition-colors duration-300">
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors duration-300">
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
        <header className="md:hidden h-20 glass-light border-b border-border flex items-center justify-between px-6 z-30 transition-colors duration-300">
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-card/50 hover:bg-card rounded-xl transition-colors duration-300">
            <Menu size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition-colors duration-300">
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
