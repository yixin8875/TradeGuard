import React, { useState } from 'react';
import { Bot, Upload, Loader2, Key } from 'lucide-react';
import { analyzeStrategyImage } from '../services/geminiService';

export const AIAnalyzer: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!apiKey) {
      setError("请先输入您的 Gemini API 密钥。");
      return;
    }

    // Reset state
    setError(null);
    setAnalysis(null);
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setPreview(base64);

      try {
        const result = await analyzeStrategyImage(base64, apiKey);
        setAnalysis(result);
      } catch (err: any) {
        setError(err.message || "分析图片失败");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-fuchsia-400" />
        分析新策略
      </h3>
      
      <p className="text-sm text-slate-400 mb-6">
        有新的策略截图？上传图片，让 Gemini AI 解析规则。
      </p>

      <div className="space-y-4">
        {/* API Key Input */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
             <Key className="w-3 h-3" /> Gemini API 密钥
          </label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="粘贴您的 Google GenAI 密钥"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
          />
        </div>

        {/* File Upload */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="strategy-upload"
            disabled={!apiKey || isAnalyzing}
          />
          <label 
            htmlFor="strategy-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${!apiKey ? 'border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed' : 'border-slate-600 hover:border-fuchsia-400 bg-slate-900/50'}
            `}
          >
            {isAnalyzing ? (
              <div className="flex flex-col items-center text-fuchsia-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm">正在分析逻辑...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-400 hover:text-white transition-colors">
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">点击上传截图</span>
              </div>
            )}
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {analysis && (
          <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-4 mb-4 items-start">
               {preview && (
                 <img src={preview} alt="Strategy" className="w-20 h-20 object-cover rounded border border-slate-600" />
               )}
               <div className="flex-1">
                 <h4 className="text-fuchsia-400 font-bold text-sm mb-1">AI 分析结果</h4>
                 <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                    <pre className="whitespace-pre-wrap font-sans text-sm bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                      {analysis}
                    </pre>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};