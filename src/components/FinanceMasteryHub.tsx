import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Scale,
  Coins,
  FileText,
  Copy,
  Check,
  Download,
  Share2,
  ChevronRight,
  RotateCcw,
  Layers,
  Lock,
  Percent,
  Compass,
  Zap,
  Info,
  DollarSign,
  Briefcase,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Language,
  Theme,
  CryptoAsset,
  MasteryTrack,
  MasteryLesson,
  MasteryCertificate,
  AaoifiScreenerResult,
  DcaSimulationYear,
} from '../types';
import {
  masteryTracks,
  masteryQuizQuestions,
  masteryPlaybooks,
} from '../data/masteryData';
import { generateMasteryCertificatePdf } from '../utils/masteryCertificatePdfGenerator';
import { sha256 } from '../utils/cryptoSecurity';

interface FinanceMasteryHubProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR: number;
  language: Language;
  theme: Theme;
  onNavigateToTab?: (tab: string) => void;
  onApplyBotStrategy?: (strategy: 'conservative' | 'balanced' | 'dynamic') => void;
  onRecordCertificateToBlockchain?: (params: {
    title: string;
    targetAmountIDR: number;
    projectedDateFormatted: string;
    cipherText: string;
    signature: string;
    merkleRoot: string;
    txHash: string;
    goal: any;
  }) => void;
}

