// hooks/useMetricsData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

// Tipos para os dados de métricas
export interface DailyMetric {
  date: string;
  clicks: number;
  views: number;
}

export interface PlatformMetric {
  platform_id: string;
  clicks: number;
  percentage: number;
}

export interface CountryMetric {
  country: string;
  country_code: string;
  count: number;
  percentage: number;
}

export interface CityMetric {
  city: string;
  country: string;
  count: number;
}

export interface DeviceMetric {
  device_type: string;
  count: number;
  percentage: number;
}

export interface BrowserMetric {
  browser: string;
  count: number;
  percentage: number;
}

export interface OSMetric {
  os: string;
  count: number;
  percentage: number;
}

export interface HourlyMetric {
  hour: number;
  clicks: number;
}

export interface WeekdayMetric {
  weekday: string;
  weekday_num: number;
  clicks: number;
}

export interface MetricsSummary {
  total_clicks: number;
  total_views: number;
  total_smartlinks: number;
  total_presaves: number;
  click_rate: number;
  clicks_today: number;
  clicks_week: number;
  clicks_month: number;
}

export interface MetricsData {
  summary: MetricsSummary;
  daily: DailyMetric[];
  platforms: PlatformMetric[];
  countries: CountryMetric[];
  cities: CityMetric[];
  devices: DeviceMetric[];
  browsers: BrowserMetric[];
  os: OSMetric[];
  hourly: HourlyMetric[];
  weekdays: WeekdayMetric[];
}

type Period = '7d' | '30d' | '90d' | 'all';

