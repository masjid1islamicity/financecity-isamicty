import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Sparkles,
  Award,
  GraduationCap,
  Users,
  Briefcase,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  Edit3,
  RotateCcw,
  Save,
  X,
  Share2,
  Check,
  ChevronRight,
  ShieldCheck,
  Package,
  Sprout,
  DollarSign,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatImpactGoalConfig } from '../types';

export const BENCHMARKS = {
  // Estimated cost to achieve 1 social outcome unit based on national BAZNAS & amil standards
  COST_PER_EDUCATION_KIT: 250000, // Rp 250.000 (Tas, seragam, buku & santunan santri)
  COST_PER_BENEFICIARY: 150000, // Rp 150.000 (Bantuan biaya hidup & asnaf langsung)
  COST_PER_UMKM_KIT: 1500000, // Rp 1.500.000 (Gerobak usaha / modal kerja bergulir)
  COST_PER_HEALTH_PKG: 200000, // Rp 200.000 (Layanan rawat jalan dhuafa / paket gizi balita)
  COST_PER_FOOD_BASKET: 175000, // Rp 175.000 (Paket beras organik, minyak & sembako keluarga)
};

const DEFAULT_GOAL: ZakatImpactGoalConfig = {
  year: 2026,
  profileName: 'Komprehensif 8 Asnaf Seimbang',
  targetAnnualFundsIDR: 15000000,
  targetBeneficiariesCount: 50,
  targetEducationKits: 25,
  targetUmkmKits: 4,
  targetHealthPackages: 30,
  targetFoodBaskets: 40,
  notes: 'Niat ikhlas membebaskan belenggu kemiskinan dan membuka akses pendidikan santri dhuafa nusantara.',
};

export const GOAL_PRESETS: {
  id: string;
  name: string;
  description: string;
  config: Partial<ZakatImpactGoalConfig>;
}[] = [
  {
    id: 'education-focus',
    name: 'Peduli Pendidikan Santri Nusantara',
    description: 'Prioritas pada paket perlengkapan sekolah, SPP santri tahfidz & beasiswa dhuafa 3T.',
    config: {
      profileName: 'Peduli Pendidikan Santri Nusantara',
      targetAnnualFundsIDR: 12500000,
      targetBeneficiariesCount: 45,
      targetEducationKits: 40,
      targetUmkmKits: 2,
      targetHealthPackages: 15,
      targetFoodBaskets: 20,
    },
  },
  {
    id: 'umkm-focus',
    name: 'Pemberdayaan UMKM Mandiri',
    description: 'Fokus mentransformasi mustahik menjadi muzakki lewat gerobak & modal kerja bergulir.',
    config: {
      profileName: 'Pemberdayaan UMKM Mandiri',
      targetAnnualFundsIDR: 20000000,
      targetBeneficiariesCount: 60,
      targetEducationKits: 15,
      targetUmkmKits: 8,
      targetHealthPackages: 25,
      targetFoodBaskets: 35,
    },
  },
  {
    id: 'health-focus',
    name: 'Layanan Kesehatan & Bebas Stunting',
    description: 'Fokus subsidi pengobatan dhuafa di RS Rumah Sehat & intervensi nutrisi balita prasejahtera.',
    config: {
      profileName: 'Layanan Kesehatan & Bebas Stunting',
      targetAnnualFundsIDR: 14000000,
      targetBeneficiariesCount: 55,
      targetEducationKits: 15,
      targetUmkmKits: 2,
      targetHealthPackages: 50,
      targetFoodBaskets: 30,
    },
  },
  {
    id: 'balanced-asnaf',
    name: 'Komprehensif 8 Asnaf Seimbang',
    description: 'Pemerataan seimbang antara modal usaha, pendidikan, kesehatan, dan bantuan sembako pangan.',
    config: {
      profileName: 'Komprehensif 8 Asnaf Seimbang',
      targetAnnualFundsIDR: 15000000,
      targetBeneficiariesCount: 50,
      targetEducationKits: 25,
      targetUmkmKits: 4,
      targetHealthPackages: 30,
      targetFoodBaskets: 40,
    },
  },
];

interface ZakatAnnualImpactGoalProps {
  disbursedRecords?: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
  onOpenDisburse?: () => void;
}

