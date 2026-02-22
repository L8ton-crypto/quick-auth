import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/keys';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin') || '*';
  const apiKey = req.headers.get('x-api-key');
  const sql = getDb();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401, headers: corsHeaders(origin) });
  }

  const [project] = await sql`SELECT * FROM qa_projects WHERE api_key = ${apiKey}`;
  if (!project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: corsHeaders(origin) });
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: corsHeaders(origin) });
  }

  const [user] = await sql`
    SELECT * FROM qa_users WHERE project_id = ${project.id} AND email = ${email.toLowerCase()}
  `;

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders(origin) });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: corsHeaders(origin) });
  }

  // Update last login
  await sql`UPDATE qa_users SET last_login = now() WHERE id = ${user.id}`;

  // Create session
  const token = generateToken();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO qa_sessions (user_id, project_id, token, expires_at)
    VALUES (${user.id}, ${project.id}, ${token}, ${expires_at.toISOString()})
  `;

  return NextResponse.json({
    user: { id: user.id, email: user.email, display_name: user.display_name },
    token,
    expires_at
  }, { headers: corsHeaders(origin) });
}
