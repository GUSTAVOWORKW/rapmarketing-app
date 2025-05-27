import React from 'react';
import styled from 'styled-components';
import { FaSpotify, FaYoutube, FaSoundcloud, FaInstagram, FaTiktok } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { generateDemoProfile, getDemoAlbumAndTrack } from '../../utils';

// Componentes de barra de música padronizados
const MusicBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #232323;
  border-radius: 8px;
  margin: 10px 0;
  padding: 8px 14px;
  gap: 10px;
  width: 100%;
  min-width: 0;
`;
const MusicInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  line-height: 1.2;
`;
const MusicTitle = styled.span`
  font-size: 16px;
  color: #fff;
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 120px;
  display: flex;
  align-items: center;
`;
const PlayButton = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #00e676;
  color: #181818;
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: bold;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: #00c853; color: #fff; }
`;

// Template Minimalista com layout profissional
const MinimalPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('minimal'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#00e676';
  const bgColor = profile?.bgColor || '#0a0a0a';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `linear-gradient(180deg, ${bgColor} 0%, #111 100%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Header com avatar e info */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: `linear-gradient(135deg, ${bgColor} 0%, ${mainColor}15 100%)`,
        borderBottom: `2px solid ${mainColor}20`
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 84, 
            height: 84, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `3px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 4px 16px ${mainColor}40`
          }} 
        />
        <h2 style={{ 
          color: '#fff', 
          fontSize: 22, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#bdbdbd', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px'
        }}>
          {bio}
        </p>
        
        {/* Social Links */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ color: mainColor, fontSize: 24, transition: 'transform 0.2s' }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ color: mainColor, fontSize: 24, transition: 'transform 0.2s' }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ color: mainColor, fontSize: 24, transition: 'transform 0.2s' }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música */}
      <div style={{ width: '100%', padding: '16px', flexGrow: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: 'rgba(35, 35, 35, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${mainColor}30`,
              marginBottom: 12
            }}>
              <MusicInfo>
                <span style={{ fontSize: 22 }}>{streamingIcons[ml.platform] || <FaSpotify />}</span>
                <MusicTitle style={{ color: '#fff' }}>{ml.title || ml.platform}</MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ background: mainColor, color: '#000' }}>
                <span style={{ fontSize: 18 }}>▶</span> Play
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          // Demo track quando não há links
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 140, 
                    height: 140, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `2px solid ${mainColor}`,
                    boxShadow: `0 8px 32px ${mainColor}30`
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 18, 
                  fontWeight: 600, 
                  margin: '0 0 4px 0' 
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#bdbdbd', 
                  fontSize: 15, 
                  margin: '0 0 16px 0' 
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: mainColor, 
                     color: '#000', 
                     borderRadius: 25, 
                     padding: '12px 24px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 4px 16px ${mainColor}40`,
                     transition: 'all 0.2s'
                   }}>
                  🎵 Ouvir no Spotify
                </a>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const QuebradaPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('quebrada'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#00e676';
  const bgColor = profile?.bgColor || '#1a1a1a';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
    deezer: <img src="/assets/streaming-icons/deezer.svg" alt="deezer" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'amazon-music': <img src="/assets/streaming-icons/amazon-music.svg" alt="amazon" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `linear-gradient(135deg, ${bgColor} 0%, ${mainColor}20 50%, ${bgColor} 100%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Efeito de grafite no fundo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, ${mainColor}10 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${mainColor}15 0%, transparent 50%),
          linear-gradient(45deg, transparent 0%, ${mainColor}05 50%, transparent 100%)
        `,
        zIndex: 0
      }}></div>

      {/* Header com avatar e info */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `4px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 0 0 3px ${bgColor}, 0 4px 20px ${mainColor}60`,
            filter: 'brightness(1.1) contrast(1.1)'
          }} 
        />
        <h2 style={{ 
          color: mainColor, 
          fontSize: 24, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: `0 0 20px ${mainColor}80, 0 2px 8px rgba(0,0,0,0.8)`,
          fontFamily: 'Impact, Arial Black, sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px',
          fontWeight: '500'
        }}>
          {bio}
        </p>
        
        {/* Social Links com estilo street */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música com estilo urbano */}
      <div style={{ width: '100%', padding: '0 16px 16px 16px', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(35,35,35,0.9) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `2px solid ${mainColor}`,
              borderRadius: 12,
              marginBottom: 14,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
            }}>
              <MusicInfo>
                <span style={{ 
                  fontSize: 24,
                  filter: `drop-shadow(0 0 6px ${mainColor}50)`
                }}>
                  {streamingIcons[ml.platform] || <FaSpotify />}
                </span>
                <MusicTitle style={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                }}>
                  {ml.title || ml.platform}
                </MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ 
                           background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
                           color: '#000',
                           fontWeight: 'bold',
                           boxShadow: `0 3px 12px ${mainColor}50`
                         }}>
                <span style={{ fontSize: 18 }}>▶</span> PLAY
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          // Demo track quando não há links
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `3px solid ${mainColor}`,
                    boxShadow: `0 0 0 3px rgba(0,0,0,0.5), 0 8px 32px ${mainColor}40`,
                    filter: 'brightness(1.1) contrast(1.1)'
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 19, 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0',
                  textShadow: `0 0 10px ${mainColor}60, 0 2px 4px rgba(0,0,0,0.8)`
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#bdbdbd', 
                  fontSize: 15, 
                  margin: '0 0 20px 0',
                  fontWeight: '500'
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
                     color: '#000', 
                     borderRadius: 25, 
                     padding: '14px 28px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 6px 20px ${mainColor}50`,
                     transition: 'all 0.2s',
                     textTransform: 'uppercase',
                     letterSpacing: '0.5px'
                   }}>
                  🎵 OUVIR AGORA
                </a>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const GoldPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('gold'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#ffd700';
  const bgColor = profile?.bgColor || '#1a1a1a';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
    deezer: <img src="/assets/streaming-icons/deezer.svg" alt="deezer" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'amazon-music': <img src="/assets/streaming-icons/amazon-music.svg" alt="amazon" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `radial-gradient(circle at center, ${mainColor}20 0%, ${bgColor} 70%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Efeito dourado */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(45deg, transparent 30%, ${mainColor}08, transparent 70%)`,
        zIndex: 0
      }}></div>

      {/* Header luxuoso */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `4px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 0 30px ${mainColor}60, 0 4px 20px rgba(0,0,0,0.5)`
          }} 
        />
        <h2 style={{ 
          color: mainColor, 
          fontSize: 24, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: `0 0 20px ${mainColor}, 0 2px 8px rgba(0,0,0,0.8)`,
          fontFamily: 'serif'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px'
        }}>
          {bio}
        </p>
        
        {/* Social Links dourados */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor})`,
                   transition: 'all 0.2s'
                 }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música luxuosos */}
      <div style={{ width: '100%', padding: '0 16px 16px 16px', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(25,25,25,0.9) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `2px solid ${mainColor}`,
              borderRadius: 12,
              marginBottom: 14,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${mainColor}30`
            }}>
              <MusicInfo>
                <span style={{ 
                  fontSize: 24,
                  filter: `drop-shadow(0 0 8px ${mainColor})`
                }}>
                  {streamingIcons[ml.platform] || <FaSpotify />}
                </span>
                <MusicTitle style={{ 
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {ml.title || ml.platform}
                </MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ 
                           background: `linear-gradient(135deg, ${mainColor} 0%, #ffcc02 100%)`,
                           color: '#000',
                           fontWeight: 'bold',
                           boxShadow: `0 3px 12px ${mainColor}60`
                         }}>
                <span style={{ fontSize: 18 }}>▶</span> PLAY
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `3px solid ${mainColor}`,
                    boxShadow: `0 0 30px ${mainColor}40, 0 8px 32px rgba(0,0,0,0.3)`
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 19, 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0',
                  textShadow: `0 0 15px ${mainColor}`
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#bdbdbd', 
                  fontSize: 15, 
                  margin: '0 0 20px 0'
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: `linear-gradient(135deg, ${mainColor} 0%, #ffcc02 100%)`,
                     color: '#000', 
                     borderRadius: 25, 
                     padding: '14px 28px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 6px 20px ${mainColor}50`,
                     transition: 'all 0.2s',
                     textTransform: 'uppercase'
                   }}>
                  💰 OUVIR AGORA
                </a>
              </div>            );
          })()
        )}
      </div>
    </div>
  );
};

const GraffitiPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('graffiti'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#ff1744';
  const bgColor = profile?.bgColor || '#0a0a0a';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
    deezer: <img src="/assets/streaming-icons/deezer.svg" alt="deezer" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'amazon-music': <img src="/assets/streaming-icons/amazon-music.svg" alt="amazon" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `linear-gradient(135deg, ${bgColor} 0%, ${mainColor}15 50%, ${bgColor} 100%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Efeito graffiti no fundo */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `
          repeating-linear-gradient(45deg, transparent, transparent 10px, ${mainColor}03 10px, ${mainColor}03 20px),
          repeating-linear-gradient(-45deg, transparent, transparent 10px, ${mainColor}02 10px, ${mainColor}02 20px)
        `,
        zIndex: 0
      }}></div>

      {/* Header urbano */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `4px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 0 0 3px ${bgColor}, 0 0 30px ${mainColor}50, 0 4px 20px rgba(0,0,0,0.6)`,
            transform: 'rotate(-2deg)'
          }} 
        />
        <h2 style={{ 
          color: '#fff', 
          fontSize: 24, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: `2px 2px 0 ${mainColor}, -2px -2px 0 ${mainColor}, 2px -2px 0 ${mainColor}, -2px 2px 0 ${mainColor}, 0 4px 8px rgba(0,0,0,0.8)`,
          fontFamily: 'Impact, Arial Black, sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          transform: 'rotate(1deg)'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px',
          fontWeight: '500'
        }}>
          {bio}
        </p>
        
        {/* Social Links com estilo graffiti */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(2px 2px 0 ${mainColor}) drop-shadow(-2px -2px 0 ${mainColor})`,
                   transition: 'all 0.2s',
                   transform: 'rotate(-5deg)'
                 }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(2px 2px 0 ${mainColor}) drop-shadow(-2px -2px 0 ${mainColor})`,
                   transition: 'all 0.2s',
                   transform: 'rotate(3deg)'
                 }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: '#fff', 
                   fontSize: 26,
                   filter: `drop-shadow(2px 2px 0 ${mainColor}) drop-shadow(-2px -2px 0 ${mainColor})`,
                   transition: 'all 0.2s',
                   transform: 'rotate(-3deg)'
                 }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música com estilo street art */}
      <div style={{ width: '100%', padding: '0 16px 16px 16px', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(35,35,35,0.9) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `3px solid ${mainColor}`,
              borderRadius: 12,
              marginBottom: 14,
              boxShadow: `0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
              transform: `rotate(${idx % 2 === 0 ? '-1deg' : '1deg'})`
            }}>
              <MusicInfo>
                <span style={{ 
                  fontSize: 24,
                  filter: `drop-shadow(2px 2px 0 ${mainColor}50)`
                }}>
                  {streamingIcons[ml.platform] || <FaSpotify />}
                </span>
                <MusicTitle style={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  textShadow: `1px 1px 0 ${mainColor}80, 0 1px 3px rgba(0,0,0,0.8)`
                }}>
                  {ml.title || ml.platform}
                </MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ 
                           background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
                           color: '#fff',
                           fontWeight: 'bold',
                           boxShadow: `0 3px 12px ${mainColor}60`,
                           textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                         }}>
                <span style={{ fontSize: 18 }}>▶</span> PLAY
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `4px solid ${mainColor}`,
                    boxShadow: `0 0 0 3px rgba(0,0,0,0.5), 0 8px 32px ${mainColor}40`,
                    transform: 'rotate(-2deg)'
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 19, 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0',
                  textShadow: `2px 2px 0 ${mainColor}, 0 2px 8px rgba(0,0,0,0.8)`,
                  fontFamily: 'Impact, Arial Black, sans-serif'
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#bdbdbd', 
                  fontSize: 15, 
                  margin: '0 0 20px 0',
                  fontWeight: '500'
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: `linear-gradient(135deg, ${mainColor} 0%, ${mainColor}dd 100%)`,
                     color: '#fff', 
                     borderRadius: 25, 
                     padding: '14px 28px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 6px 20px ${mainColor}50`,
                     transition: 'all 0.2s',
                     textTransform: 'uppercase',
                     letterSpacing: '0.5px',
                     textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                     transform: 'rotate(1deg)'
                   }}>
                  🎨 OUVIR AGORA
                </a>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const NeonFavelaPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('neon'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#00fff7';
  const bgColor = profile?.bgColor || '#0f2027';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
    deezer: <img src="/assets/streaming-icons/deezer.svg" alt="deezer" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'amazon-music': <img src="/assets/streaming-icons/amazon-music.svg" alt="amazon" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `linear-gradient(135deg, ${bgColor} 0%, #203a43 50%, ${bgColor} 100%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Efeito neon no fundo */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `
          radial-gradient(circle at 30% 40%, ${mainColor}15 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, ${mainColor}10 0%, transparent 50%),
          linear-gradient(45deg, transparent 0%, ${mainColor}03 25%, transparent 50%, ${mainColor}03 75%, transparent 100%)
        `,
        zIndex: 0
      }}></div>

      {/* Header cyber */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        background: `linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(15,32,39,0.5) 100%)`
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `3px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 0 30px ${mainColor}80, 0 0 60px ${mainColor}40, 0 4px 20px rgba(0,0,0,0.5)`,
            filter: 'brightness(1.1) saturate(1.2)'
          }} 
        />
        <h2 style={{ 
          color: mainColor, 
          fontSize: 24, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: `0 0 20px ${mainColor}, 0 0 40px ${mainColor}80, 0 2px 8px rgba(0,0,0,0.8)`,
          fontFamily: 'Orbitron, Arial, sans-serif',
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#b3e5fc', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px',
          fontWeight: '400',
          textShadow: `0 0 10px ${mainColor}30`
        }}>
          {bio}
        </p>
        
        {/* Social Links com estilo neon */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor}) drop-shadow(0 0 20px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor}) drop-shadow(0 0 20px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 10px ${mainColor}) drop-shadow(0 0 20px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música com estilo cyber */}
      <div style={{ width: '100%', padding: '0 16px 16px 16px', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(15,32,39,0.8) 100%)`,
              backdropFilter: 'blur(15px)',
              border: `2px solid ${mainColor}`,
              borderRadius: 12,
              marginBottom: 14,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${mainColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`
            }}>
              <MusicInfo>
                <span style={{ 
                  fontSize: 24,
                  filter: `drop-shadow(0 0 8px ${mainColor})`
                }}>
                  {streamingIcons[ml.platform] || <FaSpotify />}
                </span>
                <MusicTitle style={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  textShadow: `0 0 8px ${mainColor}40`
                }}>
                  {ml.title || ml.platform}
                </MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ 
                           background: `linear-gradient(135deg, ${mainColor} 0%, #00e5ff 100%)`,
                           color: '#000',
                           fontWeight: 'bold',
                           boxShadow: `0 3px 12px ${mainColor}60, 0 0 15px ${mainColor}40`
                         }}>
                <span style={{ fontSize: 18 }}>▶</span> PLAY
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `3px solid ${mainColor}`,
                    boxShadow: `0 0 30px ${mainColor}60, 0 0 60px ${mainColor}30, 0 8px 32px rgba(0,0,0,0.3)`,
                    filter: 'brightness(1.1) saturate(1.2)'
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 19, 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0',
                  textShadow: `0 0 15px ${mainColor}, 0 0 30px ${mainColor}60`
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#b3e5fc', 
                  fontSize: 15, 
                  margin: '0 0 20px 0',
                  fontWeight: '400',
                  textShadow: `0 0 8px ${mainColor}30`
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: `linear-gradient(135deg, ${mainColor} 0%, #00e5ff 100%)`,
                     color: '#000', 
                     borderRadius: 25, 
                     padding: '14px 28px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 6px 20px ${mainColor}50, 0 0 25px ${mainColor}40`,
                     transition: 'all 0.2s',
                     textTransform: 'uppercase',
                     letterSpacing: '1px'
                   }}>
                  ⚡ OUVIR AGORA
                </a>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

