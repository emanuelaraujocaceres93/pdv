import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ajaxwzhircpukitaxulm.supabase.co'
const supabaseAnonKey = 'sb_publishable_61P566pTzBlJ-RxBI3LdjA_9nNBRuQi'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)