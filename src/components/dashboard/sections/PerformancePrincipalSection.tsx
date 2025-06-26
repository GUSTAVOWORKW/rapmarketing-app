import React from 'react';

interface PerformancePrincipalSectionProps {
  totalClicks: number;
  mostPopularPlatform: string;
  engagementRate: number;
  previousTotalClicks?: number;
  previousEngagementRate?: number;
  calculatePercentageChange: (current: number, previous?: number) => string | null;
  loadingPrevious?: boolean;
  totalViews?: number; // Adicionado para a lógica de "Visualizações totais não disponíveis"
}

const PerformancePrincipalSection: React.FC<PerformancePrincipalSectionProps> = ({
  totalClicks,
  mostPopularPlatform,
  engagementRate,
  previousTotalClicks,
  previousEngagementRate,
  calculatePercentageChange,
  loadingPrevious,
  totalViews,
}) => {
  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
        Performance Principal
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de Cliques */}
        <div className="p-4 bg-white/80 rounded-xl shadow border border-[#e9e6ff] text-center">
          <h3 className="text-lg font-semibold text-[#3100ff]">Total de Cliques</h3>
          <p className="text-3xl font-bold text-gray-800">
            {totalClicks}
            {previousTotalClicks !== undefined && (
              <span className={`text-sm ml-2 ${calculatePercentageChange(totalClicks, previousTotalClicks)?.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                {calculatePercentageChange(totalClicks, previousTotalClicks)}
              </span>
            )}
          </p>
          {loadingPrevious && previousTotalClicks === undefined && <p className="text-xs text-gray-500">Comparando...</p>}
        </div>

        {/* Plataforma Mais Popular */}
        <div className="p-4 bg-white/80 rounded-xl shadow border border-[#e9e6ff] text-center">
          <h3 className="text-lg font-semibold text-[#3100ff]">Plataforma Mais Popular</h3>
          <p className="text-3xl font-bold text-gray-800">{mostPopularPlatform !== 'N/A' ? mostPopularPlatform : '-'}</p>
          {mostPopularPlatform === 'N/A' && <p className="text-xs text-gray-500">Nenhum clique em plataforma específica ainda.</p>}
        </div>

        {/* Taxa de Engajamento */}
        <div className="p-4 bg-white/80 rounded-xl shadow border border-[#e9e6ff] text-center">
          <h3 className="text-lg font-semibold text-[#3100ff]">Taxa de Engajamento</h3>
          <p className="text-3xl font-bold text-gray-800">
            {(engagementRate * 100).toFixed(1)}%
            {previousEngagementRate !== undefined && (
              <span className={`text-sm ml-2 ${calculatePercentageChange(engagementRate, previousEngagementRate)?.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                {calculatePercentageChange(engagementRate, previousEngagementRate)}
              </span>
            )}
          </p>
          {loadingPrevious && previousEngagementRate === undefined && <p className="text-xs text-gray-500">Comparando...</p>}
          {totalViews === 0 && totalClicks > 0 && <p className="text-xs text-gray-500">Visualizações totais não disponíveis para cálculo preciso.</p>}
        </div>
      </div>
    </section>
  );
};

export default PerformancePrincipalSection;
