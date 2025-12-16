import React, { useState, useEffect, useMemo } from 'react';
import { Calculator as CalculatorIcon, ArrowRight, AlertTriangle, CheckCircle2, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { TradeState, StrategyTier } from '../types';

// Hardcoded Strategy Logic based on the user's image
const STRATEGY_TIERS: StrategyTier[] = [
  {
    minProfitInfo: 0.20,
    maxProfitInfo: null,
    description: "高利润区 (>20%)",
    // Rule: Use 30% profit to deal with oscillation. Keep 70%.
    calculateStopPrice: (entry, high) => {
      const profit = high - entry;
      return entry + (profit * 0.70); 
    }
  },
  {
    minProfitInfo: 0.10,
    maxProfitInfo: 0.20, // Handling the 10-15% rule (extending to 20 for continuity)
    description: "增长区 (10% - 20%)",
    // Rule: Use 1/2 to deal with oscillation. Keep 50%.
    calculateStopPrice: (entry, high) => {
      const profit = high - entry;
      return entry + (profit * 0.50);
    }
  },
  {
    minProfitInfo: 0.05,
    maxProfitInfo: 0.10,
    description: "保本区 (5% - 10%)",
    // Rule: Breakeven or 1-2% out. Let's aim for 1.5% profit lock or Breakeven if barely 5%.
    calculateStopPrice: (entry, high) => {
        // If closer to 5%, just Breakeven. If closer to 10%, lock 1.5%.
        const profitPercent = (high - entry) / entry;
        if (profitPercent > 0.07) return entry * 1.015;
        return entry * 1.005; // Slightly above breakeven to cover fees
    }
  },
  {
    minProfitInfo: -Infinity,
    maxProfitInfo: 0.05,
    description: "积累/风险区 (<5%)",
    // Rule: 5% Stop Loss
    calculateStopPrice: (entry, _high) => entry * 0.95
  }
];

export const Calculator: React.FC = () => {
  const [values, setValues] = useState<TradeState>({
    entryPrice: '',
    currentPrice: '',
    highestPrice: '',
  });

  const [result, setResult] = useState<{
    stopPrice: number;
    actionText: string;
    profitPercent: number;
    maxProfitPercent: number;
    statusColor: string;
    isStopped: boolean;
    positionAction: string; // New field for position sizing advice
    positionColor: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  // Sync highest price with current price if current > highest (user convenience)
  useEffect(() => {
    const curr = parseFloat(values.currentPrice);
    const high = parseFloat(values.highestPrice);
    if (!isNaN(curr) && (isNaN(high) || curr > high)) {
      setValues(prev => ({ ...prev, highestPrice: values.currentPrice }));
    }
  }, [values.currentPrice]);

  useEffect(() => {
    const entry = parseFloat(values.entryPrice);
    const current = parseFloat(values.currentPrice);
    const high = parseFloat(values.highestPrice);

    if (isNaN(entry) || isNaN(current) || isNaN(high) || entry === 0) {
      setResult(null);
      return;
    }

    const currentProfit = current - entry;
    const currentProfitPercent = currentProfit / entry;
    
    const maxProfit = high - entry;
    const maxProfitPercent = maxProfit / entry;

    // Find applicable tier based on HIGHEST price reached (Watermark principle)
    const tier = STRATEGY_TIERS.find(t => {
      if (t.maxProfitInfo === null) return maxProfitPercent >= t.minProfitInfo;
      return maxProfitPercent >= t.minProfitInfo && maxProfitPercent < t.maxProfitInfo;
    });

    if (tier) {
      const stopPrice = tier.calculateStopPrice(entry, high);
      
      let statusColor = "text-slate-400";
      if (maxProfitPercent < 0.05) statusColor = "text-red-400";
      else if (maxProfitPercent < 0.10) statusColor = "text-yellow-400";
      else if (maxProfitPercent < 0.20) statusColor = "text-blue-400";
      else statusColor = "text-green-400";

      const isStopped = current < stopPrice;
      let actionText = tier.description;
      if (isStopped) {
          actionText = "触发止损 (STOP LOSS TRIGGERED)";
          statusColor = "text-red-600 font-bold";
      }

      // Determine Position Action (Full vs Half)
      let positionAction = "全仓持有";
      let positionColor = "text-slate-300";

      if (isStopped) {
        positionAction = "卖出全部 (100%)";
        positionColor = "text-red-500 font-bold";
      } else {
        if (maxProfitPercent >= 0.10) {
          positionAction = "建议止盈一半 (50%)，剩余持仓";
          positionColor = "text-indigo-400 font-bold";
        } else {
          positionAction = "全仓持有 (100%)";
          positionColor = "text-emerald-400 font-bold";
        }
      }

      setResult({
        stopPrice,
        actionText,
        profitPercent: currentProfitPercent,
        maxProfitPercent,
        statusColor,
        isStopped,
        positionAction,
        positionColor
      });
    }
  }, [values]);

  const chartData = useMemo(() => {
    if (!result || !values.entryPrice) return [];
    const entry = parseFloat(values.entryPrice);
    const stop = result.stopPrice;
    const current = parseFloat(values.currentPrice);
    
    // Create a distribution for the pie chart: Risk, Locked Profit, Potential Upside
    const locked = Math.max(0, stop - entry);
    const risk = Math.max(0, entry - stop); // If stop is below entry
    const openProfit = Math.max(0, current - stop); // Profit above stop loss

    return [
      { name: '已锁定利润', value: locked, color: '#4ade80' }, // Green
      { name: '风险 / 本金', value: Math.max(0, entry - risk), color: '#334155' }, // Slate
      { name: '风险敞口', value: risk, color: '#ef4444' }, // Red
      { name: '浮动利润', value: openProfit, color: '#60a5fa' }, // Blue
    ].filter(d => d.value > 0);
  }, [result, values]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg h-full">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <CalculatorIcon className="w-5 h-5 text-indigo-400" />
        策略计算器
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">入场价格</label>
          <input
            type="number"
            name="entryPrice"
            value={values.entryPrice}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">当前价格</label>
          <input
            type="number"
            name="currentPrice"
            value={values.currentPrice}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">最高触达价格</label>
          <input
            type="number"
            name="highestPrice"
            value={values.highestPrice}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Block */}
            <div className="bg-slate-900 rounded-lg p-4 space-y-4">
              {/* Position Action Card - Highlighted */}
              <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 mb-4">
                 <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">操作建议</span>
                 </div>
                 <div className={`text-lg ${result.positionColor}`}>
                    {result.positionAction}
                 </div>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">当前盈亏</span>
                <span className={`text-lg font-mono font-bold ${result.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(result.profitPercent * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">最高盈亏</span>
                <span className="text-lg font-mono font-bold text-slate-200">
                  {(result.maxProfitPercent * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">建议止损价格 (触发后全部卖出)</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-indigo-400 font-mono">
                    {result.stopPrice.toFixed(2)}
                  </span>
                  {result.isStopped ? (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/50 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 已触发
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/50 flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> 监控中
                    </span>
                  )}
                </div>
              </div>

               <div className="pt-2">
                 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">状态详情</p>
                 <p className={`text-md font-medium ${result.statusColor}`}>
                   {result.actionText}
                 </p>
               </div>
            </div>

            {/* Visual Block */}
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => value.toFixed(2)}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{fontSize: '10px'}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-xs text-slate-500 block">风险/回报</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-lg bg-slate-800/50">
          <p className="text-slate-500 text-sm flex items-center">
            输入交易详情以计算 <ArrowRight className="w-4 h-4 ml-2" />
          </p>
        </div>
      )}
    </div>
  );
};