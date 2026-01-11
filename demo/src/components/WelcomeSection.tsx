interface WelcomeSectionProps {
  onClose: () => void;
}

export default function WelcomeSection({ onClose }: WelcomeSectionProps) {
  return (
    <div className="card border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/80 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-purple-950/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome to Aegis Runtime Demo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Interactive testing platform
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              This interactive demo lets you test all features of Aegis Runtime in real-time. 
              Follow the simple steps below to explore policy enforcement, budget management, and audit logging.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            aria-label="Close welcome message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Step 1 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <span className="text-base font-bold text-white">1</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Configure</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Enter your API keys (OpenAI or Gemini) and configure your provider settings in the configuration panel. 
            This enables real API calls through the demo.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <span className="text-base font-bold text-white">2</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Test Features</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Use the demo cards below to test Core governance, OpenAI adapter, and Proxy server. 
            Each card demonstrates different capabilities of Aegis Runtime.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
              <span className="text-base font-bold text-white">3</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">See Results</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            View real-time results, usage statistics, budget tracking, and audit logs. 
            Everything updates instantly as you test different features.
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-5 border-2 border-amber-200/50 dark:border-amber-800/50 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-slate-900 dark:text-white mb-2">
              What is Aegis Runtime?
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Aegis Runtime provides production-ready governance, budget management, and audit logging 
              for AI/LLM applications. It enforces policies, tracks costs in real-time, and ensures compliance 
              while maintaining full observability of all AI operations. Perfect for enterprises requiring 
              control, visibility, and cost management of their AI infrastructure.
            </p>
          </div>
        </div>
      </div>
      </div>
      </div>
    );
  }
