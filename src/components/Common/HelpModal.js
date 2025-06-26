import React from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-md w-full m-4 relative transform transition-all duration-300 ease-out scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Fechar modal de ajuda"
        >
          <FaTimes size={20} />
        </button>
        <div className="flex items-center text-[#3100ff] mb-4">
          <FaInfoCircle size={24} className="mr-3" />
          <h2 className="text-2xl font-bold">Informações Importantes</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Capa do Single/EP/Álbum:</h3>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
              <li>A capa deve ter no mínimo 100x100 pixels e no máximo 5MB.</li>
              <li>Formatos aceitos: JPG, PNG, GIF.</li>
              <li>Evite imagens de baixa qualidade ou borradas.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Links de Streaming:</h3>
            <p className="text-sm">
              Adicione os links para as plataformas onde sua música estará disponível.
              Quanto mais plataformas, maior o alcance!
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Exemplos: link do Spotify, Apple Music, Deezer, YouTube Music, etc.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">Data de Lançamento:</h3>
            <p className="text-sm">
              A data em que sua música será lançada oficialmente em todas as plataformas.
              O pre-save será desativado automaticamente após essa data.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gradient-to-r from-[#3100ff] to-[#8F00FF] hover:from-[#2800cc] hover:to-[#7200cc] text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff] transition-all duration-150 ease-in-out"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
