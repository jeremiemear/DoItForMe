export default async function handler(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    async function spotifyFetch(url, options = {}) {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      return await response.json();
    }

    // 1️⃣ Récupérer utilisateur
    const me = await spotifyFetch("https://api.spotify.com/v1/me");

    if (!me.id) {
      return res.status(400).json({ error: "Spotify auth failed" });
    }

    // 2️⃣ Récupérer 200 morceaux max (pour éviter timeout)
    let tracks = [];
    let next = "https://api.spotify.com/v1/me/tracks?limit=50";
    let count = 0;

    while (next && count < 4) { // 4 x 50 = 200 tracks max
      const data = await spotifyFetch(next);
      tracks.push(...data.items);
      next = data.next;
      count++;
    }

    let genreMap = {};

    for (const item of tracks) {
      const track = item.track;
      const artist = track.artists[0];

      const artistData = await spotifyFetch(
        `https://api.spotify.com/v1/artists/${artist.id}`
      );

      const genres = artistData.genres;

      if (!genres || genres.length === 0) continue;

      const mainGenre = genres[0];

      if (!genreMap[mainGenre]) {
        genreMap[mainGenre] = [];
      }

      genreMap[mainGenre].push(track.uri);
    }

    // 3️⃣ Créer playlists
    for (const genre in genreMap) {
      const playlist = await spotifyFetch(
        `https://api.spotify.com/v1/users/${me.id}/playlists`,
        {
          method: "POST",
          body: JSON.stringify({
            name: `DIFM - ${genre}`,
            public: false
          })
        }
      );

      const uris = genreMap[genre];

      for (let i = 0; i < uris.length; i += 50) {
        await spotifyFetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            method: "POST",
            body: JSON.stringify({
              uris: uris.slice(i, i + 50)
            })
          }
        );
      }
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
}
