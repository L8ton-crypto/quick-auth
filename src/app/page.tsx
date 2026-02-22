'use client';

import { useState } from 'react';
import { Shield, Zap, Code2, Users, ArrowRight, Copy, Check, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

const SNIPPET = `<script src="https://quick-auth.vercel.app/widget.js"
  data-api-key="qa_your_api_key_here"
  data-theme="dark">
</script>`;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm overflow-x-auto font-mono text-zinc-300">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/30 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
        <Icon size={20} className="text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function PricingCard({ tier, price, desc, features, highlight }: { tier: string; price: string; desc: string; features: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-6 border ${highlight ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
      <h3 className="text-xl font-bold mb-1">{tier}</h3>
      <p className="text-zinc-400 text-sm mb-4">{desc}</p>
      <div className="mb-6">
        <span className="text-3xl font-bold">{price}</span>
        {price !== 'Free' && <span className="text-zinc-400 text-sm">/active user/mo</span>}
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
            <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/dashboard" className={`block text-center py-2.5 px-4 rounded-lg font-medium transition-colors ${highlight ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'}`}>
        Get Started
      </Link>
    </div>
  );
}

// Mock widget preview
function WidgetPreview() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl shadow-indigo-500/5">
        <div className="flex items-center gap-2 mb-6">
          <Shield size={20} className="text-indigo-400" />
          <span className="font-semibold text-sm">QuickAuth</span>
        </div>
        <div className="flex gap-1 mb-6 bg-zinc-800 rounded-lg p-1">
          <button onClick={() => setMode('login')} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'login' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Log in</button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === 'signup' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>Sign up</button>
        </div>
        <div className="space-y-3">
          <input type="email" placeholder="Email" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder-zinc-500 focus:border-indigo-500 focus:outline-none" />
          <input type="password" placeholder="Password" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder-zinc-500 focus:border-indigo-500 focus:outline-none" />
          {mode === 'signup' && (
            <input type="text" placeholder="Display name (optional)" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm placeholder-zinc-500 focus:border-indigo-500 focus:outline-none" />
          )}
          <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </div>
        {mode === 'login' && (
          <p className="text-center text-xs text-zinc-500 mt-4">Forgot password?</p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 backdrop-blur-sm sticky top-0 z-50 bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={24} className="text-indigo-400" />
            <span className="font-bold text-lg">QuickAuth</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <Link href="/dashboard" className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm mb-6">
              <Zap size={14} /> Ship auth in 5 minutes
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Authentication for MVPs.
              <br />
              <span className="text-indigo-400">Not enterprises.</span>
            </h1>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Drop a script tag into your app and get login, signup and user management. No OAuth configs, no JWT headaches, no Auth0 pricing surprises. Just works.
            </p>
            <div className="flex gap-3 mb-8">
              <Link href="/dashboard" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Start Building <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-600 px-6 py-3 rounded-lg transition-colors">
                See How It Works
              </a>
            </div>
            <p className="text-zinc-500 text-sm">Free for your first 100 users. No credit card.</p>
          </div>
          <WidgetPreview />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Three steps. Five minutes.</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-lg mx-auto">No backend changes needed. QuickAuth handles everything server-side.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400 font-bold">1</div>
              <h3 className="font-semibold mb-2">Create a project</h3>
              <p className="text-zinc-400 text-sm">Get your API key from the dashboard</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400 font-bold">2</div>
              <h3 className="font-semibold mb-2">Add the widget</h3>
              <p className="text-zinc-400 text-sm">One script tag in your HTML</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 text-indigo-400 font-bold">3</div>
              <h3 className="font-semibold mb-2">Ship it</h3>
              <p className="text-zinc-400 text-sm">Your users can sign up and log in immediately</p>
            </div>
          </div>
          <div className="mt-12">
            <CodeBlock code={SNIPPET} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-zinc-800/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need, nothing you don&apos;t</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Code2} title="One Script Tag" desc="Add authentication to any website with a single line of code. No framework dependencies." />
            <FeatureCard icon={Lock} title="Secure by Default" desc="Passwords hashed with bcrypt. Session tokens with automatic expiry. CORS protection built in." />
            <FeatureCard icon={Users} title="User Management" desc="See all your users, active sessions and signups. Delete accounts, view login history." />
            <FeatureCard icon={Globe} title="CORS & Origins" desc="Lock your auth widget to specific domains. Prevent unauthorized use of your API key." />
            <FeatureCard icon={Zap} title="Fast API" desc="REST API for programmatic access. Register, login, verify sessions - all standard HTTP." />
            <FeatureCard icon={Shield} title="Project Isolation" desc="Each project gets its own user pool. Run multiple apps from one dashboard." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-800/50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-zinc-400 text-center mb-12">Pay per active user. No hidden fees.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PricingCard
              tier="Starter"
              price="Free"
              desc="For side projects and MVPs"
              features={["Up to 100 active users", "1 project", "Email/password auth", "User dashboard", "Community support"]}
            />
            <PricingCard
              tier="Growth"
              price="£0.10"
              desc="For growing apps"
              features={["Unlimited users", "10 projects", "Custom widget themes", "Origin restrictions", "Priority support"]}
              highlight
            />
            <PricingCard
              tier="Scale"
              price="£0.05"
              desc="For serious products"
              features={["Volume discount", "Unlimited projects", "Custom branding", "SSO (coming soon)", "Dedicated support"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500">
            <Shield size={16} />
            <span className="text-sm">QuickAuth - An Arc Forge app</span>
          </div>
          <div className="flex gap-4 text-sm text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
