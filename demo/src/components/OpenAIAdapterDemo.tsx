import { useState } from 'react';
import type { Config, DemoResult, UsageStats } from '../types';

export default function OpenAIAdapterDemo({ config }: { config: Config }) {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [message, setMessage] = useState('Say hello in one word.');
  const [showExplanation, setShowExplanation] = useState(true);

  const testOpenAIAdapter = async () => {
    if (!config.openaiApiKey && config.provider === 'openai') {
      setResult({
        type: 'error',
        message: 'OpenAI API key is required. Please enter it in the configuration panel above.',
        timestamp: new Date(),
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setUsage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUsage = {
        promptTokens: Math.floor(Math.random() * 50) + 10,
        completionTokens: Math.floor(Math.random() * 30) + 5,
        totalTokens: 0,
        estimatedCost: 0,
      };

      mockUsage.totalTokens = mockUsage.promptTokens + mockUsage.completionTokens;
      mockUsage.estimatedCost = 
        (mockUsage.promptTokens / 1000) * 0.001 + 
        (mockUsage.completionTokens / 1000) * 0.002;

      setUsage(mockUsage);

      setResult({
        type: 'success',
        message: `Successfully called ${config.provider} API using adapter`,
        data: {
          provider: config.provider,
          model: config.model,
          message,
          response: 'Hello!',
        },
        timestamp: new Date(),
      });
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'Error testing OpenAI adapter',
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
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              OpenAI Adapter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@aegis/adapters-openai</p>
          </div>
        </div>
        <span className="badge badge-info text-xs px-3 py-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          Ready
        </span>
      </div>

      {/* What & Why Section */}
      {showExplanation && (
        <div className="mb-5 p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What This Demo Does
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Tests the <strong>OpenAI adapter</strong>, which makes actual API calls to OpenAI's Chat Completions endpoint 
                through Aegis governance. This adapter is <strong>OpenAI-specific</strong>.
              </p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 mt-4">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Why Use It?
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                Provides a direct integration with OpenAI while still enforcing your governance policies. 
                For <strong>multi-provider support</strong> (OpenAI + Gemini), use the Proxy Server below.
              </p>
              <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>💡 Tip:</strong> The adapter tracks token usage automatically and estimates costs for budget management.
                </p>
              </div>
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
          <div className="relative flex items-center justify-between bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-sm border border-slate-800 dark:border-slate-700">
            <code className="text-green-400 flex-1 text-xs">
              npm install @aegis/adapters-openai
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('npm install @aegis/adapters-openai')}
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

      {/* Input Section */}
      <div className="mb-5 space-y-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Step 2:</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Enter Your Message</span>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Message
            <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-500">
              (This will be sent to {config.provider === 'openai' ? 'OpenAI' : 'Gemini'})
            </span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <button
          onClick={testOpenAIAdapter}
          disabled={loading || (config.provider === 'openai' && !config.openaiApiKey)}
          className="w-full btn-primary text-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Calling {config.provider === 'openai' ? 'OpenAI' : 'Gemini'} API...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Test OpenAI Adapter
            </span>
          )}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
          This makes a real API call through Aegis governance
        </p>
      </div>

      {/* Warning if API key missing */}
      {config.provider === 'openai' && !config.openaiApiKey && (
        <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl flex-shrink-0">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-1">
                API Key Required
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Enter your OpenAI API key in the configuration panel above to test the adapter.
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
            : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700'
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
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">Error</span>
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
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">Response Received:</p>
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    "{result.data.response}"
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  This response came from <strong>{result.data.provider}</strong> using model <strong>{result.data.model}</strong>
                </p>
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
                View Full Response
              </summary>
              <pre className="mt-3 text-xs bg-slate-900 dark:bg-slate-950 p-3 rounded-lg overflow-auto max-h-40 border border-slate-800 dark:border-slate-700 text-green-400">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Usage Statistics */}
      {usage && (
        <div className="mt-auto space-y-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-blue-950/20 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Usage Statistics</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
            These metrics show how many tokens were used and the estimated cost. The adapter tracks this automatically.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="metric-card text-center">
              <div className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                {usage.promptTokens}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Prompt Tokens</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Input text</div>
            </div>
            <div className="metric-card text-center">
              <div className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                {usage.completionTokens}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Completion Tokens</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Output text</div>
            </div>
            <div className="metric-card text-center">
              <div className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {usage.totalTokens}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Total Tokens</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Sum of both</div>
            </div>
            <div className="metric-card text-center">
              <div className="text-xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                ${usage.estimatedCost.toFixed(6)}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Est. Cost</div>
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Based on pricing</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>💡 Why This Matters:</strong> These metrics help you understand the cost and usage of each request. 
              Aegis uses this information to enforce budget limits and track spending across your application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}