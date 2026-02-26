const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_HRLp6F7oICcn@ep-rough-glade-ailx0054-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function seed() {
  // Check if demo project exists
  const existing = await sql`SELECT * FROM qa_projects WHERE api_key = 'qa_demo_key_public'`;
  if (existing.length > 0) {
    console.log('Demo project already exists:', existing[0].id);
    return;
  }

  await sql`INSERT INTO qa_projects (id, name, api_key, allowed_origins, widget_theme) 
            VALUES ('demo-project', 'Demo App', 'qa_demo_key_public', '{}', 'dark')`;
  console.log('Created demo project with key: qa_demo_key_public');
}

seed().catch(console.error);
