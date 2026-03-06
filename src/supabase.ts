import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://wjhwobsssjfdkvqwhsem.supabase.co"
const supabaseKey = "sb_publishable_fxVxlizEZyz6qNM58VtRaQ_gG4-vgBf"

export const supabase = createClient(supabaseUrl, supabaseKey)