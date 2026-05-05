export default async function handler(req, res) {

const scope = "user-library-read playlist-modify-public playlist-modify-private";

const auth_url =
"https://accounts.spotify.com/authorize?" +
"response_type=code" +
"&client_id=" + process.env.SPOTIFY_CLIENT_ID +
"&scope=" + encodeURIComponent(scope) +
"&redirect_uri=" + encodeURIComponent(process.env.REDIRECT_URI);

res.redirect(auth_url);
}