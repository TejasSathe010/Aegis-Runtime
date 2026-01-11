import { useState } from 'react';

interface PainPoint {
  title: string;
  problem: string;
  solution: string;
  impact: string;
  metric: string;
}

const painPoints: PainPoint[] = [
  {
    title: 'Cost Overruns',
    problem: 'Without governance, a single developer can accidentally spend $10,000+ in minutes by calling expensive models in a loop.',
    solution: 'Aegis Runtime enforces hard budget stops at per-run, per-minute, and per-day levels, preventing overspending before it happens.',
    impact: 'Prevents 100% of budget overruns',
    metric: '$0 overspending incidents',
  },
  {
    title: 'No Access Control',
    problem: 'Anyone with API keys can use any model, regardless of permissions. A junior developer might use GPT-4 for simple tasks costing 10x more.',
    solution: 'Policy-based access control restricts models per tenant. Junior developers get gpt-4o-mini, senior developers get GPT-4.',
    impact: 'Reduces costs by 70-90%',
    metric: '70% cost reduction',
  },
  {
    title: 'Compliance Gaps',
    problem: 'Regulatory requirements demand audit trails, but most AI applications have no record of who called what model and when.',
    solution: 'Every operation generates a cryptographically signed receipt with full context, providing tamper-proof audit logs.',
    impact: '100% audit coverage',
    metric: '100% compliance',
  },
  {
    title: 'Provider Lock-in',
    problem: 'Switching from OpenAI to Gemini requires code changes across the entire application, making A/B testing expensive.',
    solution: 'Multi-provider routing with automatic failover. Switch providers via configuration, not code changes.',
    impact: 'Zero code changes needed',
    metric: '0 lines changed',
  },
  {
    title: 'No Real-time Visibility',
    problem: 'You only discover overspending when the monthly bill arrives. By then, it\'s too late to prevent it.',
    solution: 'Real-time budget tracking with live dashboards showing exactly how much budget remains at any moment.',
    impact: 'Real-time cost visibility',
    metric: '100% visibility',
  },
];

export default function PainPointsDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = painPoints[selectedIndex];

  return (
    <div className="card mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Real Pain Points Solved</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">See how Aegis Runtime solves critical production problems</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {painPoints.map((point, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedIndex === index
                  ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-300 dark:border-indigo-700 shadow-lg'
                  : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{point.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{point.problem}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  selectedIndex === index
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {point.metric}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900/50 dark:to-indigo-950/20 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-bold mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              The Problem
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{selected.problem}</p>
          </div>

          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              The Solution
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{selected.solution}</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Impact</div>
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{selected.impact}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Metric</div>
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{selected.metric}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
