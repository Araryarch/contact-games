export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return Response.json({ error: "Missing code" }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const clientSecret = process.env.AUTH_DISCORD_SECRET;
    if (!clientId || !clientSecret) {
      return Response.json({ error: "Discord OAuth not configured" }, { status: 500 });
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return Response.json({ error: "Token exchange failed" }, { status: 400 });
    }

    return Response.json({ access_token: tokenData.access_token });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}