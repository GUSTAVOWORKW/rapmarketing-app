// Utilitários para enriquecer dados de analytics
export interface LocationData {
  country?: string;
  city?: string;
  countryCode?: string;
  region?: string;
  timezone?: string;
}

export interface DeviceData {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenSize: string;
}

export interface SessionData {
  sessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

class AnalyticsEnricher {
  private static instance: AnalyticsEnricher;
  private locationCache: LocationData | null = null;
  private deviceCache: DeviceData | null = null;
  private sessionCache: SessionData | null = null;

  static getInstance(): AnalyticsEnricher {
    if (!AnalyticsEnricher.instance) {
      AnalyticsEnricher.instance = new AnalyticsEnricher();
    }
    return AnalyticsEnricher.instance;
  }

  // Obter localização via IP (usando serviço gratuito)
  async getLocationData(): Promise<LocationData | null> {
    if (this.locationCache) {
      return this.locationCache;
    }

    try {
      // Usando ipapi.co (gratuito, 1000 requests/dia)
      const response = await fetch('https://ipapi.co/json/', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data = await response.json();
      
      this.locationCache = {
        country: data.country_name,
        city: data.city,
        countryCode: data.country_code,
        region: data.region,
        timezone: data.timezone
      };

      return this.locationCache;
    } catch (error) {
      console.log('Could not get location data:', error);
      return null;
    }
  }

  // Detectar informações do dispositivo
  getDeviceData(): DeviceData {
    if (this.deviceCache) {
      return this.deviceCache;
    }

    const userAgent = navigator.userAgent;
    
    // Detectar tipo de dispositivo
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    }

    // Detectar OS
    let os = 'Unknown';
    if (/Windows/i.test(userAgent)) os = 'Windows';
    else if (/Mac/i.test(userAgent)) os = 'macOS';
    else if (/Linux/i.test(userAgent)) os = 'Linux';
    else if (/Android/i.test(userAgent)) os = 'Android';
    else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';

    // Detectar Browser
    let browser = 'Unknown';
    if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
    else if (/Edge/i.test(userAgent)) browser = 'Edge';
    else if (/Opera/i.test(userAgent)) browser = 'Opera';

    // Tamanho da tela
    const screenSize = `${screen.width}x${screen.height}`;

    this.deviceCache = {
      deviceType,
      os,
      browser,
      screenSize
    };

    return this.deviceCache;
  }

  // Obter dados da sessão
  getSessionData(): SessionData {
    if (this.sessionCache) {
      return this.sessionCache;
    }

    // Gerar ou recuperar session ID
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    // Extrair parâmetros UTM da URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;

    this.sessionCache = {
      sessionId,
      referrer: document.referrer || undefined,
      utmSource,
      utmMedium,
      utmCampaign
    };

    return this.sessionCache;
  }

  // Obter todos os dados enriquecidos
  async getEnrichedData(): Promise<{
    location: LocationData | null;
    device: DeviceData;
    session: SessionData;
    timestamp: string;
  }> {
    const [location, device, session] = await Promise.all([
      this.getLocationData(),
      Promise.resolve(this.getDeviceData()),
      Promise.resolve(this.getSessionData())
    ]);

    return {
      location,
      device,
      session,
      timestamp: new Date().toISOString()
    };
  }

  // Limpar cache (útil para testes)
  clearCache(): void {
    this.locationCache = null;
    this.deviceCache = null;
    this.sessionCache = null;
  }
}

// Hook para usar o enricher
export const useAnalyticsEnricher = () => {
  const enricher = AnalyticsEnricher.getInstance();

  return {
    getLocationData: enricher.getLocationData.bind(enricher),
    getDeviceData: enricher.getDeviceData.bind(enricher),
    getSessionData: enricher.getSessionData.bind(enricher),
    getEnrichedData: enricher.getEnrichedData.bind(enricher),
    clearCache: enricher.clearCache.bind(enricher)
  };
};

export default AnalyticsEnricher;
