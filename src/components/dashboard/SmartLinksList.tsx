// src/components/dashboard/SmartLinksList.tsx
import React from 'react';
import { SmartLink } from '../../types';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { FaTrash, FaLink } from 'react-icons/fa'; // Example icons

interface SmartLinksListProps {
  links: SmartLink[];
  onDelete: (linkId: string) => void;
  loading?: boolean;
  error?: any;
  username?: string; // Username for constructing edit links
}

const SmartLinksList: React.FC<SmartLinksListProps> = ({
  links,
  onDelete,
  loading,
  error,
  username
}) => {
  if (loading) {
    return <p className="text-center text-gray-500">Carregando seus links...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erro ao carregar links: {error.message}</p>;
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-10">
        <FaLink className="mx-auto text-gray-400 text-6xl mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum Smart Link encontrado.</h3>
        <p className="text-gray-500 mb-6">Comece criando seu primeiro Smart Link para compartilhar suas músicas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div 
          key={link.id} 
          className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center"
        >
          <div className="flex-grow mb-3 sm:mb-0">
            <h4 className="text-lg font-semibold text-gray-800 truncate" title={link.title || 'Link Sem Título'}>
              {link.title || 'Link Sem Título'}
            </h4>
            <p className="text-sm text-gray-500">
              Template: <span className="font-medium">{link.template_id}</span>
            </p>
            {username && (
                <a 
                    href={`/${username}/${link.id}`} // Assuming a public link structure like /username/linkId
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center"
                >
                    <FaLink className="mr-1" /> Ver Link Público 
                </a>
            )}
          </div>
          <div className="flex space-x-2 flex-shrink-0">
            <button
              onClick={() => onDelete(link.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
              title="Excluir Link"
            >
              <FaTrash size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartLinksList;
