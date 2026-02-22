import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  const apiKey = req.headers.get('x-api-key');
  const auth = req.headers.get('authorization');
  const sql = getDb();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401, headers: corsHeaders(origin) });
  }

  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Token required' }, { status: 401, headers: corsHeaders(origin) });
  }

  const token = auth.slice(7);

  const [session] = await sql`
    SELECT s.*, u.email, u.display_name, u.created_at as user_created_at
    FROM qa_sessions s
    JOIN qa_users u ON u.id = s.user_id
    JOIN qa_projects p ON p.id = s.project_id
    WHERE s.token = ${token} AND p.api_key = ${apiKey} AND s.expires_at > now()
  `;

  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401, headers: corsHeaders(origin) });
  }

  return NextResponse.json({
    user: {
      id: session.user_id,
      email: session.email,
      display_name: session.display_name,
      created_at: session.user_created_at
    }
  }, { headers: corsHeaders(origin) });
}
