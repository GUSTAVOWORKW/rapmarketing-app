// components/presave/FormSteps/SocialLinksStep.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  FaInstagram, 
  FaFacebook, 
  FaTwitter, 
  FaWhatsapp, 
  FaPlus, 
  FaTimes, 
  FaCheck, 
  FaExternalLinkAlt,
  FaShareAlt,
  FaInfoCircle,
  FaLink,
  FaEdit
} from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';
import { usePresaveForm } from '../../../context/presave/PresaveFormContext';

// Social platform configurations
const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    color: '#E4405F',
    placeholder: 'https://instagram.com/seuusuario',
    validation: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/
  },  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    placeholder: 'https://facebook.com/suapagina',
    validation: /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?$/
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: FaTwitter,
    color: '#000000',
    placeholder: 'https://twitter.com/seuusuario',
    validation: /^https:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?$/
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: SiThreads,
    color: '#000000',
    placeholder: 'https://threads.net/@seuusuario',
    validation: /^https:\/\/(www\.)?threads\.net\/@[a-zA-Z0-9_.]+\/?$/
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: FaWhatsapp,
    color: '#25D366',
    placeholder: 'https://wa.me/5511999999999',
    validation: /^https:\/\/(wa\.me|api\.whatsapp\.com)\/[0-9]+/
  }
];

const SocialLinksStep = () => {
  const { state, actions } = usePresaveForm();
  const { addSocialLink, removeSocialLink } = actions;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);

  // Função para obter o ícone baseado no ID da plataforma
  const getPlatformIcon = (platformId) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    return platform?.icon || FaLink;
  };

  // Fechar modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showAddModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddModal]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && showAddModal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAddModal]);

  // Função para fechar modal e resetar formulário
  const closeModal = () => {
    setShowAddModal(false);
    setSelectedPlatform('');
    setLinkUrl('');
    setErrors({});
  };

  // Validar URL de uma rede social específica
  const validateSocialUrl = (platformId, url) => {
    if (!url.trim()) return { isValid: false, error: 'URL é obrigatória' };
    
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return { isValid: false, error: 'Plataforma não encontrada' };
    
    if (platform.validation && !platform.validation.test(url)) {
      return { 
        isValid: false, 
        error: `URL inválida para ${platform.name}. Use o formato: ${platform.placeholder}` 
      };
    }
    
    return { isValid: true, error: null };
  };  // Adicionar link de rede social
  const handleAddSocialLink = () => {
    if (!selectedPlatform || !linkUrl.trim()) {
      setErrors({ general: 'Selecione uma plataforma e insira a URL' });
      return;
    }

    // Verificar se a plataforma já foi adicionada
    if (state.socialLinks.some(link => link.platform === selectedPlatform)) {
      setErrors({ general: 'Esta rede social já foi adicionada' });
      return;
    }

    // Validar URL
    const validation = validateSocialUrl(selectedPlatform, linkUrl);
    if (!validation.isValid) {
      setErrors({ url: validation.error });
      return;
    }    // Adicionar o link
    const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    const newLink = {
      platform: selectedPlatform,
      platformName: platform.name,
      url: linkUrl.trim(),
      color: platform.color
    };

    addSocialLink(newLink);
    closeModal();
  };

  // Remover link de rede social
  const handleRemoveSocialLink = (platform) => {
    removeSocialLink(platform);
  };

  // Obter plataformas disponíveis (não adicionadas ainda)
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => !state.socialLinks.some(link => link.platform === platform.id)
  );
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Redes Sociais
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Adicione suas redes sociais para promover seu pré-save
        </p>
      </div>

      <div className="space-y-8">
        {/* Redes Sociais Adicionadas */}
        {state.socialLinks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <FaCheck className="text-green-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Redes Conectadas ({state.socialLinks.length})
                  </h2>
                  <p className="text-gray-600">Suas redes sociais vinculadas ao pré-save</p>
                </div>
              </div>
            </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.socialLinks.map((link) => {
                const IconComponent = getPlatformIcon(link.platform);
                return (
                  <div
                    key={link.platform}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: link.color }}
                      >
                        <IconComponent className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{link.platformName}</h4>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center group truncate"
                        >
                          <span className="truncate">
                            {link.url.length > 40 ? `${link.url.substring(0, 40)}...` : link.url}
                          </span>
                          <FaExternalLinkAlt className="ml-2 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSocialLink(link.platform)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Remover rede social"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Adicionar Nova Rede Social */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaShareAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Conectar Redes Sociais</h2>
                <p className="text-gray-600">Adicione links para suas redes sociais</p>
              </div>
            </div>
          </div>          {/* Grid de Plataformas Disponíveis */}
          {availablePlatforms.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {availablePlatforms.map((platform) => {
                const IconComponent = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      setSelectedPlatform(platform.id);
                      setShowAddModal(true);
                    }}
                    className="group flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all transform hover:scale-105"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: platform.color }}
                    >
                      {IconComponent && <IconComponent className="text-xl" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
                      {platform.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <FaCheck className="text-green-600 mx-auto mb-3 text-3xl" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Todas as redes sociais foram adicionadas!
              </h3>
              <p className="text-green-700">
                Você conectou todas as plataformas disponíveis.
              </p>
            </div>          )}
        </div>

        {/* Dicas e Informações */}
        {state.socialLinks.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <FaInfoCircle className="text-blue-600 mx-auto mb-3 text-2xl" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Redes Sociais Opcionais
            </h3>
            <p className="text-blue-700">
              As redes sociais são opcionais, mas ajudam a promover seu pré-save e conectar com seus fãs.
            </p>
          </div>
        )}

        {/* Dicas Gerais */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-600" />
            💡 Dicas Importantes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Use URLs públicas dos seus perfis
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Links ajudam fãs a te encontrar facilmente
              </li>
            </ul>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Certifique-se de que os perfis estão ativos
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                As redes sociais são completamente opcionais
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal para Adicionar Rede Social */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">              <div className="flex items-center">
                {selectedPlatform && (
                  <>
                    {(() => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
                      const IconComponent = platform?.icon;
                      return (
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white mr-3"
                          style={{ backgroundColor: platform?.color }}
                        >
                          {IconComponent && <IconComponent className="text-lg" />}
                        </div>
                      );
                    })()}
                  </>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Adicionar {SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Insira o link do seu perfil
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              {/* Campo de URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL do Perfil *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      setErrors({});
                    }}
                    placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pl-12 ${
                      errors.url ? 'border-red-500' : 'border-gray-200'
                    }`}
                    autoFocus
                  />
                  <FaLink className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.url && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaInfoCircle className="mr-1" />
                    {errors.url}
                  </p>
                )}
                
                {/* Exemplo de URL */}
                {selectedPlatform && (
                  <p className="mt-2 text-xs text-gray-500">
                    <strong>Exemplo:</strong> {SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                  </p>
                )}
              </div>

              {/* Erros gerais */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSocialLink}
                disabled={!linkUrl.trim()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                <FaPlus className="mr-2" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialLinksStep;
