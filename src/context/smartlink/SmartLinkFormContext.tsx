// src/context/smartlink/SmartLinkFormContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { PlatformLink, SocialLink } from '../../types';
import { PLATFORMS } from '../../data/platforms';

// Define a estrutura do estado do formulário
interface SmartLinkFormState {
  currentSmartLinkId: string | null;
  lastSavedAt: string | null;
  
  // Step 1: Artist Info
  artistName: string;
  artistTitle: string;
  bio: string;
  avatarUrl: string;
  avatarFile: File | null;
  // Step 2: Release Info
  releaseTitle: string;
  feat: string;
  coverImageUrl: string;
  coverImageFile: File | null;
  playerUrl: string;

  // Step 3: Platform Links
  platforms: PlatformLink[];

  // Step 4: Social Links
  socialLinks: SocialLink[];
  contactButtonText: string;
  contactButtonUrl: string;

  // Step 5: Review / Outros
  slug: string;
  template: string;
  faviconUrl: string;
  faviconFile: File | null;
  seoTitle: string;
  seoDescription: string;

  // Controle de estado da UI
  currentStep: number;
  errors: { [key: string]: string };
  isSaving: boolean;
  isLoading: boolean;
}

// Estado inicial
const initialState: SmartLinkFormState = {
  currentSmartLinkId: null,
  lastSavedAt: null,  artistName: '',
  artistTitle: '',
  bio: '',
  avatarUrl: '/avatars/perfilhomem1.png', // Avatar padrão definido
  avatarFile: null,
  releaseTitle: '',
  feat: '',
  coverImageUrl: '/assets/defaults/default-cover.png',
  coverImageFile: null,
  playerUrl: '',
  platforms: [],
  socialLinks: [],
  contactButtonText: 'Contato',
  contactButtonUrl: '',  slug: '',
  template: 'pordosolnoarpoador', // Alterado para o novo template como padrão
  faviconUrl: '',
  faviconFile: null,
  seoTitle: '',
  seoDescription: '',
  currentStep: 1,
  errors: {},
  isSaving: false,
  isLoading: false,
};

// Action Types
const ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  SET_STEP: 'SET_STEP',
  ADD_PLATFORM_LINK: 'ADD_PLATFORM_LINK',
  REMOVE_PLATFORM_LINK: 'REMOVE_PLATFORM_LINK',
  UPDATE_PLATFORM_LINK: 'UPDATE_PLATFORM_LINK',
  ADD_SOCIAL_LINK: 'ADD_SOCIAL_LINK',
  REMOVE_SOCIAL_LINK: 'REMOVE_SOCIAL_LINK',
  UPDATE_SOCIAL_LINK: 'UPDATE_SOCIAL_LINK',
  LOAD_DRAFT: 'LOAD_DRAFT',
  RESET_FORM: 'RESET_FORM',
  SET_SAVING: 'SET_SAVING',
  SET_LOADING: 'SET_LOADING',
  SET_ERRORS: 'SET_ERRORS',
  SET_SMARTLINK_ID: 'SET_SMARTLINK_ID',
} as const;

// Reducer para gerenciar o estado
const smartLinkFormReducer = (state: SmartLinkFormState, action: any): SmartLinkFormState => {
  switch (action.type) {
    case ACTIONS.UPDATE_FIELD: {
      const { field, value } = action.payload;
      return {
        ...state,
        [field]: value,
      };
    }
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };    case ACTIONS.ADD_PLATFORM_LINK: {
      // Encontra a primeira plataforma disponível que ainda não foi adicionada
      const usedPlatformIds = state.platforms.map(p => p.platform_id);
      const availablePlatform = PLATFORMS.find(platform => 
        !usedPlatformIds.includes(platform.id)
      );

      if (!availablePlatform) {
        console.warn('Todas as plataformas já foram adicionadas');
        return state;
      }

      const newPlatformLink: PlatformLink = {
        id: availablePlatform.id, // Usar o platform_id como id para compatibilidade com templates
        platform_id: availablePlatform.id,
        url: '',
      };

      return {
        ...state,
        platforms: [...state.platforms, newPlatformLink],
      };
    }
    case ACTIONS.REMOVE_PLATFORM_LINK:
      return {
        ...state,
        platforms: state.platforms.filter(link => link.id !== action.payload),
      };
    case ACTIONS.UPDATE_PLATFORM_LINK:
      return {
        ...state,
        platforms: state.platforms.map(link =>
          link.id === action.payload.id
            ? { ...link, ...action.payload.updates }
            : link
        ),
      };    case ACTIONS.ADD_SOCIAL_LINK: {
      const newSocialLink: SocialLink = {
        id: 'instagram', // Usar o platform como id para compatibilidade
        platform: 'instagram',
        url: '',
      };
      return {
        ...state,
        socialLinks: [...state.socialLinks, newSocialLink],
      };
    }
    case ACTIONS.REMOVE_SOCIAL_LINK:
      return {
        ...state,
        socialLinks: state.socialLinks.filter(link => link.id !== action.payload),
      };
    case ACTIONS.UPDATE_SOCIAL_LINK:
      return {
        ...state,
        socialLinks: state.socialLinks.map(link =>
          link.id === action.payload.id
            ? { ...link, ...action.payload.updates }
            : link
        ),
      };    case ACTIONS.LOAD_DRAFT:
      const payload = action.payload;
      return {
        ...state,
        ...payload,
        // Sanitizar URLs blob ao carregar dados
        avatarUrl: sanitizeUrl(payload.avatarUrl, initialState.avatarUrl),
        coverImageUrl: sanitizeUrl(payload.coverImageUrl, initialState.coverImageUrl),
        isLoading: false,
      };case ACTIONS.RESET_FORM:
      return {
        ...initialState,
        currentSmartLinkId: `smartlink-${Date.now()}`, // Usar timestamp para id único
      };
    case ACTIONS.SET_SAVING:
      return { ...state, isSaving: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERRORS:
      return { ...state, errors: action.payload };
    case ACTIONS.SET_SMARTLINK_ID:
      return { ...state, currentSmartLinkId: action.payload };
    // Novo caso para adicionar um link de plataforma específico
    case 'ADD_PLATFORM_LINK_OBJECT':
      return {
        ...state,
        platforms: [...state.platforms, action.payload],
      };
    // Novo caso para adicionar um link social específico
    case 'ADD_SOCIAL_LINK_OBJECT':
      return {
        ...state,
        socialLinks: [...state.socialLinks, action.payload],
      };
    default:
      return state;
  }
};

// Interface do contexto
interface SmartLinkFormContextType {
  state: SmartLinkFormState;
  updateField: (field: string, value: any) => void;
  setStep: (step: number) => void;
  addPlatformLink: (link?: PlatformLink) => void; // Corrigido para aceitar argumento opcional
  removePlatformLink: (id: string) => void;
  updatePlatformLink: (id: string, updates: Partial<PlatformLink>) => void;
  addSocialLink: (link?: SocialLink) => void;
  removeSocialLink: (id: string) => void;
  updateSocialLink: (id: string, updates: Partial<SocialLink>) => void;
  saveDraft: () => Promise<void>;
  loadDraft: (id: string) => Promise<void>;
  resetForm: () => void;
  setErrors: (errors: { [key: string]: string }) => void;
  generateSlug: (title: string) => string;
  availablePlatforms: typeof PLATFORMS;
  publishSmartLink: () => Promise<boolean>; // Adicionado
}

// Criar o contexto
const SmartLinkFormContext = createContext<SmartLinkFormContextType | undefined>(undefined);

// Função para validar se uma URL de imagem é acessível
const validateImageUrl = async (url: string): Promise<boolean> => {
  if (!url || typeof url !== 'string') return false;
  
  // URLs locais são sempre válidas
  if (url.startsWith('/') || url.startsWith('./')) return true;
  
  try {
    await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Para evitar problemas de CORS
    });
    return true; // Se chegou até aqui, a URL é acessível
  } catch (error) {
    console.log('🔍 URL de imagem não acessível:', url);
    return false;
  }
};

// Função para carregar avatar do usuário autenticado
// Função para sanitizar URLs blob inválidas
const sanitizeUrl = (url: string | null | undefined, defaultUrl: string = ''): string => {
  if (!url) return defaultUrl;
  
  // Se é uma blob URL, ela não será válida após reload
  if (url.startsWith('blob:')) {
    console.warn('⚠️ URL blob detectada e removida:', url);
    return defaultUrl;
  }
  
  return url;
};

