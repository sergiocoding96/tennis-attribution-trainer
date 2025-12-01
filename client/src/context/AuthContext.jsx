import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, fullName) => {
    if (!supabase) {
      setError('Supabase not configured')
      return { error: { message: 'Supabase not configured' } }
    }

    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      setError(error.message)
      return { error }
    }

    return { data }
  }

  const signIn = async (email, password) => {
    if (!supabase) {
      setError('Supabase not configured')
      return { error: { message: 'Supabase not configured' } }
    }

    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError(error.message)
      return { error }
    }

    return { data }
  }

  const signOut = async () => {
    if (!supabase) return

    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    }
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    if (!supabase || !user) return { error: { message: 'Not authenticated' } }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return { data }
    } catch (err) {
      return { error: err }
    }
  }

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isConfigured: !!supabase,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => user && fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
