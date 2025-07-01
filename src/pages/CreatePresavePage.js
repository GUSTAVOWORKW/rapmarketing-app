// pages/CreatePresavePage.js - Versão com Context API
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Context para estado persistente
import { PresaveFormProvider, usePresaveFormContext } from '../context/presave/PresaveFormContext';

// Custom hooks e services
import { useAuth } from '../hooks/useAuth';
import { savePresave } from '../services/presaveService';

// Componentes refatorados
import BasicInfoStep from '../components/presave/FormSteps/BasicInfoStep';
import ArtworkUploadStep from '../components/presave/FormSteps/ArtworkUploadStep';
import PlatformLinksStep from '../components/presave/FormSteps/PlatformLinksStep';
import SocialLinksStep from '../components/presave/FormSteps/SocialLinksStep';
import FinalPreviewStep from '../components/presave/FormSteps/FinalPreviewStep';
import TemplatePreview from '../components/presave/TemplatePreview';
import SmartLinkMobilePreview from '../components/Common/SmartLinkMobilePreview';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Ícones
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes
} from 'react-icons/fa';

// Debug logs removidos para evitar problemas em produção

// Templates disponíveis
const templates = [
  { id: 'holographic', name: 'Trap Future', description: 'Holograma futurista com efeitos trap' },
  { id: 'minimalist', name: 'Repente Rústico', description: 'A poesia da rua com a força do sertão - xilogravura digital' },
  { id: 'street-holo', name: 'Ritmo da D17', description: 'Bailes de rua de SP - energia visceral dos rolês da quebrada' },
  { id: 'neon-glow', name: 'Cyberpunk Trap', description: 'Neon cyber para trap e hip-hop' },
  { id: 'vintage-vinyl', name: 'Old School', description: 'Retrô vinil para rap clássico' },
  { id: 'modern-card', name: 'Funk Moderno', description: 'Baile funk no pôr do sol carioca com energia vibrante' },
  { id: 'noite-carioca', name: 'Noite Carioca', description: 'A ambição, a rua e a melancolia - visual cinematográfico noturno' },
];

// Configuração dos steps
const STEPS = [
  { id: 1, title: 'Informações Básicas', description: 'Nome, data e template' },
  { id: 2, title: 'Capa', description: 'Upload da artwork' },
  { id: 3, title: 'Plataformas', description: 'Links de streaming' },
  { id: 4, title: 'Redes Sociais', description: 'Perfis sociais (opcional)' },
  { id: 5, title: 'Preview', description: 'Visualização final' },
];

