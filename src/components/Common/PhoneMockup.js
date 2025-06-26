import React from 'react';

const PhoneMockup = ({ children, className = '' }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* iPhone Mockup */}
      <div className="relative">
        {/* Frame do iPhone */}
        <div className="relative w-[280px] h-[570px] bg-black rounded-[60px] p-2 shadow-2xl">
          {/* Reflexão do iPhone */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 rounded-[60px] pointer-events-none"></div>
          
          {/* Tela do iPhone */}
          <div className="relative w-full h-full bg-white rounded-[50px] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-black text-white px-6 py-2 text-xs flex justify-between items-center">
              <span className="font-medium">9:41</span>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="w-6 h-3 border border-white rounded-sm">
                  <div className="w-4 h-1 bg-white rounded-sm mt-0.5 ml-0.5"></div>
                </div>
              </div>
            </div>

            {/* Conteúdo do Template - Altura total disponível */}
            <div className="flex-1 overflow-hidden phone-mockup-content">
              <div className="h-full">
                {children}
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full"></div>
          </div>          {/* Câmera/Notch */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
        </div>
      </div>

      <style>{`
        .phone-mockup-content {
          /* Altura total menos status bar e home indicator */
          height: calc(100% - 40px); /* 40px = status bar + espaço do home indicator */
        }

        .phone-mockup-content::-webkit-scrollbar {
          display: none;
        }

        .phone-mockup-content {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PhoneMockup;
