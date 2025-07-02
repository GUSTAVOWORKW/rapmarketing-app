// src/components/editor/SmartLinkEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useSmartLink } from '../../hooks/useSmartLink';
import { SmartLink, PlatformLink, UserProfile } from '../../types';
import { PLATFORMS as allPlatformsData } from '../../data/platforms';
import { FaSave, FaUserTag, FaExternalLinkAlt } from 'react-icons/fa';
import MainDetailsForm from './MainDetailsForm'; 
import PlatformLinksForm from './PlatformLinksForm'; // Importar PlatformLinksForm
import CustomColorsForm from './CustomColorsForm'; // Importar CustomColorsForm
import { useAuth } from '../../context/AuthContext'; // Importar useAuth

// Import template components
import NoiteCarioca from '../Templates/NoiteCarioca';

// Mapeamento de IDs de template para componentes React
const templateComponentMap: { [key: string]: React.FC<any> } = {
  'noite-carioca': NoiteCarioca,
};

// Adiciona tipo local para o estado do editor incluindo showAdvancedColors
interface SmartLinkEditorFormData extends Partial<SmartLink> {
  showAdvancedColors?: boolean;
  artist_title?: string;
  avatar_url?: string;
  feat?: string;
  player_url?: string;
  contact_button_text?: string;
  contact_button_url?: string;
}

