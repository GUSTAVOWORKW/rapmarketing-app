import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

// A importação do NotFoundPage será corrigida. Assumindo que está em './NotFoundPage' por enquanto.
// Se o erro persistir, o caminho pode ser diferente, ex: '../components/Common/NotFoundPage'
import NotFoundPage from './NotFoundPage'; 

// Importação dinâmica de todos os templates de Smart Link
const templatesContext = require.context('../components/Templates', false, /^(?!.*(AllTemplatesPreview|index)).*\.tsx?$/);
const templateComponentMap = {};
templatesContext.keys().forEach((key) => {
  // Simplifica a geração do ID para ser o nome do arquivo em minúsculas sem a extensão.
  const id = key.replace('./', '').replace(/\.(tsx|js)$/i, '').toLowerCase();
  templateComponentMap[id] = templatesContext(key).default;
});

const PublicProfileSmartLink = () => {
  const { slug } = useParams();
  const [smartlink, setSmartlink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Tracking será feito pelos templates usando useMetricsTracking hook
  // Removido handleRecordView - não precisamos mais da Edge Function

  useEffect(() => {
    const fetchSmartlink = async () => {
      if (!slug) {
        setError('URL inválida. Nenhum slug fornecido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Buscar o Smart Link pelo slug
        const { data: smartLink, error: smartLinkError } = await supabase
          .from('smart_links')
          .select('*')
          .eq('slug', slug)
          .eq('is_public', true)
          .single();

        if (smartLinkError || !smartLink) {
          throw new Error('Smart Link não encontrado ou não está público.');
        }

        console.log('[DEBUG] Dados brutos do Supabase:', smartLink);

        // Garante que platforms e social_links sejam objetos
        let parsedPlatforms = smartLink.platforms;
        if (typeof parsedPlatforms === 'string') {
          try {
            parsedPlatforms = JSON.parse(parsedPlatforms);
          } catch (e) {
            console.error("Erro ao fazer parse das plataformas:", e);
            parsedPlatforms = []; // Fallback para array vazio em caso de erro
          }
        }

        let parsedSocialLinks = smartLink.social_links;
        if (typeof parsedSocialLinks === 'string') {
          try {
            parsedSocialLinks = JSON.parse(parsedSocialLinks);
          } catch (e) {
            console.error("Erro ao fazer parse dos social links:", e);
            parsedSocialLinks = []; // Fallback para array vazio
          }
        }
        
        const finalSmartlink = {
          ...smartLink,
          platforms: parsedPlatforms || [],
          social_links: parsedSocialLinks || [],
        };

        setSmartlink(finalSmartlink);        document.title = finalSmartlink.title || `${finalSmartlink.artist_name} - ${finalSmartlink.release_title}`;
        
        // ✅ Page view será registrado automaticamente pelo template via useMetricsTracking

      } catch (e) {
        setError(e.message || 'Erro ao carregar o Smart Link.');
        document.title = 'Erro';
      } finally {
        setLoading(false);
      }
    };

    fetchSmartlink();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Carregando...</div>;
  }

  if (error) {
    return <NotFoundPage message={error} />;
  }

  if (!smartlink) {
    return <NotFoundPage message="Smartlink não encontrado." />;
  }

  const templateName = smartlink.template_id?.toLowerCase().replace(/-/g, '') || '';
  const TemplateComponent = templateComponentMap[templateName];

  console.log(`[DEBUG] Tentando carregar template. Nome recebido: "${smartlink.template_id}", Nome normalizado: "${templateName}"`);
  console.log('[DEBUG] Mapa de templates disponível:', templateComponentMap);


  if (!TemplateComponent) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Template '{smartlink.template_id}' não encontrado. Verifique se o nome do arquivo do template corresponde ao valor salvo.</div>;
  }

  // Passa o objeto smartlink inteiro para o template. 
  // O template será responsável por usar as propriedades corretas (em snake_case).
  console.log("[DEBUG] Objeto enviado para o template:", smartlink);

  return <TemplateComponent {...smartlink} />;
};

export default PublicProfileSmartLink;
