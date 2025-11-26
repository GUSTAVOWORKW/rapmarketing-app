// context/presave/PresaveFormContext.tsx - Context para estado do formulário (SEM localStorage)
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

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
  }>;  socialLinks: Array<{
    platform: string;
    platformName: string;
    url: string;
    color: string;
  }>;
  contactLinks: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
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
  
  // Ações de artwork
  setArtwork: (file: File | null, url: string, userId?: string) => void;
  
  // Persistência
  saveToStorage: () => void;
  loadFromStorage: () => void;
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
  contactLinks: [],
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

// Provider - SEM localStorage, dados apenas em memória durante a sessão
export const PresaveFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(presaveFormReducer, initialState);
  
  // Limpar localStorage antigo (migração única)
  useEffect(() => {
    try {
      localStorage.removeItem('presave_form_draft_v1');
      localStorage.removeItem('presave_form_draft_v2');
      localStorage.removeItem('presave_form_draft_v3');
    } catch {}
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
    }, []),

    // Funções mantidas para compatibilidade, mas agora são no-op
    saveToStorage: useCallback(() => {
      // Não faz nada - dados mantidos apenas em memória
    }, []),

    loadFromStorage: useCallback(() => {
      // Não faz nada - dados mantidos apenas em memória
    }, []),

    clearDraft: useCallback(() => {
      // Reseta o formulário em memória
      dispatch({ type: ACTIONS.RESET_FORM, template: null });
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

  const contextValue: PresaveFormContextValue = {
    state,
    actions
  };

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
