import React from 'react';
import { Calculator } from './components/Calculator';
import { StrategyCard } from './components/StrategyCard';
import { LineChart } from 'lucide-react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TradeGuard
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            v1.0.0
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">仓位管理</h2>
          <p className="text-slate-400 max-w-2xl">
            输入入场价和最高价，根据分层策略规则计算动态止损。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column: Calculator */}
          <div className="lg:col-span-8 space-y-8">
            <Calculator />
          </div>

          {/* Sidebar: Strategy Reference */}
          <div className="lg:col-span-4 space-y-8">
            <StrategyCard />
            
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">使用说明</h4>
              <ul className="space-y-2 text-sm text-slate-400 list-disc pl-4 marker:text-indigo-500">
                <li>首先输入您的<strong>入场价格</strong>。</li>
                <li><strong>最高触达价格</strong>是这笔交易的“高水位线”，决定了适用哪一档规则。</li>
                <li><strong>当前价格</strong>用于计算实时盈亏并检查是否触及止损。</li>
                <li>图表可视化了您的已锁定利润（绿色）与风险（红色）。</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;