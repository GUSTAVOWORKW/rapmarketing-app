// EXEMPLO: Como integrar o sistema de tracking em templates existentes

// ANTES - Template sem tracking
/*
const MyTemplate = ({ smartLink }) => {
  return (
    <div>
      <h1>{smartLink.artist_name}</h1>
      {smartLink.platforms.map(platform => (
        <a key={platform.id} href={platform.url} target="_blank">
          {platform.name}
        </a>
      ))}
    </div>
  );
};
*/

// Interfaces TypeScript para tipagem
interface Platform {
  id: string;
  name: string;
  url: string;
}

interface SmartLink {
  id: string;
  artist_name: string;
  platforms: Platform[];
}

interface TemplateProps {
  smartLink: SmartLink;
}

// DEPOIS - Template com tracking integrado
import React from 'react';
import { ClickTrackerProvider, PlatformLink } from '../components/ClickTrackerProvider';

const MyTemplateWithTracking: React.FC<TemplateProps> = ({ smartLink }) => {
  return (
    <ClickTrackerProvider 
      linkId={smartLink.id} 
      linkType="smartlink" 
      autoTrackPageView={true}
    >
      <div>
        <h1>{smartLink.artist_name}</h1>
        {smartLink.platforms.map((platform: Platform) => (
          <PlatformLink
            key={platform.id}
            href={platform.url}
            linkId={smartLink.id}
            linkType="smartlink"
            platformId={platform.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            {platform.name}
          </PlatformLink>
        ))}
      </div>
    </ClickTrackerProvider>
  );
};

// ALTERNATIVA - Usando o hook diretamente
import { useClickTracker } from '../hooks/useClickTracker';

const MyTemplateWithHook: React.FC<TemplateProps> = ({ smartLink }) => {
  const { trackPlatformClick, trackPageView } = useClickTracker();

  React.useEffect(() => {
    // Registrar page view quando o componente montar
    trackPageView(smartLink.id, 'smartlink');
  }, [smartLink.id, trackPageView]);

  const handlePlatformClick = async (platformId: string, url: string) => {
    // Registrar o click
    await trackPlatformClick(smartLink.id, 'smartlink', platformId);
    
    // Abrir o link
    window.open(url, '_blank');
  };

  return (
    <div>
      <h1>{smartLink.artist_name}</h1>
      {smartLink.platforms.map((platform: Platform) => (
        <button
          key={platform.id}
          onClick={() => handlePlatformClick(platform.id, platform.url)}
        >
          {platform.name}
        </button>
      ))}
    </div>
  );
};

export { MyTemplateWithTracking, MyTemplateWithHook };
