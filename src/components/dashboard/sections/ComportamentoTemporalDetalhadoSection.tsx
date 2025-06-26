import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

interface PeakTimeData {
  hour: string;
  clicks: number;
}

interface ClicksByDayData {
  day: string;
  clicks: number;
}

interface ComportamentoTemporalDetalhadoSectionProps {
  peakTimes: PeakTimeData[];
  clicksByDayOfWeek: ClicksByDayData[];
  isLoading?: boolean;
}

const ComportamentoTemporalDetalhadoSection: React.FC<ComportamentoTemporalDetalhadoSectionProps> = ({
  peakTimes,
  clicksByDayOfWeek,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
          Comportamento Temporal Detalhado
        </h2>
        <p className="text-center text-gray-600">Carregando dados de comportamento temporal...</p>
      </section>
    );
  }

  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
        Comportamento Temporal Detalhado
      </h2>
      <div className="flex flex-wrap justify-around items-start -mx-2">
        {/* Horários de Pico */}
        <div className="w-full md:w-1/2 p-2">
          <div className="bg-white/80 rounded-xl shadow border border-[#e9e6ff] p-4">
            <h3 className="text-lg font-semibold mb-2 text-center text-[#3100ff]">Horários de Pico (Cliques por Hora)</h3>
            {peakTimes && peakTimes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={peakTimes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
                    labelStyle={{ color: '#374151' }}
                    itemStyle={{ color: '#374151' }}
                  />
                  <Legend wrapperStyle={{ color: '#374151' }} />
                  <Bar dataKey="clicks" fill="#3B82F6" name="Cliques" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500 text-center">Não há dados de horários de pico.</p>}
          </div>
        </div>

        {/* Cliques por Dia da Semana */}
        <div className="w-full md:w-1/2 p-2">
          <div className="bg-white/80 rounded-xl shadow border border-[#e9e6ff] p-4">
            <h3 className="text-lg font-semibold mb-2 text-center text-[#3100ff]">Cliques por Dia da Semana</h3>
            {clicksByDayOfWeek && clicksByDayOfWeek.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clicksByDayOfWeek} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
                    labelStyle={{ color: '#374151' }}
                    itemStyle={{ color: '#374151' }}
                  />
                  <Legend wrapperStyle={{ color: '#374151' }} />
                  <Bar dataKey="clicks" fill="#10B981" name="Cliques" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-gray-500 text-center">Não há dados de cliques por dia da semana.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComportamentoTemporalDetalhadoSection;
