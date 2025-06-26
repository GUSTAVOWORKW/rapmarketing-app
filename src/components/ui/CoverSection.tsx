// src/components/ui/CoverSection.tsx
import React from 'react';

interface CoverSectionProps {
  coverImageUrl?: string | null;
  coverImageClickUrl?: string | null; // Nova prop
  title?: string | null;
  description?: string | null;
  artistName?: string; // Adicionado para exibir o nome do artista/usuário
  avatarUrl?: string | null; // Avatar do usuário
  templateStyles?: {
    // Estilos específicos do template podem ser passados aqui
    container?: string;
    image?: string;
    title?: string;
    description?: string;
    artistName?: string;
    avatar?: string;
  };
}

const CoverSection: React.FC<CoverSectionProps> = ({
  coverImageUrl,
  coverImageClickUrl,
  title,
  description,
  artistName,
  avatarUrl,
  templateStyles = {},
}) => {
  const coverImageContent = coverImageUrl && (
    <img 
      src={coverImageUrl} 
      alt={title || 'Cover Art'} 
      className={`w-full max-w-md mx-auto h-auto object-cover rounded-lg shadow-xl mb-6 ${templateStyles.image || ''}`} 
    />
  );

  return (
    <div className={`w-full text-center p-6 bg-gray-800 text-white ${templateStyles.container || ''}`}>
      {avatarUrl && (
        <img 
          src={avatarUrl} 
          alt={artistName || 'User Avatar'} 
          className={`w-24 h-24 rounded-full mx-auto mb-4 shadow-lg ${templateStyles.avatar || ''}`} 
        />
      )}
      {coverImageClickUrl && coverImageUrl ? (
        <a href={coverImageClickUrl} target="_blank" rel="noopener noreferrer">
          {coverImageContent}
        </a>
      ) : (
        coverImageContent
      )}
      {artistName && (
        <h1 className={`text-3xl font-bold mb-2 ${templateStyles.artistName || ''}`}>
          {artistName}
        </h1>
      )}
      {title && (
        <h2 className={`text-2xl font-semibold mb-2 ${templateStyles.title || ''}`}>
          {title}
        </h2>
      )}
      {description && (
        <p className={`text-md text-gray-300 ${templateStyles.description || ''}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default CoverSection; // Adicionada a exportação padrão
