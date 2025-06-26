// hooks/presave/usePresaveForm.js - Corrigido baseado no CreateSmartLinkPage
import { useReducer, useCallback } from 'react';
import { supabase } from '../../services/supabase';

// Estado inicial
const initialState = {
  currentPresaveId: null,
  selectedTemplate: { id: 'holographic', name: 'Holográfico' },
  artistName: '',
  trackName: '',
  releaseDate: '',
  artworkUrl: '/assets/defaults/default-cover.png',
  artworkFile: null,
  templateBackgroundColor: '#000000',
  shareableSlug: '',
  platformLinks: [],
  socialLinks: [],
  platforms: {
    spotify: '',
    appleMusic: '',
    amazonMusic: '',
    tidal: '',
    youtubeMusic: '',
    youtube: '',
    deezer: '',
    soundcloud: ''
  },
  socialLinks_legacy: {
    instagram: '',
    facebook: '',
    twitter: '',
    threads: '',
  },
  contactLinks: {
    email: '',
    whatsapp: ''
  },
  currentStep: 1,
  stepValidation: { 1: false, 2: false, 3: false, 4: false, 5: false },
  isSubmitting: false,
  isLoadingData: false,
  isUploadingArtwork: false,
  submitMessage: '',
  showHelpModal: false,
  showWelcomeBanner: true,
  fieldFocus: null,
  validation: {
    artistName: true,
    trackName: true,
    releaseDate: true,
    platforms: {},
    socialLinks: {},
    contactLinks: {}
  }
};

const ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_PLATFORM_LINK: 'SET_PLATFORM_LINK',
  SET_SOCIAL_LINK: 'SET_SOCIAL_LINK',
  SET_CONTACT_LINK: 'SET_CONTACT_LINK',
  ADD_PLATFORM_LINK: 'ADD_PLATFORM_LINK',
  REMOVE_PLATFORM_LINK: 'REMOVE_PLATFORM_LINK',
  UPDATE_PLATFORM_LINK: 'UPDATE_PLATFORM_LINK',
  ADD_SOCIAL_LINK: 'ADD_SOCIAL_LINK',
  REMOVE_SOCIAL_LINK: 'REMOVE_SOCIAL_LINK',
  SET_ARTWORK: 'SET_ARTWORK',
  SET_STEP: 'SET_STEP',
  SET_VALIDATION: 'SET_VALIDATION',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_LOADING: 'SET_LOADING',
  SET_PRESAVE_ID: 'SET_PRESAVE_ID',
  RESET_FORM: 'RESET_FORM',
  LOAD_SAVED_DATA: 'LOAD_SAVED_DATA'
};

const presaveReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_FIELD:
      return { ...state, [action.field]: action.value };
    case ACTIONS.SET_PLATFORM_LINK:
      return { ...state, platforms: { ...state.platforms, [action.platform]: action.value } };
    case ACTIONS.SET_SOCIAL_LINK:
      return { ...state, socialLinks_legacy: { ...state.socialLinks_legacy, [action.platform]: action.value } };
    case ACTIONS.SET_CONTACT_LINK:
      return { ...state, contactLinks: { ...state.contactLinks, [action.platform]: action.value } };    case ACTIONS.ADD_PLATFORM_LINK:
      return { ...state, platformLinks: [...state.platformLinks, action.link] };    case ACTIONS.REMOVE_PLATFORM_LINK:
      console.log('🔥 REMOVE_PLATFORM_LINK - linkId:', action.linkId);
      console.log('📋 platformLinks antes:', state.platformLinks);
      const newPlatformLinks = state.platformLinks.filter(link => link.id !== action.linkId);
      console.log('📋 platformLinks depois:', newPlatformLinks);
      return { ...state, platformLinks: newPlatformLinks };
    case ACTIONS.UPDATE_PLATFORM_LINK:
      return { 
        ...state, 
        platformLinks: state.platformLinks.map(link => 
          link.id === action.linkId ? { ...link, ...action.updates } : link
        ) 
      };
    case ACTIONS.ADD_SOCIAL_LINK:
      return { ...state, socialLinks: [...state.socialLinks, action.link] };
    case ACTIONS.REMOVE_SOCIAL_LINK:
      return { ...state, socialLinks: state.socialLinks.filter(link => link.platform !== action.platform) };
    case ACTIONS.SET_ARTWORK:
      return { ...state, artworkFile: action.file, artworkUrl: action.url };
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.step };
    case ACTIONS.SET_VALIDATION:
      return { ...state, validation: { ...state.validation, [action.field]: action.isValid } };
    case ACTIONS.SET_SUBMITTING:
      return { ...state, isSubmitting: action.value };
    case ACTIONS.SET_LOADING:
      return { ...state, isLoadingData: action.value };
    case ACTIONS.SET_PRESAVE_ID:
      return { ...state, currentPresaveId: action.id };
    case ACTIONS.RESET_FORM:
      return { ...initialState, selectedTemplate: action.template || state.selectedTemplate };
    case ACTIONS.LOAD_SAVED_DATA:
      return { ...state, ...action.data };
    default:
      return state;
  }
};

