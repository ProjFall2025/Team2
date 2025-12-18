import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext, type UserProfile } from './AuthContextType'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, profile?: UserProfile) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    // Save user profile to the users table
    if (data.user && profile) {
      const { error: profileError } = await supabase
        .from('user')
        .insert({
          user_id: data.user.id,
          email_txt: data.user.email,
          first_nm: profile?.firstName,
          middle_nm: profile?.middleName,
          last_nm: profile?.lastName,
          phone_nbr: profile?.phoneNumber,
          role_cd: "user"
        })
      if (profileError) {
        console.log("profile error insertion", profileError)
        throw profileError
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
