import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const sprintId = import.meta.env.VITE_SPRINT_ID
export const supabase = createClient(supabaseUrl, supabaseAnonKey)