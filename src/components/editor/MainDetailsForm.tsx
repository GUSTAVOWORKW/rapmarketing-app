import React from 'react';
import { FaImage, FaLink, FaQuestionCircle } from 'react-icons/fa';
import { SmartLink } from '../../types'; // Supondo que SmartLinkEditorFormData seja similar ou possa usar SmartLink diretamente

interface MainDetailsFormProps {
  formData: Partial<SmartLink> & { 
    cover_image_click_url?: string;
    player_url?: string; // Adicionar suporte ao player URL
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleArtistNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReleaseTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MainDetailsForm: React.FC<MainDetailsFormProps> = ({
  formData,
  handleInputChange,
  handleArtistNameChange,
  handleReleaseTitleChange,
}) => {
  return (
    <>
      {/* Campos Principais */}
      <div>
        <label htmlFor="artist_name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Artista <span className="text-red-400">*</span></label>
        <input
          type="text"
          name="artist_name"
          id="artist_name"
          value={formData.artist_name || ''}
          onChange={handleArtistNameChange}
          placeholder="Ex: Seu Nome Artístico"
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
          required
        />
      </div>
      <div>
        <label htmlFor="release_title" className="block text-sm font-medium text-gray-700 mb-1">Título da Música/Álbum <span className="text-red-400">*</span></label>
        <input
          type="text"
          name="release_title"
          id="release_title"
          value={formData.release_title || ''}
          onChange={handleReleaseTitleChange}
          placeholder="Ex: Nome da Sua Música"
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
          required
        />
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título do Link (Opcional, para SEO/Compartilhamento)</label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title || ''}
          onChange={handleInputChange}
          placeholder="Ex: Meu Novo Single!"
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
        />
      </div>      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
        <textarea
          name="description"
          id="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          rows={3}
          placeholder="Ex: Ouça agora em todas as plataformas..."
          className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
        />
      </div>
      
      {/* Campo para Player URL (Spotify, etc.) */}
      <div>
        <label htmlFor="player_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL do Player (opcional)
          <span title="Cole aqui o link direto da música no Spotify, Apple Music, etc. para mostrar o player no template. Ex: https://open.spotify.com/track/xyz" className="ml-1 text-gray-400 hover:text-gray-600 cursor-help inline-block align-middle">
            <FaQuestionCircle />
          </span>
        </label>
        <div className="flex items-center space-x-2">
            <FaLink className="text-gray-400"/>
            <input
            type="url"
            name="player_url"
            id="player_url"
            value={formData.player_url || ''}
            onChange={handleInputChange}
            placeholder="https://open.spotify.com/track/..."
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
            />
        </div>
        <p className="mt-1 text-xs text-gray-500">Cole o link da música para mostrar o player integrado (funciona com Spotify).</p>
      </div>
      <div>
        <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem de Capa (opcional)</label>
        <div className="flex items-center space-x-2">
            <FaImage className="text-gray-400"/>
            <input
            type="url"
            name="cover_image_url"
            id="cover_image_url"
            value={formData.cover_image_url || ''}
            onChange={handleInputChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
            />
        </div>
      </div>
      <div>
        <label htmlFor="cover_image_click_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL de Clique da Imagem de Capa (opcional)
          <span title="Se preenchido, clicar na imagem de capa no seu Smart Link levará o usuário para este URL. Ex: link direto para o álbum no Spotify." className="ml-1 text-gray-400 hover:text-gray-600 cursor-help inline-block align-middle">
            <FaQuestionCircle />
          </span>
        </label>
        <div className="flex items-center space-x-2">
            <FaLink className="text-gray-400"/>
            <input
            type="url"
            name="cover_image_click_url"
            id="cover_image_click_url"
            value={formData.cover_image_click_url || ''}
            onChange={handleInputChange}
            placeholder="https://exemplo.com/link-do-album"
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500"
            />
        </div>
        <p className="mt-1 text-xs text-gray-500">Se preenchido, clicar na imagem de capa levará a este URL.</p>
      </div>
    </>
  );
};

export default MainDetailsForm;
