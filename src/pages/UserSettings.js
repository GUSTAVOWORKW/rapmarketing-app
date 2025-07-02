import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, FaYoutube, FaLink, FaDeezer, FaUserCircle } from 'react-icons/fa';
import { MdSave, MdErrorOutline, MdCheckCircleOutline, MdFileUpload } from 'react-icons/md';
import { useSpotifyConnection } from '../hooks/useSpotifyConnection';
import { validateSocialLink, getSocialValidationMessage } from '../utils/socialValidation';
import SocialLinksPreview from '../components/Common/SocialLinksPreview';

const socialPlatforms = [
    { name: 'instagram', Icon: FaInstagram, placeholder: 'https://instagram.com/usuario', color: 'text-pink-500' },
    { name: 'twitter', Icon: FaTwitter, placeholder: 'https://twitter.com/usuario', color: 'text-sky-500' },
    { name: 'facebook', Icon: FaFacebookF, placeholder: 'https://facebook.com/usuario', color: 'text-blue-600' },
    { name: 'tiktok', Icon: FaTiktok, placeholder: 'https://tiktok.com/@usuario', color: 'text-black' },
    { name: 'spotify', Icon: FaSpotify, placeholder: 'https://open.spotify.com/artist/id', color: 'text-green-500' },
    { name: 'youtube', Icon: FaYoutube, placeholder: 'https://youtube.com/c/canal', color: 'text-red-600' },
    { name: 'deezer', Icon: FaDeezer, placeholder: 'https://deezer.com/profile/id', color: 'text-purple-500' },
    { name: 'other', Icon: FaLink, placeholder: 'https://seuoutrolink.com', color: 'text-gray-500' }
];

const UserSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [socialLinks, setSocialLinks] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { isConnected: spotifyConnected, loading: spotifyLoading, connectSpotify, hasValidToken } = useSpotifyConnection();

    const fetchProfileDataForForm = useCallback(async (sessionUser) => {
        try {
            setLoading(true);
            setError('');
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, user_id, username, avatar_url, email, social_links')
                .eq('user_id', sessionUser.id)
                .single();

            if (profileError) throw profileError;

            if (profileData) {
                setProfile(profileData);
                setSocialLinks(profileData.social_links || {});
                setAvatarPreview(profileData.avatar_url || null); 
            } else {
                setError('Perfil não encontrado.');
            }
        } catch (err) {
            console.error("Erro ao buscar dados do perfil para o formulário:", err);
            setError('Falha ao carregar dados do perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Erro ao obter sessão:", sessionError);
                setLoading(false);
                setError("Erro ao verificar autenticação.");
                navigate('/login');
                return;
            }
            if (session?.user) {
                setUser(session.user);
                fetchProfileDataForForm(session.user);
            } else {
                setLoading(false);
                setError("Usuário não autenticado.");
                navigate('/login');
            }
        };
        getSession();
    }, [fetchProfileDataForForm, navigate]);

    useEffect(() => {
        if (profile?.avatar_url) {
            setAvatarPreview(profile.avatar_url);
        }
    }, [profile?.avatar_url]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Arquivo de avatar muito grande. Máximo 2MB.');
                setAvatarFile(null);
                e.target.value = null;
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                setError('Formato de arquivo inválido. Use JPG, PNG ou WEBP.');
                setAvatarFile(null);
                e.target.value = null;
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setSuccessMessage('');
            setError('');
        } else {
            setAvatarFile(null);
            setAvatarPreview(profile?.avatar_url || null);
        }
    };

    const handleSocialLinkChange = (platform, value) => {
        setSocialLinks(prev => ({ ...prev, [platform]: value }));
        
        // Validar URL se foi preenchida
        if (value && !validateSocialLink(platform, value)) {
            setError(getSocialValidationMessage(platform));
        } else {
            setSuccessMessage('');
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile || !user) return;

        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            // Validar URLs de redes sociais antes de salvar
            for (const [platform, url] of Object.entries(socialLinks)) {
                if (url && !validateSocialLink(platform, url)) {
                    throw new Error(`${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${getSocialValidationMessage(platform)}`);
                }
            }

            let avatarUrlToSave = profile?.avatar_url;

            if (avatarFile) {
                const fileName = `${user.id}_${Date.now()}.${avatarFile.name.split('.').pop()}`;
                const filePath = fileName; 

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (uploadError) {
                    console.error("Supabase upload error details:", uploadError);
                    throw new Error(`Erro no upload do avatar: ${uploadError.message}. Detalhes: ${JSON.stringify(uploadError)}`);
                }

                const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
                if (publicUrlData) {
                    avatarUrlToSave = publicUrlData.publicUrl;
                } else {
                    console.warn('Não foi possível obter a URL pública do avatar após o upload. filePath usado:', filePath);
                }
            }

            const updates = {
                social_links: socialLinks,
                updated_at: new Date().toISOString(),
            };

            if (avatarUrlToSave !== profile?.avatar_url) {
                updates.avatar_url = avatarUrlToSave;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id);

            if (updateError) throw updateError;

            setSuccessMessage('Configurações atualizadas com sucesso!');
            if (avatarFile) setAvatarFile(null);
            if (updates.avatar_url) {
                setProfile(prevProfile => ({...prevProfile, avatar_url: updates.avatar_url}));
            }

        } catch (err) {
            console.error("Erro ao atualizar configurações:", err);
            setError(`Falha ao salvar alterações: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#e9e6ff]">
                <div className="text-2xl font-semibold text-[#3100ff]">Carregando Configurações...</div>
            </div>
        );
    }

    if (!profile || !user) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#e9e6ff]">
                <div className="text-2xl font-semibold text-red-500">Erro ao carregar dados para as configurações. Redirecionando...</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-10">
                <h1 className="text-4xl font-extrabold text-[#1c1c1c]">
                    Configurações da Conta
                </h1>
            </header>

            {/* Bloco de login com Spotify */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold flex items-center mb-2" style={{ color: '#1db954' }}>
                    <FaSpotify className="mr-2" /> Spotify
                </h2>
                {spotifyLoading ? (
                    <span className="text-gray-500">Verificando conexão com Spotify...</span>
                ) : spotifyConnected && hasValidToken ? (
                    <div className="flex items-center space-x-3">
                        <span className="text-green-700 font-semibold">Conta do Spotify conectada!</span>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            if (!user) {
                                setError('Usuário não autenticado.');
                                return;
                            }
                            supabase.auth.signInWithOAuth({ 
                                provider: 'spotify',
                                options: {
                                    redirectTo: window.location.origin + '/spotify-callback',
                                },
                            });
                        }}
                        className="flex items-center px-6 py-3 bg-[#1db954] text-white font-bold rounded-lg shadow hover:bg-[#169c46] transition"
                    >
                        <FaSpotify className="mr-2" /> Conectar com Spotify
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
                    <MdErrorOutline className="text-xl mr-3" />
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
                    <MdCheckCircleOutline className="text-xl mr-3" />
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-8">
                {/* Seção de Avatar */}
                <div>
                    <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-1">Foto de perfil</h2>
                    <p className="text-sm text-[#1c1c1c]/70 mb-6">Atualize sua foto de perfil.</p>
                    <div className="flex items-center space-x-6">
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Preview do Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                        ) : (
                            <FaUserCircle className="w-24 h-24 text-gray-300 rounded-full" />
                        )}
                        <div className="flex-grow">
                            <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-[#1c1c1c] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff]">
                                <MdFileUpload className="mr-2 text-lg" />
                                Escolher arquivo...
                            </label>
                            <input
                                id="avatar-upload"
                                name="avatar-upload"
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleAvatarChange}
                                className="sr-only"
                            />
                            <p className="mt-2 text-xs text-[#1c1c1c]/70">PNG, JPG ou WEBP. Máximo 2MB.</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                    <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-1">Seus Links Sociais</h2>
                    <p className="text-sm text-[#1c1c1c]/70 mb-6">Adicione ou atualize os links das suas redes sociais.</p>
                    
                    <div className="space-y-6">
                        {socialPlatforms.map(({ name, Icon, placeholder, color }) => (
                            <div key={name}>
                                <label htmlFor={name} className="block text-sm font-medium text-[#1c1c1c] mb-1">
                                    <Icon className={`inline mr-2 mb-0.5 ${color || 'text-[#3100ff]'}`} />
                                    {name.charAt(0).toUpperCase() + name.slice(1)}
                                </label>
                                <input
                                    type="url"
                                    id={name}
                                    name={name}
                                    value={socialLinks[name] || ''}
                                    onChange={(e) => handleSocialLinkChange(name, e.target.value)}
                                    placeholder={placeholder}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm placeholder-gray-400"
                                />
                            </div>
                        ))}
                    </div>
                    
                    {/* Preview das redes sociais configuradas */}
                    <div className="mt-8">
                        <SocialLinksPreview 
                            socialLinks={socialLinks}
                            title="Preview das suas redes sociais" 
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#3100ff] hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff] disabled:opacity-50"
                    >
                        <MdSave className="mr-2 text-xl" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserSettings;