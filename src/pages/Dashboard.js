import React from 'react';
import { supabase } from '../services/supabase';
import styled from 'styled-components';
import TemplateSelect from './TemplateSelect';
import { useNavigate } from 'react-router-dom';

const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #d32f2f;
  }
`;

// Novo: menu lateral estilizado
const Layout = styled.div`
  display: flex;
  min-height: 100vh;
  background: #181818;
`;

const Sidebar = styled.nav`
  width: 220px;
  background: #232323;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 32px 0 0 0;
  box-shadow: 2px 0 12px #0002;
  gap: 8px;
`;

const MenuItem = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.08rem;
  padding: 14px 32px 14px 32px;
  text-align: left;
  width: 100%;
  cursor: pointer;
  border-radius: 0 20px 20px 0;
  transition: background 0.18s, color 0.18s, font-weight 0.18s;
  &:hover, &:focus {
    background: #00e67622;
    color: #00e676;
    font-weight: bold;
  }
`;

const Main = styled.div`
  flex: 1;
  padding: 48px 32px 32px 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Dashboard = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Adicionado estado de loading
  const [menu, setMenu] = React.useState('home');
  const navigate = useNavigate();

  React.useEffect(() => {
    setLoading(true);
    // Função para buscar a sessão atual e definir o usuário
    const getCurrentSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erro ao buscar sessão no Dashboard:", error.message);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
      // Se veio de /dashboard?tab=templates, já abre a aba de templates
      if (window.location.search.includes('tab=templates')) {
        setMenu('templates');
      }
    };

    getCurrentSession();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // Garante que o loading termine após qualquer mudança de auth
      }
    );

    // Função de limpeza para desinscrever o listener ao desmontar o componente
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error.message);
    }
    // O App.js onAuthStateChange deve redirecionar
  };

  if (loading) {
    return <p>Carregando Dashboard...</p>;
  }

  if (!user) {
    return <p>Nenhum usuário logado. Redirecionando para o login...</p>;
  }

  return (
    <Layout>
      <Sidebar>
        <MenuItem onClick={() => setMenu('home')} style={{fontWeight: menu==='home'?'bold':undefined}}>Início</MenuItem>
        <MenuItem onClick={() => setMenu('templates')} style={{fontWeight: menu==='templates'?'bold':undefined}}>Meus Templates</MenuItem>
        <MenuItem onClick={() => navigate('/choose-template')}>Escolher Novo Template</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Sidebar>
      <Main>
        {menu === 'home' && (
          <>
            <h1>Bem-vindo à sua Dashboard!</h1>
            <p>Email: {user.email}</p>
            <p>User ID: {user.id}</p>
          </>
        )}
        {menu === 'templates' && (
          <div>
            <h2>Meus Templates</h2>
            <UserTemplates userId={user.id} />
          </div>
        )}
      </Main>
    </Layout>
  );
};

// Componente para listar o template do usuário
function UserTemplates({ userId }) {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    }
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) return <p>Carregando...</p>;
  if (!profile) return <p>Nenhum template encontrado.</p>;

  // Mostra um resumo do template salvo
  return (
    <div style={{ background: '#232323', borderRadius: 12, padding: 24, marginTop: 16, maxWidth: 400 }}>
      <h4 style={{ color: '#00e676', marginBottom: 8 }}>Template Atual</h4>
      <p><b>Nome de usuário:</b> {profile.username}</p>
      <p><b>Bio:</b> {profile.bio}</p>
      <p><b>Template:</b> {profile.template_id}</p>
      <p><b>Links:</b> {profile.socials && Object.keys(profile.socials).length > 0 ? Object.keys(profile.socials).join(', ') : 'Nenhum'}</p>
      <p><b>Última atualização:</b> {profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '-'}</p>
      <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer" style={{ color: '#00e676', fontWeight: 'bold', textDecoration: 'underline' }}>Ver página pública</a>
    </div>
  );
}

export default Dashboard;
