import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PlatformData {
  name: string;
  clicks: number;
}

interface PlatformDistributionChartProps {
  data: PlatformData[];
  colors: string[];
  isLoading?: boolean;
}

const PlatformDistributionChart: React.FC<PlatformDistributionChartProps> = ({ data, colors, isLoading }) => {
  if (isLoading) {
    return (
      <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
          Distribuição de Cliques por Plataforma
        </h2>
        <p className="text-center text-gray-600">Carregando gráfico de distribuição...</p>
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
          Distribuição de Cliques por Plataforma
        </h2>
        <p className="text-gray-500 text-center">Não há dados de cliques por plataforma para exibir no gráfico.</p>
      </section>
    );
  }

  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">
        Distribuição de Cliques por Plataforma
      </h2>
      <div className="bg-white/80 rounded-xl shadow border border-[#e9e6ff] p-4">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#EF4444"
              dataKey="clicks"
              nameKey="name"
              label={({ name, percent }: { name: string; percent?: number }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
              labelStyle={{ color: '#374151' }}
              itemStyle={{ color: '#374151' }}
              formatter={(value: string | number | (string | number)[], name: string) => {
                const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
                return [numericValue, `${name} cliques`];
              }}
            />
            <Legend wrapperStyle={{ color: '#374151' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default PlatformDistributionChart;
