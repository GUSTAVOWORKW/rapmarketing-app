// src/components/ui/PlatformButton.tsx
import React from 'react';
import { IconType } from 'react-icons';

export interface PlatformButtonProps {
  platformName: string;
  platformUrl: string;
  icon: IconType;
  brandColor?: string; // Opcional, para estilização específica da marca
  onClick?: () => void; // Para casos de uso no editor, não para links diretos
  className?: string;
  style?: React.CSSProperties; // Adiciona a propriedade style
}

const PlatformButton: React.FC<PlatformButtonProps> = ({
  platformName,
  platformUrl,
  icon: Icon,
  brandColor,
  onClick,
  className = '',
  style // Recebe o style
}) => {
  const commonStyles = 
    'flex items-center justify-center w-full px-4 py-3 my-2 text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-transform transform hover:scale-105';
  
  // Combina o brandColor com o style recebido, dando prioridade ao style
  const combinedStyle = {
    backgroundColor: brandColor || '#333', 
    ...style, // Sobrescreve backgroundColor se style.backgroundColor estiver definido
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      e.preventDefault(); // Previne a navegação se for uma ação de edição
      onClick();
    } 
    // Se não houver onClick, o comportamento padrão do link (<a>) será seguido
  };

  const content = (
    <>
      {Icon && <Icon className="w-6 h-6 mr-3" />}
      <span>{platformName}</span>
    </>
  );

  if (onClick) {
    // Usar um botão se houver uma ação de clique personalizada (ex: no editor)
    return (
      <button 
        style={combinedStyle} 
        className={`${commonStyles} ${className}`}
        onClick={handleClick}
      >
        {content}
      </button>
    );
  } else {
    // Usar um link para navegação direta (ex: na página de perfil público)
    return (
      <a
        href={platformUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={combinedStyle}
        className={`${commonStyles} ${className}`}
      >
        {content}
      </a>
    );
  }
};

export default PlatformButton;
