// components/presave/FormSteps/FinalPreviewStep.js
import React, { useState } from 'react';
import { 
  FaCheck, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaInfoCircle,
  FaMusic,
  FaImage,
  FaLink,
  FaShare,
  FaCopy,
  FaRocket,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';
import { usePresaveFormContext } from '../../../context/presave/PresaveFormContext';
import config from '../../../config';

const FinalPreviewStep = ({ onSubmit, submitStatus }) => {
  const { state } = usePresaveFormContext();
  const [notification, setNotification] = useState(null);

  // Função para mostrar notificação personalizada
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validação dos steps
  const stepValidation = [
    {
      id: 1,
      title: 'Informações Básicas',
      icon: FaMusic,
      valid: !!(state.artistName && state.trackName && state.releaseDate && state.selectedTemplate),
      items: [
        { label: 'Nome do Artista', value: state.artistName, valid: !!state.artistName },
        { label: 'Nome da Faixa', value: state.trackName, valid: !!state.trackName },
        { label: 'Data de Lançamento', value: state.releaseDate, valid: !!state.releaseDate },
        { label: 'Template Selecionado', value: state.selectedTemplate?.name, valid: !!state.selectedTemplate }
      ]
    },
    {
      id: 2,
      title: 'Artwork',
      icon: FaImage,
      valid: !!(state.artworkUrl || state.artworkFile),
      items: [
        { label: 'Capa da Música', value: state.artworkUrl ? 'Artwork carregado' : 'Nenhum artwork', valid: !!(state.artworkUrl || state.artworkFile) }
      ]
    },
    {
      id: 3,
      title: 'Plataformas de Streaming',
      icon: FaLink,
      valid: state.platformLinks && state.platformLinks.length > 0,
      items: [
        { label: 'Links de Plataformas', value: `${state.platformLinks?.length || 0} plataforma(s) conectada(s)`, valid: state.platformLinks && state.platformLinks.length > 0 }
      ]
    },
    {
      id: 4,
      title: 'Redes Sociais',
      icon: FaShare,
      valid: true, // Opcionais
      items: [
        { label: 'Redes Sociais', value: `${state.socialLinks?.length || 0} rede(s) conectada(s)`, valid: true }
      ]
    }
  ];

  const allStepsValid = stepValidation.slice(0, 3).every(step => step.valid); // Steps 1-3 são obrigatórios  // Função para copiar link
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Preview do link copiado! O link real será gerado após publicação.', 'success');
    } catch (err) {
      showNotification('Erro ao copiar preview do link', 'error');
    }
  };
  // URL do pré-save - gera preview baseado nos dados atuais
  const generatePreviewSlug = () => {
    if (state.shareableSlug && state.shareableSlug.trim()) {
      return state.shareableSlug;
    }
    
    // Gerar preview baseado no nome do artista e faixa
    let previewSlug = '';
    if (state.artistName && state.trackName) {
      previewSlug = `${state.artistName}-${state.trackName}`;
    } else if (state.artistName) {
      previewSlug = `${state.artistName}-musica`;
    } else if (state.trackName) {
      previewSlug = `artista-${state.trackName}`;
    } else {
      previewSlug = 'presave';
    }
    
    return previewSlug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') + '-preview';
  };
  
  const presaveUrl = `${config.APP_URL}/presave/${generatePreviewSlug()}`;
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Notificação personalizada */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ease-in-out ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white p-4 rounded-lg shadow-lg flex items-center justify-between`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <FaCheck className="mr-3 text-lg" />
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
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Revisão Final
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Verifique todas as informações antes de publicar seu pré-save
        </p>
      </div>

      <div className="space-y-8">
        {/* Status de Validação */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
              allStepsValid ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {allStepsValid ? 
                <FaCheckCircle className="text-green-600 text-xl" /> : 
                <FaExclamationTriangle className="text-yellow-600 text-xl" />
              }
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {allStepsValid ? 'Tudo Pronto!' : 'Atenção Necessária'}
              </h2>
              <p className="text-gray-600">
                {allStepsValid ? 
                  'Seu pré-save está pronto para ser publicado' : 
                  'Alguns campos obrigatórios precisam ser preenchidos'
                }
              </p>
            </div>
          </div>

          {/* Lista de Validação por Step */}
          <div className="space-y-6">
            {stepValidation.map((step) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    step.valid 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      step.valid ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <IconComponent className={`text-lg ${
                        step.valid ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.valid ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {step.valid ? 
                        <FaCheck className="text-white text-xs" /> : 
                        <span className="text-white text-xs">!</span>
                      }
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {step.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.label}:</span>
                        <div className="flex items-center">
                          <span className={`mr-2 ${item.valid ? 'text-gray-900' : 'text-red-600'}`}>
                            {item.value}
                          </span>
                          {item.valid ? 
                            <FaCheck className="text-green-500 text-xs" /> : 
                            <FaExclamationTriangle className="text-red-500 text-xs" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Link de Compartilhamento (Preview) */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <FaLink className="text-blue-600 text-xl" />
            </div>            <div>
              <h2 className="text-2xl font-bold text-gray-900">Preview do Link</h2>
              <p className="text-gray-600">Este é um preview do seu link - o link final será gerado após a publicação</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">              <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm text-gray-600 mb-1">Preview da URL do Pré-save:</p>
                <p className="font-mono text-sm text-gray-900 truncate">
                  {presaveUrl}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(presaveUrl)}
                className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
                title="Este é apenas um preview - o link real será gerado após publicação"
              >
                <FaCopy className="mr-2" />
                Copiar Preview
              </button>
            </div>
          </div>          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <FaInfoCircle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">🔍 Preview do Link</p>
                <p>Este é apenas um preview para você visualizar como ficará o link. O link final e funcional será gerado após você clicar em "Publicar Pré-save".</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ações Finais */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Publicar Pré-save</h2>
              <p className="text-gray-600">Finalize e publique seu pré-save</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSubmit}
              disabled={!allStepsValid || submitStatus === 'submitting'}
              className={`flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                allStepsValid && submitStatus !== 'submitting'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitStatus === 'submitting' ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  Publicando...
                </>
              ) : (
                <>
                  <FaRocket className="mr-3" />
                  Publicar Pré-save
                </>
              )}
            </button>

            {!allStepsValid && (
              <div className="flex-1 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-600 mr-3" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Ação necessária</p>
                    <p>Complete os campos obrigatórios para publicar</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalPreviewStep;
