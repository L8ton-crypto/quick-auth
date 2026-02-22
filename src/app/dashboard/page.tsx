'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Trash2, Copy, Check, Users, Key, Globe, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  api_key: string;
  allowed_origins: string[];
  widget_theme: string;
  redirect_url: string;
  created_at: string;
  user_count: string;
  active_sessions: string;
}

interface ProjectDetail {
  project: Project;
  users: { id: string; email: string; display_name: string; verified: boolean; created_at: string; last_login: string }[];
  stats: { total_users: string; new_users_7d: string; active_sessions: string };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-zinc-400" />}
    </button>
  );
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [origins, setOrigins] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        allowed_origins: origins ? origins.split(',').map(o => o.trim()).filter(Boolean) : [],
      }),
    });
    setLoading(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Create Project</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Project Name</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="My App"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Allowed Origins (comma-separated, optional)</label>
            <input
              value={origins} onChange={e => setOrigins(e.target.value)}
              placeholder="https://myapp.com, http://localhost:3000"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={loading || !name.trim()} className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm font-medium">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectList({ projects, onSelect, onRefresh }: { projects: Project[]; onSelect: (id: string) => void; onRefresh: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-zinc-800 transition-colors" title="Refresh">
          <RefreshCw size={16} className="text-zinc-400" />
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Key size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm">Create your first project to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="w-full text-left bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-indigo-500/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">{p.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="flex items-center gap-1"><Users size={14} /> {p.user_count} users</span>
                    <span className="flex items-center gap-1"><Globe size={14} /> {p.active_sessions} active</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectView({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const [data, setData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${projectId}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !data) return <div className="text-center py-20 text-zinc-500">Loading...</div>;

  const { project, users, stats } = data;
  const snippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js"
  data-api-key="${project.api_key}"
  data-theme="${project.widget_theme}">
</script>`;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to projects
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <button
          onClick={async () => {
            if (confirm('Delete this project and all its users?')) {
              await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: project.id }) });
              onBack();
            }
          }}
          className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-colors"
          title="Delete project"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Total Users</p>
          <p className="text-2xl font-bold">{stats.total_users}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">New (7d)</p>
          <p className="text-2xl font-bold">{stats.new_users_7d}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-400 mb-1">Active Sessions</p>
          <p className="text-2xl font-bold">{stats.active_sessions}</p>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2"><Key size={14} /> API Key</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800 rounded-lg px-3 py-2 text-sm font-mono text-indigo-300 truncate">{project.api_key}</code>
          <CopyButton text={project.api_key} />
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Embed Code</h3>
        <div className="relative group">
          <pre className="bg-zinc-800 rounded-lg p-3 text-sm font-mono text-zinc-300 overflow-x-auto">{snippet}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(snippet)}
            className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {/* Origins */}
      {project.allowed_origins?.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2"><Globe size={14} /> Allowed Origins</h3>
          <div className="flex flex-wrap gap-2">
            {project.allowed_origins.map((o, i) => (
              <span key={i} className="bg-zinc-800 rounded-lg px-3 py-1 text-sm text-zinc-300">{o}</span>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2"><Users size={14} /> Users ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4 text-center">No users yet. Embed the widget to start collecting signups.</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-zinc-500">
                    {u.display_name && `${u.display_name} - `}
                    Joined {new Date(u.created_at).toLocaleDateString()}
                    {u.last_login && ` - Last login ${new Date(u.last_login).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inited, setInited] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      if (!inited) {
        await fetch('/api/init', { method: 'POST' });
        setInited(true);
      }
      loadProjects();
    }
    init();
  }, [inited, loadProjects]);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={24} className="text-indigo-400" />
            <span className="font-bold text-lg">QuickAuth</span>
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> New Project
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading...</div>
        ) : selectedProject ? (
          <ProjectView projectId={selectedProject} onBack={() => { setSelectedProject(null); loadProjects(); }} />
        ) : (
          <ProjectList projects={projects} onSelect={setSelectedProject} onRefresh={loadProjects} />
        )}
      </main>

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={loadProjects} />}
    </div>
  );
}
