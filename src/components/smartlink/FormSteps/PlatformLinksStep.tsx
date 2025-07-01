// components/smartlink/FormSteps/PlatformLinksStep.tsx
import React from 'react';
import { useSmartLinkForm } from '../../../context/smartlink/SmartLinkFormContext';
import { FaCheckCircle, FaLink } from 'react-icons/fa';
import { PlatformLink } from '../../../types';
import { PLATFORMS } from '../../../data/platforms';

interface PlatformLinksStepProps {}

const PlatformLinksStep: React.FC<PlatformLinksStepProps> = () => {
  const { state, updateStreamingLink } = useSmartLinkForm();
  const handlePlatformUrlChange = (platformId: string, url: string) => {
    const existingLink = state.streamingLinks.find(p => p.platform_id === platformId);
    if (existingLink) {
      updateStreamingLink(existingLink.id!, { url });
    } else {
      // Criar novo link se não existir - usar platformId como id para compatibilidade com templates
      const newLink: PlatformLink = {
        id: platformId, // Usar o platformId real ao invés de id temporário
        platform_id: platformId,
        name: PLATFORMS.find(p => p.id === platformId)?.name || platformId,
        url: url
      };
      // Add the new streaming link to the context
      updateStreamingLink(newLink.id!, newLink);
    }
  };

  const getPlatformUrl = (platformId: string): string => {
    const platform = state.streamingLinks.find(p => p.platform_id === platformId);
    return platform?.url || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full mb-4">
          <FaLink className="mr-2" />
          <span className="font-medium">Links de Streaming</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Plataformas de Música</h2>
        <p className="text-gray-600">Conecte suas plataformas de streaming</p>
      </div>

      {/* Grid de Plataformas */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Todas as Plataformas Disponíveis</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {PLATFORMS.map((platform) => {
            const IconComponent = platform.icon;
            const currentUrl = getPlatformUrl(platform.id);
            const isConnected = currentUrl.trim() !== '';
            return (
              <div 
                key={platform.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${platform.brand_color}20` }}
                  >
                    <IconComponent className="text-2xl" style={{ color: platform.brand_color }} />
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
                  placeholder={platform.placeholder_url}
                  value={currentUrl}
                  onChange={(e) => handlePlatformUrlChange(platform.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Contador de Plataformas Conectadas */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {state.streamingLinks.filter((p: PlatformLink) => p.url.trim() !== '').length}
          </div>
          <div className="text-sm text-gray-600">
            plataforma{state.streamingLinks.filter((p: PlatformLink) => p.url.trim() !== '').length !== 1 ? 's' : ''} conectada{state.streamingLinks.filter((p: PlatformLink) => p.url.trim() !== '').length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformLinksStep;
