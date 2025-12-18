import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface UserProfile {
  firstName: string
  middleName?: string
  lastName: string
  phoneNumber?: string
}

export interface AuthContextType {
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, profile?: UserProfile) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

