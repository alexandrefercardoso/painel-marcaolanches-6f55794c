// Edge function: obtém access_token na NuvemFiscal (OAuth2 client_credentials)
// Equivalente ao OBTER_TOKEN_NUVEM_FISCAL(p_acao) do WinDev.
// Lê credenciais e scopes de public.store_settings, URL de public.fiscal_endpoints (key='auth_token'),
// salva token + expiração na linha de store_settings e retorna o token.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

type Acao = "SCOPE_CEP" | "SCOPE_NFCE" | "SCOPE_NFE";

const DEFAULT_AUTH_URL = "https://auth.nuvemfiscal.com.br/oauth/token";

const SCOPE_MAP: Record<Acao, {
  scopeField: "scope_nuvemf_cep" | "scope_nuvemf_nfce" | "scope_nuvemf_nfe";
  tokenField: "access_token_nuvemf_cep" | "access_token_nuvemf_nfce" | "access_token_nuvemf_nfe";
  expireField: "expire_token_nuvemf_cep" | "expire_token_nuvemf_nfce" | "expire_token_nuvemf_nfe";
  legacyTokenField?: "access_token_nfe" | "access_token_nfce";
  defaultScope: string;
  contains: string;
}> = {
  SCOPE_CEP: {
    scopeField: "scope_nuvemf_cep",
    tokenField: "access_token_nuvemf_cep",
    expireField: "expire_token_nuvemf_cep",
    defaultScope: "cep",
    contains: "cep",
  },
  SCOPE_NFCE: {
    scopeField: "scope_nuvemf_nfce",
    tokenField: "access_token_nuvemf_nfce",
    expireField: "expire_token_nuvemf_nfce",
    legacyTokenField: "access_token_nfce",
    defaultScope: "nfce",
    contains: "nfce",
  },
  SCOPE_NFE: {
    scopeField: "scope_nuvemf_nfe",
    tokenField: "access_token_nuvemf_nfe",
    expireField: "expire_token_nuvemf_nfe",
    legacyTokenField: "access_token_nfe",
    defaultScope: "nfe",
    contains: "nfe",
  },
};

function log(msg: string, extra?: unknown) {
  const ts = new Date().toISOString();
  if (extra !== undefined) console.log(`[fiscal-token ${ts}] ${msg}`, extra);
  else console.log(`[fiscal-token ${ts}] ${msg}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const url = new URL(req.url);
    let rawAcao = (body.acao ?? url.searchParams.get("acao") ?? "").toString().toUpperCase();
    const force = Boolean(body.force ?? url.searchParams.get("force") === "1");

    // Compat: aceita { scope: "nfe" | "nfce" | "cep" | "nfce nfe" ... }
    if (!rawAcao) {
      const scopeIn = (body.scope ?? url.searchParams.get("scope") ?? "").toString().toLowerCase();
      if (scopeIn.includes("nfce")) rawAcao = "SCOPE_NFCE";
      else if (scopeIn.includes("nfe")) rawAcao = "SCOPE_NFE";
      else if (scopeIn.includes("cep")) rawAcao = "SCOPE_CEP";
    }

    if (!["SCOPE_CEP", "SCOPE_NFCE", "SCOPE_NFE"].includes(rawAcao)) {
      return new Response(
        JSON.stringify({ error: "Parâmetro 'acao' inválido. Use SCOPE_CEP | SCOPE_NFCE | SCOPE_NFE (ou scope='nfe'|'nfce'|'cep')." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const acao = rawAcao as Acao;
    const cfg = SCOPE_MAP[acao];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Empresa (única linha em store_settings)
    const { data: filial, error: errFilial } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (errFilial || !filial) {
      log("Erro carregando store_settings", errFilial);
      return new Response(
        JSON.stringify({ error: "store_settings não encontrado", details: errFilial?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const clientId = (filial.client_id ?? "").trim();
    const clientSecret = (filial.client_secret ?? "").trim();
    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: "CLIENT_ID/CLIENT_SECRET não configurados em store_settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Reutiliza token vigente se ainda válido (>60s) e não for force
    const currentToken = filial[cfg.tokenField] as string | null;
    const currentExpire = filial[cfg.expireField] as string | null;
    if (!force && currentToken && currentExpire) {
      const expMs = new Date(currentExpire).getTime();
      if (expMs - Date.now() > 60_000) {
        log(`Reuso de token vigente (${acao}) até ${currentExpire}`);
        return new Response(
          JSON.stringify({ access_token: currentToken, expires_at: currentExpire, reused: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 3) Scope (com fallback)
    let scope = ((filial[cfg.scopeField] as string | null) ?? "").trim();
    if (!scope || !scope.includes(cfg.contains)) {
      log(`Scope ${acao} inválido ('${scope}'), usando default '${cfg.defaultScope}'.`);
      scope = cfg.defaultScope;
    }

    // 4) URL do endpoint de auth (editável em fiscal_endpoints)
    const { data: epRow } = await supabase
      .from("fiscal_endpoints")
      .select("url")
      .eq("key", "auth_token")
      .eq("is_active", true)
      .maybeSingle();
    const authUrl = epRow?.url || DEFAULT_AUTH_URL;

    // 5) POST x-www-form-urlencoded
    const form = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope,
    });

    const started = Date.now();
    const resp = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: form.toString(),
    });
    const elapsed = Date.now() - started;
    const raw = await resp.text();

    let payload: any = {};
    try { payload = JSON.parse(raw); } catch { /* mantém raw */ }

    if (!resp.ok) {
      const errMsg = payload?.error_description || payload?.error || raw;
      log(`Erro ${resp.status} ao obter token (${acao}) em ${elapsed}ms: ${errMsg}`);
      return new Response(
        JSON.stringify({ error: "Falha ao obter token", status: resp.status, details: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const accessToken: string = payload.access_token;
    const expiresIn: number = Number(payload.expires_in ?? 0);
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Resposta sem access_token", details: payload }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Margem de segurança: -60s
    const expiresAt = new Date(Date.now() + Math.max(expiresIn - 60, 60) * 1000).toISOString();

    const update: Record<string, unknown> = {
      [cfg.tokenField]: accessToken,
      [cfg.expireField]: expiresAt,
    };
    // Compat: mantém access_token_nfe / access_token_nfce sincronizados
    if (cfg.legacyTokenField) update[cfg.legacyTokenField] = accessToken;

    const { error: updErr } = await supabase
      .from("store_settings")
      .update(update)
      .eq("id", filial.id);

    if (updErr) {
      log("Erro salvando token em store_settings", updErr);
      return new Response(
        JSON.stringify({ error: "Token obtido mas falhou ao salvar", details: updErr.message, access_token: accessToken }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    log(`Token ${acao} obtido com sucesso em ${elapsed}ms (expira ${expiresAt})`);
    return new Response(
      JSON.stringify({
        access_token: accessToken,
        token_type: payload.token_type ?? "Bearer",
        expires_in: expiresIn,
        expires_at: expiresAt,
        scope,
        acao,
        reused: false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    log("Exceção", e);
    return new Response(
      JSON.stringify({ error: "Exceção interna", details: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
