import React from 'react';

interface AdditionalEngagementMetricsSectionProps {
  averageTimeOnPage: string | null | undefined;
  conversionRate: number | null | undefined;
  recurringUsers: number | null | undefined;
  isLoading?: boolean;
}

const AdditionalEngagementMetricsSection: React.FC<AdditionalEngagementMetricsSectionProps> = ({
  averageTimeOnPage,
  conversionRate,
  recurringUsers,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className="mb-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-center text-red-500 border-b border-gray-200 pb-2">
          Métricas de Engajamento Adicionais
        </h2>
        <p className="text-center text-gray-600">Carregando métricas adicionais...</p>
      </section>
    );
  }

  return (
    <section className="mb-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center text-red-500 border-b border-gray-200 pb-2">
        Métricas de Engajamento Adicionais
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-gray-50 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-red-400">Tempo na Página (Médio)</h3>
          <p className="text-3xl font-bold text-gray-800">{averageTimeOnPage || '-'}</p> 
          {!averageTimeOnPage && <p className="text-xs text-gray-500">Dados indisponíveis</p>}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-red-400">Taxa de Conversão</h3>
          <p className="text-3xl font-bold text-gray-800">
            {conversionRate !== null && conversionRate !== undefined ? `${(conversionRate * 100).toFixed(1)}%` : '-'}
          </p>
          {conversionRate === null && <p className="text-xs text-gray-500">Dados indisponíveis</p>}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-red-400">Usuários Recorrentes</h3>
          <p className="text-3xl font-bold text-gray-800">{recurringUsers ?? '-'}</p>
          {recurringUsers === null && <p className="text-xs text-gray-500">Dados indisponíveis</p>}
        </div>
      </div>
    </section>
  );
};

export default AdditionalEngagementMetricsSection;
