import { useState } from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-between text-left"
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        <svg
          className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Documentation() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Complete Setup Guide
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Everything you need to get started with Aegis Runtime, from basic setup to advanced configuration
        </p>
      </div>

      {/* Quick Start */}
      <Section title="🚀 Quick Start (5 minutes)" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Step 1: Install Packages</h4>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
              <div className="relative code-block text-xs">
                <pre className="text-green-400 font-mono leading-relaxed">
{`npm install @aegis/core @aegis/adapters-openai @aegis/proxy`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Step 2: Get API Keys</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li><strong>OpenAI:</strong> Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">platform.openai.com</a></li>
              <li><strong>Gemini:</strong> Get your key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">aistudio.google.com</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Step 3: Test in Demo</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>Enter your API keys in the Configuration panel above</li>
              <li>Select your provider (OpenAI or Gemini)</li>
              <li>Enable Governance and set budget limits</li>
              <li>Test each demo component below</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* Basic Setup */}
      <Section title="📋 Basic Setup - Core Package">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Using @aegis/core in Your Code</h4>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
              <div className="relative code-block text-xs">
                <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`import { Gate, MemoryLedger, FileReceiptSink, HmacSha256Signer } from "@aegis/core";
import crypto from "crypto";

// 1. Create a policy provider
const policyProvider = {
  async getPolicy({ tenantId }) {
    return {
      tenantId,
      budgets: {
        perRunUsd: 1.0,           // Max $1 per request
        perWindow: {
          window: "minute",        // Time window: minute, hour, day, month
          limitUsd: 10.0,          // Max $10 per minute
          hardStop: true           // Stop immediately when limit reached
        }
      },
      routing: {
        primaryProvider: "openai", // or "gemini"
        fallbackProviders: []      // Optional fallback providers
      },
      model: {
        allowModels: ["gpt-4o-mini", "gpt-4", "gemini-2.5-flash"]
      },
      capabilities: ["llm:invoke"]  // Required capability
    };
  }
};

// 2. Create gate instance
const secret = crypto.randomBytes(32);
const gate = new Gate({
  policyProvider,
  ledger: new MemoryLedger(),
  pricing: yourPricingTable,
  signer: new HmacSha256Signer({ 
    keyId: "k1", 
    secret 
  }),
  sink: new FileReceiptSink("./receipts")
});

// 3. Use the gate
const result = await gate.call({
  tenantId: "tenant_1",
  runId: "run_123",
  provider: "openai",
  model: "gpt-4o-mini",
  capability: "llm:invoke",
  inputTokensUpperBound: 100,
  outputTokensUpperBound: 50,
  execute: async () => {
    // Your LLM call logic here
    return { success: true };
  }
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* OpenAI Adapter Setup */}
      <Section title="🔌 Basic Setup - OpenAI Adapter">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Using @aegis/adapters-openai</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              This adapter is <strong>OpenAI-specific</strong>. For multi-provider support (OpenAI + Gemini), use the Proxy Server instead.
            </p>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
              <div className="relative code-block text-xs">
                <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`import { openaiChatCompletionsViaGate } from "@aegis/adapters-openai";
import { Gate } from "@aegis/core";

// Create gate (see Core Package setup above)
const gate = new Gate({ /* ... */ });

// Make a governed OpenAI API call
const response = await openaiChatCompletionsViaGate({
  gate,
  tenantId: "tenant_1",
  runId: "run_123",
  requestId: crypto.randomUUID(),
  env: {
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: "https://api.openai.com/v1" // Optional, defaults to OpenAI
  },
  body: {
    model: "gpt-4o-mini",
    messages: [
      { role: "user", content: "Hello!" }
    ],
    stream: false, // Set to true for streaming
    stream_options: { include_usage: true } // Recommended for streaming
  }
});

// Handle response
const data = await response.json();
console.log(data.choices[0].message.content);

