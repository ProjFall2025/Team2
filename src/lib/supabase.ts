import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xrpmchdkvioiehivvjcw.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhycG1jaGRrdmlvaWVoaXZ2amN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDg2NjMsImV4cCI6MjA4MTIyNDY2M30.MNlcJy2R2RtEFrjJjqE7C7T9g60pufCGNpFs7ERGTek"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

