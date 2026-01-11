import { useState } from 'react';
import type { Config, DemoResult } from '../types';

export default function CoreDemo({ config }: { config: Config }) {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);

  const testGate = async () => {
    if (!config.enableGovernance) {
      setResult({
        type: 'error',
        message: 'Please enable Governance in the configuration panel above.',
        timestamp: new Date(),
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const estimatedCost = 0.00015;
      const inputTokens = 100;
      const outputTokens = 50;
      
      if (estimatedCost > config.perRunUsd) {
        setResult({
          type: 'error',
          message: `Budget exceeded! Estimated cost $${estimatedCost.toFixed(6)} exceeds per-run limit of $${config.perRunUsd}.`,
          data: {
            estimatedCost,
            perRunLimit: config.perRunUsd,
            remaining: 0,
          },
          timestamp: new Date(),
        });
        setLoading(false);
        return;
      }

      const used = estimatedCost;
      setBudgetUsed(used);

      setResult({
        type: 'success',
        message: 'Gate call successful! Policy enforcement and budget tracking working correctly.',
        data: {
          provider: config.provider,
          model: config.model,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          estimatedCost,
          perRunLimit: config.perRunUsd,
          remainingBudget: config.perRunUsd - used,
          windowStart: new Date().toISOString(),
          policy: {
            modelAllowed: true,
            providerAllowed: true,
            capabilityGranted: true,
          },
        },
        timestamp: new Date(),
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'Error testing gate',
        data: error,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card demo-card w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Core Package
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@aegis/core</p>
          </div>
        </div>
        <span className="badge badge-success text-xs px-3 py-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow"></div>
          Active
        </span>
      </div>

      {/* What & Why Section */}
      {showExplanation && (
        <div className="mb-5 p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What This Demo Does
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Tests the <strong>Gate</strong> class, which is the core governance engine. It enforces policies, checks budget limits, 
                validates permissions, and tracks spending before allowing LLM calls.
              </p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 mt-4">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Why Use It?
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Prevents unauthorized access, enforces spending limits, and ensures compliance with your policies 
                <strong> before</strong> expensive LLM calls are made.
              </p>
            </div>
            <button
              onClick={() => setShowExplanation(false)}
              className="ml-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
              aria-label="Hide explanation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Installation */}
      <div className="mb-5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Step 1:</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Install Package</span>
        </div>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
          <div className="relative flex items-center justify-between bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-sm border border-slate-800 dark:border-slate-700">
            <code className="text-green-400 flex-1 text-xs">
              npm install @aegis/core
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('npm install @aegis/core')}
              className="ml-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Test Button */}
      <div className="mb-5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Step 2:</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Test Policy Enforcement</span>
        </div>
        <button
          onClick={testGate}
          disabled={loading || !config.enableGovernance}
          className="w-full btn-primary mb-3 text-sm relative overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Checking Policy & Budget...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test Gate & Policy Enforcement
            </span>
          )}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
          This simulates a request that goes through policy checks and budget validation
        </p>
      </div>

      {/* Warning if governance disabled */}
      {!config.enableGovernance && (
        <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl flex-shrink-0">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                Governance Disabled
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Enable Governance in the configuration panel above to test policy enforcement and budget management.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className={`rounded-xl p-4 mb-5 border-2 flex-shrink-0 ${
          result.type === 'success' 
            ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700'
            : result.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700'
            : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {result.type === 'success' && (
                <>
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">Success</span>
                </>
              )}
              {result.type === 'error' && (
                <>
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">Blocked</span>
                </>
              )}
              {result.type === 'info' && (
                <>
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400">Info</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {result.timestamp.toLocaleTimeString()}
            </span>
          </div>

          {/* Result Explanation */}
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">What Happened:</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
              {result.message}
            </p>
            {result.type === 'success' && result.data && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Why This Result:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>✅ <strong>Policy Check:</strong> Model "{result.data.model}" is allowed</li>
                  <li>✅ <strong>Permission Check:</strong> Required capability "llm:invoke" is granted</li>
                  <li>✅ <strong>Budget Check:</strong> Estimated cost ${result.data.estimatedCost?.toFixed(6)} is within limit</li>
                  <li>✅ <strong>Provider Check:</strong> Provider "{result.data.provider}" is allowed by routing policy</li>
                </ul>
              </div>
            )}
            {result.type === 'error' && result.data && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Why This Result:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>❌ <strong>Budget Exceeded:</strong> Estimated cost ${result.data.estimatedCost?.toFixed(6)} exceeds per-run limit of ${result.data.perRunLimit?.toFixed(6)}</li>
                  <li>⚠️ The Gate blocked this request to prevent overspending</li>
                  <li>💡 <strong>Solution:</strong> Increase budget limit or reduce request size</li>
                </ul>
              </div>
            )}
          </div>

          {/* Detailed Data */}
          {result.data && (
            <details className="mt-3">
              <summary className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 font-semibold flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View Technical Details
              </summary>
              <pre className="mt-3 text-xs bg-slate-900 dark:bg-slate-950 p-3 rounded-lg overflow-auto max-h-40 border border-slate-800 dark:border-slate-700 text-green-400">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Budget Tracking */}
      {budgetUsed > 0 && (
        <div className="mt-auto space-y-4 p-4 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Budget Tracking
            </h4>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {((budgetUsed / config.perRunUsd) * 100).toFixed(1)}% Used
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            This shows how much budget was consumed by the last request. The Gate tracks this automatically.
          </p>
          <div className="progress-bar mb-4">
            <div 
              className="progress-bar-fill"
              style={{ width: `${Math.min((budgetUsed / config.perRunUsd) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card text-center">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                ${budgetUsed.toFixed(6)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Used This Request</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Based on token estimates</div>
            </div>
            <div className="metric-card text-center">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                ${(config.perRunUsd - budgetUsed).toFixed(6)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Remaining</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Before hitting limit</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}