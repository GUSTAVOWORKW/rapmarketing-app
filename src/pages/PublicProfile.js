import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { allTemplatesPreviewMap } from '../components/Templates';
import { FaShareAlt, FaWhatsapp, FaTwitter, FaCopy } from 'react-icons/fa';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      if (error || !data) {
        setError('Perfil não encontrado');
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username]);

  const url = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  };

  const handleShare = (type) => {
    if (type === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(url)}`);
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`);
    }
  };

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return null;

  const PreviewComponent = allTemplatesPreviewMap[profile.template_id] || null;

  return (
    <div style={{ minHeight: '100vh', background: '#181818', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
      <h1 style={{ marginBottom: 24 }}>Perfil público de @{profile.username}</h1>
      {PreviewComponent ? (
        <PreviewComponent profile={profile} />
      ) : (
        <div>Template não encontrado.</div>
      )}
      <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
        <button onClick={handleCopy} style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><FaCopy /> Copiar link</button>
        <button onClick={() => handleShare('whatsapp')} style={{ background: '#25d366', color: '#181818', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><FaWhatsapp /> WhatsApp</button>
        <button onClick={() => handleShare('twitter')} style={{ background: '#1da1f2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}><FaTwitter /> Twitter</button>
      </div>
    </div>
  );
};

export default PublicProfile;
