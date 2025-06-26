// components/smartlink/FormSteps/ReleaseInfoStep.tsx
import React, { useState } from 'react';
import { useSmartLinkForm } from '../../../context/smartlink/SmartLinkFormContext';
import { FaMusic, FaImage, FaUpload, FaSpotify, FaInfoCircle, FaCheckCircle, FaPlay } from 'react-icons/fa';

interface ReleaseInfoStepProps {}

const ReleaseInfoStep: React.FC<ReleaseInfoStepProps> = () => {
  const { state, updateField } = useSmartLinkForm();
  const [showSpotifyHelp, setShowSpotifyHelp] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleChange = (field: string, value: string) => {
    updateField(field, value);
  };
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Limpar blob URL anterior se existir
      if (state.coverImageUrl && state.coverImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(state.coverImageUrl);
      }
      
      // Simular progresso de upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
      
      const previewUrl = URL.createObjectURL(file);
      updateField('coverImageFile', file);
      updateField('coverImageUrl', previewUrl);
    }
  };

  // O useEffect de cleanup foi removido daqui para evitar que a URL do blob seja revogada prematuramente ao navegar entre os passos.
  // A limpeza agora deve ser gerenciada de forma mais centralizada.

  // Caminho da capa padrão
  const defaultCover = '/assets/defaults/default-cover.png';

  // Se não houver coverImageUrl, usa a capa padrão
  const coverImageUrl = state.coverImageUrl || defaultCover;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full mb-4">
          <FaMusic className="mr-2" />
          <span className="font-medium">Informações do Smart Link</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu Smart Link</h2>
        <p className="text-gray-600">Configure os elementos principais do seu Smart Link</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Capa da Música */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaImage className="mr-2 text-purple-500" />
            Arte da Capa
          </h3>
          
          <div className="relative">
            {coverImageUrl ? (
              <div className="relative group">
                <img 
                  src={coverImageUrl} 
                  alt="Capa do Smart Link" 
                  className="w-full aspect-square object-cover rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all duration-300 flex items-center justify-center">
                  <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white text-gray-800 px-3 py-2 rounded-lg font-medium flex items-center">
                      <FaUpload className="mr-2" />
                      Trocar
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="w-full aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors flex flex-col items-center justify-center">
                  <FaUpload className="text-3xl text-gray-400 mb-3" />
                  <p className="font-medium text-gray-600">Adicionar Capa</p>
                  <p className="text-sm text-gray-500">JPG, PNG até 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            )}
            
            {isUploading && (
              <div className="absolute bottom-3 left-3 right-3 bg-white rounded-full p-2 shadow-lg">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600">{uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações da Música */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaMusic className="mr-2 text-blue-500" />
            Detalhes da Música
          </h3>
          
          <div className="space-y-4">
            {/* Nome do Artista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Artista
              </label>
              <input
                type="text"
                placeholder="Ex: MC Exemplo"
                value={state.artistName || ''}
                onChange={(e) => handleChange('artistName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>            {/* Título da Música */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Música
              </label>
              <input
                type="text"
                placeholder="Ex: Minha Nova Música"
                value={state.releaseTitle || ''}
                onChange={(e) => handleChange('releaseTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Featuring */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featuring <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: feat. Outro Artista"
                value={state.feat || ''}
                onChange={(e) => handleChange('feat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Player do Spotify */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaSpotify className="mr-2 text-green-500" />
          Player da Música
        </h3>
        
        <div className="space-y-4">
          {/* Dica sobre o player do Spotify */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-sm mb-2">
            {state.playerUrl
              ? 'Você ativou o player do Spotify! O player será exibido no lugar da capa e informações personalizadas no seu Smart Link. Para mostrar sua arte e detalhes, deixe o campo do player vazio.'
              : 'Dica: Se você preencher o campo do player do Spotify, o player será exibido sozinho no seu Smart Link, ocupando o espaço principal. Para mostrar capa e informações, deixe o campo vazio.'}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Link do Spotify (ex: open.spotify.com/track/...)"
              value={state.playerUrl || ''}
              onChange={(e) => handleChange('playerUrl', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowSpotifyHelp(!showSpotifyHelp)}
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              <FaInfoCircle />
            </button>
          </div>
          
          {showSpotifyHelp && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Como encontrar o link:</strong><br/>
                1. Abra sua música no Spotify<br/>
                2. Clique nos três pontos (...)<br/>
                3. Selecione "Compartilhar" → "Copiar link"
              </p>
            </div>
          )}
          
          {state.playerUrl && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaPlay className="text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">Player configurado</p>
                    <p className="text-sm text-gray-500">Spotify integrado</p>
                  </div>
                </div>
                <FaCheckCircle className="text-green-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseInfoStep;