// For streaming:
if (response.body) {
  const reader = response.body.getReader();
  // Process stream...
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Proxy Server Setup */}
      <Section title="🌐 Basic Setup - Proxy Server (Multi-Provider)">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Setting Up the Proxy Server</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              The proxy server supports <strong>both OpenAI and Gemini</strong> with automatic routing.
            </p>
            
            <div className="mb-4">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2">1. Set Environment Variables</h5>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
                <div className="relative code-block text-xs">
                  <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`# Required: At least one API key
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."

# Optional: Configuration
export PORT=8787                                    # Server port (default: 8787)
export AEGIS_DEFAULT_PROVIDER="openai"             # Default provider: "openai" or "gemini"
export AEGIS_GOVERNANCE_ENABLED="true"             # Enable governance (default: true)
export AEGIS_REQUIRE_TENANT_HEADER="true"          # Require x-tenant-id header (default: true)
export AEGIS_STREAM_INCLUDE_USAGE="true"           # Include usage in streams (default: true)

# Budget limits (USD)
export AEGIS_DEFAULT_MAX_TOKENS="128"              # Default max tokens if not specified
export AEGIS_MAX_TOKENS_CAP="2048"                 # Hard cap on max tokens

# Audit logging
export AEGIS_AUDIT_DIR="./receipts"                # Directory for audit receipts

# Signing
export AEGIS_SIGNER_KEY_ID="k1"                    # Key ID for receipts
export AEGIS_SIGNER_SECRET_HEX="01020304..."       # Secret key (32 bytes hex)`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2">2. Start the Server</h5>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
                <div className="relative code-block text-xs">
                  <pre className="text-green-400 font-mono leading-relaxed">
{`# From the root of aegis-runtime
cd packages/proxy

# Build first (if needed)
pnpm build

# Start the server
pnpm dev

# Or from root with workspace
pnpm --filter @aegis/proxy dev`}
                  </pre>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Server will start on <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">http://localhost:8787</code>
              </p>
            </div>

            <div className="mb-4">
              <h5 className="font-semibold text-slate-900 dark:text-white mb-2">3. Make Requests</h5>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
                <div className="relative code-block text-xs">
                  <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`# Using curl
curl http://localhost:8787/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "x-tenant-id: tenant_1" \\
  -H "x-run-id: run_123" \\
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'

# Or route to Gemini explicitly
curl http://localhost:8787/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "x-tenant-id: tenant_1" \\
  -H "x-run-id: run_123" \\
  -H "x-provider: gemini" \\
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'

# Using fetch in JavaScript
const response = await fetch("http://localhost:8787/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-tenant-id": "tenant_1",
    "x-run-id": "run_123"
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Hello!" }]
  })
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Advanced Configuration */}
      <Section title="⚙️ Advanced Configuration">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Custom Policy Configuration</h4>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
              <div className="relative code-block text-xs">
                <pre className="text-green-400 font-mono leading-relaxed overflow-x-auto">
{`# Set a default policy via environment variable
export AEGIS_DEFAULT_POLICY_JSON='{
  "hardStop": true,
  "budgets": {
    "perRunUsd": 0.50,
    "perWindow": {
      "window": "hour",
      "limitUsd": 100.0,
      "hardStop": true
    }
  },
  "routing": {
    "primaryProvider": "openai",
    "fallbackProviders": ["gemini"]
  },
  "model": {
    "allowModels": ["gpt-4o-mini", "gpt-4", "gemini-2.5-flash"]
  },
  "capabilities": ["llm:invoke"]
}'

# Tenant-specific policies
export AEGIS_TENANT_tenant1_POLICY_JSON='{
  "budgets": {
    "perRunUsd": 10.0,
    "perWindow": {
      "window": "day",
      "limitUsd": 1000.0,
      "hardStop": false
    }
  }
}'

