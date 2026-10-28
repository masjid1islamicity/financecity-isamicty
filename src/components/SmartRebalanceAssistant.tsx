import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Scale,
  Zap,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Layers,
  Award,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CryptoAsset, Language, Theme, TradeOrder } from '../types';
import { formatRupiah, formatRupiahCompact } from '../utils/shariaWealthProjectionEngine';

export type RebalanceStrategyPreset = 'aaoifi_benchmark' | 'inflation_shield' | 'green_esg';

export interface RebalanceItemPlan {
  symbol: string;
  name: string;
  icon: string;
  category: string;
  currentWeightPct: number;
  targetWeightPct: number;
  currentValueIDR: number;
  targetValueIDR: number;
  deltaIDR: number; // positive = BUY, negative = SELL
  deltaUnits: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  priceIDR: number;
  shariaNote: string;
}

interface SmartRebalanceAssistantProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR?: number;
  currentHealthScore?: number;
  theme: Theme;
  language: Language;
  onExecuteTrades?: (trades: TradeOrder[]) => void;
  onRequestBiometric?: (onSuccess: () => void, title?: string) => void;
  onOpenAuditPdf?: () => void;
}

export const SmartRebalanceAssistant: React.FC<SmartRebalanceAssistantProps> = ({
  assets,
  totalBalanceIDR = 348250000,
  zakatReserveIDR = 8706250,
  currentHealthScore = 96,
  theme,
  language,
  onExecuteTrades,
  onRequestBiometric,
  onOpenAuditPdf,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<RebalanceStrategyPreset>('aaoifi_benchmark');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStep, setExecutionStep] = useState<string>('');
  const [executedReceipt, setExecutedReceipt] = useState<{
    txHash: string;
    timestamp: string;
    orders: TradeOrder[];
    newScore: number;
  } | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState<boolean>(true);
  const [requireBiometric, setRequireBiometric] = useState<boolean>(false);

  // Strategy target allocations
  const strategyTargets = useMemo<Record<RebalanceStrategyPreset, { title: string; desc: string; weights: Record<string, number> }>>(() => {
    return {
      aaoifi_benchmark: {
        title: 'Standar Kelembagaan AAOIFI & DSN-MUI',
        desc: 'Komposisi ideal berimbang antara emas fisik (35%), store of value BTC (30%), dan utilitas PoS (35%).',
        weights: {
          PAXG: 35,
          BTC: 30,
          ETH: 18,
          ADA: 10,
          ALGO: 7,
        },
      },
      inflation_shield: {
        title: 'Perisai Inflasi Maksimal (Emas Fisik 45%)',
        desc: 'Memaksimalkan perlindungan modal terhadap depresiasi fiat dengan dominasi emas murni Brinks London.',
        weights: {
          PAXG: 45,
          BTC: 25,
          ETH: 15,
          ADA: 10,
          ALGO: 5,
        },
      },
      green_esg: {
        title: 'Pertumbuhan Hijau & ESG Syariah',
        desc: 'Fokus pada konsensus Proof-of-Stake netral karbon selaras dengan Maqasid Hifzh al-Bi’ah.',
        weights: {
          PAXG: 30,
          BTC: 25,
          ETH: 20,
          ADA: 15,
          ALGO: 10,
        },
      },
    };
  }, []);

  // Compute Current Asset Weights vs Targets
  // Baseline simulated current distribution: PAXG: 30%, BTC: 36%, ETH: 17%, ADA: 9%, ALGO: 8%
  const currentWeights: Record<string, number> = {
    PAXG: 30,
    BTC: 36,
    ETH: 17,
    ADA: 9,
    ALGO: 8,
  };

  const currentPrices: Record<string, number> = {
    PAXG: assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000,
    BTC: assets.find((a) => a.symbol === 'BTC')?.priceIDR || 1485000000,
    ETH: assets.find((a) => a.symbol === 'ETH')?.priceIDR || 54200000,
    ADA: assets.find((a) => a.symbol === 'ADA')?.priceIDR || 15400,
    ALGO: assets.find((a) => a.symbol === 'ALGO')?.priceIDR || 6250,
  };

  // Helper to determine action type
  const getAction = (target: number, current: number): 'BUY' | 'SELL' | 'HOLD' => {
    if (target > current) return 'BUY';
    if (target < current) return 'SELL';
    return 'HOLD';
  };

  // Build Rebalance Plan
  const planItems: RebalanceItemPlan[] = useMemo(() => {
    const targetSet = strategyTargets[selectedStrategy].weights;

    return [
      {
        symbol: 'PAXG',
        name: 'PAX Gold (Emas Fisik LBMA)',
        icon: '🥇',
        category: 'Emas Fisik Bersertifikat',
        currentWeightPct: currentWeights['PAXG'],
        targetWeightPct: targetSet['PAXG'],
        currentValueIDR: totalBalanceIDR * (currentWeights['PAXG'] / 100),
        targetValueIDR: totalBalanceIDR * (targetSet['PAXG'] / 100),
        deltaIDR: totalBalanceIDR * ((targetSet['PAXG'] - currentWeights['PAXG']) / 100),
        deltaUnits: 0,
        action: getAction(targetSet['PAXG'], currentWeights['PAXG']),
        priceIDR: currentPrices['PAXG'],
        shariaNote: 'Akad Bai’ as-Sarf Spot dengan emas fisik 99.99%',
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin (Sil’ah Mal Mutaqawwim)',
        icon: '💎',
        category: 'Komoditas Digital Spot',
        currentWeightPct: currentWeights['BTC'],
        targetWeightPct: targetSet['BTC'],
        currentValueIDR: totalBalanceIDR * (currentWeights['BTC'] / 100),
        targetValueIDR: totalBalanceIDR * (targetSet['BTC'] / 100),
        deltaIDR: totalBalanceIDR * ((targetSet['BTC'] - currentWeights['BTC']) / 100),
        deltaUnits: 0,
        action: getAction(targetSet['BTC'], currentWeights['BTC']),
        priceIDR: currentPrices['BTC'],
        shariaNote: 'Penyesuaian porsi untuk mematuhi batas konsentrasi <40%',
      },
      {
        symbol: 'ETH',
        name: 'Ethereum (PoS Gas Utility)',
        icon: '⚡',
        category: 'Ijarah Jasa Komputasi',
        currentWeightPct: currentWeights['ETH'],
        targetWeightPct: targetSet['ETH'],
        currentValueIDR: totalBalanceIDR * (currentWeights['ETH'] / 100),
        targetValueIDR: totalBalanceIDR * (targetSet['ETH'] / 100),
        deltaIDR: totalBalanceIDR * ((targetSet['ETH'] - currentWeights['ETH']) / 100),
        deltaUnits: 0,
        action: getAction(targetSet['ETH'], currentWeights['ETH']),
        priceIDR: currentPrices['ETH'],
        shariaNote: 'Konsensus Proof-of-Stake bebas Riba & staking halal',
      },
      {
        symbol: 'ADA',
        name: 'Cardano (Green PoS)',
        icon: '🌿',
        category: 'Riset Konsensus Akademis',
        currentWeightPct: currentWeights['ADA'],
        targetWeightPct: targetSet['ADA'],
        currentValueIDR: totalBalanceIDR * (currentWeights['ADA'] / 100),
        targetValueIDR: totalBalanceIDR * (targetSet['ADA'] / 100),
        deltaIDR: totalBalanceIDR * ((targetSet['ADA'] - currentWeights['ADA']) / 100),
        deltaUnits: 0,
        action: getAction(targetSet['ADA'], currentWeights['ADA']),
        priceIDR: currentPrices['ADA'],
        shariaNote: 'Protokol netral karbon ramah lingkungan',
      },
      {
        symbol: 'ALGO',
        name: 'Algorand (Green Sukuk Standard)',
        icon: '🕌',
        category: 'Infrastruktur FinTech Net-Zero',
        currentWeightPct: currentWeights['ALGO'],
        targetWeightPct: targetSet['ALGO'],
        currentValueIDR: totalBalanceIDR * (currentWeights['ALGO'] / 100),
        targetValueIDR: totalBalanceIDR * (targetSet['ALGO'] / 100),
        deltaIDR: totalBalanceIDR * ((targetSet['ALGO'] - currentWeights['ALGO']) / 100),
        deltaUnits: 0,
        action: getAction(targetSet['ALGO'], currentWeights['ALGO']),
        priceIDR: currentPrices['ALGO'],
        shariaNote: 'Finalitas instan tanpa risiko hard fork spekulatif',
      },
    ].map((item) => ({
      ...item,
      deltaUnits: Math.abs(Number((item.deltaIDR / item.priceIDR).toFixed(6))),
    }));
  }, [selectedStrategy, totalBalanceIDR, strategyTargets, currentPrices]);

  // Aggregate buy and sell totals
  const totalSellVolumeIDR = useMemo(() => {
    return planItems
      .filter((i) => i.action === 'SELL')
      .reduce((acc, curr) => acc + Math.abs(curr.deltaIDR), 0);
  }, [planItems]);

  const totalBuyVolumeIDR = useMemo(() => {
    return planItems
      .filter((i) => i.action === 'BUY')
      .reduce((acc, curr) => acc + curr.deltaIDR, 0);
  }, [planItems]);

  const projectedScore = useMemo(() => {
    return selectedStrategy === 'aaoifi_benchmark' ? 99 : 98;
  }, [selectedStrategy]);

  // Execute Rebalancing Action
  const executeRebalance = async () => {
    setIsExecuting(true);
    setExecutionStep('Memvalidasi kepatuhan akad Fiqh Muamalah...');

    const runSteps = async () => {
      await new Promise((r) => setTimeout(r, 600));
      setExecutionStep('Mengunci harga spot bursa tanpa biaya swap Riba...');
      await new Promise((r) => setTimeout(r, 700));
      setExecutionStep('Mengeksekusi bundling transaksi spot fisik (Taqabudh)...');
      await new Promise((r) => setTimeout(r, 800));
      setExecutionStep('Mencatat bukti audit kriptografis ke Ledger Blockchain...');
      await new Promise((r) => setTimeout(r, 500));

      const now = new Date();
      const txHash = '0xREBAL' + Math.floor(1000000000 + Math.random() * 9000000000).toString(16);

      const generatedOrders: TradeOrder[] = planItems
        .filter((item) => item.action !== 'HOLD')
        .map((item, index) => ({
          id: `ORD-REBAL-${Date.now()}-${index + 1}`,
          timestamp: now.toLocaleTimeString('id-ID', { hour12: false }),
          pair: `${item.symbol}/IDR`,
          type: item.action as 'BUY' | 'SELL',
          price: item.priceIDR,
          amount: item.deltaUnits,
          profitUSDT: 0,
          profitIDR: 0,
          halalAuditHash: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, '0')).join(''),
          status: 'EXECUTED',
          shariaMode: 'Mudharabah',
          zakatDeductionIDR: 0,
        }));

      if (onExecuteTrades) {
        onExecuteTrades(generatedOrders);
      }

      setExecutedReceipt({
        txHash,
        timestamp: now.toLocaleString('id-ID'),
        orders: generatedOrders,
        newScore: projectedScore,
      });

      setIsExecuting(false);
      setExecutionStep('');

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#f59e0b', '#06b6d4'],
        });
      } catch (err) {
        // ignore
      }
    };

    if (requireBiometric && onRequestBiometric) {
      onRequestBiometric(() => {
        runSteps();
      }, 'Otorisasi Biometrik Smart Rebalancing');
    } else {
      runSteps();
    }
  };

  return (
    <div
      id="smart-rebalance-assistant-card"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Smart Rebalance Assistant (1-Klik Otomatis)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI Sharia Optimizer
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Menganalisis deviasi bobot aset dari Portfolio Health Index dan mengeksekusi serangkaian
              transaksi spot halal secara otomatis tanpa bunga swap (*Zero Riba*) untuk memaksimalkan diversifikasi.
            </p>
          </div>

          {/* Health Index Delta Pill */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 self-start md:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Skor Kesehatan</div>
              <div className="flex items-center gap-1.5 font-black text-sm">
                <span className="text-slate-300">{currentHealthScore}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">{projectedScore}/100</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              +3 Pts
            </span>
          </div>
        </div>

        {/* Strategy Presets Selector */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pilih Model Alokasi Sasaran Rebalancing:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(Object.keys(strategyTargets) as RebalanceStrategyPreset[]).map((stratKey) => {
              const item = strategyTargets[stratKey];
              const isSelected = selectedStrategy === stratKey;
              return (
                <button
                  key={stratKey}
                  onClick={() => setSelectedStrategy(stratKey)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>{item.title}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rebalance Plan Preview Table / Grid */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Rencana Penyeimbangan Aset (Bundled Spot Orders)
            </h4>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="text-slate-400">
              Total Realokasi: <span className="font-bold text-slate-100">{formatRupiah(totalBuyVolumeIDR)}</span>
            </div>
            <button
              onClick={() => setShowPlanDetails(!showPlanDetails)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-[11px]"
            >
              <span>{showPlanDetails ? 'Sembunyikan Rincian' : 'Tampilkan Rincian'}</span>
              {showPlanDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Detailed Comparison Cards */}
        {showPlanDetails && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {planItems.map((item) => {
              const isBuy = item.action === 'BUY';
              const isSell = item.action === 'SELL';
              const deltaPct = item.targetWeightPct - item.currentWeightPct;

              return (
                <div
                  key={item.symbol}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isBuy
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isSell
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-100">
                      <span>{item.icon}</span>
                      <span>{item.symbol}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isSell
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isBuy ? '🔺 BELI SPOT' : isSell ? '🔻 JUAL SPOT' : 'TERJAGA'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">{item.name}</div>

                  {/* Weight progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Saat Ini: {item.currentWeightPct}%</span>
                      <span className="font-bold text-slate-200">Target: {item.targetWeightPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                      <div
                        className="bg-slate-400 h-full"
                        style={{ width: `${Math.min(100, item.currentWeightPct * 2)}%` }}
                      />
                      <div
                        className={`${isBuy ? 'bg-emerald-400' : 'bg-amber-400'} h-full`}
                        style={{ width: `${Math.min(100, Math.abs(deltaPct) * 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* Transaction amount */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-slate-400">Nominal:</span>
                    <span
                      className={`font-bold ${
                        isBuy ? 'text-emerald-400' : isSell ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {isBuy ? '+' : isSell ? '-' : ''}
                      {formatRupiahCompact(Math.abs(item.deltaIDR))}
                    </span>
                  </div>

                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                    {item.deltaUnits} {item.symbol} @ {formatRupiahCompact(item.priceIDR)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Sharia Principles Safeguard Banner */}
        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Scale className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-200">Jaminan Kepatuhan Syariah 100%</div>
              <div className="text-[11px] text-slate-400">
                Eksekusi Spot fisik langsung (*Taqabudh*), bebas bunga leverage/margin (*Zero Riba*),
                dan cadangan Zakat Maal (Rp {zakatReserveIDR.toLocaleString('id-ID')}) tetap terlindungi secara terpisah.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={requireBiometric}
                onChange={(e) => setRequireBiometric(e.target.checked)}
                className="rounded border-slate-700 accent-emerald-500"
              />
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Verifikasi Biometrik</span>
            </label>
          </div>
        </div>

        {/* Execution Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Estimasi Eksekusi: Instan (&lt;3 detik) • Biaya Gas: Rp 0 (Disubsidi Platform)</span>
          </div>

          <button
            id="btn-execute-smart-rebalance"
            onClick={executeRebalance}
            disabled={isExecuting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{executionStep || 'Memproses Rebalancing...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Eksekusi Smart Rebalance (1-Klik Otomatis)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Execution Success Receipt Modal / Card */}
        {executedReceipt && (
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-slate-900/90 to-teal-500/10 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Smart Rebalancing Berhasil Dieksekusi!
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Hash Transaksi: {executedReceipt.txHash} • {executedReceipt.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Health Index Baru: {executedReceipt.newScore}/100 🏆
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh transaksi spot fisik telah berhasil dicocokkan dan dieksekusi secara otomatis
              di bursa spot syariah. Portofolio kini telah diseimbangkan sesuai model {strategyTargets[selectedStrategy].title}.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs font-mono">
              {executedReceipt.orders.map((ord) => (
                <div key={ord.id} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{ord.pair}</span>
                    <span className={ord.type === 'BUY' ? 'text-emerald-400' : 'text-amber-400'}>
                      {ord.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {ord.amount} unit • Sukses
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
              <span className="text-[11px] text-slate-400">
                Pencatatan bukti terenkripsi SHA-256 telah disinkronkan ke Ledger Blockchain.
              </span>
              <button
                onClick={() => setExecutedReceipt(null)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                Tutup Notifikasi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
