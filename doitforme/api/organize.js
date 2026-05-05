export async function GET(request) {
  try {

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400 }
      );
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

    const me = await spotifyFetch("https://api.spotify.com/v1/me");

    if (!me.id) {
      return new Response(
        JSON.stringify({ error: "Spotify auth failed" }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, user: me.id }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error.message
      }),
      { status: 500 }
    );
  }
}
