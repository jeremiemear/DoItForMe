export async function GET(request) {

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

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

  return Response.redirect(
    `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : ""}/api/organize?token=${data.access_token}`
  );
}
