import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-secret',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }  try {
    // Log do payload para debug
    const payload = await req.json();
    console.log('Auth webhook payload received:', JSON.stringify(payload, null, 2));

    // Verificar o webhook secret do Supabase (enviado no header authorization)
    const authHeader = req.headers.get('authorization');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    
    // O Supabase envia o secret como "Bearer {secret}"
    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      console.log('Secret mismatch:', { 
        received: authHeader, 
        expected: `Bearer ${expectedSecret}` 
      });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Verificar se é um evento de identity_linked do Spotify
    if (payload.type !== 'identity.linked' || payload.record?.provider !== 'spotify') {
      console.log('Event ignored:', { type: payload.type, provider: payload.record?.provider });
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const { record } = payload;
    const userId = record.user_id;
    const identityData = record.identity_data;

    // Extrair tokens do identity_data
    const accessToken = identityData?.access_token;
    const refreshToken = identityData?.refresh_token;
    const expiresIn = identityData?.expires_in || 3600;

    if (!accessToken || !refreshToken) {
      console.error('Tokens não encontrados no identity_data:', identityData);
      return new Response(JSON.stringify({ error: 'Tokens não encontrados' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Criar cliente Supabase com service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));

    // Salvar/atualizar tokens na tabela spotify_tokens
    const { error } = await supabase
      .from('spotify_tokens')
      .upsert({
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Erro ao salvar tokens:', error);
      throw new Error(`Erro ao salvar tokens: ${error.message}`);
    }

    console.log('Tokens salvos com sucesso para o usuário:', userId);

    return new Response(JSON.stringify({ 
      message: 'Tokens salvos com sucesso',
      user_id: userId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
