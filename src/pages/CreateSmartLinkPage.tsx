// src/pages/CreateSmartLinkPage.tsx - REFATORADO com arquitetura multi-step
import React, { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { PlatformLink, SocialLink } from '../types'; // Importar tipos

// Context
import { useSmartLinkForm } from '../context/smartlink/SmartLinkFormContext';

// Steps
import ArtistInfoStep from '../components/smartlink/FormSteps/ArtistInfoStep';
import ReleaseInfoStep from '../components/smartlink/FormSteps/ReleaseInfoStep';
import PlatformLinksStep from '../components/smartlink/FormSteps/PlatformLinksStep';
import SocialLinksStep from '../components/smartlink/FormSteps/SocialLinksStep';
import ReviewStep from '../components/smartlink/FormSteps/ReviewStep';

// Components
// import SmartLinkPreview from '../components/smartlink/SmartLinkPreview'; // Removido - não está sendo usado
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
    description: 'Música e capa',
    icon: FaMusic,
    color: 'green'
  },
  { 
    id: 3, 
    title: 'Plataformas', 
    description: 'Links de streaming',
    icon: FaShareAlt,
    color: 'purple'
  },
  { 
    id: 4, 
    title: 'Redes Sociais', 
    description: 'Perfis e contato',
    icon: FaUsers,
    color: 'pink'
  },
  { 
    id: 5, 
    title: 'Revisão', 
    description: 'Finalizar',
    icon: FaEye,
    color: 'indigo'
  },
];

// Step indicator component
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const IconComponent = step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center flex-shrink-0 relative">
              {/* Círculo do step */}
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10
                ${isCompleted 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : isActive 
                    ? 'bg-blue-500 text-white shadow-xl scale-110 ring-4 ring-blue-200'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }
              `}>
                {isCompleted ? (
                  <FaCheckCircle size={22} />
                ) : (
                  <IconComponent size={22} />
                )}
                
                {/* Pulso animado para step ativo */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                )}
              </div>
              
              {/* Título e descrição */}
              <div className="mt-3 max-w-[80px]">
                <div className={`text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">
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

