export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const me = await response.json();

    return res.status(200).json({
      success: true,
      user: me.id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Server crashed",
      message: error.message
    });
  }
}