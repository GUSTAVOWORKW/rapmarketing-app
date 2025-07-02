import React from 'react';
import { allTemplatesPreviewMap } from '../components/Templates';
import { FaSpotify, FaApple, FaYoutube, FaSoundcloud, FaDeezer, FaAmazon, FaMusic, FaUser, FaImage, FaPalette } from 'react-icons/fa';
import { supabase } from '../services/supabase';
import { getDemoAlbumAndTrack } from '../utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

const phoneFrameStyle = {
  width: 370,
  maxWidth: '100vw',
  height: 760,
  maxHeight: '90vh',
  background: '#222',
  borderRadius: 36,
  boxShadow: '0 8px 32px #0008, 0 0 0 8px #111',
  border: '4px solid #222',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  position: 'relative',
};

const notchStyle = {
  width: 120,
  height: 18,
  background: '#111',
  borderRadius: '0 0 16px 16px',
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2,
};

const streamingOptions = [
  { id: 'spotify', name: 'Spotify', icon: <FaSpotify color="#1db954" /> },
  { id: 'apple-music', name: 'Apple Music', icon: <FaApple color="#fff" /> },
  { id: 'youtube-music', name: 'YouTube Music', icon: <FaYoutube color="#ff0000" /> },
  { id: 'soundcloud', name: 'SoundCloud', icon: <FaSoundcloud color="#ff5500" /> },
  { id: 'deezer', name: 'Deezer', icon: <FaDeezer color="#fff" /> },
  { id: 'amazon-music', name: 'Amazon Music', icon: <FaAmazon color="#ff9900" /> },
  { id: 'tidal', name: 'Tidal', icon: <FaMusic color="#fff" /> },
  { id: 'audiomack', name: 'Audiomack', icon: <FaMusic color="#fff" /> },
  { id: 'napster', name: 'Napster', icon: <FaMusic color="#fff" /> },
  { id: 'pandora', name: 'Pandora', icon: <FaMusic color="#fff" /> },
];

const streamingIcons = Object.fromEntries(streamingOptions.map(opt => [opt.id, opt.icon]));

const sidebarStyle = {
  minWidth: 270,
  maxWidth: 320,
  background: '#232323',
  borderRadius: 18,
  padding: 24,
  marginRight: 32,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
  boxShadow: '0 2px 16px #0005',
  height: 700,
  alignSelf: 'center',
};

