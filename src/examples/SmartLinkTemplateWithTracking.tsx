// ============================================================================
// EXEMPLO DE INTEGRAÇÃO - TEMPLATE DE SMART LINK COM TRACKING
// ============================================================================
// Este arquivo demonstra como integrar o sistema de métricas em um template
// de Smart Link existente do RapMarketing
// ============================================================================

import React, { useEffect, useState } from 'react';
import { useMetricsTracking } from '../hooks/useMetricsTracking';

interface Platform {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

interface SmartLinkData {
  id: string;
  artist_name: string;
  release_title: string;
  cover_image?: string;
  platforms: Platform[];
  created_at: string;
}

interface SmartLinkTemplateProps {
  smartlinkData: SmartLinkData;
  templateType?: string;
}

const SmartLinkTemplate: React.FC<SmartLinkTemplateProps> = ({ 
  smartlinkData, 
  templateType = 'default' 
}) => {
  const { trackPageView, trackClick, trackShare, trackCustomEvent } = useMetricsTracking();
  const [hasTrackedPageView, setHasTrackedPageView] = useState(false);
  
  // ============================================================================
  // TRACKING DE PAGE VIEW
  // ============================================================================
  
  useEffect(() => {
    // Registrar page view apenas uma vez quando o componente carrega
    if (smartlinkData?.id && !hasTrackedPageView) {
      console.log('📊 Registrando page view para Smart Link:', smartlinkData.id);
      trackPageView(smartlinkData.id, 'smartlink');
      setHasTrackedPageView(true);
      
      // Registrar também qual template foi usado
      trackCustomEvent(smartlinkData.id, 'smartlink', `template_${templateType}`);
    }
  }, [smartlinkData?.id, trackPageView, trackCustomEvent, templateType, hasTrackedPageView]);
  
  // ============================================================================
  // HANDLERS DE EVENTOS
  // ============================================================================
  
  const handlePlatformClick = async (platform: Platform) => {
    try {
      console.log('🎵 Registrando click na plataforma:', platform.name);
      
      // Registrar o click
      trackClick(smartlinkData.id, 'smartlink', platform.id);
      
      // Pequeno delay para garantir que o evento seja registrado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirecionar para a plataforma
      window.open(platform.url, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('❌ Erro ao processar click:', error);
      // Redirecionar mesmo se o tracking falhar
      window.open(platform.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleShareClick = async (socialPlatform: string) => {
    try {
      console.log('📤 Registrando compartilhamento:', socialPlatform);
      
      // Registrar o compartilhamento
      trackShare(smartlinkData.id, 'smartlink', socialPlatform);
      
      // URL da página atual para compartilhamento
      const currentUrl = window.location.href;
      const shareText = `Confira "${smartlinkData.release_title}" de ${smartlinkData.artist_name}`;
      
      // URLs de compartilhamento
      const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
      };
      
      const shareUrl = shareUrls[socialPlatform as keyof typeof shareUrls];
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar compartilhamento:', error);
    }
  };
  
  const handleCopyLink = async () => {
    try {
      // Registrar evento de cópia do link
      trackCustomEvent(smartlinkData.id, 'smartlink', 'copy_link');
      
      await navigator.clipboard.writeText(window.location.href);
      
      // Feedback visual (você pode implementar um toast aqui)
      console.log('✅ Link copiado para a área de transferência');
      
    } catch (error) {
      console.error('❌ Erro ao copiar link:', error);
    }
  };
  
  // ============================================================================
  // RENDER DO TEMPLATE
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-purple-500/20">
        
        {/* Header com informações da release */}
        <div className="text-center mb-8">
          {smartlinkData.cover_image && (
            <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={smartlinkData.cover_image} 
                alt={`${smartlinkData.artist_name} - ${smartlinkData.release_title}`}
                className="w-full h-full object-cover"
                onLoad={() => {
                  // Registrar quando a imagem carrega
                  trackCustomEvent(smartlinkData.id, 'smartlink', 'cover_image_loaded');
                }}
              />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {smartlinkData.release_title}
          </h1>
          <p className="text-purple-300 text-lg">
            {smartlinkData.artist_name}
          </p>
        </div>
        
        {/* Botões das plataformas */}
        <div className="space-y-3 mb-8">
          {smartlinkData.platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformClick(platform)}
              className="w-full flex items-center justify-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 transition-all duration-200 border border-gray-600/30 hover:border-purple-500/50"
              style={{ 
                background: `linear-gradient(135deg, ${platform.color}20, transparent)`,
                borderColor: `${platform.color}40`
              }}
            >
              <img 
                src={platform.icon} 
                alt={platform.name}
                className="w-6 h-6"
              />
              <span className="text-white font-medium flex-1 text-left">
                Ouvir no {platform.name}
              </span>
              <svg 
                className="w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          ))}
        </div>
        
        {/* Botões de compartilhamento */}
        <div className="border-t border-gray-700/50 pt-6">
          <p className="text-gray-400 text-sm text-center mb-4">
            Compartilhar com amigos
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleShareClick('facebook')}
              className="w-10 h-10 rounded-full bg-blue-600/20 hover:bg-blue-600/40 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
              title="Compartilhar no Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            
            <button
              onClick={() => handleShareClick('twitter')}
              className="w-10 h-10 rounded-full bg-sky-600/20 hover:bg-sky-600/40 flex items-center justify-center text-sky-400 hover:text-sky-300 transition-colors"
              title="Compartilhar no Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            
            <button
              onClick={() => handleShareClick('whatsapp')}
              className="w-10 h-10 rounded-full bg-green-600/20 hover:bg-green-600/40 flex items-center justify-center text-green-400 hover:text-green-300 transition-colors"
              title="Compartilhar no WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </button>
            
            <button
              onClick={handleCopyLink}
              className="w-10 h-10 rounded-full bg-gray-600/20 hover:bg-gray-600/40 flex items-center justify-center text-gray-400 hover:text-gray-300 transition-colors"
              title="Copiar link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Footer com powered by (opcional) */}
        <div className="text-center mt-6 pt-4 border-t border-gray-700/50">
          <p className="text-gray-500 text-xs">
            Powered by RapMarketing
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartLinkTemplate;

// ============================================================================
// EXEMPLO DE USO NO ROTEAMENTO
// ============================================================================

/*
// src/pages/SmartLinkPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import SmartLinkTemplate from '../components/Templates/SmartLinkTemplate';

const SmartLinkPage = () => {
  const { slug } = useParams();
  const [smartlinkData, setSmartlinkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSmartLink = async () => {
      try {
        const { data, error } = await supabase
          .from('smart_links')
          .select(`
            id,
            artist_name,
            release_title,
            cover_image,
            platforms,
            created_at
          `)
          .eq('slug', slug)
          .eq('is_public', true)
          .single();

        if (error) throw error;
        setSmartlinkData(data);
      } catch (error) {
        console.error('Erro ao carregar Smart Link:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSmartLink();
    }
  }, [slug]);

  if (loading) return <div>Carregando...</div>;
  if (!smartlinkData) return <div>Smart Link não encontrado</div>;

  return <SmartLinkTemplate smartlinkData={smartlinkData} />;
};

export default SmartLinkPage;
*/
