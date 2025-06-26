import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Removido FaGripVertical

const InteractiveInput = ({
  platformId,
  value,
  onChange,
  platformData, // Espera um objeto como { name, icon, validation, placeholder_url, color }
  categoryName, // ex: "platforms", "socialLinks", "contactLinks"
  onValidationChange, // (platformId, isValid) => void
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(null); // null, true, false

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue === '' && !platformData.required) {
      setIsValid(null); 
      if (onValidationChange) onValidationChange(platformId, true);
      return;
    }
    if (platformData && platformData.validation) {
      const valid = platformData.validation.test(inputValue);
      setIsValid(valid);
      if (onValidationChange) onValidationChange(platformId, valid);
    } else {
      setIsValid(null); 
      if (onValidationChange) onValidationChange(platformId, true);
    }
  }, [inputValue, platformData, platformId, onValidationChange]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(platformId, newValue, categoryName);
    }
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const IconComponent = platformData?.icon;
  const platformColor = platformData?.color || '#cccccc';

  const showLabelAsFloating = isFocused || inputValue;

  // NOVA LÓGICA REVISADA PARA CLASSES DO INPUT
  const baseInputClasses = "w-full p-4 pl-12 pr-10 border rounded-md shadow-sm text-sm transition-all duration-300 ease-in-out peer focus:ring-2";
  
  let stateSpecificInputClasses = "";

  if (isValid === true && inputValue) { // Válido e com valor
    stateSpecificInputClasses = "text-green-700 border-green-500 bg-green-50 focus:border-green-600 focus:ring-green-500/50";
  } else if (isValid === false && inputValue) { // Inválido e com valor
    stateSpecificInputClasses = "text-red-700 border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-500/50";
  } else if (isFocused) { // Focado, mas não (ainda) válido/inválido ou sem valor que ative validação
    stateSpecificInputClasses = "text-gray-900 border-blue-500 bg-white focus:border-blue-500 focus:ring-blue-500/50";
  } else { // Estado padrão: não focado, sem valor que dispare validação explícita, ou campo vazio não obrigatório
    stateSpecificInputClasses = "text-gray-900 border-gray-300 bg-white";
  }
  
  const inputFinalClassName = `${baseInputClasses} ${stateSpecificInputClasses}`;

  // LÓGICA REVISADA PARA CLASSES DO LABEL
  let labelClasses = "absolute left-12 transition-all duration-300 ease-in-out pointer-events-none px-1 ";
  if (showLabelAsFloating) {
    labelClasses += "top-0 -translate-y-1/2 text-xs bg-white "; // bg-white para sobrepor a borda do input
    if (isValid === true && inputValue) {
      labelClasses += "text-green-600";
    } else if (isValid === false && inputValue) {
      labelClasses += "text-red-600";
    } else if (isFocused) {
      labelClasses += "text-blue-600";
    } else { 
      labelClasses += "text-gray-500"; // Cor para label flutuante com valor mas sem foco/validação ativa
    }
  } else { // Label no lugar do placeholder
    labelClasses += "top-1/2 -translate-y-1/2 text-sm text-gray-400";
  }
  // Removidas classes peer-focus do label para simplificar, confiando em isFocused.

  return (
    <div className="relative w-full group">      <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none z-10 transition-colors duration-300`}>
        {IconComponent && (
          <div 
            style={{ 
              color: (isFocused || (isValid === true && inputValue)) ? platformColor : '#9ca3af',
              fontSize: '20px'
            }}
          >
            {IconComponent()}
          </div>
        )}
      </div>
      
      <input
        type="url"
        id={`${categoryName}-${platformId}`}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={inputFinalClassName}
      />
      
      <label
        htmlFor={`${categoryName}-${platformId}`}
        className={labelClasses} // ATUALIZADO AQUI
      >
        {platformData.name}
      </label>

      {/* Ícones de Validação à Direita */}
      {isValid === false && inputValue !== '' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
          <FaExclamationCircle size={18} />
        </div>
      )}
      {isValid === true && inputValue !== '' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
          <FaCheckCircle size={18} />
        </div>
      )}
    </div>
  );
};

export default InteractiveInput;
