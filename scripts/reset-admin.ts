import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function reset() {
  const email = "admin@sistema.com"
  const password = "admin123456"

  const { data: { users } } = await supabase.auth.admin.listUsers()
  const existingUser = users.find(u => u.email === email)
  
  if (existingUser) {
    await supabase.auth.admin.updateUserById(existingUser.id, {
      password: password,
      email_confirm: true
    })
  } else {
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
  }
  console.log("DONE")
}

reset()