export const ZakatAnnualImpactGoal: React.FC<ZakatAnnualImpactGoalProps> = ({
  disbursedRecords = [],
  theme,
  language,
  onOpenDisburse,
}) => {
  // Goal state persisted in localStorage
  const [goal, setGoal] = useState<ZakatImpactGoalConfig>(() => {
    try {
      const saved = localStorage.getItem('zakat_annual_impact_goal_2026');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_GOAL;
  });

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [editingForm, setEditingForm] = useState<ZakatImpactGoalConfig>(goal);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
    return `Rp ${val}`;
  };

  // Sync edits when modal opens
  useEffect(() => {
    if (isEditingModalOpen) {
      setEditingForm(goal);
    }
  }, [isEditingModalOpen, goal]);

  // Save changes to localStorage
  const handleSaveGoal = (newConfig: ZakatImpactGoalConfig) => {
    setGoal(newConfig);
    try {
      localStorage.setItem('zakat_annual_impact_goal_2026', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save zakat impact goal in storage', e);
    }
    setIsEditingModalOpen(false);
  };

  // Reset to default
  const handleResetGoal = () => {
    handleSaveGoal(DEFAULT_GOAL);
  };

  // Total funds disbursed by user
  const totalDisbursedFunds = useMemo(() => {
    return disbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  }, [disbursedRecords]);

  // Calculate Achieved Social Outcomes from actual disbursed records
  const achievedOutcomes = useMemo(() => {
    let umkmSpent = 0;
    let healthSpent = 0;
    let eduSpent = 0;
    let generalSpent = 0;

    disbursedRecords.forEach((r) => {
      const targetStr = (r.programTarget || '').toLowerCase();
      if (targetStr.includes('umkm') || targetStr.includes('modal') || targetStr.includes('usaha')) {
        umkmSpent += r.amountIDR;
      } else if (targetStr.includes('sehat') || targetStr.includes('medis') || targetStr.includes('gizi')) {
        healthSpent += r.amountIDR;
      } else if (targetStr.includes('beasiswa') || targetStr.includes('pendidikan') || targetStr.includes('santri')) {
        eduSpent += r.amountIDR;
      } else {
        generalSpent += r.amountIDR;
      }
    });

    // Prorate remaining general disbursements across categories
    const genEdu = generalSpent * 0.35;
    const genUmkm = generalSpent * 0.25;
    const genHealth = generalSpent * 0.25;
    const genFood = generalSpent * 0.15;

    const effEduSpent = eduSpent + genEdu;
    const effUmkmSpent = umkmSpent + genUmkm;
    const effHealthSpent = healthSpent + genHealth;
    const effFoodSpent = generalSpent > 0 ? genFood : totalDisbursedFunds * 0.15;

    // Derived units achieved
    const educationKitsAchieved = Math.floor(effEduSpent / BENCHMARKS.COST_PER_EDUCATION_KIT);
    const umkmKitsAchieved = Math.floor(effUmkmSpent / BENCHMARKS.COST_PER_UMKM_KIT);
    const healthPackagesAchieved = Math.floor(effHealthSpent / BENCHMARKS.COST_PER_HEALTH_PKG);
    const foodBasketsAchieved = Math.floor(effFoodSpent / BENCHMARKS.COST_PER_FOOD_BASKET);

    // Total beneficiaries helped (weighted composite)
    const directBeneficiaries =
      educationKitsAchieved * 1 +
      umkmKitsAchieved * 4 + // Each UMKM cart supports average 4 family members
      healthPackagesAchieved * 1 +
      foodBasketsAchieved * 3; // Food basket supports family

    const beneficiariesAchieved = Math.max(
      Math.floor(totalDisbursedFunds / BENCHMARKS.COST_PER_BENEFICIARY),
      directBeneficiaries
    );

    return {
      fundsIDR: totalDisbursedFunds,
      beneficiaries: beneficiariesAchieved,
      educationKits: educationKitsAchieved,
      umkmKits: umkmKitsAchieved,
      healthPackages: healthPackagesAchieved,
      foodBaskets: foodBasketsAchieved,
    };
  }, [disbursedRecords, totalDisbursedFunds]);

  // Individual progress percentages
  const progressFunds = Math.min(100, Math.round((achievedOutcomes.fundsIDR / (goal.targetAnnualFundsIDR || 1)) * 100));
  const progressBeneficiaries = Math.min(
    100,
    Math.round((achievedOutcomes.beneficiaries / (goal.targetBeneficiariesCount || 1)) * 100)
  );
  const progressEdu = Math.min(
    100,
    Math.round((achievedOutcomes.educationKits / (goal.targetEducationKits || 1)) * 100)
  );
  const progressUmkm = Math.min(
    100,
    Math.round((achievedOutcomes.umkmKits / (goal.targetUmkmKits || 1)) * 100)
  );
  const progressHealth = Math.min(
    100,
    Math.round((achievedOutcomes.healthPackages / (goal.targetHealthPackages || 1)) * 100)
  );
  const progressFood = Math.min(
    100,
    Math.round((achievedOutcomes.foodBaskets / (goal.targetFoodBaskets || 1)) * 100)
  );

  // Overall Composite Social Impact Score (Weighted across outcomes)
  const compositeProgress = Math.min(
    100,
    Math.round(
      progressFunds * 0.3 +
        progressBeneficiaries * 0.25 +
        progressEdu * 0.2 +
        progressUmkm * 0.15 +
        progressHealth * 0.1
    )
  );

  // Milestone tier label
  const getMilestoneTier = (pct: number) => {
    if (pct >= 100) return { title: 'Khadimul Ummah (Target Penuh)', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (pct >= 75) return { title: 'Pejuang Asnaf Mandiri', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (pct >= 50) return { title: 'Penopang Mustahik Nusantara', color: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30' };
    if (pct >= 25) return { title: 'Baitul Maal Perintis', color: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
    return { title: 'Tahap Inisiasi Niat Maal', color: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  };

  const currentTier = getMilestoneTier(compositeProgress);

  // Copy goal statement to clipboard
  const handleCopySummary = () => {
    const text = [
      `TARGET DAMPAK SOSIAL ZAKAT TAHUNAN (${goal.year})`,
      `Profil: ${goal.profileName}`,
      `Progres Capaian Keseluruhan: ${compositeProgress}% (${currentTier.title})`,
      '',
      `1. Total Dana Disalurkan: ${formatIDR(achievedOutcomes.fundsIDR)} / ${formatIDR(goal.targetAnnualFundsIDR)} (${progressFunds}%)`,
      `2. Mustahik Terbantu: ${achievedOutcomes.beneficiaries} / ${goal.targetBeneficiariesCount} Jiwa (${progressBeneficiaries}%)`,
      `3. Paket Perlengkapan Pendidikan: ${achievedOutcomes.educationKits} / ${goal.targetEducationKits} Paket (${progressEdu}%)`,
      `4. Gerobak & Modal UMKM: ${achievedOutcomes.umkmKits} / ${goal.targetUmkmKits} Unit (${progressUmkm}%)`,
      `5. Layanan Medis & Gizi Dhuafa: ${achievedOutcomes.healthPackages} / ${goal.targetHealthPackages} Paket (${progressHealth}%)`,
      `6. Paket Pangan Sembako: ${achievedOutcomes.foodBaskets} / ${goal.targetFoodBaskets} Paket (${progressFood}%)`,
      '',
      `Catatan Muzakki: "${goal.notes || 'Bismillah'}"`,
      'Terpantau Akuntabel di FinanceCity IslamiCity.',
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div
      id="zakat-annual-impact-goal-card"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/20 border-teal-500/30 shadow-xl'
          : 'bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/60 border-teal-200 shadow-sm'
      } p-5 space-y-5`}
    >
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Target Dampak Zakat Tahunan (Annual Impact Goal {goal.year})
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${currentTier.badge}`}>
                {currentTier.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Tetapkan dan pantau pencapaian dampak sosial konkret seperti jumlah mustahik terbantu, paket beasiswa pendidikan, dan modal gerobak UMKM mandiri.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            id="open-edit-impact-goal-btn"
            onClick={() => setIsEditingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold transition-all shadow-xs"
            title="Ubah Target Jumlah Mustahik & Paket Dampak"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ubah Target</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-all"
            title="Salin Ringkasan Target Dampak ke Clipboard"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Overall Progress Meter & Journey Bar */}
      <div
        className={`p-4 rounded-xl border ${
          theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        } space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Progres Capaian Dampak Sosial Kumulatif
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {compositeProgress}%
              </span>
              <span className="text-xs text-slate-400">
                dari target profil <strong className="text-teal-400">{goal.profileName}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total Dana Tersalurkan</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
              {formatIDR(achievedOutcomes.fundsIDR)}
              <span className="text-slate-400 text-xs font-normal"> / {formatShortIDR(goal.targetAnnualFundsIDR)}</span>
            </span>
          </div>
        </div>

        {/* Master Animated Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-700 relative"
              style={{ width: `${compositeProgress}%` }}
            >
              {compositeProgress > 0 && (
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 animate-pulse rounded-full" />
              )}
            </div>
          </div>

          {/* 4 Milestone Checkpoints */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span className={compositeProgress >= 25 ? 'text-teal-400 font-bold' : ''}>25% Perintis</span>
            <span className={compositeProgress >= 50 ? 'text-teal-400 font-bold' : ''}>50% Penopang</span>
            <span className={compositeProgress >= 75 ? 'text-emerald-400 font-bold' : ''}>75% Mandiri</span>
            <span className={compositeProgress >= 100 ? 'text-amber-400 font-bold' : ''}>100% Khadimul Ummah</span>
          </div>
        </div>
      </div>

      {/* Specific Social Outcome Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Outcome 1: Education Kits & Scholarships */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Paket Perlengkapan Pendidikan
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{progressEdu}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-cyan-400 font-mono">
              {achievedOutcomes.educationKits}
              <span className="text-xs text-slate-400 font-normal"> / {goal.targetEducationKits} Paket</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {goal.targetEducationKits - achievedOutcomes.educationKits > 0
                ? `Kurang ${goal.targetEducationKits - achievedOutcomes.educationKits}`
                : 'Target Tuntas! 🎉'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progressEdu}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            Tas, buku, seragam & subsidi SPP santri tahfidz (est. Rp 250rb/paket)
          </span>
        </div>

        {/* Outcome 2: Beneficiaries Count */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Total Mustahik Terbantu
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{progressBeneficiaries}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-amber-400 font-mono">
              {achievedOutcomes.beneficiaries}
              <span className="text-xs text-slate-400 font-normal"> / {goal.targetBeneficiariesCount} Jiwa</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {goal.targetBeneficiariesCount - achievedOutcomes.beneficiaries > 0
                ? `Kurang ${goal.targetBeneficiariesCount - achievedOutcomes.beneficiaries} Jiwa`
                : 'Target Tuntas! 🎉'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressBeneficiaries}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            Keluarga miskin, fakir & asnaf fisabilillah (est. Rp 150rb/jiwa)
          </span>
        </div>

        {/* Outcome 3: UMKM Micro-Capital & Carts */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Modal & Gerobak UMKM Mandiri
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{progressUmkm}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-emerald-400 font-mono">
              {achievedOutcomes.umkmKits}
              <span className="text-xs text-slate-400 font-normal"> / {goal.targetUmkmKits} Unit</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {goal.targetUmkmKits - achievedOutcomes.umkmKits > 0
                ? `Kurang ${goal.targetUmkmKits - achievedOutcomes.umkmKits} Unit`
                : 'Target Tuntas! 🎉'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressUmkm}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            Suntikan modal usaha bergulir & etalase higienis (est. Rp 1.5jt/unit)
          </span>
        </div>

        {/* Outcome 4: Healthcare & Nutrition Packages */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Layanan Medis & Pos Gizi Dhuafa
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">{progressHealth}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-rose-400 font-mono">
              {achievedOutcomes.healthPackages}
              <span className="text-xs text-slate-400 font-normal"> / {goal.targetHealthPackages} Sesi</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {goal.targetHealthPackages - achievedOutcomes.healthPackages > 0
                ? `Kurang ${goal.targetHealthPackages - achievedOutcomes.healthPackages} Sesi`
                : 'Target Tuntas! 🎉'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${progressHealth}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            Rawat inap gratis RS Dhuafa & vitamin stunting (est. Rp 200rb/sesi)
          </span>
        </div>

        {/* Outcome 5: Emergency Food Baskets */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Paket Pangan Sembako
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400">{progressFood}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xl font-black text-teal-400 font-mono">
              {achievedOutcomes.foodBaskets}
              <span className="text-xs text-slate-400 font-normal"> / {goal.targetFoodBaskets} Paket</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {goal.targetFoodBaskets - achievedOutcomes.foodBaskets > 0
                ? `Kurang ${goal.targetFoodBaskets - achievedOutcomes.foodBaskets} Paket`
                : 'Target Tuntas! 🎉'}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${progressFood}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            Beras lumbung pangan & minyak kelapa keluarga marjinal (est. Rp 175rb/paket)
          </span>
        </div>

        {/* Quick Disburse CTA Card */}
        <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 mb-1">
              <Flame className="w-4 h-4" />
              <span>Tuntaskan Target Dampak Anda</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed">
              Salurkan kelebihan zakat maal atau infaq terikat ke mitra amil resmi untuk mengakselerasi pemenuhan target tahunan.
            </p>
          </div>

          {onOpenDisburse && (
            <button
              onClick={onOpenDisburse}
              className="mt-3 w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Salurkan Zakat Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notes & Motivation Banner */}
      {goal.notes && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="italic">"{goal.notes}"</span>
          </div>
          <span className="text-[10px] font-mono text-teal-400 shrink-0">
            Tahun Buku {goal.year}
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT GOAL MODAL                                                          */}
      {/* ========================================================================= */}
      {isEditingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-xl rounded-2xl border p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-slate-900 border-teal-500/40 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black">Konfigurasi Target Dampak Zakat Tahunan</h4>
                  <p className="text-xs text-slate-400">Sesuaikan target outcome sosial untuk siklus {editingForm.year}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 block">Pilih Template Fokus Dampak:</span>
              <div className="grid grid-cols-2 gap-2">
                {GOAL_PRESETS.map((preset) => {
                  const isSelected = editingForm.profileName === preset.config.profileName;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditingForm((prev) => ({ ...prev, ...preset.config }))}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/15 text-teal-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span className="block font-black text-slate-800 dark:text-slate-100">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Number Fields Grid */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              {/* Target Funds (IDR) */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Target Total Dana Zakat Maal (IDR):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="500000"
                    value={editingForm.targetAnnualFundsIDR}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, targetAnnualFundsIDR: Math.max(0, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold text-emerald-400 focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-xs text-slate-400 font-mono shrink-0">
                    {formatShortIDR(editingForm.targetAnnualFundsIDR)}
                  </span>
                </div>
              </div>

              {/* Grid 2 Columns for Specific Outcomes */}
              <div className="grid grid-cols-2 gap-3">
                {/* Target Education Kits */}
                <div>
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1 mb-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Target Paket Pendidikan:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editingForm.targetEducationKits}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, targetEducationKits: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">Satuan: Paket Sekolah & Beasiswa</span>
                </div>

                {/* Target Mustahik Count */}
                <div>
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    Target Mustahik Terbantu:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={editingForm.targetBeneficiariesCount}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, targetBeneficiariesCount: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">Satuan: Jiwa Penerima 8 Asnaf</span>
                </div>

                {/* Target UMKM Kits */}
                <div>
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    Target Modal UMKM Mandiri:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editingForm.targetUmkmKits}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, targetUmkmKits: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">Satuan: Gerobak / Modal Bergulir</span>
                </div>

                {/* Target Health Packages */}
                <div>
                  <label className="text-xs font-bold text-rose-400 flex items-center gap-1 mb-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Target Medis & Gizi Dhuafa:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editingForm.targetHealthPackages}
                    onChange={(e) =>
                      setEditingForm({ ...editingForm, targetHealthPackages: Math.max(1, Number(e.target.value)) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-[10px] text-slate-400">Satuan: Sesi Rawat / Paket Nutrisi</span>
                </div>
              </div>

              {/* Target Food Baskets */}
              <div>
                <label className="text-xs font-bold text-teal-400 flex items-center gap-1 mb-1">
                  <Package className="w-3.5 h-3.5" />
                  Target Paket Pangan Sembako Dhuafa:
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={editingForm.targetFoodBaskets}
                  onChange={(e) =>
                    setEditingForm({ ...editingForm, targetFoodBaskets: Math.max(1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm font-bold focus:outline-none focus:border-teal-400"
                />
                <span className="text-[10px] text-slate-400">Satuan: Paket Sembako Keluarga Marjinal</span>
              </div>

              {/* Notes / Motivation Quote */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Catatan Motivasi & Niat Muzakki:
                </label>
                <textarea
                  rows={2}
                  value={editingForm.notes || ''}
                  onChange={(e) => setEditingForm({ ...editingForm, notes: e.target.value })}
                  placeholder="Tuliskan niat atau doa untuk penerima manfaat zakat Anda..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetGoal}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Standar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGoal(editingForm)}
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Target</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
