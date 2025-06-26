import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface DeviceData {
  type?: string;
  os?: string;
  browser?: string;
  count: number;
  name?: string; // Adicionado para unificar a prop name
}

interface DeviceDataSectionProps {
  deviceTypes: Array<{ type: string; count: number }>;
  osTypes: Array<{ os: string; count: number }>;
  browserTypes: Array<{ browser: string; count: number }>;
  colors: string[];
  isLoading?: boolean;
}

const DeviceDataSection: React.FC<DeviceDataSectionProps> = ({
  deviceTypes,
  osTypes,
  browserTypes,
  colors, // Usará as cores passadas de SmartLinkMetrics, já ajustadas para tema claro
  isLoading,
}) => {
  const renderPieChart = (data: DeviceData[], dataKey: string, nameKey: string, title: string) => {
    const chartData = data.map(item => ({ name: item[nameKey as keyof DeviceData] as string, value: item.count }));
    if (!chartData || chartData.length === 0) {
      return <p className="text-gray-500">Não há dados de {title.toLowerCase()} para exibir.</p>;
    }

    return (
      <div className="w-full md:w-1/3 p-2">
        <h3 className="text-lg font-semibold mb-2 text-center text-red-400">{title}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#EF4444" // Cor de preenchimento padrão (vermelho)
              dataKey="value"
              nameKey="name"
              label={({ name, percent }: { name: string; percent?: number }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }} // Estilo tooltip tema claro
              labelStyle={{ color: '#374151' }} // text-gray-700
              itemStyle={{ color: '#374151' }} // text-gray-700
              formatter={(value: string | number | (string | number)[], name: string) => {
                const numericValue = typeof value === 'number' ? value : parseFloat(String(value));
                return [numericValue, name];
              }}
            />
            <Legend wrapperStyle={{ color: '#374151' }} /> {/* text-gray-700 */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">Dados de Dispositivo</h2>
        <p className="text-gray-600">Carregando dados de dispositivo...</p>
      </section>
    );
  }

  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">Dados de Dispositivo</h2>
      <div className="flex flex-wrap justify-around items-start">
        {renderPieChart(deviceTypes.map(dt => ({...dt, name: dt.type})), 'count', 'type', 'Tipos de Dispositivo')}
        {renderPieChart(osTypes.map(ot => ({...ot, name: ot.os})), 'count', 'os', 'Sistemas Operacionais')}
        {renderPieChart(browserTypes.map(bt => ({...bt, name: bt.browser})), 'count', 'browser', 'Navegadores')}
      </div>
    </section>
  );
};

export default DeviceDataSection;
