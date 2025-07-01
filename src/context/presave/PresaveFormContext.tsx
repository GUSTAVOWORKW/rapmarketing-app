// context/presave/PresaveFormContext.tsx - Context para estado persistente do formulário
import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase'; // Import supabase client

// Tipos
interface PresaveFormState {
  // IDs e metadados
  currentPresaveId: string | null;
  lastSavedAt: string | null;
  
  // Template e design
  selectedTemplate: { id: string; name: string } | null;
  templateBackgroundColor: string;
    // Informações básicas
  artistName: string;
  trackName: string;
  releaseDate: string;
  shareableSlug: string;
  
  // Artwork
  artworkUrl: string;
  artworkFile: File | null;
  
  // Links estruturados
  platformLinks: Array<{
    id: string;
    platform_id: string;
    url: string;
    name: string;
    icon_url?: string;
    brand_color?: string;
  }>;
  socialLinks: Array<{
    platform: string;
    platformName: string;
    url: string;
    color: string;
  }>;
  
  streamingLinks: Array<{
    id: string;
    platform_id: string;
    url: string;
    name: string;
    icon_url?: string;
    brand_color?: string;
  }>;
  
  // Links legados (para compatibilidade)
  platforms: {
    spotify: string;
    appleMusic: string;
    amazonMusic: string;
    tidal: string;
    youtubeMusic: string;
    youtube: string;
    deezer: string;
    soundcloud: string;
  };
  
  // Controle de navegação
  currentStep: number;
  stepValidation: { [key: number]: boolean };
  
  // Estados de carregamento
  isSubmitting: boolean;
  isLoadingData: boolean;
  isUploadingArtwork: boolean;
  
  // UI states
  showHelpModal: boolean;
  submitMessage: string;
}

interface PresaveFormActions {
  // Ações básicas
  updateField: (field: string, value: any) => void;
  setStep: (step: number) => void;
  setValidation: (step: number, isValid: boolean) => void;
  
  // Ações de plataformas
  addPlatformLink: (link: any) => void;
  removePlatformLink: (linkId: string) => void;
  updatePlatformLink: (linkId: string, updates: any) => void;
  
  // Ações de redes sociais
  addSocialLink: (link: any) => void;
  removeSocialLink: (platform: string) => void;
  addStreamingLink: (link: any) => void;
  removeStreamingLink: (linkId: string) => void;
  updateStreamingLink: (linkId: string, updates: any) => void;
  
  // Ações de artwork
  setArtwork: (file: File | null, url: string, userId?: string) => void;
  
  // Persistência
  saveToStorage: () => void;
  loadFromStorage: () => void;
  loadDraft: (id: string) => Promise<void>;
  clearDraft: () => void;
  
  // Estados de carregamento
  setSubmitting: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setPresaveId: (id: string) => void;
}

interface PresaveFormContextValue {
  state: PresaveFormState;
  actions: PresaveFormActions;
}

// Estado inicial
const initialState: PresaveFormState = {
  currentPresaveId: null,
  lastSavedAt: null,
  selectedTemplate: { id: 'holographic', name: 'Trap Future' },
  templateBackgroundColor: '#000000',  artistName: '',
  trackName: '',
  releaseDate: '',
  shareableSlug: '',
  artworkUrl: '/assets/defaults/default-cover.png',
  artworkFile: null,
  platformLinks: [],
  socialLinks: [],
  streamingLinks: [],
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
  currentStep: 1,
  stepValidation: { 1: false, 2: false, 3: false, 4: false, 5: false },
  isSubmitting: false,
  isLoadingData: false,
  isUploadingArtwork: false,
  showHelpModal: false,
  submitMessage: ''
};

// Action types
const ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  SET_STEP: 'SET_STEP',
  SET_VALIDATION: 'SET_VALIDATION',
  ADD_PLATFORM_LINK: 'ADD_PLATFORM_LINK',
  REMOVE_PLATFORM_LINK: 'REMOVE_PLATFORM_LINK',
  UPDATE_PLATFORM_LINK: 'UPDATE_PLATFORM_LINK',
  ADD_SOCIAL_LINK: 'ADD_SOCIAL_LINK',
  REMOVE_SOCIAL_LINK: 'REMOVE_SOCIAL_LINK',
  ADD_STREAMING_LINK: 'ADD_STREAMING_LINK',
  REMOVE_STREAMING_LINK: 'REMOVE_STREAMING_LINK',
  UPDATE_STREAMING_LINK: 'UPDATE_STREAMING_LINK',
  SET_SUBMITTING: 'SET_SUBMITTING',
  SET_LOADING: 'SET_LOADING',
  SET_PRESAVE_ID: 'SET_PRESAVE_ID',
  LOAD_DRAFT: 'LOAD_DRAFT',
  RESET_FORM: 'RESET_FORM'
} as const;

