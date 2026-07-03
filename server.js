const express = require('express');
const cors = require('cors');
// "axios" va nous permettre de lancer les requêtes vers Spotify facilement
const axios = require('axios'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ⚠️ REMPLACE LES TEXTES CI-DESSOUS PAR TES VRAIES CLÉS SPOTIFY EN LAISSANT LES GUILLEMETS
const CLIENT_ID = "7b367340c97f4ec6bbb4f5bb7be0c493";
const CLIENT_SECRET = "T684645ddc1434d73bf1f18849552f751";

// Fonction magique pour demander un jeton d'accès temporaire (Token) à Spotify
async function getSpotifyAccessToken() {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            'grant_type=client_credentials', 
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Erreur lors de la récupération du token Spotify", error);
        return null;
    }
}

// La vraie route de recherche connectée à Spotify !
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json([]);
    }

    const token = await getSpotifyAccessToken();
    if (!token) {
        return res.status(500).json({ error: "Impossible de s'authentifier auprès de Spotify" });
    }

    try {
        // On interroge le vrai catalogue Spotify
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // On trie et reformate les données reçues pour notre index.html
        const tracks = response.data.tracks.items.map(track => ({
            title: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            date: track.album.release_date,
            image: track.album.images[0]?.url || "", // Vraie image de l'album
            streams: "Donnée Live", // Note : Spotify API ne donne pas le nombre de streams exact par défaut pour des raisons de droits
            links: {
                spotify: track.external_urls.spotify,
                apple: `https://music.apple.com/search?term=${encodeURIComponent(track.name + " " + track.artists[0].name)}`,
                youtube: `https://music.youtube.com/search?q=${encodeURIComponent(track.name + " " + track.artists[0].name)}`
            }
        }));

        res.json(tracks);
    } catch (error) {
        console.error("Erreur lors de la recherche Spotify", error);
        res.status(500).json({ error: "Erreur lors de la recherche" });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur en ligne sur le port ${PORT}`);
});