const loadUserAvatar = async (user: any) => {
  console.log('👤 Carregando avatar do usuário...', { user_id: user?.id });
  
  if (!user) {
    console.log('⚠️ Usuário não autenticado');
    return '';
  }

  try {
    const candidateUrls = [
      // 1. Avatar do perfil Supabase
      ...(await (async () => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single();
          return profile?.avatar_url && !profileError ? [profile.avatar_url] : [];
        } catch {
          return [];
        }
      })()),
      // 2. Avatar do user_metadata
      user.user_metadata?.avatar_url,
      // 3. Picture do user_metadata
      user.user_metadata?.picture,
    ].filter(Boolean);

    console.log('🔍 URLs candidatas encontradas:', candidateUrls);

    // Testa cada URL para ver se é acessível
    for (const url of candidateUrls) {
      console.log('🧪 Testando URL:', url);
        // Para URLs do Facebook/externos, assumir que podem falhar
      // e deixar o componente lidar com o fallback
      if (url.includes('facebook.com') || url.includes('fbcdn.net')) {
        console.log('⚠️ URL do Facebook detectada, retornando imagem padrão para evitar erro 403');
        return '/avatars/perfilhomem1.png';
      }
      
      const isValid = await validateImageUrl(url);
      if (isValid) {
        console.log('✅ Avatar válido encontrado:', url);
        return url;
      }
    }    console.log('⚠️ Nenhum avatar válido encontrado, usando padrão');
    return '/avatars/perfilhomem1.png';
    
  } catch (error) {
    console.error('❌ Erro ao carregar avatar do usuário:', error);
    return '/avatars/perfilhomem1.png';
  }
};

// Chave do localStorage - v2 para forçar limpeza de estados bugados
const STORAGE_KEY = 'smartlink_form_draft_v2';

