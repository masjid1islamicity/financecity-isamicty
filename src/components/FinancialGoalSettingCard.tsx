import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Target,
  Compass,
  Home,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Plus,
  Edit3,
  Calendar,
  Sparkles,
  TrendingUp,
  Coins,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
  X,
  RotateCcw,
  Check,
  Zap,
  ChevronRight,
  FileText,
  Database,
} from 'lucide-react';
import { ShariaFinancialGoal, ShariaGoalCategory, Language, Theme, CryptoAsset } from '../types';
import { CircularProgressBar } from './CircularProgressBar';
import { GoalBlockchainReportModal } from './GoalBlockchainReportModal';

interface FinancialGoalSettingCardProps {
  totalBalanceIDR: number;
  assets: CryptoAsset[];
  theme: Theme;
  language: Language;
  onNavigateToTab?: (tab: string) => void;
  onScrollToProjection?: () => void;
  onRecordGoalToBlockchain?: (params: {
    goal: ShariaFinancialGoal;
    projectedDateFormatted: string;
    accumulatedFundsIDR: number;
    cipherText: string;
    signature: string;
    merkleRoot: string;
    txHash: string;
  }) => void;
}

const STORAGE_KEY = 'financecity_sharia_financial_goals_v2';

const DEFAULT_SHARIA_GOALS: ShariaFinancialGoal[] = [
  {
    id: 'goal-hajj-umrah',
    title: 'Ibadah Haji Plus & Umrah Akbar Keluarga',
    category: 'hajj_umrah',
    targetAmountIDR: 350000000,
    allocatedBalanceIDR: 245000000,
    targetDeadlineYear: 2029,
    monthlyDcaIDR: 4500000,
    expectedAnnualYieldPercent: 14.5,
    shariaVehicle: '60% PAXG Emas Fisik + 40% Sukuk Ritel Syariah',
    iconName: 'Compass',
    description: 'Tabungan murni bebas riba untuk ziarah ke Baitullah bersama keluarga tercinta.',
  },
  {
    id: 'goal-halal-home',
    title: 'Kepemilikan Rumah Idaman Bebas Riba',
    category: 'halal_home',
    targetAmountIDR: 850000000,
    allocatedBalanceIDR: 348250000,
    targetDeadlineYear: 2031,
    monthlyDcaIDR: 8000000,
    expectedAnnualYieldPercent: 16.2,
    shariaVehicle: 'Multi-Aset Kripto Syariah Top-5 + Emas Digital PAXG',
    iconName: 'Home',
    description: 'Mewujudkan hunian berkah tanpa jeratan bunga perbankan konvensional.',
  },
  {
    id: 'goal-retirement-gold',
    title: 'Dana Pensiun Mandiri & Tabungan Emas Istiqomah',
    category: 'retirement_gold',
    targetAmountIDR: 1500000000,
    allocatedBalanceIDR: 348250000,
    targetDeadlineYear: 2036,
    monthlyDcaIDR: 10000000,
    expectedAnnualYieldPercent: 18.0,
    shariaVehicle: '70% PAXG Emas Batangan LBMA + 30% Staking PoSS Halal',
    iconName: 'ShieldCheck',
    description: 'Pilar finansial hari tua dengan perlindungan daya beli emas jangka panjang.',
  },
  {
    id: 'goal-education',
    title: 'Pendidikan Anak ke Universitas Internasional',
    category: 'education',
    targetAmountIDR: 450000000,
    allocatedBalanceIDR: 185000000,
    targetDeadlineYear: 2030,
    monthlyDcaIDR: 5000000,
    expectedAnnualYieldPercent: 15.0,
    shariaVehicle: '50% Sukuk Tabungan Negara + 50% Sharia Equity Top',
    iconName: 'GraduationCap',
    description: 'Investasi ilmu dan peradaban untuk mencetak generasi muslim berwawasan global.',
  },
  {
    id: 'goal-waqf-jariyah',
    title: 'Wakaf Produktif Abadi & Sarana Dakwah',
    category: 'waqf_jariyah',
    targetAmountIDR: 250000000,
    allocatedBalanceIDR: 120000000,
    targetDeadlineYear: 2028,
    monthlyDcaIDR: 3000000,
    expectedAnnualYieldPercent: 12.0,
    shariaVehicle: 'Cash Waqf Linked Sukuk (CWLS) + Kas Syariah',
    iconName: 'HeartHandshake',
    description: 'Amal jariyah abadi yang terus mengalirkan pahala tak terputus bagi keluarga.',
  },
];

