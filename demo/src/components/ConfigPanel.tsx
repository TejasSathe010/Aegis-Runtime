import type { Config } from '../types';

interface ConfigPanelProps {
  config: Config;
  onChange: (config: Partial<Config>) => void;
}

export default function ConfigPanel({ config, onChange }: ConfigPanelProps) {
  return (
    <section className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Configuration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Configure your API keys and governance settings
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl border border-green-600 shadow-lg shadow-green-500/20">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse-glow"></div>
          <span className="text-xs font-bold text-white">Ready</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            OpenAI API Key
            <span className="ml-1.5 text-xs font-normal text-slate-400">(Required)</span>
          </label>
          <input
            type="password"
            placeholder="sk-..."
            value={config.openaiApiKey}
            onChange={(e) => onChange({ openaiApiKey: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Gemini API Key
            <span className="ml-1.5 text-xs font-normal text-slate-400">(Required)</span>
          </label>
          <input
            type="password"
            placeholder="AIza..."
            value={config.geminiApiKey}
            onChange={(e) => onChange({ geminiApiKey: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Provider
            <span className="ml-1.5 text-xs font-normal text-slate-400">(LLM provider)</span>
          </label>
          <select
            value={config.provider}
            onChange={(e) => onChange({ provider: e.target.value as 'openai' | 'gemini' })}
            className="input-field"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Model
            <span className="ml-1.5 text-xs font-normal text-slate-400">(e.g., gpt-4o-mini)</span>
          </label>
          <input
            type="text"
            placeholder="gpt-4o-mini"
            value={config.model}
            onChange={(e) => onChange({ model: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Tenant ID
            <span className="ml-1.5 text-xs font-normal text-slate-400">(Identifier)</span>
          </label>
          <input
            type="text"
            value={config.tenantId}
            onChange={(e) => onChange({ tenantId: e.target.value })}
            className="input-field"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Run ID
            <span className="ml-1.5 text-xs font-normal text-slate-400">(Session)</span>
          </label>
          <input
            type="text"
            value={config.runId}
            onChange={(e) => onChange({ runId: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Governance Toggle */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.enableGovernance}
                onChange={(e) => onChange({ enableGovernance: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 shadow-lg"></div>
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Enable Governance
                {config.enableGovernance && (
                  <span className="badge badge-success text-xs">Active</span>
                )}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Policy enforcement, budget limits, and audit logging
              </p>
            </div>
          </div>
        </div>

        {config.enableGovernance && (
          <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Budget Limits (USD)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Set spending limits for governance enforcement
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Per Run
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(Per session)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.perRunUsd}
                  onChange={(e) => onChange({ perRunUsd: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Per Minute
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(Window)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.perMinuteUsd}
                  onChange={(e) => onChange({ perMinuteUsd: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Per Day
                  <span className="ml-1.5 text-xs font-normal text-slate-400">(Daily)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={config.perDayUsd}
                  onChange={(e) => onChange({ perDayUsd: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
