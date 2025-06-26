import React from 'react';

/**
 * SmartLinkMobilePreview
 * Um mockup moderno de smartphone especificamente projetado para previews de Smart Links
 * Com design premium e detalhes realistas para uma melhor experiência visual
 */
interface SmartLinkMobilePreviewProps {
  children: React.ReactNode;
  className?: string;
  deviceColor?: 'black' | 'white' | 'gold' | 'purple';
  size?: 'normal' | 'compact';
  showLabel?: boolean;
}

const SmartLinkMobilePreview: React.FC<SmartLinkMobilePreviewProps> = ({ 
  children, 
  className = '',
  deviceColor = 'black',
  size = 'normal',
  showLabel = true
}) => {
  const getDeviceColors = () => {
    switch (deviceColor) {
      case 'white':
        return {
          frame: 'bg-gray-100 border-gray-300',
          speaker: 'bg-gray-800',
          camera: 'bg-gray-800',
          button: 'bg-gray-400'
        };
      case 'gold':
        return {
          frame: 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500',
          speaker: 'bg-gray-800',
          camera: 'bg-gray-800',
          button: 'bg-yellow-500'
        };
      case 'purple':
        return {
          frame: 'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-700',
          speaker: 'bg-gray-200',
          camera: 'bg-gray-800',
          button: 'bg-purple-500'
        };
      default: // black
        return {
          frame: 'bg-gradient-to-br from-gray-800 to-black border-gray-900',
          speaker: 'bg-gray-600',
          camera: 'bg-gray-800',
          button: 'bg-gray-700'
        };
    }
  };

  const colors = getDeviceColors();
  
  const dimensions = size === 'compact' 
    ? { width: 'w-[280px]', height: 'h-[560px]', rounded: 'rounded-[35px]' }
    : { width: 'w-[340px]', height: 'h-[680px]', rounded: 'rounded-[45px]' };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Sombra e base do dispositivo */}
      <div className="relative">        {/* Sombra principal */}
        <div className={`absolute inset-0 bg-black/20 blur-xl transform translate-y-8 scale-95 ${dimensions.rounded}`}></div>
        
        {/* Corpo do smartphone */}
        <div className={`relative ${dimensions.width} ${dimensions.height} ${colors.frame} ${dimensions.rounded} shadow-2xl border-2 p-2`}>
          {/* Detalhes realistas do iPhone */}
          
          {/* Notch (entalhe) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10 flex items-center justify-center">
            {/* Alto-falante */}
            <div className={`w-12 h-1 ${colors.speaker} rounded-full`}></div>
          </div>

          {/* Câmera frontal */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 translate-x-8 w-3 h-3 bg-gray-800 rounded-full z-10 ring-1 ring-gray-600"></div>

          {/* Botão lateral de volume */}
          <div className={`absolute left-0 top-24 w-1 h-8 ${colors.button} rounded-r-sm`}></div>
          <div className={`absolute left-0 top-36 w-1 h-8 ${colors.button} rounded-r-sm`}></div>

          {/* Botão de energia */}
          <div className={`absolute right-0 top-32 w-1 h-12 ${colors.button} rounded-l-sm`}></div>          {/* Tela principal */}
          <div className="w-full h-full bg-white overflow-hidden relative rounded-[30px]" style={{ clipPath: 'inset(0 round 30px)' }}>
            {/* Conteúdo da tela - área scrollável do Smart Link */}
            <div className="w-full h-full bg-white overflow-auto scrollbar-hide">
              <div className="pb-4">
                {children}
              </div>
            </div>

            {/* Indicador home (para iPhones mais novos) */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
          </div>          {/* Reflexos e brilhos */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[45px] pointer-events-none"></div>
          <div className="absolute top-4 left-4 w-8 h-16 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-sm pointer-events-none"></div>
        </div>
        
        {/* Efeito de profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 rounded-[45px] pointer-events-none"></div>
      </div>      {/* Label opcional */}
      {showLabel && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500 font-medium">Preview do Smart Link</div>
          <div className="text-xs text-gray-400 mt-1">Visualização em tempo real</div>
        </div>
      )}      {/* Estilos customizados para esconder scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SmartLinkMobilePreview;