export const FinancialGoalSettingCard: React.FC<FinancialGoalSettingCardProps> = ({
  totalBalanceIDR,
  assets,
  theme,
  language,
  onNavigateToTab,
  onScrollToProjection,
  onRecordGoalToBlockchain,
}) => {
  const isDark = theme === 'dark';

  // Load goals from localStorage or fallback
  const [goals, setGoals] = useState<ShariaFinancialGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SHARIA_GOALS;
  });

  const [activeGoalId, setActiveGoalId] = useState<string>(() => {
    return DEFAULT_SHARIA_GOALS[0].id;
  });

  const [useTotalPortfolioBalance, setUseTotalPortfolioBalance] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<ShariaFinancialGoal | null>(null);
  const [acceleratedDcaSlider, setAcceleratedDcaSlider] = useState<number>(0);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);

  // Predictive Timeline State
  const [savingsRateInput, setSavingsRateInput] = useState<number>(DEFAULT_SHARIA_GOALS[0].monthlyDcaIDR);
  const [timelineScenario, setTimelineScenario] = useState<'balanced' | 'conservative' | 'aggressive'>('balanced');
  const [savedRateToast, setSavedRateToast] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.warn('Could not save financial goals', e);
    }
  }, [goals]);

  // Current active goal
  const currentGoal = useMemo(() => {
    return goals.find((g) => g.id === activeGoalId) || goals[0];
  }, [goals, activeGoalId]);

  // Sync savingsRateInput whenever the active goal changes
  useEffect(() => {
    setSavingsRateInput(currentGoal.monthlyDcaIDR);
  }, [activeGoalId, currentGoal.monthlyDcaIDR]);

  // Effective accumulated funds for this goal
  const accumulatedFundsIDR = useMemo(() => {
    if (useTotalPortfolioBalance) {
      return totalBalanceIDR;
    }
    return currentGoal.allocatedBalanceIDR || totalBalanceIDR;
  }, [useTotalPortfolioBalance, totalBalanceIDR, currentGoal]);

  // Calculations
  const targetIDR = currentGoal.targetAmountIDR;
  const progressPercentage = Math.min(200, (accumulatedFundsIDR / targetIDR) * 100);
  const remainingGapIDR = Math.max(0, targetIDR - accumulatedFundsIDR);

  // Time calculations
  const effectiveMonthlyDca = currentGoal.monthlyDcaIDR + acceleratedDcaSlider;
  const currentYear = new Date().getFullYear();
  const yearsToDeadline = Math.max(1, currentGoal.targetDeadlineYear - currentYear);

  // Estimated months to reach goal based on DCA and Sharia yield
  const estimatedMonthsRemaining = useMemo(() => {
    if (remainingGapIDR <= 0) return 0;
    if (effectiveMonthlyDca <= 0) return 999;
    const monthlyRate = (currentGoal.expectedAnnualYieldPercent || 15) / 100 / 12;
    try {
      const numerator = Math.log((remainingGapIDR * monthlyRate) / effectiveMonthlyDca + 1);
      const denominator = Math.log(1 + monthlyRate);
      if (numerator > 0 && denominator > 0) {
        return Math.ceil(numerator / denominator);
      }
    } catch {
      // Fallback linear
    }
    return Math.ceil(remainingGapIDR / effectiveMonthlyDca);
  }, [remainingGapIDR, effectiveMonthlyDca, currentGoal.expectedAnnualYieldPercent]);

  // Sharia Zakat Readiness: 85g gold benchmark
  const goldPriceGram = Math.round(
    (assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000) / 31.1035
  );
  const nisab85gIDR = goldPriceGram * 85;
  const isNisabReached = accumulatedFundsIDR >= nisab85gIDR;
  const estimatedAnnualZakatMaal = isNisabReached ? Math.round(accumulatedFundsIDR * 0.025) : 0;

  // Formatters
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)} Jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
    return `Rp ${val}`;
  };

  // Predictive Timeline Engine: Computes dynamic projected date based on current savings rate
  const predictiveTimeline = useMemo(() => {
    const annualYield =
      timelineScenario === 'conservative'
        ? 6.0
        : timelineScenario === 'aggressive'
        ? 18.5
        : currentGoal.expectedAnnualYieldPercent || 14.5;

    const monthlyRate = annualYield / 100 / 12;
    const initialFunds = accumulatedFundsIDR;
    const target = targetIDR;
    const monthlySavings = Math.max(0, savingsRateInput);

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    // Baseline Anchor: October 2026
    const currentBaseYear = 2026;
    const currentBaseMonth = 9; // 0-indexed: 9 = October

    // Milestone trackers
    let nisabMonth: number | null = initialFunds >= nisab85gIDR ? 0 : null;
    let halfwayMonth: number | null = initialFunds >= target * 0.5 ? 0 : null;
    let threeQuarterMonth: number | null = initialFunds >= target * 0.75 ? 0 : null;
    let completionMonth: number | null = initialFunds >= target ? 0 : null;

    let balance = initialFunds;
    let totalContributed = initialFunds;
    let month = 0;

    if (balance < target) {
      for (month = 1; month <= 360; month++) {
        balance = balance * (1 + monthlyRate) + monthlySavings;
        totalContributed += monthlySavings;

        if (nisabMonth === null && balance >= nisab85gIDR) {
          nisabMonth = month;
        }
        if (halfwayMonth === null && balance >= target * 0.5) {
          halfwayMonth = month;
        }
        if (threeQuarterMonth === null && balance >= target * 0.75) {
          threeQuarterMonth = month;
        }
        if (completionMonth === null && balance >= target) {
          completionMonth = month;
          break;
        }
      }
    }

    const projectedMonths = completionMonth ?? 360;
    const isCompletedAlready = initialFunds >= target;

    const getFormattedDate = (monthsFromNow: number) => {
      const d = new Date(currentBaseYear, currentBaseMonth + monthsFromNow, 1);
      return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const projectedDateFormatted = isCompletedAlready
      ? `${monthNames[currentBaseMonth]} ${currentBaseYear} (Telah Tercapai)`
      : getFormattedDate(projectedMonths);

    // Target deadline comparison (Target Year, December)
    const deadlineMonthsFromNow = Math.max(
      1,
      (currentGoal.targetDeadlineYear - currentBaseYear) * 12 + (11 - currentBaseMonth)
    );

    let statusComparison: 'AHEAD_OF_SCHEDULE' | 'ON_TRACK' | 'BEHIND_SCHEDULE' = 'ON_TRACK';
    const monthDiff = deadlineMonthsFromNow - projectedMonths;

    if (isCompletedAlready || monthDiff > 2) {
      statusComparison = 'AHEAD_OF_SCHEDULE';
    } else if (monthDiff < -2) {
      statusComparison = 'BEHIND_SCHEDULE';
    } else {
      statusComparison = 'ON_TRACK';
    }

    // Required monthly savings to achieve target exactly on the deadline
    let requiredMonthlySavings = 0;
    if (deadlineMonthsFromNow > 0 && initialFunds < target) {
      const compoundFactor = Math.pow(1 + monthlyRate, deadlineMonthsFromNow);
      const fvPrincipal = initialFunds * compoundFactor;
      if (fvPrincipal < target) {
        const gap = target - fvPrincipal;
        const annuityFactor = (compoundFactor - 1) / monthlyRate;
        requiredMonthlySavings = Math.ceil(gap / annuityFactor);
      }
    }

    const totalCompoundYield = Math.max(0, target - totalContributed);

    // Milestone markers for the roadmap
    const milestones = [
      {
        id: 'start',
        label: 'Modal Awal',
        sublabel: 'Hari Ini (Okt 2026)',
        date: getFormattedDate(0),
        amountIDR: initialFunds,
        percentage: Math.min(100, Math.round((initialFunds / target) * 100)),
        isReached: true,
        badge: 'Terkumpul',
      },
      {
        id: 'nisab',
        label: 'Nisab Emas 85g',
        sublabel: 'Zakat Maal 2.5%',
        date: nisabMonth === 0 ? 'Sudah Tercapai' : getFormattedDate(nisabMonth || 12),
        amountIDR: nisab85gIDR,
        percentage: Math.min(100, Math.round((nisab85gIDR / target) * 100)),
        isReached: initialFunds >= nisab85gIDR,
        badge: initialFunds >= nisab85gIDR ? 'Terlampaui' : 'Proyeksi',
      },
      {
        id: 'three_quarter',
        label: '75% Target',
        sublabel: 'Akselerasi Akhir',
        date:
          threeQuarterMonth === 0
            ? 'Sudah Tercapai'
            : getFormattedDate(threeQuarterMonth || Math.max(1, Math.round(projectedMonths * 0.75))),
        amountIDR: Math.round(target * 0.75),
        percentage: 75,
        isReached: initialFunds >= target * 0.75,
        badge: initialFunds >= target * 0.75 ? 'Terlewati' : 'Proyeksi',
      },
      {
        id: 'target',
        label: 'Target Tercapai 🏆',
        sublabel: currentGoal.title,
        date: projectedDateFormatted,
        amountIDR: target,
        percentage: 100,
        isReached: isCompletedAlready,
        badge: isCompletedAlready ? 'Selesai' : 'Estimasi Selesai',
      },
    ];

    return {
      annualYield,
      projectedMonths,
      projectedDateFormatted,
      isCompletedAlready,
      statusComparison,
      monthDiff: Math.abs(monthDiff),
      isAhead: monthDiff > 0,
      totalContributed,
      totalCompoundYield,
      requiredMonthlySavings,
      milestones,
    };
  }, [accumulatedFundsIDR, targetIDR, savingsRateInput, timelineScenario, currentGoal, nisab85gIDR]);

  // Apply new savings rate to goal
  const handleApplySavingsRate = () => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === currentGoal.id ? { ...g, monthlyDcaIDR: savingsRateInput } : g
      )
    );
    setSavedRateToast(true);
    setTimeout(() => setSavedRateToast(false), 3000);
  };

  // Status Badge
  const getStatusBadge = () => {
    if (progressPercentage >= 100) {
      return { label: 'Tercapai 🏆', variant: 'emerald' as const };
    }
    if (progressPercentage >= 70) {
      return { label: 'Mendekati Target 🎯', variant: 'teal' as const };
    }
    if (progressPercentage >= 40) {
      return { label: 'On Track 📈', variant: 'cyan' as const };
    }
    return { label: 'Akumulasi Awal 🌱', variant: 'amber' as const };
  };

  // Icon mapping
  const getGoalIcon = (category: ShariaGoalCategory) => {
    switch (category) {
      case 'hajj_umrah':
        return <Compass className="w-4 h-4 text-emerald-400" />;
      case 'halal_home':
        return <Home className="w-4 h-4 text-teal-400" />;
      case 'retirement_gold':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-cyan-400" />;
      case 'waqf_jariyah':
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      default:
        return <Target className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getColorVariant = (category: ShariaGoalCategory) => {
    switch (category) {
      case 'retirement_gold':
        return 'gold' as const;
      case 'halal_home':
        return 'teal' as const;
      case 'education':
        return 'cyan' as const;
      default:
        return 'emerald' as const;
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (goal: ShariaFinancialGoal) => {
    setEditingGoal({ ...goal });
    setIsEditModalOpen(true);
  };

  // Save Goal Edits
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === editingGoal.id ? { ...editingGoal } : g))
    );
    setIsEditModalOpen(false);
  };

  // Add New Goal
  const handleAddNewGoal = () => {
    const newId = `goal-custom-${Date.now()}`;
    const newGoal: ShariaFinancialGoal = {
      id: newId,
      title: 'Target Finansial Syariah Kustom Baru',
      category: 'custom',
      targetAmountIDR: 500000000,
      allocatedBalanceIDR: totalBalanceIDR,
      targetDeadlineYear: currentYear + 5,
      monthlyDcaIDR: 5000000,
      expectedAnnualYieldPercent: 15.0,
      shariaVehicle: 'Diversifikasi Portofolio Syariah (Emas + Kripto Top)',
      iconName: 'Target',
      description: 'Rencana akumulasi kekayaan berkah untuk cita-cita mulia.',
    };
    setGoals((prev) => [...prev, newGoal]);
    setActiveGoalId(newId);
    handleOpenEdit(newGoal);
  };

  // Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    if (goals.length <= 1) return;
    const remaining = goals.filter((g) => g.id !== goalId);
    setGoals(remaining);
    setActiveGoalId(remaining[0].id);
    setIsEditModalOpen(false);
  };

  return (
    <div
      id="financial-goal-setting-card"
      className={`p-6 rounded-2xl border transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 shadow-xl shadow-slate-950/40'
          : 'bg-white border-emerald-100 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Financial Goal Setting
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Syariah Long-Term Targets
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tetapkan target investasi syariah jangka panjang, monitor dengan visual circular progress bar, dan pantau Predictive Timeline proyeksi tanggal tercapai.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="goal-add-new-btn"
            onClick={handleAddNewGoal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tambah Target</span>
          </button>

          <button
            id="goal-edit-current-btn"
            onClick={() => handleOpenEdit(currentGoal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            <span>Ubah Target</span>
          </button>
        </div>
      </div>

      {/* Goal Switcher Tabs */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {goals.map((goal) => {
          const isActive = goal.id === activeGoalId;
          const currentBal = useTotalPortfolioBalance ? totalBalanceIDR : goal.allocatedBalanceIDR;
          const pct = Math.min(100, Math.round((currentBal / goal.targetAmountIDR) * 100));

          return (
            <button
              key={goal.id}
              onClick={() => setActiveGoalId(goal.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-100 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="p-1 rounded-lg bg-slate-200 dark:bg-slate-800">
                {getGoalIcon(goal.category)}
              </span>
              <span className="truncate max-w-[170px]">{goal.title}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-emerald-500/30 text-emerald-200'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Circular Progress Bar & Goal Diagnostics */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column (5 Cols): Circular Progress Bar Component */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
          <CircularProgressBar
            percentage={progressPercentage}
            size={220}
            strokeWidth={15}
            centerTitle="Pencapaian Target"
            centerValue={`${progressPercentage.toFixed(1)}%`}
            centerSubtitle={`${formatShortIDR(accumulatedFundsIDR)} / ${formatShortIDR(targetIDR)}`}
            statusBadge={getStatusBadge()}
            colorVariant={getColorVariant(currentGoal.category)}
            theme={theme}
          />

          {/* Quick Balance Toggle */}
          <div className="mt-4 flex items-center gap-2 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-[11px]">
            <button
              onClick={() => setUseTotalPortfolioBalance(true)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                useTotalPortfolioBalance
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Total Portofolio ({formatShortIDR(totalBalanceIDR)})
            </button>
            <button
              onClick={() => setUseTotalPortfolioBalance(false)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                !useTotalPortfolioBalance
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alokasi Khusus ({formatShortIDR(currentGoal.allocatedBalanceIDR)})
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Goal Metrics, Timeline, and Acceleration Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {currentGoal.title}
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                Target: {currentGoal.targetDeadlineYear} ({yearsToDeadline} Thn Lagi)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {currentGoal.description}
            </p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Target Nominal</span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
                {formatIDR(targetIDR)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-slate-400 text-[11px] block">Dana Terkumpul</span>
              <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">
                {formatIDR(accumulatedFundsIDR)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[11px] block">Kekurangan (Gap)</span>
              <span className="text-sm font-black text-amber-400 font-mono mt-0.5 block">
                {remainingGapIDR === 0 ? 'Lunas / Tercapai!' : formatIDR(remainingGapIDR)}
              </span>
            </div>
          </div>

          {/* Sharia Strategy & Vehicle */}
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  Wahana Investasi Syariah:
                </span>
                <span className="text-slate-400 ml-1 block sm:inline">
                  {currentGoal.shariaVehicle}
                </span>
              </div>
            </div>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
              Yield: ~{currentGoal.expectedAnnualYieldPercent}% APY
            </span>
          </div>

          {/* Zakat Maal & Spiritual Guardrail Notice */}
          <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                Pembersihan Harta & Kesiapan Zakat Maal (2.5%):
              </span>
              <p className="mt-0.5 leading-relaxed">
                {isNisabReached ? (
                  <>
                    Dana target Anda ({formatShortIDR(accumulatedFundsIDR)}) telah melampaui nisab emas 85g ({formatShortIDR(nisab85gIDR)}). Saat haul 1 tahun tercapai, estimasi zakat maal wajib disucikan sebesar{' '}
                    <strong className="text-teal-400 font-mono">{formatIDR(estimatedAnnualZakatMaal)}</strong> agar investasi senantiasa berkah.
                  </>
                ) : (
                  <>
                    Target berada di bawah ambang batas nisab 85g emas ({formatShortIDR(nisab85gIDR)}). Belum terkena kewajiban zakat maal, disarankan memperbanyak infaq sunnah.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* DCA Timeline & Acceleration Slider Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">
                  Rencana Rutin:{' '}
                  <strong className="text-slate-200 font-mono">
                    {formatIDR(currentGoal.monthlyDcaIDR)} / bln
                  </strong>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">
                  Estimasi: <strong className="text-emerald-400">{estimatedMonthsRemaining} Bulan</strong>
                </span>
              </div>

              <button
                onClick={() => setIsSimulatorOpen((prev) => !prev)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isSimulatorOpen ? 'Sembunyikan Akselerasi' : 'Simulasi Akselerasi DCA'}</span>
              </button>
            </div>

            {/* Interactive DCA Acceleration Slider */}
            {isSimulatorOpen && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">
                    Tambahan Top-up DCA Bulanan: +{formatIDR(acceleratedDcaSlider)} / bln
                  </span>
                  <span className="text-emerald-400 font-mono">
                    Total DCA: {formatIDR(effectiveMonthlyDca)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20000000}
                  step={500000}
                  value={acceleratedDcaSlider}
                  onChange={(e) => setAcceleratedDcaSlider(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Standard</span>
                  <span className="text-emerald-400 font-medium">
                    {acceleratedDcaSlider > 0
                      ? `Mempercepat pencapaian target hingga ~${Math.max(1, Math.round((currentGoal.targetAmountIDR - accumulatedFundsIDR) / currentGoal.monthlyDcaIDR - estimatedMonthsRemaining))} bulan lebih awal!`
                      : 'Geser slider untuk melihat percepatan waktu pencapaian'}
                  </span>
                  <span>+Rp 20 Jt/bln</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREDICTIVE TIMELINE SECTION (Primary Feature Request)                     */}
      {/* Uses current savings rate to estimate the projected date for achieving target */}
      {/* ========================================================================= */}
      <div
        id="goal-predictive-timeline-section"
        className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-5"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Predictive Timeline</span>
                  <span className="text-slate-400 font-normal">|</span>
                  <span className="text-emerald-400">Estimasi Tanggal Tercapainya Target</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Compound Model
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Proyeksi cerdas tanggal tercapai berdasarkan laju tabungan rutin (savings rate) dan imbal hasil portofolio syariah majemuk.
              </p>
            </div>
          </div>

          {/* Hero Projected Date Badge */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/40 px-3.5 py-2 rounded-xl shadow-md shadow-emerald-500/10">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Proyeksi Selesai:
              </span>
              <span className="text-sm font-black text-emerald-300 font-mono">
                {predictiveTimeline.projectedDateFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Current Savings Rate (Laju Tabungan) Interactive Controller */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Laju Tabungan Rutin (Savings Rate Bulanan):
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Ubah laju tabungan untuk melihat bagaimana tanggal pencapaian target bergeser secara real-time.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                {formatIDR(savingsRateInput)} <span className="text-[10px] text-slate-400 font-normal">/ bln</span>
              </span>

              <button
                onClick={handleApplySavingsRate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
                title="Simpan laju tabungan ini sebagai rencana rutin target"
              >
                {savedRateToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terapkan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Savings Rate Slider & Steppers */}
          <div className="space-y-2 pt-1">
            <input
              type="range"
              min={500000}
              max={30000000}
              step={500000}
              value={savingsRateInput}
              onChange={(e) => setSavingsRateInput(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Pintasan Cepat:</span>
                {[
                  { label: '-Rp 1Jt', delta: -1000000 },
                  { label: '+Rp 1Jt', delta: 1000000 },
                  { label: '+Rp 2.5Jt', delta: 2500000 },
                  { label: '+Rp 5Jt', delta: 5000000 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => setSavingsRateInput((prev) => Math.max(500000, Math.min(30000000, prev + btn.delta)))}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Sharia Yield Scenario Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 px-2 font-medium">Skenario Yield:</span>
                <button
                  onClick={() => setTimelineScenario('conservative')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    timelineScenario === 'conservative'
                      ? 'bg-slate-800 text-slate-200 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Konservatif (6%)
                </button>
                <button
                  onClick={() => setTimelineScenario('balanced')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    timelineScenario === 'balanced'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Seimbang (~{currentGoal.expectedAnnualYieldPercent}%)
                </button>
                <button
                  onClick={() => setTimelineScenario('aggressive')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    timelineScenario === 'aggressive'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Optimal (18.5%)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Predictive Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Metric 1: Projected Date */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Proyeksi Tanggal Tercapai
            </span>
            <div className="mt-2">
              <span className="text-base font-black text-emerald-400 font-mono block">
                {predictiveTimeline.projectedDateFormatted}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {predictiveTimeline.isCompletedAlready
                  ? 'Target sudah terpenuhi saat ini'
                  : `~${predictiveTimeline.projectedMonths} Bulan (${(predictiveTimeline.projectedMonths / 12).toFixed(1)} Tahun Lagi)`}
              </span>
            </div>
          </div>

          {/* Metric 2: Status against Deadline */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Status Tenggat ({currentGoal.targetDeadlineYear})
            </span>
            <div className="mt-2">
              {predictiveTimeline.statusComparison === 'AHEAD_OF_SCHEDULE' ? (
                <>
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Lebih Cepat {predictiveTimeline.monthDiff} Bulan!
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Super On-Track melebihi ekspektasi
                  </span>
                </>
              ) : predictiveTimeline.statusComparison === 'ON_TRACK' ? (
                <>
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    Tepat Waktu Sesuai Target
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Konsisten sesuai tenggat {currentGoal.targetDeadlineYear}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    Terlambat {predictiveTimeline.monthDiff} Bulan
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Perlu top-up DCA bulanan
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Metric 3: Total Principal Contributions */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Total Tabungan Pokok
            </span>
            <div className="mt-2">
              <span className="text-base font-black text-slate-100 font-mono block">
                {formatShortIDR(predictiveTimeline.totalContributed)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Alokasi murni dari kantong Anda
              </span>
            </div>
          </div>

          {/* Metric 4: Compounding Yield Earned */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Bagi Hasil Syariah Diperoleh
            </span>
            <div className="mt-2">
              <span className="text-base font-black text-emerald-400 font-mono block">
                +{formatShortIDR(predictiveTimeline.totalCompoundYield)}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Pertumbuhan bebas riba ({predictiveTimeline.annualYield}% p.a.)
              </span>
            </div>
          </div>
        </div>

        {/* Visual Roadmap / Timeline Track */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Tahapan Tonggak Finansial (Milestone Roadmap):
            </span>
            <span className="text-slate-400 text-[11px]">
              Tenggat Target: <strong>Desember {currentGoal.targetDeadlineYear}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {predictiveTimeline.milestones.map((m, idx) => (
              <div
                key={m.id}
                className={`p-3.5 rounded-xl border relative transition-all ${
                  m.isReached
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-100'
                    : idx === predictiveTimeline.milestones.length - 1
                    ? 'bg-gradient-to-br from-slate-950 to-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}
              >
                {/* Connecting Line Indicator */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                      m.isReached
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    Tahap {idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      m.isReached ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {m.date}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-100 mb-0.5 flex items-center gap-1.5">
                  {m.isReached ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>{m.label}</span>
                </div>

                <div className="text-sm font-black font-mono text-emerald-400 mt-1">
                  {formatIDR(m.amountIDR)}
                </div>

                <p className="text-[10px] text-slate-400 mt-1">
                  {m.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Guidance & Action Advice */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              {predictiveTimeline.statusComparison === 'AHEAD_OF_SCHEDULE' ? (
                <p>
                  <strong>Hasil Prediksi Sangat Positif:</strong> Dengan laju tabungan saat ini ({formatIDR(savingsRateInput)}/bln), target <span className="text-emerald-300 font-semibold">{currentGoal.title}</span> diproyeksikan selesai pada <strong className="text-emerald-400 font-mono">{predictiveTimeline.projectedDateFormatted}</strong>, sekitar <strong>{predictiveTimeline.monthDiff} bulan lebih awal</strong> dari batas tahun {currentGoal.targetDeadlineYear}.
                </p>
              ) : predictiveTimeline.statusComparison === 'ON_TRACK' ? (
                <p>
                  <strong>Hasil Prediksi On-Track:</strong> Laju tabungan Anda ({formatIDR(savingsRateInput)}/bln) sangat pas dan teratur untuk mencapai target <span className="text-cyan-300 font-semibold">{currentGoal.title}</span> tepat pada <strong className="text-cyan-400 font-mono">{predictiveTimeline.projectedDateFormatted}</strong>.
                </p>
              ) : (
                <p>
                  <strong>Saran Akselerasi Timeline:</strong> Untuk menyelesaikan target sebelum akhir {currentGoal.targetDeadlineYear}, laju tabungan perlu dinaikkan menjadi minimal <strong className="text-amber-400 font-mono">{formatIDR(predictiveTimeline.requiredMonthlySavings)}/bln</strong> (+{formatIDR(Math.max(0, predictiveTimeline.requiredMonthlySavings - savingsRateInput))}/bln dari laju saat ini).
                </p>
              )}
            </div>
          </div>

          {predictiveTimeline.statusComparison === 'BEHIND_SCHEDULE' && predictiveTimeline.requiredMonthlySavings > 0 && (
            <button
              onClick={() => setSavingsRateInput(predictiveTimeline.requiredMonthlySavings)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all shrink-0 whitespace-nowrap shadow-sm"
            >
              Setel ke {formatShortIDR(predictiveTimeline.requiredMonthlySavings)}/bln
            </button>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Sinkronisasi otomatis dengan pergerakan harga emas PAXG dan hasil trading syariah harian.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onScrollToProjection && (
            <button
              onClick={onScrollToProjection}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Lihat Proyeksi AI Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('trading')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              Aktifkan Auto DCA Bot
            </button>
          )}
        </div>
      </div>

      {/* Edit / Customize Goal Modal */}
      {isEditModalOpen && editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border text-slate-100 space-y-4 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-sm">Sesuaikan Target Finansial Syariah</h4>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Target / Cita-Cita</label>
                <input
                  type="text"
                  required
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kategori Syariah</label>
                  <select
                    value={editingGoal.category}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        category: e.target.value as ShariaGoalCategory,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="hajj_umrah" className="bg-slate-900 text-slate-100">
                      Ibadah Haji & Umrah
                    </option>
                    <option value="halal_home" className="bg-slate-900 text-slate-100">
                      Rumah Idaman Bebas Riba
                    </option>
                    <option value="retirement_gold" className="bg-slate-900 text-slate-100">
                      Dana Pensiun & Emas
                    </option>
                    <option value="education" className="bg-slate-900 text-slate-100">
                      Pendidikan Anak
                    </option>
                    <option value="waqf_jariyah" className="bg-slate-900 text-slate-100">
                      Wakaf Produktif
                    </option>
                    <option value="custom" className="bg-slate-900 text-slate-100">
                      Target Finansial Kustom
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Tenggat Waktu (Tahun)</label>
                  <input
                    type="number"
                    min={currentYear}
                    max={currentYear + 25}
                    value={editingGoal.targetDeadlineYear}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        targetDeadlineYear: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Target Nominal (IDR)</label>
                <input
                  type="number"
                  step={5000000}
                  required
                  value={editingGoal.targetAmountIDR}
                  onChange={(e) =>
                    setEditingGoal({
                      ...editingGoal,
                      targetAmountIDR: Number(e.target.value),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {[100000000, 350000000, 500000000, 850000000, 1500000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() =>
                        setEditingGoal({
                          ...editingGoal,
                          targetAmountIDR: amt,
                        })
                      }
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
                    >
                      {formatShortIDR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">DCA Rutin (IDR / bln)</label>
                  <input
                    type="number"
                    step={500000}
                    value={editingGoal.monthlyDcaIDR}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        monthlyDcaIDR: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Ekspektasi Yield (% / thn)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={editingGoal.expectedAnnualYieldPercent}
                    onChange={(e) =>
                      setEditingGoal({
                        ...editingGoal,
                        expectedAnnualYieldPercent: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Wahana & Instrumen Syariah</label>
                <input
                  type="text"
                  value={editingGoal.shariaVehicle}
                  onChange={(e) =>
                    setEditingGoal({
                      ...editingGoal,
                      shariaVehicle: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Catatan / Motivasi</label>
                <textarea
                  rows={2}
                  value={editingGoal.description}
                  onChange={(e) =>
                    setEditingGoal({
                      ...editingGoal,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {goals.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(editingGoal.id)}
                    className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold"
                  >
                    Hapus Target
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
