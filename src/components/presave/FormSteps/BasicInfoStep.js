// components/presave/FormSteps/BasicInfoStep.js
import React from 'react';
import { FaMusic, FaCalendarAlt, FaPaintBrush, FaInfoCircle, FaLink, FaEye, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { usePresaveFormContext } from '../../../context/presave/PresaveFormContext';
import useSlugValidation from '../../../hooks/useSlugValidation';

// Template preview styles and icons
const getTemplatePreviewStyle = (templateId) => {
  const styles = {
    'holographic': 'bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900',
    'minimalist': 'bg-gradient-to-br from-yellow-100 via-orange-200 to-yellow-300',
    'street-holo': 'bg-gradient-to-br from-black via-gray-900 to-blue-500',
    'neon-glow': 'bg-gradient-to-br from-pink-900 via-purple-900 to-cyan-900',
    'vintage-vinyl': 'bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900',
    'modern-card': 'bg-gradient-to-br from-orange-500 via-yellow-600 to-cyan-500',
    'noite-carioca': 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800'
  };
  return styles[templateId] || 'bg-gradient-to-br from-gray-100 to-gray-200';
};

const getTemplateIcon = (templateId) => {
  const icons = {
    'holographic': '💰',
    'minimalist': '🌵',
    'street-holo': '1️⃣7️⃣',
    'neon-glow': '⚡',
    'vintage-vinyl': '🎵',
    'modern-card': '🌅',
    'noite-carioca': '🌃'
  };
  return icons[templateId] || '🎨';
};

// Templates disponíveis (movido do parent)
const templates = [
  { id: 'holographic', name: 'Trap Future', description: 'Holograma futurista com efeitos trap' },
  { id: 'minimalist', name: 'Repente Rústico', description: 'A poesia da rua com a força do sertão - xilogravura digital' },
  { id: 'street-holo', name: 'Ritmo da D17', description: 'Bailes de rua de SP - energia visceral dos rolês da quebrada' },
  { id: 'neon-glow', name: 'Cyberpunk Trap', description: 'Neon cyber para trap e hip-hop' },
  { id: 'vintage-vinyl', name: 'Old School', description: 'Retrô vinil para rap clássico' },
  { id: 'modern-card', name: 'Funk Moderno', description: 'Baile funk no pôr do sol carioca com energia vibrante' },
  { id: 'noite-carioca', name: 'Noite Carioca', description: 'A ambição, a rua e a melancolia - visual cinematográfico noturno' },
];

const BasicInfoStep = ({ errors = {} }) => {
  // Usar Context em vez de props
  const { state, actions } = usePresaveFormContext();
  
  // Validação de slug em tempo real
  const slugValidation = useSlugValidation(state.shareableSlug);

  const handleFieldChange = (field, value) => {
    actions.updateField(field, value);
  };
  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    actions.updateField('selectedTemplate', template);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header simplificado */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Informações Básicas
        </h1>
        <p className="text-base md:text-lg text-gray-600">
          Configure os dados principais do seu pré-save
        </p>
      </div>

      {/* Todo o conteúdo em uma página */}
      <div className="space-y-8">        {/* Dados Básicos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
              <FaMusic className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dados da Música</h2>
              <p className="text-gray-600">Informações básicas do seu lançamento</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nome do Artista *
              </label>
              <input
                type="text"
                value={state.artistName}
                onChange={(e) => handleFieldChange('artistName', e.target.value)}
                placeholder="Ex: MC Exemplo"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.artistName ? 'border-red-500' : 'border-gray-200'
                }`}
                maxLength={50}
              />
              {errors.artistName && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  {errors.artistName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nome da Faixa *
              </label>
              <input
                type="text"
                value={state.trackName}
                onChange={(e) => handleFieldChange('trackName', e.target.value)}
                placeholder="Ex: Novo Hit 2025"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.trackName ? 'border-red-500' : 'border-gray-200'
                }`}
                maxLength={100}
              />
              {errors.trackName && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  {errors.trackName}
                </p>
              )}
            </div>
          </div>
        </div>        {/* Data de Lançamento */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
              <FaCalendarAlt className="text-purple-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Data de Lançamento</h2>
              <p className="text-gray-600">Quando sua música será lançada</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Data e Hora do Lançamento *
              </label>
              <input
                type="datetime-local"
                value={state.releaseDate}
                onChange={(e) => handleFieldChange('releaseDate', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.releaseDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.releaseDate && (
                <p className="text-red-500 text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  {errors.releaseDate}
                </p>
              )}
              <p className="text-gray-500 text-sm flex items-center">
                <FaInfoCircle className="mr-1" />
                Esta data aparecerá no countdown da página
              </p>
            </div>
            
            {/* Informações adicionais sobre a data */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Dica:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Defina a data exata do lançamento</li>
                <li>• Um countdown será exibido até essa data</li>
                <li>• Após o lançamento, será mostrada a data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Escolha de Template */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
              <FaPaintBrush className="text-pink-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Escolha seu Visual</h2>
              <p className="text-gray-600">Selecione o template para sua página de pré-save</p>
            </div>
          </div>

          {/* Templates Grid - Responsivo e Compacto */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-lg transform hover:scale-105 group ${
                  state.selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Template Preview */}
                <div className={`aspect-[3/4] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden ${getTemplatePreviewStyle(template.id)}`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
                  <div className="relative z-10 text-center text-white">
                    <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
                      {getTemplateIcon(template.id)}
                    </div>
                    <div className="text-xs font-bold bg-black bg-opacity-40 px-2 py-1 rounded-full">
                      Preview
                    </div>
                  </div>
                  
                  {/* Preview overlay */}
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <FaEye className="text-white text-lg opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100" />
                  </div>
                </div>
                
                {/* Template Info - Só o nome */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{template.name}</h3>
                </div>

                {/* Selected Indicator */}
                {state.selectedTemplate?.id === template.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Color Picker - Compacto */}
          {state.selectedTemplate && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FaPaintBrush className="mr-2 text-blue-500" />
                Cor de Destaque
              </h3>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={state.templateBackgroundColor}
                  onChange={(e) => handleFieldChange('templateBackgroundColor', e.target.value)}
                  className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                />
                <div className="flex-1 max-w-xs">
                  <input
                    type="text"
                    value={state.templateBackgroundColor}
                    onChange={(e) => handleFieldChange('templateBackgroundColor', e.target.value)}
                    placeholder="#000000"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <div 
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0" 
                  style={{ backgroundColor: state.templateBackgroundColor }}
                ></div>
              </div>
            </div>
          )}

          {errors.selectedTemplate && (
            <p className="text-red-500 text-sm mb-6 flex items-center">
              <FaInfoCircle className="mr-2" />
              {errors.selectedTemplate}
            </p>
          )}
        </div>

        {/* URL Personalizada */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
              <FaLink className="text-green-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Link Personalizado</h2>
              <p className="text-gray-600">Crie um URL único para sua página (opcional)</p>
            </div>
          </div>
          
          <div className="max-w-2xl">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                URL do seu pré-save
              </label>              <div className="flex rounded-xl border-2 border-gray-200 focus-within:border-blue-500 transition-all overflow-hidden">
                <span className="inline-flex items-center px-4 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-200">
                  rapmarketing.link/presave/
                </span>
                <input
                  type="text"
                  value={state.shareableSlug}
                  onChange={(e) => handleFieldChange('shareableSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="meu-novo-hit"
                  className="flex-1 px-4 py-3 focus:outline-none"
                  maxLength={50}
                />
                {state.shareableSlug && (
                  <div className="inline-flex items-center px-3">
                    {slugValidation.checking ? (
                      <FaSpinner className="animate-spin text-gray-400" />
                    ) : slugValidation.available ? (
                      <FaCheck className="text-green-500" />
                    ) : (
                      <FaTimes className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {state.shareableSlug && slugValidation.message && (
                <p className={`text-sm flex items-center ${
                  slugValidation.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  <FaInfoCircle className="mr-1" />
                  {slugValidation.message}
                </p>
              )}
              {!state.shareableSlug && (
                <p className="text-gray-500 text-sm flex items-center">
                  <FaInfoCircle className="mr-1" />
                  Se deixar vazio, será gerado automaticamente baseado no nome da faixa
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
