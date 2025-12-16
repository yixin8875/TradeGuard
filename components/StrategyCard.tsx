import React from 'react';
import { Target, ShieldAlert, TrendingUp, DollarSign } from 'lucide-react';

export const StrategyCard: React.FC = () => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" />
        当前策略规则
      </h3>
      <div className="space-y-3">
        {/* Tier 1 */}
        <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border-l-4 border-red-500">
          <ShieldAlert className="w-5 h-5 text-red-400 mt-1 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-200">利润 &lt; 5%</p>
            <p className="text-xs text-slate-400">硬止损：入场价的 -5%。</p>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border-l-4 border-yellow-500">
          <DollarSign className="w-5 h-5 text-yellow-400 mt-1 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-200">5% &le; 利润 &lt; 10%</p>
            <p className="text-xs text-slate-400">保本或锁定微利 (1-2%)。</p>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border-l-4 border-blue-500">
          <TrendingUp className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-200">10% &le; 利润 &lt; 20%</p>
            <p className="text-xs text-slate-400">止盈。回撤利润的 1/2 作为止损缓冲 (止损 = 入场 + 50% 浮盈)。</p>
          </div>
        </div>

        {/* Tier 4 */}
        <div className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg border-l-4 border-green-500">
          <TrendingUp className="w-5 h-5 text-green-400 mt-1 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-slate-200">利润 &ge; 20%</p>
            <p className="text-xs text-slate-400">止盈。回撤利润的 30% 作为止损缓冲 (止损 = 入场 + 70% 浮盈)。</p>
          </div>
        </div>
      </div>
    </div>
  );
};