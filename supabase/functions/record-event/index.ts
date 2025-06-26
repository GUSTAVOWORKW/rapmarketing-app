import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define os cabeçalhos CORS para permitir requisições de qualquer origem
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Função para detectar dispositivo, OS e navegador a partir do User-Agent
const getDeviceInfo = (userAgent: string) => {
  let deviceType = 'Desktop';
  if (/Mobi|Android/i.test(userAgent)) deviceType = 'Mobile';
  else if (/Tablet|iPad/i.test(userAgent)) deviceType = 'Tablet';

  let osType = 'Unknown';
  if (/Windows NT 10.0/i.test(userAgent)) osType = 'Windows 10';
  else if (/Windows NT 11.0/i.test(userAgent)) osType = 'Windows 11';
  else if (/Windows/i.test(userAgent)) osType = 'Windows';
  else if (/Mac OS X/i.test(userAgent)) osType = 'macOS';
  else if (/Linux/i.test(userAgent)) osType = 'Linux';
  else if (/Android/i.test(userAgent)) osType = 'Android';
  else if (/iPhone|iPad|iPod/i.test(userAgent)) osType = 'iOS';

  let browserType = 'Unknown';
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) browserType = 'Chrome';
  else if (/Firefox/i.test(userAgent)) browserType = 'Firefox';
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browserType = 'Safari';
  else if (/Edge|Edg/i.test(userAgent)) browserType = 'Edge';
  else if (/Opera|OPR/i.test(userAgent)) browserType = 'Opera';

  return { deviceType, osType, browserType };
};

serve(async (req) => {
  // Trata a requisição preflight OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Inicializa o cliente Supabase com as credenciais de ambiente
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Extrai os dados do corpo da requisição
    const { itemId, itemType, platformId, isPageView } = await req.json();

    // Validação dos parâmetros obrigatórios
    if (!itemId || !itemType) {
      return new Response(JSON.stringify({ error: "itemId e itemType são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extrai informações de geolocalização e do cliente dos headers da requisição
    const user_agent = req.headers.get("user-agent") || "Unknown";
    const ip_address = req.headers.get("x-forwarded-for")?.split(',')[0] || null;
    const city = req.headers.get("x-supabase-city") || null;
    const country = req.headers.get("x-supabase-country-code") || null;
    const region = req.headers.get("x-supabase-region") || null;
    const latitude = req.headers.get("x-supabase-latitude") || null;
    const longitude = req.headers.get("x-supabase-longitude") || null;

    // Obtém informações do dispositivo
    const { deviceType, osType, browserType } = getDeviceInfo(user_agent);

    // Monta o payload base com todos os dados coletados
    const basePayload = {
      clicked_at: new Date().toISOString(),
      platform_id: platformId || (isPageView ? 'page_view' : 'unknown_click'),
      user_agent,
      ip_address,
      country_code: country,
      city_name: city,
      region_name: region,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      device_type: deviceType,
      os_type: osType,
      browser_type: browserType,
    };

    let tableName = "";
    let insertData: any = {};

    // Define a tabela e os dados a serem inseridos com base no itemType
    if (itemType === 'smartlink') {
      tableName = 'smartlink_clicks';
      insertData = {
        ...basePayload,
        smartlink_id: itemId,
        is_general_click: !isPageView, // Lógica invertida para smartlinks
      };
    } else if (itemType === 'presave') {
      tableName = 'presave_clicks';
      insertData = {
        ...basePayload,
        presave_id: itemId,
        is_page_view: isPageView, // Lógica direta para presaves
      };
    } else {
      return new Response(JSON.stringify({ error: "itemType inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insere os dados na tabela apropriada
    const { error } = await supabaseClient.from(tableName).insert(insertData);

    if (error) {
      console.error(`Erro ao inserir no Supabase (${tableName}):`, error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retorna uma resposta de sucesso
    return new Response(JSON.stringify({ message: "Evento registrado com sucesso" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (e) {
    console.error("Erro inesperado na Edge Function:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
