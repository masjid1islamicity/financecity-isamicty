import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Award,
  Calendar,
  Wallet,
  DollarSign,
  Scale,
  HeartHandshake,
  Building2,
  RefreshCw,
  Send,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  FileText,
  AlertCircle,
  Compass,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import {
  CryptoAsset,
  Language,
  Theme,
  WealthProjectionGoal,
  WealthProjectionScenario,
  YearlyProjectionPoint,
  WealthProjectionMilestone,
  AiWealthProjectionResponse,
  CustomFinancialMilestone,
} from '../types';
import {
  calculateYearlyProjectionPoints,
  computeWealthMilestones,
  formatRupiah,
  formatRupiahCompact,
  GOAL_PRESETS,
  BASELINE_CAGR,
  ZAKAT_MAAL_RATE,
  MUSTAHIK_FAMILY_UPLIFT_COST_IDR,
} from '../utils/shariaWealthProjectionEngine';
import { CustomMilestoneManager } from './CustomMilestoneManager';

interface SmartWealthProjectionProps {
  assets: CryptoAsset[];
  totalBalanceIDR?: number;
  zakatReserveIDR?: number;
  goldPricePerGramIDR?: number;
  theme: Theme;
  language: Language;
  onNavigateToTab?: (tab: string) => void;
}

