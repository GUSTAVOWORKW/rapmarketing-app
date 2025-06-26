import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { PLATFORMS as appPlatforms } from '../data/platforms'; 

const StreamingSetup = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [platformLinks, setPlatformLinks] = useState([]);
  const [username, setUsername] = useState(null);

  useEffect(() => {    const fetchProfile = async () => {
      if (currentUser && currentUser.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', currentUser.id)
          .single();
        if (error) {
          console.error('Error fetching profile for username:', error);
        } else if (data) {
          setUsername(data.username);
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    setPlatformLinks(
      appPlatforms.map(p => ({
        platform_id: p.id,
        url: '',
      }))
    );
  }, []);

  const handleChange = (platformId, value) => {
    setPlatformLinks(prevLinks =>
      prevLinks.map(link =>
        link.platform_id === platformId ? { ...link, url: value } : link
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
        alert("Nome de usuário não encontrado. Não é possível prosseguir.");
        return;
    }
    const filledLinks = platformLinks.filter(link => link.url && link.url.trim() !== '');
    
    navigate(`/smartlink-editor/${username}`, { 
        state: { 
            initialPlatformLinks: filledLinks,
            templateId: location.state?.templateId 
        } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-8">
          Adicione seus links de streaming
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          {appPlatforms.map((p) => {
            const currentLink = platformLinks.find(pl => pl.platform_id === p.id);
            return (
              <div className="flex items-center space-x-3 bg-gray-700 p-3 rounded-md" key={p.id}>
                {/* Substituir <img src={p.icon_url} ... /> por componente de ícone */}
                {p.icon ? (
                  <span className="w-8 h-8 flex items-center justify-center text-2xl" style={{ color: p.brand_color }}>
                    {React.createElement(p.icon)}
                  </span>
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded-full opacity-30" />
                )}
                <span className="flex-shrink-0 w-28 text-sm font-medium text-gray-300">{p.name}</span>
                <input
                  className="flex-grow bg-gray-600 text-white border border-gray-500 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
                  type="url" 
                  placeholder={p.placeholder_url}
                  value={currentLink?.url || ''}
                  onChange={e => handleChange(p.id, e.target.value)}
                  autoComplete="off"
                />
              </div>
            );
          })}
          <button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
            type="submit"
          >
            Avançar para o Editor
          </button>
        </form>
      </div>
    </div>
  );
};

export default StreamingSetup;
