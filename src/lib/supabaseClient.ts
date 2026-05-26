import { createClient } from '@supabase/supabase-js'

// Configuração direta para garantir que funcione
const supabaseUrl = 'https://ajaxwzhircpukitaxulm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYXh3emhpcmNwdWtpdGF4dWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTMwMzYsImV4cCI6MjA5NTM2OTAzNn0.EaQ1ucHVeC0zp8rXz9-5Mt0FXYZ0aL1FtNqfNBDBPIA'

console.log('🔍 Conectando ao Supabase...')
console.log('URL:', supabaseUrl)
console.log('KEY existe:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)