export const SmartWealthProjection: React.FC<SmartWealthProjectionProps> = ({
  assets,
  totalBalanceIDR = 348250000,
  zakatReserveIDR = 8706250,
  goldPricePerGramIDR = 1353500,
  theme,
  language,
  onNavigateToTab,
}) => {
  // Projection Configuration States
  const [initialBalance, setInitialBalance] = useState<number>(totalBalanceIDR);
  const [monthlyDca, setMonthlyDca] = useState<number>(5000000); // Rp 5.000.000 / month
  const [horizonYears, setHorizonYears] = useState<number>(5);
  const [selectedGoal, setSelectedGoal] = useState<WealthProjectionGoal>('early_retirement');
  const [selectedScenario, setSelectedScenario] = useState<WealthProjectionScenario>('ai_recommended');
  const [includeZakatDeduction, setIncludeZakatDeduction] = useState<boolean>(true);
  const [reinvestYields, setReinvestYields] = useState<boolean>(true);
  const [activeCustomMilestones, setActiveCustomMilestones] = useState<CustomFinancialMilestone[]>([]);

  // Active Hover Point on Chart
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [isScheduleTableOpen, setIsScheduleTableOpen] = useState<boolean>(false);

  // AI Wealth Insights States
  const [aiData, setAiData] = useState<AiWealthProjectionResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiSource, setAiSource] = useState<string>('financecity-wealth-oracle-engine');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isAskingCustom, setIsAskingCustom] = useState<boolean>(false);

  // Fetch AI Wealth Projection from Backend API
  const fetchAiWealthProjection = async (promptQuestion?: string) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/wealth-projection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPortfolioIDR: initialBalance,
          monthlyDcaIDR: monthlyDca,
          horizonYears,
          goal: selectedGoal,
          riskProfile:
            selectedScenario === 'conservative'
              ? 'conservative'
              : selectedScenario === 'aggressive'
              ? 'aggressive'
              : 'balanced',
          cryptoAssets: assets,
          reinvestDividends: reinvestYields,
          userCustomQuestion: promptQuestion || customQuestion || '',
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setAiData(json.data);
        setAiSource(json.source || 'gemini-3.8-flash');
      }
    } catch (err) {
      console.warn('Using client-side fallback projection insights:', err);
    } finally {
      setIsLoadingAi(false);
      setIsAskingCustom(false);
    }
  };

  // Initial load of AI projection
  useEffect(() => {
    fetchAiWealthProjection();
  }, [horizonYears, selectedGoal, selectedScenario]);

  // Compute Mathematical Projection Points
  const projectionPoints: YearlyProjectionPoint[] = useMemo(() => {
    const customModifiers = aiData?.cagrForecast
      ? {
          conservative: aiData.cagrForecast.conservative,
          balanced: aiData.cagrForecast.balanced,
          aggressive: aiData.cagrForecast.aggressive,
          aiOptimized: aiData.cagrForecast.aiOptimized,
        }
      : undefined;

    return calculateYearlyProjectionPoints({
      initialBalanceIDR: initialBalance,
      monthlyDcaIDR: monthlyDca,
      horizonYears,
      selectedGoal,
      reinvestYields,
      inflationRate: 0.032,
      goldPricePerGramIDR,
      customCagrModifiers: customModifiers,
    });
  }, [initialBalance, monthlyDca, horizonYears, selectedGoal, reinvestYields, goldPricePerGramIDR, aiData]);

  // Milestones
  const milestones: WealthProjectionMilestone[] = useMemo(() => {
    return computeWealthMilestones(projectionPoints, selectedScenario, goldPricePerGramIDR);
  }, [projectionPoints, selectedScenario, goldPricePerGramIDR]);

  // Active CAGR rate for time-to-goal calculations
  const activeCagrRate = useMemo(() => {
    if (selectedScenario === 'conservative') return BASELINE_CAGR.conservative;
    if (selectedScenario === 'aggressive') return BASELINE_CAGR.aggressive;
    if (selectedScenario === 'ai_recommended') {
      return aiData?.cagrForecast?.aiOptimized || BASELINE_CAGR.aiOptimized;
    }
    return BASELINE_CAGR.balanced;
  }, [selectedScenario, aiData]);

  // End of Horizon Point
  const finalPoint = projectionPoints[projectionPoints.length - 1] || projectionPoints[0];
  const initialPoint = projectionPoints[0];

  // Active Value based on selected scenario
  const getPointValue = (pt: YearlyProjectionPoint, scenario: WealthProjectionScenario) => {
    switch (scenario) {
      case 'conservative':
        return pt.conservativeValueIDR;
      case 'aggressive':
        return pt.aggressiveValueIDR;
      case 'ai_recommended':
        return pt.aiOptimizedValueIDR;
      case 'balanced':
      default:
        return pt.balancedValueIDR;
    }
  };

  const finalGrossValue = getPointValue(finalPoint, selectedScenario);
  const finalNetAfterZakat = finalPoint.netAfterZakatIDR;
  const totalPrincipal = finalPoint.totalPrincipalDepositsIDR;
  const grossGrowthMultiplier = totalPrincipal > 0 ? (finalGrossValue / totalPrincipal).toFixed(2) : '1.0';
  const totalZakatDistributed = finalPoint.cumulativeZakatPaidIDR;
  const totalLivesProjected = finalPoint.estimatedLivesImpacted;
  const totalGoldGrams = finalPoint.goldEquivalentGrams;

  // Active Point for tooltips
  const activeTooltipPoint = hoveredYear !== null ? projectionPoints[hoveredYear] : finalPoint;
  const activeTooltipValue = getPointValue(activeTooltipPoint, selectedScenario);

  // SVG Chart Scaling Calculations
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxValue = useMemo(() => {
    let max = 0;
    for (const pt of projectionPoints) {
      if (pt.aggressiveValueIDR > max) max = pt.aggressiveValueIDR;
      if (pt.aiOptimizedValueIDR > max) max = pt.aiOptimizedValueIDR;
    }
    return max * 1.1 || 1000000;
  }, [projectionPoints]);

  const getYCoord = (val: number) => {
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const ratio = Math.min(1, Math.max(0, val / maxValue));
    return chartHeight - paddingBottom - ratio * usableHeight;
  };

  const getXCoord = (index: number) => {
    const usableWidth = chartWidth - paddingX * 2;
    if (projectionPoints.length <= 1) return paddingX;
    return paddingX + (index / (projectionPoints.length - 1)) * usableWidth;
  };

  // Build SVG Path strings
  const buildSvgPath = (getValue: (pt: YearlyProjectionPoint) => number) => {
    if (projectionPoints.length === 0) return '';
    return projectionPoints
      .map((pt, i) => {
        const x = getXCoord(i);
        const y = getYCoord(getValue(pt));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const conservativePath = useMemo(
    () => buildSvgPath((pt) => pt.conservativeValueIDR),
    [projectionPoints, maxValue]
  );
  const balancedPath = useMemo(
    () => buildSvgPath((pt) => pt.balancedValueIDR),
    [projectionPoints, maxValue]
  );
  const aggressivePath = useMemo(
    () => buildSvgPath((pt) => pt.aggressiveValueIDR),
    [projectionPoints, maxValue]
  );
  const aiOptimizedPath = useMemo(
    () => buildSvgPath((pt) => pt.aiOptimizedValueIDR),
    [projectionPoints, maxValue]
  );
  const netAfterZakatPath = useMemo(
    () => buildSvgPath((pt) => pt.netAfterZakatIDR),
    [projectionPoints, maxValue]
  );
  const principalPath = useMemo(
    () => buildSvgPath((pt) => pt.totalPrincipalDepositsIDR),
    [projectionPoints, maxValue]
  );

  // Area Fill Path for AI/Active Curve
  const activeAreaPath = useMemo(() => {
    if (projectionPoints.length === 0) return '';
    const mainLine = buildSvgPath((pt) => getPointValue(pt, selectedScenario));
    const lastX = getXCoord(projectionPoints.length - 1);
    const firstX = getXCoord(0);
    const bottomY = chartHeight - paddingBottom;
    return `${mainLine} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [projectionPoints, selectedScenario, maxValue]);

  // Quick Preset Handlers
  const handleSelectGoal = (goalKey: WealthProjectionGoal) => {
    setSelectedGoal(goalKey);
    const preset = GOAL_PRESETS[goalKey];
    if (preset) {
      setHorizonYears(preset.suggestedHorizonYears);
      setSelectedScenario(preset.recommendedScenario);
    }
  };

  const handleAskCustomPrompt = (q: string) => {
    setCustomQuestion(q);
    setIsAskingCustom(true);
    fetchAiWealthProjection(q);
  };

  return (
    <div
      id="smart-wealth-projection-container"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-sm'
      }`}
    >
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Smart Wealth Projection Syariah (AI-Powered)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Simulasi pertumbuhan portofolio berbasis data historis komoditas emas fisik (PAXG) &
              kripto Proof-of-Stake halal, dengan pemotongan otomatis Zakat Maal 2.5% (*Tazkiyah Harta*)
              dan perlindungan daya beli riil terhadap inflasi.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              id="refresh-ai-projection-btn"
              onClick={() => fetchAiWealthProjection()}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'Menganalisis...' : 'Perbarui Analisis AI'}</span>
            </button>
          </div>
        </div>

        {/* Goal Preset Selectors */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pilih Target Rencana Keuangan Syariah:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(Object.keys(GOAL_PRESETS) as WealthProjectionGoal[]).map((goalKey) => {
              const item = GOAL_PRESETS[goalKey];
              const isSelected = selectedGoal === goalKey;
              return (
                <button
                  key={goalKey}
                  onClick={() => handleSelectGoal(goalKey)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-xs ring-1 ring-emerald-500/40'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-base mb-1">
                    <span>{item.icon}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {formatRupiahCompact(item.targetAmountIDR)} • {item.suggestedHorizonYears} Thn
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Metrics Grid */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Controls Row: Initial Balance, Monthly DCA, Horizon, Scenario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
          {/* Control 1: Starting Balance */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
              <span>Modal Awal Portofolio</span>
              <span className="text-emerald-500 font-bold">{formatRupiahCompact(initialBalance)}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1000000}
                step={5000000}
                value={initialBalance}
                onChange={(e) => setInitialBalance(Math.max(1000000, Number(e.target.value) || 0))}
                className="w-full pl-3 pr-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">Total aset saat ini di FinanceCity.</p>
          </div>

          {/* Control 2: Monthly DCA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase flex items-center justify-between">
              <span>Investasi Rutin (DCA / Bln)</span>
              <span className="text-teal-400 font-bold">{formatRupiahCompact(monthlyDca)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={30000000}
              step={500000}
              value={monthlyDca}
              onChange={(e) => setMonthlyDca(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Rp 0</span>
              <span>Rp 15 Jt</span>
              <span>Rp 30 Jt</span>
            </div>
          </div>

          {/* Control 3: Horizon (Tahun) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">
              Jangka Waktu Investasi
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[1, 3, 5, 10].map((y) => (
                <button
                  key={y}
                  onClick={() => setHorizonYears(y)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    horizonYears === y
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {y} Thn
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">Target selesai tahun {new Date().getFullYear() + horizonYears}</p>
          </div>

          {/* Control 4: Scenario Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1">
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Skenario Pertumbuhan</span>
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value as WealthProjectionScenario)}
              className="w-full py-2 px-2.5 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ai_recommended">✨ Gemini AI Dynamic (~24.8% p.a.)</option>
              <option value="conservative">🛡️ Konservatif Emas (~9.8% p.a.)</option>
              <option value="balanced">⚖️ Moderat Berimbang (~21.4% p.a.)</option>
              <option value="aggressive">🚀 Agresif PoS Halal (~31.2% p.a.)</option>
            </select>
            <div className="flex items-center gap-2 pt-0.5">
              <label className="flex items-center gap-1 text-[10px] text-emerald-500 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeZakatDeduction}
                  onChange={(e) => setIncludeZakatDeduction(e.target.checked)}
                  className="rounded border-slate-700 accent-emerald-500"
                />
                <span>Auto-Zakat 2.5%</span>
              </label>
            </div>
          </div>
        </div>

        {/* 4 Summary Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Projected Total Wealth */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Nilai Akhir Bruto ({horizonYears} Tahun)</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400 tracking-tight">
              {formatRupiahCompact(finalGrossValue)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <span className="text-emerald-500 font-bold">{grossGrowthMultiplier}x lipat</span>
              <span>dari total modal {formatRupiahCompact(totalPrincipal)}</span>
            </div>
          </div>

          {/* Card 2: Net After Zakat (Tazkiyah) */}
          <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Bersih Pasca Zakat Maal</span>
              <Scale className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-teal-400 tracking-tight">
              {formatRupiahCompact(finalNetAfterZakat)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Disucikan dari hak Mustahik (2.5% per tahun)
            </div>
          </div>

          {/* Card 3: Social & Mustahik Impact */}
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Akumulasi Zakat Terbayar</span>
              <HeartHandshake className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-400 tracking-tight">
              {formatRupiahCompact(totalZakatDistributed)}
            </div>
            <div className="mt-1 text-[11px] text-amber-500/90 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>±{totalLivesProjected} Jiwa Mustahik Diberdayakan</span>
            </div>
          </div>

          {/* Card 4: Gold Purchasing Power Anchor */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-950/20">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Daya Beli Setara Emas</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-cyan-400 tracking-tight">
              {totalGoldGrams.toLocaleString('id-ID')} Gram
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Tahan inflasi riil (Standar Dinar & Nisab)
            </div>
          </div>
        </div>

        {/* Visual Interactive SVG Growth Chart */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950/40 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Trajektori Akumulasi Kekayaan Syariah</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Arahkan kursor / sentuh titik kurva untuk melihat rincian nilai tahunan dan zakat.
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">AI Dinamis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-teal-400"></span>
                <span className="text-slate-300">Moderat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-amber-400"></span>
                <span className="text-slate-300">Konservatif</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-cyan-400"></span>
                <span className="text-cyan-300">Net Pasca Zakat</span>
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto min-w-[580px] select-none"
            >
              <defs>
                <linearGradient id="wealthGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                  <stop offset="90%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="netZakatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = getYCoord(maxValue * pct);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.12"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      className="font-mono"
                    >
                      {formatRupiahCompact(maxValue * pct)}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <path d={activeAreaPath} fill="url(#wealthGrowthGrad)" />

              {/* Principal Baseline */}
              <path
                d={principalPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Slower/Conservative Curve */}
              <path
                d={conservativePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={selectedScenario === 'conservative' ? '3' : '1.5'}
                opacity={selectedScenario === 'conservative' ? '1' : '0.4'}
              />

              {/* Balanced Curve */}
              <path
                d={balancedPath}
                fill="none"
                stroke="#14b8a6"
                strokeWidth={selectedScenario === 'balanced' ? '3' : '1.5'}
                opacity={selectedScenario === 'balanced' ? '1' : '0.4'}
              />

              {/* Aggressive Curve */}
              <path
                d={aggressivePath}
                fill="none"
                stroke="#a855f7"
                strokeWidth={selectedScenario === 'aggressive' ? '3' : '1.5'}
                opacity={selectedScenario === 'aggressive' ? '1' : '0.3'}
              />

              {/* AI Optimized Curve */}
              <path
                d={aiOptimizedPath}
                fill="none"
                stroke="#10b981"
                strokeWidth={selectedScenario === 'ai_recommended' ? '3' : '1.5'}
                opacity={selectedScenario === 'ai_recommended' ? '1' : '0.5'}
              />

              {/* Net After Zakat (Dotted Line) */}
              {includeZakatDeduction && (
                <path
                  d={netAfterZakatPath}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}

              {/* Custom Financial Milestones Horizontal Target Markers on Chart */}
              {activeCustomMilestones.slice(0, 3).map((m) => {
                if (m.targetAmountIDR > maxValue * 1.05 || m.targetAmountIDR <= 0) return null;
                const y = getYCoord(m.targetAmountIDR);
                return (
                  <g key={`svg-milestone-${m.id}`} className="transition-opacity duration-300">
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f59e0b"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                      opacity="0.6"
                    />
                    <rect
                      x={chartWidth - paddingX - 125}
                      y={y - 12}
                      width="120"
                      height="18"
                      rx="5"
                      fill="#0f172a"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      opacity="0.9"
                    />
                    <text
                      x={chartWidth - paddingX - 65}
                      y={y + 1}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#fde68a"
                      fontWeight="bold"
                    >
                      {m.icon} {formatRupiahCompact(m.targetAmountIDR)}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Dots for Each Year */}
              {projectionPoints.map((pt, i) => {
                const x = getXCoord(i);
                const activeVal = getPointValue(pt, selectedScenario);
                const y = getYCoord(activeVal);
                const isHovered = hoveredYear === i;

                return (
                  <g
                    key={i}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredYear(i)}
                    onClick={() => setHoveredYear(i)}
                  >
                    {/* Vertical hover guide */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={chartHeight - paddingBottom}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}

                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 3.5}
                      fill={isHovered ? '#10b981' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />

                    {/* X-axis year label */}
                    <text
                      x={x}
                      y={chartHeight - paddingBottom + 16}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? '#10b981' : '#94a3b8'}
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {i === 0 ? 'Kini' : `Thn ${i}`}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card */}
          <div className="mt-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <div className="font-bold text-slate-100">
                  {hoveredYear === 0
                    ? `Tahun 0 (Tahun Ini - ${activeTooltipPoint.calendarYear})`
                    : `Tahun ke-${activeTooltipPoint.year} (${activeTooltipPoint.calendarYear})`}
                </div>
                <div className="text-[11px] text-slate-400">
                  Total Modal Disetor: {formatRupiahCompact(activeTooltipPoint.totalPrincipalDepositsIDR)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Nilai Bruto</span>
                <span className="font-black text-emerald-400 text-sm">
                  {formatRupiah(activeTooltipValue)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-cyan-400 uppercase block">Pasca Zakat Maal</span>
                <span className="font-black text-cyan-300 text-sm">
                  {formatRupiah(activeTooltipPoint.netAfterZakatIDR)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-amber-400 uppercase block">Total Zakat Terbayar</span>
                <span className="font-bold text-amber-300 text-xs">
                  {formatRupiah(activeTooltipPoint.cumulativeZakatPaidIDR)} (±{activeTooltipPoint.estimatedLivesImpacted} Mustahik)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Emas Murni</span>
                <span className="font-bold text-slate-200 text-xs">
                  {activeTooltipPoint.goldEquivalentGrams} Gram
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Financial Milestones & Time-To-Goal Visualizer */}
        <CustomMilestoneManager
          currentBalanceIDR={initialBalance}
          monthlyDcaIDR={monthlyDca}
          annualCagr={activeCagrRate}
          theme={theme}
          language={language}
          onUpdateMonthlyDca={setMonthlyDca}
          onMilestonesChange={setActiveCustomMilestones}
        />

        {/* AI Strategic Intelligence Section (Gemini 3.8 Flash) */}
        <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-teal-500/5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Rekomendasi Strategis & Makro Syariah (Gemini AI)
                </h3>
                <span className="text-[10px] text-slate-400">
                  Engine: {aiSource} • Standar Fatwa DSN-MUI & AAOIFI
                </span>
              </div>
            </div>

            {aiData?.cagrForecast && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                  CAGR Rekomendasi: {(aiData.cagrForecast.aiOptimized * 100).toFixed(1)}% p.a.
                </span>
              </div>
            )}
          </div>

          {/* AI Executive Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {aiData?.executiveSummary || (
              <div className="flex items-center gap-2 text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Menghasilkan wawasan proyeksi syariah cerdas...</span>
              </div>
            )}
          </div>

          {/* Recommended Sharia Asset Mix */}
          {aiData?.recommendedAllocation && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Alokasi Aset Halal Ideal untuk Target Ini:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {aiData.recommendedAllocation.map((alloc) => (
                  <div
                    key={alloc.symbol}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-100">
                      <span>{alloc.symbol}</span>
                      <span className="text-emerald-400">{alloc.percentage}%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{alloc.name}</div>
                    <div className="text-[9px] text-teal-400 mt-1 font-medium truncate">
                      {alloc.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tazkiyah Insight */}
          {aiData?.zakatTazkiyahInsight && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed flex items-start gap-2">
              <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Hikmah Tazkiyah Zakat Maal: </span>
                <span>{aiData.zakatTazkiyahInsight}</span>
              </div>
            </div>
          )}

          {/* Custom Question to Gemini AI */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
              <span>Tanyakan Skenario Kustom kepada Gemini AI:</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="cth: Bagaimana jika inflasi naik menjadi 5%? Apakah cukup untuk haji 3 tahun lagi?"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customQuestion.trim()) {
                    handleAskCustomPrompt(customQuestion);
                  }
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleAskCustomPrompt(customQuestion)}
                disabled={!customQuestion.trim() || isAskingCustom}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAskingCustom ? 'Mengirim...' : 'Tanyakan'}</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[
                'Bagaimana jika terjadi bear market crypto 30%?',
                'Optimalkan portofolio untuk pensiun dini 10 tahun',
                'Simulasi jika setoran bulanan saya naikkan jadi Rp 10 Juta',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskCustomPrompt(chip)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* AI Custom Answer Display */}
            {aiData?.customAnswer && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Jawaban Konsultasi AI:
                </div>
                {aiData.customAnswer}
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Year-by-Year Schedule Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setIsScheduleTableOpen(!isScheduleTableOpen)}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Tabel Proyeksi Rinci Tahunan & Jadwal Zakat Maal ({horizonYears} Tahun)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>{isScheduleTableOpen ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
              {isScheduleTableOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isScheduleTableOpen && (
            <div className="overflow-x-auto p-4 bg-white dark:bg-slate-900/80">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                    <th className="py-2 px-3">Tahun</th>
                    <th className="py-2 px-3">Modal Pokok</th>
                    <th className="py-2 px-3">Nilai Bruto</th>
                    <th className="py-2 px-3">Zakat Maal (2.5%)</th>
                    <th className="py-2 px-3">Nilai Pasca Zakat</th>
                    <th className="py-2 px-3">Emas Fisik</th>
                    <th className="py-2 px-3">Dampak Jiwa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-300 font-medium">
                  {projectionPoints.map((pt) => {
                    const gross = getPointValue(pt, selectedScenario);
                    return (
                      <tr key={pt.year} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          Thn {pt.year} ({pt.calendarYear})
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {formatRupiahCompact(pt.totalPrincipalDepositsIDR)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400 font-mono">
                          {formatRupiah(gross)}
                        </td>
                        <td className="py-2.5 px-3 text-amber-400 font-mono">
                          {formatRupiah(pt.annualZakatPaidIDR)}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-300 font-mono">
                          {formatRupiah(pt.netAfterZakatIDR)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {pt.goldEquivalentGrams} g
                        </td>
                        <td className="py-2.5 px-3 text-emerald-400">
                          ±{pt.estimatedLivesImpacted} Jiwa
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
