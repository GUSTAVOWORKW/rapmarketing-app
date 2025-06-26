import { supabase } from '../services/supabase';

export interface ClickData {
  linkId: string;
  linkType: 'smartlink' | 'presave';
  platformId?: string;
  isPageView?: boolean;
  userAgent?: string;
  referrer?: string;
  location?: {
    country?: string;
    city?: string;
    countryCode?: string;
  };
}

class ClickTracker {
  private static instance: ClickTracker;
  private pendingClicks: ClickData[] = [];
  private isProcessing = false;

  static getInstance(): ClickTracker {
    if (!ClickTracker.instance) {
      ClickTracker.instance = new ClickTracker();
    }
    return ClickTracker.instance;
  }

  async trackClick(data: ClickData): Promise<void> {
    // Enriquecer dados com informações do navegador
    const enrichedData: ClickData = {
      ...data,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
    };

    // Tentar obter localização (se o usuário permitir)
    if ('geolocation' in navigator) {
      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // Aqui poderia fazer uma chamada para um serviço de geocoding reverso
              // Por enquanto, vamos apenas registrar que temos coordenadas
              enrichedData.location = {
                // Seria necessário um serviço para converter coordenadas em país/cidade
                // latitude: position.coords.latitude,
                // longitude: position.coords.longitude
              };
              resolve();
            },
            () => resolve(), // Falha na geolocalização não deve impedir o tracking
            { timeout: 5000 }
          );
        });
      } catch (error) {
        console.log('Geolocation não disponível ou não permitida');
      }
    }

    // Adicionar à fila e processar
    this.pendingClicks.push(enrichedData);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.pendingClicks.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const clicksToProcess = [...this.pendingClicks];
      this.pendingClicks = [];

      // Processar em lotes
      const batchSize = 10;
      for (let i = 0; i < clicksToProcess.length; i += batchSize) {
        const batch = clicksToProcess.slice(i, i + batchSize);
        await this.processBatch(batch);
      }
    } catch (error) {
      console.error('Erro ao processar fila de clicks:', error);
      // Em caso de erro, tentar novamente mais tarde
      setTimeout(() => {
        this.isProcessing = false;
        this.processQueue();
      }, 5000);
      return;
    }

    this.isProcessing = false;
  }

  private async processBatch(clicks: ClickData[]): Promise<void> {
    const promises = clicks.map(click => this.sendClick(click));
    await Promise.allSettled(promises);
  }
  private async sendClick(data: ClickData): Promise<void> {
    try {
      let insertData: any = {
        clicked_at: new Date().toISOString(),
        platform_id: data.platformId,
        user_agent: data.userAgent,
        referrer: data.referrer,
        ip_address: null, // Será preenchido pelo servidor se disponível
        country_name: data.location?.country,
        city_name: data.location?.city,
        country_code: data.location?.countryCode
      };

      let error;

      if (data.linkType === 'smartlink') {
        // Inserir na tabela smartlink_clicks
        insertData.smartlink_id = data.linkId;
        insertData.is_general_click = !data.isPageView; // Inverter: page view = !is_general_click
        
        const result = await supabase
          .from('smartlink_clicks')
          .insert([insertData]);
        
        error = result.error;
      } else if (data.linkType === 'presave') {
        // Inserir na tabela presave_clicks
        insertData.presave_id = data.linkId;
        insertData.is_page_view = data.isPageView || false;
        
        const result = await supabase
          .from('presave_clicks')
          .insert([insertData]);
        
        error = result.error;
      } else {
        throw new Error(`Tipo de link desconhecido: ${data.linkType}`);
      }

      if (error) {
        throw error;
      }

      console.log(`Click registrado com sucesso: ${data.linkType}:${data.linkId}`);
    } catch (error) {
      console.error('Erro ao enviar click:', error);
      throw error;
    }
  }

  // Método para rastrear visualização de página
  async trackPageView(linkId: string, linkType: 'smartlink' | 'presave'): Promise<void> {
    return this.trackClick({
      linkId,
      linkType,
      isPageView: true
    });
  }

  // Método para rastrear click em plataforma
  async trackPlatformClick(
    linkId: string, 
    linkType: 'smartlink' | 'presave', 
    platformId: string
  ): Promise<void> {
    return this.trackClick({
      linkId,
      linkType,
      platformId,
      isPageView: false
    });
  }
}

// Hook para usar o tracker
export const useClickTracker = () => {
  const tracker = ClickTracker.getInstance();

  return {
    trackPageView: tracker.trackPageView.bind(tracker),
    trackPlatformClick: tracker.trackPlatformClick.bind(tracker),
    trackClick: tracker.trackClick.bind(tracker)
  };
};

export default ClickTracker;
