import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, FaYoutube, FaLink, FaDeezer, FaUserCircle, FaPlus, FaTimes, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';
import { MdSave, MdErrorOutline, MdCheckCircleOutline, MdFileUpload } from 'react-icons/md';
import { useSpotifyConnection } from '../hooks/useSpotifyConnection';
import { SOCIAL_PLATFORMS } from '../data/socials';
import { PLATFORMS as STREAMING_PLATFORMS } from '../data/platforms';
import { SocialLink, PlatformLink, ContactLink } from '../types';

const UserSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [socialLinks, setSocialLinks] = useState([]);
    const [streamingLinks, setStreamingLinks] = useState([]);
    const [contactLinks, setContactLinks] = useState([]);
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
            console.log("DEBUG: Fetching profile for user_id:", sessionUser.id);
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, user_id, username, avatar_url, email, social_links, streaming_links, contact_links')
                .eq('user_id', sessionUser.id)
                .single();

            if (profileError) {
                console.error("DEBUG: Erro ao buscar perfil no Supabase:", profileError);
                throw profileError;
            }

            if (profileData) {
                console.log("DEBUG: Perfil encontrado:", profileData);
                setProfile(profileData);
                setSocialLinks(Array.isArray(profileData.social_links) ? profileData.social_links : []);
                setStreamingLinks(Array.isArray(profileData.streaming_links) ? profileData.streaming_links : []);
                setContactLinks(Array.isArray(profileData.contact_links) ? profileData.contact_links : []);
                setAvatarPreview(profileData.avatar_url || null); 
            } else {
                console.warn("DEBUG: Perfil não encontrado para o usuário.");
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
                console.log("DEBUG: User session found:", session.user.id);
                setUser(session.user);
                fetchProfileDataForForm(session.user);
            } else {
                console.log("DEBUG: No user session found, redirecting to login.");
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

    const handleSocialLinkChange = (index, field, value) => {
        const newSocialLinks = [...socialLinks];
        newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
        setSocialLinks(newSocialLinks);
        setSuccessMessage('');
        setError('');
    };

    const addSocialLink = () => {
        setSocialLinks(prev => [...prev, { id: Date.now().toString(), platform: '', url: '' }]);
    };

    const removeSocialLink = (index) => {
        setSocialLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleStreamingLinkChange = (index, field, value) => {
        const newStreamingLinks = [...streamingLinks];
        newStreamingLinks[index] = { ...newStreamingLinks[index], [field]: value };
        setStreamingLinks(newStreamingLinks);
        setSuccessMessage('');
        setError('');
    };

    const addStreamingLink = () => {
        setStreamingLinks(prev => [...prev, { id: Date.now().toString(), platform_id: '', url: '' }]);
    };

    const removeStreamingLink = (index) => {
        setStreamingLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleContactLinkChange = (index, field, value) => {
        const newContactLinks = [...contactLinks];
        newContactLinks[index] = { ...newContactLinks[index], [field]: value };
        setContactLinks(newContactLinks);
        setSuccessMessage('');
        setError('');
    };

    const addContactLink = () => {
        setContactLinks(prev => [...prev, { id: Date.now().toString(), type: 'custom', value: '' }]);
    };

    const removeContactLink = (index) => {
        setContactLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profile || !user) return;

        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
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
                streaming_links: streamingLinks,
                contact_links: contactLinks,
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

                <hr className="border-gray-200" />

                <div>
                    <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-1">Seus Links Sociais</h2>
                    <p className="text-sm text-[#1c1c1c]/70 mb-6">Adicione ou atualize os links das suas redes sociais.</p>
                    
                    <div className="space-y-4">
                        {socialLinks.map((link, index) => {
                            const platformData = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
                            const Icon = platformData ? platformData.icon : FaLink;
                            const colorClass = platformData ? `text-[${platformData.color}]` : 'text-gray-500';

                            return (
                                <div key={link.id || index} className="flex items-end space-x-2">
                                    <div className="flex-grow">
                                        <label htmlFor={`social-platform-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">Plataforma</label>
                                        <select
                                            id={`social-platform-${index}`}
                                            value={link.platform}
                                            onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm"
                                        >
                                            <option value="">Selecione uma plataforma</option>
                                            {SOCIAL_PLATFORMS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-grow-[2]">
                                        <label htmlFor={`social-url-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">URL</label>
                                        <div className="flex items-center mt-1">
                                            <Icon className={`inline mr-2 text-xl ${colorClass}`} />
                                            <input
                                                type="url"
                                                id={`social-url-${index}`}
                                                value={link.url}
                                                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                                placeholder={platformData?.placeholder || "https://seusocial.com/perfil"}
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSocialLink(index)}
                                        className="p-3 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addSocialLink}
                            className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-[#1c1c1c] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff]"
                        >
                            <FaPlus className="mr-2" /> Adicionar Link Social
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                    <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-1">Links de Streaming</h2>
                    <p className="text-sm text-[#1c1c1c]/70 mb-6">Adicione ou atualize os links das suas plataformas de streaming.</p>
                    
                    <div className="space-y-4">
                        {streamingLinks.map((link, index) => {
                            const platformData = STREAMING_PLATFORMS.find(p => p.id === link.platform_id);
                            const Icon = platformData ? platformData.icon : FaLink;
                            const colorClass = platformData ? `text-[${platformData.brand_color}]` : 'text-gray-500';

                            return (
                                <div key={link.id || index} className="flex items-end space-x-2">
                                    <div className="flex-grow">
                                        <label htmlFor={`streaming-platform-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">Plataforma</label>
                                        <select
                                            id={`streaming-platform-${index}`}
                                            value={link.platform_id}
                                            onChange={(e) => handleStreamingLinkChange(index, 'platform_id', e.target.value)}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm"
                                        >
                                            <option value="">Selecione uma plataforma</option>
                                            {STREAMING_PLATFORMS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-grow-[2]">
                                        <label htmlFor={`streaming-url-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">URL</label>
                                        <div className="flex items-center mt-1">
                                            <Icon className={`inline mr-2 text-xl ${colorClass}`} />
                                            <input
                                                type="url"
                                                id={`streaming-url-${index}`}
                                                value={link.url}
                                                onChange={(e) => handleStreamingLinkChange(index, 'url', e.target.value)}
                                                placeholder={platformData?.placeholder_url || "https://plataforma.com/seu-link"}
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeStreamingLink(index)}
                                        className="p-3 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addStreamingLink}
                            className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-[#1c1c1c] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff]"
                        >
                            <FaPlus className="mr-2" /> Adicionar Link de Streaming
                        </button>
                    </div>
                </div>

                <hr className="border-gray-200" />

                <div>
                    <h2 className="text-2xl font-semibold text-[#1c1c1c] mb-1">Links de Contato</h2>
                    <p className="text-sm text-[#1c1c1c]/70 mb-6">Adicione ou atualize seus links de contato (email, telefone, website, etc.).</p>
                    
                    <div className="space-y-4">
                        {contactLinks.map((link, index) => {
                            let IconComponent = FaLink;
                            let placeholderText = "https://seusite.com";
                            switch (link.type) {
                                case 'email': IconComponent = FaEnvelope; placeholderText = "seu.email@exemplo.com"; break;
                                case 'phone': IconComponent = FaPhone; placeholderText = "+5511999999999"; break;
                                case 'website': IconComponent = FaGlobe; placeholderText = "https://seusite.com"; break;
                                default: IconComponent = FaLink; placeholderText = "https://link-personalizado.com"; break;
                            }

                            return (
                                <div key={link.id || index} className="flex items-end space-x-2">
                                    <div className="flex-grow">
                                        <label htmlFor={`contact-type-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">Tipo</label>
                                        <select
                                            id={`contact-type-${index}`}
                                            value={link.type}
                                            onChange={(e) => handleContactLinkChange(index, 'type', e.target.value)}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm"
                                        >
                                            <option value="">Selecione o tipo</option>
                                            <option value="email">Email</option>
                                            <option value="phone">Telefone</option>
                                            <option value="website">Website</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                    </div>
                                    <div className="flex-grow-[2]">
                                        <label htmlFor={`contact-value-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">Valor/URL</label>
                                        <div className="flex items-center mt-1">
                                            <IconComponent className="inline mr-2 text-xl text-gray-500" />
                                            <input
                                                type="text"
                                                id={`contact-value-${index}`}
                                                value={link.value}
                                                onChange={(e) => handleContactLinkChange(index, 'value', e.target.value)}
                                                placeholder={placeholderText}
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <label htmlFor={`contact-label-${index}`} className="block text-sm font-medium text-[#1c1c1c] mb-1">Rótulo (Opcional)</label>
                                        <input
                                            type="text"
                                            id={`contact-label-${index}`}
                                            value={link.label || ''}
                                            onChange={(e) => handleContactLinkChange(index, 'label', e.target.value)}
                                            placeholder="Ex: Meu Portfólio"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#3100ff] focus:border-[#3100ff] sm:text-sm placeholder-gray-400"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeContactLink(index)}
                                        className="p-3 text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            type="button"
                            onClick={addContactLink}
                            className="w-full flex justify-center items-center py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-[#1c1c1c] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3100ff]"
                        >
                            <FaPlus className="mr-2" /> Adicionar Link de Contato
                        </button>
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