import React from 'react';
import styled from 'styled-components';
import { FaInstagram, FaYoutube, FaSpotify, FaSoundcloud, FaTiktok } from 'react-icons/fa';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';

const Wrapper = styled(motion.div)`
  width: 100%;
  min-height: 420px;
  background: linear-gradient(135deg, #232323 60%, #00e676 100%);
  color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.22);
  padding: 36px 28px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid #00e676;
`;

const Title = styled.h1`
  font-size: 2.3rem;
  margin-bottom: 12px;
  font-family: 'Oswald', 'Arial Black', sans-serif;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #000a;
`;

const Subtitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: 22px;
  color: #bdbdbd;
  text-align: center;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 4px solid #fff;
  background: #222;
  box-shadow: 0 2px 12px #0008;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 18px;
  margin-top: 18px;
`;

const SocialIcon = styled.a`
  color: #fff;
  font-size: 2.1rem;
  transition: color 0.2s, transform 0.2s;
  &:hover {
    color: #00e676;
    transform: scale(1.15);
  }
`;

const LinksBar = styled.div`
  display: flex;
  gap: 16px;
  margin: 18px 0 10px 0;
`;

const PlayerWrapper = styled.div`
  width: 100%;
  max-width: 340px;
  margin: 18px auto 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px #0006;
`;

const InfoBox = styled.div`
  background: rgba(0,0,0,0.18);
  border-radius: 10px;
  padding: 12px 18px;
  margin-top: 18px;
  color: #e0e0e0;
  font-size: 0.98rem;
  text-align: center;
  max-width: 340px;
`;

const Tag = styled.span`
  display: inline-block;
  background: #00e676;
  color: #181818;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 6px;
  padding: 2px 10px;
  margin: 0 4px 8px 0;
  letter-spacing: 1px;
`;

// Exemplo de preview para o template "Quebrada Style"
const QuebradaStylePreview = ({ profile }) => {
  // Se profile.avatar for uma URL válida, usa ela. Se não, busca avatar randomuser, senão usa imagem local.
  let avatarUrl = '';
  if (profile?.avatar && profile.avatar.trim() !== '') {
    avatarUrl = profile.avatar;
  } else {
    // Usa avatar randomuser masculino ou feminino aleatório
    const gender = Math.random() < 0.5 ? 'men' : 'women';
    const number = Math.floor(Math.random() * 99) + 1;
    avatarUrl = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
  }
  const username = profile?.username && profile.username !== '' ? profile.username : 'Artista da Quebrada';
  const bio = profile?.bio && profile.bio !== '' ? profile.bio : 'Mostre sua história, conquistas e links aqui!';

  // Links fictícios para preview
  const links = {
    instagram: profile?.instagram || 'https://instagram.com/',
    youtube: profile?.youtube || 'https://youtube.com/',
    spotify: profile?.spotify || 'https://open.spotify.com/',
    soundcloud: profile?.soundcloud || 'https://soundcloud.com/',
    tiktok: profile?.tiktok || 'https://tiktok.com/'
  };
  // Música de exemplo
  const musicUrl = profile?.musicUrl || 'https://www.youtube.com/watch?v=QDYfEBY9NM4';

  return (
    <Wrapper
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: 'spring' }}
    >
      <Tag>Quebrada Style</Tag>
      <Avatar src={avatarUrl} alt="Avatar do artista" onError={e => { e.target.onerror = null; e.target.src = '/assets/templates/quebrada.jpg'; }} />
      <Title>{username}</Title>
      <Subtitle>{bio}</Subtitle>
      <LinksBar>
        <SocialIcon href={links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <FaInstagram />
        </SocialIcon>
        <SocialIcon href={links.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <FaYoutube />
        </SocialIcon>
        <SocialIcon href={links.spotify} target="_blank" rel="noopener noreferrer" aria-label="Spotify">
          <FaSpotify />
        </SocialIcon>
        <SocialIcon href={links.soundcloud} target="_blank" rel="noopener noreferrer" aria-label="Soundcloud">
          <FaSoundcloud />
        </SocialIcon>
        <SocialIcon href={links.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
          <FaTiktok />
        </SocialIcon>
      </LinksBar>
      <PlayerWrapper>
        <ReactPlayer url={musicUrl} width="100%" height="60px" controls style={{ background: '#111' }} />
      </PlayerWrapper>
      <InfoBox>
        <b>Bio inteligente para artistas de rap e hip-hop</b><br/>
        Personalize seu perfil, adicione links, músicas e conquistas. Compartilhe sua história e conecte-se com seu público de forma autêntica.
      </InfoBox>
    </Wrapper>
  );
};

export default QuebradaStylePreview;