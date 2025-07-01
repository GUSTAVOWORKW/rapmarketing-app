import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebookF, FaTiktok, FaSpotify, FaYoutube, FaDeezer } from 'react-icons/fa';

const predefinedAvatars = [
  '/avatars/perfilhomem1.png',
  '/avatars/perfilhomem2.png',
  '/avatars/perfilmulher1.png',
  '/avatars/perfilmulher2.png',
];

const ChooseUsername = ({ currentUserId }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Novo estado para email
  const [avatarFile, setAvatarFile] = useState(null); // Novo estado para arquivo do avatar
  const [avatarPreview, setAvatarPreview] = useState(null); // Novo estado para preview do avatar
  const [socialLinks, setSocialLinks] = useState({ // Novo estado para links sociais
    instagram: '',
    twitter: '',
    facebook: '',
    tiktok: '',
    spotify: '',
    youtube: '',
    deezer: '',
  });
  const [loading, setLoading] = useState(false); 
  const [isUserDataLoading, setIsUserDataLoading] = useState(true); 
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedPredefinedAvatar, setSelectedPredefinedAvatar] = useState(null);
  const navigate = useNavigate();
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false); // Novo estado

  useEffect(() => {
    // Evita execução redundante se os dados já foram carregados ou se não há usuário
    if (hasLoadedInitialData || !currentUserId) {
      return;
    }

    const instanceId = Date.now(); 
    const logPrefix = `ChooseUsername (${instanceId}): useEffect -`;

    console.log(`${logPrefix} useEffect disparado. currentUserId: ${currentUserId}.`);
    setIsUserDataLoading(true); 

    const getUserAndProfile = async () => {
      console.log(`${logPrefix} getUserAndProfile iniciado.`);

      try {
        if (currentUserId) {
          console.log(`${logPrefix} User ID (currentUserId) fornecido: ${currentUserId}.`);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, email, avatar_url, social_links')
            .eq('user_id', currentUserId)
            .maybeSingle();
          console.log(`${logPrefix} Depois de buscar perfil. Erro: ${profileError ? JSON.stringify(profileError) : 'null'}, Perfil: ${JSON.stringify(profile)}`);

          if (profileError) {
            console.error(`${logPrefix} Erro ao buscar perfil existente:`, profileError);
            setMessage({ text: 'Erro ao verificar perfil existente.', type: 'error' });
            return;
          }

          if (profile && profile.username) {
            console.log(`${logPrefix} Usuário já tem username (${profile.username}). Redirecionando para /dashboard.`);
            setHasLoadedInitialData(true);
            navigate('/dashboard');
            return; 
          }

          if (profile) {
            if (profile.email) setEmail(profile.email);
            if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
            if (profile.social_links) setSocialLinks(prev => ({...prev, ...profile.social_links}));
          }
          
          setHasLoadedInitialData(true);
          console.log(`${logPrefix} Usuário não tem username no perfil ou perfil não encontrado. Permanece na página.`);
        } else {
          console.warn(`${logPrefix} Nenhum currentUserId fornecido. Redirecionando para /login.`);
          navigate('/login');
          return; 
        }
      } catch (error) {
        console.error(`${logPrefix} Exceção GERAL no bloco try/catch de getUserAndProfile:`, error);
        setMessage({ text: 'Ocorreu um erro inesperado ao carregar seus dados.', type: 'error' });
      } finally {
        console.log(`${logPrefix} Bloco finally. Definindo isUserDataLoading como false.`);
        setIsUserDataLoading(false);
        setHasLoadedInitialData(true); // Marca que os dados foram carregados
      }
    };

    if (currentUserId) { 
        getUserAndProfile();
    } else {
        console.warn(`${logPrefix} currentUserId não está disponível no momento da chamada do useEffect.`);
        setIsUserDataLoading(false); 
    }

  }, [navigate, currentUserId, hasLoadedInitialData]);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (/^[a-z0-9_]*$/.test(value)) {
      setUsername(value);
      if (message.text && message.type !== 'success') setMessage({ text: '', type: '' }); // Limpa erro, mas não sucesso
    } else if (value === '') {
      setUsername('');
    } else {
      setMessage({ text: 'Username: apenas letras (a-z), números (0-9) e underscores (_).', type: 'error' });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (message.text && message.type !== 'success') setMessage({ text: '', type: '' });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        setMessage({ text: 'Arquivo muito grande. Máximo 2MB.', type: 'error' });
        setAvatarFile(null);
        setAvatarPreview(null);
        e.target.value = null; // Limpa o input file
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setMessage({ text: 'Formato de arquivo inválido. Use JPG, PNG ou WEBP.', type: 'error' });
        setAvatarFile(null);
        setAvatarPreview(null);
        e.target.value = null;
        return;
      }
      setAvatarFile(file);
      setSelectedPredefinedAvatar(null); // Limpa avatar predefinido se um arquivo for carregado
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (message.text && message.type !== 'success') setMessage({ text: '', type: '' });
    } else {
        setAvatarFile(null);
        // Não limpa o avatarPreview aqui, pois pode ser de um avatar predefinido
    }
  };

  const handlePredefinedAvatarSelect = (avatarUrl) => {
    setSelectedPredefinedAvatar(avatarUrl);
    setAvatarPreview(avatarUrl); // Atualiza o preview
    setAvatarFile(null); // Limpa qualquer arquivo carregado
    if (message.text && message.type !== 'success') setMessage({ text: '', type: '' });
  };

  const handleSocialLinkChange = (platform, value) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
    if (message.text && message.type !== 'success') setMessage({ text: '', type: '' });
  };

  const validateEmail = (emailToValidate) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
  }

  const checkUsernameAvailability = async (currentUsername) => {
    const logPrefix = `ChooseUsername (checkUsernameAvailability):`;
    console.log(`${logPrefix} Verificando: ${currentUsername}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', currentUsername)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error(`${logPrefix} Erro Supabase:`, error);
      throw new Error(`Erro ao verificar disponibilidade: ${error.message}`);
    }
    if (data) {
      console.log(`${logPrefix} Username ${currentUsername} NÃO disponível.`);
      return false;
    }
    console.log(`${logPrefix} Username ${currentUsername} DISPONÍVEL.`);
    return true;
  };

  const socialIconMapping = {
    instagram: <FaInstagram className="text-pink-500" />,
    twitter: <FaTwitter className="text-blue-400" />,
    facebook: <FaFacebookF className="text-blue-600" />,
    tiktok: <FaTiktok className="text-black" />,
    spotify: <FaSpotify className="text-green-500" />,
    youtube: <FaYoutube className="text-red-600" />,
    deezer: <FaDeezer className="text-purple-500" /> 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const logPrefix = `ChooseUsername (handleSubmit):`;

    if (!username || username.length < 3) {
      setMessage({ text: 'Username deve ter pelo menos 3 caracteres.', type: 'error' });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setMessage({ text: 'Username: apenas letras (a-z), números (0-9) e underscores (_).', type: 'error' });
      return;
    }
    if (!email || !validateEmail(email)) {
      setMessage({ text: 'Por favor, insira um e-mail válido.', type: 'error' });
      return;
    }

    if (!currentUserId) { 
      console.error(`${logPrefix} Tentativa de submissão sem currentUserId. isUserDataLoading: ${isUserDataLoading}`);
      setMessage({ text: 'ID do usuário ainda não carregado. Aguarde ou recarregue a página.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    console.log(`${logPrefix} Iniciando. User ID: ${currentUserId}, Username: ${username}, Email: ${email}`);

    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setMessage({ text: `Username "${username}" não está disponível. Tente outro.`, type: 'error' });
        setLoading(false);
        return;
      }
      
      let avatarUrlToSave = null;
      if (avatarFile) {
        const fileName = `${currentUserId}_${Date.now()}.${avatarFile.name.split('.').pop()}`;
        // Corrigido: O bucket 'avatars' já é especificado em .from('avatars')
        // Então, o filePath deve ser apenas o nome do arquivo.
        const filePath = fileName;
        
        console.log(`${logPrefix} Fazendo upload do avatar: ${filePath}`);
        const { error: uploadError } = await supabase.storage
          .from('avatars') 
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true, 
          });

        if (uploadError) {
          console.error(`${logPrefix} Erro no upload do avatar:`, uploadError);
          // Adicionar mais detalhes ao erro
          setMessage({ text: `Erro ao fazer upload do avatar: ${uploadError.message}. Detalhes: ${JSON.stringify(uploadError)}`, type: 'error' });
          setLoading(false);
          return;
        }
        
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (publicUrlData) {
            avatarUrlToSave = publicUrlData.publicUrl;
            console.log(`${logPrefix} Avatar URL pública: ${avatarUrlToSave}`);
        } else {
            console.warn(`${logPrefix} Não foi possível obter a URL pública do avatar, mas o upload pode ter sido bem-sucedido. filePath usado:`, filePath);
        }
      } else if (selectedPredefinedAvatar) {
        // Se um avatar predefinido foi selecionado, usa sua URL diretamente
        // Nota: As URLs predefinidas são relativas ao diretório public.
        // Para salvar no banco, você pode querer a URL completa ou manter como está se o frontend sempre resolve corretamente.
        // Para este exemplo, vamos assumir que salvar a URL relativa é suficiente se o app sempre a serve de /public.
        avatarUrlToSave = selectedPredefinedAvatar;
        console.log(`ChooseUsername (handleSubmit): Usando avatar predefinido: ${avatarUrlToSave}`);
      }
      
      const profileDataToUpdate = {
        username,
        email,
        updated_at: new Date().toISOString(),
        social_links: socialLinks, // Salva o objeto de links sociais
      };

      if (avatarUrlToSave) {
        profileDataToUpdate.avatar_url = avatarUrlToSave;
      }
      
      console.log(`${logPrefix} Tentando atualizar perfil para User ID: ${currentUserId} com dados:`, profileDataToUpdate);
      
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileDataToUpdate)
        .eq('user_id', currentUserId)
        .select('user_id, username, email, avatar_url, social_links') // Selecionar os novos campos
        .single();

      if (updateError) {
        console.error(`${logPrefix} Erro ao ATUALIZAR username:`, updateError);
        if (updateError.code === 'PGRST116') {
          // Esta mensagem é específica para o caso de o perfil não ser encontrado para atualização
          setMessage({ text: "Perfil não encontrado para atualização. Verifique se o perfil foi criado corretamente.", type: 'error' });
        } else {
          setMessage({ text: `Erro ao salvar username: ${updateError.message}`, type: 'error' });
        }
        setLoading(false); // Adicionado para parar o loading aqui
        return; 
      }

      console.log(`${logPrefix} Username e perfil atualizados com sucesso. Perfil atualizado:`, updatedProfile);
      // setMessage({ text: 'Perfil salvo com sucesso!', type: 'success' });
      
      // if (typeof onProfileUpdate === 'function') {
      //   await onProfileUpdate(); // Chama a função para atualizar o perfil no App.js
      // }
      
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error(`${logPrefix} Erro capturado no bloco try:`, error);
      // Garante que a mensagem de erro seja mais genérica se não for tratada especificamente acima
      if (!message.text) {
        setMessage({ text: `Erro ao salvar username: ${error.message}`, type: 'error' });
      }
    } finally {
      // setLoading(false) já estava aqui, mas é bom garantir que ele seja chamado em todos os caminhos de erro também.
      // Se já foi definido como false nos blocos de erro, esta chamada não terá efeito adverso.
      setLoading(false);
    }
  };

  return (
    // Fundo azul bem claro, texto principal preto
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e9e6ff] p-4 text-[#1c1c1c]">
      {/* Container do formulário com fundo branco e sombra */}
      <form className="w-full max-w-lg bg-[#ffffff] shadow-2xl rounded-xl p-6 md:p-10 space-y-6" onSubmit={handleSubmit}>
        <h2 className="text-3xl font-bold text-center text-[#1c1c1c] mb-8">Complete seu Perfil</h2>
        
        {isUserDataLoading ? (
          <p className="text-center text-[#1c1c1c]/70">Carregando dados do usuário...</p> // Preto com opacidade
        ) : !currentUserId ? (
          <p className="text-center text-red-500 p-3"> {/* Manter vermelho para erro crítico */}
            Não foi possível carregar os dados do usuário. Por favor, tente <button type="button" onClick={() => window.location.reload()} className="underline hover:text-red-700 bg-transparent border-none p-0 m-0 cursor-pointer inline">recarregar a página</button> ou contate o suporte se o problema persistir.
          </p>
        ) : (
          <>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#1c1c1c] mb-1">Username <span className="text-[#3100ff]">*</span></label> {/* Asterisco em Azul Principal */}
              <input
                id="username"
                className="w-full px-4 py-3 text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3100ff] focus:border-[#3100ff] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-200"
                type="text"
                placeholder="Seu username único"
                value={username}
                onChange={handleUsernameChange}
                maxLength={50}
                minLength={3}
                required
                disabled={loading}
              />
              <p className="mt-1 text-xs text-[#1c1c1c]/70"> {/* Preto com opacidade */}
                Seu link público: rapmarketing.link/{username || 'seu_username'}
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1c1c1c] mb-1">Email <span className="text-[#3100ff]">*</span></label> {/* Asterisco em Azul Principal */}
              <input
                id="email"
                className="w-full px-4 py-3 text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3100ff] focus:border-[#3100ff] placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-200"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={loading}
              />
            </div>

            {/* Avatar Upload e Seleção */}
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-1">Foto do Avatar (Opcional)</label>
              <div className="mt-2 flex items-center space-x-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview do Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="flex-grow">
                  <input
                    id="avatar"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e9e6ff] file:text-[#3100ff] hover:file:bg-[#d1c9ff] disabled:opacity-50"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-[#1c1c1c]/70">PNG, JPG ou WEBP. Máx 2MB para upload.</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#1c1c1c]/70">Ou escolha um dos nossos avatares:</p>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {predefinedAvatars.map((avatarSrc) => (
                  <button
                    key={avatarSrc}
                    type="button"
                    onClick={() => handlePredefinedAvatarSelect(avatarSrc)}
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 hover:border-[#3100ff] focus:outline-none focus:border-[#3100ff] transition-all duration-150 ${selectedPredefinedAvatar === avatarSrc ? 'border-[#3100ff] ring-2 ring-[#3100ff]' : 'border-gray-300'}`}
                    disabled={loading}
                  >
                    <img src={avatarSrc} alt={`Avatar predefinido ${avatarSrc}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {/* Texto movido para baixo do input de arquivo */}
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-md font-medium text-[#1c1c1c]">Links Sociais (Opcional)</h3>
              {Object.keys(socialLinks).map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {socialIconMapping[platform]}
                  </div>
                  <input
                    id={`social-${platform}`}
                    className="w-full px-3 py-2 text-sm text-[#1c1c1c] bg-[#ffffff] border border-gray-300 rounded-md focus:ring-1 focus:ring-[#3100ff] focus:border-[#3100ff] placeholder-gray-400 disabled:opacity-50"
                    type="url"
                    placeholder={`https://...${platform}.com/seu_perfil`}
                    value={socialLinks[platform]}
                    onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
            
            {message.text && 
              <p className={`text-center p-3 rounded-md text-sm font-medium ${ 
                message.type === 'error' 
                  ? 'bg-red-100 text-red-700'  /* Manter cores de erro */
                  : 'bg-green-100 text-green-700' /* Manter cores de sucesso */
              }`}>
                {message.text}
              </p>
            }
            <button
              className="w-full py-3 px-4 bg-[#3100ff] hover:bg-opacity-80 text-[#ffffff] font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3100ff] focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-opacity-60"
              type="submit"
              disabled={loading || !username || username.length < 3 || !email || !validateEmail(email)}
            >
              {loading ? 'Salvando Perfil...' : 'Salvar Perfil e Continuar'}
            </button>

            {/* Botões extras para sair ou voltar */}
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <button
                type="button"
                className="w-full md:w-auto py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/login');
                }}
              >
                Deslogar
              </button>
              <button
                type="button"
                className="w-full md:w-auto py-2 px-4 bg-gray-300 hover:bg-gray-400 text-[#1c1c1c] font-semibold rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition"
                onClick={() => navigate('/')}
              >
                Voltar para página inicial
              </button>
            </div>
          </>
        )}
      </form>
      {/* <footer className="absolute bottom-0 left-0 right-0 p-4 text-center text-[#1c1c1c]/60 text-sm">
        © {new Date().getFullYear()} Rapmarketing.link. Todos os direitos reservados.
      </footer> */}
    </div>
  );
};

export default ChooseUsername;
