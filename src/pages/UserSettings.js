import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { 
    FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, 
    FaYoutube, FaLink, FaDeezer, FaUserCircle, FaCog, FaCamera,
    FaShareAlt, FaCheckCircle, FaExclamationTriangle, FaArrowLeft
} from 'react-icons/fa';
import { MdSave } from 'react-icons/md';
import { validateSocialLink, getSocialValidationMessage } from '../utils/socialValidation';
import SocialLinksPreview from '../components/Common/SocialLinksPreview';
import { useAuth } from '../context/AuthContext';

const socialPlatforms = [
    { name: 'instagram', Icon: FaInstagram, placeholder: 'https://instagram.com/usuario', color: 'from-pink-500 to-purple-500', iconColor: 'text-pink-500' },
    { name: 'twitter', Icon: FaTwitter, placeholder: 'https://twitter.com/usuario', color: 'from-sky-400 to-blue-500', iconColor: 'text-sky-500' },
    { name: 'facebook', Icon: FaFacebookF, placeholder: 'https://facebook.com/usuario', color: 'from-blue-500 to-blue-700', iconColor: 'text-blue-600' },
    { name: 'tiktok', Icon: FaTiktok, placeholder: 'https://tiktok.com/@usuario', color: 'from-gray-800 to-black', iconColor: 'text-black' },
    { name: 'spotify', Icon: FaSpotify, placeholder: 'https://open.spotify.com/artist/id', color: 'from-green-400 to-green-600', iconColor: 'text-green-500' },
    { name: 'youtube', Icon: FaYoutube, placeholder: 'https://youtube.com/c/canal', color: 'from-red-500 to-red-700', iconColor: 'text-red-600' },
    { name: 'deezer', Icon: FaDeezer, placeholder: 'https://deezer.com/profile/id', color: 'from-purple-400 to-purple-600', iconColor: 'text-purple-500' },
    { name: 'other', Icon: FaLink, placeholder: 'https://seuoutrolink.com', color: 'from-gray-400 to-gray-600', iconColor: 'text-gray-500' }
];

const UserSettings = () => {
    const navigate = useNavigate();
    const { user, profile, initializing, refreshProfile } = useAuth();
    const [socialLinks, setSocialLinks] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null); 
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Carregar socialLinks e avatarPreview do profile do contexto
    useEffect(() => {
        if (profile) {
            let safeSocialLinks = {};
            if (Array.isArray(profile.social_links)) {
                profile.social_links.forEach(item => {
                    if (item && typeof item === 'object' && item.platform && item.url) {
                        safeSocialLinks[item.platform] = item.url;
                    }
                });
            } else if (profile.social_links && typeof profile.social_links === 'object') {
                safeSocialLinks = profile.social_links;
            }
            setSocialLinks(safeSocialLinks);
            setAvatarPreview(profile.avatar_url || null);  
        }
    }, [profile]);

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
            
            // Forçar a atualização do perfil no contexto após salvar
            await refreshProfile(user.id);

        } catch (err) {
            console.error("Erro ao atualizar configurações:", err);
            setError(`Falha ao salvar alterações: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Se não há perfil ou usuário após o fim da inicialização, redireciona para o login
    useEffect(() => {
        if (!initializing && (!user)) {
            navigate('/login');
        }
    }, [initializing, user, navigate]); // Removeu profile das dependências para evitar redirect enquanto profile carrega

    // Mostrar loading apenas se estiver inicializando a AUTH, não o profile
    if (initializing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#3100ff] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Proteção extra

    // Contar links preenchidos
    const filledLinksCount = Object.values(socialLinks).filter(url => url && url.trim() !== '').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f6f2] to-[#e9e6ff] p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <FaArrowLeft className="text-white" />
                            </button>
                            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <FaCog className="text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
                                <p className="text-white/80 text-sm">Personalize seu perfil e redes sociais</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <FaExclamationTriangle className="text-red-500" />
                        </div>
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                            <FaCheckCircle className="text-green-500" />
                        </div>
                        <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card de Foto de Perfil */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#ffb300] to-[#ff8c00] px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <FaCamera className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold text-lg">Foto de Perfil</h2>
                                <p className="text-white/80 text-xs">Personalize sua imagem</p>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Avatar" 
                                            className="w-28 h-28 rounded-2xl object-cover border-4 border-[#ffb300]/30 shadow-lg group-hover:border-[#ffb300] transition-colors" 
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-4 border-gray-200">
                                            <FaUserCircle className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                    <label 
                                        htmlFor="avatar-upload" 
                                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-[#ffb300] to-[#ff8c00] rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                                    >
                                        <FaCamera className="text-white text-sm" />
                                    </label>
                                </div>
                                
                                <div className="flex-grow text-center sm:text-left">
                                    <h3 className="font-bold text-gray-800 mb-1">Alterar foto</h3>
                                    <p className="text-gray-500 text-sm mb-3">PNG, JPG ou WEBP. Máximo 2MB.</p>
                                    <label 
                                        htmlFor="avatar-upload" 
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f8f6f2] to-[#e9e6ff] text-gray-700 rounded-xl font-medium hover:shadow-md transition-all cursor-pointer border border-gray-200"
                                    >
                                        <FaCamera className="text-[#ffb300]" />
                                        Escolher arquivo
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleAvatarChange}
                                        className="sr-only"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card de Redes Sociais */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#3100ff] to-[#a259ff] px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <FaShareAlt className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-lg">Redes Sociais</h2>
                                    <p className="text-white/80 text-xs">Conecte suas redes para exibir nos smart links</p>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-white/20 rounded-full">
                                <span className="text-white text-sm font-bold">{filledLinksCount}/{socialPlatforms.length}</span>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {socialPlatforms.map(({ name, Icon, placeholder, color, iconColor }) => (
                                    <div key={name} className="group">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
                                                <Icon className="text-white text-sm" />
                                            </div>
                                            <span className="capitalize">{name === 'other' ? 'Outro Link' : name}</span>
                                            {socialLinks[name] && (
                                                <FaCheckCircle className="text-green-500 text-xs ml-auto" />
                                            )}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={socialLinks[name] || ''}
                                                onChange={(e) => handleSocialLinkChange(name, e.target.value)}
                                                placeholder={placeholder}
                                                className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3100ff] focus:border-transparent transition-all text-sm placeholder-gray-400 hover:border-gray-300"
                                            />
                                            <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor} text-sm`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Preview das redes sociais */}
                            {filledLinksCount > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Preview dos seus links
                                    </h3>
                                    <SocialLinksPreview socialLinks={socialLinks} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botão de Salvar */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-[#3100ff] to-[#a259ff] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <MdSave className="text-xl" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserSettings;