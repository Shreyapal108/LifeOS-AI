'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        
        if (error) throw error
        setUser(user)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load user'))
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return { user, loading, error }
}