// Main component - agora usa contexto diretamente
const CreatePresavePage = () => {
  const navigate = useNavigate();
  const { id: presaveId } = useParams();
  
  // Auth
  const { user, loading: authLoading, profile } = useAuth();
  
  // Local state
  const [previewMode, setPreviewMode] = useState('mobile');
  
  // Context state (substitui usePresaveForm)
  const { state, actions } = usePresaveFormContext();
  
  // Implementar funções que estavam no usePresaveForm
  const validateStep = (step) => {
    // Implementação simplificada de validação
    switch (step) {
      case 1:
        return !!(state.artistName && state.trackName && state.releaseDate && state.selectedTemplate);
      case 2:
        return !!state.artworkUrl;
      case 3:
        return state.platformLinks.length > 0 || Object.values(state.platforms).some(url => url.trim());
      case 4:
        return true; // Redes sociais são opcionais
      default:
        return false;
    }
  };
  const canSubmit = () => {
    return validateStep(1) && validateStep(2) && validateStep(3);
  };
  
  const createDraft = async (userId) => {
    // TODO: Implementar criação de draft real
    return 'draft-' + Date.now();
  };// FIXME: useEffect problemático temporariamente desabilitado
  // Criar rascunho inicial quando usuário entra na página
  /* 
  useEffect(() => {
    // Lógica de criação de rascunho desabilitada temporariamente
    // para resolver problema de múltiplas criações
  }, []); 
  */  // Local UI state
  const [submitStatus, setSubmitStatus] = useState(null);
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);
  // Load existing presave if editing
  useEffect(() => {
    if (user && profile) { // Ensure user and profile are available
      if (presaveId) {
        actions.loadDraft(presaveId);
      } else {
        // If no presaveId, but user is logged in, load default profile links
        actions.loadDraft(null); // This will use the userProfile prop in the context
      }
    }
  }, [presaveId, user, profile, actions]);

  // Cleanup quando sair da página
  useEffect(() => {
    return () => {
      // Limpar estado de submissão quando sair da página
      if (submitStatus !== null) {
        setSubmitStatus(null);
      }
    };
  }, [submitStatus]);

  // Navigation functions
  const goToStep = (step) => {
    if (step >= 1 && step <= STEPS.length) {
      actions.setStep(step);
    }
  };

  const nextStep = () => {
    if (state.currentStep < STEPS.length) {
      actions.setStep(state.currentStep + 1);
    }
  };
  const prevStep = () => {
    if (state.currentStep > 1) {
      actions.setStep(state.currentStep - 1);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!canSubmit()) {
      showNotification('Preencha todos os campos obrigatórios', 'error');
      return;
    }

    try {
      setSubmitStatus('submitting');
      
      // Salvar pré-save no Supabase
      const result = await savePresave(state, user.id);
      
      setSubmitStatus('success');
      
      // Atualizar contexto com ID gerado
      actions.setPresaveId(result.id);
      
      // Limpar draft após publicação bem-sucedida
      actions.clearDraft();
        // Copiar link para clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(result.url);
        showNotification(`Pré-save publicado! Link copiado para área de transferência.`, 'success');
      } else {
        showNotification(`Pré-save publicado! Link: ${result.url}`, 'success');
      }
      
      // Abrir o pré-save publicado em nova aba
      window.open(result.url, '_blank');
      
      setTimeout(() => {
        // Redirecionar direto para o dashboard
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      showNotification(error.message || 'Erro ao criar pré-save', 'error');
    }
  };// Render step content
  const renderStepContent = () => {    
    switch (state.currentStep) {
      case 1:
        return (
          <BasicInfoStep />
        );
      
      case 2:
        return (
          <ArtworkUploadStep userId={user?.id} />
        );
      
      case 3:
        return (
          <PlatformLinksStep />
        );
      
      case 4:
        return (
          <SocialLinksStep />
        );        case 5:
        return (
          <FinalPreviewStep 
            onSubmit={handleSubmit}
            submitStatus={submitStatus}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  // Show loading state
  if (authLoading || !user || !profile || state.isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  return (
    <PresaveFormProvider userProfile={profile}>
      <div className="min-h-screen bg-gray-50">
      {/* Notificação personalizada */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white p-4 rounded-lg shadow-lg flex items-center justify-between`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FaCheckCircle className="mr-3 text-lg" />
            ) : (
              <FaExclamationTriangle className="mr-3 text-lg" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="ml-3 text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {presaveId ? 'Editar Pré-Save' : 'Criar Novo Pré-Save'}
          </h1>
          <p className="text-gray-600">
            Configure sua campanha de pré-save em poucos passos
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center space-x-2 cursor-pointer ${
                    state.currentStep === step.id
                      ? 'text-blue-600'
                      : state.currentStep > step.id
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      state.currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : state.currentStep > step.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {state.currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="hidden md:block">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>        {/* Main content with improved responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8">
          {/* Form section - Takes more space */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <ErrorBoundary>
                {renderStepContent()}
              </ErrorBoundary>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={prevStep}
                  disabled={state.currentStep === 1}
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaArrowLeft className="mr-2" />
                  Anterior
                </button>

                {state.currentStep < STEPS.length && (
                  <button
                    onClick={nextStep}
                    disabled={!validateStep(state.currentStep)}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    Próximo
                    <FaArrowRight className="ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>          {/* Preview section - Positioned to the right */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaEye className="mr-2 text-blue-600" />
                  Preview
                </h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {state.selectedTemplate?.name || 'Nenhum template'}
                </div>
              </div>

              {/* Preview mode selector - Mobile/Desktop toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-lg p-1 flex">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📱 Mobile
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    🖥️ Desktop
                  </button>
                </div>
              </div>

              <ErrorBoundary
                fallback={(error) => (
                  <div className="h-96 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">Erro no preview</p>
                      <p className="text-sm text-gray-500">{error?.message}</p>
                    </div>
                  </div>
                )}
              >
                {state.selectedTemplate ? (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {previewMode === 'mobile' ? (
                      <SmartLinkMobilePreview>
                        <TemplatePreview
                          templateId={state.selectedTemplate.id}
                          formState={state}
                          isMobilePreview={true}
                        />
                      </SmartLinkMobilePreview>
                    ) : (
                      <div className="max-w-sm mx-auto">
                        <TemplatePreview
                          templateId={state.selectedTemplate.id}
                          formState={state}
                          isMobilePreview={false}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <FaEye className="text-4xl text-gray-400 mb-2 mx-auto" />
                      <p className="text-gray-500 text-sm">Selecione um template para ver o preview</p>
                    </div>
                  </div>
                )}
              </ErrorBoundary>

              {/* Quick Info Panel */}
              {state.selectedTemplate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Informações Rápidas</h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    {state.artistName && (
                      <div><span className="font-medium">Artista:</span> {state.artistName}</div>
                    )}
                    {state.trackName && (
                      <div><span className="font-medium">Música:</span> {state.trackName}</div>
                    )}
                    {state.releaseDate && (
                      <div><span className="font-medium">Lançamento:</span> {new Date(state.releaseDate).toLocaleDateString('pt-BR')}</div>
                    )}
                    {state.platformLinks && state.platformLinks.length > 0 && (
                      <div><span className="font-medium">Plataformas:</span> {state.platformLinks.length}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PresaveFormProvider>
  );
};

export default CreatePresavePage;
