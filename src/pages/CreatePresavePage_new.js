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

// Componente interno que usa o contexto
const CreatePresavePageContent = () => {
  const navigate = useNavigate();
  const { id: presaveId } = useParams();
  
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
  };

  // Local UI state
  const [submitStatus, setSubmitStatus] = useState(null);
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load existing presave if editing
  useEffect(() => {
    if (presaveId) {
      actions.loadDraft(presaveId);
    } else {
      // If no presaveId, but user is logged in, load default profile links
      actions.loadDraft(null); // This will use the userProfile prop in the context
    }
  }, [presaveId, actions]);

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
    const currentStepIndex = STEPS.findIndex(s => s.id === state.currentStep);
    if (currentStepIndex < STEPS.length - 1) {
      const nextStepId = STEPS[currentStepIndex + 1].id;
      goToStep(nextStepId);
    }
  };

  const prevStep = () => {
    const currentStepIndex = STEPS.findIndex(s => s.id === state.currentStep);
    if (currentStepIndex > 0) {
      const prevStepId = STEPS[currentStepIndex - 1].id;
      goToStep(prevStepId);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!canSubmit()) {
      showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    setSubmitStatus('submitting');
    
    try {
      const formData = {
        artistName: state.artistName,
        trackName: state.trackName,
        releaseDate: state.releaseDate,
        artworkUrl: state.artworkUrl,
        selectedTemplate: state.selectedTemplate,
        platformLinks: state.platformLinks,
        socialLinks: state.socialLinks,
        platforms: state.platforms,
        shareableSlug: state.shareableSlug || `${state.artistName}-${state.trackName}`.toLowerCase().replace(/\s+/g, '-')
      };

      console.log('Enviando dados do presave:', formData);
      
      // Chamar serviço de save
      const result = await savePresave(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        showNotification('Pré-Save criado com sucesso!', 'success');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro ao salvar pré-save');
      }
    } catch (error) {
      console.error('Erro ao criar presave:', error);
      setSubmitStatus('error');
      showNotification(error.message || 'Erro ao criar pré-save', 'error');
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <BasicInfoStep
            templates={templates}
            onDataChange={actions.updateField}
            onValidationChange={(isValid) => actions.setValidation(1, isValid)}
            artistName={state.artistName}
            trackName={state.trackName}
            releaseDate={state.releaseDate}
            selectedTemplate={state.selectedTemplate}
          />
        );
      
      case 2:
        return (
          <ArtworkUploadStep
            artworkUrl={state.artworkUrl}
            artworkFile={state.artworkFile}
            onArtworkChange={actions.setArtwork}
            onValidationChange={(isValid) => actions.setValidation(2, isValid)}
            isUploading={state.isUploadingArtwork}
          />
        );
      
      case 3:
        return (
          <PlatformLinksStep
            platformLinks={state.platformLinks}
            platforms={state.platforms}
            onPlatformLinkAdd={actions.addPlatformLink}
            onPlatformLinkRemove={actions.removePlatformLink}
            onPlatformLinkUpdate={actions.updatePlatformLink}
            onStreamingLinkAdd={actions.addStreamingLink}
            onStreamingLinkRemove={actions.removeStreamingLink}
            onStreamingLinkUpdate={actions.updateStreamingLink}
            streamingLinks={state.streamingLinks}
            onLegacyPlatformUpdate={(platform, url) => {
              actions.updateField('platforms', { ...state.platforms, [platform]: url });
            }}
            onValidationChange={(isValid) => actions.setValidation(3, isValid)}
          />
        );
      
      case 4:
        return (
          <SocialLinksStep
            socialLinks={state.socialLinks}
            onSocialLinkAdd={actions.addSocialLink}
            onSocialLinkRemove={actions.removeSocialLink}
            onValidationChange={(isValid) => actions.setValidation(4, isValid)}
          />
        );
      
      case 5:
        return (
          <FinalPreviewStep
            state={state}
            templates={templates}
            onSubmit={handleSubmit}
            submitStatus={submitStatus}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  // Show loading state
  if (state.isLoadingData) {
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
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
                      : state.currentStep > step.id || validateStep(step.id)
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      state.currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : state.currentStep > step.id || validateStep(step.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {state.currentStep > step.id || validateStep(step.id) ? (
                      <FaCheckCircle className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form content */}
          <div className="lg:col-span-2">
            <ErrorBoundary>
              {renderStepContent()}
            </ErrorBoundary>

            {/* Navigation buttons */}
            {state.currentStep !== 5 && (
              <div className="flex justify-between mt-8">
                <button
                  onClick={prevStep}
                  disabled={state.currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                    state.currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 transition-colors'
                  }`}
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <button
                  onClick={nextStep}
                  disabled={!validateStep(state.currentStep)}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                    !validateStep(state.currentStep)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
                  }`}
                >
                  <span>Próximo</span>
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Preview sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`p-2 rounded ${
                        previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {state.selectedTemplate && (
                  <div className="mb-4">
                    <SmartLinkMobilePreview
                      data={{
                        artistName: state.artistName,
                        trackName: state.trackName,
                        artworkUrl: state.artworkUrl,
                        platformLinks: state.platformLinks,
                        socialLinks: state.socialLinks,
                        templateId: state.selectedTemplate?.id
                      }}
                      template={state.selectedTemplate}
                    />
                  </div>
                )}

                {/* Data summary */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="font-medium text-gray-900 mb-2">Dados:</div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal que gerencia auth e provider
const CreatePresavePage = () => {
  const navigate = useNavigate();
  
  // Auth
  const { user, loading: authLoading, profile } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate]);

  // Show loading state
  if (authLoading || !user || !profile) {
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
      <CreatePresavePageContent />
    </PresaveFormProvider>
  );
};

export default CreatePresavePage;