export function useMetricsData(userId: string | undefined, period: Period = '30d') {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = useCallback((period: Period) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = new Date('2020-01-01');
    }

    return {
      start: startDate.toISOString(),
      end: now.toISOString()
    };
  }, []);

  const fetchMetrics = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange(period);

      // Buscar smart_links do usuário
      const { data: smartlinks, error: smartlinksError } = await supabase
        .from('smart_links')
        .select('id')
        .eq('user_id', userId);

      if (smartlinksError) throw smartlinksError;

      // Buscar presaves do usuário
      const { data: presaves, error: presavesError } = await supabase
        .from('presaves')
        .select('id')
        .eq('user_id', userId);

      if (presavesError) throw presavesError;

      const smartlinkIds = smartlinks?.map(s => s.id) || [];
      const presaveIds = presaves?.map(p => p.id) || [];

      // Se não houver items, retornar dados vazios
      if (smartlinkIds.length === 0 && presaveIds.length === 0) {
        setData({
          summary: {
            total_clicks: 0,
            total_views: 0,
            total_smartlinks: 0,
            total_presaves: 0,
            click_rate: 0,
            clicks_today: 0,
            clicks_week: 0,
            clicks_month: 0
          },
          daily: [],
          platforms: [],
          countries: [],
          cities: [],
          devices: [],
          browsers: [],
          os: [],
          hourly: [],
          weekdays: []
        });
        setLoading(false);
        return;
      }

      // Buscar clicks de smartlinks
      let smartlinkClicksQuery = supabase
        .from('smartlink_clicks')
        .select('*')
        .gte('clicked_at', start)
        .lte('clicked_at', end);

      if (smartlinkIds.length > 0) {
        smartlinkClicksQuery = smartlinkClicksQuery.in('smartlink_id', smartlinkIds);
      }

      const { data: smartlinkClicks, error: clicksError } = await smartlinkClicksQuery;
      if (clicksError) throw clicksError;

      // Buscar clicks de presaves
      let presaveClicksQuery = supabase
        .from('presave_clicks')
        .select('*')
        .gte('clicked_at', start)
        .lte('clicked_at', end);

      if (presaveIds.length > 0) {
        presaveClicksQuery = presaveClicksQuery.in('presave_id', presaveIds);
      }

      const { data: presaveClicks, error: presaveClicksError } = await presaveClicksQuery;
      if (presaveClicksError) throw presaveClicksError;

      // Combinar clicks
      const allClicks = [
        ...(smartlinkClicks || []).map(c => ({
          ...c,
          type: 'smartlink',
          link_id: c.smartlink_id,
          is_page_view: c.is_general_click || false,
          os: c.os_type,
          browser: c.browser_type
        })),
        ...(presaveClicks || []).map(c => ({
          ...c,
          type: 'presave',
          link_id: c.presave_id,
          os: c.os_type,
          browser: c.browser_type
        }))
      ];

      // Calcular métricas
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalClicks = allClicks.filter(c => !c.is_page_view).length;
      const totalViews = allClicks.filter(c => c.is_page_view).length;
      const clicksToday = allClicks.filter(c => !c.is_page_view && new Date(c.clicked_at) >= todayStart).length;
      const clicksWeek = allClicks.filter(c => !c.is_page_view && new Date(c.clicked_at) >= weekStart).length;
      const clicksMonth = allClicks.filter(c => !c.is_page_view && new Date(c.clicked_at) >= monthStart).length;

      // Métricas diárias
      const dailyMap = new Map<string, { clicks: number; views: number }>();
      allClicks.forEach(click => {
        const date = new Date(click.clicked_at).toISOString().split('T')[0];
        const existing = dailyMap.get(date) || { clicks: 0, views: 0 };
        if (click.is_page_view) {
          existing.views++;
        } else {
          existing.clicks++;
        }
        dailyMap.set(date, existing);
      });

      const daily: DailyMetric[] = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Preencher dias sem dados
      const filledDaily = fillMissingDays(daily, period);

      // Métricas por plataforma
      const platformMap = new Map<string, number>();
      allClicks.filter(c => !c.is_page_view && c.platform_id).forEach(click => {
        const count = platformMap.get(click.platform_id) || 0;
        platformMap.set(click.platform_id, count + 1);
      });

      const platforms: PlatformMetric[] = Array.from(platformMap.entries())
        .map(([platform_id, clicks]) => ({
          platform_id,
          clicks,
          percentage: totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0
        }))
        .sort((a, b) => b.clicks - a.clicks);

      // Métricas por país
      const countryMap = new Map<string, { count: number; code: string }>();
      allClicks.filter(c => c.country_name || c.country).forEach(click => {
        const country = click.country_name || click.country || 'Desconhecido';
        const code = click.country_code || '';
        const existing = countryMap.get(country) || { count: 0, code };
        existing.count++;
        countryMap.set(country, existing);
      });

      const totalCountryClicks = Array.from(countryMap.values()).reduce((sum, c) => sum + c.count, 0);
      const countries: CountryMetric[] = Array.from(countryMap.entries())
        .map(([country, data]) => ({
          country,
          country_code: data.code,
          count: data.count,
          percentage: totalCountryClicks > 0 ? Math.round((data.count / totalCountryClicks) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Métricas por cidade
      const cityMap = new Map<string, { count: number; country: string }>();
      allClicks.filter(c => c.city_name || c.city).forEach(click => {
        const city = click.city_name || click.city || 'Desconhecida';
        const country = click.country_name || click.country || '';
        const key = `${city}-${country}`;
        const existing = cityMap.get(key) || { count: 0, country };
        existing.count++;
        cityMap.set(key, existing);
      });

      const cities: CityMetric[] = Array.from(cityMap.entries())
        .map(([key, data]) => ({
          city: key.split('-')[0],
          country: data.country,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Métricas por dispositivo
      const deviceMap = new Map<string, number>();
      allClicks.filter(c => c.device_type).forEach(click => {
        const device = click.device_type || 'Desconhecido';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });

      const totalDevices = Array.from(deviceMap.values()).reduce((sum, c) => sum + c, 0);
      const devices: DeviceMetric[] = Array.from(deviceMap.entries())
        .map(([device_type, count]) => ({
          device_type,
          count,
          percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Métricas por browser
      const browserMap = new Map<string, number>();
      allClicks.filter(c => c.browser).forEach(click => {
        const browser = click.browser || 'Desconhecido';
        browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
      });

      const totalBrowsers = Array.from(browserMap.values()).reduce((sum, c) => sum + c, 0);
      const browsers: BrowserMetric[] = Array.from(browserMap.entries())
        .map(([browser, count]) => ({
          browser,
          count,
          percentage: totalBrowsers > 0 ? Math.round((count / totalBrowsers) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Métricas por OS
      const osMap = new Map<string, number>();
      allClicks.filter(c => c.os).forEach(click => {
        const os = click.os || 'Desconhecido';
        osMap.set(os, (osMap.get(os) || 0) + 1);
      });

      const totalOS = Array.from(osMap.values()).reduce((sum, c) => sum + c, 0);
      const osMetrics: OSMetric[] = Array.from(osMap.entries())
        .map(([os, count]) => ({
          os,
          count,
          percentage: totalOS > 0 ? Math.round((count / totalOS) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Métricas por hora do dia
      const hourlyMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) hourlyMap.set(i, 0);
      allClicks.filter(c => !c.is_page_view).forEach(click => {
        const hour = new Date(click.clicked_at).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      });

      const hourly: HourlyMetric[] = Array.from(hourlyMap.entries())
        .map(([hour, clicks]) => ({ hour, clicks }))
        .sort((a, b) => a.hour - b.hour);

      // Métricas por dia da semana
      const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weekdayMap = new Map<number, number>();
      for (let i = 0; i < 7; i++) weekdayMap.set(i, 0);
      allClicks.filter(c => !c.is_page_view).forEach(click => {
        const day = new Date(click.clicked_at).getDay();
        weekdayMap.set(day, (weekdayMap.get(day) || 0) + 1);
      });

      const weekdays: WeekdayMetric[] = Array.from(weekdayMap.entries())
        .map(([weekday_num, clicks]) => ({
          weekday: weekdayNames[weekday_num],
          weekday_num,
          clicks
        }))
        .sort((a, b) => a.weekday_num - b.weekday_num);

      setData({
        summary: {
          total_clicks: totalClicks,
          total_views: totalViews,
          total_smartlinks: smartlinkIds.length,
          total_presaves: presaveIds.length,
          click_rate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
          clicks_today: clicksToday,
          clicks_week: clicksWeek,
          clicks_month: clicksMonth
        },
        daily: filledDaily,
        platforms,
        countries,
        cities,
        devices,
        browsers,
        os: osMetrics,
        hourly,
        weekdays
      });
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [userId, period, getDateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

// Função auxiliar para preencher dias sem dados
function fillMissingDays(daily: DailyMetric[], period: Period): DailyMetric[] {
  if (daily.length === 0) return [];

  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const result: DailyMetric[] = [];
  const now = new Date();
  const existingDates = new Set(daily.map(d => d.date));

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    if (existingDates.has(dateStr)) {
      const existing = daily.find(d => d.date === dateStr);
      if (existing) result.push(existing);
    } else {
      result.push({ date: dateStr, clicks: 0, views: 0 });
    }
  }

  return result;
}

export default useMetricsData;
