import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Award,
  Plus,
  Trash2,
  TrendingUp,
  Clock,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  DollarSign,
  Scale,
  Sliders,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CustomFinancialMilestone, CustomMilestoneCategory, Language, Theme } from '../types';
import {
  calculateTimeToMilestone,
  formatRupiah,
  formatRupiahCompact,
  MilestoneTimeToGoalResult,
} from '../utils/shariaWealthProjectionEngine';

interface CustomMilestoneManagerProps {
  currentBalanceIDR: number;
  monthlyDcaIDR: number;
  annualCagr: number;
  theme: Theme;
  language: Language;
  onUpdateMonthlyDca?: (newDca: number) => void;
  onMilestonesChange?: (milestones: CustomFinancialMilestone[]) => void;
}

const STORAGE_KEY = 'sharia_custom_milestones_v2';

export const DEFAULT_SHARIA_MILESTONES: CustomFinancialMilestone[] = [
  {
    id: 'MILESTONE-1',
    title: 'Tabungan Haji Khusus & Umrah Keluarga',
    category: 'hajj_umrah',
    categoryLabel: 'Ibadah Haji & Umrah',
    icon: '🕋',
    targetAmountIDR: 350000000,
    priority: 'HIGH',
    targetDeadlineYear: 2028,
    shariaNote: 'ONH Plus 2 Pax tanpa antrean 25 tahun, hotel bintang 5 depan Masjidil Haram.',
    createdAt: '2026-01-15',
  },
  {
    id: 'MILESTONE-2',
    title: 'Rumah Idaman Keluarga Bebas KPR Riba',
    category: 'home_purchase',
    categoryLabel: 'Properti Halal',
    icon: '🏡',
    targetAmountIDR: 850000000,
    priority: 'HIGH',
    targetDeadlineYear: 2030,
    shariaNote: 'Pembelian cash bertahap developer syariah tanpa denda keterlambatan dan sita sepihak.',
    createdAt: '2026-02-10',
  },
  {
    id: 'MILESTONE-3',
    title: 'Dana Pendidikan Tinggi & Beasiswa Santri',
    category: 'education',
    categoryLabel: 'Pendidikan Anak',
    icon: '🎓',
    targetAmountIDR: 250000000,
    priority: 'MEDIUM',
    targetDeadlineYear: 2029,
    shariaNote: 'Pendidikan universitas terbaik dan hafiz Quran bersanad untuk putra-putri.',
    createdAt: '2026-03-01',
  },
  {
    id: 'MILESTONE-4',
    title: 'Wakaf Produktif Sarana Air & Klinik Dhuafa',
    category: 'waqf',
    categoryLabel: 'Sedekah Jariyah',
    icon: '🏥',
    targetAmountIDR: 100000000,
    priority: 'MEDIUM',
    targetDeadlineYear: 2027,
    shariaNote: 'Wakaf uang abadi melalui nazhir resmi BWI yang dividennya membiayai pengobatan mustahik.',
    createdAt: '2026-03-12',
  },
  {
    id: 'MILESTONE-5',
    title: 'Dana Pensiun Mandiri Syariah (Passive Income)',
    category: 'retirement',
    categoryLabel: 'Kebebasan Finansial',
    icon: '🌴',
    targetAmountIDR: 1500000000,
    priority: 'LOW',
    targetDeadlineYear: 2034,
    shariaNote: 'Portofolio sukuk dan emas fisik yang menghasilkan bagi hasil konsisten di masa purna tugas.',
    createdAt: '2026-03-20',
  },
];

const CATEGORY_PRESETS: {
  category: CustomMilestoneCategory;
  label: string;
  icon: string;
  defaultAmount: number;
}[] = [
  { category: 'hajj_umrah', label: 'Haji & Umrah', icon: '🕋', defaultAmount: 350000000 },
  { category: 'home_purchase', label: 'Rumah Halal', icon: '🏡', defaultAmount: 850000000 },
  { category: 'education', label: 'Pendidikan Anak', icon: '🎓', defaultAmount: 250000000 },
  { category: 'waqf', label: 'Wakaf Produktif', icon: '🏥', defaultAmount: 100000000 },
  { category: 'retirement', label: 'Pensiun Mandiri', icon: '🌴', defaultAmount: 1500000000 },
  { category: 'emergency_fund', label: 'Dana Darurat Emas', icon: '🛡️', defaultAmount: 120000000 },
  { category: 'custom', label: 'Sasaran Kustom', icon: '⭐', defaultAmount: 150000000 },
];

