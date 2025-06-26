import React from 'react';

interface CustomColorsFormProps {
  customColors: { [key: string]: string } | undefined;
  handleCustomColorChange: (colorName: string, value: string) => void;
}

const CustomColorsForm: React.FC<CustomColorsFormProps> = ({
  customColors,
  handleCustomColorChange,
}) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">Cores Personalizadas do Template</h3>
      <p className="text-xs text-gray-500 mb-4">
        Personalize a aparência do seu Smart Link. As cores são aplicadas de forma inteligente em cada template.
        Se um campo for deixado em branco, a cor padrão do template será usada.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label htmlFor="customBackground" className="block text-sm font-medium text-gray-700 mb-1">Fundo da Página</label>
          <input
            type="color"
            id="customBackground"
            value={customColors?.background || '#000000'} // Default to black for picker
            onChange={(e) => handleCustomColorChange('background', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor principal do fundo da página do seu Smart Link.</p>
        </div>
        <div>
          <label htmlFor="customText" className="block text-sm font-medium text-gray-700 mb-1">Texto Principal</label>
          <input
            type="color"
            id="customText"
            value={customColors?.text || '#FFFFFF'} // Default to white
            onChange={(e) => handleCustomColorChange('text', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor para textos gerais, como descrições e rodapé.</p>
        </div>
        <div>
          <label htmlFor="customPrimary" className="block text-sm font-medium text-gray-700 mb-1">Cor Primária (Destaque)</label>
          <input
            type="color"
            id="customPrimary"
            value={customColors?.primary || '#FF0000'} // Default to red
            onChange={(e) => handleCustomColorChange('primary', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor de destaque para títulos importantes, nomes de artista ou elementos chave.</p>
        </div>
        <div>
          <label htmlFor="customSecondary" className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária (Detalhes)</label>
          <input
            type="color"
            id="customSecondary"
            value={customColors?.secondary || '#808080'} // Default to gray
            onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor para subtítulos, informações de apoio ou fundo de seções internas.</p>
        </div>
        <div>
          <label htmlFor="customButtonBackground" className="block text-sm font-medium text-gray-700 mb-1">Fundo dos Botões</label>
          <input
            type="color"
            id="customButtonBackground"
            value={customColors?.button_background || '#333333'} // Default to dark gray
            onChange={(e) => handleCustomColorChange('button_background', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor de fundo para os botões de plataformas e links.</p>
        </div>
        <div>
          <label htmlFor="customButtonText" className="block text-sm font-medium text-gray-700 mb-1">Texto dos Botões</label>
          <input
            type="color"
            id="customButtonText"
            value={customColors?.button_text || '#FFFFFF'} // Default to white
            onChange={(e) => handleCustomColorChange('button_text', e.target.value)}
            className="w-full h-10 p-1 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Cor do texto dentro dos botões de plataformas e links.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomColorsForm;
