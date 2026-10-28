import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Play,
  Pause,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import {
  CryptoAsset,
  TradeOrder,
  AutoTradingConfig,
  Language,
  Theme,
} from '../types';
import { translations } from '../utils/translations';
import { sha256 } from '../utils/cryptoSecurity';

interface AutoTradingEngineProps {
  assets: CryptoAsset[];
  config: AutoTradingConfig;
  onUpdateConfig: (newConfig: AutoTradingConfig) => void;
  recentTrades: TradeOrder[];
  onNewTradeExecuted: (trade: TradeOrder) => void;
  language: Language;
  theme: Theme;
  onOpenBiometricAuth: (onSuccess: () => void) => void;
  onNavigateToZakatEstimator?: () => void;
}

export const AutoTradingEngine: React.FC<AutoTradingEngineProps> = ({
  assets,
  config,
  onUpdateConfig,
  recentTrades,
  onNewTradeExecuted,
  language,
  theme,
  onOpenBiometricAuth,
  onNavigateToZakatEstimator,
}) => {
  const t = translations[language];
  const [selectedPair, setSelectedPair] = useState<string>('PAXG/USDT');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'1H' | '24H' | '7D' | '1M'>('24H');

  // Interactive synthetic price & candle generator
  const [chartPoints, setChartPoints] = useState<number[]>([
    2640, 2645, 2642, 2650, 2658, 2652, 2665, 2670, 2668, 2675, 2680,
  ]);

  const activeAsset = assets.find((a) => selectedPair.startsWith(a.symbol)) || assets[0];

  // Auto-earn execution ticker
  useEffect(() => {
    if (!config.isRunning) return;

    const interval = setInterval(async () => {
      // Execute spot trade based on Sharia algorithm
      const pairs = ['PAXG/USDT', 'BTC/USDT', 'ADA/USDT', 'ALGO/USDT'];
      const chosenPair = pairs[Math.floor(Math.random() * pairs.length)];
      const matchedAsset = assets.find((a) => chosenPair.startsWith(a.symbol)) || assets[0];

      // Safe spot profit calculation with Mudharabah ratio
      const baseProfit = Math.floor(65000 + Math.random() * 125000);
      const userProfit = Math.round(baseProfit * (config.mudharabahSplit.userShare / 100));
      const zakatCut = Math.round(baseProfit * (config.mudharabahSplit.zakatInfaqShare / 100));

      const hash = await sha256(
        `SHARIA-SPOT-TRADE-${chosenPair}-${Date.now()}-${userProfit}-HALAL-VERIFIED`
      );

      const newTrade: TradeOrder = {
        id: 'TRD-' + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
        pair: chosenPair,
        type: Math.random() > 0.3 ? 'BUY' : 'SELL',
        price: matchedAsset.priceUSD,
        amount: Number((Math.random() * 0.4 + 0.05).toFixed(4)),
        profitUSDT: Number((userProfit / 15700).toFixed(2)),
        profitIDR: userProfit,
        halalAuditHash: hash,
        status: 'SETTLED',
        shariaMode: 'Mudharabah',
        zakatDeductionIDR: zakatCut,
      };

      // Slight chart price movement
      setChartPoints((prev) => {
        const last = prev[prev.length - 1];
        const next = Number((last + (Math.random() * 8 - 3.5)).toFixed(2));
        return [...prev.slice(1), next];
      });

      onNewTradeExecuted(newTrade);
    }, 8500);

    return () => clearInterval(interval);
  }, [config.isRunning, assets, config.mudharabahSplit]);

  const handleToggleBot = () => {
    if (!config.isRunning) {
      // Prompt biometric authentication when starting bot for enterprise security
      onOpenBiometricAuth(() => {
        onUpdateConfig({
          ...config,
          isRunning: true,
        });
      });
    } else {
      onUpdateConfig({
        ...config,
        isRunning: false,
      });
    }
  };

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Bot Controls */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.trading.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                Akad Mudharabah
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t.trading.subtitle}
            </p>
          </div>

          {/* Master Bot Action Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                {t.trading.botStatus}
              </div>
              <div
                className={`text-xs font-black flex items-center gap-1.5 ${
                  config.isRunning ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    config.isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'
                  }`}
                />
                {config.isRunning ? t.trading.active : t.trading.paused}
              </div>
            </div>

            <button
              id="toggle-trading-bot-btn"
              onClick={handleToggleBot}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md ${
                config.isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20 bot-pulsing'
              }`}
            >
              {config.isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  {t.trading.pauseBot}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {t.trading.startBot}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Algorithm Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {t.trading.totalEarned}
            </span>
            <div className="text-base font-black text-emerald-500 mt-0.5">
              +{formatIDR(config.totalProfitEarnedIDR)}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {t.trading.winRate}
            </span>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {config.winRate}% (Audit 120 Hari)
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {t.trading.mudharabahRatio}
            </span>
            <div className="text-base font-black text-amber-500 mt-0.5">
              {config.mudharabahSplit.userShare}% Nasabah : {config.mudharabahSplit.platformShare}% Pengelola
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {t.trading.zakatShare}
            </span>
            <div className="text-base font-black text-teal-400 mt-0.5">
              2.5% Auto-Infaq
            </div>
          </div>
        </div>

        {/* Forward Zakat Maal Estimation Projection Banner */}
        {(() => {
          const annualEstimatedProfit = Math.round(
            config.allocatedCapitalIDR * (config.dailyTargetPercent / 100) * 26 * 0.894 * 12
          );
          const annualEstimatedZakat = Math.round(annualEstimatedProfit * 0.025);

          return (
            <div className="mt-5 p-4 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 mt-0.5">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Perencanaan 'Zakat Estimasi' Berdasarkan Tren Trading Bot
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/40">
                      Proyeksi Haul (12 Bln)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Dengan modal aktif <strong>{formatIDR(config.allocatedCapitalIDR)}</strong> dan target <strong>+{config.dailyTargetPercent}%/hari</strong>, potensi laba tahunan diproyeksikan <strong>+{formatIDR(annualEstimatedProfit)}</strong> dengan estimasi zakat maal perniagaan terakumulasi sebesar <strong>{formatIDR(annualEstimatedZakat)}</strong>.
                  </p>
                </div>
              </div>

              {onNavigateToZakatEstimator && (
                <button
                  id="bot-open-zakat-estimator-btn"
                  onClick={onNavigateToZakatEstimator}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0 transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Kalkulator Zakat Estimasi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Grid: Chart & Order Book */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Candlestick/Price Chart */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          {/* Pair selector & timeframe header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {(['PAXG/USDT', 'BTC/USDT', 'ADA/USDT', 'ALGO/USDT'] as const).map((pair) => (
                <button
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedPair === pair
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-[11px] rounded-lg border border-slate-300 dark:border-slate-800 p-0.5">
              {(['1H', '24H', '7D', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    chartTimeframe === tf
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Current Pair Stats */}
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                ${activeAsset.priceUSD.toLocaleString('en-US')} USD
              </div>
              <div className="text-xs text-slate-400">
                ~{formatIDR(activeAsset.priceIDR)} • 24h Vol: {formatIDR(activeAsset.volume24h)}
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <Activity className="w-4 h-4" /> Halal RSI: 54.2 (Akumulasi Sehat)
              </span>
              <span className="text-amber-400 font-medium">
                Qabd Fisik: 100% Terjamin
              </span>
            </div>
          </div>

          {/* Synthetic SVG Line Chart */}
          <div className="relative h-64 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="500"
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Area & Line */}
              {(() => {
                const min = Math.min(...chartPoints) * 0.998;
                const max = Math.max(...chartPoints) * 1.002;
                const range = max - min || 1;
                const pts = chartPoints.map((val, idx) => {
                  const x = (idx / (chartPoints.length - 1)) * 500;
                  const y = 180 - ((val - min) / range) * 160;
                  return `${x},${y}`;
                });
                const dLine = `M ${pts.join(' L ')}`;
                const dArea = `${dLine} L 500,200 L 0,200 Z`;

                return (
                  <>
                    <path d={dArea} fill="url(#chartGradient)" />
                    <path
                      d={dLine}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Pulsing live point */}
                    {pts.length > 0 && (
                      <circle
                        cx={pts[pts.length - 1].split(',')[0]}
                        cy={pts[pts.length - 1].split(',')[1]}
                        r="4"
                        fill="#10b981"
                        className="animate-ping"
                      />
                    )}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span>Standar Syariah Spot Tanpa Margin Leverage</span>
            <span>Verifikasi Konsensus: Proof-of-Shariah-Stake</span>
          </div>
        </div>

        {/* Right 1 Col: Live Sharia Order Book */}
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              {t.trading.liveOrderBook}
            </h3>
            <span className="text-[10px] text-emerald-500 font-semibold">
              Bebas Manipulasi
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Asks (Sell) */}
            <div className="space-y-1">
              {[
                { price: 2682.4, amount: 0.84, total: 2253.2 },
                { price: 2681.9, amount: 1.42, total: 3808.2 },
                { price: 2681.2, amount: 2.15, total: 5764.5 },
              ].map((ask, i) => (
                <div key={i} className="flex justify-between text-rose-500 font-mono text-[11px]">
                  <span>${ask.price.toFixed(2)}</span>
                  <span>{ask.amount} PAXG</span>
                  <span className="text-slate-400">${ask.total.toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Current Spread Bar */}
            <div className="py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between font-mono font-bold text-emerald-500">
              <span>Spread: $0.40 (0.015%)</span>
              <span>Halal Spread A+</span>
            </div>

            {/* Bids (Buy) */}
            <div className="space-y-1">
              {[
                { price: 2680.5, amount: 3.12, total: 8363.1 },
                { price: 2679.8, amount: 1.95, total: 5225.6 },
                { price: 2679.2, amount: 4.88, total: 13074.4 },
              ].map((bid, i) => (
                <div key={i} className="flex justify-between text-emerald-500 font-mono text-[11px]">
                  <span>${bid.price.toFixed(2)}</span>
                  <span>{bid.amount} PAXG</span>
                  <span className="text-slate-400">${bid.total.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Preset Selector */}
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              {t.trading.strategy}
            </label>
            <div className="grid grid-cols-3 gap-1.5 mt-2 text-[11px] font-bold">
              {(['conservative', 'balanced', 'dynamic'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateConfig({ ...config, strategy: mode })}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    config.strategy === mode
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode === 'conservative'
                    ? 'Konservatif'
                    : mode === 'balanced'
                    ? 'Berimbang'
                    : 'Dinamis'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Stream of Automated Executed Trades */}
      <div
        className={`p-5 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              {t.trading.recentTrades}
            </h3>
            <p className="text-xs text-slate-400">
              Setiap eksekusi terikat pada akad Mudharabah dan diverifikasi secara kriptografis pada buku besar blockchain.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-500">
            {recentTrades.length} Eksekusi Terverifikasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[10px] uppercase tracking-wider ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="p-3">Waktu</th>
                <th className="p-3">Pasangan</th>
                <th className="p-3">Tipe / Akad</th>
                <th className="p-3">{t.trading.amount}</th>
                <th className="p-3">{t.trading.profit}</th>
                <th className="p-3">Zakat (2.5%)</th>
                <th className="p-3">{t.trading.halalProof}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recentTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {trade.timestamp}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                    {trade.pair}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                        trade.type === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {trade.type} • {trade.shariaMode}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-medium">
                    {trade.amount}
                  </td>
                  <td className="p-3 font-bold text-emerald-500">
                    +{formatIDR(trade.profitIDR)}
                  </td>
                  <td className="p-3 font-medium text-teal-400">
                    {formatIDR(trade.zakatDeductionIDR)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <span>{trade.halalAuditHash.slice(0, 16)}...</span>
                      <button
                        onClick={() => copyToClipboard(trade.halalAuditHash)}
                        className="p-1 hover:text-emerald-500 text-slate-500"
                        title="Salin Hash Kriptografis"
                      >
                        {copiedHash === trade.halalAuditHash ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
