'use client';

import { useState, useEffect } from 'react';
import { Shield, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';

export default function Demo() {
  const [apiKey, setApiKey] = useState('');
  const [theme, setTheme] = useState('dark');
  const [widgetKey, setWidgetKey] = useState(0);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    function handleLogin(e: Event) {
      const detail = (e as CustomEvent).detail;
      setEvents(prev => [...prev, `✅ Login: ${detail.email}`]);
    }
    function handleLogout() {
      setEvents(prev => [...prev, '👋 Logout']);
    }
    window.addEventListener('quickauth:login', handleLogin);
    window.addEventListener('quickauth:logout', handleLogout);
    return () => {
      window.removeEventListener('quickauth:login', handleLogin);
      window.removeEventListener('quickauth:logout', handleLogout);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={24} className="text-indigo-400" />
            <span className="font-bold text-lg">QuickAuth</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            Dashboard <ExternalLink size={14} />
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Widget Demo</h1>
        <p className="text-zinc-400 mb-8">Test the QuickAuth widget with your API key.</p>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Config */}
          <div>
            <h2 className="font-semibold mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">API Key</label>
                <input
                  value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder="qa_your_api_key_here"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Theme</label>
                <div className="flex gap-2">
                  <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Dark</button>
                  <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded-lg text-sm ${theme === 'light' ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>Light</button>
                </div>
              </div>
              <button
                onClick={() => setWidgetKey(k => k + 1)}
                disabled={!apiKey}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Load Widget
              </button>
            </div>

            {/* Events */}
            {events.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold mb-3">Events</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-1">
                  {events.map((e, i) => (
                    <p key={i} className="text-sm font-mono text-zinc-300">{e}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget */}
          <div>
            <h2 className="font-semibold mb-4">Widget Preview</h2>
            <div className={`rounded-2xl p-8 ${theme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900/30'} border border-zinc-800`}>
              {apiKey && widgetKey > 0 ? (
                <div key={widgetKey} id="qa-demo-container">
                  <Script
                    src="/widget.js"
                    data-api-key={apiKey}
                    data-theme={theme}
                    strategy="afterInteractive"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <p className="mb-2">Enter your API key and click Load Widget</p>
                  <p className="text-xs">Get an API key from the <Link href="/dashboard" className="text-indigo-400 hover:underline">dashboard</Link></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
