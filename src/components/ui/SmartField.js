import React from 'react';
import InfoTooltip from './InfoTooltip'; // Assume-se que InfoTooltip.js está no mesmo diretório

/**
 * SmartField é um componente wrapper para campos de formulário.
 * Ele fornece um rótulo com uma tooltip opcional e um local para texto de exemplo.
 * 
 * @param {object} props
 * @param {string} props.label - O texto do rótulo para o campo.
 * @param {string} [props.idForLabel] - O id para o campo de entrada, usado para o `htmlFor` no rótulo.
 * @param {string} [props.tooltipText] - Texto opcional para um InfoTooltip ao lado do rótulo.
 * @param {string} [props.exampleText] - Texto de exemplo opcional exibido abaixo do campo.
 * @param {React.ReactNode} props.children - O(s) elemento(s) do campo de entrada (por exemplo, <input />, <select />, ou um div contendo vários elementos).
 */
const SmartField = ({ label, idForLabel, tooltipText, exampleText, children }) => {
  if (!idForLabel && label) {
    console.warn(`SmartField (rótulo: "${label}"): a propriedade 'idForLabel' não foi fornecida. Isso é recomendado para acessibilidade do rótulo.`);
  }

  return (
    <div className="mb-4"> {/* Margem inferior padrão para espaçamento de campo */}
      {label && (
        <label htmlFor={idForLabel} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {tooltipText && <InfoTooltip text={tooltipText} />}
        </label>
      )}
      {children} {/* Renderiza os filhos diretamente */}
      
      {exampleText && (
        <p className="text-xs text-green-600 mt-1">{exampleText}</p>
      )}
    </div>
  );
};

export default SmartField;
