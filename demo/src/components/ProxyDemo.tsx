import { useState } from 'react';
import type { Config, DemoResult } from '../types';

export default function ProxyDemo({ config }: { config: Config }) {
  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('http://localhost:8787');
  const [message, setMessage] = useState('Say hello in one word.');
  const [showExplanation, setShowExplanation] = useState(true);
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'unhealthy'>('unknown');

  const testProxy = async () => {
    if (!proxyUrl) {
      setResult({
        type: 'error',
        message: 'Proxy URL is required',
        timestamp: new Date(),
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const apiKey = config.provider === 'openai' ? config.openaiApiKey : config.geminiApiKey;
      
      if (!apiKey) {
        throw new Error(`${config.provider} API key is required`);
      }

      try {
        const healthResponse = await fetch(`${proxyUrl}/healthz`);
        await healthResponse.json();
        
        if (!healthResponse.ok) {
          throw new Error('Health check failed');
        }
      } catch (error) {
        setResult({
          type: 'info',
          message: `Proxy server not running at ${proxyUrl}. Start it with: pnpm dev:proxy`,
          timestamp: new Date(),
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${proxyUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': config.tenantId,
          'x-run-id': config.runId,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'user', content: message }
          ],
          stream: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      setResult({
        type: 'success',
        message: 'Successfully called proxy server!',
        data: {
          response: data,
          status: response.status,
        },
        timestamp: new Date(),
      });

    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'Error testing proxy server',
        data: error,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkProxyHealth = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`${proxyUrl}/healthz`);
      const data = await response.json();
      
      const isHealthy = response.ok;
      setHealthStatus(isHealthy ? 'healthy' : 'unhealthy');
      
      setResult({
        type: isHealthy ? 'success' : 'error',
        message: isHealthy 
          ? `Proxy server is running and healthy at ${proxyUrl}! ✅`
          : 'Proxy server health check failed',
        data: { ...data, statusCode: response.status },
        timestamp: new Date(),
      });
    } catch (error: any) {
      setHealthStatus('unhealthy');
      setResult({
        type: 'info',
        message: `Cannot connect to proxy at ${proxyUrl}. Make sure the server is running.`,
        data: { error: error.message, url: proxyUrl },
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Proxy Server
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">@aegis/proxy</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="badge badge-active text-xs px-3 py-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            HTTP Proxy
          </span>
          {healthStatus !== 'unknown' && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 ${
              healthStatus === 'healthy' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {healthStatus === 'healthy' ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>

      {/* What & Why Section */}
      {showExplanation && (
        <div className="mb-5 p-4 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What This Demo Does
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                Tests the <strong>HTTP Proxy Server</strong>, which provides a production-ready, OpenAI-compatible API endpoint 
                with multi-provider support (OpenAI + Gemini). All requests go through governance, budget enforcement, and audit logging.
              </p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 mt-4">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Why Use It?
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                Perfect for production deployments where you need a single API endpoint that automatically routes to multiple LLM providers 
                based on model names or headers. It enforces governance at the HTTP layer.
              </p>
              <div className="p-2 bg-purple-100/50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  <strong>🌐 Multi-Provider:</strong> Automatically routes to OpenAI or Gemini based on model name (e.g., "gemini-2.5-flash" → Gemini)
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
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-20 group-hover:opacity-30 blur transition duration-300"></div>
          <div className="relative flex items-center justify-between bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-sm border border-slate-800 dark:border-slate-700">
            <code className="text-green-400 flex-1 text-xs">
              npm install @aegis/proxy
            </code>
            <button
              onClick={() => navigator.clipboard.writeText('npm install @aegis/proxy')}
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

      {/* Configuration & Testing */}
      <div className="space-y-4 mb-5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Step 2:</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Configure & Test</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Proxy URL
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-500">
                  (Where your proxy server is running)
                </span>
              </label>
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => {
                  setProxyUrl(e.target.value);
                  setHealthStatus('unknown');
                }}
                placeholder="http://localhost:8787"
                className="input-field"
              />
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Default: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">http://localhost:8787</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Message
                <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-500">
                  (What to send to the LLM)
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

            <div className="flex gap-2.5">
              <button
                onClick={checkProxyHealth}
                disabled={loading}
                className="flex-1 btn-secondary text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Check Health
                  </span>
                )}
              </button>
              
              <button
                onClick={testProxy}
                disabled={loading}
                className="flex-1 btn-primary text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending Request...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Test Completions
                  </span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
              First check health, then test the API endpoint
            </p>
          </div>
        </div>
      </div>

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
                  <span className="text-sm font-bold text-red-700 dark:text-red-400">Error</span>
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
            
            {result.type === 'success' && result.data?.response && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">✅ Request Successful:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>Proxy server received and processed your request</li>
                  <li>Request went through governance checks (policy, budget)</li>
                  <li>LLM response was received and returned</li>
                  <li>Audit receipt was generated and signed</li>
                </ul>
              </div>
            )}

            {result.type === 'info' && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">ℹ️ Why This Happened:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>Cannot connect to proxy server at <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">{proxyUrl}</code></li>
                  <li>The server might not be running or is on a different port</li>
                  <li>Check the setup instructions below to start the proxy server</li>
                </ul>
              </div>
            )}

            {result.type === 'error' && (
              <div className="mt-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs font-semibold text-slate-900 dark:text-white mb-2">❌ Why This Failed:</p>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li>Request was rejected by the proxy server</li>
                  <li>Possible reasons: budget exceeded, policy violation, missing headers, or server error</li>
                  <li>Check the detailed error message above for specific cause</li>
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

      <div className="mt-auto p-4 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Start the Proxy Server (Multi-Provider Support)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed font-medium">
              The proxy supports both OpenAI and Gemini. To test, start it in another terminal:
            </p>
            <div className="space-y-3">
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-xs text-green-400 border border-slate-800">
                <div className="text-slate-400 mb-1"># Set API keys (one or both)</div>
                <div>export OPENAI_API_KEY="your-openai-key"</div>
                <div>export GEMINI_API_KEY="your-gemini-key"</div>
                <div className="mt-2 text-slate-400"># Optional: Set default provider (default: gemini)</div>
                <div>export AEGIS_DEFAULT_PROVIDER="openai"  # or "gemini"</div>
                <div className="mt-2 text-slate-400"># Start the proxy</div>
                <div>pnpm --filter @aegis/proxy dev</div>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                <strong>Note:</strong> The proxy automatically routes requests based on model name (e.g., models starting with "gemini-" go to Gemini) or use the <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">x-provider</code> header.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
