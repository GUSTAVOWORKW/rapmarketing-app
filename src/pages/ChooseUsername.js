import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
  background: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  font-size: 14px;
  color: ${props => (props.type === 'error' ? 'red' : 'green')};
  min-height: 20px; // Para evitar saltos de layout
  text-align: center;
`;

const ChooseUsername = ({ currentUserId }) => { // Recebe currentUserId como prop
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isUserDataLoading, setIsUserDataLoading] = useState(true); 
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const instanceId = Date.now(); 
    const logPrefix = `ChooseUsername (${instanceId}): useEffect -`;

    console.log(`${logPrefix} useEffect disparado. currentUserId: ${currentUserId}. Definindo isUserDataLoading como true.`);
    setIsUserDataLoading(true); 

    const getUserAndProfile = async () => {
      console.log(`${logPrefix} getUserAndProfile iniciado.`);

      try {
        if (currentUserId) {
          console.log(`${logPrefix} User ID (currentUserId) fornecido: ${currentUserId}.`);

          console.log(`${logPrefix} Antes de buscar perfil para user ID: ${currentUserId} usando maybeSingle()`);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', currentUserId)
            .maybeSingle(); 
          console.log(`${logPrefix} Depois de buscar perfil. Erro: ${profileError ? JSON.stringify(profileError) : 'null'}, Perfil: ${JSON.stringify(profile)}`);

          if (profileError) { 
            console.error(`${logPrefix} Erro ao buscar perfil existente:`, profileError);
            setMessage({ text: 'Erro ao verificar perfil existente.', type: 'error' });
          }
          if (profile && profile.username) {
            console.log(`${logPrefix} Usuário já tem username (${profile.username}). Redirecionando para /dashboard.`);
            navigate('/dashboard');
            return; 
          }
          console.log(`${logPrefix} Usuário não tem username no perfil ou perfil não encontrado. Permanece na página.`);
        } else {
          console.warn(`${logPrefix} Nenhum currentUserId fornecido. Isso não deveria acontecer. Redirecionando para /login.`);
          navigate('/login');
          return; 
        }
      } catch (error) {
        console.error(`${logPrefix} Exceção GERAL no bloco try/catch de getUserAndProfile:`, error);
        setMessage({ text: 'Ocorreu um erro inesperado ao carregar seus dados.', type: 'error' });
      } finally {
        console.log(`${logPrefix} Bloco finally. Definindo isUserDataLoading como false.`);
        setIsUserDataLoading(false);
      }
    };

    if (currentUserId) { // Só executa se currentUserId estiver presente
        getUserAndProfile();
    } else {
        console.warn(`${logPrefix} currentUserId não está disponível no momento da chamada do useEffect. Não chamando getUserAndProfile.`);
        // Poderia redirecionar para /login aqui também ou mostrar uma mensagem, 
        // mas App.js já deve cuidar do redirecionamento se não houver usuário.
        // Definir isUserDataLoading como false para não ficar em loop de carregamento se currentUserId nunca chegar.
        setIsUserDataLoading(false); 
    }

  }, [navigate, currentUserId]); // Adicionado currentUserId às dependências do useEffect

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase();
    if (/^[a-z0-9_]*$/.test(value)) {
      setUsername(value);
      if (message.text) setMessage({ text: '', type: '' });
    } else if (value === '') {
      setUsername('');
    } else {
      setMessage({ text: 'Username: apenas letras (a-z), números (0-9) e underscores (_).', type: 'error' });
    }
  };

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

    if (!currentUserId) { // Verifica currentUserId
      console.error(`${logPrefix} Tentativa de submissão sem currentUserId. isUserDataLoading: ${isUserDataLoading}`);
      setMessage({ text: 'ID do usuário ainda não carregado. Aguarde ou recarregue a página.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    console.log(`${logPrefix} Iniciando. User ID: ${currentUserId}, Username: ${username}`);

    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setMessage({ text: `Username "${username}" não está disponível. Tente outro.`, type: 'error' });
        return; // setLoading(false) será chamado no finally
      }

      console.log(`${logPrefix} Tentando atualizar perfil para User ID: ${currentUserId} com Username: ${username}`);
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('user_id', currentUserId) // Usa currentUserId
        .select('user_id, username')
        .single();

      if (updateError) {
        console.error(`${logPrefix} Erro ao ATUALIZAR username:`, updateError);
        if (updateError.code === 'PGRST116') {
          throw new Error("Perfil não encontrado para atualização. O trigger de criação de perfil pode não ter sido executado corretamente ou o user_id está incorreto.");
        }
        throw updateError;
      }

      console.log(`${logPrefix} Username atualizado com sucesso. Perfil atualizado:`, updatedProfile);
      setMessage({ text: 'Username salvo com sucesso!', type: 'success' });
      // TODO: Atualizar o estado 'profile' no App.js ou contexto global aqui para refletir a mudança imediatamente.
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error(`${logPrefix} Erro capturado no bloco try:`, error);
      setMessage({ text: `Erro ao salvar username: ${error.message}`, type: 'error' });
    } finally {
      console.log(`${logPrefix} Bloco finally. Definindo loading (para salvar) como false.`);
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <h2>Escolha seu Username</h2>
        {isUserDataLoading ? (
          <p>Carregando dados do usuário...</p>
        ) : (
          <p>Este será seu link: rapmarketing.link/{username || 'seu_username'}</p>
        )}
        <Input
          type="text"
          placeholder="Digite seu username"
          value={username}
          onChange={handleUsernameChange}
          maxLength={50}
          minLength={3}
          required
          disabled={isUserDataLoading} // Desabilita input enquanto carrega dados do usuário
        />
        {message.text && <Message type={message.type}>{message.text}</Message>}
        <Button
          type="submit"
          disabled={isUserDataLoading || loading || !username || username.length < 3}
        >
          {isUserDataLoading ? 'Carregando...' : (loading ? 'Salvando...' : 'Salvar Username')}
        </Button>
      </Form>
    </Container>
  );
};

export default ChooseUsername;
