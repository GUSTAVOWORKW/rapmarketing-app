// components/smartlink/FormSteps/ArtistInfoStep.tsx
import React from 'react';
import { useSmartLinkForm } from '../../../context/smartlink/SmartLinkFormContext';
import { FaUser, FaCamera, FaEdit, FaPalette } from 'react-icons/fa';

// As props foram removidas, o componente agora consome o contexto diretamente.
interface ArtistInfoStepProps {}

const ArtistInfoStep: React.FC<ArtistInfoStepProps> = () => {
  const { state, updateField, generateSlug } = useSmartLinkForm();

  const handleArtistNameChange = (value: string) => {
    updateField('artistName', value);
    const newSlug = generateSlug(value);
    updateField('slug', newSlug);
  };

  const handleChange = (field: keyof typeof state, value: string) => {
    updateField(field, value);
  };  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Limpar blob URL anterior se existir
      if (state.avatarUrl && state.avatarUrl.startsWith('blob:')) {        URL.revokeObjectURL(state.avatarUrl);
      }
      
      const previewUrl = URL.createObjectURL(file);
      
      // Atualizar tanto o arquivo quanto a URL de preview
      updateField('avatarFile', file);
      updateField('avatarUrl', previewUrl);
    }
  };

  // O useEffect de cleanup foi removido daqui para evitar que a URL do blob seja revogada prematuramente ao navegar entre os passos.
  // A limpeza agora deve ser gerenciada de forma mais centralizada, por exemplo, no reset do formulário ou ao selecionar uma nova imagem.

  return (
    <div className="space-y-6">
      {/* Header Simples */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full mb-3">
          <FaUser className="mr-2" />
          <span className="font-semibold">Informações do Artista</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure seu perfil</h2>
        <p className="text-gray-600">Adicione suas informações pessoais</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Informações Básicas */}
        <div className="space-y-4 order-1 md:order-1">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaEdit className="mr-2 text-indigo-500" />
              Informações Básicas
            </h3>
            <div className="space-y-4">
              {/* Nome do Artista */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Artista <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={state.artistName}
                  onChange={(e) => handleArtistNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: MC Trovão"
                  required
                />
              </div>
              {/* Subtítulo do Artista */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtítulo do Artista
                </label>
                <input
                  type="text"
                  value={state.artistTitle}
                  onChange={(e) => handleChange('artistTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Rapper | Produtor | Da Quebrada"
                />
              </div>
              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição/Bio
                </label>
                <textarea
                  value={state.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                  placeholder="Conte um pouco sobre você ou sua música..."
                />
              </div>
            </div>
          </div>
          {/* Template Selection */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FaPalette className="mr-2 text-purple-500" />
              Template do Smart Link
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Escolha o visual do seu Smart Link
              </label>              <select
                value={state.template}
                onChange={(e) => handleChange('template', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >                <option value="noitecarioca">🌃 Noite Carioca - Boate e Luxo</option>
                <option value="pordosolnoarpoador">🌅 Pôr do Sol no Arpoador - Praia e Verão</option>
                <option value="bailedefavela">🔥 Baile de Favela - Urbano & Industrial</option>
                <option value="batalhaholografica">⚡ Batalha Holográfica - Hip-Hop & Funk</option>
                <option value="sertaoholografico">🌵 Sertão Holográfico - Forró & Nordeste</option>
                <option value="afrofuturismo">👑 Afrofuturismo - Cultura Africana & Sci-Fi</option>
                <option value="circomagico">🎪 Circo Mágico - Circo Vintage & Mágico</option>
                <option value="reggaecosmic">🌌 Reggae Cosmic - Rastafári & Cosmos</option>
                <option value="amazoniadigital">🌳 Amazônia Digital - Floresta & Tecnologia</option>
                <option value="bailepulsante">🔊 Baile Pulsante - Funk & Grave Batendo</option>
                <option value="savanavibrante">🦁 Savana Vibrante - Afrobeat & Natureza</option>
              </select>
            </div>
          </div>
        </div>
        {/* Coluna Direita - Avatar + Dica */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center order-2 md:order-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaCamera className="mr-2 text-blue-500" />
            Foto do Perfil
          </h3>
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative group">
              <img 
                src={state.avatarUrl || '/avatars/perfilhomem1.png'} 
                alt="Avatar do artista" 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-blue-100 shadow-lg group-hover:shadow-xl transition-all duration-300"
                onError={(e) => {
                  const defaultImage = '/avatars/perfilhomem1.png';
                  (e.target as HTMLImageElement).src = defaultImage;
                  if (state.avatarUrl !== defaultImage) {
                    updateField('avatarUrl', defaultImage);
                  }
                }}
              />
              {/* Overlay para trocar imagem */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-full transition-all duration-300 flex items-center justify-center">
                <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white text-gray-800 px-3 py-1 rounded-lg font-medium flex items-center text-sm">
                    <FaCamera className="mr-1" />
                    Trocar
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Clique na imagem para alterar</p>
            {/* Dica para ocupar espaço em branco */}
            <div className="mt-6 w-full">
              <div className="bg-blue-50 rounded-xl p-3 text-blue-700 text-sm text-center">
                💡 Dica: Use uma foto quadrada e de boa qualidade para um perfil mais profissional.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistInfoStep;
