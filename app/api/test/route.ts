export async function POST(req: Request) {
  try {
    const body = await req.json();
    return new Response(JSON.stringify({
      env: {
        DB_HOST: process.env.DB_HOST,
        JWT_SECRET: process.env.JWT_SECRET
      },
      body
    }), { status: 200 });
  } catch (e) {
    return new Response("error: " + e, { status: 500 });
  }
}
