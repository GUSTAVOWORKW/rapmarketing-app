// src/pages/StreamingCallback.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const StreamingCallback = () => {
    const [message, setMessage] = useState('Processando sua solicitação...');
    const [currentStep, setCurrentStep] = useState(1);
    const [totalSteps] = useState(4);
    const [error, setError] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    const updateProgress = (step, message) => {
        setCurrentStep(step);
        setMessage(message);
    };

    useEffect(() => {
        const processPresave = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get('code');
            const state = params.get('state');

            console.log('🚨 [StreamingCallback] Iniciando processamento do presave...');
            console.log('🔍 [StreamingCallback] Parâmetros:', { hasCode: !!code, state });

            if (!code || !state) {
                setError('Erro: Parâmetros de autorização ausentes.');
                console.error('❌ [StreamingCallback] Parâmetros ausentes:', { code, state });
                return;
            }

            // O 'state' deve conter o ID da campanha de pré-save
            const presaveId = state;

            try {
                updateProgress(1, 'Trocando código por tokens...');
                
                // 1. Usar a edge function para trocar código por tokens
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

                updateProgress(2, 'Obtendo dados do seu perfil...');

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

                updateProgress(3, 'Salvando seu pré-save...');

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
                updateProgress(4, 'Pré-save concluído com sucesso!');

                // 5. Redirecionar de volta para a página de pré-save
                setTimeout(() => {
                    navigate(`/presave/${presaveId}?status=success&message=Pré-save realizado com sucesso!`);
                }, 2000);

            } catch (error) {
                console.error('Erro no processo de pré-save:', error);
                setError(`Ocorreu um erro: ${error.message}`);
                
                // Redirecionar com erro após 3 segundos
                setTimeout(() => {
                    navigate(`/presave/${presaveId}?status=error&message=${encodeURIComponent(error.message)}`);
                }, 3000);
            }
        };

        processPresave();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                <h1 className="text-2xl font-bold mb-6">Pré-save Spotify</h1>
                
                {error ? (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-700 mb-2">Erro no Pré-save</h3>
                        <p className="text-red-600">{error}</p>
                        <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            {currentStep === totalSteps ? (
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            )}
                        </div>
                        
                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-2">
                                <span>Passo {currentStep} de {totalSteps}</span>
                                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                        
                        <p className="text-gray-700">{message}</p>
                        {currentStep === totalSteps && (
                            <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StreamingCallback;
