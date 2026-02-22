import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/keys';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// CORS headers for widget access
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

  // Check origin if allowed_origins is set
  if (project.allowed_origins?.length > 0 && origin !== '*') {
    if (!project.allowed_origins.includes(origin)) {
      return NextResponse.json({ error: 'Origin not allowed' }, { status: 403, headers: corsHeaders(origin) });
    }
  }

  const { email, password, display_name } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: corsHeaders(origin) });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400, headers: corsHeaders(origin) });
  }

  // Check if user already exists
  const [existing] = await sql`SELECT id FROM qa_users WHERE project_id = ${project.id} AND email = ${email.toLowerCase()}`;
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409, headers: corsHeaders(origin) });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const [user] = await sql`
    INSERT INTO qa_users (project_id, email, password_hash, display_name)
    VALUES (${project.id}, ${email.toLowerCase()}, ${password_hash}, ${display_name || ''})
    RETURNING id, email, display_name, created_at
  `;

  // Create session
  const token = generateToken();
  const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await sql`
    INSERT INTO qa_sessions (user_id, project_id, token, expires_at)
    VALUES (${user.id}, ${project.id}, ${token}, ${expires_at.toISOString()})
  `;

  return NextResponse.json({ user, token, expires_at }, { status: 201, headers: corsHeaders(origin) });
}
