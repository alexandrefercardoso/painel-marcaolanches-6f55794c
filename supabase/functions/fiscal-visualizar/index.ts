// supabase/functions/fiscal-visualizar/index.ts
// Visualização e impressão de DANFE

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

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

async function getToken(supabase: any, settings: any, scope: string = 'nfce nfe'): Promise<string> {
  const now = new Date();
  const expiresAt = settings.token_expires_at_fiscal ? new Date(settings.token_expires_at_fiscal) : null;

  if (settings.access_token_fiscal && expiresAt && expiresAt.getTime() > now.getTime() + 300000) {
    return settings.access_token_fiscal;
  }

  const authUrl = await getEndpoint(supabase, 'auth');
  const clientId = settings.client_id_fiscal;
  const clientSecret = settings.client_secret_fiscal;

  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    }),
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
      token_expires_at_fiscal: newExpiresAt.toISOString(),
    })
    .eq('id', settings.id);

  return token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fiscal_document_id } = await req.json();

    if (!fiscal_document_id) {
      return new Response(
        JSON.stringify({ error: 'fiscal_document_id é obrigatório' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: doc, error: docError } = await (supabase as any)
      .from('fiscal_documents')
      .select('*')
      .eq('id', fiscal_document_id)
      .single();

    if (docError || !doc) {
      return new Response(
        JSON.stringify({ error: 'Documento não encontrado' }),
        { status: 404, headers: jsonHeaders }
      );
    }

    if (doc.status !== 'autorizada') {
      return new Response(
        JSON.stringify({ error: 'Apenas documentos autorizados podem ser visualizados' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const { data: settings } = await (supabase as any)
      .from('store_settings')
      .select('*')
      .single();

    const { data: noteConfig } = await (supabase as any)
      .from('fiscal_note_config')
      .select('*')
      .eq('active', true)
      .single();

    const scope = doc.tipo === 'NFCE' ? noteConfig?.scope_nfce || 'nfce' : noteConfig?.scope_nfe || 'nfe';
    const token = await getToken(supabase, settings, scope);

    const endpointChave = doc.tipo === 'NFCE' ? 'nfce_pdf' : 'nfe_pdf';
    const url = await getEndpoint(supabase, endpointChave, { id: doc.id_nuvemfiscal });

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar DANFE: ${response.status}`);
    }

    const content = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(content)));

    return new Response(
      JSON.stringify({
        success: true,
        content: base64,
        filename: `${doc.chave_acesso || doc.id}-danfe.pdf`,
        tipo: 'pdf',
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Erro inesperado:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