const SmartLinkEditor: React.FC = () => {
  const { templateId: templateIdFromParams, smartLinkId: smartLinkIdFromParams } = useParams<{ templateId?: string; smartLinkId?: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth(); // Usar useAuth

  const { 
    loading: loadingSmartLink, 
    error: smartLinkError, 
    fetchSmartLinkByUserId: fetchSmartLinkByUserIdFromHook, 
    createSmartLink, 
    updateSmartLink 
  } = useSmartLink(null); // Passar null para indicar que não estamos carregando por ID/slug inicialmente
  const [formData, setFormData] = useState<SmartLinkEditorFormData>({
    platform_links: [],
    template_id: templateIdFromParams || '',
    user_id: user?.id || '',
    is_public: true, 
    cover_image_click_url: '', // Garantir que está inicializado aqui também
    player_url: '', // Inicializar campo do player
  });
  // const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Removido, usando profile do useAuth
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isCreatingNewBasedOnFetched, setIsCreatingNewBasedOnFetched] = useState(true);   useEffect(() => {
    const fetchInitialData = async () => {      if (user && user.id && profile) {
        setEditorError(null); // Limpar erros anteriores
          // const { data: profileData, error: profileError } = await supabase
          // .from('profiles')
          // .select('id, user_id, username, updated_at')
          // .eq('user_id', user.id)
          // .single();
        
        // if (profileError || !profileData) {
        //   console.error('Error fetching user profile for editor:', profileError);
        //   setEditorError("Não foi possível carregar os dados do perfil. Verifique se seu perfil está completo e tente recarregar a página.");
        //   // setUserProfile(null);
        //   return; 
        // }
        // setUserProfile(profileData); // Removido, usando profile do useAuth

        if (!profile.username) {
            setEditorError("Seu perfil não possui um nome de usuário definido, que é necessário para o link. Por favor, atualize seu perfil.");
            return;
        }

        // Verificar se estamos editando um link existente (smartLinkIdFromParams) ou criando um novo (templateIdFromParams)
        if (smartLinkIdFromParams) {
          // Modo de edição: buscar SmartLink específico por ID
          // Como estamos usando user_id único, vamos buscar pelo user.id mesmo
          const existingLink = await fetchSmartLinkByUserIdFromHook(user.id);
          if (existingLink) {
            setFormData({
              ...existingLink,
              slug: profile.username, 
            });
            setIsCreatingNewBasedOnFetched(false); 
          } else {
            setEditorError("Smart Link não encontrado.");
            return;
          }
        } else {
          // Modo de criação: verificar se já existe um link para o usuário
          const existingLink = await fetchSmartLinkByUserIdFromHook(user.id);
          if (existingLink) {
            // Já existe um link, redirecionar para edição
            setFormData({
              ...existingLink,
              slug: profile.username, 
            });
            setIsCreatingNewBasedOnFetched(false); 
            // Aplicar template se especificado nos parâmetros
            if (templateIdFromParams && templateIdFromParams !== existingLink.template_id) {
              setFormData(prev => ({ ...prev, template_id: templateIdFromParams }));
            }
          } else {
            // Criar novo link
            setFormData(prev => ({
              ...prev,
              user_id: user.id,
              slug: profile.username, 
              template_id: templateIdFromParams || 'urban-legend', 
              platform_links: [],
              artist_name: profile.username || '',
              release_title: '', // Deixar em branco para o usuário preencher
              title: '', // Deixar em branco
              description: '',
              cover_image_url: '',
              cover_image_click_url: '', // Inicializa o novo campo
              is_public: true,
              custom_colors: {},
            }));
            setIsCreatingNewBasedOnFetched(true); 
          }
        }
      }
    };
    fetchInitialData();
  }, [user, profile, templateIdFromParams, smartLinkIdFromParams, fetchSmartLinkByUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, artist_name: e.target.value }));
  };

  const handleReleaseTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, release_title: e.target.value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handlePlatformLinkChange = (index: number, field: keyof PlatformLink, value: string) => {
    const updatedLinks = [...(formData.platform_links || [])];
    // Ensure the link object at the index exists
    if (!updatedLinks[index]) {
        // Se o objeto não existir (improvável com a lógica atual de addPlatformLink), crie um novo.
        // O id aqui é o platform_id (ex: 'spotify'), não o id do registro do link.
        updatedLinks[index] = { platform_id: '', url: '' }; 
    }
    
    // Atualiza o campo específico
    // Necessário type assertion para lidar com os novos campos de cor
    (updatedLinks[index] as any)[field] = value;

    setFormData(prev => ({ ...prev, platform_links: updatedLinks }));
  };
  
  const addPlatformLink = () => {
    const newLink: PlatformLink = { 
      // id: `new-${Date.now()}`, // O ID do registro do link será gerado pelo Supabase ou não é necessário no cliente se for um array JSONB
      platform_id: allPlatformsData[0]?.id || '', // Default to the first platform's id
      url: '' 
    };
    setFormData(prev => ({ ...prev, platform_links: [...(prev.platform_links || []), newLink] }));
  };

  const removePlatformLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      platform_links: (prev.platform_links || []).filter((_, i) => i !== index),
    }));
  };

  const handleCustomColorChange = (colorName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      custom_colors: {
        ...(prev.custom_colors || {}),
        [colorName]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.template_id) {
      setEditorError("ID do Template é obrigatório.");
      return;
    }
    if (!profile || !profile.username) {
        setEditorError("Perfil do usuário não carregado ou nome de usuário ausente. Não é possível salvar.");
        return;
    }
    if (!formData.artist_name || !formData.release_title) {
        setEditorError("Nome do Artista e Título da Música/Álbum são obrigatórios.");
        return;
    }

    setIsSaving(true);
    setEditorError(null);    const dataToSave: Omit<SmartLink, 'id' | 'created_at' | 'updated_at' | 'view_count'> & { id?: string } = {
      user_id: user?.id || '',
      template_id: formData.template_id!,
      title: formData.title || `${formData.artist_name} - ${formData.release_title}`,
      artist_name: formData.artist_name!,
      release_title: formData.release_title!,
      description: formData.description || '',
      cover_image_url: formData.cover_image_url || '',
      cover_image_click_url: formData.cover_image_click_url || '',
      player_url: formData.player_url || '', // Adicionar player_url ao salvamento
      platform_links: formData.platform_links?.map(pl => ({
        platform_id: pl.platform_id,
        url: pl.url,
        custom_button_bg_color: pl.custom_button_bg_color, // Adicionar ao salvamento
        custom_button_text_color: pl.custom_button_text_color, // Adicionar ao salvamento
      })) || [],
      slug: profile.username, 
      is_public: formData.is_public === undefined ? true : formData.is_public,
      custom_colors: formData.custom_colors || {},
    };

    try {
      let savedLink: SmartLink | null = null;
      let smartLinkId = formData.id;
      // Sempre buscar o smart link do usuário antes de criar
      if (!smartLinkId) {
        const existingLink = await fetchSmartLinkByUserIdFromHook(user?.id || '');
        if (existingLink && existingLink.id) {
          smartLinkId = existingLink.id;
        }
      }
      if (smartLinkId) {
        savedLink = await updateSmartLink(smartLinkId, dataToSave);
      } else {
        savedLink = await createSmartLink(dataToSave as Omit<SmartLink, 'id' | 'created_at' | 'updated_at' | 'view_count'>);
      }
      const { id: savedLinkId } = savedLink || {};
      if (savedLinkId) {
        setFormData(prev => ({...prev, id: savedLinkId}));
        setIsCreatingNewBasedOnFetched(false);
        navigate(`/dashboard`); 
      } else {
        setEditorError(smartLinkError?.message || 'Falha ao salvar o Smart Link. Verifique se já existe um link para este nome de usuário.');
      }
    } catch (error: any) {
      console.error('Error saving smart link:', error);
      if (error.message && error.message.includes('duplicate key value violates unique constraint "smart_links_user_id_key"')) {
        setEditorError('Já existe um Smart Link associado a este usuário. Você só pode ter um.');
      } else if (error.message && error.message.includes('duplicate key value violates unique constraint "smart_links_slug_key"')) {
        setEditorError('Este nome de usuário (slug) já está em uso. Isso não deveria acontecer se o username do perfil for único.');
      } else {
        setEditorError(error.message || 'Ocorreu um erro desconhecido ao salvar.');
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const SelectedTemplateComponent = formData.template_id ? templateComponentMap[formData.template_id] : null;

  // Ajuste na condição de loading para cobrir o carregamento inicial do perfil também
  if (loadingSmartLink || (!profile && user)) return <p className="text-center py-10">Carregando dados...</p>; 

  const previewSmartLink: SmartLink = {
    id: formData.id || 'preview-id',
    user_id: user?.id || '',
    created_at: formData.created_at || new Date().toISOString(),
    updated_at: formData.updated_at || new Date().toISOString(),
    template_id: formData.template_id || 'urban-legend',
    title: formData.title || `${formData.artist_name || (profile?.username || "Artista")} - ${formData.release_title || "Lançamento"}`,
    artist_name: formData.artist_name || profile?.username || '',
    release_title: formData.release_title || '',
    description: formData.description || '',
    cover_image_url: formData.cover_image_url || '',
    cover_image_click_url: formData.cover_image_click_url || '', // Adiciona à preview
    platform_links: formData.platform_links || [],
    custom_colors: formData.custom_colors || {},
    slug: profile?.username || formData.slug || '', 
    is_public: formData.is_public === undefined ? true : formData.is_public,
    view_count: formData.view_count || 0,
  };
  const renderTemplate = () => {
    // Renderização de templates será implementada conforme os templates forem criados
    if (SelectedTemplateComponent && previewSmartLink) {
      return <SelectedTemplateComponent {...previewSmartLink} />;
    }
    
    // Template padrão temporário
    return (
      <div className="w-full max-w-md mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">{previewSmartLink.artist_name}</h2>
        <h3 className="text-lg mb-4">{previewSmartLink.release_title}</h3>
        {previewSmartLink.cover_image_url && (
          <img 
            src={previewSmartLink.cover_image_url} 
            alt="Cover" 
            className="w-48 h-48 mx-auto rounded-lg mb-4 object-cover"
          />
        )}
        <p className="text-sm text-gray-300 mb-4">Template: {formData.template_id || 'Nenhum'}</p>
        <div className="space-y-2">
          {(formData.platform_links || []).map((pl, index) => {
            const platformData = allPlatformsData.find(p => p.id === pl.platform_id);
            return (
              <div key={index} className="bg-gray-700 p-2 rounded text-sm">
                {platformData?.name || pl.platform_id}: {pl.url || 'Sem URL'}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <form onSubmit={handleSubmit} className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-12">
        {/* Coluna de Edição */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b border-gray-200 pb-4">
            {isCreatingNewBasedOnFetched ? 'Criar Seu Smart Link' : 'Editar Seu Smart Link'}
            {formData.template_id && <span className="text-sm text-red-400 ml-2 font-normal">(Template: {formData.template_id})</span>}
          </h2>

          {editorError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md border border-red-700">{editorError}</p>}
          {smartLinkError && !editorError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md border border-red-700">Erro: {smartLinkError.message}</p>}
          
          {profile && profile.username && (
            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                <div className="flex items-center mb-2">
                    <FaUserTag className="text-red-400 mr-3 text-xl" />
                    <p className="text-sm text-gray-300">
                        Seu link público será: <strong className="font-semibold text-red-400">{`${window.location.origin}/${profile.username}`}</strong>
                    </p>
                </div>
                {formData.id && formData.is_public && (
                    <a 
                        href={`${window.location.origin}/${profile.username}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-400 transition-colors"
                    >
                        <FaExternalLinkAlt className="mr-1.5 h-3 w-3" />
                        Visualizar Link
                    </a>
                )}
            </div>
          )}
          {!profile && user && !loadingSmartLink && (
             <div className="p-4 bg-yellow-700/30 border border-yellow-600 rounded-lg">
                <p className="text-sm text-yellow-300">
                    Carregando informações do perfil para definir seu link público...
                </p>
            </div>
          )}          {/* Seletor de Template */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Escolha um Template</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Templates serão adicionados aqui */}
              <button
                type="button"
                className={`rounded-xl border-2 p-3 flex flex-col items-center transition-all duration-200 ${formData.template_id === 'noite-carioca' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200 hover:border-purple-400'}`}
                onClick={() => setFormData(prev => ({ ...prev, template_id: 'noite-carioca' }))}
              >
                <span className="block w-20 h-20 bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 rounded-lg mb-2 border border-gray-300 flex items-center justify-center">
                  <span className="text-2xl">🍾</span>
                </span>
                <span className="text-xs font-semibold text-gray-700">Noite Carioca</span>
              </button>
            </div>
          </div>          <MainDetailsForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleArtistNameChange={handleArtistNameChange}
            handleReleaseTitleChange={handleReleaseTitleChange}
          />

          {/* Campos específicos serão adicionados conforme os templates */}

          {/* Configurações Adicionais (checkboxes) */}
          <div className="space-y-4 pt-4 border-t border-gray-200 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">Configurações Adicionais</h3>
            <div className="flex items-center mb-2">
                <input 
                    type="checkbox" 
                    name="is_public"
                    id="is_public"
                    checked={formData.is_public === undefined ? true : formData.is_public}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-offset-gray-50"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                    Tornar este link público?
                </label>
            </div>
            <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="showAdvancedColors"
                  checked={!!formData.showAdvancedColors}
                  onChange={e => setFormData(prev => ({ ...prev, showAdvancedColors: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-gray-50"
                />
                <label htmlFor="showAdvancedColors" className="ml-2 block text-sm text-gray-700">
                  Edições avançadas de cores do template
                </label>
            </div>
          </div>

          {/* Cores Customizadas (condicional) */}
          {formData.showAdvancedColors && (
            <CustomColorsForm 
              customColors={formData.custom_colors}
              handleCustomColorChange={handleCustomColorChange}
            />
          )}

          {/* Links de Plataforma */}
          <PlatformLinksForm 
            platformLinks={formData.platform_links || []}
            handlePlatformLinkChange={handlePlatformLinkChange}
            addPlatformLink={addPlatformLink}
            removePlatformLink={removePlatformLink}
            showAdvancedColors={!!formData.showAdvancedColors} // Passar a prop aqui
          />
          
          {/* Botão de Salvar */}
          <div className="pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              disabled={isSaving || loadingSmartLink || !profile || !profile.username}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-red-500 disabled:bg-gray-500 disabled:opacity-70 transition-colors"
            >
              <FaSave className="mr-2" /> {isSaving ? 'Salvando...' : (isCreatingNewBasedOnFetched ? 'Criar Smart Link' : 'Salvar Alterações')}
            </button>
          </div>
        </div>

        {/* Coluna de Pré-visualização */}
        <div className="lg:col-span-1 sticky top-8">
          <div className="bg-gray-50 p-4 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Preview do Link</h3>
            
            {/* Mockup de iPhone Estilizado */}
            <div 
                className="relative mx-auto border-neutral-800 bg-black border-[14px] rounded-[3rem] shadow-xl"
                style={{ width: '320px', height: '640px' }} // Ajustar dimensões se necessário
            >
                {/* Notch Simulado */}
                <div className="w-[130px] h-[28px] bg-black top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
                {/* Botões Laterais (Detalhes Visuais) */}
                <div className="h-[46px] w-[4px] bg-black absolute -start-[18px] top-[102px] rounded-s-lg"></div>
                <div className="h-[46px] w-[4px] bg-black absolute -start-[18px] top-[160px] rounded-s-lg"></div>
                <div className="h-[64px] w-[4px] bg-black absolute -end-[18px] top-[130px] rounded-e-lg"></div>
                
                {/* Tela do Celular */}
                <div
                    className="rounded-[2.2rem] overflow-hidden w-full h-full bg-black pt-7 z-0"
                    style={{ zIndex: 0, position: 'relative', pointerEvents: 'auto' }}
                >
                    {SelectedTemplateComponent && profile && previewSmartLink ? (
                       renderTemplate() // A função renderTemplate já aplica a escala e overflow
                    ) : (
                        <div className="flex items-center justify-center h-full bg-black">
                            <p className="text-gray-500 text-center p-4">
                                {loadingSmartLink || (!profile && user) ? 
                                    'Carregando preview...' : 
                                    'Preencha os dados e selecione um template para ver o preview.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Fim do Mockup de Celular */}

            {profile?.username && (
              <div className="mt-6 text-center px-2">
                <p className="text-sm text-gray-500">Seu link público:</p>
                <a 
                  href={`${window.location.origin}/${profile.username}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 break-all underline"
                >
                  {`${window.location.origin}/${profile.username}`}
                </a>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};



export default SmartLinkEditor;
