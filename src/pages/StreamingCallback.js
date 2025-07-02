// src/pages/StreamingCallback.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const StreamingCallback = () => {
    const [message, setMessage] = useState('Processando sua solicitação...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processPresave = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            if (!code || !state) {
                setMessage('Erro: Parâmetros de autorização ausentes.');
                return;
            }

            // O 'state' deve conter o ID da campanha de pré-save
            const presaveId = state;

            try {
                // 1. Trocar o código de autorização por um token de acesso
                const { data: tokenData, error: tokenError } = await supabase.functions.invoke('spotify-token-exchange', {
                    body: {
                        code,
                        redirect_uri: `${window.location.origin}/streaming-callback`,
                        state: presaveId
                    }
                });

                if (tokenError) {
                    console.error('❌ [StreamingCallback] Erro na edge function:', tokenError);
                    throw new Error(`Erro ao obter token: ${tokenError.message}`);
                }

                console.log('✅ [StreamingCallback] Tokens obtidos via edge function');
                const { access_token } = tokenData;

                setMessage('Obtendo dados do seu perfil Spotify...');

                // 2. Obter dados do perfil do fã no Spotify
                const profileResponse = await fetch('https://api.spotify.com/v1/me', {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                });
                
                if (!profileResponse.ok) {
                    console.error('❌ [StreamingCallback] Erro ao buscar perfil:', profileResponse.status);
                    throw new Error('Falha ao buscar perfil do Spotify.');
                }
                
                const fanProfile = await profileResponse.json();
                console.log('✅ [StreamingCallback] Perfil obtido:', fanProfile.display_name);

                setMessage('Salvando seu pré-save...');

                // 3. Buscar detalhes da campanha para implementar pré-save real (futuro)
                const { data: presaveDetails } = await supabase
                    .from('presaves')
                    .select('spotify_uri, title')
                    .eq('id', presaveId)
                    .single();

                // 4. Salvar os dados do fã no Supabase
                const fanData = {
                    campaign_id: presaveId,
                    fan_email: fanProfile.email,
                    fan_name: fanProfile.display_name || 'Usuário Spotify',
                    spotify_user_id: fanProfile.id,
                    streaming_provider: 'spotify',
                    created_at: new Date().toISOString()
                };

                const { error: saveError } = await supabase.from('presave_fans').insert(fanData);

                if (saveError) {
                    console.error('❌ [StreamingCallback] Erro ao salvar fã:', saveError);
                    throw new Error(`Erro ao salvar dados do fã: ${saveError.message}`);
                }

                console.log('✅ [StreamingCallback] Pré-save concluído para:', fanProfile.display_name);
                setMessage('Pré-save concluído com sucesso! Redirecionando...');

                // 5. Redirecionar de volta para a página de pré-save
                setTimeout(() => {
                    navigate(`/presave/${presaveId}?status=success&message=Pré-save realizado com sucesso!`);
                }, 2000);

            } catch (error) {
                console.error('Erro no processo de pré-save:', error);
                setMessage(`Ocorreu um erro: ${error.message}`);
            }
        };

        processPresave();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-2xl font-bold mb-4">Pré-save</h1>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default StreamingCallback;