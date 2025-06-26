import React from 'react';
import { FaPlus, FaTimes, FaLink } from 'react-icons/fa';
import { PlatformLink } from '../../types';
import { PLATFORMS as allPlatformsData, Platform as PlatformDataType } from '../../data/platforms';

interface PlatformLinksFormProps {
  platformLinks: PlatformLink[];
  handlePlatformLinkChange: (index: number, field: keyof PlatformLink, value: string) => void;
  addPlatformLink: () => void;
  removePlatformLink: (index: number) => void;
  showAdvancedColors: boolean; // Nova prop
}

const PlatformLinksForm: React.FC<PlatformLinksFormProps> = ({
  platformLinks,
  handlePlatformLinkChange,
  addPlatformLink,
  removePlatformLink,
  showAdvancedColors, // Nova prop
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Links das Plataformas</h3>
      {(platformLinks || []).map((link, index) => {
        const selectedPlatformData = allPlatformsData.find(p => p.id === link.platform_id);
        return (
          <div key={index} className="p-4 bg-gray-700/70 rounded-lg shadow space-y-4 border border-gray-600">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-200">Link #{index + 1}</p>
              <button
                type="button"
                onClick={() => removePlatformLink(index)}
                className="text-red-400 hover:text-red-300 p-1.5 rounded-full hover:bg-gray-600"
                title="Remover Link"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label htmlFor={`platform_id-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
              <div className="flex items-center space-x-2">
                {selectedPlatformData && selectedPlatformData.icon && (
                  <span className="w-7 h-7 flex-shrink-0 rounded flex items-center justify-center">
                    <selectedPlatformData.icon size={24} />
                  </span>
                )}
                <select
                  name={`platform_id-${index}`}
                  id={`platform_id-${index}`}
                  value={link.platform_id}
                  onChange={(e) => handlePlatformLinkChange(index, 'platform_id', e.target.value)}
                  className="flex-grow w-full p-3.5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                >
                  {allPlatformsData.map((p: PlatformDataType) => (
                    <option key={p.id} value={p.id} className="bg-gray-800 text-white py-2">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor={`platform_url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <div className="flex items-center space-x-2">
                <FaLink className="text-gray-400 flex-shrink-0 w-5 h-5" />
                <input
                  type="url"
                  name={`platform_url-${index}`}
                  id={`platform_url-${index}`}
                  value={link.url}
                  onChange={(e) => handlePlatformLinkChange(index, 'url', e.target.value)}
                  placeholder={selectedPlatformData?.placeholder_url || "https://plataforma.com/seu-link"}
                  className="flex-grow w-full p-3.5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 text-base"
                />
              </div>
            </div>

            {showAdvancedColors && (
              <div className="space-y-3 pt-3 mt-3 border-t border-gray-500">
                <p className="text-sm font-medium text-gray-300">Cores customizadas para este link:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`custom_button_bg_color-${index}`} className="block text-xs font-medium text-gray-400 mb-1">Cor de Fundo do Botão</label>
                    <input
                      type="color"
                      id={`custom_button_bg_color-${index}`}
                      value={link.custom_button_bg_color || ''}
                      onChange={(e) => handlePlatformLinkChange(index, 'custom_button_bg_color', e.target.value)}
                      className="w-full h-10 p-1 border border-gray-500 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor={`custom_button_text_color-${index}`} className="block text-xs font-medium text-gray-400 mb-1">Cor do Texto/Ícone</label>
                    <input
                      type="color"
                      id={`custom_button_text_color-${index}`}
                      value={link.custom_button_text_color || ''}
                      onChange={(e) => handlePlatformLinkChange(index, 'custom_button_text_color', e.target.value)}
                      className="w-full h-10 p-1 border border-gray-500 rounded-md cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={addPlatformLink}
        className="mt-4 flex items-center justify-center px-5 py-3 border border-dashed border-gray-300 text-base font-medium rounded-lg text-gray-700 hover:text-red-400 hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-red-500 w-full transition-colors"
      >
        <FaPlus className="mr-2 w-5 h-5" /> Adicionar Link de Plataforma
      </button>
    </div>
  );
};

export default PlatformLinksForm;
