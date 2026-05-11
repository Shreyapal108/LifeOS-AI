'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/habits', label: 'Habits', icon: Zap },
  { href: '/expenses', label: 'Expenses', icon: IndianRupee },
  { href: '/study', label: 'Study', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/insights', label: 'AI Insights', icon: Lightbulb },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-[#0f0f1e] text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 glass rounded-tr-2xl border-r border-cyan-500/20 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 w-64 flex flex-col`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-cyan-500/20 rounded-lg transition"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="p-6 pt-8">
          <h1 className="text-2xl font-bold gradient-text-cyan">LifeOS</h1>
          <p className="text-xs text-gray-400 mt-1">AI Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all group"
              >
                <Icon className="w-5 h-5 group-hover:text-cyan-400 transition" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-cyan-500/20 space-y-3">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="glass border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 hover:bg-cyan-500/20 rounded-lg transition"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-400">Welcome back</p>
              <p className="text-sm font-semibold">User</p>
            </div>
            <div className="w-10 h-10 rounded-full glass border border-cyan-500/30 flex items-center justify-center">
              <span className="text-cyan-400 font-bold">U</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
