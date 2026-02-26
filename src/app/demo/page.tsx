'use client';

import { useState, useEffect } from 'react';
import { Shield, ArrowLeft, ExternalLink, Copy, Check, Code2, Zap, Users, Lock } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';

const DEMO_API_KEY = 'qa_demo_key_public';

const EMBED_CODE = `<script 
  src="https://quick-auth.vercel.app/widget.js"
  data-api-key="YOUR_API_KEY"
  data-theme="dark">
</script>`;

export default function Demo() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [widgetKey, setWidgetKey] = useState(1);
  const [events, setEvents] = useState<{ time: string; text: string }[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleLogin(e: Event) {
      const detail = (e as CustomEvent).detail;
      const time = new Date().toLocaleTimeString();
      setEvents(prev => [...prev, { time, text: `✅ Login: ${detail.email}` }]);
    }
    function handleLogout() {
      const time = new Date().toLocaleTimeString();
      setEvents(prev => [...prev, { time, text: '👋 Logged out' }]);
    }
    function handleRegister(e: Event) {
      const detail = (e as CustomEvent).detail;
      const time = new Date().toLocaleTimeString();
      setEvents(prev => [...prev, { time, text: `🎉 Registered: ${detail.email}` }]);
    }
    window.addEventListener('quickauth:login', handleLogin);
    window.addEventListener('quickauth:logout', handleLogout);
    window.addEventListener('quickauth:register', handleRegister);
    return () => {
      window.removeEventListener('quickauth:login', handleLogin);
      window.removeEventListener('quickauth:logout', handleLogout);
      window.removeEventListener('quickauth:register', handleRegister);
    };
  }, []);

  const switchTheme = (t: 'dark' | 'light') => {
    setTheme(t);
    setWidgetKey(k => k + 1);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(EMBED_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={24} className="text-indigo-400" />
            <span className="font-bold text-lg">QuickAuth</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">Demo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              Dashboard <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* Hero */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-3">Try it live</h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            This is a working QuickAuth widget connected to a demo project. 
            Register an account, log in, log out - everything works. See how simple it is to add auth to any site.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Widget + Events */}
          <div className="lg:col-span-3 space-y-6">
            {/* Theme toggle */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">Widget theme:</span>
              <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
                <button 
                  onClick={() => switchTheme('dark')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => switchTheme('light')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${theme === 'light' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'}`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Widget container */}
            <motion.div 
              key={widgetKey}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-8 ${theme === 'light' ? 'bg-zinc-100' : 'bg-zinc-900/30'} border border-zinc-800 flex items-center justify-center min-h-[320px]`}
            >
              <div id="qa-demo-widget">
                <Script
                  key={widgetKey}
                  src="/widget.js"
                  data-api-key={DEMO_API_KEY}
                  data-theme={theme}
                  strategy="afterInteractive"
                />
              </div>
            </motion.div>

            {/* Event log */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-zinc-400">Event Log</h2>
                {events.length > 0 && (
                  <button 
                    onClick={() => setEvents([])} 
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 min-h-[80px] font-mono text-sm">
                {events.length === 0 ? (
                  <p className="text-zinc-600">Waiting for events... Try registering or logging in above.</p>
                ) : (
                  <div className="space-y-1.5">
                    {events.map((e, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-zinc-600 shrink-0">{e.time}</span>
                        <span className="text-zinc-300">{e.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: How it works */}
          <div className="lg:col-span-2 space-y-6">
            {/* Embed code */}
            <div>
              <h2 className="font-semibold mb-3">Add to your site</h2>
              <div className="relative">
                <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 overflow-x-auto">
                  <code>{EMBED_CODE}</code>
                </pre>
                <button 
                  onClick={copyCode}
                  className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-400" />}
                </button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">That&apos;s it. One script tag. Full auth flow.</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-semibold mb-3">What you get</h2>
              <div className="space-y-3">
                {[
                  { icon: <Code2 size={16} />, title: 'One script tag', desc: 'Drop it into any HTML page' },
                  { icon: <Users size={16} />, title: 'User management', desc: 'Registration, login, sessions' },
                  { icon: <Lock size={16} />, title: 'Secure by default', desc: 'Bcrypt passwords, token sessions' },
                  { icon: <Zap size={16} />, title: 'REST API', desc: 'Register, login, verify endpoints' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{f.title}</p>
                      <p className="text-xs text-zinc-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works steps */}
            <div>
              <h2 className="font-semibold mb-3">How it works</h2>
              <div className="space-y-4">
                {[
                  { step: '1', text: 'Create a project in the dashboard' },
                  { step: '2', text: 'Copy your API key' },
                  { step: '3', text: 'Add the script tag to your site' },
                  { step: '4', text: 'Users can register and log in' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 items-center">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold flex items-center justify-center text-zinc-400 shrink-0">
                      {s.step}
                    </span>
                    <p className="text-sm text-zinc-400">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-3">Ready to add auth to your app?</p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
              >
                Create a project <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
