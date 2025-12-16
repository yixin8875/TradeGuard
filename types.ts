export interface StrategyTier {
  minProfitInfo: number; // e.g. 0.05 for 5%
  maxProfitInfo: number | null; // e.g. 0.10 for 10%, null for infinity
  description: string;
  calculateStopPrice: (entryPrice: number, highPrice: number) => number;
}

export interface TradeState {
  entryPrice: string;
  currentPrice: string;
  highestPrice: string;
}

export interface AnalysisResult {
  rawText: string;
  summary: string;
}