const ProfilePreview = ({ profile, onConfirm, allowEdit, onEdit }) => {
  const PreviewComponent = allTemplatesPreviewMap[profile?.template_id] || null;
  const { user } = useAuth();
  const { updateProfile, uploadAvatar } = useProfile();
  const { user } = useAuth();
  const { updateProfile, uploadAvatar } = useProfile();

  // Edição de campos
  const [editMode, setEditMode] = React.useState(true);
  const [links, setLinks] = React.useState(profile?.socials || {});
  const [musicLinks, setMusicLinks] = React.useState(profile?.musicLinks || []);
  const [username, setUsername] = React.useState(profile?.username || '');
  const [bio, setBio] = React.useState(profile?.bio || '');
  const [avatar, setAvatar] = React.useState(profile?.avatar || '');
  const [mainColor, setMainColor] = React.useState(profile?.mainColor || '#00e676');
  const [bgColor, setBgColor] = React.useState(profile?.bgColor || '#232323');
  const [cover, setCover] = React.useState(profile?.cover || '');

  // Para novo link de música
  const [newMusicPlatform, setNewMusicPlatform] = React.useState('spotify');
  const [newMusicUrl, setNewMusicUrl] = React.useState('');
  const [newTrackTitle, setNewTrackTitle] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setLinks(profile?.socials || {});
    setMusicLinks(profile?.musicLinks || []);
    setUsername(profile?.username || '');
    setBio(profile?.bio || '');
    setAvatar(profile?.avatar || '');
    setMainColor(profile?.mainColor || '#00e676');
    setBgColor(profile?.bgColor || '#232323');
    setCover(profile?.cover || '');
  }, [profile]);

  // Adiciona novo link de música
  const handleAddMusicLink = (e) => {
    e.preventDefault();
    if (!newMusicUrl) return;
    setMusicLinks(prev => [...prev, { platform: newMusicPlatform, url: newMusicUrl, title: newTrackTitle }]);
    setNewMusicUrl('');
    setNewTrackTitle('');
  };

  // Remove link de música
  const handleRemoveMusicLink = idx => {
    setMusicLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const handleLinkChange = (platform, value) => {
    setLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSaveEdit = () => {
    if (onEdit) onEdit({
      socials: links,
      musicLinks,
      username,
      bio,
      avatar,
      mainColor,
      bgColor,
      cover
    });
    setEditMode(false);
  };

  const handleConfirmAndSave = async () => {
    if (!user?.id) {
      alert('Usuário não autenticado. Faça login novamente.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        username,
        email: profile?.email, // Assuming email is part of profile and not editable here
        avatarFile: null, // This component doesn't handle file upload directly for avatar
        selectedPredefinedAvatar: avatar, // If avatar is a predefined URL
        social_links: links,
        // musicLinks is not directly part of the profile table, handle separately if needed
        // mainColor, bgColor, cover are also not directly in profile table, handle separately if needed
      });
      if (onConfirm) onConfirm({
        socials: links,
        musicLinks,
        username,
        bio,
        avatar,
        mainColor,
        bgColor,
        cover
      });
    } catch (error) {
      alert('Erro ao salvar perfil: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Corrige avatar/capa
  const fixedAvatar = avatar || 'https://randomuser.me/api/portraits/men/1.jpg';
  const fixedCover = cover || `/assets/templates/${profile.template_id || 'quebrada'}.jpg`;

  // Passa as cores para o template, não para o site
  const fixedProfile = {
    ...profile,
    socials: links,
    musicLinks,
    username,
    bio,
    avatar: fixedAvatar,
    mainColor,
    bgColor,
    cover: fixedCover
  };

  // Função utilitária para randomizar álbum demo
  function getRandomDemoAlbum(templateId) {
    // Retorna um dos álbuns demo possíveis para o template
    const options = [
      getDemoAlbumAndTrack(templateId),
      // Adicione mais álbuns/tracks reais se desejar
      // Exemplo:
      { albumCover: 'https://i.scdn.co/image/ab67616d0000b273b1e0e7e7e7e7e7e7e7e7e7', trackName: 'Negro Drama', artist: 'Racionais MC\'s', spotifyUrl: 'https://open.spotify.com/track/3Qm86XLflmIXVm1wcwkgDK' },
      { albumCover: 'https://i.scdn.co/image/ab67616d0000b273e1e1e1e1e1e1e1e1e1e1', trackName: 'Hoje Cedo', artist: 'Emicida, Pitty', spotifyUrl: 'https://open.spotify.com/track/6Qyc6fS4DsZjB2mRW9DsQs' },
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Drag and drop para musicLinks
  function handleDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(musicLinks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setMusicLinks(reordered);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#181818', color: '#fff', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {allowEdit && (
        <aside style={{ ...sidebarStyle, position: 'relative', zIndex: 2, boxShadow: '0 2px 16px #0008', marginRight: 32, minWidth: 270, maxWidth: 320, height: 700, overflowY: 'auto' }}>
          <h2 style={{ color: mainColor, fontSize: 20, marginBottom: 8 }}>Editar Perfil</h2>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><FaUser /> Nome de usuário
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: 7, borderRadius: 4, border: 'none', fontSize: 15, background: '#181818', color: '#fff', marginTop: 4 }} placeholder="Nome de usuário" />
          </label>
          {/* Avatar apenas upload */}
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><FaImage /> Avatar (upload)
            <input type="file" accept="image/*" style={{ marginTop: 8 }} onChange={async e => {
              const file = e.target.files[0];
              if (!file) return;
              const fileExt = file.name.split('.').pop();
              const fileName = `${user.id}_${Date.now()}.${fileExt}`;
              const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
              if (!error && data) {
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                setAvatar(publicUrl);
              } else {
                alert('Erro ao fazer upload do avatar.');
              }
            }} />
          </label>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>Bio
            <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ width: '100%', padding: 7, borderRadius: 4, border: 'none', fontSize: 15, background: '#181818', color: '#fff', marginTop: 4, minHeight: 48 }} placeholder="Bio" />
          </label>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><FaPalette /> Cor principal
            <input type="color" value={mainColor} onChange={e => setMainColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', background: 'none', marginLeft: 8 }} />
          </label>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>Cor de fundo
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: 40, height: 32, border: 'none', background: 'none', marginLeft: 8 }} />
          </label>
          <label style={{ fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}><FaMusic /> Adicionar link de música</label>
          <form onSubmit={handleAddMusicLink} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <select value={newMusicPlatform} onChange={e => setNewMusicPlatform(e.target.value)} style={{ padding: 6, borderRadius: 4, border: 'none', background: '#181818', color: '#fff', fontSize: 15 }}>
              {streamingOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={newMusicUrl}
              onChange={e => setNewMusicUrl(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 4, border: 'none', fontSize: 15, background: '#181818', color: '#fff' }}
              placeholder="URL da música"
            />
            <input
              type="text"
              value={newTrackTitle}
              onChange={e => setNewTrackTitle(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 4, border: 'none', fontSize: 15, background: '#181818', color: '#fff' }}
              placeholder="Título (opcional)"
            />
            <button type="submit" style={{ background: mainColor, color: '#181818', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', minWidth: 90, transition: 'background 0.2s' }}>Adicionar</button>
          </form>
          {/* Lista de links de música adicionados com drag-and-drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="musicLinksDroppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ marginBottom: 12 }}>
                  {musicLinks.map((ml, idx) => (
                    <Draggable key={idx} draggableId={String(idx)} index={idx}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 6,
                            background: snapshot.isDragging ? '#333' : '#181818',
                            borderRadius: 6,
                            padding: 6,
                            boxShadow: snapshot.isDragging ? '0 2px 8px #0006' : undefined,
                            ...prov.draggableProps.style
                          }}
                        >
                          <span style={{ minWidth: 28 }}>{streamingIcons[ml.platform] || <FaMusic />}</span>
                          <span style={{ fontSize: 15, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ml.title || ml.url}</span>
                          <button onClick={() => handleRemoveMusicLink(idx)} style={{ background: 'none', color: '#f44336', border: 'none', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}>×</button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <button
            style={{ background: '#00e676', color: '#181818', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 'bold', fontSize: 16, cursor: 'pointer', marginTop: 8 }}
            onClick={handleSaveEdit}
          >Salvar Edição</button>
        </aside>
      )}
      <div style={{ ...phoneFrameStyle, minWidth: 320, maxWidth: 370, width: 370, height: 760, maxHeight: '90vh', position: 'relative', zIndex: 1, background: '#222', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', boxShadow: '0 8px 32px #0008, 0 0 0 8px #111', border: '4px solid #222' }}>
        <div style={notchStyle}></div>
        <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: 0, marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 370, maxHeight: 720 }}>
          {PreviewComponent ? (
            <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', padding: 0 }}>
              <PreviewComponent profile={fixedProfile} previewMode />
            </div>
          ) : (
            <div style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Template não encontrado.</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center' }}>
        <button
          style={{ background: '#00e676', color: '#181818', border: 'none', borderRadius: 6, padding: '12px 28px', fontWeight: 'bold', fontSize: 18, cursor: 'pointer', marginBottom: 8 }}
          onClick={handleConfirmAndSave}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Confirmar e Publicar'}
        </button>
        {allowEdit && (
          <button
            style={{ background: '#232323', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 28px', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Cancelar' : 'Editar'}
          </button>
        )}
      </div>
    </div>
  );
};

// Função utilitária para salvar perfil completo no Supabase


export default ProfilePreview;
