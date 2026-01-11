import { useState } from 'react';
import type { Config } from './types';
import ConfigPanel from './components/ConfigPanel';
import CoreDemo from './components/CoreDemo';
import OpenAIAdapterDemo from './components/OpenAIAdapterDemo';
import ProxyDemo from './components/ProxyDemo';
import WelcomeSection from './components/WelcomeSection';
import Documentation from './components/Documentation';
import PainPointsDemo from './components/PainPointsDemo';

function App() {
  const [config, setConfig] = useState<Config>({
    openaiApiKey: '',
    geminiApiKey: '',
    model: 'gpt-4o-mini',
    provider: 'openai',
    enableGovernance: true,
    perRunUsd: 1.0,
    perMinuteUsd: 10.0,
    perDayUsd: 50.0,
    tenantId: `tenant_${Date.now()}`,
    runId: `run_${Date.now()}`,
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<'demo' | 'docs'>('demo');

  const handleConfigChange = (newConfig: Partial<Config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              
              
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Aegis Runtime</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Production AI Governance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/aegis-runtime/aegis-runtime"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://www.npmjs.com/~aegis-runtime"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                View on NPM
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/10 dark:to-purple-950/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
            <div className="text-center max-w-3xl mx-auto animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></div>
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Live Demo</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                Production-Ready AI Governance
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Built for Enterprise</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto">
                Production-ready governance for AI applications. Prevent cost overruns, enforce policies, and maintain compliance 
                with real-time budget tracking and cryptographic audit logs.
              </p>
              <div className="flex items-center justify-center gap-6 mb-8 text-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">$0</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Overspending</div>
                </div>
                <div className="h-12 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">100%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Compliance</div>
                </div>
                <div className="h-12 w-px bg-slate-300 dark:bg-slate-700"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0ms</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Overhead</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Production Ready
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Open Source
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                  <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Enterprise Grade
                </span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    document.getElementById('configuration')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary text-sm px-6 py-3 text-base"
                >
                  Get Started
                </button>
                <a
                  href="https://github.com/aegis-runtime/aegis-runtime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm px-6 py-3 text-base"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="configuration">
          {/* Tab Navigation */}
          <div className="mb-8 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('demo')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'demo'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Interactive Demos
              </span>
              {activeTab === 'demo' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
                activeTab === 'docs'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Setup Guide
              </span>
              {activeTab === 'docs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
              )}
            </button>
          </div>

          {activeTab === 'demo' ? (
            <>
          {/* Welcome Section */}
          {showWelcome && (
                <div className="mb-8 animate-fadeIn">
              <WelcomeSection onClose={() => setShowWelcome(false)} />
            </div>
          )}

          {/* Pain Points Demo */}
          <div className="mb-8 animate-fadeIn">
            <PainPointsDemo />
          </div>

          {/* Metrics Dashboard */}
          {/* <div className="mb-8 animate-fadeIn">
            <MetricsDashboard />
          </div> */}

          {/* Configuration Panel */}
              <div className="mb-8 animate-slideIn">
            <ConfigPanel config={config} onChange={handleConfigChange} />
          </div>
            </>
          ) : (
            <div className="animate-fadeIn">
              <Documentation />
            </div>
          )}

          {/* Features Showcase */}
          <section className="grid md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
            <div className="card group cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Policy Enforcement</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Define tenant policies with capabilities, model allowlists, and routing rules for fine-grained access control.
                  </p>
                </div>
              </div>
            </div>
            <div className="card group cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Budget Management</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Track and enforce per-run, per-minute, per-hour, and per-day budget limits with hard stops and soft warnings.
                  </p>
                </div>
              </div>
            </div>
            <div className="card group cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Audit Logging</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Cryptographically signed receipts for all LLM operations with full audit trail and compliance support.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Start Section */}
          <section className="card mb-8 animate-fadeIn">
            <div className="flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Quick Installation
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Get started in seconds with a single command
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Install all Aegis Runtime packages and start building production-ready AI applications with governance, 
                budget management, and audit logging built-in.
              </p>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
                <div className="relative flex items-center gap-3 bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm border border-slate-800 dark:border-slate-700">
                  <code className="text-green-400 flex-1 text-sm">
                    npm install @aegis/core @aegis/adapters-openai @aegis/proxy
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('npm install @aegis/core @aegis/adapters-openai @aegis/proxy');
                    }}
                    className="btn-secondary text-xs px-4 py-2 whitespace-nowrap flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="font-semibold">Note:</span> <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">@aegis/adapters-openai</code> is OpenAI-specific. 
                  For multi-provider support (OpenAI + Gemini), use <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">@aegis/proxy</code>.
                </div>
              </div>
              
              {/* Code Example */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  Example Usage
                </h3>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
                  <div className="relative code-block text-xs">
                    <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`import { Gate, MemoryLedger } from "@aegis/core";
import { openaiChatCompletionsViaGate } from "@aegis/adapters-openai";

// Create gate with governance
const gate = new Gate({
  policyProvider: async ({ tenantId }) => ({
    tenantId,
    budgets: { perRunUsd: 1.0, perWindow: {...} },
    capabilities: ["llm:invoke"],
    routing: { primaryProvider: "openai" }
  }),
  ledger: new MemoryLedger(),
  // ... other dependencies
});

// Make a governed LLM call via OpenAI adapter
const response = await openaiChatCompletionsViaGate({
  gate,
  tenantId: "tenant_1",
  runId: "run_123",
  env: { apiKey: process.env.OPENAI_API_KEY! },
  body: {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello!" }]
  }
});

// For multi-provider support (OpenAI + Gemini), use @aegis/proxy
// The proxy automatically routes based on model or x-provider header`}
                    </pre>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    <strong className="text-blue-600 dark:text-blue-400">Architecture Note:</strong> The <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">@aegis/adapters-openai</code> package is OpenAI-specific. 
                    For LLM-agnostic multi-provider support (OpenAI, Gemini, etc.), use the <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">@aegis/proxy</code> which routes requests automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {activeTab === 'demo' && (
            <>
          {activeTab === 'demo' && (
            <>
              {/* Demo Cards */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Interactive Demos</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  <div className="animate-fadeIn flex h-full" style={{ animationDelay: '0.1s' }}>
                    <CoreDemo config={config} />
                  </div>
                  <div className="animate-fadeIn flex h-full" style={{ animationDelay: '0.2s' }}>
                    <OpenAIAdapterDemo config={config} />
                  </div>
                  <div className="animate-fadeIn flex h-full" style={{ animationDelay: '0.3s' }}>
                    <ProxyDemo config={config} />
                  </div>
                </div>
              </div>
            </>
          )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Aegis Runtime</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
              © 2024 Aegis Runtime. Open source under MIT License.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Production-ready governance and runtime controls for AI/LLM applications
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <a
                href="https://github.com/aegis-runtime/aegis-runtime"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://www.npmjs.com/~aegis-runtime"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.13z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
