// components/presave/FormSteps/PlatformLinksStep.js
import React, { useState } from 'react';
import { FaMusic, FaPlus, FaTrash, FaExternalLinkAlt, FaInfoCircle, FaSpotify, FaApple, FaAmazon, FaYoutube, FaSoundcloud, FaDeezer } from 'react-icons/fa';
import { SiTidal } from 'react-icons/si';
import { PLATFORMS } from '../../../data/platforms';
import { usePresaveForm } from '../../../context/presave/PresaveFormContext';

// Configuração para o FORMULÁRIO (visual com FaIcons)
const platformsForForm = [
  {
    id: 'spotify',
    name: 'Spotify',
    icon: FaSpotify,
    color: '#1DB954',
    placeholder: 'https://open.spotify.com/album/...',
    description: 'A maior plataforma de streaming do mundo'
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    icon: FaApple,
    color: '#FA243C',
    placeholder: 'https://music.apple.com/album/...',
    description: 'Serviço da Apple com alta qualidade'
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    icon: FaYoutube,
    color: '#FF0000',
    placeholder: 'https://music.youtube.com/playlist?list=...',
    description: 'Música do YouTube com videoclipes'
  },
  {
    id: 'amazon-music',
    name: 'Amazon Music',
    icon: FaAmazon,
    color: '#FF9900',
    placeholder: 'https://music.amazon.com/albums/...',
    description: 'Serviço da Amazon com Alexa'
  },
  {
    id: 'deezer',
    name: 'Deezer',
    icon: FaDeezer,
    color: '#FEAA2D',
    placeholder: 'https://www.deezer.com/album/...',
    description: 'Streaming francês com Hi-Fi'
  },
  {
    id: 'tidal',
    name: 'Tidal',
    icon: SiTidal, // Restaurado para SiTidal
    color: '#000000',
    placeholder: 'https://tidal.com/browse/album/...',
    description: 'Qualidade lossless e exclusivos'
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    icon: FaSoundcloud,
    color: '#FF5500',
    placeholder: 'https://soundcloud.com/artist/track',
    description: 'Plataforma para artistas independentes'
  }
];

const PlatformLinksStep = ({ errors = {} }) => {
  const { state, actions } = usePresaveForm();
  const { addPlatformLink, removePlatformLink, updatePlatformLink } = actions;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState({
    platformId: '',
    url: ''
  });
  const handleAddPlatform = () => {
    if (!newPlatform.platformId || !newPlatform.url) {
      return;
    }

    // Buscar dados do formulário (visual)
    const formPlatform = platformsForForm.find(p => p.id === newPlatform.platformId);
    // Buscar dados do sistema (para templates)
    const systemPlatform = PLATFORMS.find(p => p.id === newPlatform.platformId);
    
    if (!formPlatform || !systemPlatform) return;
    const platformLink = {
      // Removido tempId: nunca usar id temporário!
      id: systemPlatform.id, // O id da plataforma, compatível com o template
      platform_id: systemPlatform.id,
      platformId: systemPlatform.id,
      url: newPlatform.url,
      name: systemPlatform.name,
      platformName: formPlatform.name,
      formIcon: formPlatform.icon,
      formColor: formPlatform.color
    };

    addPlatformLink(platformLink);
    
    // Reset form
    setNewPlatform({ platformId: '', url: '' });
    setShowAddForm(false);
  };  const handleRemovePlatform = (linkId) => {
    removePlatformLink(linkId);
  };

  const handleUpdatePlatform = (linkId, url) => {
    updatePlatformLink(linkId, { url });
  };
  const getAvailablePlatformsForAdd = () => {
    const usedPlatformIds = state.platformLinks.map(link => link.platformId);
    return platformsForForm.filter(platform => !usedPlatformIds.includes(platform.id));
  };  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Plataformas de Streaming
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Adicione os links das suas músicas nas principais plataformas
        </p>
      </div>

      <div className="space-y-8">
        {/* Plataformas Adicionadas */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FaMusic className="text-green-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Suas Plataformas</h2>
                <p className="text-gray-600">
                  {state.platformLinks.length > 0 
                    ? `${state.platformLinks.length} plataforma(s) adicionada(s)`
                    : 'Nenhuma plataforma adicionada ainda'
                  }
                </p>
              </div>
            </div>
            
            {getAvailablePlatformsForAdd().length > 0 && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <FaPlus className="mr-2" />
                Adicionar Plataforma
              </button>
            )}
          </div>

          {/* Lista de Plataformas */}
          {state.platformLinks.length > 0 ? (
            <div className="space-y-4">              {state.platformLinks.map((link) => {
                return (
                  <div
                    key={link.id} // Usar sempre o id real da plataforma
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-4">                      {/* Platform Icon */}
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${link.formColor}15`, color: link.formColor }}
                      >
                        {link.formIcon ? (
                          <link.formIcon className="text-xl" />
                        ) : (
                          <span className="text-gray-400">?</span>
                        )}
                      </div>

                      {/* Platform Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{link.name || link.platformName}</h3>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <FaExternalLinkAlt className="text-sm" />
                          </a>
                        </div>
                        
                        {/* URL Input */}                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdatePlatform(link.id, e.target.value)}
                          placeholder={platformsForForm.find(p => p.id === (link.platform_id || link.platformId))?.placeholder}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemovePlatform(link.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Remover plataforma"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <FaMusic className="text-4xl text-gray-400 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma plataforma adicionada
              </h3>
              <p className="text-gray-500 mb-6">
                Adicione pelo menos uma plataforma de streaming para continuar
              </p>
              {getAvailablePlatformsForAdd().length > 0 && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <FaPlus className="mr-2" />
                  Adicionar Primeira Plataforma
                </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {errors.platformLinks && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center">
                <FaInfoCircle className="mr-2" />
                {errors.platformLinks}
              </p>
            </div>
          )}
        </div>

        {/* Formulário de Adicionar Plataforma */}
        {showAddForm && getAvailablePlatformsForAdd().length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <FaPlus className="text-blue-600 text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Adicionar Nova Plataforma</h2>
                <p className="text-gray-600">Selecione a plataforma e adicione o link</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Seleção de Plataforma */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Escolha a Plataforma *
                </label>                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAvailablePlatformsForAdd().map((platform) => {
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setNewPlatform({ ...newPlatform, platformId: platform.id })}
                        className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                          newPlatform.platformId === platform.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >                        <div 
                          className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
                        >
                          <platform.icon className="text-lg" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900">{platform.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{platform.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URL Input */}
              {newPlatform.platformId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Link da {platformsForForm.find(p => p.id === newPlatform.platformId)?.name} *
                  </label>
                  <input                    type="url"
                    value={newPlatform.url}
                    onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })}
                    placeholder={platformsForForm.find(p => p.id === newPlatform.platformId)?.placeholder}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <p className="text-gray-500 text-sm mt-2 flex items-center">
                    <FaInfoCircle className="mr-1" />
                    Cole aqui o link completo da sua música nesta plataforma
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPlatform({ platformId: '', url: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPlatform}
                  disabled={!newPlatform.platformId || !newPlatform.url}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  Adicionar Plataforma
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informações Importantes */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <FaInfoCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Dicas Importantes</h3>
              <ul className="text-blue-800 text-sm space-y-2">
                <li>• Adicione pelo menos uma plataforma principal (Spotify, Apple Music, etc.)</li>
                <li>• Os links devem apontar para a música/álbum específico, não para seu perfil</li>
                <li>• Certifique-se de que os links estão funcionando antes de publicar</li>
                <li>• Você pode adicionar mais plataformas depois da criação</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformLinksStep;