const RetroPreview = ({ profile }) => {
  const demo = React.useMemo(() => generateDemoProfile('retro'), []);
  const avatarUrl = profile?.avatar || demo.avatar;
  const username = profile?.username || demo.username;
  const bio = profile?.bio || demo.bio;
  const links = profile?.socials || demo.socials;
  const musicLinks = profile?.musicLinks || [];
  const mainColor = profile?.mainColor || '#ff9800';
  const bgColor = profile?.bgColor || '#1a1a1a';
  
  const streamingIcons = {
    spotify: <FaSpotify color="#1db954" style={{ verticalAlign: 'middle' }} />,
    'apple-music': <img src="/assets/streaming-icons/apple-music.svg" alt="apple music" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'youtube-music': <FaYoutube color="#ff0000" style={{ verticalAlign: 'middle' }} />,
    soundcloud: <FaSoundcloud color="#ff5500" style={{ verticalAlign: 'middle' }} />,
    deezer: <img src="/assets/streaming-icons/deezer.svg" alt="deezer" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
    'amazon-music': <img src="/assets/streaming-icons/amazon-music.svg" alt="amazon" style={{ width: 22, height: 22, verticalAlign: 'middle', display: 'inline-block' }} />,
  };
  
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100%',
      background: `linear-gradient(135deg, ${bgColor} 0%, #2d1b69 50%, ${bgColor} 100%)`, 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0',
      position: 'relative'
    }}>
      {/* Efeito retro no fundo */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: `
          repeating-linear-gradient(90deg, transparent, transparent 2px, ${mainColor}05 2px, ${mainColor}05 4px),
          linear-gradient(180deg, transparent 0%, ${mainColor}08 50%, transparent 100%)
        `,
        zIndex: 0
      }}></div>

      {/* Header vintage */}
      <div style={{ 
        width: '100%', 
        padding: '20px 16px 24px 16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(45,27,105,0.3) 100%)`
      }}>
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          style={{ 
            width: 88, 
            height: 88, 
            borderRadius: '50%', 
            objectFit: 'cover', 
            border: `4px solid ${mainColor}`, 
            marginBottom: 12,
            boxShadow: `0 0 20px ${mainColor}60, 0 4px 20px rgba(0,0,0,0.5)`,
            filter: 'sepia(20%) saturate(120%) hue-rotate(15deg)'
          }} 
        />
        <h2 style={{ 
          color: mainColor, 
          fontSize: 24, 
          fontWeight: 'bold', 
          margin: '0 0 8px 0',
          textAlign: 'center',
          textShadow: `0 0 15px ${mainColor}80, 0 2px 8px rgba(0,0,0,0.8)`,
          fontFamily: 'Courier New, monospace',
          letterSpacing: '1px',
          textTransform: 'uppercase'
        }}>
          {username}
        </h2>
        <p style={{ 
          color: '#e0e0e0', 
          fontSize: 14, 
          textAlign: 'center', 
          margin: '0 0 16px 0',
          lineHeight: 1.4,
          maxWidth: '260px',
          fontWeight: '400',
          fontFamily: 'Courier New, monospace'
        }}>
          {bio}
        </p>
        
        {/* Social Links com estilo retro */}
        {(links.instagram || links.youtube || links.tiktok) && (
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaInstagram />
              </a>
            )}
            {links.youtube && (
              <a href={links.youtube} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaYoutube />
              </a>
            )}
            {links.tiktok && (
              <a href={links.tiktok} target="_blank" rel="noopener noreferrer" 
                 style={{ 
                   color: mainColor, 
                   fontSize: 26,
                   filter: `drop-shadow(0 0 8px ${mainColor}60)`,
                   transition: 'all 0.2s'
                 }}>
                <FaTiktok />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Links de Música com estilo vintage */}
      <div style={{ width: '100%', padding: '0 16px 16px 16px', flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {musicLinks && musicLinks.length > 0 ? (
          musicLinks.map((ml, idx) => (
            <MusicBar key={idx} style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(45,27,105,0.6) 100%)`,
              backdropFilter: 'blur(10px)',
              border: `2px solid ${mainColor}`,
              borderRadius: 12,
              marginBottom: 14,
              boxShadow: `0 4px 16px rgba(0,0,0,0.4), 0 0 15px ${mainColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`
            }}>
              <MusicInfo>
                <span style={{ 
                  fontSize: 24,
                  filter: `drop-shadow(0 0 6px ${mainColor}60)`,
                  opacity: 0.9
                }}>
                  {streamingIcons[ml.platform] || <FaSpotify />}
                </span>
                <MusicTitle style={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  fontFamily: 'Courier New, monospace',
                  textShadow: `0 0 6px ${mainColor}40`
                }}>
                  {ml.title || ml.platform}
                </MusicTitle>
              </MusicInfo>
              <PlayButton href={ml.url} target="_blank" rel="noopener noreferrer"
                         style={{ 
                           background: `linear-gradient(135deg, ${mainColor} 0%, #ffb74d 100%)`,
                           color: '#000',
                           fontWeight: 'bold',
                           boxShadow: `0 3px 12px ${mainColor}50`,
                           fontFamily: 'Courier New, monospace'
                         }}>
                <span style={{ fontSize: 18 }}>▶</span> PLAY
              </PlayButton>
            </MusicBar>
          ))
        ) : (
          (() => {
            const demo = getDemoAlbumAndTrack();
            return (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <img 
                  src={demo.albumCover} 
                  alt={demo.trackName} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    borderRadius: 16, 
                    objectFit: 'cover', 
                    marginBottom: 16,
                    border: `3px solid ${mainColor}`,
                    boxShadow: `0 0 20px ${mainColor}40, 0 8px 32px rgba(0,0,0,0.3)`,
                    filter: 'sepia(20%) saturate(120%) hue-rotate(15deg)'
                  }} 
                />
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: 19, 
                  fontWeight: 'bold', 
                  margin: '0 0 4px 0',
                  textShadow: `0 0 12px ${mainColor}60`,
                  fontFamily: 'Courier New, monospace'
                }}>
                  {demo.trackName}
                </h3>
                <p style={{ 
                  color: '#bdbdbd', 
                  fontSize: 15, 
                  margin: '0 0 20px 0',
                  fontWeight: '400',
                  fontFamily: 'Courier New, monospace'
                }}>
                  {demo.artist}
                </p>
                <a href={demo.spotifyUrl} target="_blank" rel="noopener noreferrer" 
                   style={{ 
                     display: 'inline-block',
                     background: `linear-gradient(135deg, ${mainColor} 0%, #ffb74d 100%)`,
                     color: '#000', 
                     borderRadius: 25, 
                     padding: '14px 28px', 
                     fontWeight: 'bold', 
                     fontSize: 15, 
                     textDecoration: 'none',
                     boxShadow: `0 6px 20px ${mainColor}40`,
                     transition: 'all 0.2s',
                     textTransform: 'uppercase',
                     letterSpacing: '1px',
                     fontFamily: 'Courier New, monospace'
                   }}>
                  📻 OUVIR AGORA
                </a>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

// Função que aplica mockup do celular apenas quando não estiver em previewMode
function withPhoneMockup(PreviewComponent) {
  return function WrappedPreview(props) {
    // Se estiver em previewMode (usado no ProfilePreview), não aplica mockup
    if (props.previewMode) {
      return <PreviewComponent {...props} />;
    }
    
    // Caso contrário, aplica o mockup (para TemplateSelect)
    return (
      <div className="phone-mockup">
        <div className="phone-content">
          <div className="template-preview-container">
            <PreviewComponent {...props} />
          </div>
        </div>
      </div>
    );
  };
}

// Adicione outros templates aqui, padronizando o layout
const allTemplatesPreviewMap = {
  minimal: withPhoneMockup(MinimalPreview),
  quebrada: withPhoneMockup(QuebradaPreview),
  gold: withPhoneMockup(GoldPreview),
  graffiti: withPhoneMockup(GraffitiPreview),
  neon: withPhoneMockup(NeonFavelaPreview),
  retro: withPhoneMockup(RetroPreview),
};

export default allTemplatesPreviewMap;
