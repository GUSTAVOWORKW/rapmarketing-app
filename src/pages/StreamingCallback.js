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
                        redirect_uri: `${window.location.origin}/streaming-callback`
                    }
                });

                if (tokenError) throw new Error(`Erro ao obter token: ${tokenError.message}`);

                const { access_token, refresh_token } = tokenData;

                // 2. Obter dados do perfil do fã no Spotify
                const profileResponse = await fetch('https://api.spotify.com/v1/me', {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                });
                if (!profileResponse.ok) throw new Error('Falha ao buscar perfil do Spotify.');
                const fanProfile = await profileResponse.json();

                // 3. Salvar a música/álbum na biblioteca do fã (simulado)
                // Em um cenário real, você usaria o `track_uri` ou `album_uri` da campanha
                // const presaveDetails = await supabase.from('presaves').select('spotify_uri').eq('id', presaveId).single();
                // await fetch(`https://api.spotify.com/v1/me/tracks?ids=${presaveDetails.data.spotify_uri}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${access_token}` }});

                // 4. Salvar os dados do fã no Supabase
                const { error: saveError } = await supabase.from('presave_fans').insert({
                    campaign_id: presaveId,
                    fan_email: fanProfile.email,
                    fan_name: fanProfile.display_name,
                    streaming_provider: 'spotify'
                });

                if (saveError) throw new Error(`Erro ao salvar dados do fã: ${saveError.message}`);

                setMessage('Pré-save concluído com sucesso! Redirecionando...');

                // 5. Redirecionar de volta para a página de pré-save
                setTimeout(() => {
                    navigate(`/presave/${presaveId}?status=success`);
                }, 3000);

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