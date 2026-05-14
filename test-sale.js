import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data: userAuth } = await supabase.auth.signInWithPassword({
    email: 'test@example.com', // Replace with an actual email or just use service role if you want to bypass RLS to check schema
    password: 'password'
  })
  
  // Wait, I can't sign in if I don't know the password.
  console.log("Supabase URL:", supabaseUrl)
}

test()
