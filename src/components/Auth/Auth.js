import React from 'react';
import { supabase } from '../../services/supabase';
import styled from 'styled-components';

// Estilização básica para o botão, pode ser ajustada depois conforme o design
const GoogleButton = styled.button`
  background-color: #4285F4;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #357ae8;
  }
`;

const Auth = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        console.error('Erro ao fazer login com Google:', error.message);
        // TODO: Adicionar tratamento de erro mais robusto para o usuário
      }
    } catch (error) {
      console.error('Erro inesperado durante o login com Google:', error);
      // TODO: Adicionar tratamento de erro mais robusto para o usuário
    }
  };

  // TODO: Adicionar lógica para logout e verificação de sessão do usuário

  return (
    <div>
      {/* TODO: Adicionar verificação se o usuário já está logado para mostrar informações do usuário ou botão de logout */}
      <GoogleButton onClick={handleGoogleLogin}>
        {/* Ícone do Google pode ser adicionado aqui com react-icons */}
        <span>Login com Google</span>
      </GoogleButton>
    </div>
  );
};

export default Auth;
