// hooks/useMetricsData.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useSafeAsync } from './useSafeAsync';

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

// Função auxiliar para processar clicks em métricas
function processClicksToMetrics(
  allClicks: any[],
  smartlinksCount: number,
  presavesCount: number
): MetricsData {
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
  allClicks.filter(c => c.browser || c.browser_type).forEach(click => {
    const browser = click.browser || click.browser_type || 'Desconhecido';
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
  allClicks.filter(c => c.os || c.os_type).forEach(click => {
    const os = click.os || click.os_type || 'Desconhecido';
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

  return {
    summary: {
      total_clicks: totalClicks,
      total_views: totalViews,
      total_smartlinks: smartlinksCount,
      total_presaves: presavesCount,
      click_rate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0,
      clicks_today: clicksToday,
      clicks_week: clicksWeek,
      clicks_month: clicksMonth
    },
    daily,
    platforms,
    countries,
    cities,
    devices,
    browsers,
    os: osMetrics,
    hourly,
    weekdays
  };
}

export function useMetricsData(userId: string | undefined, period: Period = '30d', itemId?: string) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMountedRef, abortControllerRef, requestIdRef, nextRequest } = useSafeAsync();
  const hasInitialMetricsDataRef = useRef(false);
  
  // Ref para evitar fetch duplicado ao voltar da aba
  const lastFetchTimeRef = useRef(0);
  const FETCH_DEBOUNCE_MS = 1000; // 1 segundo de debounce

  const getDateRange = useCallback((p: Period) => {
    const now = new Date();
    let startDate: Date;

    switch (p) {
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
    const { controller, currentRequestId } = nextRequest();
    console.log('[Metrics] fetchMetrics: start', { userId, period, itemId, currentRequestId });

    if (!userId) {
      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        setLoading(false);
      }
      console.log('[Metrics] fetchMetrics: sem userId, finalizando loading');
      return;
    }

    if (isMountedRef.current) {
      // Stale-while-revalidate: só mostra loading se ainda não temos dados iniciais
      setLoading(!hasInitialMetricsDataRef.current);
      setError(null);
      console.log('[Metrics] fetchMetrics: setLoading', { loading: !hasInitialMetricsDataRef.current });
    }

    try {
  const { start, end } = getDateRange(period);
      console.log('[Metrics] fetchMetrics: range', { start, end });

      // Se tiver itemId, buscar apenas esse item específico
      if (itemId) {
        // Primeiro, descobrir se é smartlink ou presave
        const { data: smartlink } = await supabase
          .from('smart_links')
          .select('id')
          .eq('id', itemId)
          .eq('user_id', userId)
          .single();

        const isSmartlink = !!smartlink;

        // Buscar clicks do item específico
        let allClicks: any[] = [];

        if (isSmartlink) {
          const { data: clicks } = await supabase
            .from('smartlink_clicks')
            .select('*')
            .eq('smartlink_id', itemId)
            .gte('clicked_at', start)
            .lte('clicked_at', end)
            .order('clicked_at', { ascending: false })
            .limit(10000);

          if (clicks) {
            allClicks = clicks.map(c => ({
              ...c,
              type: 'smartlink',
              link_id: c.smartlink_id,
              is_page_view: c.is_general_click || false,
              os: c.os_type,
              browser: c.browser_type
            }));
          }
        } else {
          const { data: clicks } = await supabase
            .from('presave_clicks')
            .select('*')
            .eq('presave_id', itemId)
            .gte('clicked_at', start)
            .lte('clicked_at', end)
            .order('clicked_at', { ascending: false })
            .limit(10000);

          if (clicks) {
            allClicks = clicks.map(c => ({
              ...c,
              type: 'presave',
              link_id: c.presave_id,
              os: c.os_type,
              browser: c.browser_type
            }));
          }
        }

        const metricsData = processClicksToMetrics(allClicks, isSmartlink ? 1 : 0, isSmartlink ? 0 : 1);
        if (isMountedRef.current && requestIdRef.current === currentRequestId) {
          setData(metricsData);
          hasInitialMetricsDataRef.current = true;
        }
        return;
      }

      // Buscar contagem de smart_links do usuário
      // Removido .abortSignal(signal) para evitar problemas com a biblioteca Supabase
      const { count: smartlinksCount, error: smartlinksError } = await supabase
        .from('smart_links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (requestIdRef.current !== currentRequestId) return;
      if (smartlinksError) throw smartlinksError;

      // Buscar contagem de presaves do usuário
      const { count: presavesCount, error: presavesError } = await supabase
        .from('presaves')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (requestIdRef.current !== currentRequestId) return;
      if (presavesError) throw presavesError;

      const totalSmartlinks = smartlinksCount || 0;
      const totalPresaves = presavesCount || 0;

      // Se não houver items, retornar dados vazios
      if (totalSmartlinks === 0 && totalPresaves === 0) {
        const emptyData: MetricsData = {
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
        };
        if (isMountedRef.current && requestIdRef.current === currentRequestId) {
          setData(emptyData);
          console.log('[Metrics] fetchMetrics: sem items, setData empty');
          hasInitialMetricsDataRef.current = true;
        }
        return;
      }

      // Usar a view all_clicks (mais eficiente)
      const { data: allClicksData, error: allClicksError } = await supabase
        .from('all_clicks')
        .select('*')
        .eq('user_id', userId)
        .gte('clicked_at', start)
        .lte('clicked_at', end)
        .order('clicked_at', { ascending: false })
        .limit(10000);

      if (requestIdRef.current !== currentRequestId) return;

      if (!allClicksError && allClicksData) {
        const metricsData = processClicksToMetrics(allClicksData, totalSmartlinks, totalPresaves);
        if (isMountedRef.current && requestIdRef.current === currentRequestId) {
          setData(metricsData);
          console.log('[Metrics] fetchMetrics: dados da view all_clicks setados', { clicks: allClicksData.length });
          hasInitialMetricsDataRef.current = true;
        }
        return;
      }

      // Fallback: buscar clicks em batches
      console.warn('View all_clicks não disponível, usando fallback...');
      
      const BATCH_SIZE = 50;
      
      const { data: smartlinks } = await supabase
        .from('smart_links')
        .select('id')
        .eq('user_id', userId)
        .limit(500);

      if (requestIdRef.current !== currentRequestId) return;

      const { data: presaves } = await supabase
        .from('presaves')
        .select('id')
        .eq('user_id', userId)
        .limit(500);

      if (requestIdRef.current !== currentRequestId) return;

      const smartlinkIds = smartlinks?.map(s => s.id) || [];
      const presaveIds = presaves?.map(p => p.id) || [];

      let allSmartlinkClicks: any[] = [];
      let allPresaveClicks: any[] = [];

      for (let i = 0; i < smartlinkIds.length; i += BATCH_SIZE) {
        if (requestIdRef.current !== currentRequestId) return;
        const batch = smartlinkIds.slice(i, i + BATCH_SIZE);
        if (batch.length === 0) continue;
        
        const { data: clicks } = await supabase
          .from('smartlink_clicks')
          .select('*')
          .in('smartlink_id', batch)
          .gte('clicked_at', start)
          .lte('clicked_at', end);
        
        if (clicks) allSmartlinkClicks = [...allSmartlinkClicks, ...clicks];
      }

      for (let i = 0; i < presaveIds.length; i += BATCH_SIZE) {
        if (requestIdRef.current !== currentRequestId) return;
        const batch = presaveIds.slice(i, i + BATCH_SIZE);
        if (batch.length === 0) continue;
        
        const { data: clicks } = await supabase
          .from('presave_clicks')
          .select('*')
          .in('presave_id', batch)
          .gte('clicked_at', start)
          .lte('clicked_at', end);
        
        if (clicks) allPresaveClicks = [...allPresaveClicks, ...clicks];
      }

      const allClicks = [
        ...allSmartlinkClicks.map(c => ({
          ...c,
          type: 'smartlink',
          link_id: c.smartlink_id,
          is_page_view: c.is_general_click || false,
          os: c.os_type,
          browser: c.browser_type
        })),
        ...allPresaveClicks.map(c => ({
          ...c,
          type: 'presave',
          link_id: c.presave_id,
          os: c.os_type,
          browser: c.browser_type
        }))
      ];

      const metricsData = processClicksToMetrics(allClicks, totalSmartlinks, totalPresaves);
      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        setData(metricsData);
        console.log('[Metrics] fetchMetrics: dados do fallback setados', { total: allClicks.length });
      }

    } catch (err) {
      // Se mudou o ID, ignora o erro pois é de uma requisição antiga
      if (requestIdRef.current !== currentRequestId) return;

      console.error('Erro ao buscar métricas:', err);
      
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas');
        console.log('[Metrics] fetchMetrics: error set', { message: err instanceof Error ? err.message : String(err) });
      }
    } finally {
      // Só atualiza o loading se este for o ID ATUAL
      if (isMountedRef.current && requestIdRef.current === currentRequestId) {
        setLoading(false);
        console.log('[Metrics] fetchMetrics: finalizando loading');
      }
    }
  }, [userId, period, itemId, getDateRange, nextRequest]);

  // Efeito para recarregar dados quando aba volta a ficar visível
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        const now = Date.now();
        // Debounce para evitar múltiplas requisições
        if (now - lastFetchTimeRef.current < FETCH_DEBOUNCE_MS) {
          console.log('[Metrics] visibilitychange: debounced, ignorando');
          return;
        }
        lastFetchTimeRef.current = now;
        console.log('[Metrics] visibilitychange: recarregando dados');
        fetchMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, fetchMetrics]);

  useEffect(() => {
    // Sem cache: sempre revalidar e controlar loading via hasInitialMetricsDataRef
    // Debounce inicial
    lastFetchTimeRef.current = Date.now();
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
}

export default useMetricsData;
