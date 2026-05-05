export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {

  const code = req.query.code;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(
        process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
      ).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.REDIRECT_URI
    })
  });

  const data = await response.json();

  res.redirect(`/api/organize?token=${data.access_token}`);
}