// Componente principal da página
const CreateSmartLinkPage: React.FC = () => {
  console.log('DEBUG: CreateSmartLinkPage renderizou');

  const navigate = useNavigate();
  const { id: smartLinkId } = useParams();  const { user, loading: authLoading } = useAuth() as { user: User | null, loading: boolean };
  
  const { 
    state, 
    updateField, 
    setStep, 
    resetForm,
    setErrors,
    publishSmartLink,
    loadDraft, // Adicionar loadDraft aqui
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
    // Se não houver sucesso, o erro já foi setado no contexto e será exibido no ReviewStep
  };

  // Efeito para carregar dados existentes se um ID for fornecido na URL
  useEffect(() => {
    if (smartLinkId && user) {
      loadDraft(smartLinkId);
    }
  }, [smartLinkId, user, loadDraft]);

  // Efeito para redirecionar se o usuário não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  // Memoizar dependências complexas para o useEffect de validação
  const platformUrls = useMemo(() => JSON.stringify(platforms.map(p => p.url)), [platforms]);

  // Efeito para validar o formulário sempre que os dados relevantes mudam
  useEffect(() => {
    // Validação básica pode ser feita aqui se necessário
    const validationErrors: { [key: string]: string } = {};
    
    if (!artistName.trim()) {
      validationErrors.artistName = 'Nome do artista é obrigatório';
    }
    
    if (!releaseTitle.trim()) {
      validationErrors.releaseTitle = 'Título do lançamento é obrigatório';
    }
    
    setErrors(validationErrors);
  }, [artistName, releaseTitle, platformUrls, avatarUrl, coverImageUrl, setErrors]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    }
  };

  const canSubmit = () => {
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {      showNotification('Por favor, corrija os erros antes de continuar.', 'error');
      // Destacar campos com erro, se possível
      const firstErrorField = Object.keys(errors)[0];
      const errorStep = STEPS.find(s => {
        if (firstErrorField === 'artistName' || firstErrorField === 'avatarUrl') return s.id === 1;
        if (firstErrorField === 'releaseTitle' || firstErrorField === 'coverImageUrl') return s.id === 2;
        if (firstErrorField === 'platforms') return s.id === 3;
        return false;
      });
      if (errorStep) {
        setStep(errorStep.id);
      }
      return;
    }

    if (!user) {
      showNotification('Você precisa estar logado para salvar.', 'error');
      return;
    }

    updateField('isSaving', true);

    try {
      // Garante que o slug seja gerado se não existir
      const slug = state.slug || `${state.artistName.toLowerCase().replace(/\s+/g, '-')}-${state.releaseTitle.toLowerCase().replace(/\s+/g, '-')}`;

      const smartLinkData = {
        id: state.currentSmartLinkId || undefined,
        user_id: (user as any).id,
        artist_name: state.artistName,
        artist_title: state.artistTitle,
        avatar_url: state.avatarUrl,
        bio: state.bio,
        release_title: state.releaseTitle,
        feat: state.feat,
        cover_image_url: state.coverImageUrl,
        player_url: state.playerUrl,
        platforms: state.platforms.filter(p => p.url), // Tipagem inferida pelo TS
        social_links: state.socialLinks.filter(s => s.url), // Tipagem inferida pelo TS
        contact_button_text: state.contactButtonText,
        contact_button_url: state.contactButtonUrl,
        template_id: state.template,
        slug: slug,
      };

      const { data, error } = await supabase
        .from('smart_links')
        .upsert(smartLinkData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      updateField('isSaving', false);
      resetForm(); // Limpa o formulário
      
      const finalUrl = `${window.location.origin}/sl/${data.slug}`;
      
      showNotification('Smart Link salvo com sucesso!', 'success');
      
      // Opcional: copiar para a área de transferência
      navigator.clipboard.writeText(finalUrl).catch(err => console.error("Falha ao copiar link", err));

      setTimeout(() => {
        navigate('/dashboard'); // Redireciona para o dashboard
      }, 2000);

    } catch (error: any) {
      updateField('isSaving', false);
      console.error('Erro ao salvar Smart Link:', error);
      showNotification(error.message || 'Ocorreu um erro ao salvar o Smart Link.', 'error');
    }
  };

  const renderStepContent = () => {
    // Os componentes de step agora consomem o contexto diretamente.
    // Não é mais necessário passar props de state/actions.
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
        return <div>Step não encontrado</div>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {notification && (
          <div 
            className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white flex items-center z-50 transform transition-all duration-300
              ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {notification.type === 'success' ? <FaCheckCircle className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
            {notification.message}
            <button onClick={() => setNotification(null)} className="ml-4 text-xl font-bold hover:opacity-75 transition-opacity">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Header com informações do projeto */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Criar Smart Link
          </h1>
          <p className="text-gray-600 text-lg">
            Crie uma página profissional para sua música em minutos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna do Formulário - Mais espaço */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Header do card */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Configure seu Smart Link</h2>
                <p className="opacity-90">Preencha os dados abaixo para criar sua página</p>
              </div>
              
              {/* Indicador de steps */}
              <div className="p-6 bg-gray-50 border-b">
                <StepIndicator currentStep={currentStep} />
              </div>
              
              {/* Conteúdo do formulário */}
              <div className="p-8">
                {renderStepContent()}
              </div>
              
              {/* Navegação */}
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1 || isSaving}
                  className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-all duration-200 hover:transform hover:scale-105"
                >
                  <FaArrowLeft className="mr-2" /> Voltar
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    onClick={nextStep}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center font-medium transition-all duration-200 hover:transform hover:scale-105 shadow-lg"
                  >
                    Avançar <FaArrowRight className="ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handlePublish} // Usar a nova função
                    disabled={isSaving}
                    className="flex items-center px-8 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
                  >
                    {isSaving ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Publicando...
                      </>
                    ) : (
                      'Publicar Smart Link'
                    )}
                  </button>
                )}
              </div>
              
              {/* Exibição de Erros */}
              {Object.keys(errors).length > 0 && currentStep === STEPS.length && (
                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <h3 className="font-bold flex items-center mb-2">
                    <FaExclamationTriangle className="mr-2"/> Erros de Validação
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.values(errors).map((error: any, index: number) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Coluna do Preview - Mais compacta */}
          <div className="lg:col-span-1">            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Preview ao Vivo
                </h3>                <SmartLinkMobilePreview 
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

export default CreateSmartLinkPage;
