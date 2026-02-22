import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS qa_projects (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      api_key TEXT NOT NULL UNIQUE,
      allowed_origins TEXT[] DEFAULT '{}',
      widget_theme TEXT DEFAULT 'dark',
      redirect_url TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS qa_users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      project_id TEXT NOT NULL REFERENCES qa_projects(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT DEFAULT '',
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now(),
      last_login TIMESTAMPTZ,
      UNIQUE(project_id, email)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS qa_sessions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES qa_users(id) ON DELETE CASCADE,
      project_id TEXT NOT NULL REFERENCES qa_projects(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  return NextResponse.json({ success: true, tables: ['qa_projects', 'qa_users', 'qa_sessions'] });
}
