import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Buscar configurações da loja
    const { data: store, error: storeError } = await supabase
      .from('store_settings')
      .select('*')
      .single()

    if (storeError || !store) {
      console.error('Erro ao buscar store_settings:', storeError)
      return new Response(JSON.stringify({ error: 'Store not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    if (!store.auto_manage_menu) {
      return new Response(JSON.stringify({ message: 'Auto manage is disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const now = new Date()
    // Ajuste para fuso horário de Brasília (UTC-3)
    const brasiliaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}))
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[brasiliaTime.getDay()]
    const currentHours = brasiliaTime.getHours()
    const currentMinutes = brasiliaTime.getMinutes()
    const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`

    const schedule = store.opening_hours?.[currentDay]

    if (!schedule || !schedule.active) {
      // Se não está ativo hoje, o cardápio deve estar fechado
      if (store.is_menu_open) {
        await supabase.from('store_settings').update({ is_menu_open: false }).eq('id', store.id)
        console.log(`Fechando cardápio: ${currentDay} não é dia de funcionamento.`)
      }
    } else {
      const { open, close } = schedule
      
      // Lógica simplificada de comparação de horários (HH:mm)
      const isOpen = currentTimeStr >= open && currentTimeStr < close
      
      // Caso especial para fechamento após meia-noite (ex: 18:00 às 02:00)
      let shouldBeOpen = isOpen
      if (close < open) {
        shouldBeOpen = currentTimeStr >= open || currentTimeStr < close
      }

      if (shouldBeOpen !== store.is_menu_open) {
        await supabase.from('store_settings').update({ is_menu_open: shouldBeOpen }).eq('id', store.id)
        console.log(`Alterando status do cardápio para: ${shouldBeOpen ? 'ABERTO' : 'FECHADO'} (${currentTimeStr})`)
      }
    }

    return new Response(JSON.stringify({ success: true, time: currentTimeStr, day: currentDay }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
