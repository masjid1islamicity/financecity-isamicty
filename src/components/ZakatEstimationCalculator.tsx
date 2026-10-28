import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Calculator,
  Calendar,
  Coins,
  Scale,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  Copy,
  CheckCircle2,
  Sliders,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Info,
  HeartHandshake,
  FileText,
} from 'lucide-react';
import {
  Language,
  Theme,
  AutoTradingConfig,
  ZakatProjectionMilestone,
  ZakatEstimationPlan,
} from '../types';

interface ZakatEstimationCalculatorProps {
  currentCapitalIDR?: number;
  dailyTargetPercent?: number;
  paxgPriceIDR: number; // e.g. ~42.100.000 / oz (~1.353.500 / gram)
  theme: Theme;
  language: Language;
  tradingConfig?: AutoTradingConfig;
  onApplyToTradingBot?: (updatedConfig: Partial<AutoTradingConfig>) => void;
  onNavigateToDisburse?: () => void;
  onNavigateToReport?: () => void;
}

export const ZakatEstimationCalculator: React.FC<ZakatEstimationCalculatorProps> = ({
  currentCapitalIDR = 120000000,
  dailyTargetPercent = 1.5,
  paxgPriceIDR,
  theme,
  tradingConfig,
  onApplyToTradingBot,
  onNavigateToDisburse,
  onNavigateToReport,
}) => {
  // Input parameters state
  const [allocatedCapital, setAllocatedCapital] = useState<number>(
    tradingConfig?.allocatedCapitalIDR || currentCapitalIDR
  );
  const [strategyPreset, setStrategyPreset] = useState<'conservative' | 'balanced' | 'dynamic' | 'custom'>(
    (tradingConfig?.strategy as 'conservative' | 'balanced' | 'dynamic') || 'balanced'
  );
  const [dailyReturnRate, setDailyReturnRate] = useState<number>(
    tradingConfig?.dailyTargetPercent || dailyTargetPercent
  );
  const [compoundingMode, setCompoundingMode] = useState<'monthly_compound' | 'flat_withdrawal'>('monthly_compound');
  const [timeHorizonMonths, setTimeHorizonMonths] = useState<number>(12);
  const [extraInfaqPercent, setExtraInfaqPercent] = useState<number>(0); // e.g. +0.5% or +1.0% voluntary
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<number>(12);
  const [appliedSuccessNotice, setAppliedSuccessNotice] = useState<string | null>(null);

  // Nisab gold reference
  const goldPricePerGram = Math.round(paxgPriceIDR / 31.1035);
  const nisabGold85gIDR = goldPricePerGram * 85;

  const effectiveZakatRate = 2.5 + extraInfaqPercent;

  // Handler for strategy preset buttons
  const handleSelectStrategy = (mode: 'conservative' | 'balanced' | 'dynamic') => {
    setStrategyPreset(mode);
    if (mode === 'conservative') {
      setDailyReturnRate(0.8);
    } else if (mode === 'balanced') {
      setDailyReturnRate(1.5);
    } else if (mode === 'dynamic') {
      setDailyReturnRate(2.2);
    }
  };

  const handleCustomRateChange = (val: number) => {
    setDailyReturnRate(val);
    setStrategyPreset('custom');
  };

  // 12-Month Projection Modeling
  const projectionMilestones: ZakatProjectionMilestone[] = useMemo(() => {
    const milestones: ZakatProjectionMilestone[] = [];
    const monthNames = [
      'Bulan 1 (Okt 2026)',
      'Bulan 2 (Nov 2026)',
      'Bulan 3 (Des 2026 - Q4)',
      'Bulan 4 (Jan 2027)',
      'Bulan 5 (Feb 2027)',
      'Bulan 6 (Mar 2027 - Ramadhan)',
      'Bulan 7 (Apr 2027 - Syawal)',
      'Bulan 8 (Mei 2027)',
      'Bulan 9 (Jun 2027 - Q2)',
      'Bulan 10 (Jul 2027)',
      'Bulan 11 (Agu 2027)',
      'Bulan 12 (Sep 2027 - Haul 1 Th)',
    ];

    let currentPrincipal = allocatedCapital;
    let runningCumulativeProfit = 0;
    let runningCumulativeZakat = 0;

    // Trading trading days per month ~ 22 to 25 days, or 30 days for 24/7 crypto spot bots
    // Realistic spot bot active execution: 26 active market cycle days
    const activeDaysPerMonth = 26;
    const winRateFactor = 0.894; // Bot 89.4% win rate factor

    for (let m = 1; m <= 12; m++) {
      // Monthly expected net yield based on daily rate and win rate
      const effectiveMonthlyRate = (dailyReturnRate / 100) * activeDaysPerMonth * winRateFactor;
      const monthProfit = Math.round(currentPrincipal * effectiveMonthlyRate);
      
      const monthZakat = Math.round(monthProfit * (effectiveZakatRate / 100));
      runningCumulativeProfit += monthProfit;
      runningCumulativeZakat += monthZakat;

      const currentPortfolio = compoundingMode === 'monthly_compound'
        ? currentPrincipal + monthProfit - monthZakat
        : currentPrincipal;

      if (compoundingMode === 'monthly_compound') {
        currentPrincipal = currentPortfolio;
      }

      milestones.push({
        month: m,
        monthName: monthNames[m - 1],
        projectedProfitIDR: monthProfit,
        cumulativeProfitIDR: runningCumulativeProfit,
        projectedZakatIDR: monthZakat,
        cumulativeZakatIDR: runningCumulativeZakat,
        projectedPortfolioIDR: currentPortfolio,
        isNisabReached: currentPortfolio >= nisabGold85gIDR || runningCumulativeProfit >= nisabGold85gIDR,
      });
    }

    return milestones;
  }, [allocatedCapital, dailyReturnRate, compoundingMode, effectiveZakatRate, nisabGold85gIDR]);

  // Active projection slice based on timeHorizonMonths
  const activeMilestone = projectionMilestones[timeHorizonMonths - 1] || projectionMilestones[11];
  const firstNisabMonth = projectionMilestones.find((m) => m.isNisabReached)?.month || null;

  const currentPlan: ZakatEstimationPlan = useMemo(() => {
    const dailyReserve = Math.round(
      (activeMilestone.projectedZakatIDR / (timeHorizonMonths * 30))
    );
    const monthlyReserve = Math.round(activeMilestone.projectedZakatIDR / timeHorizonMonths);

    // Calculate Haul date (12 months from now)
    const haulDate = new Date();
    haulDate.setFullYear(haulDate.getFullYear() + 1);
    const haulDateStr = haulDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      allocatedCapitalIDR: allocatedCapital,
      dailyReturnPercent: dailyReturnRate,
      compoundingMode,
      timeHorizonMonths,
      totalProjectedProfitIDR: activeMilestone.cumulativeProfitIDR,
      totalProjectedZakatIDR: activeMilestone.cumulativeZakatIDR,
      effectiveZakatRatePercent: effectiveZakatRate,
      nisabGoldIDR: nisabGold85gIDR,
      estimatedNisabReachMonth: firstNisabMonth,
      estimatedHaulDueDate: haulDateStr,
      dailyZakatReserveIDR: dailyReserve,
      monthlyZakatReserveIDR: monthlyReserve,
    };
  }, [allocatedCapital, dailyReturnRate, compoundingMode, timeHorizonMonths, activeMilestone, effectiveZakatRate, nisabGold85gIDR, firstNisabMonth]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Copy plan summary
  const handleCopyPlan = () => {
    const textSummary = `
==================================================
📊 RINGKASAN PERENCANAAN 'ZAKAT ESTIMASI' BOT TRADING
Platform: FinanceCity Islamicity Sharia Trading
Dasar Fiqih: Standar AAOIFI No. 57 & Fatwa DSN-MUI No. 140
==================================================
• Modal Alokasi Bot       : ${formatIDR(currentPlan.allocatedCapitalIDR)}
• Target Imbal Hasil Harian : ${currentPlan.dailyReturnPercent}% / hari
• Skema Pengelolaan        : ${currentPlan.compoundingMode === 'monthly_compound' ? 'Reinvestasi (Compounding)' : 'Penarikan Bulanan Rutin'}
• Periode Perencanaan      : ${currentPlan.timeHorizonMonths} Bulan
• Nisab Emas Acuan (85g)   : ${formatIDR(currentPlan.nisabGoldIDR)}
• Status Capai Nisab       : ${currentPlan.estimatedNisabReachMonth ? `Tercapai pada Bulan ke-${currentPlan.estimatedNisabReachMonth}` : 'Memerlukan akumulasi lebih lanjut'}
• Estimasi Jatuh Tempo Haul: ${currentPlan.estimatedHaulDueDate}
--------------------------------------------------
PROYEKSI AKUMULASI:
• Estimasi Total Laba      : ${formatIDR(currentPlan.totalProjectedProfitIDR)}
• Estimasi Zakat Maal (2.5%): ${formatIDR(currentPlan.totalProjectedZakatIDR)}
• Rata-rata Cadangan Zakat : ${formatIDR(currentPlan.dailyZakatReserveIDR)} / hari (${formatIDR(currentPlan.monthlyZakatReserveIDR)} / bulan)
--------------------------------------------------
RENCANA PENYALURAN ASNAF:
1. Fakir & Miskin (40%)     : ${formatIDR(currentPlan.totalProjectedZakatIDR * 0.4)}
2. Pendidikan Santri (25%)  : ${formatIDR(currentPlan.totalProjectedZakatIDR * 0.25)}
3. UMKM Mustahik (20%)      : ${formatIDR(currentPlan.totalProjectedZakatIDR * 0.2)}
4. Kesehatan Dhuafa (15%)   : ${formatIDR(currentPlan.totalProjectedZakatIDR * 0.15)}
==================================================
`;
    navigator.clipboard.writeText(textSummary);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 3000);
  };

  // Apply to bot config
  const handleApplyConfig = () => {
    if (onApplyToTradingBot) {
      onApplyToTradingBot({
        allocatedCapitalIDR: allocatedCapital,
        dailyTargetPercent: dailyReturnRate,
        strategy: strategyPreset === 'custom' ? 'balanced' : strategyPreset,
      });
      setAppliedSuccessNotice('Target modal & imbal hasil harian berhasil disinkronkan ke Bot Trading Syariah!');
      setTimeout(() => setAppliedSuccessNotice(null), 4000);
    }
  };

  // Max value for SVG bar scaling
  const maxCumulativeZakat = Math.max(...projectionMilestones.map((m) => m.cumulativeZakatIDR), 1);
  const maxMonthlyProfit = Math.max(...projectionMilestones.map((m) => m.projectedProfitIDR), 1);

  return (
    <div
      id="zakat-estimation-calculator-root"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-teal-500/30 shadow-xl shadow-teal-950/20 text-slate-100'
          : 'bg-white border-teal-200 shadow-md text-slate-900'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 font-bold">
                <Calculator className="w-5 h-5" />
              </span>
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Kalkulator 'Zakat Estimasi' (Proyeksi Tren Bot Trading)
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/40">
                  AI Forward Planner
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              Simulasi proyeksi potensi kewajiban <strong>Zakat Maal (2.5%)</strong> berdasarkan tren imbal hasil bot spot syariah, modal terpasang, serta perkiraan waktu pemenuhan batas nisab emas fisik (85 gram) untuk perencanaan finansial syariah yang berkah.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="copy-zakat-plan-btn"
              onClick={handleCopyPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 hover:bg-teal-500/10 text-teal-400 text-xs font-semibold transition-all shadow-xs"
              title="Salin ringkasan rencana zakat ke clipboard"
            >
              {copiedPlan ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Ringkasan</span>
                </>
              )}
            </button>
            {onNavigateToReport && (
              <button
                id="estimator-open-pdf-report-btn"
                onClick={onNavigateToReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Laporan PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Applied Notice */}
      {appliedSuccessNotice && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {appliedSuccessNotice}
          </span>
          <button
            onClick={() => setAppliedSuccessNotice(null)}
            className="text-[11px] underline text-emerald-300 hover:text-emerald-200"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="p-5 space-y-6">
        {/* Section 1: Interactive Configuration Sliders & Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Col 1: Capital Allocation */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-teal-500" />
                Modal Alokasi Bot (Capital)
              </label>
              <span className="text-xs font-black text-teal-400">
                {formatIDR(allocatedCapital)}
              </span>
            </div>

            <input
              type="range"
              min={10000000}
              max={1000000000}
              step={5000000}
              value={allocatedCapital}
              onChange={(e) => setAllocatedCapital(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />

            {/* Quick Capital Preset Chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {[
                { label: '50 Jt', val: 50000000 },
                { label: '120 Jt (Aktif)', val: 120000000 },
                { label: '250 Jt', val: 250000000 },
                { label: '500 Jt', val: 500000000 },
                { label: '1 M', val: 1000000000 },
              ].map((chip) => (
                <button
                  key={chip.val}
                  onClick={() => setAllocatedCapital(chip.val)}
                  className={`px-2 py-1 rounded-md border transition-all ${
                    allocatedCapital === chip.val
                      ? 'bg-teal-500 text-white font-bold border-teal-500'
                      : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:text-slate-200'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: Daily Target Return & Strategy */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Tren Imbal Hasil Harian (% / Hari)
              </label>
              <span className="text-xs font-black text-emerald-400">
                +{dailyReturnRate.toFixed(2)}% / hari
              </span>
            </div>

            {/* Strategy Preset Selector */}
            <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
              <button
                onClick={() => handleSelectStrategy('conservative')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  strategyPreset === 'conservative'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Konservatif (0.8%)
              </button>
              <button
                onClick={() => handleSelectStrategy('balanced')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  strategyPreset === 'balanced'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Berimbang (1.5%)
              </button>
              <button
                onClick={() => handleSelectStrategy('dynamic')}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  strategyPreset === 'dynamic'
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Dinamis (2.2%)
              </button>
            </div>

            <div className="pt-1">
              <input
                type="range"
                min={0.2}
                max={3.5}
                step={0.1}
                value={dailyReturnRate}
                onChange={(e) => handleCustomRateChange(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.2% (Rendah)</span>
                <span>Est. Bulanan: ~{((dailyReturnRate * 26 * 0.894)).toFixed(1)}%</span>
                <span>3.5% (Tinggi)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Compounding Mode & Horizon */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Skema Pengelolaan Laba
              </label>
              <span className="text-[11px] text-slate-400">
                Win Rate: 89.4%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setCompoundingMode('monthly_compound')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  compoundingMode === 'monthly_compound'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold'
                    : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[11px] font-bold">Reinvestasi (Compound)</span>
                <span className="text-[10px] opacity-75">Profit digulung kembali</span>
              </button>
              <button
                onClick={() => setCompoundingMode('flat_withdrawal')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  compoundingMode === 'flat_withdrawal'
                    ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold'
                    : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block text-[11px] font-bold">Tarik Rutin (Flat)</span>
                <span className="text-[10px] opacity-75">Modal pokok tetap</span>
              </button>
            </div>

            {/* Time horizon tabs */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Horizon Waktu Perencanaan:</span>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                {[
                  { label: '1 Bln', months: 1 },
                  { label: '3 Bln (Q)', months: 3 },
                  { label: '6 Bln', months: 6 },
                  { label: '12 Bln (Haul)', months: 12 },
                ].map((item) => (
                  <button
                    key={item.months}
                    onClick={() => {
                      setTimeHorizonMonths(item.months);
                      setSelectedMonthDetail(item.months);
                    }}
                    className={`py-1 rounded-md border text-center transition-all ${
                      timeHorizonMonths === item.months
                        ? 'bg-teal-600 text-white border-teal-500 font-bold'
                        : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Big Metric Cards of Projected Zakat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Projected Profit */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Proyeksi Total Profit ({timeHorizonMonths} Bulan)</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">
              +{formatIDR(currentPlan.totalProjectedProfitIDR)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Imbal hasil kumulatif: +{((currentPlan.totalProjectedProfitIDR / allocatedCapital) * 100).toFixed(1)}%
            </div>
          </div>

          {/* Card 2: Total Projected Zakat Maal (2.5%) */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden ${
              theme === 'dark'
                ? 'bg-teal-950/30 border-teal-500/40 text-teal-300'
                : 'bg-teal-50 border-teal-300 text-teal-800'
            }`}
          >
            <div className="text-[11px] font-semibold opacity-80 mb-1 flex items-center justify-between">
              <span>Estimasi Zakat Maal (2.5%)</span>
              <Scale className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-teal-400">
              {formatIDR(currentPlan.totalProjectedZakatIDR)}
            </div>
            <div className="text-[11px] opacity-75 mt-1">
              Nisbah Syariah: 2.5% dari laba terealisasi
            </div>
          </div>

          {/* Card 3: Daily & Monthly Reserve Rate */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Alokasi Cadangan Otomatis</span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              {formatIDR(currentPlan.dailyZakatReserveIDR)} <span className="text-xs font-normal text-slate-400">/ hari</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Setara {formatIDR(currentPlan.monthlyZakatReserveIDR)} / bulan ke Escrow
            </div>
          </div>

          {/* Card 4: Nisab & Haul Milestone */}
          <div
            className={`p-4 rounded-xl border relative overflow-hidden ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
              <span>Ambang Nisab Emas (85g)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-sm font-black text-amber-500">
              {formatIDR(currentPlan.nisabGoldIDR)}
            </div>
            <div className="text-[11px] mt-1 text-slate-400">
              {currentPlan.estimatedNisabReachMonth ? (
                <span className="text-emerald-400 font-semibold">
                  ✓ Melampaui batas nisab pada Bln ke-{currentPlan.estimatedNisabReachMonth}
                </span>
              ) : (
                <span>Portofolio dalam akumulasi menuju nisab</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Visual 12-Month Projection Timeline & Interactive Graph */}
        <div
          className={`p-5 rounded-xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-500" />
                Grafik Batang Proyeksi Akumulasi Zakat Maal (12 Bulan ke Depan)
              </h4>
              <p className="text-[11px] text-slate-400">
                Klik pada salah satu bulan untuk melihat rincian kalkulasi detail laba dan cadangan zakat.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" /> Zakat Kumulatif
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40" /> Laba Bulanan
              </span>
            </div>
          </div>

          {/* SVG Bar & Curve Visualizer */}
          <div className="pt-3 pb-2 overflow-x-auto">
            <div className="min-w-[580px] h-44 flex items-end gap-2 px-2 pb-6 relative border-b border-slate-300 dark:border-slate-800">
              {projectionMilestones.map((item) => {
                const isSelected = selectedMonthDetail === item.month;
                const isCurrentHorizon = item.month <= timeHorizonMonths;
                const zakatBarHeight = Math.max(8, (item.cumulativeZakatIDR / maxCumulativeZakat) * 120);
                const profitBarHeight = Math.max(6, (item.projectedProfitIDR / maxMonthlyProfit) * 70);

                return (
                  <div
                    key={item.month}
                    onClick={() => setSelectedMonthDetail(item.month)}
                    className={`flex-1 flex flex-col items-center justify-end h-full cursor-pointer group transition-all relative ${
                      isSelected ? 'opacity-100' : isCurrentHorizon ? 'opacity-85 hover:opacity-100' : 'opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Hover Tooltip Preview */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-20 px-2 py-1 rounded bg-slate-950 text-white text-[10px] font-mono border border-teal-500/40 whitespace-nowrap shadow-lg">
                      Bln {item.month}: Zakat {formatIDR(item.cumulativeZakatIDR)}
                    </div>

                    {/* Dual Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      {/* Profit Bar (Monthly) */}
                      <div
                        className="w-1/2 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-t transition-all"
                        style={{ height: `${profitBarHeight}px` }}
                        title={`Laba Bulan ${item.month}: ${formatIDR(item.projectedProfitIDR)}`}
                      />

                      {/* Cumulative Zakat Bar */}
                      <div
                        className={`w-1/2 rounded-t transition-all ${
                          isSelected
                            ? 'bg-teal-400 shadow-md shadow-teal-500/50'
                            : 'bg-teal-500/80 group-hover:bg-teal-500'
                        }`}
                        style={{ height: `${zakatBarHeight}px` }}
                        title={`Zakat Kumulatif Bln ${item.month}: ${formatIDR(item.cumulativeZakatIDR)}`}
                      />
                    </div>

                    {/* X-axis Label */}
                    <span
                      className={`text-[10px] mt-2 font-mono ${
                        isSelected
                          ? 'text-teal-400 font-bold'
                          : isCurrentHorizon
                          ? 'text-slate-400'
                          : 'text-slate-600'
                      }`}
                    >
                      Bln {item.month}
                    </span>

                    {/* Nisab reached indicator dot */}
                    {item.isNisabReached && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute bottom-0.5"
                        title="Nisab 85g Emas Terlampaui"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Month Detail Card */}
          {(() => {
            const currentSelected = projectionMilestones[selectedMonthDetail - 1];
            if (!currentSelected) return null;

            return (
              <div
                className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 text-xs ${
                  theme === 'dark' ? 'bg-slate-900 border-teal-500/20' : 'bg-white border-teal-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black">
                    M{currentSelected.month}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Rincian {currentSelected.monthName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Proyeksi Portofolio: {formatIDR(currentSelected.projectedPortfolioIDR)} • {currentSelected.isNisabReached ? 'Status: Wajib Zakat (Nisab Terpenuhi)' : 'Status: Menuju Batas Nisab'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Laba Bulan Ini:</span>
                    <span className="text-emerald-400 font-bold">
                      +{formatIDR(currentSelected.projectedProfitIDR)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Zakat Bulan Ini:</span>
                    <span className="text-teal-400 font-bold">
                      {formatIDR(currentSelected.projectedZakatIDR)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Akumulasi Zakat:</span>
                    <span className="text-amber-400 font-black">
                      {formatIDR(currentSelected.cumulativeZakatIDR)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Section 4: Asnaf Allocation & Distribution Planning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Projected Social Impact & Asnaf Plan */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                Rencana Alokasi Distribusi 8 Asnaf (QS. At-Taubah: 60)
              </h4>
              <span className="text-[10px] text-teal-400 font-semibold">
                Penyaluran Resmi BAZNAS
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  asnaf: 'Fakir & Miskin (40%)',
                  desc: 'Bantuan pangan, sembako, dan biaya hidup darurat',
                  amount: currentPlan.totalProjectedZakatIDR * 0.4,
                  barColor: 'bg-rose-500',
                },
                {
                  asnaf: 'Pendidikan & Beasiswa Santri (25%)',
                  desc: 'Beasiswa Cendekia BAZNAS & sarana belajar dhuafa',
                  amount: currentPlan.totalProjectedZakatIDR * 0.25,
                  barColor: 'bg-emerald-500',
                },
                {
                  asnaf: 'Pemberdayaan UMKM Mustahik (20%)',
                  desc: 'Modal kerja usaha mikro bebas riba agar mandiri',
                  amount: currentPlan.totalProjectedZakatIDR * 0.2,
                  barColor: 'bg-teal-500',
                },
                {
                  asnaf: 'Kesehatan Dhuafa & RS Syariah (15%)',
                  desc: 'Layanan medis gratis Rumah Sehat BAZNAS',
                  amount: currentPlan.totalProjectedZakatIDR * 0.15,
                  barColor: 'bg-blue-500',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.asnaf}
                    </span>
                    <span className="font-mono font-bold text-teal-400">
                      {formatIDR(item.amount)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 leading-relaxed">
              💡 <strong>Dampak Sosial Nyata:</strong> Dengan proyeksi zakat sebesar{' '}
              <strong>{formatIDR(currentPlan.totalProjectedZakatIDR)}</strong>, Anda diproyeksikan memberikan manfaat berkelanjutan bagi sekitar{' '}
              <strong>{Math.max(1, Math.round(currentPlan.totalProjectedZakatIDR / 750000))} keluarga mustahik</strong> prasejahtera.
            </div>
          </div>

          {/* Right: Planning Advice & Actions */}
          <div
            className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Panduan Perencanaan Zakat Maal Sesuai Syariah
              </h4>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <p>
                    <strong>Siklus Haul (1 Tahun):</strong> Zakat perniagaan dihitung atas seluruh laba dan modal likuid setelah berjalan 1 haul. Dengan fitur pencadangan otomatis 2.5%, kewajiban Anda terlunasi secara berkala tanpa beban akumulasi mendadak.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <p>
                    <strong>Insentif Pajak Resmi (UU RI No. 23/2011):</strong> Penyaluran melalui BAZNAS menghasilkan Bukti Setor Zakat (BSZ) resmi yang diakui Ditjen Pajak sebagai pengurang penghasilan bruto SPT Tahunan.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <p>
                    <strong>Brankas Escrow Terisolasi:</strong> Setiap pemotongan 2.5% dialokasikan ke brankas zakat terpisah dan tidak diikutsertakan dalam modal trading aktif, sehingga aman dari risiko fluktuasi pasar.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex flex-wrap gap-2">
                {onApplyToTradingBot && (
                  <button
                    id="apply-simulation-to-bot-btn"
                    onClick={handleApplyConfig}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Terapkan Target ke Bot Trading</span>
                  </button>
                )}

                {onNavigateToDisburse && (
                  <button
                    id="estimator-navigate-disburse-btn"
                    onClick={onNavigateToDisburse}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-teal-500/40 hover:bg-teal-500/10 text-teal-400 text-xs font-semibold transition-all"
                  >
                    <span>Salurkan Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