// Reducer
const presaveFormReducer = (state: PresaveFormState, action: any): PresaveFormState => {
  switch (action.type) {
    case ACTIONS.UPDATE_FIELD:
      return { ...state, [action.field]: action.value };
      
    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.step };
      
    case ACTIONS.SET_VALIDATION:
      return { 
        ...state, 
        stepValidation: { ...state.stepValidation, [action.step]: action.isValid } 
      };
      
    case ACTIONS.ADD_PLATFORM_LINK:
      return { 
        ...state, 
        platformLinks: [...state.platformLinks, action.link] 
      };
      
    case ACTIONS.REMOVE_PLATFORM_LINK:
      return { 
        ...state, 
        platformLinks: state.platformLinks.filter(link => link.id !== action.linkId) 
      };
      
    case ACTIONS.UPDATE_PLATFORM_LINK:
      return { 
        ...state, 
        platformLinks: state.platformLinks.map(link => 
          link.id === action.linkId ? { ...link, ...action.updates } : link
        ) 
      };
      
    case ACTIONS.ADD_SOCIAL_LINK:
      return { 
        ...state, 
        socialLinks: [...state.socialLinks, action.link] 
      };
      
    case ACTIONS.REMOVE_SOCIAL_LINK:
      return { 
        ...state, 
        socialLinks: state.socialLinks.filter(link => link.platform !== action.platform) 
      };

    case ACTIONS.ADD_STREAMING_LINK:
      return {
        ...state,
        streamingLinks: [...state.streamingLinks, action.link]
      };

    case ACTIONS.REMOVE_STREAMING_LINK:
      return {
        ...state,
        streamingLinks: state.streamingLinks.filter(link => link.id !== action.linkId)
      };

    case ACTIONS.UPDATE_STREAMING_LINK:
      return {
        ...state,
        streamingLinks: state.streamingLinks.map(link =>
          link.id === action.linkId ? { ...link, ...action.updates } : link
        )
      };
      
    case ACTIONS.SET_SUBMITTING:
      return { ...state, isSubmitting: action.value };
      
    case ACTIONS.SET_LOADING:
      return { ...state, isLoadingData: action.value };
      
    case ACTIONS.SET_PRESAVE_ID:
      return { ...state, currentPresaveId: action.id };
      
    case ACTIONS.LOAD_DRAFT:
      return { 
        ...state, 
        ...action.data,
        // Preservar File objects que não podem ser serializados
        artworkFile: null 
      };
      
    case ACTIONS.RESET_FORM:
      return { ...initialState, selectedTemplate: action.template || initialState.selectedTemplate };
      
    default:
      return state;
  }
};

// Contexto
const PresaveFormContext = createContext<PresaveFormContextValue | null>(null);

// Storage key
const STORAGE_KEY = 'presave_form_draft_v2';

// Provider
export const PresaveFormProvider: React.FC<{ children: React.ReactNode; userProfile: any }> = ({ children, userProfile }) => {
  const [state, dispatch] = useReducer(presaveFormReducer, initialState);
  // Auto-save no localStorage com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const draftData = {
          ...state,
          lastSavedAt: new Date().toISOString(),
          // Não salvar File objects
          artworkFile: null
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error('❌ Erro ao salvar draft:', error);
      }
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [state]);  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        dispatch({ type: ACTIONS.LOAD_DRAFT, data });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar draft:', error);
    }
  }, []);

  // Actions
  const actions: PresaveFormActions = {
    updateField: useCallback((field: string, value: any) => {
      dispatch({ type: ACTIONS.UPDATE_FIELD, field, value });
    }, []),

    setStep: useCallback((step: number) => {
      dispatch({ type: ACTIONS.SET_STEP, step });
    }, []),

    setValidation: useCallback((step: number, isValid: boolean) => {
      dispatch({ type: ACTIONS.SET_VALIDATION, step, isValid });
    }, []),

    addPlatformLink: useCallback((link: any) => {
      dispatch({ type: ACTIONS.ADD_PLATFORM_LINK, link });
    }, []),

    removePlatformLink: useCallback((linkId: string) => {
      dispatch({ type: ACTIONS.REMOVE_PLATFORM_LINK, linkId });
    }, []),

    updatePlatformLink: useCallback((linkId: string, updates: any) => {
      dispatch({ type: ACTIONS.UPDATE_PLATFORM_LINK, linkId, updates });
    }, []),

    addSocialLink: useCallback((link: any) => {
      dispatch({ type: ACTIONS.ADD_SOCIAL_LINK, link });
    }, []),    removeSocialLink: useCallback((platform: string) => {
      dispatch({ type: ACTIONS.REMOVE_SOCIAL_LINK, platform });
    }, []),

    addStreamingLink: useCallback((link: any) => {
      dispatch({ type: ACTIONS.ADD_STREAMING_LINK, link });
    }, []),

    removeStreamingLink: useCallback((linkId: string) => {
      dispatch({ type: ACTIONS.REMOVE_STREAMING_LINK, linkId });
    }, []),

    updateStreamingLink: useCallback((linkId: string, updates: any) => {
      dispatch({ type: ACTIONS.UPDATE_STREAMING_LINK, linkId, updates });
    }, []),

    setArtwork: useCallback((file: File | null, url: string, userId?: string) => {
      dispatch({ 
        type: ACTIONS.UPDATE_FIELD, 
        field: 'artworkFile', 
        value: file 
      });
      dispatch({ 
        type: ACTIONS.UPDATE_FIELD, 
        field: 'artworkUrl', 
        value: url 
      });
    }, []),    saveToStorage: useCallback(() => {
      try {
        const draftData = {
          ...state,
          lastSavedAt: new Date().toISOString(),
          artworkFile: null
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
      } catch (error) {
        console.error('❌ Erro ao salvar draft:', error);
      }
    }, [state]),

    loadFromStorage: useCallback(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          dispatch({ type: ACTIONS.LOAD_DRAFT, data });
        }
      } catch (error) {
        console.error('❌ Erro ao carregar draft:', error);
      }
    }, []),    loadDraft: useCallback(async (id: string) => {
    dispatch({ type: ACTIONS.SET_LOADING, value: true });
    try {
      let presaveData = null;
      let profileData = null;

      if (id) {
        // Try to load existing presave
        const { data, error } = await supabase
          .from('presaves')
          .select('*')
          .eq('id', id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found'
          throw error;
        }
        presaveData = data;
      }

      // Use userProfile passed as prop for default links
      if (userProfile) {
        profileData = userProfile;
        console.log('[PresaveFormContext] userProfile recebido:', userProfile);
        console.log('[PresaveFormContext] streaming_links no userProfile:', userProfile.streaming_links);
        console.log('[PresaveFormContext] social_links no userProfile:', userProfile.social_links);
      } else {
        console.warn("PresaveFormContext: userProfile not provided, cannot load default links.");
      }

      const finalData = {
        currentPresaveId: presaveData?.id || null,
        artistName: presaveData?.artist_name || '',
        trackName: presaveData?.track_name || '',
        releaseDate: presaveData?.release_date || '',
        shareableSlug: presaveData?.shareable_slug || '',
        artworkUrl: presaveData?.artwork_url || '/assets/defaults/default-cover.png',
        platformLinks: presaveData?.platform_links || profileData?.streaming_links || [],
        socialLinks: presaveData?.social_links || profileData?.social_links || [],
        selectedTemplate: presaveData?.template_id ? { id: presaveData.template_id, name: presaveData.template_id } : initialState.selectedTemplate,
        // ... other fields from presaveData
      };

      dispatch({ type: ACTIONS.LOAD_DRAFT, data: finalData });

    } catch (error) {
      console.error('Erro ao carregar rascunho/perfil do Supabase:', error);
      // Optionally set an error state in the context
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, value: false });
    }
  }, [userProfile]),    clearDraft: useCallback(() => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: ACTIONS.RESET_FORM, template: null });
      } catch (error) {
        console.error('❌ Erro ao limpar draft:', error);
      }
    }, []),

    setSubmitting: useCallback((value: boolean) => {
      dispatch({ type: ACTIONS.SET_SUBMITTING, value });
    }, []),

    setLoading: useCallback((value: boolean) => {
      dispatch({ type: ACTIONS.SET_LOADING, value });
    }, []),

    setPresaveId: useCallback((id: string) => {
      dispatch({ type: ACTIONS.SET_PRESAVE_ID, id });
    }, [])
  };

  const contextValue: PresaveFormContextValue = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <PresaveFormContext.Provider value={contextValue}>
      {children}
    </PresaveFormContext.Provider>
  );
};

// Hook para usar o contexto
export const usePresaveFormContext = (): PresaveFormContextValue => {
  const context = useContext(PresaveFormContext);
  if (!context) {
    throw new Error('usePresaveFormContext deve ser usado dentro de PresaveFormProvider');
  }
  return context;
};

// Alias para compatibilidade
export const usePresaveForm = (): PresaveFormContextValue => {
  const context = useContext(PresaveFormContext);
  if (!context) {
    throw new Error('usePresaveForm deve ser usado dentro de PresaveFormProvider');
  }
  return context;
};

export default PresaveFormContext;
