// services/presaveService.js
import { supabase } from './supabase';

// Função para verificar se um slug já existe
const checkSlugExists = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('presaves')
      .select('id')
      .eq('shareable_slug', slug)
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar slug:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Erro na verificação de slug:', error);
    return false;
  }
};

// Função para gerar um slug único
const generateUniqueSlug = async (artistName, trackName, customSlug = '') => {
  let baseSlug = '';
  
  // Se o usuário forneceu um slug personalizado, usar ele como base
  if (customSlug && customSlug.trim()) {
    baseSlug = customSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9-]/g, '') // Remove caracteres especiais, mantém hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, ''); // Remove hífens das extremidades
  } else {
    // Gerar slug baseado no nome do artista e faixa
    if (artistName && trackName) {
      baseSlug = `${artistName}-${trackName}`;
    } else if (artistName) {
      baseSlug = `${artistName}-musica`;
    } else if (trackName) {
      baseSlug = `artista-${trackName}`;
    } else {
      baseSlug = 'presave';
    }
    
    baseSlug = baseSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-+|-+$/g, ''); // Remove hífens das extremidades
  }

  // Verificar se o slug base já existe
  let finalSlug = baseSlug;
  let counter = 0;
  
  // Se o slug já existe, adicionar um número
  while (await checkSlugExists(finalSlug)) {
    counter++;
    if (customSlug && customSlug.trim()) {
      // Para slug personalizado, adicionar número no final
      finalSlug = `${baseSlug}-${counter}`;
    } else {
      // Para slug automático, adicionar timestamp + contador para garantir unicidade
      const timestamp = Date.now().toString(36).slice(-4);
      finalSlug = `${baseSlug}-${timestamp}${counter > 1 ? `-${counter}` : ''}`;
    }
  }
  
  return finalSlug;
};

// Função para salvar pré-save no Supabase
export const savePresave = async (formData, userId) => {
  try {
    // Gerar slug único (usar o customSlug se fornecido)
    const shareableSlug = await generateUniqueSlug(
      formData.artistName, 
      formData.trackName, 
      formData.shareableSlug
    );
    
    // Preparar dados para inserção
    const presaveData = {
      user_id: userId,
      template_id: formData.selectedTemplate?.id || 'default',
      template_name: formData.templateName || formData.selectedTemplate?.name || 'Template Personalizado',
      artist_name: formData.artistName,
      track_name: formData.trackName,
      release_date: formData.releaseDate,
      artwork_url: formData.artworkUrl,
      template_background_color: formData.templateBackgroundColor || '#000000',
      accent_color: formData.accentColor || '#FFFFFF',
      shareable_slug: shareableSlug,
      status: 'publicado',      // Dados estruturados como JSONB
      platforms: {
        spotify: formData.platforms?.spotify || '',
        'apple-music': formData.platforms?.appleMusic || '',
        'amazon-music': formData.platforms?.amazonMusic || '',
        tidal: formData.platforms?.tidal || '',
        'youtube-music': formData.platforms?.youtubeMusic || '',
        deezer: formData.platforms?.deezer || '',
        soundcloud: formData.platforms?.soundcloud || '',
        youtube: formData.platforms?.youtube || '',        // Incluir também platformLinks se existir (com validação)
        ...(formData.platformLinks ? 
          formData.platformLinks
            .filter(link => link.platform_id && link.platform_id !== 'undefined' && link.url && link.url.trim())
            .reduce((acc, link) => {
              acc[link.platform_id] = link.url;
              return acc;
            }, {}) : {})
      },
      
      sociallinks: formData.socialLinks || [],
      
      // Inicializar contadores
      view_count: 0,
      click_count: {},
      conversion_count: {}
    };

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('presaves')
      .insert([presaveData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar pré-save:', error);
      throw new Error(error.message || 'Erro ao salvar pré-save');
    }

    return {
      id: data.id,
      slug: data.shareable_slug,
      url: `${window.location.origin}/presave/${data.shareable_slug}`
    };

  } catch (error) {
    console.error('Erro no serviço de pré-save:', error);
    throw error;
  }
};

// Função para buscar pré-save por slug
export const getPresaveBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from('presaves')
      .select('*')
      .eq('shareable_slug', slug)
      .eq('status', 'publicado')
      .single();

    if (error) {
      throw new Error('Pré-save não encontrado');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar pré-save:', error);
    throw error;
  }
};

// Função para incrementar visualizações
export const incrementView = async (presaveId) => {
  try {
    const { error } = await supabase
      .from('presaves')
      .update({ 
        view_count: supabase.raw('view_count + 1'),
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', presaveId);

    if (error) {
      console.error('Erro ao incrementar visualização:', error);
    }
  } catch (error) {
    console.error('Erro ao incrementar visualização:', error);
  }
};

// Função para registrar clique em plataforma
export const registerClick = async (presaveId, platform) => {
  try {
    // Buscar contagem atual
    const { data: currentData } = await supabase
      .from('presaves')
      .select('click_count')
      .eq('id', presaveId)
      .single();

    const currentClicks = currentData?.click_count || {};
    const newClicks = {
      ...currentClicks,
      [platform]: (currentClicks[platform] || 0) + 1
    };

    const { error } = await supabase
      .from('presaves')
      .update({ click_count: newClicks })
      .eq('id', presaveId);

    if (error) {
      console.error('Erro ao registrar clique:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar clique:', error);
  }
};

// Função para verificar disponibilidade do slug
export const checkSlugAvailability = async (slug) => {
  if (!slug || slug.trim() === '') {
    return { available: true, message: '' };
  }
  
  try {
    const { data, error } = await supabase
      .from('presaves')
      .select('id')
      .eq('shareable_slug', slug)
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar slug:', error);
      return { available: false, message: 'Erro ao verificar disponibilidade' };
    }
    
    const isAvailable = !data || data.length === 0;
    return {
      available: isAvailable,
      message: isAvailable 
        ? 'Link disponível! ✅' 
        : 'Este link já está em uso. Tente outro. ❌'
    };
  } catch (error) {
    console.error('Erro na verificação de slug:', error);
    return { available: false, message: 'Erro ao verificar disponibilidade' };
  }
};

/**
 * Salva os dados de interação de um fã com uma campanha de pré-save.
 * @param {object} fanData - Objeto contendo os dados do fã e da interação.
 * @param {number} fanData.campaign_id - ID da campanha de pré-save.
 * @param {string} fanData.fan_email - Email do fã.
 * @param {string} [fanData.fan_name] - Nome do fã (opcional).
 * @param {string} fanData.streaming_provider - Provedor de streaming (ex: 'spotify').
 * @returns {Promise<object>} O registro do fã salvo.
 */
export const saveFanInteraction = async (fanData) => {
  try {
    const { data, error } = await supabase
      .from('presave_fans')
      .insert([fanData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar interação do fã:', error);
      throw new Error(error.message || 'Erro ao salvar interação do fã');
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de interação do fã:', error);
    throw error;
  }
};
