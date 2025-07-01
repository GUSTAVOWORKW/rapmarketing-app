// src/services/streamingService.js

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/streaming-callback`;

/**
 * Gera a URL de autorização do Spotify para o fluxo de pré-save.
 * @param {string} presaveId - O ID da campanha de pré-save, usado como 'state' para rastreamento.
 * @returns {string} A URL de autorização completa do Spotify.
 */
export const getSpotifyAuthUrl = (presaveId) => {
    const scopes = [
        'user-read-email',       // Para obter o email do fã
        'user-library-modify',   // Para salvar a música/álbum na biblioteca
    ].join(' ');

    const params = new URLSearchParams({
        client_id: SPOTIFY_CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: scopes,
        state: presaveId, // Usamos o ID do pré-save como 'state' para identificar a campanha no callback
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
};