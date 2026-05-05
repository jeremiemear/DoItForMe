import { getGenresFromEveryNoise } from "./everynoise.js";

export default async function handler(req,res){

const token = req.query.token;

async function spotifyFetch(url, options={}){
return fetch(url,{
...options,
headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
}
}).then(r=>r.json());
}

// 1️⃣ Récupérer utilisateur
const me = await spotifyFetch("https://api.spotify.com/v1/me");

// 2️⃣ Récupérer tous les morceaux
let tracks = [];
let next = "https://api.spotify.com/v1/me/tracks?limit=50";

while(next){
const data = await spotifyFetch(next);
tracks.push(...data.items);
next = data.next;
}

// 3️⃣ Grouper par genre
let genreMap = {};

for(const item of tracks){

const track = item.track;
const artist = track.artists[0];

let artistData = await spotifyFetch(
`https://api.spotify.com/v1/artists/${artist.id}`
);

let genres = artistData.genres;

if(!genres || genres.length===0){
genres = await getGenresFromEveryNoise(artist.name);
}

if(genres.length===0) continue;

const mainGenre = genres[0];

if(!genreMap[mainGenre])
genreMap[mainGenre]=[];

genreMap[mainGenre].push(track.uri);
}

// 4️⃣ Création playlists
for(const genre in genreMap){

const playlist = await spotifyFetch(
`https://api.spotify.com/v1/users/${me.id}/playlists`,
{
method:"POST",
body:JSON.stringify({
name:`DIFM - ${genre}`,
public:false
})
}
);

// 5️⃣ Ajout morceaux batch 50
const uris = genreMap[genre];
for(let i=0;i<uris.length;i+=50){

await spotifyFetch(
`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
{
method:"POST",
body:JSON.stringify({
uris: uris.slice(i,i+50)
})
}
);
}
}

res.send("✅ Organisation terminée. Vérifie ton Spotify.");
}