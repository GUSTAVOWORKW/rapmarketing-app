import React from 'react';
import { supabase } from '../services/supabase';
import styled from 'styled-components';

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

const Dashboard = () => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Adicionado estado de loading

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
    // Esta verificação é uma segurança, mas o App.js deve redirecionar antes
    return <p>Nenhum usuário logado. Redirecionando para o login...</p>;
  }

  return (
    <div>
      <h1>Bem-vindo à sua Dashboard!</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </div>
  );
};

export default Dashboard;