// Provider do contexto
export const SmartLinkFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(smartLinkFormReducer, {
    ...initialState,
    currentSmartLinkId: `smartlink-${Date.now()}`, // Usar timestamp para id único
  });
  const { user } = useAuth() as { user: any };

  // Limpar localStorage antigo na primeira execução
  useEffect(() => {
    // Remover versão antiga do localStorage
    localStorage.removeItem('smartlink_form_draft_v1');
  }, []);

  // Carregar draft do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);        // Migração: Corrige o valor antigo do template no rascunho salvo
        if (data.template === 'noite-carioca') {
          data.template = 'noitecarioca';
        }

        // Garantir que sempre temos uma capa padrão
        if (!data.coverImageUrl) {
          data.coverImageUrl = '/assets/defaults/default-cover.png';
        }

        // Sanitizar URLs blob que podem ter ficado no localStorage
        data.avatarUrl = sanitizeUrl(data.avatarUrl, initialState.avatarUrl);
        data.coverImageUrl = sanitizeUrl(data.coverImageUrl, initialState.coverImageUrl);

        // Resetar estados de loading/saving que não devem persistir
        data.isSaving = false;
        data.isLoading = false;

        dispatch({ type: ACTIONS.LOAD_DRAFT, payload: data });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar draft do localStorage:', error);
    }
  }, []);

  // Auto-save no localStorage com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        // Não salvar File objects (não serializáveis) e estados temporários
        const draftData = {
          ...state,
          avatarFile: null,
          coverImageFile: null,
          faviconFile: null,
          isSaving: false,
          isLoading: false,
          lastSavedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error('❌ Erro ao salvar draft no localStorage:', error);
      }
    }, 800); // Debounce de 800ms
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Carregar avatar do usuário ao fazer login
  useEffect(() => {
    if (user) {
      // Se não tem avatar ou se tem uma URL problemática, carregar novo avatar
      const shouldLoadNewAvatar = !state.avatarUrl || 
        state.avatarUrl === '' ||
        state.avatarUrl.includes('facebook.com') ||
        state.avatarUrl.includes('fbcdn.net');
        
      if (shouldLoadNewAvatar) {
        loadUserAvatar(user).then(avatarUrl => {
          // Sempre define um avatar, mesmo que seja o padrão
          const finalAvatarUrl = avatarUrl || '/avatars/perfilhomem1.png';
          dispatch({
            type: ACTIONS.UPDATE_FIELD,
            payload: { field: 'avatarUrl', value: finalAvatarUrl }
          });
        });
      }
    }
  }, [user, state.avatarUrl]); // Adicionado user e state.avatarUrl às dependências

  // Funções do contexto
  const updateField = useCallback((field: string, value: any) => {
    dispatch({
      type: ACTIONS.UPDATE_FIELD,
      payload: { field, value },
    });
  }, []);

  const setStep = useCallback((step: number) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  }, []);

  const addPlatformLink = useCallback((link?: PlatformLink) => {
    if (link) {
      dispatch({ type: 'ADD_PLATFORM_LINK_OBJECT', payload: link });
    } else {
      dispatch({ type: ACTIONS.ADD_PLATFORM_LINK });
    }
  }, []);

  const removePlatformLink = useCallback((id: string) => {
    dispatch({ type: ACTIONS.REMOVE_PLATFORM_LINK, payload: id });
  }, []);

  const updatePlatformLink = useCallback((id: string, updates: Partial<PlatformLink>) => {
    dispatch({
      type: ACTIONS.UPDATE_PLATFORM_LINK,
      payload: { id, updates },
    });
  }, []);

  const addSocialLink = useCallback((link?: SocialLink) => {
    if (link) {
      dispatch({ type: 'ADD_SOCIAL_LINK_OBJECT', payload: link });
    } else {
      dispatch({ type: ACTIONS.ADD_SOCIAL_LINK });
    }
  }, []);

  const removeSocialLink = useCallback((id: string) => {
    dispatch({ type: ACTIONS.REMOVE_SOCIAL_LINK, payload: id });
  }, []);

  const updateSocialLink = useCallback((id: string, updates: Partial<SocialLink>) => {
    dispatch({
      type: ACTIONS.UPDATE_SOCIAL_LINK,
      payload: { id, updates },
    });
  }, []);

  const setErrors = useCallback((errors: { [key: string]: string }) => {
    dispatch({ type: ACTIONS.SET_ERRORS, payload: errors });
  }, []);

  const resetForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: ACTIONS.RESET_FORM });
  }, []);

  const loadDraft = useCallback(async (id: string) => {
    console.log(`Carregando rascunho para o ID: ${id}`);
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const { data, error } = await supabase
        .from('smart_links')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          console.error(`Rascunho com ID ${id} não encontrado.`);
          setErrors({ form: 'O link que você está tentando editar não foi encontrado.' });
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Rascunho carregado com sucesso:', data);        const draftData = {
          currentSmartLinkId: data.id,
          artistName: data.artist_name || '',
          artistTitle: data.artist_title || '',
          bio: data.bio || '',
          avatarUrl: sanitizeUrl(data.avatar_url, initialState.avatarUrl),
          releaseTitle: data.release_title || '',
          feat: data.feat || '',
          coverImageUrl: sanitizeUrl(data.cover_image_url, initialState.coverImageUrl),
          playerUrl: data.player_url || '',
          platforms: data.platforms || [],
          socialLinks: data.social_links || [],
          contactButtonText: data.contact_button_text || 'Contato',
          contactButtonUrl: data.contact_button_url || '',
          slug: data.slug || '',
          template: data.template_id || 'pordosolnoarpoador',
          avatarFile: null,
          coverImageFile: null,
          faviconFile: null,
        };
        dispatch({ type: ACTIONS.LOAD_DRAFT, payload: draftData });
      }
    } catch (error: any) {
      console.error('Erro ao carregar rascunho do Supabase:', error);
      setErrors({ form: `Erro ao carregar dados: ${error.message}` });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [setErrors]);

  const generateSlug = useCallback((title: string): string => {
    if (!title) return '';
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const publishSmartLink = useCallback(async (): Promise<boolean> => {
    if (!user) {
      console.error('Usuário não autenticado. Não é possível publicar.');
      setErrors({ form: 'Você precisa estar logado para publicar.' });
      return false;
    }

    dispatch({ type: ACTIONS.SET_SAVING, payload: true });
    setErrors({});

    // 1. Validar o slug
    const { slug, avatarFile, coverImageFile } = state;
    if (!slug || slug.trim() === '') {
      setErrors({ slug: 'O URL personalizado não pode estar vazio.' });
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
      return false;
    }

    try {
      // 2. Verificar se o slug já existe
      const { data: existingSlug, error: slugError } = await supabase
        .from('smart_links')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (slugError && slugError.code !== 'PGRST116') { // PGRST116: 'No rows found'
        throw slugError;
      }

      if (existingSlug) {
        setErrors({ slug: 'Este URL personalizado já está em uso. Tente outro.' });
        dispatch({ type: ACTIONS.SET_SAVING, payload: false });
        return false;
      }

      // Função auxiliar para upload de imagem
      const uploadImage = async (file: File, bucket: string, path: string): Promise<string> => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true, // Sobrescreve se já existir
          });

        if (error) {
          throw new Error(`Erro no upload para ${bucket}: ${error.message}`);
        }

        // Obter a URL pública
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        
        if (!publicUrlData) {
            throw new Error(`Não foi possível obter a URL pública para ${data.path}`);
        }

        return publicUrlData.publicUrl;
      };      // 3. Fazer upload das imagens, se houver novas
      let finalAvatarUrl = state.avatarUrl;
      if (avatarFile) {
        const avatarPath = `${user.id}/avatar_${Date.now()}`;
        finalAvatarUrl = await uploadImage(avatarFile, 'avatars', avatarPath);
      } else if (state.avatarUrl && state.avatarUrl.startsWith('blob:')) {
        // Se avatarUrl é uma blob URL mas não temos arquivo, usar avatar padrão
        console.warn('⚠️ Blob URL detectada sem arquivo correspondente, usando avatar padrão');
        finalAvatarUrl = '/avatars/perfilhomem1.png';
      }      let finalCoverImageUrl = state.coverImageUrl;
      if (coverImageFile) {
        const coverPath = `${user.id}/artwork_${Date.now()}`;
        finalCoverImageUrl = await uploadImage(coverImageFile, 'smartlink-artworks', coverPath);
      } else if (state.coverImageUrl && state.coverImageUrl.startsWith('blob:')) {
        // Se coverImageUrl é uma blob URL mas não temos arquivo, usar cover padrão
        console.warn('⚠️ Blob URL detectada para cover sem arquivo correspondente, removendo URL inválida');
        finalCoverImageUrl = '';
      }

      // 4. Preparar os dados para inserção
      const smartLinkData = {
        user_id: user.id,
        artist_name: state.artistName,
        artist_title: state.artistTitle,
        release_title: state.releaseTitle,
        bio: state.bio,
        avatar_url: finalAvatarUrl,
        cover_image_url: finalCoverImageUrl,
        player_url: state.playerUrl,
        platforms: state.platforms,
        social_links: state.socialLinks,
        contact_button_text: state.contactButtonText,
        contact_button_url: state.contactButtonUrl,
        slug: state.slug,
        template_id: state.template,
        // SEO
        title: state.seoTitle || state.releaseTitle,
        description: state.seoDescription || state.bio,
      };

      // DEBUG: Log dos dados antes de salvar
      console.log('🔍 DEBUG - Dados a serem salvos:', JSON.stringify(smartLinkData, null, 2));
      console.log('🔍 DEBUG - Platforms:', smartLinkData.platforms);
      console.log('🔍 DEBUG - Social Links:', smartLinkData.social_links);

      // 5. Inserir na tabela smart_links
      const { error: insertError } = await supabase
        .from('smart_links')
        .insert(smartLinkData);

      if (insertError) {
        throw insertError;
      }

      console.log('✅ Smart Link publicado com sucesso!');
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
      return true; // Sucesso

    } catch (error: any) {
      console.error('❌ Erro ao publicar o Smart Link:', error);
      setErrors({ form: `Erro ao publicar: ${error.message}` });
      dispatch({ type: ACTIONS.SET_SAVING, payload: false });
      return false; // Falha
    }
  }, [state, user, setErrors]);

  const value = useMemo(() => ({
    state,
    updateField,
    setStep,
    addPlatformLink,
    removePlatformLink,
    updatePlatformLink,
    addSocialLink,
    removeSocialLink,
    updateSocialLink,
    saveDraft: async () => { console.warn("saveDraft is deprecated"); }, // Placeholder for now
    loadDraft, // Use the implementation from above
    resetForm,
    setErrors,
    generateSlug,
    availablePlatforms: PLATFORMS,
    publishSmartLink,
  }), [state, updateField, setStep, addPlatformLink, removePlatformLink, updatePlatformLink, addSocialLink, removeSocialLink, updateSocialLink, loadDraft, resetForm, setErrors, generateSlug, publishSmartLink]);

  return (
    <SmartLinkFormContext.Provider value={value}>
      {children}
    </SmartLinkFormContext.Provider>
  );
};

// Hook para usar o contexto
export const useSmartLinkForm = () => {
  const context = useContext(SmartLinkFormContext);
  if (context === undefined) {
    throw new Error('useSmartLinkForm deve ser usado dentro de um SmartLinkFormProvider');
  }
  return context;
};