export AEGIS_TENANT_tenant2_POLICY_JSON='{
  "budgets": {
    "perRunUsd": 0.10,
    "perWindow": {
      "window": "minute",
      "limitUsd": 5.0,
      "hardStop": true
    }
  }
}'`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Provider Routing</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              The proxy automatically routes requests based on:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400 mb-3">
              <li><strong>Model name:</strong> Models starting with <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">gemini-</code> route to Gemini</li>
              <li><strong>x-provider header:</strong> Explicit provider selection</li>
              <li><strong>Default provider:</strong> Set via <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">AEGIS_DEFAULT_PROVIDER</code></li>
            </ul>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg opacity-10 group-hover:opacity-15 blur transition duration-300"></div>
              <div className="relative code-block text-xs">
                <pre className="text-green-400 font-mono leading-relaxed">
{`# Route to OpenAI explicitly
-H "x-provider: openai"

# Route to Gemini explicitly  
-H "x-provider: gemini"

# Auto-route based on model name
{ "model": "gemini-2.5-flash" }  # → Gemini
{ "model": "gpt-4o-mini" }       # → OpenAI`}
                </pre>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Production Considerations</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><strong>Secure Secret:</strong> Generate a strong secret for receipt signing: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">openssl rand -hex 32</code></li>
              <li><strong>Receipt Storage:</strong> Configure a persistent directory for audit receipts (consider cloud storage for production)</li>
              <li><strong>Environment Variables:</strong> Use a secrets manager or environment variable management tool in production</li>
              <li><strong>Monitoring:</strong> Set up logging and monitoring for the proxy server</li>
              <li><strong>Rate Limiting:</strong> Consider adding rate limiting middleware if not already present</li>
              <li><strong>HTTPS:</strong> Use a reverse proxy (nginx, Caddy) with SSL/TLS certificates</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Testing Guide */}
      <Section title="🧪 Testing Guide">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Testing Core Package</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Enter your API keys in the Configuration panel</li>
              <li>Enable Governance toggle</li>
              <li>Set budget limits (e.g., $1 per run, $10 per minute)</li>
              <li>Click "Test Gate & Policy Enforcement" in the Core Package card</li>
              <li>Verify the result shows success and budget tracking</li>
              <li>Try exceeding the budget limit to test enforcement</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Testing OpenAI Adapter</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Enter your OpenAI API key</li>
              <li>Select OpenAI as provider</li>
              <li>Enter a test message in the OpenAI Adapter card</li>
              <li>Click "Test OpenAI Adapter"</li>
              <li>Verify usage statistics are displayed correctly</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Testing Proxy Server</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Start the proxy server in another terminal (see Proxy Server setup above)</li>
              <li>Enter the proxy URL (default: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">http://localhost:8787</code>)</li>
              <li>Click "Check Health" to verify the server is running</li>
              <li>Enter a test message and click "Test Completions"</li>
              <li>Verify the response and check audit receipts in the configured directory</li>
            </ol>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Testing Multi-Provider Routing</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>Set both <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">OPENAI_API_KEY</code> and <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">GEMINI_API_KEY</code></li>
              <li>Test with <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">model: "gpt-4o-mini"</code> → should route to OpenAI</li>
              <li>Test with <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">model: "gemini-2.5-flash"</code> → should route to Gemini</li>
              <li>Test with <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">x-provider</code> header to override routing</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="🔧 Troubleshooting">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Common Issues</h4>
            
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h5 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">"Cannot connect to proxy"</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-800 dark:text-amber-300">
                <li>Make sure the proxy server is running: <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">pnpm --filter @aegis/proxy dev</code></li>
                <li>Check the port matches (default: 8787)</li>
                <li>Verify firewall/network settings allow connections</li>
                <li>Check proxy server logs for errors</li>
              </ul>
            </div>

            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <h5 className="font-semibold text-red-900 dark:text-red-300 mb-2">"Budget exceeded" errors</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-300">
                <li>Increase budget limits in Configuration panel</li>
                <li>Check per-run, per-minute, and per-day limits</li>
                <li>Verify governance is enabled (required for budget tracking)</li>
                <li>Check if hardStop is enabled in policy (stops immediately vs. soft limit)</li>
              </ul>
            </div>

            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">"Provider not allowed" or "Model not allowed"</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
                <li>Check that your model is in the allowlist</li>
                <li>Verify the provider matches your policy routing settings</li>
                <li>Ensure you have the required capability: <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-xs">llm:invoke</code></li>
              </ul>
            </div>

            <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">API key errors</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-purple-800 dark:text-purple-300">
                <li>Verify API keys are correctly entered (no extra spaces)</li>
                <li>Check that API keys are valid and have sufficient credits</li>
                <li>For proxy: Ensure environment variables are set correctly</li>
                <li>For demo: Check that keys are entered in Configuration panel</li>
              </ul>
            </div>

            <div className="mb-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-semibold text-green-900 dark:text-green-300 mb-2">Routing issues (wrong provider)</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800 dark:text-green-300">
                <li>Model names starting with <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">gemini-</code> automatically route to Gemini</li>
                <li>Use <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">x-provider</code> header to explicitly choose provider</li>
                <li>Check <code className="px-1 py-0.5 bg-green-100 dark:bg-green-900/30 rounded text-xs">AEGIS_DEFAULT_PROVIDER</code> environment variable</li>
                <li>Verify both API keys are set if using multi-provider</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Debugging Tips</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><strong>Check proxy health:</strong> Visit <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">http://localhost:8787/healthz</code></li>
              <li><strong>View audit receipts:</strong> Check the receipts directory configured in <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">AEGIS_AUDIT_DIR</code></li>
              <li><strong>Check server logs:</strong> Proxy server logs will show routing decisions and errors</li>
              <li><strong>Verify policy:</strong> Check that your policy JSON is valid and properly formatted</li>
              <li><strong>Test with curl:</strong> Use curl commands to test API endpoints directly</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* API Reference */}
      <Section title="📚 API Reference">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Proxy Endpoints</h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-2">POST /v1/chat/completions</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  OpenAI-compatible chat completions endpoint with governance.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-2"><strong>Required Headers:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <li><code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">x-tenant-id</code>: Tenant identifier</li>
                  <li><code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">x-run-id</code>: Run/session identifier</li>
                  <li><code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">x-provider</code>: Optional - "openai" or "gemini"</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold text-slate-900 dark:text-white mb-2">GET /healthz</h5>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Health check endpoint. Returns <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">{"{ \"status\": \"ok\" }"}</code>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Environment Variables Reference</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">Variable</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">Description</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">PORT</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Server port</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">8787</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">OPENAI_API_KEY</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">OpenAI API key</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">required</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">GEMINI_API_KEY</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Gemini API key</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">optional</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_DEFAULT_PROVIDER</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Default LLM provider</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"gemini"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_GOVERNANCE_ENABLED</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Enable governance</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"true"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_REQUIRE_TENANT_HEADER</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Require x-tenant-id header</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"true"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_STREAM_INCLUDE_USAGE</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Include usage in streams</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"true"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_AUDIT_DIR</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Audit receipts directory</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">".aegis/receipts"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_DEFAULT_POLICY_JSON</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Default policy JSON</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">optional</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_SIGNER_KEY_ID</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Key ID for receipt signing</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"local-k1"</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400 font-mono">AEGIS_SIGNER_SECRET_HEX</td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">Secret key for signing (hex)</td>
                    <td className="px-3 py-2 text-slate-500 dark:text-slate-500">"01020304"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}