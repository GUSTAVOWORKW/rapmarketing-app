// src/pages/CreateSmartLinkPage.tsx - REFATORADO com arquitetura multi-step
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { PlatformLink, SocialLink, ContactLink } from '../types';

// Context
import { SmartLinkFormProvider, useSmartLinkForm } from '../context/smartlink/SmartLinkFormContext';

// Steps
import ArtistInfoStep from '../components/smartlink/FormSteps/ArtistInfoStep';
import ReleaseInfoStep from '../components/smartlink/FormSteps/ReleaseInfoStep';
import PlatformLinksStep from '../components/smartlink/FormSteps/PlatformLinksStep';
import SocialLinksStep from '../components/smartlink/FormSteps/SocialLinksStep';
import ReviewStep from '../components/smartlink/FormSteps/ReviewStep';

// Components
import SmartLinkMobileView from '../components/smartlink/SmartLinkMobileView';
import SmartLinkMobilePreview from '../components/Common/SmartLinkMobilePreview';

// Icons
import { 
  FaUser, 
  FaMusic, 
  FaShareAlt, 
  FaUsers, 
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaArrowLeft,
  FaArrowRight,
  FaTimes
} from 'react-icons/fa';

// Configuração dos steps
const STEPS = [
  { 
    id: 1, 
    title: 'Artista', 
    description: 'Informações básicas',
    icon: FaUser,
    color: 'blue'
  },
  { 
    id: 2, 
    title: 'Lançamento', 
    description: 'Detalhes da música',
    icon: FaMusic,
    color: 'purple'
  },
  { 
    id: 3, 
    title: 'Plataformas', 
    description: 'Links de streaming',
    icon: FaShareAlt,
    color: 'green'
  },
  { 
    id: 4, 
    title: 'Social', 
    description: 'Redes sociais',
    icon: FaUsers,
    color: 'pink'
  },
  { 
    id: 5, 
    title: 'Publicar', 
    description: 'Revisão final',
    icon: FaEye,
    color: 'yellow'
  }
];

// Componente para indicador de progresso
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center transition-all duration-300 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}>
              {/* Ícone do step */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-500 shadow-green-200' 
                  : isActive 
                    ? `bg-${step.color}-500 shadow-${step.color}-200 ring-4 ring-${step.color}-200` 
                    : 'bg-gray-300'
              }`}>
                {isCompleted ? (
                  <FaCheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              
              {/* Título e descrição */}
              <div className="text-center mt-3 max-w-24">
                <div className={`font-semibold text-sm transition-colors duration-300 ${
                  isActive ? `text-${step.color}-600` : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 transition-colors duration-300 ${
                  isActive ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Linha conectora */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 mt-7 transition-colors duration-300 relative">
                <div className={`h-full transition-all duration-500 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                {/* Animação de progresso */}
                {isActive && !isCompleted && (
                  <div className="absolute top-0 left-0 h-full bg-blue-500 animate-pulse" style={{width: '30%'}} />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Componente interno que usa o contexto
const CreateSmartLinkPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { id: smartLinkId } = useParams();
  
  const { 
    state, 
    updateField, 
    setStep, 
    resetForm,
    setErrors,
    publishSmartLink,
    loadDraft,
    addStreamingLink,
    removeStreamingLink,
    updateStreamingLink,
    addContactLink,
    removeContactLink,
    updateContactLink,
  } = useSmartLinkForm();
  
  const { 
    currentStep, 
    errors, 
    isSaving, 
    isLoading, 
    artistName, 
    releaseTitle, 
    platforms, 
    avatarUrl, 
    coverImageUrl 
  } = state;

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePublish = async () => {
    const success = await publishSmartLink();
    if (success) {
      // Monta a URL final no formato correto
      const finalUrl = `${window.location.protocol}//${window.location.host}/${state.slug}`;
      
      // 1. Abre a nova aba com o smart link
      window.open(finalUrl, '_blank');
      
      // 2. Redireciona a aba atual para o dashboard
      navigate('/dashboard');
      
      // 3. Limpa o formulário para a próxima criação
      resetForm();
    }
  };

  // Efeito para carregar dados existentes se um ID for fornecido na URL
  useEffect(() => {
    if (smartLinkId) {
      loadDraft(smartLinkId);
    }
  }, [smartLinkId, loadDraft]);

  // Renderiza o step atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ArtistInfoStep />;
      case 2:
        return <ReleaseInfoStep />;
      case 3:
        return <PlatformLinksStep />;
      case 4:
        return <SocialLinksStep />;
      case 5:
        return <ReviewStep />;
      default:
        return <ArtistInfoStep />;
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!artistName?.trim();
      case 2:
        return !!releaseTitle?.trim();
      case 3:
        return platforms && platforms.some(platform => platform.url?.trim());
      case 4:
        return true; // Social links são opcionais
      case 5:
        return false; // Não há próximo step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && canGoNext()) {
      setStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  if (isLoading) {
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
      {/* Notificação */}
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

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {smartLinkId ? 'Editar Smart Link' : 'Criar Smart Link'}
            </h1>
            <p className="text-gray-600">
              Crie uma página única para compartilhar sua música em todas as plataformas
            </p>
          </div>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="bg-white py-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna do Formulário */}
          <div className="lg:col-span-2" style={{ zIndex: 1000, position: 'relative' }}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8">
              {renderCurrentStep()}

              {/* Botões de Navegação */}
              {currentStep < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                      currentStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg'
                    }`}
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={!canGoNext()}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                      !canGoNext()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    <span>Próximo</span>
                    <FaArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Botão de Publicação no último step */}
              {currentStep === 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={prevStep}
                    className="px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    onClick={handlePublish}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all duration-200 ${
                      isSaving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="w-4 h-4 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="w-4 h-4" />
                        <span>Publicar Smart Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Coluna do Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Preview ao Vivo
                </h3>
                
                <SmartLinkMobilePreview 
                  deviceColor="black" 
                  size="compact" 
                  showLabel={false}
                >
                  <SmartLinkMobileView />
                </SmartLinkMobilePreview>
                
                {/* Informações adicionais */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Dica</h4>
                  <p className="text-sm text-blue-700">
                    Suas alterações aparecem aqui em tempo real. Teste diferentes configurações para ver como ficará sua página.
                  </p>
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
const CreateSmartLinkPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, profile } = useAuth() as { user: User | null, loading: boolean, profile: any };

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
    <SmartLinkFormProvider userProfile={profile}>
      <CreateSmartLinkPageContent />
    </SmartLinkFormProvider>
  );
};

export default CreateSmartLinkPage;
