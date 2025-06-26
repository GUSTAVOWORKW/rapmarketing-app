import React, { useState, useRef, useEffect } from 'react';
import { FaInfoCircle } from 'react-icons/fa'; // Mudando para FaInfoCircle que já está sendo usado no projeto

const InfoTooltip = ({ text, position = 'top', children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  // Para fechar o tooltip ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  let positionClasses = '';
  switch (position) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      break;
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
      break;
    case 'left':
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
      break;
    case 'right':
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
      break;
    default:
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
  }

  return (
    <div className="relative inline-flex items-center">
      {children} {/* Elemento ao qual o tooltip está associado, se houver */}      <span
        ref={iconRef}
        onClick={() => setIsVisible(!isVisible)} // Toggle on click
        onMouseEnter={showTooltip} // Show on hover for desktop
        onMouseLeave={hideTooltip} // Hide on mouse leave for desktop
        className="ml-2 cursor-pointer text-gray-500 hover:text-blue-500 transition-colors"
      >
        <FaInfoCircle size={16} />
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute ${positionClasses} z-50 w-max max-w-xs px-3 py-2 text-sm font-normal text-white bg-gray-800 rounded-lg shadow-lg break-words`}
        >
          {text}
          <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 ${position === 'top' ? '-bottom-1' : '-top-1'}`}></div> {/* Arrow */}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
