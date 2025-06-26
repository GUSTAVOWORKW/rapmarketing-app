// components/smartlink/FormSteps/SocialLinksStep.tsx
import React from 'react';
import { useSmartLinkForm } from '../../../context/smartlink/SmartLinkFormContext';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaTiktok, FaWhatsapp, FaShare, FaCheckCircle } from 'react-icons/fa';
import { SocialLink } from '../../../types';

interface SocialLinksStepProps {}

const SocialLinksStep: React.FC<SocialLinksStepProps> = () => {
  const { state, updateSocialLink, updateField } = useSmartLinkForm();
  
  const socialPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E4405F', placeholder: 'https://instagram.com/seuusuario', description: 'Essencial para artistas' },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: '#000000', placeholder: 'https://tiktok.com/@seuusuario', description: 'Para alcançar novos fãs' },
    { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000', placeholder: 'https://youtube.com/channel/seucanal', description: 'Para vídeos e clipes' },
    { id: 'twitter', name: 'Twitter / X', icon: FaTwitter, color: '#1DA1F2', placeholder: 'https://twitter.com/seuusuario', description: 'Atualizações rápidas' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: '#1877F2', placeholder: 'https://facebook.com/suapagina', description: 'Página do artista' },
    { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', placeholder: 'https://wa.me/5511999999999', description: 'Contato direto' },
  ];
  
  const handleSocialUrlChange = (platformId: string, url: string) => {
    const existingLink = state.socialLinks.find(s => s.platform === platformId);
    if (existingLink) {
      updateSocialLink(existingLink.id!, { url });
    }
  };

  const getSocialUrl = (platformId: string): string => {
    const socialLink = state.socialLinks.find(s => s.platform === platformId);
    return socialLink?.url || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full mb-4">
          <FaShare className="mr-2" />
          <span className="font-medium">Redes Sociais</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conecte-se com Seus Fãs</h2>
        <p className="text-gray-600">Adicione suas redes sociais e formas de contato</p>
      </div>

      {/* Grid de Redes Sociais */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Todas as Redes Sociais Disponíveis</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => {
            const IconComponent = platform.icon;
            const currentUrl = getSocialUrl(platform.id);
            const isConnected = currentUrl.trim() !== '';
            
            return (
              <div 
                key={platform.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${platform.color}20` }}
                  >
                    <IconComponent 
                      className="text-lg"
                      style={{ color: platform.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{platform.name}</h4>
                    <p className="text-sm text-gray-500">{platform.description}</p>
                  </div>
                  {isConnected && (
                    <FaCheckCircle className="text-green-500" />
                  )}
                </div>
                
                <input
                  type="url"
                  placeholder={platform.placeholder}
                  value={currentUrl}
                  onChange={(e) => handleSocialUrlChange(platform.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de Contato */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Botão de Contato Personalizado</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Botão
            </label>
            <input
              type="text"
              placeholder="Ex: Entre em Contato"
              value={state.contactButtonText || ''}
              onChange={(e) => updateField('contactButtonText', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Contato
            </label>
            <input
              type="url"
              placeholder="Ex: mailto:contato@email.com ou https://wa.me/..."
              value={state.contactButtonUrl || ''}
              onChange={(e) => updateField('contactButtonUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {state.contactButtonText && state.contactButtonUrl && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview do botão:</p>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium">
              {state.contactButtonText}
            </button>
          </div>
        )}
      </div>

      {/* Contador */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {state.socialLinks.filter((s: SocialLink) => s.url.trim() !== '').length}
          </div>
          <div className="text-sm text-gray-600">
            rede{state.socialLinks.filter((s: SocialLink) => s.url.trim() !== '').length !== 1 ? 's' : ''} social{state.socialLinks.filter((s: SocialLink) => s.url.trim() !== '').length !== 1 ? 'is' : ''} conectada{state.socialLinks.filter((s: SocialLink) => s.url.trim() !== '').length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksStep;
