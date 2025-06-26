// components/presave/FormSteps/SocialLinksStep.js
import React, { useState } from 'react';
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp, FaPlus, FaTimes, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
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
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    color: '#1877F2',
    placeholder: 'https://facebook.com/suapagina',
    validation: /^https:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9_.]+\/?$/
  },  {
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
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [errors, setErrors] = useState({});

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
  };
  // Adicionar link de rede social
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
    }

    // Adicionar o link
    const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
    const newLink = {
      platform: selectedPlatform,
      platformName: platform.name,
      url: linkUrl.trim(),
      icon: platform.icon,
      color: platform.color
    };

    addSocialLink(newLink);
    
    // Limpar formulário
    setSelectedPlatform('');
    setLinkUrl('');
    setErrors({});
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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Redes Sociais
        </h2>
        <p className="text-gray-600">
          Adicione suas redes sociais para promover seu pré-save
        </p>
      </div>

      {/* Links já adicionados */}
      {state.socialLinks.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Redes Sociais Adicionadas ({state.socialLinks.length})
          </h3>
          
          {state.socialLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <div
                key={link.platform}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <IconComponent 
                    className="w-8 h-8"
                    style={{ color: link.color }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{link.platformName}</h4>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                      <FaExternalLinkAlt className="ml-1 w-3 h-3" />
                    </a>
                  </div>
                </div>
                  <button
                  onClick={() => handleRemoveSocialLink(link.platform)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Remover rede social"
                >
                  <FaTimes />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulário para adicionar nova rede social */}
      {availablePlatforms.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Adicionar Nova Rede Social
          </h3>

          <div className="space-y-4">
            {/* Seletor de plataforma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rede Social
              </label>
              <select
                value={selectedPlatform}
                onChange={(e) => {
                  setSelectedPlatform(e.target.value);
                  setLinkUrl('');
                  setErrors({});
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma rede social</option>
                {availablePlatforms.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Campo de URL */}
            {selectedPlatform && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do perfil
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setErrors({});
                  }}
                  placeholder={SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.url ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.url && (
                  <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                )}
                
                {/* Exemplo de URL */}
                {selectedPlatform && (
                  <p className="mt-1 text-xs text-gray-500">
                    Exemplo: {SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder}
                  </p>
                )}
              </div>
            )}

            {/* Botão adicionar */}            <button
              onClick={handleAddSocialLink}
              disabled={!selectedPlatform || !linkUrl.trim()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="mr-2" />
              Adicionar Rede Social
            </button>

            {errors.general && (
              <p className="text-sm text-red-600">{errors.general}</p>
            )}
          </div>
        </div>
      )}

      {/* Estado quando todas as redes sociais foram adicionadas */}
      {availablePlatforms.length === 0 && state.socialLinks.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <FaCheck className="text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">
            Todas as redes sociais disponíveis foram adicionadas!
          </p>
        </div>
      )}

      {/* Mensagem quando nenhuma rede social foi adicionada */}
      {state.socialLinks.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            As redes sociais são opcionais, mas ajudam a promover seu pré-save.
          </p>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💡 Dicas:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• As redes sociais são opcionais</li>
          <li>• Use URLs públicas dos seus perfis</li>
          <li>• Links ajudam fãs a te encontrar facilmente</li>
          <li>• Certifique-se de que os perfis estão ativos</li>
        </ul>
      </div>
    </div>
  );
};

export default SocialLinksStep;
