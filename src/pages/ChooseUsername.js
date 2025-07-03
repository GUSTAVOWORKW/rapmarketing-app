import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, FaYoutube, FaDeezer } from 'react-icons/fa';
import { validateSocialLink, getSocialValidationMessage } from '../utils/socialValidation';
import SocialLinksPreview from '../components/Common/SocialLinksPreview';

const predefinedAvatars = [
  '/avatars/perfilhomem1.png',
  '/avatars/perfilhomem2.png',
  '/avatars/perfilmulher1.png',
  '/avatars/perfilmulher2.png',
];

const socialIconMapping = {
    instagram: <FaInstagram className="text-pink-500" />,
    twitter: <FaTwitter className="text-blue-400" />,
    facebook: <FaFacebookF className="text-blue-600" />,
    tiktok: <FaTiktok className="text-black" />,
    spotify: <FaSpotify className="text-green-500" />,
    youtube: <FaYoutube className="text-red-600" />,
    deezer: <FaDeezer className="text-purple-500" /> 
};

const ChooseUsername = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedPredefinedAvatar, setSelectedPredefinedAvatar] = useState(null);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '', twitter: '', facebook: '', tiktok: '', spotify: '', youtube: '', deezer: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Effect to redirect if user already has a username
  useEffect(() => {
    if (profile && profile.username) {
      navigate('/dashboard');
    }
    // Pre-fill email from auth user if available
    if (user?.email) {
        setEmail(user.email);
    }
  }, [profile, user, navigate]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (/^[a-z0-9_]*$/.test(value)) {
      setUsername(value);
      if (message.text) setMessage({ text: '', type: '' });
    } else {
      setMessage({ text: 'Username: apenas letras (a-z), números (0-9) e underscores (_).', type: 'error' });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Arquivo muito grande. Máximo 2MB.', type: 'error' });
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage({ text: 'Formato de arquivo inválido. Use JPG, PNG ou WEBP.', type: 'error' });
      return;
    }

    setAvatarFile(file);
    setSelectedPredefinedAvatar(null);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePredefinedAvatarSelect = (avatarUrl) => {
    setSelectedPredefinedAvatar(avatarUrl);
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
  };

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ text: 'Usuário não encontrado. Por favor, faça login novamente.', type: 'error' });
      return;
    }
    if (!username || username.length < 3) {
      setMessage({ text: 'Username deve ter pelo menos 3 caracteres.', type: 'error' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ text: 'Por favor, insira um e-mail válido.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Check username availability
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      if (existingProfile) {
        setMessage({ text: `Username "${username}" não está disponível.`, type: 'error' });
        setLoading(false);
        return;
      }

      // 2. Upload avatar if one is selected
      let avatarUrlToSave = profile?.avatar_url || null;
      if (avatarFile) {
        const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrlToSave = publicUrlData.publicUrl;
      } else if (selectedPredefinedAvatar) {
        avatarUrlToSave = selectedPredefinedAvatar;
      }

      // 3. Prepare profile data and upsert
      const profileData = {
        user_id: user.id,
        username,
        email,
        avatar_url: avatarUrlToSave,
        social_links: socialLinks,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      // 4. Refresh context and navigate
      await refreshProfile(user.id);
      setMessage({ text: 'Perfil salvo com sucesso!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ text: `Erro ao salvar perfil: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9e6ff] p-4 text-[#1c1c1c]">
      <form className="w-full max-w-lg bg-[#ffffff] shadow-2xl rounded-xl p-6 md:p-10 space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center text-[#1c1c1c] mb-8">Complete seu Perfil</h2>
        
        <>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#1c1c1c] mb-1">Username <span className="text-[#3100ff]">*</span></label>
              <input
                id="username"
                className="w-full px-4 py-3 text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3100ff] focus:border-[#3100ff]"
                type="text"
                placeholder="Seu username único"
                value={username}
                onChange={handleUsernameChange}
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-[#1c1c1c]/70">Seu link público: rapmarketing.link/{username || 'seu_username'}</p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1c1c1c] mb-1">Email <span className="text-[#3100ff]">*</span></label>
              <input
                id="email"
                className="w-full px-4 py-3 text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3100ff] focus:border-[#3100ff]"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Avatar Section */}
            <div>
                <label className="block text-sm font-medium text-[#1c1c1c] mb-1">Foto do Avatar (Opcional)</label>
                <div className="mt-2 flex items-center space-x-4">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                        </div>
                    )}
                    <input id="avatar" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleAvatarChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e9e6ff] file:text-[#3100ff] hover:file:bg-[#d1c9ff]" disabled={loading} />
                </div>
                <div className="mt-2 grid grid-cols-4 gap-3">
                    {predefinedAvatars.map((avatarSrc) => (
                        <button key={avatarSrc} type="button" onClick={() => handlePredefinedAvatarSelect(avatarSrc)} className={`w-16 h-16 rounded-full overflow-hidden border-2 hover:border-[#3100ff] focus:outline-none focus:border-[#3100ff] ${selectedPredefinedAvatar === avatarSrc ? 'border-[#3100ff] ring-2 ring-[#3100ff]' : 'border-gray-300'}`} disabled={loading}>
                            <img src={avatarSrc} alt="Avatar predefinido" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-md font-medium text-[#1c1c1c]">Links Sociais (Opcional)</h3>
              {Object.keys(socialLinks).map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">{socialIconMapping[platform]}</div>
                  <input
                    id={`social-${platform}`}
                    className="w-full px-3 py-2 text-sm text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-md focus:ring-1 focus:ring-[#3100ff] focus:border-[#3100ff]"
                    type="url"
                    placeholder={`https://...${platform}.com/seu_perfil`}
                    value={socialLinks[platform]}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            {message.text && (
              <p className={`text-center p-3 rounded-md text-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message.text}
              </p>
            )}

            <button className="w-full py-3 px-4 bg-[#3100ff] hover:bg-opacity-80 text-[#ffffff] font-semibold rounded-lg shadow-md disabled:opacity-50" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Perfil e Continuar'}
            </button>
            
            <button type="button" className="w-full mt-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow" onClick={async () => { await signOut(); navigate('/login'); }}>
                Deslogar
            </button>
        </>
      </form>
    </div>
  );
};

export default ChooseUsername;