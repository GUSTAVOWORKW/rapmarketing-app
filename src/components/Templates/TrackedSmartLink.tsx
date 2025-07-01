import React from 'react';
import { SmartLink } from '../../types';
import { ClickTrackerProvider, PlatformLink } from '../ClickTrackerProvider';

interface TrackedSmartLinkProps extends SmartLink {
  onPlatformClick?: (platformId: string, url: string) => void;
}

const TrackedSmartLink: React.FC<TrackedSmartLinkProps> = ({
  id,
  artist_name,
  release_title,
  cover_image_url,
  platforms = [],
  social_links = [],
  onPlatformClick,
  ...props
}) => {
  const handlePlatformClick = (platformId: string, url: string) => {
    // Callback personalizado se fornecido
    if (onPlatformClick) {
      onPlatformClick(platformId, url);
    }
  };

  return (
    <ClickTrackerProvider 
      linkId={id} 
      linkType="smartlink" 
      autoTrackPageView={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <img
                  src={cover_image_url || '/assets/defaults/default-cover.png'}
                  alt={`${artist_name} - ${release_title}`}
                  className="w-64 h-64 mx-auto rounded-lg shadow-2xl object-cover"
                />
              </div>
              <h1 className="text-3xl font-bold mb-2">{artist_name}</h1>
              <h2 className="text-xl text-purple-300 mb-4">{release_title}</h2>
            </div>            {/* Platform Links */}
            <div className="space-y-4 mb-8">
              {platforms.filter(platform => platform.id && platform.url).map((platform) => (
                <PlatformLink
                  key={platform.id}
                  href={platform.url!}
                  linkId={id}
                  linkType="smartlink"
                  platformId={platform.id!}
                  onClick={() => handlePlatformClick(platform.id!, platform.url!)}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      Ouvir no {platform.name || platform.id}
                    </span>
                  </div>
                </PlatformLink>
              ))}
            </div>

            {/* Social Links */}
            {social_links && social_links.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4">Redes Sociais</h3>
                <div className="grid grid-cols-2 gap-4">
                  {social_links.filter(social => social.id).map((social) => (
                    <PlatformLink
                      key={social.id}
                      href={social.url}
                      linkId={id}
                      linkType="smartlink"
                      platformId={social.id!}
                      className="block bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
                    >                    <span className="text-sm font-medium">
                        {social.platform || social.id}
                      </span>
                    </PlatformLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClickTrackerProvider>
  );
};

export default TrackedSmartLink;
