import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ProfilePreview, { saveFullProfile } from './ProfilePreview';
import { supabase } from '../services/supabase';
import { useLocation } from 'react-router-dom';
import { generateDemoProfile } from '../utils';

const streamingIconUrl = (id) => `/assets/streaming-icons/${id}.svg`;
const platforms = [
  { id: 'spotify', name: 'Spotify' },
  { id: 'apple-music', name: 'Apple Music' },
  { id: 'youtube-music', name: 'YouTube Music' },
  { id: 'soundcloud', name: 'SoundCloud' },
  { id: 'deezer', name: 'Deezer' },
  { id: 'amazon-music', name: 'Amazon Music' },
  { id: 'tidal', name: 'Tidal' },
  { id: 'audiomack', name: 'Audiomack' },
  { id: 'napster', name: 'Napster' },
  { id: 'pandora', name: 'Pandora' },
];

const Container = styled.div`
  min-height: 100vh;
  background: #181818;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px 20px 20px;
`;

const Title = styled.h2`
  margin-bottom: 18px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const PlatformRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #232323;
  border-radius: 8px;
  padding: 10px 14px;
`;

const Input = styled.input`
  flex: 1;
  padding: 8px 10px;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  background: #181818;
  color: #fff;
`;

const Button = styled.button`
  margin-top: 24px;
  background: #00e676;
  color: #181818;
  border: none;
  border-radius: 6px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #00c853;
  }
`;

const StreamingSetup = ({ currentUserId, onProfileUpdate }) => {
  const location = useLocation();
  const [links, setLinks] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [templateId, setTemplateId] = useState(null);

  useEffect(() => {
    // Se veio do choose-template, pega o templateId do state
    if (location.state && location.state.templateId) {
      setTemplateId(location.state.templateId);
    }
  }, [location.state]);

  useEffect(() => {
    // Busca o perfil do usuário para preview real
    const fetchProfile = async () => {
      if (!currentUserId) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .maybeSingle();
      setUserProfile(data);
      // Se não tem socials/musicLinks customizados, gera demo do template escolhido
      if (data && (!data.socials || Object.keys(data.socials).length === 0) && templateId) {
        const demo = generateDemoProfile(templateId);
        setProfileData({ ...data, ...demo, template_id: templateId });
      } else {
        setProfileData(data);
      }
    };
    fetchProfile();
  }, [currentUserId, templateId]);

  const handleChange = (platform, value) => {
    setLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Atualiza os links no perfil do usuário
    await supabase
      .from('profiles')
      .update({ socials: links, updated_at: new Date().toISOString() })
      .eq('user_id', currentUserId);
    if (onProfileUpdate) await onProfileUpdate();
    // Converte os links preenchidos em musicLinks para o preview
    const musicLinks = Object.entries(links)
      .filter(([_, url]) => url && url.trim() !== '')
      .map(([platform, url]) => ({ platform, url, title: '' }));
    setProfileData({ ...userProfile, socials: links, musicLinks });
    setShowPreview(true);
    setSaving(false);
  };

  const handleConfirm = async (profileDataToSave) => {
    setSaving(true);
    const error = await saveFullProfile(currentUserId, profileDataToSave);
    setSaving(false);
    if (error) {
      alert('Erro ao salvar perfil: ' + error.message);
      return;
    }
    // Após salvar, redireciona para a tela de Meus Templates no Dashboard
    window.location.href = '/dashboard?tab=templates';
  };

  if (showPreview && profileData) {
    return <ProfilePreview profile={profileData} onConfirm={handleConfirm} allowEdit onEdit={() => setShowPreview(false)} currentUserId={currentUserId} />;
  }

  return (
    <Container>
      <Title>Adicione seus links de streaming</Title>
      <Form onSubmit={handleSubmit} autoComplete="off">
        {platforms.map((p) => (
          <PlatformRow key={p.id}>
            <img
              src={streamingIconUrl(p.id)}
              alt={p.name + ' logo'}
              style={{ width: 32, height: 32, borderRadius: 6, background: '#fff', padding: 2, boxShadow: '0 1px 4px #0003', transition: 'transform 0.2s', filter: 'drop-shadow(0 0 2px #00e67688)' }}
              onError={e => { e.target.style.opacity = 0.3; e.target.src = '/assets/streaming-icons/spotify.svg'; }}
            />
            <span style={{ minWidth: 90 }}>{p.name}</span>
            <Input
              type="text"
              placeholder={`Link do ${p.name}`}
              value={links[p.id] || ''}
              onChange={e => handleChange(p.id, e.target.value)}
              autoComplete="off"
            />
          </PlatformRow>
        ))}
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Avançar'}
        </Button>
      </Form>
    </Container>
  );
};

export default StreamingSetup;
