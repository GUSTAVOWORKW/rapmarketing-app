import React from 'react';

const TemplateSelector = ({ templates, selectedTemplateId, onSelectTemplate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => (
        <div
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl
            ${selectedTemplateId === template.id ? 'border-[#3100ff] scale-105 shadow-xl bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300'}`}
        >
          <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${
            template.previewColors || 'from-gray-400 to-gray-500' // Usa previewColors ou um padrão
          }`}>
            {template.name}
          </div>
          <h4 className="text-lg font-semibold text-center">{template.name}</h4>
          {/* Adicionar uma breve descrição se disponível */}
          {template.description && <p className="text-xs text-gray-500 text-center mt-1">{template.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default TemplateSelector;
