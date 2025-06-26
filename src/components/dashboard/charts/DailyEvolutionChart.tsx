import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface DailyDataPoint {
  date: string;
  currentClicks: number;
  previousClicks?: number;
}

interface DailyEvolutionChartProps {
  data: DailyDataPoint[];
  isLoading: boolean;
}

const DailyEvolutionChart: React.FC<DailyEvolutionChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Carregando dados de evolução diária...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">Nenhum dado de evolução diária disponível.</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Ajuste para garantir que a data seja interpretada corretamente e não haja problemas de fuso horário
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const series = [
    {
      name: 'Cliques Atuais',
      data: data.map(item => item.currentClicks),
    },
  ];

  if (data.some(item => item.previousClicks !== undefined && item.previousClicks !== null)) {
    series.push({
      name: 'Cliques Período Anterior',
      data: data.map(item => item.previousClicks ?? 0), // Usa 0 se previousClicks for null/undefined
    });
  }

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      foreColor: '#374151', // text-gray-700
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
      dashArray: [0, 5],
    },
    title: {
      text: 'Evolução Diária de Cliques',
      align: 'center',
      style: {
        fontSize: '18px',
        color: '#1F2937', // text-gray-800
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      offsetY: 0,
      labels: {
        colors: ['#374151'], // text-gray-700
      },
      markers: {
        size: 6,
        strokeWidth: 0,
      },
    },
    markers: {
      size: 5,
      hover: {
        size: 7,
      },
    },
    xaxis: {
      categories: data.map(item => formatDate(item.date)),
      labels: {
        style: {
          colors: '#6B7280', // text-gray-500
        },
      },
      axisBorder: {
        show: true,
        color: '#D1D5DB', // border-gray-300
      },
      axisTicks: {
        show: true,
        color: '#D1D5DB', // border-gray-300
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      labels: {
        style: {
          colors: '#6B7280', // text-gray-500
        },
        formatter: (value) => { return Math.round(value).toString(); },
      },
      axisBorder: {
        show: true,
        color: '#D1D5DB', // border-gray-300
      },
    },
    grid: {
      borderColor: '#E5E7EB', // border-gray-200
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5,
      },
    },
    colors: ['#EF4444', '#F59E0B'], // Cores para as séries [atuais, anteriores] - Vermelho e Laranja
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: undefined,
      },
      y: {
        formatter: (value) => { return Math.round(value).toString(); },
      },
    },
  };

  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#3100ff] border-b border-[#e9e6ff] pb-2">Evolução Diária de Cliques</h2>
      {/* O componente Chart precisa ser renderizado no cliente */}
      <div className="bg-white/80 rounded-xl shadow border border-[#e9e6ff] p-4">
        {typeof window !== 'undefined' && (
          <Chart options={options} series={series} type="line" height={350} />
        )}
      </div>
    </section>
  );
};

export default DailyEvolutionChart;
