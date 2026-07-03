const express = require('express');
const cors = require('cors');
const axios = require('axios'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ⚠️ METS TES VRAIES CLÉS SPOTIFY ENTRE LES GUILLEMETS ICI :
const CLIENT_ID = "7b367340c97f4ec6bbb4f5bb7be0c493";
const CLIENT_SECRET = "684645ddc1434d73bf1f18849552f751";

// Fonction pour récupérer le jeton d'accès auprès de Spotify
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
        console.error("Erreur d'authentification Spotify :", error.message);
        return null;
    }
}

// Route principale de recherche de musique
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
        // Requête officielle vers l'API de recherche de Spotify
        const response = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Organisation des données pour ton fichier HTML
        const tracks = response.data.tracks.items.map(track => ({
            title: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            date: track.album.release_date,
            image: track.album.images[0]?.url || "", 
            streams: "Donnée Live", 
            links: {
                spotify: track.external_urls.spotify,
                apple: `https://music.apple.com/search?term=${encodeURIComponent(track.name + " " + track.artists[0].name)}`,
                youtube: `https://music.youtube.com/search?q=${encodeURIComponent(track.name + " " + track.artists[0].name)}`
            }
        }));

        res.json(tracks);
    } catch (error) {
        console.error("Erreur lors de la recherche Spotify :", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération des données" });
    }
});

// Route d'accueil pour tester rapidement si le serveur répond dans le navigateur
app.get('/', (req, res) => {
    res.send("Le serveur de Top Musique est bien en ligne et fonctionnel !");
});

app.listen(PORT, () => {
    console.log(`Serveur actif sur le port ${PORT}`);
});