export const usePresaveForm = (templates = []) => {
  const [state, dispatch] = useReducer(presaveReducer, {
    ...initialState,
    selectedTemplate: templates[0] || null
  });

  // Função para criar rascunho - Igual ao CreateSmartLinkPage
  const createDraft = useCallback(async (userId) => {
    try {
      const defaultReleaseDate = new Date();
      defaultReleaseDate.setMonth(defaultReleaseDate.getMonth() + 3);
      
      const payload = {
        user_id: userId,
        artist_name: '',
        track_name: '',
        release_date: defaultReleaseDate.toISOString(),
        artwork_url: '/assets/defaults/default-cover.png',
        template_id: 'holographic',
        status: 'draft',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('presaves')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar rascunho:', error);
        return null;
      }

      console.log('Rascunho criado:', data);
      return data.id;
    } catch (error) {
      console.error('Erro inesperado ao criar rascunho:', error);
      return null;
    }
  }, []);

  // Função para atualizar artwork - Baseada no CreateSmartLinkPage que funciona
  const saveArtworkUrl = useCallback(async (presaveId, artworkUrl) => {
    try {
      if (!presaveId) {
        console.log('⚠️ Nenhum presaveId fornecido');
        return false;
      }

      console.log('💾 Salvando artwork_url:', { presaveId, artworkUrl });

      // Usar o MESMO padrão do CreateSmartLinkPage que funciona perfeitamente
      const { data, error } = await supabase
        .from('presaves')
        .update({ 
          artwork_url: artworkUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', presaveId)
        .select();

      if (error) {
        console.error('❌ Erro ao salvar artwork_url:', error);
        return false;
      }

      console.log('✅ Artwork salva com sucesso:', data);
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      return false;
    }
  }, []);

  const actions = {
    setField: useCallback((field, value) => {
      dispatch({ type: ACTIONS.SET_FIELD, field, value });
    }, []),
    
    setPlatformLink: useCallback((platform, value) => {
      dispatch({ type: ACTIONS.SET_PLATFORM_LINK, platform, value });
    }, []),
    
    setSocialLink: useCallback((platform, value) => {
      dispatch({ type: ACTIONS.SET_SOCIAL_LINK, platform, value });
    }, []),
    
    setContactLink: useCallback((platform, value) => {
      dispatch({ type: ACTIONS.SET_CONTACT_LINK, platform, value });
    }, []),
    
    addPlatformLink: useCallback((link) => {
      dispatch({ type: ACTIONS.ADD_PLATFORM_LINK, link });
    }, []),      removePlatformLink: useCallback((linkId) => {
      dispatch({ type: ACTIONS.REMOVE_PLATFORM_LINK, linkId });
    }, []),
    
    updatePlatformLink: useCallback((linkId, updates) => {
      dispatch({ type: ACTIONS.UPDATE_PLATFORM_LINK, linkId, updates });
    }, []),
    
    addSocialLink: useCallback((link) => {
      dispatch({ type: ACTIONS.ADD_SOCIAL_LINK, link });
    }, []),
    
    removeSocialLink: useCallback((platform) => {
      dispatch({ type: ACTIONS.REMOVE_SOCIAL_LINK, platform });
    }, []),
      setArtwork: useCallback(async (file, url, userId = null) => {
      dispatch({ type: ACTIONS.SET_ARTWORK, file, url });
      
      // NÃO FAZER UPDATE AQUI - apenas no submit final
      console.log('🔄 Artwork atualizada no estado local:', { file: file?.name, url });
    }, []),
    
    setStep: useCallback((step) => {
      dispatch({ type: ACTIONS.SET_STEP, step });
    }, []),
    
    setValidation: useCallback((field, isValid) => {
      dispatch({ type: ACTIONS.SET_VALIDATION, field, isValid });
    }, []),
    
    setSubmitting: useCallback((value) => {
      dispatch({ type: ACTIONS.SET_SUBMITTING, value });
    }, []),
    
    setLoading: useCallback((value) => {
      dispatch({ type: ACTIONS.SET_LOADING, value });
    }, []),
    
    setPresaveId: useCallback((id) => {
      dispatch({ type: ACTIONS.SET_PRESAVE_ID, id });
    }, []),
    
    resetForm: useCallback((template = null) => {
      dispatch({ type: ACTIONS.RESET_FORM, template });
    }, [])
  };
  const validateStep = useCallback((stepNumber) => {
    switch (stepNumber) {
      case 1:
        return state.artistName.trim() && state.trackName.trim() && state.releaseDate;
      case 2:
        return true;
      case 3:
        return state.platformLinks.length > 0 && state.platformLinks.some(link => link.url.trim());
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  }, [state]);

  const canSubmit = useCallback(() => {
    return validateStep(1) && validateStep(3);
  }, [validateStep]);
  const submitPresave = useCallback(async () => {
    if (!canSubmit()) {
      throw new Error('Formulário incompleto');
    }

    try {
      actions.setSubmitting(true);
      
      // Se já existe um rascunho, ATUALIZAR ao invés de inserir novo
      if (state.currentPresaveId) {
        console.log('📝 Atualizando rascunho existente:', state.currentPresaveId);
          const updateData = {
          artist_name: state.artistName,
          track_name: state.trackName,
          release_date: state.releaseDate,
          artwork_url: state.artworkUrl, // Agora o artwork será salvo aqui!
          template_id: state.selectedTemplate?.id || 'holographic',
          platform_links: state.platformLinks.map(link => ({
            platform_id: link.platformId,
            platform_name: link.platformName,
            url: link.url,
            icon: link.icon,
            color: link.color
          })),
          status: 'published',
          updated_at: new Date().toISOString(),
          is_published: true
        };

        const { data, error } = await supabase
          .from('presaves')
          .update(updateData)
          .eq('id', state.currentPresaveId)
          .select()
          .single();

        if (error) throw error;
        return data;
        
      } else {
        // Fallback: criar novo se não houver rascunho
        console.log('📝 Criando novo presave');
          const presaveData = {
          artist_name: state.artistName,
          track_name: state.trackName,
          release_date: state.releaseDate,
          artwork_url: state.artworkUrl,
          template_id: state.selectedTemplate?.id || 'holographic',
          status: 'published',
          platform_links: state.platformLinks.map(link => ({
            platform_id: link.platformId,
            platform_name: link.platformName,
            url: link.url,
            icon: link.icon,
            color: link.color
          })),
          custom_colors: {
            background: state.templateBackgroundColor
          },
          is_published: true
        };

        const { data, error } = await supabase
          .from('presaves')
          .insert([presaveData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Erro ao submeter pré-save:', error);
      throw error;
    } finally {
      actions.setSubmitting(false);
    }
  }, [state, actions, canSubmit]);

  return {
    state,
    actions,
    validateStep,
    canSubmit,
    submitPresave,
    saveArtworkUrl,
    createDraft
  };
};
