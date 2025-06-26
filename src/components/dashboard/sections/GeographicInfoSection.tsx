import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface TopCountry {
  country: string;
  count: number;
  country_code?: string; 
}

interface TopCity {
  city: string;
  country: string;
  count: number;
}

interface GeographicInfoSectionProps {
  topCountries: TopCountry[];
  topCities: TopCity[];
  isLoading?: boolean;
}

const GeographicInfoSection: React.FC<GeographicInfoSectionProps> = ({
  topCountries,
  topCities,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <section className="mb-10 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-red-500 border-b border-gray-200 pb-3">
          Informações Geográficas
        </h2>
        <div className="text-center py-8 text-gray-600">Carregando informações geográficas...</div>
      </section>
    );
  }

  const baseHorizontalBarOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 250,
      foreColor: '#374151', // text-gray-700
      toolbar: {
        show: false,
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: { 
      labels: {
        style: {
          colors: '#6B7280', // text-gray-500
          fontSize: '12px',
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
      labels: {
        style: {
          colors: '#6B7280', // text-gray-500
        },
        formatter: function (val: string | number) {
          return Math.round(parseFloat(val.toString())).toString();
        }
      },
      title: {
        text: 'Cliques',
        style: {
          color: '#6B7280', // text-gray-500
          fontSize: '12px',
          fontWeight: 'normal',
        }
      },
    },
    grid: {
      borderColor: '#E5E7EB', // border-gray-200
      xaxis: { 
        lines: {
          show: true,
        },
      },
      yaxis: { 
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: 'light', // Tema claro para tooltip
      style: {
        fontSize: '12px',
        fontFamily: undefined,
      },
      x: {
        formatter: function(val: number, { series, seriesIndex, dataPointIndex, w }) {
          if (w.globals.labels && w.globals.labels[dataPointIndex]) {
            return w.globals.labels[dataPointIndex];
          }
          return val?.toString() || '';
        }
      },
      y: { 
        formatter: function (val: number) {
          return `${val} cliques`;
        },
        title: { 
          formatter: function (seriesName: string) {
            return seriesName; 
          }
        }
      }
    },
  };

  const countryChartOptions: ApexOptions = {
    ...baseHorizontalBarOptions,
    colors: ['#3B82F6'], // Azul para países
    xaxis: {
      ...baseHorizontalBarOptions.xaxis,
      categories: topCountries.map(c => c.country), 
    },
  };
  
  const cityChartOptions: ApexOptions = {
    ...baseHorizontalBarOptions,
    colors: ['#10B981'], // Verde para cidades
    xaxis: {
      ...baseHorizontalBarOptions.xaxis,
      categories: topCities.map(c => `${c.city} (${c.country})`), 
    },
  };
  
  const countryApexSeries = [{
    name: 'Cliques',
    data: topCountries.map(c => c.count),
  }];

  const cityApexSeries = [{
    name: 'Cliques',
    data: topCities.map(c => c.count),
  }];

  return (
    <section className="mb-10 p-6 bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] rounded-2xl shadow-xl border border-[#e9e6ff]">
      <h2 className="text-2xl font-bold mb-6 text-[#3100ff] border-b border-[#e9e6ff] pb-3">
        Informações Geográficas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 p-5 rounded-xl shadow border border-[#e9e6ff]">
          <h3 className="text-xl font-semibold mb-4 text-[#3100ff]">Top Países</h3>
          {topCountries && topCountries.length > 0 ? (
            typeof window !== 'undefined' && <Chart options={countryChartOptions as ApexOptions} series={countryApexSeries} type="bar" height={250} />
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado de país disponível.</p>
          )}
        </div>
        <div className="bg-white/80 p-5 rounded-xl shadow border border-[#e9e6ff]">
          <h3 className="text-xl font-semibold mb-4 text-[#3100ff]">Top Cidades</h3>
          {topCities && topCities.length > 0 ? (
            typeof window !== 'undefined' && <Chart options={cityChartOptions as ApexOptions} series={cityApexSeries} type="bar" height={250} />
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum dado de cidade disponível.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default GeographicInfoSection;
