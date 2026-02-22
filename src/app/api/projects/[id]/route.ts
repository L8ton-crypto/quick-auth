import { getDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();

  const [project] = await sql`SELECT * FROM qa_projects WHERE id = ${id}`;
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const users = await sql`
    SELECT id, email, display_name, verified, created_at, last_login
    FROM qa_users WHERE project_id = ${id}
    ORDER BY created_at DESC
  `;

  const stats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM qa_users WHERE project_id = ${id}) as total_users,
      (SELECT COUNT(*) FROM qa_users WHERE project_id = ${id} AND created_at > now() - interval '7 days') as new_users_7d,
      (SELECT COUNT(*) FROM qa_sessions WHERE project_id = ${id} AND expires_at > now()) as active_sessions
  `;

  return NextResponse.json({ project, users, stats: stats[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();
  const { name, allowed_origins, widget_theme, redirect_url } = await req.json();

  const [project] = await sql`
    UPDATE qa_projects SET
      name = COALESCE(${name}, name),
      allowed_origins = COALESCE(${allowed_origins}, allowed_origins),
      widget_theme = COALESCE(${widget_theme}, widget_theme),
      redirect_url = COALESCE(${redirect_url}, redirect_url)
    WHERE id = ${id}
    RETURNING *
  `;

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json(project);
}