export const FinanceMasteryHub: React.FC<FinanceMasteryHubProps> = ({
  assets,
  totalBalanceIDR,
  zakatReserveIDR,
  language,
  theme,
  onNavigateToTab,
  onApplyBotStrategy,
  onRecordCertificateToBlockchain,
}) => {
  const isDark = theme === 'dark';

  // Navigation Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'academy' | 'simulators' | 'playbooks' | 'exam'>('academy');

  // Academy Track Selection
  const [selectedTrackId, setSelectedTrackId] = useState<string>('track-fiqh');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>('lesson-1-1');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    'lesson-1-1',
    'lesson-1-2',
    'lesson-2-1',
  ]);

  // Simulator Sub-tabs
  const [activeSimulator, setActiveSimulator] = useState<'dca' | 'aaoifi' | 'fire' | 'allocation'>('dca');

  // Simulator 1: DCA & Compound Zakat States
  const [dcaInitialCapital, setDcaInitialCapital] = useState<number>(25000000); // Rp 25M
  const [dcaMonthlySavings, setDcaMonthlySavings] = useState<number>(3500000); // Rp 3.5M
  const [dcaAnnualYield, setDcaAnnualYield] = useState<number>(11.5); // 11.5% APY
  const [dcaYears, setDcaYears] = useState<number>(10);
  const [dcaInflationRate, setDcaInflationRate] = useState<number>(3.5); // 3.5% inflation
  const [dcaDeductZakat, setDcaDeductZakat] = useState<boolean>(true);

  // Simulator 2: AAOIFI Screener States
  const [screenerPreset, setScreenerPreset] = useState<string>('custom');
  const [screenerMarketCap, setScreenerMarketCap] = useState<number>(450000000000); // 450 Miliar
  const [screenerInterestDebt, setScreenerInterestDebt] = useState<number>(95000000000); // 95 Miliar
  const [screenerInterestCash, setScreenerInterestCash] = useState<number>(75000000000); // 75 Miliar
  const [screenerGrossRevenue, setScreenerGrossRevenue] = useState<number>(120000000000); // 120 Miliar
  const [screenerNonHalalRevenue, setScreenerNonHalalRevenue] = useState<number>(2400000000); // 2.4 Miliar
  const [sampleDividendIDR, setSampleDividendIDR] = useState<number>(10000000); // 10 Juta

  // Simulator 3: FIRE Syariah States
  const [fireCurrentAge, setFireCurrentAge] = useState<number>(29);
  const [fireRetireAge, setFireRetireAge] = useState<number>(45);
  const [fireMonthlyExpense, setFireMonthlyExpense] = useState<number>(15000000); // Rp 15M
  const [fireExpectedYield, setFireExpectedYield] = useState<number>(8.5); // 8.5%
  const [fireCurrentSavings, setFireCurrentSavings] = useState<number>(totalBalanceIDR || 120000000);

  // Simulator 4: Asset Allocation States
  const [allocationMode, setAllocationMode] = useState<'conservative' | 'balanced' | 'dynamic'>('balanced');

  // Exam States
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [recipientName, setRecipientName] = useState<string>('Benny Kurniawan');
  const [generatedCertificate, setGeneratedCertificate] = useState<MasteryCertificate | null>(null);
  const [isRecordingOnChain, setIsRecordingOnChain] = useState<boolean>(false);
  const [blockchainTxRecorded, setBlockchainTxRecorded] = useState<string | null>(null);
  const [copiedPlaybookId, setCopiedPlaybookId] = useState<string | null>(null);

  // Gold price benchmark for Nisab
  const paxgAsset = assets.find((a) => a.symbol === 'PAXG');
  const goldPricePerGramIDR = Math.round(
    (paxgAsset?.priceIDR || 42100000) / 31.1035
  );
  const currentNisabIDR = goldPricePerGramIDR * 85; // 85 grams pure gold

  // Formatters
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCompactIDR = (val: number) => {
    if (val >= 1000000000000) return `Rp ${(val / 1000000000000).toFixed(1)}T`;
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} Miliar`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Juta`;
    return formatIDR(val);
  };

  // Toggle Lesson Completion
  const toggleLessonCompletion = (id: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const totalLessonsCount = masteryTracks.reduce((acc, t) => acc + t.lessons.length, 0);
  const completionPercentage = Math.round((completedLessonIds.length / totalLessonsCount) * 100);

  // Active track object
  const currentTrack = useMemo(() => {
    return masteryTracks.find((t) => t.id === selectedTrackId) || masteryTracks[0];
  }, [selectedTrackId]);

  // -------------------------------------------------------------
  // SIMULATOR 1 COMPUTATION: Halal DCA & Nisab Compound Growth
  // -------------------------------------------------------------
  const dcaSimulationData: DcaSimulationYear[] = useMemo(() => {
    const results: DcaSimulationYear[] = [];
    let grossBalance = dcaInitialCapital;
    let netBalance = dcaInitialCapital;
    let cumulativeInvested = dcaInitialCapital;
    let cumulativeZakat = 0;

    for (let yr = 1; yr <= dcaYears; yr++) {
      const annualDeposit = dcaMonthlySavings * 12;
      cumulativeInvested += annualDeposit;

      // Yield calculation on average balance
      const yieldFactor = 1 + dcaAnnualYield / 100;
      grossBalance = (grossBalance + annualDeposit) * yieldFactor;

      let annualZakat = 0;
      if (dcaDeductZakat && grossBalance >= currentNisabIDR) {
        // 2.5% Zakat Maal on total liquid wealth
        annualZakat = grossBalance * 0.025;
        cumulativeZakat += annualZakat;
        netBalance = grossBalance - cumulativeZakat;
      } else {
        netBalance = grossBalance;
      }

      // Inflation adjustment
      const inflationFactor = Math.pow(1 + dcaInflationRate / 100, yr);
      const inflationAdjusted = netBalance / inflationFactor;

      results.push({
        year: yr,
        age: 28 + yr,
        totalInvestedIDR: Math.round(cumulativeInvested),
        grossBalanceIDR: Math.round(grossBalance),
        annualZakatPaidIDR: Math.round(annualZakat),
        cumulativeZakatPaidIDR: Math.round(cumulativeZakat),
        netBalanceIDR: Math.round(netBalance),
        inflationAdjustedBalanceIDR: Math.round(inflationAdjusted),
        isNisabExceeded: grossBalance >= currentNisabIDR,
      });
    }

    return results;
  }, [
    dcaInitialCapital,
    dcaMonthlySavings,
    dcaAnnualYield,
    dcaYears,
    dcaInflationRate,
    dcaDeductZakat,
    currentNisabIDR,
  ]);

  const finalDcaYear = dcaSimulationData[dcaSimulationData.length - 1];

  // -------------------------------------------------------------
  // SIMULATOR 2 COMPUTATION: AAOIFI Sharia Screener & Tathir
  // -------------------------------------------------------------
  const screenerResult: AaoifiScreenerResult = useMemo(() => {
    const debtRatio = screenerMarketCap > 0 ? (screenerInterestDebt / screenerMarketCap) * 100 : 0;
    const cashRatio = screenerMarketCap > 0 ? (screenerInterestCash / screenerMarketCap) * 100 : 0;
    const nonHalalRevenueRatio = screenerGrossRevenue > 0 ? (screenerNonHalalRevenue / screenerGrossRevenue) * 100 : 0;

    const isDebtCompliant = debtRatio <= 33;
    const isCashCompliant = cashRatio <= 30;
    const isRevenueCompliant = nonHalalRevenueRatio <= 5;

    let overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'BORDERLINE' = 'COMPLIANT';
    if (!isDebtCompliant || !isCashCompliant || !isRevenueCompliant) {
      overallStatus = 'NON_COMPLIANT';
    } else if (debtRatio > 30 || cashRatio > 27 || nonHalalRevenueRatio > 4) {
      overallStatus = 'BORDERLINE';
    }

    const purificationPercentage = nonHalalRevenueRatio;
    const purificationAmountIDR = Math.round((sampleDividendIDR * purificationPercentage) / 100);

    return {
      debtRatio,
      cashRatio,
      nonHalalRevenueRatio,
      isDebtCompliant,
      isCashCompliant,
      isRevenueCompliant,
      overallStatus,
      purificationPercentage,
      purificationAmountIDR,
    };
  }, [
    screenerMarketCap,
    screenerInterestDebt,
    screenerInterestCash,
    screenerGrossRevenue,
    screenerNonHalalRevenue,
    sampleDividendIDR,
  ]);

  const handleApplyPreset = (presetKey: string) => {
    setScreenerPreset(presetKey);
    if (presetKey === 'telkom') {
      setScreenerMarketCap(340000000000000); // 340 Triliun
      setScreenerInterestDebt(55000000000000); // 55 Triliun (16.1%)
      setScreenerInterestCash(32000000000000); // 32 Triliun (9.4%)
      setScreenerGrossRevenue(149000000000000); // 149 Triliun
      setScreenerNonHalalRevenue(1800000000000); // 1.8 Triliun (1.2%)
    } else if (presetKey === 'paxg') {
      setScreenerMarketCap(12000000000000); // 12 Triliun
      setScreenerInterestDebt(0); // 0%
      setScreenerInterestCash(0); // 0%
      setScreenerGrossRevenue(500000000000); // 500 Miliar
      setScreenerNonHalalRevenue(0); // 0%
    } else if (presetKey === 'high_debt_corp') {
      setScreenerMarketCap(80000000000000); // 80 Triliun
      setScreenerInterestDebt(42000000000000); // 42 Triliun (52.5% -> FAIL)
      setScreenerInterestCash(18000000000000); // 18 Triliun (22.5%)
      setScreenerGrossRevenue(65000000000000); // 65 Triliun
      setScreenerNonHalalRevenue(4500000000000); // 4.5 Triliun (6.9% -> FAIL)
    }
  };

  // -------------------------------------------------------------
  // SIMULATOR 3 COMPUTATION: FIRE Syariah Planner
  // -------------------------------------------------------------
  const firePlan = useMemo(() => {
    const annualLivingExpense = fireMonthlyExpense * 12;
    const yearsToRetire = Math.max(1, fireRetireAge - fireCurrentAge);

    // Adjusted yield after 2.5% Zakat Maal deduction
    const netYieldAfterZakatPercent = Math.max(1.5, fireExpectedYield - 2.5);

    // Target capital needed to generate annualLivingExpense indefinitely from netYield
    const targetCapitalRequired = (annualLivingExpense / (netYieldAfterZakatPercent / 100));

    // Deficit gap from current savings
    const capitalGap = Math.max(0, targetCapitalRequired - fireCurrentSavings);

    // Compound future value factor over yearsToRetire
    const monthlyRate = fireExpectedYield / 100 / 12;
    const totalMonths = yearsToRetire * 12;

    // Monthly saving required to bridge the gap: PMT formula
    let requiredMonthlySavings = 0;
    if (capitalGap > 0) {
      const fvCurrentSavings = fireCurrentSavings * Math.pow(1 + monthlyRate, totalMonths);
      const remainingDeficit = Math.max(0, targetCapitalRequired - fvCurrentSavings);
      if (remainingDeficit > 0) {
        const annuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
        requiredMonthlySavings = remainingDeficit / annuityFactor;
      }
    }

    const currentReadinessPercent = Math.min(
      100,
      Math.round((fireCurrentSavings / targetCapitalRequired) * 100)
    );

    return {
      annualLivingExpense,
      yearsToRetire,
      netYieldAfterZakatPercent,
      targetCapitalRequired: Math.round(targetCapitalRequired),
      capitalGap: Math.round(capitalGap),
      requiredMonthlySavings: Math.round(requiredMonthlySavings),
      currentReadinessPercent,
    };
  }, [
    fireCurrentAge,
    fireRetireAge,
    fireMonthlyExpense,
    fireExpectedYield,
    fireCurrentSavings,
  ]);

  // -------------------------------------------------------------
  // EXAM SCORING & CERTIFICATION LOGIC
  // -------------------------------------------------------------
  const examScore = useMemo(() => {
    let correct = 0;
    masteryQuizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return Math.round((correct / masteryQuizQuestions.length) * 100);
  }, [userAnswers]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    if (isExamSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitExam = async () => {
    setIsExamSubmitted(true);
    const score = examScore;

    if (score >= 70) {
      // Confetti celebrate!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      });

      const hashRaw = `CERT-${recipientName}-${Date.now()}-${score}-AAOIFI57`;
      const verificationHash = await sha256(hashRaw);
      const certId = `FC-MASTERY-${Math.floor(100000 + Math.random() * 900000)}`;

      let grade = 'Jayyid (Good)';
      if (score >= 90) grade = 'Mumtaz Ma\'a Martabah Asy-Syaraf (Highest Distinction)';
      else if (score >= 80) grade = 'Jayyid Jiddan (Very Good)';

      const newCert: MasteryCertificate = {
        certificateId: certId,
        recipientName: recipientName.trim() || 'Benny Kurniawan',
        issueDate: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        score,
        verificationHash: verificationHash.slice(0, 32),
        grade,
        blockNumber: 1420 + Math.floor(Math.random() * 50),
      };

      setGeneratedCertificate(newCert);
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setIsExamSubmitted(false);
    setGeneratedCertificate(null);
    setBlockchainTxRecorded(null);
  };

  const handleDownloadCertificate = () => {
    if (!generatedCertificate) return;
    generateMasteryCertificatePdf({
      certificate: generatedCertificate,
      investorWallet: '0x71C849A2b36eB6849F0302FeF4A39',
      skipAutoSave: false,
    });
  };

  const handleRecordToBlockchainLedger = async () => {
    if (!generatedCertificate) return;
    setIsRecordingOnChain(true);

    try {
      const txHash = await sha256(`TX-CERT-${generatedCertificate.certificateId}-${Date.now()}`);
      const cipherText = `enc:v2:CERT_PROOF_${generatedCertificate.certificateId}_${generatedCertificate.verificationHash}`;

      if (onRecordCertificateToBlockchain) {
        onRecordCertificateToBlockchain({
          title: `Sertifikasi Syariah: ${generatedCertificate.grade}`,
          targetAmountIDR: 0,
          projectedDateFormatted: generatedCertificate.issueDate,
          cipherText,
          signature: txHash.slice(0, 24),
          merkleRoot: '0x' + txHash.slice(24, 48),
          txHash,
          goal: {
            id: generatedCertificate.certificateId,
            title: `Sertifikasi Sharia Investment Mastery (${generatedCertificate.score}%)`,
            category: 'education',
            targetAmountIDR: 0,
            allocatedBalanceIDR: 0,
            targetDeadlineYear: new Date().getFullYear(),
            monthlyDcaIDR: 0,
            expectedAnnualYieldPercent: 0,
            shariaVehicle: 'Akademi FinanceCity PoSS',
            iconName: 'Award',
            description: `Lulus ujian mastery dengan nilai ${generatedCertificate.score}%. Terverifikasi DSN-MUI & AAOIFI No. 57.`,
          },
        });
      }

      setBlockchainTxRecorded(txHash);
    } catch {
      // Fallback
    } finally {
      setIsRecordingOnChain(false);
    }
  };

  const handleCopyPlaybook = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPlaybookId(id);
    setTimeout(() => setCopiedPlaybookId(null), 2500);
  };

  return (
    <div className="space-y-8" id="finance-mastery-hub-root">
      {/* Hero Header & Progress Overview */}
      <div
        className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border-slate-800 shadow-xl'
            : 'bg-gradient-to-br from-emerald-50/90 via-white to-amber-50/50 border-emerald-100 shadow-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <GraduationCap className="w-3.5 h-3.5" />
                Finance & Investment Mastery
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-3 h-3" />
                Kurikulum Terakreditasi AAOIFI No. 57 & DSN-MUI
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Kuasai Arsitektur Investasi & <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
                Kekayaan Syariah Modern
              </span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Jembatan antara Fiqh Muamalat autentik dan eksekusi kuantitatif Web3. Pelajari struktur Sukuk, penyaringan saham AAOIFI, eliminasi total Riba & Gharar, simulasi FIRE Syariah, dan dapatkan sertifikasi digital terverifikasi on-chain blockchain.
            </p>
          </div>

          {/* Quick Mastery Progression Card */}
          <div
            className={`flex flex-col sm:flex-row lg:flex-col items-center gap-4 p-5 rounded-2xl border min-w-[280px] ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-emerald-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4 w-full">
              <div className="relative w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 text-white font-black text-xl shadow-md">
                <span>{completionPercentage}%</span>
              </div>
              <div>
                <div className="text-xs uppercase font-semibold text-slate-400">Status Pencapaian</div>
                <div className="text-base font-bold text-emerald-400">Level 4: Syariah Asset Architect</div>
                <div className="text-xs text-slate-500">{completedLessonIds.length} dari {totalLessonsCount} materi tuntas</div>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveSubTab('exam')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs"
              >
                <Award className="w-3.5 h-3.5" />
                Ambil Ujian
              </button>
              <button
                onClick={() => {
                  setActiveSubTab('simulators');
                  setActiveSimulator('dca');
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-semibold border transition-all ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Buka Lab
              </button>
            </div>
          </div>
        </div>

        {/* Top Sub-Navigation Tabs */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            id="mastery-subtab-academy"
            onClick={() => setActiveSubTab('academy')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'academy'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Akademi & Modul Fiqh (4 Track)
          </button>

          <button
            id="mastery-subtab-simulators"
            onClick={() => setActiveSubTab('simulators')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'simulators'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            2. Lab Simulasi Finansial (4 Tools)
          </button>

          <button
            id="mastery-subtab-playbooks"
            onClick={() => setActiveSubTab('playbooks')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'playbooks'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            3. Playbook Strategi Halal
          </button>

          <button
            id="mastery-subtab-exam"
            onClick={() => setActiveSubTab('exam')}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
              activeSubTab === 'exam'
                ? 'bg-emerald-600 text-white shadow-md'
                : isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4" />
            4. Ujian Sertifikasi & Credential On-Chain
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: ACADEMY TRACKS & EXPANDABLE LESSONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'academy' && (
        <div className="space-y-6">
          {/* Track Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {masteryTracks.map((track) => {
              const isSelected = track.id === selectedTrackId;
              const completedCount = track.lessons.filter((l) => completedLessonIds.includes(l.id)).length;
              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                      : 'border-slate-200 bg-white hover:border-emerald-200 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        track.level === 'Beginner'
                          ? 'bg-blue-500/20 text-blue-400'
                          : track.level === 'Intermediate'
                          ? 'bg-teal-500/20 text-teal-400'
                          : track.level === 'Advanced'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {track.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {completedCount}/{track.lessons.length} Selesai
                    </span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base leading-snug mb-1">
                    {track.title}
                  </h3>
                  <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {track.subtitle}
                  </p>

                  {/* Micro Progress Bar */}
                  <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${(completedCount / track.lessons.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Track Detail & Lesson List */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  {currentTrack.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {currentTrack.title}
                </h2>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {currentTrack.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allIds = currentTrack.lessons.map((l) => l.id);
                    setCompletedLessonIds((prev) => Array.from(new Set([...prev, ...allIds])));
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                >
                  Tandai Semua Selesai
                </button>
              </div>
            </div>

            {/* Accordion Lessons */}
            <div className="mt-6 space-y-4">
              {currentTrack.lessons.map((lesson, idx) => {
                const isExpanded = expandedLessonId === lesson.id;
                const isCompleted = completedLessonIds.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? isDark
                          ? 'border-emerald-500/50 bg-slate-950/80 shadow-md'
                          : 'border-emerald-400 bg-emerald-50/30 shadow-xs'
                        : isDark
                        ? 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/70'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    {/* Lesson Header Row */}
                    <div
                      onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLessonCompletion(lesson.id);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-400 dark:border-slate-700 hover:border-emerald-500 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400">
                              Modul {idx + 1} • {lesson.durationMinutes} menit
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400">
                                Selesai
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-bold truncate">
                            {lesson.title}
                          </h4>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          isExpanded ? 'rotate-90 text-emerald-500' : ''
                        }`}
                      />
                    </div>

                    {/* Lesson Body Content */}
                    {isExpanded && (
                      <div className="px-5 pb-6 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-5 text-sm">
                        <p className={`leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {lesson.summary}
                        </p>

                        {/* Key Takeaways */}
                        <div
                          className={`p-4 rounded-xl border ${
                            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Poin Kunci & Prinsip Fiqh
                          </div>
                          <ul className="space-y-2">
                            {lesson.keyTakeaways.map((point, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Practical Application in FinanceCity */}
                        <div
                          className={`p-4 rounded-xl border ${
                            isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                          }`}
                        >
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            Implementasi Praktis di Ekosistem
                          </div>
                          <p className="text-xs leading-relaxed">{lesson.practicalExample}</p>
                        </div>

                        {/* Fatwa & Jurisprudence Source */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-amber-500" />
                            <strong>Rujukan Fatwa:</strong> {lesson.fatwaReference}
                          </span>
                          <button
                            onClick={() => toggleLessonCompletion(lesson.id)}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                              isCompleted
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                            }`}
                          >
                            {isCompleted ? 'Batalkan Status Selesai' : 'Tandai Selesai & Lanjutkan'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: INTERACTIVE SIMULATION LAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'simulators' && (
        <div className="space-y-6">
          {/* Simulator Tool Nav */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveSimulator('dca')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeSimulator === 'dca'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              1. Halal DCA & Nisab Accumulator
            </button>

            <button
              onClick={() => setActiveSimulator('aaoifi')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeSimulator === 'aaoifi'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Scale className="w-4 h-4" />
              2. AAOIFI Stock & Token Screener
            </button>

            <button
              onClick={() => setActiveSimulator('fire')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeSimulator === 'fire'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              3. FIRE Syariah Planner (Zakat-Adjusted)
            </button>

            <button
              onClick={() => setActiveSimulator('allocation')}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                activeSimulator === 'allocation'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : isDark
                  ? 'bg-slate-900 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              4. Sharia Asset Allocation Optimizer
            </button>
          </div>

          {/* SIMULATOR 1: HALAL DCA & NISAB ACCUMULATOR */}
          {activeSimulator === 'dca' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                      Compound Halal Simulator
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Nisab Emas 85g: {formatIDR(currentNisabIDR)}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    Simulasi Akumulasi DCA Halal & Pengurangan Zakat Maal
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Hitung proyeksi akumulasi modal jangka panjang dengan diversifikasi spot syariah, pertumbuhan majemuk halal, penyesuaian inflasi riil, serta kewajiban Zakat Maal tahunan 2.5% otomatis saat melampaui Nisab.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={dcaDeductZakat}
                      onChange={(e) => setDcaDeductZakat(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Otomatis Zakat Maal 2.5%</span>
                  </label>
                </div>
              </div>

              {/* Input Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Modal Awal</span>
                    <span className="text-emerald-400 font-bold">{formatIDR(dcaInitialCapital)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000000"
                    max="200000000"
                    step="5000000"
                    value={dcaInitialCapital}
                    onChange={(e) => setDcaInitialCapital(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Rp 5 Jt - Rp 200 Jt</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Tabungan Rutin / Bulan (DCA)</span>
                    <span className="text-emerald-400 font-bold">{formatIDR(dcaMonthlySavings)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="25000000"
                    step="500000"
                    value={dcaMonthlySavings}
                    onChange={(e) => setDcaMonthlySavings(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Rp 1 Jt - Rp 25 Jt / bln</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Target Imbal Hasil (APY Halal)</span>
                    <span className="text-amber-400 font-bold">{dcaAnnualYield}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    step="0.5"
                    value={dcaAnnualYield}
                    onChange={(e) => setDcaAnnualYield(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">4% (Sukuk) - 24% (Spot Crypto)</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Jangka Waktu Simulasi</span>
                    <span className="text-teal-400 font-bold">{dcaYears} Tahun</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="25"
                    step="1"
                    value={dcaYears}
                    onChange={(e) => setDcaYears(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">3 - 25 Tahun</div>
                </div>
              </div>

              {/* KPI Outcome Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-400">Total Modal Disetor</div>
                  <div className="text-lg sm:text-xl font-bold mt-1 text-slate-200">
                    {formatCompactIDR(finalDcaYear.totalInvestedIDR)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Pokok tanpa bunga</div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-emerald-400">Total Nilai Bersih Portofolio</div>
                  <div className="text-lg sm:text-xl font-extrabold mt-1 text-emerald-400">
                    {formatCompactIDR(finalDcaYear.netBalanceIDR)}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-0.5">
                    +{Math.round(((finalDcaYear.netBalanceIDR - finalDcaYear.totalInvestedIDR) / finalDcaYear.totalInvestedIDR) * 100)}% Pertumbuhan
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-amber-400">Total Zakat Maal Disalurkan</div>
                  <div className="text-lg sm:text-xl font-bold mt-1 text-amber-400">
                    {formatCompactIDR(finalDcaYear.cumulativeZakatPaidIDR)}
                  </div>
                  <div className="text-[10px] text-amber-500/80 mt-0.5">Penyucian 2.5% harta berkah</div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-blue-950/30 border-blue-900/50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-blue-400">Daya Beli Riil (Inflasi 3.5%)</div>
                  <div className="text-lg sm:text-xl font-bold mt-1 text-blue-400">
                    {formatCompactIDR(finalDcaYear.inflationAdjustedBalanceIDR)}
                  </div>
                  <div className="text-[10px] text-blue-500/80 mt-0.5">Nilai riil masa kini</div>
                </div>
              </div>

              {/* Recharts Area Growth Chart */}
              <div className="mt-8">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                  <span>Grafik Proyeksi Pertumbuhan Portofolio Majemuk Syariah</span>
                  <span className="text-[11px] text-emerald-400 font-normal">
                    Nilai Nisab Tercapai di Tahun ke-{dcaSimulationData.find((d) => d.isNisabExceeded)?.year || 'N/A'}
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dcaSimulationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="netGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} />
                      <XAxis
                        dataKey="year"
                        stroke={isDark ? '#94A3B8' : '#64748B'}
                        tickFormatter={(v) => `Thn ${v}`}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke={isDark ? '#94A3B8' : '#64748B'}
                        tickFormatter={(v) => formatCompactIDR(v)}
                        tick={{ fontSize: 11 }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                          borderColor: isDark ? '#334155' : '#CBD5E1',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val: any) => [formatIDR(Number(val) || 0), '']}
                        labelFormatter={(lbl) => `Tahun ke-${lbl}`}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Area
                        type="monotone"
                        dataKey="netBalanceIDR"
                        name="Portofolio Bersih Syariah"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#netGrowthGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="totalInvestedIDR"
                        name="Akumulasi Modal Disetor"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#investedGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR 2: AAOIFI STOCK & TOKEN SCREENER */}
          {activeSimulator === 'aaoifi' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    AAOIFI Shariah Standard No. 21 & No. 57
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    Penyaring Kepatuhan Saham & Token Digital Syariah
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Uji apakah emiten publik atau token digital lolos 3 kriteria kuantitatif global AAOIFI (Batas Utang Berbunga &lt;33%, Kas Berbunga &lt;30%, Pendapatan Non-Halal &lt;5%) serta hitung otomatis pembersihan dividen (Tathir).
                  </p>
                </div>

                {/* Preset Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Preset:</span>
                  <button
                    onClick={() => handleApplyPreset('telkom')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      screenerPreset === 'telkom'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    PT Telkom (Pass)
                  </button>
                  <button
                    onClick={() => handleApplyPreset('paxg')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      screenerPreset === 'paxg'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    PAXG Gold (100% Halal)
                  </button>
                  <button
                    onClick={() => handleApplyPreset('high_debt_corp')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                      screenerPreset === 'high_debt_corp'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    High-Debt Corp (Fail)
                  </button>
                </div>
              </div>

              {/* Input Parameters Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">
                    Kapitalisasi Pasar / Total Aset
                  </label>
                  <input
                    type="number"
                    value={screenerMarketCap}
                    onChange={(e) => {
                      setScreenerMarketCap(Number(e.target.value));
                      setScreenerPreset('custom');
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCompactIDR(screenerMarketCap)}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">
                    Total Utang Berbunga (Interest Debt)
                  </label>
                  <input
                    type="number"
                    value={screenerInterestDebt}
                    onChange={(e) => {
                      setScreenerInterestDebt(Number(e.target.value));
                      setScreenerPreset('custom');
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCompactIDR(screenerInterestDebt)}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">
                    Kas & Surat Berharga Berbunga
                  </label>
                  <input
                    type="number"
                    value={screenerInterestCash}
                    onChange={(e) => {
                      setScreenerInterestCash(Number(e.target.value));
                      setScreenerPreset('custom');
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{formatCompactIDR(screenerInterestCash)}</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">
                    Pendapatan Non-Halal (Bunga/Riba)
                  </label>
                  <input
                    type="number"
                    value={screenerNonHalalRevenue}
                    onChange={(e) => {
                      setScreenerNonHalalRevenue(Number(e.target.value));
                      setScreenerPreset('custom');
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Dari Total Omzet {formatCompactIDR(screenerGrossRevenue)}
                  </span>
                </div>
              </div>

              {/* AAOIFI Quantitative Ratio Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
                {/* Ratio 1: Debt */}
                <div
                  className={`p-5 rounded-2xl border ${
                    screenerResult.isDebtCompliant
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-900/40'
                        : 'bg-emerald-50 border-emerald-200'
                      : isDark
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">1. Rasio Utang Berbunga</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        screenerResult.isDebtCompliant
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {screenerResult.isDebtCompliant ? 'LOLOS' : 'TIDAK LOLOS'}
                    </span>
                  </div>

                  <div className="text-2xl font-black mt-2">
                    {screenerResult.debtRatio.toFixed(1)}%
                    <span className="text-xs font-normal text-slate-400 ml-1">/ Maks 33%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        screenerResult.isDebtCompliant ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (screenerResult.debtRatio / 33) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Berdasarkan Hadits: "Sepertiga, dan sepertiga itu sudah banyak."
                  </div>
                </div>

                {/* Ratio 2: Cash & Interest Securities */}
                <div
                  className={`p-5 rounded-2xl border ${
                    screenerResult.isCashCompliant
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-900/40'
                        : 'bg-emerald-50 border-emerald-200'
                      : isDark
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">2. Kas Berbunga / Aset</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        screenerResult.isCashCompliant
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {screenerResult.isCashCompliant ? 'LOLOS' : 'TIDAK LOLOS'}
                    </span>
                  </div>

                  <div className="text-2xl font-black mt-2">
                    {screenerResult.cashRatio.toFixed(1)}%
                    <span className="text-xs font-normal text-slate-400 ml-1">/ Maks 30%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        screenerResult.isCashCompliant ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (screenerResult.cashRatio / 30) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Mencegah percampuran dominasi instrumen ribawi cair dalam permodalan.
                  </div>
                </div>

                {/* Ratio 3: Non-Halal Revenue */}
                <div
                  className={`p-5 rounded-2xl border ${
                    screenerResult.isRevenueCompliant
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-900/40'
                        : 'bg-emerald-50 border-emerald-200'
                      : isDark
                      ? 'bg-rose-950/20 border-rose-900/40'
                      : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">3. Pendapatan Non-Halal</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        screenerResult.isRevenueCompliant
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {screenerResult.isRevenueCompliant ? 'LOLOS' : 'TIDAK LOLOS'}
                    </span>
                  </div>

                  <div className="text-2xl font-black mt-2">
                    {screenerResult.nonHalalRevenueRatio.toFixed(1)}%
                    <span className="text-xs font-normal text-slate-400 ml-1">/ Maks 5%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        screenerResult.isRevenueCompliant ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, (screenerResult.nonHalalRevenueRatio / 5) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    Toleransi kontaminasi tidak sengaja dengan kewajiban tathir (purifikasi).
                  </div>
                </div>
              </div>

              {/* Final Sharia Verdict & Dividend Purification Box */}
              <div
                className={`mt-6 p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
                  screenerResult.overallStatus === 'COMPLIANT'
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-800'
                      : 'bg-emerald-50 border-emerald-300'
                    : isDark
                    ? 'bg-rose-950/30 border-rose-800'
                    : 'bg-rose-50 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${
                      screenerResult.overallStatus === 'COMPLIANT'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {screenerResult.overallStatus === 'COMPLIANT' ? '✓' : '✕'}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Keputusan Audit Syariah
                    </div>
                    <div className="text-lg font-black">
                      {screenerResult.overallStatus === 'COMPLIANT'
                        ? 'MEMENUHI SYARAT KELAYAKAN SYARIAH (HALAL)'
                        : 'TIDAK MEMENUHI KRITERIA STANDAR AAOIFI (NON-COMPLIANT)'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Standar Kepatuhan: AAOIFI Shariah Standard No. 21 Clause 3/4 & DSN-MUI No. 138
                    </div>
                  </div>
                </div>

                {/* Tathir Dividend Calculator */}
                <div
                  className={`p-4 rounded-xl border text-right min-w-[240px] ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-400">
                    Kalkulator Purifikasi Dividen (Tathir)
                  </div>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    Donasikan: {formatIDR(screenerResult.purificationAmountIDR)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ({screenerResult.purificationPercentage.toFixed(2)}% dari dividen {formatIDR(sampleDividendIDR)})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR 3: FIRE SYARIAH PLANNER */}
          {activeSimulator === 'fire' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Financial Independence, Retire Early (FIRE) Syariah
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    Perencana Kebebasan Finansial Bebas Riba
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Hitung modal pensiun halal yang dibutuhkan untuk membiayai seluruh kebutuhan hidup dari imbal hasil pasif (dividen saham syariah, sewa Sukuk, staking PoS) dengan memperhitungkan pemotongan 2.5% Zakat Maal dan inflasi tahunan.
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-2xl border text-center ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tingkat Kesiapan FIRE</div>
                  <div className="text-2xl font-black text-emerald-400">{firePlan.currentReadinessPercent}%</div>
                </div>
              </div>

              {/* Form Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Usia Sekarang vs Pensiun</span>
                    <span className="text-emerald-400 font-bold">{fireCurrentAge} thn → {fireRetireAge} thn</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={fireRetireAge}
                    onChange={(e) => setFireRetireAge(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">{firePlan.yearsToRetire} tahun waktu persiapan</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Biaya Hidup Bulanan</span>
                    <span className="text-emerald-400 font-bold">{formatIDR(fireMonthlyExpense)}</span>
                  </div>
                  <input
                    type="range"
                    min="5000000"
                    max="50000000"
                    step="1000000"
                    value={fireMonthlyExpense}
                    onChange={(e) => setFireMonthlyExpense(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">{formatIDR(firePlan.annualLivingExpense)} / tahun</div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Imbal Hasil Dividen / Sukuk</span>
                    <span className="text-amber-400 font-bold">{fireExpectedYield}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="14"
                    step="0.5"
                    value={fireExpectedYield}
                    onChange={(e) => setFireExpectedYield(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Bersih setelah Zakat 2.5%: {firePlan.netYieldAfterZakatPercent.toFixed(1)}% p.a.
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-400">Tabungan / Aset Saat Ini</span>
                    <span className="text-teal-400 font-bold">{formatCompactIDR(fireCurrentSavings)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000000"
                    max="1000000000"
                    step="10000000"
                    value={fireCurrentSavings}
                    onChange={(e) => setFireCurrentSavings(Number(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">Rp 10 Jt - Rp 1 Miliar</div>
                </div>
              </div>

              {/* Strategic Insights Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-400 uppercase">Target Dana Kebebasan Syariah</div>
                  <div className="text-2xl font-black mt-1 text-emerald-400">
                    {formatCompactIDR(firePlan.targetCapitalRequired)}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Menghasilkan dividen halal {formatIDR(firePlan.annualLivingExpense)} / tahun tanpa pernah menyentuh atau menghabiskan modal pokok.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-400 uppercase">Kekurangan Modal (Gap)</div>
                  <div className="text-2xl font-black mt-1 text-amber-400">
                    {formatCompactIDR(firePlan.capitalGap)}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Selisih modal yang perlu diakumulasikan selama {firePlan.yearsToRetire} tahun ke depan melalui tabungan disiplin.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-400 uppercase">Investasi Disiplin Diperlukan</div>
                  <div className="text-2xl font-black mt-1 text-blue-400">
                    {formatIDR(firePlan.requiredMonthlySavings)}
                    <span className="text-xs font-normal text-slate-400"> / bulan</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Alokasikan rutin ke instrumen spot syariah berimbal hasil {fireExpectedYield}% untuk mencapai target tepat waktu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR 4: SHARIA ASSET ALLOCATION OPTIMIZER */}
          {activeSimulator === 'allocation' && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                    Modern Sharia Portfolio Optimization
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-1">
                    Optimasi Alokasi Portofolio Berimbang Maqasid
                  </h3>
                  <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pilih profil risiko Sharia yang disesuaikan dengan kebutuhan Anda, lalu terapkan konfigurasinya langsung ke Mesin Bot Trading Otomatis FinanceCity.
                  </p>
                </div>

                {onApplyBotStrategy && (
                  <button
                    onClick={() => onApplyBotStrategy(allocationMode)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md hover:from-emerald-500 hover:to-teal-400 transition-all"
                  >
                    <Zap className="w-4 h-4" />
                    Terapkan Strategi ke Bot Trading Syariah
                  </button>
                )}
              </div>

              {/* 3 Strategy Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* 1. Conservative Amanah */}
                <div
                  onClick={() => setAllocationMode('conservative')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    allocationMode === 'conservative'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-lg'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      Rendah Risiko
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Estimasi: 6.5% - 8.5% APY</span>
                  </div>
                  <h4 className="text-lg font-bold">Konservatif Amanah</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Dominasi instrumen emas fisik (PAXG) dan Sukuk Tabungan negara. Tepat untuk dana darurat dan perlindungan modal.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAX Gold (Emas Fisik London)</span>
                      <span className="font-bold text-amber-400">50%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sukuk Tabungan / Cash Mudharabah</span>
                      <span className="font-bold text-blue-400">40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spot Bitcoin & Top PoS Utility</span>
                      <span className="font-bold text-emerald-400">10%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Balanced Wasathiyah */}
                <div
                  onClick={() => setAllocationMode('balanced')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    allocationMode === 'balanced'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-lg'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Rekomendasi
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Estimasi: 12.0% - 16.5% APY</span>
                  </div>
                  <h4 className="text-lg font-bold">Berimbang Wasathiyah</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Kombinasi optimal antara lindung nilai emas, cash flow dividen, dan apresiasi modal spot kripto berfundamental kuat.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAX Gold (Emas LBMA)</span>
                      <span className="font-bold text-amber-400">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spot BTC & Cardano (PoS Validasi)</span>
                      <span className="font-bold text-emerald-400">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sukuk Ritel / Saham JII</span>
                      <span className="font-bold text-blue-400">25%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Dynamic Ijtihad */}
                <div
                  onClick={() => setAllocationMode('dynamic')}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all ${
                    allocationMode === 'dynamic'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 shadow-lg'
                      : isDark
                      ? 'border-slate-800 bg-slate-950/60 hover:bg-slate-900'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                      Pertumbuhan Tinggi
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Estimasi: 18.0% - 25.0% APY</span>
                  </div>
                  <h4 className="text-lg font-bold">Dinamis Ijtihad Syariah</h4>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Fokus pada pertumbuhan spot utility PoS (Ethereum, Cardano, Solana) dengan eksekusi swing otomatis dan trailing stop ketat.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Spot PoS Top 5 Utilities</span>
                      <span className="font-bold text-emerald-400">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PAX Gold (Hedge Volatilitas)</span>
                      <span className="font-bold text-amber-400">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cadangan Likuiditas & Zakat</span>
                      <span className="font-bold text-blue-400">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: STRATEGY PLAYBOOKS */}
      {/* ========================================================================= */}
      {activeSubTab === 'playbooks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {masteryPlaybooks.map((playbook) => {
              const fullText = `${playbook.title}\n\n${playbook.summary}\n\n${playbook.steps.join('\n')}`;
              const isCopied = copiedPlaybookId === playbook.id;

              return (
                <div
                  key={playbook.id}
                  className={`rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {playbook.category}
                      </span>
                      <span className="text-slate-500">{playbook.readTime}</span>
                    </div>

                    <h3 className="font-bold text-lg mt-1 mb-2">{playbook.title}</h3>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">{playbook.summary}</p>

                    <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                      {playbook.steps.map((st, sIdx) => (
                        <div key={sIdx} className="text-xs flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{st}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopyPlaybook(playbook.id, fullText)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Panduan</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-500">Playbook Standar DSN-MUI</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: EXAM & ON-CHAIN BLOCKCHAIN CERTIFICATION */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam' && (
        <div className="space-y-6">
          <div
            className={`rounded-3xl border p-6 sm:p-8 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Evaluasi Akhir Kurikulum
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-1">
                  Ujian Sertifikasi Keuangan & Investasi Syariah
                </h3>
                <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Jawab 10 studi kasus komprehensif. Dapatkan nilai minimum 70% untuk membuka Sertifikat Digital Resmi terverifikasi on-chain blockchain PoSS FinanceCity.
                </p>
              </div>

              {/* Recipient Name Input */}
              <div
                className={`p-4 rounded-2xl border min-w-[280px] ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Nama Pada Sertifikat
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Masukkan Nama Lengkap Anda"
                  className={`w-full px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    isDark ? 'bg-slate-900 border-slate-700 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
                  }`}
                />
              </div>
            </div>

            {/* Exam Questions List */}
            <div className="mt-8 space-y-6">
              {masteryQuizQuestions.map((q, idx) => {
                const selectedOption = userAnswers[q.id];
                const isAnswered = selectedOption !== undefined;
                const isCorrect = isAnswered && selectedOption === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isExamSubmitted
                        ? isCorrect
                          ? isDark
                            ? 'bg-emerald-950/20 border-emerald-800'
                            : 'bg-emerald-50 border-emerald-300'
                          : isDark
                          ? 'bg-rose-950/20 border-rose-800'
                          : 'bg-rose-50 border-rose-300'
                        : isDark
                        ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-emerald-500 uppercase tracking-wider">
                        Pertanyaan {idx + 1} • {q.category}
                      </span>
                      {isExamSubmitted && (
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCorrect ? 'BENAR (+10)' : 'SALAH'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold mb-4">{q.question}</h4>

                    {/* Options Grid */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        let optionStyle = isDark
                          ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700';

                        if (isExamSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
                          } else if (isChosen && !isCorrect) {
                            optionStyle = 'bg-rose-600 text-white border-rose-600';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-emerald-600 text-white border-emerald-600 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-3 ${optionStyle}`}
                          >
                            <span className="w-5 h-5 rounded-full border flex items-center justify-center font-bold text-xs shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Sharia Explanation After Submit */}
                    {isExamSubmitted && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <div className="font-semibold text-emerald-400">Pembahasan & Dasar Fiqh:</div>
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{q.explanation}</p>
                        <div className="text-[11px] text-slate-500 italic mt-1">
                          Rujukan: {q.shariaReference}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit / Reset Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              {!isExamSubmitted ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 transition-all"
                >
                  Kirim Jawaban & Evaluasi ({Object.keys(userAnswers).length}/{masteryQuizQuestions.length} Terjawab)
                </button>
              ) : (
                <button
                  onClick={handleResetExam}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ulangi Ujian
                </button>
              )}

              {isExamSubmitted && (
                <div className="text-right">
                  <div className="text-xs uppercase font-semibold text-slate-400">Hasil Evaluasi</div>
                  <div className="text-2xl font-black text-emerald-400">
                    Skor: {examScore}% ({examScore >= 70 ? 'LULUS MEMUASKAN' : 'BELUM LULUS'})
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UNLOCKED OFFICIAL CERTIFICATE & BLOCKCHAIN LEDGER EMBED */}
          {generatedCertificate && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 transition-all animate-fadeIn ${
                isDark
                  ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/40 border-emerald-500/50 shadow-2xl'
                  : 'bg-gradient-to-b from-white via-emerald-50/20 to-amber-50/30 border-emerald-300 shadow-xl'
              }`}
            >
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Award className="w-4 h-4 text-amber-400" />
                  Sertifikat Terverifikasi Diterbitkan
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-400">
                  Selamat, {generatedCertificate.recipientName}!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Anda telah membuktikan kepiawaian dalam Standar AAOIFI No. 57, Fiqh Muamalat Pasar Modal, Analisis Aset Kripto Spot, dan Manajemen Risiko Kuantitatif dengan predikat <strong className="text-white">{generatedCertificate.grade}</strong>.
                </p>
              </div>

              {/* Certificate Preview Card */}
              <div
                className={`mt-6 p-6 rounded-2xl border max-w-2xl mx-auto relative overflow-hidden ${
                  isDark ? 'bg-slate-950 border-emerald-900/60' : 'bg-white border-emerald-200 shadow-md'
                }`}
              >
                <div className="border border-amber-500/40 p-4 rounded-xl text-center space-y-2">
                  <div className="text-[11px] font-serif italic text-emerald-400">
                    Bismi-llahi r-Rahmani r-Rahim
                  </div>
                  <div className="text-xs uppercase tracking-widest font-bold text-slate-400">
                    FinanceCity Islamicity Academy
                  </div>
                  <div className="text-lg font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                    CERTIFICATE OF FINANCE & INVESTMENT MASTERY
                  </div>
                  <div className="text-xs text-slate-400">Diberikan kepada:</div>
                  <div className="text-xl font-extrabold text-emerald-300">
                    {generatedCertificate.recipientName}
                  </div>
                  <div className="text-[11px] text-slate-400 max-w-md mx-auto pt-1">
                    Atas kelulusan evaluasi komprehensif kurikulum standar AAOIFI Standard No. 57 & DSN-MUI No. 140 dengan nilai ujian <strong className="text-emerald-400">{generatedCertificate.score}%</strong>.
                  </div>

                  {/* Proof Hash & Credential */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
                    <span>ID: {generatedCertificate.certificateId}</span>
                    <span>Proof Hash: {generatedCertificate.verificationHash}</span>
                    <span>Tgl: {generatedCertificate.issueDate}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Download & Blockchain Recording Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDownloadCertificate}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Unduh Sertifikat PDF Resmi (A4 Landscape)
                </button>

                {!blockchainTxRecorded ? (
                  <button
                    onClick={handleRecordToBlockchainLedger}
                    disabled={isRecordingOnChain}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg transition-all"
                  >
                    <Layers className="w-4 h-4" />
                    {isRecordingOnChain ? 'Mencatat ke Blockchain...' : 'Catat Sertifikat ke Ledger Blockchain PoSS'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Tercatat Abadi di Blok Ledger PoSS (#{generatedCertificate.blockNumber})
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
