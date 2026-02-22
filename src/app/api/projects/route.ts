import { getDb } from '@/lib/db';
import { generateApiKey } from '@/lib/keys';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const sql = getDb();
  const projects = await sql`
    SELECT p.*, 
      (SELECT COUNT(*) FROM qa_users WHERE project_id = p.id) as user_count,
      (SELECT COUNT(*) FROM qa_sessions WHERE project_id = p.id AND expires_at > now()) as active_sessions
    FROM qa_projects p
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const sql = getDb();
  const { name, allowed_origins, widget_theme, redirect_url } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
  }

  const api_key = generateApiKey();
  const origins = allowed_origins || [];

  const [project] = await sql`
    INSERT INTO qa_projects (name, api_key, allowed_origins, widget_theme, redirect_url)
    VALUES (${name.trim()}, ${api_key}, ${origins}, ${widget_theme || 'dark'}, ${redirect_url || ''})
    RETURNING *
  `;

  return NextResponse.json(project, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const sql = getDb();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  await sql`DELETE FROM qa_projects WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