export const CustomMilestoneManager: React.FC<CustomMilestoneManagerProps> = ({
  currentBalanceIDR,
  monthlyDcaIDR,
  annualCagr,
  theme,
  language,
  onUpdateMonthlyDca,
  onMilestonesChange,
}) => {
  // Milestones State
  const [milestones, setMilestones] = useState<CustomFinancialMilestone[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return DEFAULT_SHARIA_MILESTONES;
  });

  const [isAddFormOpen, setIsAddFormOpen] = useState<boolean>(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('ALL');

  // Form Fields
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<CustomMilestoneCategory>('home_purchase');
  const [targetAmountIDR, setTargetAmountIDR] = useState<number>(500000000);
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [targetDeadlineYear, setTargetDeadlineYear] = useState<number>(new Date().getFullYear() + 3);
  const [shariaNote, setShariaNote] = useState<string>('');

  const onMilestonesChangeRef = useRef(onMilestonesChange);
  useEffect(() => {
    onMilestonesChangeRef.current = onMilestonesChange;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    } catch (e) {
      // Ignore
    }
    if (onMilestonesChangeRef.current) {
      onMilestonesChangeRef.current(milestones);
    }
  }, [milestones]);

  // Compute time-to-goal metrics for each milestone
  const milestonesWithCalculations = useMemo(() => {
    return milestones.map((m) => {
      const result: MilestoneTimeToGoalResult = calculateTimeToMilestone({
        currentBalanceIDR,
        targetAmountIDR: m.targetAmountIDR,
        monthlyDcaIDR: m.customMonthlyDcaOverride ?? monthlyDcaIDR,
        annualCagr,
      });

      return {
        ...m,
        result,
      };
    });
  }, [milestones, currentBalanceIDR, monthlyDcaIDR, annualCagr]);

  // Filtered list
  const filteredMilestones = useMemo(() => {
    if (selectedFilterCategory === 'ALL') return milestonesWithCalculations;
    return milestonesWithCalculations.filter((m) => m.category === selectedFilterCategory);
  }, [milestonesWithCalculations, selectedFilterCategory]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalGoalsCount = milestones.length;
    const achievedCount = milestonesWithCalculations.filter((m) => m.result.isAlreadyAchieved).length;
    const totalTargetSumIDR = milestones.reduce((acc, m) => acc + m.targetAmountIDR, 0);
    const totalTimeSavedMonths = milestonesWithCalculations.reduce(
      (acc, m) => acc + (m.result.monthsSavedWithShariaGrowth || 0),
      0
    );

    return {
      totalGoalsCount,
      achievedCount,
      totalTargetSumIDR,
      totalTimeSavedYears: (totalTimeSavedMonths / 12).toFixed(1),
    };
  }, [milestones, milestonesWithCalculations]);

  // Handle Preset Select
  const handleSelectCategoryPreset = (cat: CustomMilestoneCategory) => {
    setCategory(cat);
    const preset = CATEGORY_PRESETS.find((p) => p.category === cat);
    if (preset) {
      setTargetAmountIDR(preset.defaultAmount);
      if (!title) {
        setTitle(`Target ${preset.label}`);
      }
    }
  };

  // Add Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmountIDR <= 0) return;

    const preset = CATEGORY_PRESETS.find((p) => p.category === category);
    const newMilestone: CustomFinancialMilestone = {
      id: `MILESTONE-${Date.now()}`,
      title: title.trim(),
      category,
      categoryLabel: preset?.label || 'Sasaran Kustom',
      icon: preset?.icon || '⭐',
      targetAmountIDR,
      priority,
      targetDeadlineYear,
      shariaNote: shariaNote.trim() || 'Niat ikhtiar menggapai keberkahan harta halal.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setMilestones((prev) => [newMilestone, ...prev]);

    // Reset Form
    setTitle('');
    setShariaNote('');
    setIsAddFormOpen(false);
  };

  // Delete Milestone
  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div
      id="custom-financial-milestone-manager"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <Compass className="w-5 h-5 text-amber-300" />
              </span>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Peta Sasaran Finansial Syariah & Milestone Masa Depan
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Time-to-Goal Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Tentukan milestone keuangan impian Anda (Haji, Rumah Halal, Pendidikan, Wakaf) dan visualisasikan
              estimasi waktu tercapai berdasarkan compound pertumbuhan syariah (CAGR {(annualCagr * 100).toFixed(1)}%) dan setoran rutin bulanan.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsAddFormOpen(!isAddFormOpen)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Milestone</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="text-[10px] text-slate-400">Total Milestone Terpasang</div>
            <div className="text-base font-black text-slate-100 font-mono mt-0.5">
              {stats.totalGoalsCount} Sasaran ({stats.achievedCount} Tercapai)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="text-[10px] text-slate-400">Akumulasi Target Finansial</div>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
              {formatRupiahCompact(stats.totalTargetSumIDR)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="text-[10px] text-slate-400">Setoran Rutin Bulanan (DCA)</div>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5">
              {formatRupiah(monthlyDcaIDR)}/bln
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="text-[10px] text-slate-400">Waktu Dihemat vs Simpanan Biasa</div>
            <div className="text-base font-black text-cyan-300 font-mono mt-0.5 flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>+{stats.totalTimeSavedYears} Tahun</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recurring DCA Adjustment Slider */}
      {onUpdateMonthlyDca && (
        <div className="px-5 py-3.5 bg-slate-950/30 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">
              Simulasi Kecepatan Capaian dengan Mengubah Tabungan Rutin (DCA):
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-80">
            <input
              type="range"
              min="0"
              max="20000000"
              step="500000"
              value={monthlyDcaIDR}
              onChange={(e) => onUpdateMonthlyDca(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="font-mono font-bold text-emerald-400 text-xs whitespace-nowrap min-w-[90px] text-right">
              {formatRupiahCompact(monthlyDcaIDR)}
            </span>
          </div>
        </div>
      )}

      {/* Add Milestone Form Collapsible */}
      {isAddFormOpen && (
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Formulir Milestone Finansial Syariah Baru</span>
            </h4>
            <button
              onClick={() => setIsAddFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Batal
            </button>
          </div>

          {/* Category Quick Presets */}
          <div className="mb-3 space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Pilih Kategori Sasaran:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
              {CATEGORY_PRESETS.map((preset) => (
                <button
                  key={preset.category}
                  type="button"
                  onClick={() => handleSelectCategoryPreset(preset.category)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    category === preset.category
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-[10px] font-bold leading-tight">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddMilestone} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400">Nama Milestone / Impian:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tabungan Ibadah Haji Plus Keluarga Furoda"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400">Target Nominal (IDR):</label>
              <input
                type="number"
                step="5000000"
                value={targetAmountIDR}
                onChange={(e) => setTargetAmountIDR(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400">Catatan & Niat Fiqh / Maqasid:</label>
              <input
                type="text"
                value={shariaNote}
                onChange={(e) => setShariaNote(e.target.value)}
                placeholder="Niat ibadah memuliakan keluarga tanpa jerat riba dan hutang berbunga..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Simpan Milestone</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-5 py-3 flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter Kategori:</span>
          {['ALL', 'hajj_umrah', 'home_purchase', 'education', 'waqf', 'retirement'].map((catKey) => {
            const isSelected = selectedFilterCategory === catKey;
            const label =
              catKey === 'ALL'
                ? 'Semua'
                : CATEGORY_PRESETS.find((p) => p.category === catKey)?.label || catKey;

            return (
              <button
                key={catKey}
                onClick={() => setSelectedFilterCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Menampilkan {filteredMilestones.length} dari {milestones.length} sasaran
        </span>
      </div>

      {/* Milestone Cards Grid */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMilestones.map((m) => {
            const { result } = m;
            const isAchieved = result.isAlreadyAchieved;

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isAchieved
                    ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-slate-900/80 to-transparent'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                }`}
              >
                {/* Milestone Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 shrink-0">
                      {m.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-100 text-sm">{m.title}</h4>
                        <span className="px-2 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {m.categoryLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {m.shariaNote}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Target & Current Balance */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Target Nominal</span>
                      <span className="font-black text-slate-100 font-mono text-sm">
                        {formatRupiah(m.targetAmountIDR)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Akumulasi Portofolio</span>
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        {formatRupiah(currentBalanceIDR)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progres Tercapai</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        {result.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-700 ${
                          isAchieved
                            ? 'bg-emerald-400'
                            : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400'
                        }`}
                        style={{ width: `${result.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Time-to-Reach Result Badge */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  {isAchieved ? (
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Alhamdulillah! Target Finansial Ini Telah Tercapai.</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold">Estimasi Tercapai:</span>
                        <strong className="text-amber-400 font-mono">
                          {result.yearsNeeded > 0 ? `${result.yearsNeeded} Thn ` : ''}
                          {result.remainingMonths} Bulan
                        </strong>
                        <span className="text-[11px] text-slate-400">
                          ({result.estimatedCompletionDate})
                        </span>
                      </div>

                      {result.monthsSavedWithShariaGrowth > 0 && (
                        <div className="text-[10px] text-cyan-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>
                            Lebih cepat ±{(result.monthsSavedWithShariaGrowth / 12).toFixed(1)} tahun
                            berkat imbal hasil syariah!
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Kekurangan Dana:</span>
                    <span className="font-bold text-slate-300 font-mono text-[11px]">
                      {isAchieved ? 'Rp 0' : formatRupiah(result.currentShortfallIDR)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
