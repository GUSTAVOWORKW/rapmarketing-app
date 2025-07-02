// EDGE FUNCTION CORRIGIDA - auth-webhook
// Copie este código para supabase/functions/auth-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 Auth webhook triggered');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Verificar webhook secret
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET');
    const signature = req.headers.get('x-webhook-signature');
    
    console.log('Expected webhook secret exists:', !!webhookSecret);
    console.log('Received signature exists:', !!signature);
    
    if (!webhookSecret) {
      console.error('❌ WEBHOOK_SECRET não configurado nas variáveis de ambiente');
      return new Response(JSON.stringify({ error: 'Internal configuration error' }), { 
        status: 500,
        headers: corsHeaders 
      });
    }
    
    if (!signature) {
      console.error('❌ x-webhook-signature header não encontrado');
      return new Response(JSON.stringify({ error: 'Unauthorized - No signature' }), { 
        status: 401,
        headers: corsHeaders 
      });
    }
    
    if (signature !== webhookSecret) {
      console.error('❌ Invalid webhook signature');
      console.error('Expected:', webhookSecret);
      console.error('Received:', signature);
      return new Response(JSON.stringify({ error: 'Unauthorized - Invalid signature' }), { 
        status: 401,
        headers: corsHeaders 
      });
    }

    console.log('✅ Webhook signature válida');

    // Parse do payload
    const payload = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2));

    // Verificar se é um evento relevante
    if (!payload) {
      console.log('❌ Payload vazio');
      return new Response(JSON.stringify({ message: 'OK - Empty payload' }), { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // Log do tipo de evento
    console.log('Event type:', payload.type);
    console.log('User exists:', !!payload.user);
    console.log('Identity data exists:', !!payload.identity_data);

    // Verificar se é um evento de identidade
    if (!payload.user || !payload.identity_data) {
      console.log('ℹ️ Não é evento de identidade, ignorando');
      return new Response(JSON.stringify({ message: 'OK - Not identity event' }), { 
        status: 200,
        headers: corsHeaders 
      });
    }

    const { user, identity_data } = payload;
    console.log('👤 User ID:', user.id);
    console.log('🔗 Provider:', identity_data.provider);

    // Verificar se é uma identidade Spotify
    if (identity_data.provider !== 'spotify') {
      console.log('ℹ️ Não é evento do Spotify, ignorando');
      return new Response(JSON.stringify({ message: 'OK - Not Spotify' }), { 
        status: 200,
        headers: corsHeaders 
      });
    }

    console.log('🎵 Processando evento do Spotify...');

    // Verificar variáveis de ambiente do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis do Supabase não configuradas');
      console.error('SUPABASE_URL exists:', !!supabaseUrl);
      console.error('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
      return new Response(JSON.stringify({ error: 'Internal configuration error' }), { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Criar cliente Supabase com service role (bypassa RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Cliente Supabase criado');

    // Log dos dados recebidos do Spotify
    console.log('🎵 Spotify data:');
    console.log('- access_token exists:', !!identity_data.access_token);
    console.log('- refresh_token exists:', !!identity_data.refresh_token);
    console.log('- expires_in:', identity_data.expires_in);

    // Preparar dados para salvar
    const expiresIn = identity_data.expires_in || 3600; // Default 1 hora
    const expiresAt = Date.now() + (expiresIn * 1000);
    
    const spotifyData = {
      user_id: user.id,
      access_token: identity_data.access_token,
      refresh_token: identity_data.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString()
    };

    console.log('💾 Tentando salvar dados:', {
      user_id: spotifyData.user_id,
      has_access_token: !!spotifyData.access_token,
      has_refresh_token: !!spotifyData.refresh_token,
      expires_at: new Date(spotifyData.expires_at).toISOString()
    });

    // Tentar salvar/atualizar tokens na tabela
    const { data, error } = await supabase
      .from('spotify_tokens')
      .upsert(spotifyData, { 
        onConflict: 'user_id',
        returning: 'minimal'
      });

    if (error) {
      console.error('❌ Erro ao salvar tokens do Spotify:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Tentar diagnosticar o erro
      if (error.code === '42P01') {
        console.error('💡 Tabela spotify_tokens não existe');
      } else if (error.code === '42501') {
        console.error('💡 Problema de permissão - verificar RLS');
      }
      
      // Não retornamos erro 500 para não quebrar o fluxo de auth
      // mas logamos para debug
    } else {
      console.log('✅ Tokens do Spotify salvos com sucesso!');
      console.log('📊 Data saved:', data);
    }

    // Verificar se realmente foi salvo
    const { data: verifyData, error: verifyError } = await supabase
      .from('spotify_tokens')
      .select('user_id, created_at, updated_at, expires_at')
      .eq('user_id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar salvamento:', verifyError);
    } else {
      console.log('✅ Verificação: Token encontrado na tabela');
      console.log('📅 Updated at:', verifyData.updated_at);
    }

    // Retornar claims customizados (opcional)
    const claims = {
      ...payload.claims,
      has_spotify: true,
      spotify_linked_at: new Date().toISOString()
    };

    console.log('🎉 Webhook processado com sucesso');

    return new Response(JSON.stringify({
      claims,
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });

  } catch (error) {
    console.error('💥 Erro geral no webhook:', error);
    console.error('Stack trace:', error.stack);
    
    // Retornar claims vazios para não quebrar o fluxo de auth
    return new Response(JSON.stringify({
      claims: {},
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200 // Status 200 para não quebrar o auth flow
    });
  }
});
