const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Autorise ton site HTML à communiquer avec ce serveur
app.use(cors());
app.use(express.json());

// Base de données temporaire du serveur (en attendant les clés API)
const musicData = [
    { title: "Mon Amour", artist: "Slimane", album: "Chroniques d'un cupidon", date: "08/11/2023", emoji: "❤️", streams: "145M" },
    { title: "Creep", artist: "Radiohead", album: "Pablo Honey", date: "21/09/1992", emoji: "🎸", streams: "1.8B" },
    { title: "La Symphonie des éclairs", artist: "Zaho de Sagazan", album: "La Symphonie des éclairs", date: "31/03/2023", emoji: "⚡", streams: "62M" }
];

// Route d'API pour la recherche
app.get('/api/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const results = musicData.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
    );
    res.json(results);
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
