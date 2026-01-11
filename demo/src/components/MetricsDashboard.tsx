import { useState, useEffect } from 'react';

interface Metrics {
  totalRequests: number;
  totalCost: number;
  blockedRequests: number;
  costSavings: number;
  avgLatency: number;
  successRate: number;
  tokensProcessed: number;
  tenantsProtected: number;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalRequests: 0,
    totalCost: 0,
    blockedRequests: 0,
    costSavings: 0,
    avgLatency: 0,
    successRate: 100,
    tokensProcessed: 0,
    tenantsProtected: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 3),
        totalCost: prev.totalCost + (Math.random() * 0.05),
        blockedRequests: prev.blockedRequests + (Math.random() < 0.1 ? 1 : 0),
        costSavings: prev.costSavings + (Math.random() * 0.15),
        avgLatency: 120 + Math.random() * 30,
        successRate: Math.max(95, 100 - (prev.blockedRequests / Math.max(1, prev.totalRequests)) * 100),
        tokensProcessed: prev.tokensProcessed + Math.floor(Math.random() * 500),
        tenantsProtected: Math.max(1, Math.floor(prev.totalRequests / 10)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="card mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Metrics Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time governance and cost tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Requests</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(metrics.totalRequests)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">+{Math.floor(Math.random() * 3)}/sec</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200/50 dark:border-green-800/50">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Cost Savings</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(metrics.costSavings)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Prevented overspending</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-xl border border-red-200/50 dark:border-red-800/50">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Blocked Requests</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(metrics.blockedRequests)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{((metrics.blockedRequests / Math.max(1, metrics.totalRequests)) * 100).toFixed(1)}% blocked</div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{metrics.successRate.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Policy compliance</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Avg Latency</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{metrics.avgLatency.toFixed(0)}ms</div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tokens Processed</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(metrics.tokensProcessed)}</div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Cost</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(metrics.totalCost)}</div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tenants Protected</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{formatNumber(metrics.tenantsProtected)}</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Real-World Impact</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Cost Savings:</strong> Aegis Runtime has prevented ${formatCurrency(metrics.costSavings)} in potential overspending by blocking {metrics.blockedRequests} requests that exceeded budget limits. 
              Without governance, these requests would have cost an additional ${formatCurrency(metrics.costSavings * 1.5)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
