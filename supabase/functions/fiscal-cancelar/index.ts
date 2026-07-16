// supabase/functions/fiscal-cancelar/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

async function getEndpoint(supabase: any, chave: string, params?: Record<string, string>): Promise<string> {
  const { data, error } = await supabase
    .from('fiscal_api_endpoints')
    .select('url')
    .eq('chave', chave)
    .eq('active', true)
    .single();

  if (error || !data) throw new Error(`Endpoint não encontrado: ${chave}`);

  let url = data.url;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }
  }
  return url;
}

async function getToken(supabase: any, settings: any): Promise<string> {
  const now = new Date();
  const expiresAt = settings.token_expires_at_fiscal ? new Date(settings.token_expires_at_fiscal) : null;

  if (settings.access_token_fiscal && expiresAt && expiresAt.getTime() > now.getTime() + 300000) {
    return settings.access_token_fiscal;
  }

  const authUrl = await getEndpoint(supabase, 'auth');
  const clientId = settings.client_id_fiscal;
  const clientSecret = settings.client_secret_fiscal;

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais fiscais não configuradas');
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'nfce nfe'
    })
  });

  if (!response.ok) {
    throw new Error(`Erro ao obter token: ${response.status}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresIn = data.expires_in || 3600;
  const newExpiresAt = new Date(now.getTime() + expiresIn * 1000);

  await supabase
    .from('store_settings')
    .update({
      access_token_fiscal: token,
      token_expires_at_fiscal: newExpiresAt.toISOString()
    })
    .eq('id', settings.id);

  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fiscal_document_id, justificativa } = await req.json();

    if (!fiscal_document_id) {
      return new Response(
        JSON.stringify({ error: 'fiscal_document_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!justificativa || justificativa.length < 15) {
      return new Response(
        JSON.stringify({ error: 'Justificativa deve ter no mínimo 15 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor ausente' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: doc, error: docError } = await supabase
      .from('fiscal_documents')
      .select('*')
      .eq('id', fiscal_document_id)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: 'Documento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (doc.status === 'cancelada') {
      return new Response(
        JSON.stringify({ error: 'Documento já está cancelado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (doc.status !== 'autorizada') {
      return new Response(
        JSON.stringify({ error: 'Apenas documentos autorizados podem ser cancelados' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    const token = await getToken(supabase, settings);
    const endpointChave = doc.tipo === 'NFCE' ? 'nfce_cancelar' : 'nfe_cancelar';
    const url = await getEndpoint(supabase, endpointChave, { id: doc.id_nuvemfiscal });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ justificativa })
    });

    if (response.status !== 200) {
      const errText = await response.text();
      throw new Error(`Erro ao cancelar: ${response.status} - ${errText}`);
    }

    await supabase
      .from('fiscal_documents')
      .update({
        status: 'cancelada',
        cancelado_em: new Date().toISOString()
      })
      .eq('id', fiscal_document_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Documento cancelado com sucesso' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('fiscal-cancelar error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
