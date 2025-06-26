import React, { useEffect } from 'react';
import { PLATFORMS } from '../../data/platforms';
import { SOCIAL_PLATFORMS } from '../../data/socials';
import { getSpotifyEmbedUrl } from '../../utils/smartLinkUtils';
import type { SmartLink } from '../../types';

// As props são desestruturadas em snake_case para corresponder aos dados do Supabase
const AmazoniaDigital: React.FC<Partial<SmartLink>> = ({
  artist_name,
  artist_title,
  title,
  bio,
  avatar_url,
  release_title,
  cover_image_url,
  player_url,
  platforms = [],
  social_links = [],
  contact_button_text = 'Contato',
  contact_button_url,
}) => {
  useEffect(() => {
    // Estilos específicos do template Amazônia Digital
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600&display=swap');
      
      .amazonia-digital {
        background: radial-gradient(ellipse at center, #0a4d3a 0%, #1a5f4a 30%, #0d2818 70%, #000000 100%);
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        font-family: 'Exo 2', sans-serif;
      }
      
      /* Partículas da floresta digital */
      .amazonia-digital::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 15% 25%, rgba(0, 255, 127, 0.15) 2px, transparent 2px),
          radial-gradient(circle at 85% 15%, rgba(50, 205, 50, 0.12) 3px, transparent 3px),
          radial-gradient(circle at 45% 75%, rgba(34, 139, 34, 0.1) 1px, transparent 1px),
          radial-gradient(circle at 75% 85%, rgba(0, 255, 255, 0.08) 2px, transparent 2px),
          radial-gradient(circle at 25% 65%, rgba(255, 215, 0, 0.06) 1px, transparent 1px);
        background-size: 150px 150px, 200px 200px, 180px 180px, 220px 220px, 160px 160px;
        animation: bio-particulas 30s linear infinite, floresta-pulse 20s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      }
      
      @keyframes bio-particulas {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(-100px) rotate(360deg); }
      }
      
      @keyframes floresta-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      /* Circuitos digitais */
      .amazonia-digital::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          linear-gradient(90deg, transparent 30%, rgba(0, 255, 127, 0.05) 31%, rgba(0, 255, 127, 0.05) 33%, transparent 34%),
          linear-gradient(45deg, transparent 45%, rgba(0, 255, 255, 0.03) 46%, rgba(0, 255, 255, 0.03) 48%, transparent 49%),
          linear-gradient(135deg, transparent 60%, rgba(50, 205, 50, 0.04) 61%, rgba(50, 205, 50, 0.04) 63%, transparent 64%);
        animation: circuitos-flow 25s linear infinite;
        pointer-events: none;
        z-index: 2;
      }
      
      @keyframes circuitos-flow {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(50px) translateY(-25px); }
      }
      
      /* Avatar com bio-scanner */
      .bio-scanner {
        position: relative;
        border-radius: 50%;
        border: 4px solid transparent;
        background: 
          radial-gradient(circle at center, rgba(0, 255, 127, 0.2), rgba(34, 139, 34, 0.3)),
          linear-gradient(45deg, #00ff7f, #32cd32, #228b22, #00ff7f);
        background-size: 100% 100%, 300% 300%;
        animation: bio-scan 4s ease-in-out infinite;
        padding: 4px;
        box-shadow: 
          0 0 30px rgba(0, 255, 127, 0.6),
          0 0 60px rgba(50, 205, 50, 0.4),
          inset 0 0 20px rgba(0, 255, 127, 0.2);
      }
      
      @keyframes bio-scan {
        0%, 100% { 
          background-position: 0% 50%, 0% 50%;
          box-shadow: 
            0 0 30px rgba(0, 255, 127, 0.6),
            0 0 60px rgba(50, 205, 50, 0.4),
            inset 0 0 20px rgba(0, 255, 127, 0.2);
        }
        50% { 
          background-position: 100% 50%, 100% 50%;
          box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.8),
            0 0 80px rgba(0, 255, 127, 0.6),
            inset 0 0 30px rgba(0, 255, 255, 0.3);
        }
      }
      
      /* Linha de scan */
      .bio-scanner::before {
        content: '';
        position: absolute;
        top: 50%;
        left: -20px;
        right: -20px;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(0, 255, 255, 0.8), 
          rgba(0, 255, 127, 1), 
          rgba(0, 255, 255, 0.8), 
          transparent
        );
        animation: scan-line 3s ease-in-out infinite;
        z-index: 10;
      }
      
      @keyframes scan-line {
        0%, 100% { transform: translateY(-50px); opacity: 0; }
        20%, 80% { opacity: 1; }
        50% { transform: translateY(50px); }
      }
      
      /* Jaguar digital flutuante */
      .bio-scanner::after {
        content: '🐆';
        position: absolute;
        top: -45px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 32px;
        animation: jaguar-digital 5s ease-in-out infinite;
        filter: 
          drop-shadow(0 0 20px rgba(0, 255, 127, 1))
          drop-shadow(0 0 40px rgba(0, 255, 255, 0.8));
        z-index: 15;
      }
      
      @keyframes jaguar-digital {
        0%, 100% { 
          transform: translateX(-50%) translateY(0px) scale(1);
          filter: 
            drop-shadow(0 0 20px rgba(0, 255, 127, 1))
            drop-shadow(0 0 40px rgba(0, 255, 255, 0.8));
        }
        25% { 
          transform: translateX(-50%) translateY(-10px) scale(1.1);
          filter: 
            drop-shadow(0 0 30px rgba(0, 255, 127, 1))
            drop-shadow(0 0 50px rgba(50, 205, 50, 0.9));
        }
        75% { 
          transform: translateX(-50%) translateY(-5px) scale(1.05);
          filter: 
            drop-shadow(0 0 25px rgba(0, 255, 255, 1))
            drop-shadow(0 0 45px rgba(0, 255, 127, 0.8));
        }
      }
      
      /* Nome com efeito bio-luminescente */
      .nome-bioluminescente {
        background: linear-gradient(45deg, #00ff7f, #32cd32, #00ffff, #00ff7f);
        background-size: 300% 300%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: bio-glow 6s ease-in-out infinite;
        font-family: 'Orbitron', monospace;
        font-weight: 700;
        position: relative;
        text-shadow: 0 0 30px rgba(0, 255, 127, 0.8);
      }
      
      @keyframes bio-glow {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      /* ===== BOTÕES DE STREAMING ÚNICOS - FORMATO HEXAGONAL ===== */
      .streaming-hexagon {
        position: relative;
        width: 100%;
        height: 60px;
        background: linear-gradient(135deg, 
          rgba(0, 255, 127, 0.15), 
          rgba(34, 139, 34, 0.2), 
          rgba(0, 255, 255, 0.1)
        );
        margin: 8px 0;
        clip-path: polygon(15% 0%, 85% 0%, 100% 50%, 85% 100%, 15% 100%, 0% 50%);
        transition: all 0.4s ease;
        border: 2px solid rgba(0, 255, 127, 0.6);
        backdrop-filter: blur(10px);
        overflow: hidden;
      }
      
      .streaming-hexagon::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(0, 255, 255, 0.6), 
          rgba(0, 255, 127, 0.8),
          transparent
        );
        transition: left 0.6s ease;
      }
      
      .streaming-hexagon:hover {
        background: linear-gradient(135deg, 
          rgba(0, 255, 127, 0.25), 
          rgba(50, 205, 50, 0.3), 
          rgba(0, 255, 255, 0.2)
        );
        border-color: #00ffff;
        transform: scale(1.05);
        box-shadow: 
          0 10px 30px rgba(0, 255, 127, 0.4),
          0 0 50px rgba(0, 255, 255, 0.3);
      }
      
      .streaming-hexagon:hover::before {
        left: 100%;
      }
      
      .streaming-hexagon-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #00ff7f;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        z-index: 10;
        position: relative;
      }
      
      /* ===== REDES SOCIAIS ÚNICAS - FORMATO FOLHA DIGITAL ===== */
      .social-folha {
        position: relative;
        width: 50px;
        height: 50px;
        background: radial-gradient(ellipse at center, 
          rgba(0, 255, 127, 0.2), 
          rgba(34, 139, 34, 0.3)
        );
        border: 2px solid rgba(0, 255, 127, 0.7);
        border-radius: 50% 0 50% 0;
        transition: all 0.4s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00ff7f;
        font-size: 20px;
        transform: rotate(45deg);
        overflow: hidden;
      }
      
      .social-folha > * {
        transform: rotate(-45deg);
      }
      
      .social-folha::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 80px;
        height: 80px;
        margin: -40px 0 0 -40px;
        border-radius: 50% 0 50% 0;
        border: 1px solid rgba(0, 255, 255, 0.4);
        animation: folha-pulse 3s ease-in-out infinite;
        z-index: -1;
      }
      
      @keyframes folha-pulse {
        0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
        50% { transform: scale(1.3) rotate(90deg); opacity: 0.8; }
      }
      
      .social-folha:hover {
        color: #32cd32;
        transform: rotate(45deg) scale(1.3);
        border-color: #00ffff;
        background: radial-gradient(ellipse at center, 
          rgba(0, 255, 255, 0.3), 
          rgba(50, 205, 50, 0.4)
        );
        box-shadow: 
          0 0 20px rgba(0, 255, 127, 0.7),
          0 0 40px rgba(0, 255, 255, 0.5);
      }
      
      /* ===== BOTÃO DE CONTATO ÚNICO - FORMATO TRIBAL DIGITAL ===== */
      .contato-tribal {
        position: relative;
        background: linear-gradient(135deg, 
          rgba(255, 215, 0, 0.2), 
          rgba(0, 255, 127, 0.15), 
          rgba(34, 139, 34, 0.2)
        );
        border: 3px solid rgba(255, 215, 0, 0.8);
        padding: 15px 25px;
        border-radius: 0;
        clip-path: polygon(10% 0%, 90% 0%, 95% 25%, 90% 50%, 95% 75%, 90% 100%, 10% 100%, 5% 75%, 10% 50%, 5% 25%);
        transition: all 0.5s ease;
        overflow: hidden;
        backdrop-filter: blur(12px);
        font-family: 'Orbitron', monospace;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: #ffd700;
      }
      
      .contato-tribal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: 
          repeating-linear-gradient(45deg, 
            transparent, 
            transparent 5px, 
            rgba(255, 215, 0, 0.1) 6px, 
            rgba(255, 215, 0, 0.1) 8px
          );
        animation: tribal-pattern 8s linear infinite;
      }
      
      @keyframes tribal-pattern {
        0% { transform: translateX(0) translateY(0); }
        100% { transform: translateX(20px) translateY(-20px); }
      }
      
      .contato-tribal:hover {
        background: linear-gradient(135deg, 
          rgba(255, 215, 0, 0.3), 
          rgba(0, 255, 127, 0.25), 
          rgba(50, 205, 50, 0.3)
        );
        border-color: #00ff7f;
        transform: scale(1.08);
        color: #00ff7f;
        box-shadow: 
          0 15px 35px rgba(255, 215, 0, 0.4),
          0 0 60px rgba(0, 255, 127, 0.3);
      }
        /* Player do Spotify com tema amazônico */
      .spotify-amazonia-container {
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(0, 255, 127, 0.8);
        box-shadow: 
          0 0 30px rgba(0, 255, 127, 0.4),
          inset 0 0 30px rgba(34, 139, 34, 0.2);
        backdrop-filter: blur(12px);
        background: linear-gradient(135deg, 
          rgba(0, 255, 127, 0.15), 
          rgba(34, 139, 34, 0.15)
        );
      }
        /* Capa com efeito holográfico */
      .capa-amazonia {
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        border: 3px solid rgba(0, 255, 255, 0.7);
      }
      
      .capa-amazonia::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, 
          rgba(0, 255, 127, 0.15), 
          rgba(0, 255, 255, 0.12), 
          rgba(50, 205, 50, 0.1),
          rgba(255, 215, 0, 0.08)
        );
        mix-blend-mode: overlay;
        animation: holographic-shift 8s ease-in-out infinite;
      }
      
      @keyframes holographic-shift {
        0%, 100% { transform: translateX(0) scale(1); }
        25% { transform: translateX(2px) scale(1.01); }
        50% { transform: translateX(-1px) scale(1.02); }
        75% { transform: translateX(1px) scale(1.01); }
      }
      
      /* Decorações da floresta digital */
      .arvore-digital {
        position: absolute;
        top: 10%;
        left: 5%;
        font-size: 24px;
        opacity: 0.7;
        animation: arvore-sway 8s ease-in-out infinite;
        filter: drop-shadow(0 0 12px rgba(34, 139, 34, 0.8));
        z-index: 5;
      }
      
      @keyframes arvore-sway {
        0%, 100% { transform: rotate(-3deg) translateY(0px); }
        50% { transform: rotate(3deg) translateY(-5px); }
      }
        .tucano-cyber {
        position: absolute;
        top: 18%;
        right: 10%;
        font-size: 28px;
        opacity: 1;
        animation: tucano-flight 10s ease-in-out infinite;
        filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 30px rgba(0, 255, 127, 0.7));
        z-index: 8;
        text-shadow: 0 0 15px rgba(0, 255, 255, 1);
      }
      
      @keyframes tucano-flight {
        0%, 100% { transform: translateX(0) translateY(0) rotate(0deg) scale(1); }
        25% { transform: translateX(-15px) translateY(-12px) rotate(-8deg) scale(1.1); }
        50% { transform: translateX(10px) translateY(-20px) rotate(5deg) scale(1.05); }
        75% { transform: translateX(-8px) translateY(-10px) rotate(-3deg) scale(1.08); }
      }
        .folhas-digitais {
        position: absolute;
        bottom: 20%;
        left: 8%;
        font-size: 30px;
        opacity: 1;
        animation: folhas-fall 12s ease-in-out infinite;
        filter: drop-shadow(0 0 15px rgba(0, 255, 127, 0.9)) drop-shadow(0 0 25px rgba(50, 205, 50, 0.7));
        z-index: 8;
        text-shadow: 0 0 12px rgba(0, 255, 127, 1);
      }
      
      .folhas-digitais::before {
        content: '🌿';
        position: absolute;
        top: -40px;
        left: 20px;
        font-size: 24px;
        animation: folhas-fall 10s ease-in-out infinite reverse;
        filter: drop-shadow(0 0 12px rgba(34, 139, 34, 0.8));
      }
      
      .folhas-digitais::after {
        content: '🍀';
        position: absolute;
        top: -20px;
        right: -15px;
        font-size: 20px;
        animation: folhas-fall 14s ease-in-out infinite;
        filter: drop-shadow(0 0 10px rgba(0, 255, 127, 0.6));
      }
      
      @keyframes folhas-fall {
        0% { transform: translateY(-30px) rotate(0deg) scale(1); opacity: 1; }
        25% { transform: translateY(-10px) rotate(90deg) scale(1.1); opacity: 0.8; }
        50% { transform: translateY(15px) rotate(180deg) scale(0.9); opacity: 0.9; }
        75% { transform: translateY(35px) rotate(270deg) scale(1.05); opacity: 0.7; }
        100% { transform: translateY(60px) rotate(360deg) scale(1); opacity: 0.4; }
      }
        /* Código binário flutuante */
      .codigo-binario {
        position: absolute;
        top: 50%;
        right: 5%;
        font-family: 'Orbitron', monospace;
        font-size: 14px;
        color: rgba(0, 255, 127, 0.9);
        animation: codigo-flow 15s linear infinite;
        z-index: 8;
        line-height: 1.4;
        text-shadow: 0 0 8px rgba(0, 255, 127, 0.8);
        opacity: 1;
      }
      
      @keyframes codigo-flow {
        0% { transform: translateY(0); opacity: 0.9; }
        100% { transform: translateY(-300px); opacity: 0; }
      }
      
      /* Partículas bio-luminescentes extras */
      .particula-bio {
        position: absolute;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, rgba(0, 255, 127, 0.8), rgba(50, 205, 50, 0.4));
        border-radius: 50%;
        animation: bio-float 8s ease-in-out infinite;
        z-index: 6;
        box-shadow: 0 0 15px rgba(0, 255, 127, 0.6);
      }
      
      @keyframes bio-float {
        0%, 100% { transform: translateY(0px) scale(1); opacity: 0.7; }
        50% { transform: translateY(-40px) scale(1.3); opacity: 1; }
      }
      
      /* Circuitos visíveis */
      .circuito-visivel {
        position: absolute;
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(0, 255, 127, 0.8), 
          rgba(0, 255, 255, 0.9), 
          rgba(0, 255, 127, 0.8), 
          transparent
        );
        animation: circuito-pulse 6s ease-in-out infinite;
        z-index: 4;
        box-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
      }
      
      @keyframes circuito-pulse {
        0%, 100% { opacity: 0.5; transform: scaleX(0.5); }
        50% { opacity: 1; transform: scaleX(1.2); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Lógica para mapear IDs para dados completos (ícones, nomes)
  const finalPlatforms = (platforms || [])
    .filter(link => link.url && link.platform_id)
    .map(link => {
      const platformData = PLATFORMS.find(p => p.id === link.platform_id);
      return { ...link, ...platformData };
    });

  const finalSocials = (social_links || [])
    .filter(link => link.url && link.platform)
    .map(link => {
      const socialData = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
      return { ...link, ...socialData };
    });

  const hasPlayer = player_url && player_url.includes('open.spotify.com');
  return (
    <div className="amazonia-digital text-white p-4 relative">
      {/* Decorações da Floresta Digital */}
      <div className="arvore-digital">🌳</div>
      <div className="tucano-cyber">🦜</div>
      <div className="folhas-digitais">🍃</div>
      
      {/* Código Binário Flutuante */}
      <div className="codigo-binario">
        01001101<br/>
        11010010<br/>
        10110101<br/>
        01101110<br/>
        11001011<br/>
        10010011<br/>
        01110100
      </div>
      
      {/* Partículas Bio-luminescentes */}
      <div className="particula-bio" style={{
        top: '25%',
        left: '20%',
        animationDelay: '0s'
      }}></div>
      
      <div className="particula-bio" style={{
        top: '60%',
        left: '80%',
        animationDelay: '2s'
      }}></div>
      
      <div className="particula-bio" style={{
        top: '40%',
        left: '15%',
        animationDelay: '4s'
      }}></div>
      
      <div className="particula-bio" style={{
        top: '70%',
        right: '25%',
        animationDelay: '1s'
      }}></div>
      
      <div className="particula-bio" style={{
        top: '35%',
        right: '40%',
        animationDelay: '3s'
      }}></div>
      
      {/* Circuitos Visíveis */}
      <div className="circuito-visivel" style={{
        top: '30%',
        left: '10%',
        transform: 'rotate(15deg)',
        animationDelay: '0s'
      }}></div>
      
      <div className="circuito-visivel" style={{
        bottom: '25%',
        right: '15%',
        transform: 'rotate(-25deg)',
        animationDelay: '2s'
      }}></div>
      
      <div className="circuito-visivel" style={{
        top: '55%',
        left: '30%',
        transform: 'rotate(45deg)',
        animationDelay: '4s'
      }}></div>
      
      {/* Mais elementos da floresta */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '85%',
        fontSize: '20px',
        animation: 'arvore-sway 10s ease-in-out infinite',
        filter: 'drop-shadow(0 0 12px rgba(0, 255, 127, 0.8))',
        zIndex: 7
      }}>🌲</div>
      
      <div style={{
        position: 'absolute',
        bottom: '30%',
        right: '20%',
        fontSize: '16px',
        animation: 'folhas-fall 9s ease-in-out infinite',
        filter: 'drop-shadow(0 0 8px rgba(50, 205, 50, 0.7))',
        zIndex: 7
      }}>🌱</div>
      
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '5%',
        fontSize: '18px',
        animation: 'bio-float 7s ease-in-out infinite',
        filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.6))',
        zIndex: 7
      }}>🦋</div>
      
      {/* Header com Avatar Bio-Scanner */}
      <header className="text-center my-6 relative z-10">
        <div className="relative inline-block mb-4">
          <div className="bio-scanner">
            <img 
              src={avatar_url || '/assets/defaults/default-avatar.png'} 
              alt={artist_name} 
              className="w-20 h-20 rounded-full object-cover" 
            />
          </div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 border border-cyan-400 rounded-full animate-pulse opacity-20"></div>
        </div>
        <h1 className="text-2xl font-bold nome-bioluminescente uppercase tracking-wider">
          {artist_name || 'Guardião Digital'}
        </h1>
        {(artist_title || release_title) && (
          <h2 className="text-sm text-green-200 font-light mt-1 tracking-wide">
            {artist_title || release_title}
          </h2>
        )}
      </header>      {/* Imagem de Capa, Player e Bio */}
      <main className="relative z-10">
        {hasPlayer ? (
          <div className="spotify-amazonia-container my-4 max-w-md mx-auto">
            {(() => {
              const embedUrl = getSpotifyEmbedUrl(player_url!);
              if (!embedUrl) {
                return (
                  <div className="text-red-300 text-center p-2 bg-red-900/50 rounded-md text-sm">
                    URL do Spotify inválida.
                  </div>
                );
              }
              return (
                <iframe
                  style={{ borderRadius: '15px' }}
                  src={embedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify Player"
                />
              );
            })()}
          </div>
        ) : (
          cover_image_url && (
            <div className="capa-amazonia max-w-sm mx-auto mb-4">
              <img 
                src={cover_image_url} 
                alt={artist_name} 
                className="w-full rounded-lg object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )
        )}

        {bio && <p className="text-center max-w-lg mx-auto mb-6 text-green-100 text-sm leading-relaxed font-light">{bio}</p>}

        {/* BOTÕES DE STREAMING HEXAGONAIS ÚNICOS */}
        <section className="max-w-md mx-auto mb-6">
          <div className="flex flex-col space-y-1">
            {finalPlatforms?.map((platform, index) => {
              const Icon = platform.icon;
              // Não mostra o botão do Spotify se já tem player
              if (platform.platform_id === 'spotify' && hasPlayer) {
                return null;
              }
              return (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="streaming-hexagon"
                >
                  <div className="streaming-hexagon-content">
                    {Icon && <Icon className="w-5 h-5 mr-2" />}
                    <span>{platform.name}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* BOTÃO DE CONTATO TRIBAL DIGITAL ÚNICO */}
        {contact_button_url && (
          <section className="max-w-md mx-auto mb-6 flex justify-center">
            <a
              href={contact_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="contato-tribal"
            >
              {contact_button_text}
            </a>
          </section>
        )}

        {/* REDES SOCIAIS EM FORMATO FOLHA DIGITAL ÚNICAS */}
        {finalSocials.length > 0 && (
          <footer className="text-center">
            <div className="flex justify-center items-center space-x-6 flex-wrap gap-4">
              {finalSocials.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-folha"
                    aria-label={link.name}
                  >
                    {Icon && <Icon />}
                  </a>
                );
              })}
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default AmazoniaDigital;
