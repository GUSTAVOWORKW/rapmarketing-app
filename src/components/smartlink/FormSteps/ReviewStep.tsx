// components/smartlink/FormSteps/ReviewStep.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useSmartLinkForm } from '../../../context/smartlink/SmartLinkFormContext';
import { PlatformLink, SocialLink } from '../../../types'; // Importar tipos globais
import { FaCheckCircle, FaStar, FaSpinner, FaTimesCircle } from 'react-icons/fa';
import { SOCIAL_PLATFORMS } from '../../../data/socials';
import { PLATFORMS } from '../../../data/platforms';
import { supabase } from '../../../services/supabase';

// As props foram removidas, pois a navegação e submissão
// são controladas pela página pai (CreateSmartLinkPage)
interface ReviewStepProps {}

// Ícones das plataformas
const ReviewStep: React.FC<ReviewStepProps> = () => {
  const { state, updateField, generateSlug, setErrors } = useSmartLinkForm();
  const platformsWithLinks = state.platforms.filter((p: PlatformLink) => p.url.trim() !== '');
  const socialLinksWithUrls = state.socialLinks.filter((s: SocialLink) => s.url.trim() !== '');

  // Estado para verificação de slug
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [lastCheckedSlug, setLastCheckedSlug] = useState<string>('');

  // Gera o slug a partir do nome do artista quando o componente é montado
  // ou quando o nome do artista muda, mas apenas se o slug ainda não foi definido pelo usuário
  useEffect(() => {
    if (state.artistName && !state.slug) {
      const newSlug = generateSlug(state.artistName);
      updateField('slug', newSlug);
    }
  }, [state.artistName, state.slug, generateSlug, updateField]);

  // Verificar disponibilidade do slug com debounce
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugStatus('idle');
      return;
    }

    // Evitar verificar o mesmo slug repetidamente
    if (slug === lastCheckedSlug) {
      return;
    }

    setSlugStatus('checking');
    setLastCheckedSlug(slug);
    
    try {
      const { data, error } = await supabase
        .from('smart_links')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (error && error.code === 'PGRST116') {
        // Nenhum registro encontrado - slug disponível
        setSlugStatus('available');
      } else if (data) {
        // Slug já existe
        setSlugStatus('taken');
      }
    } catch (error) {
      console.error('Erro ao verificar slug:', error);
      setSlugStatus('idle');
    }
  }, [lastCheckedSlug]);

  // Debounce da verificação de slug
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (state.slug && state.slug !== lastCheckedSlug) {
        checkSlugAvailability(state.slug);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [state.slug, checkSlugAvailability, lastCheckedSlug]);


  // Monta o link final do Smart Link
  const smartLinkUrl = state.slug
    ? `${window.location.origin}/${state.slug}`
    : 'Seu link será gerado após salvar';

  // Renderização das redes sociais conectadas
  const socialsWithIcons = socialLinksWithUrls.map((s) => {
    const socialData = SOCIAL_PLATFORMS.find(sp => sp.id === s.platform);
    return {
      ...s,
      IconComponent: socialData ? socialData.icon : undefined,
      color: socialData ? socialData.color : '#888',
      name: socialData ? socialData.name : s.platform,
    };
  });

  // Renderização das plataformas conectadas
  const platformsWithIcons = platformsWithLinks.map((p) => {
    const platformData = PLATFORMS.find(pl => pl.id === p.platform_id);
    return {
      ...p,
      IconComponent: platformData ? platformData.icon : undefined,
      brandColor: platformData ? platformData.brand_color : '#ccc',
      name: platformData ? platformData.name : p.platform_id,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header Moderno */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full mb-4">
            <FaCheckCircle className="mr-2" />
            <span className="font-semibold">Revisão Final</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Seu Smart Link está pronto!</h2>
          <p className="text-gray-600 text-lg">Revise as informações antes de publicar</p>
        </div>

        {/* Link do Smart Link */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col items-center">
          <span className="text-sm text-gray-500 mb-2">URL do seu Smart Link</span>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">rapmarketing.link/</span>
            <div className="relative">
              <input
                type="text"
                value={state.slug}
                onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className={`w-full max-w-xs px-3 py-2 border rounded-lg bg-gray-50 text-blue-700 font-semibold text-center focus:outline-none focus:ring-2 
                  ${slugStatus === 'available' ? 'border-green-400 focus:ring-green-400' : 
                    slugStatus === 'taken' ? 'border-red-400 focus:ring-red-400' : 
                    'border-gray-300 focus:ring-blue-400'}`}
              />
              {/* Indicador de status */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {slugStatus === 'checking' && <FaSpinner className="animate-spin text-blue-500" />}
                {slugStatus === 'available' && <FaCheckCircle className="text-green-500" />}
                {slugStatus === 'taken' && <FaTimesCircle className="text-red-500" />}
              </div>
            </div>
            <button
              type="button"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              onClick={() => navigator.clipboard.writeText(smartLinkUrl)}
              disabled={!state.slug || slugStatus === 'taken'}
            >
              Copiar
            </button>
          </div>
          {/* Status message */}
          {slugStatus === 'available' && (
            <p className="text-green-500 text-xs mt-2 flex items-center">
              <FaCheckCircle className="mr-1" /> URL disponível!
            </p>
          )}
          {slugStatus === 'taken' && (
            <p className="text-red-500 text-xs mt-2 flex items-center">
              <FaTimesCircle className="mr-1" /> URL já em uso. Escolha outra.
            </p>
          )}
          {state.errors.slug && <p className="text-red-500 text-xs mt-2">{state.errors.slug}</p>}
          <span className="text-xs text-gray-400 mt-2">Você pode customizar sua URL!</span>
        </div>

        {/* Resumo do Smart Link */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <FaStar className="mr-3 text-yellow-500" />
            Resumo do Smart Link
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{platformsWithLinks.length}</div>
              <div className="text-sm text-blue-800">Plataformas</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{socialLinksWithUrls.length}</div>
              <div className="text-sm text-pink-800">Redes Sociais</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{state.playerUrl ? '1' : '0'}</div>
              <div className="text-sm text-green-800">Player</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{state.template === 'gold' ? 'Gold' : state.template === 'holo' ? 'Holo' : 'Modern'}</div>
              <div className="text-sm text-purple-800">Template</div>
            </div>
          </div>
        </div>

        {/* Informações do Artista */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Informações do Artista</h3>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={state.avatarUrl || '/avatars/perfilhomem1.png'}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h4 className="font-bold text-gray-900">{state.artistName || 'Nome do Artista'}</h4>
              {state.artistTitle && (
                <p className="text-gray-600 text-sm">{state.artistTitle}</p>
              )}
            </div>
          </div>
          {state.bio && (
            <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{state.bio}</p>
          )}
        </div>

        {/* Redes Sociais */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Redes Sociais</h4>
          <div className="flex flex-wrap gap-3">
            {socialsWithIcons.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium"
                style={{ color: s.color, borderColor: `${s.color}22` }}
              >
                {s.IconComponent && <s.IconComponent className="mr-2" style={{ color: s.color }} />}
                <span>{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Plataformas de Streaming */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Plataformas de Streaming</h4>
          <div className="flex flex-wrap gap-3">
            {platformsWithIcons.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition text-sm font-medium"
                style={{ color: p.brandColor, borderColor: `${p.brandColor}22` }}
              >
                {p.IconComponent && <p.IconComponent className="mr-2" style={{ color: p.brandColor }} />}
                <span>{p.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Checklist Final */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Checklist Final</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FaCheckCircle className={`mr-3 ${state.artistName ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={state.artistName ? 'text-gray-800' : 'text-gray-400'}>
                Nome do artista configurado
              </span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className={`mr-3 ${state.releaseTitle ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={state.releaseTitle ? 'text-gray-800' : 'text-gray-400'}>
                Título da música definido
              </span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className={`mr-3 ${state.coverImageUrl ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={state.coverImageUrl ? 'text-gray-800' : 'text-gray-400'}>
                Capa da música adicionada
              </span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className={`mr-3 ${platformsWithLinks.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={platformsWithLinks.length > 0 ? 'text-gray-800' : 'text-gray-400'}>
                Pelo menos uma plataforma adicionada
              </span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className={`mr-3 ${state.playerUrl ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={state.playerUrl ? 'text-gray-800' : 'text-gray-400'}>
                Player do Spotify configurado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
