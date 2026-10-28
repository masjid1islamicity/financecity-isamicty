import React, { useState, useMemo } from 'react';
import {
  Users,
  HeartHandshake,
  Target,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Globe,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Wheat,
  Sailboat,
} from 'lucide-react';
import { ZakatSummaryRecord, Theme, Language } from '../types';

interface ZakatImpactInfographicProps {
  disbursedRecords: ZakatSummaryRecord[];
  targetLivesCount?: number;
  theme: Theme;
  language: Language;
  onOpenDisburse?: () => void;
  onOpenReport?: () => void;
}

export type ImpactPillarId = 'all' | 'economic' | 'health' | 'education' | 'emergency' | 'dakwah_3t';

interface PillarConfig {
  id: ImpactPillarId;
  name: string;
  englishName: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorHex: string;
  description: string;
}

const PILLARS: PillarConfig[] = [
  {
    id: 'economic',
    name: 'Ekonomi & UMKM Produktif',
    englishName: 'Micro-Enterprise & Livelihood',
    icon: Briefcase,
    colorBg: 'bg-emerald-500',
    colorBorder: 'border-emerald-500/30',
    colorText: 'text-emerald-500',
    colorHex: '#10b981',
    description: 'Pemberdayaan gerobak usaha, modal kerja bergulir, dan alat produksi mustahik.',
  },
  {
    id: 'health',
    name: 'Kesehatan & Gizi Dhuafa',
    englishName: 'Healthcare & Nutrition',
    icon: Stethoscope,
    colorBg: 'bg-teal-500',
    colorBorder: 'border-teal-500/30',
    colorText: 'text-teal-400',
    colorHex: '#14b8a6',
    description: 'Layanan RS gratis dhuafa, posko medis gizi, dan pencegahan stunting balita.',
  },
  {
    id: 'education',
    name: 'Pendidikan & Beasiswa Santri',
    englishName: 'Education & Scholarships',
    icon: GraduationCap,
    colorBg: 'bg-cyan-500',
    colorBorder: 'border-cyan-500/30',
    colorText: 'text-cyan-400',
    colorHex: '#06b6d4',
    description: 'Beasiswa santri berprestasi, laptop riset, dan subsidi SPP kuliah keluarga dhuafa.',
  },
  {
    id: 'emergency',
    name: 'Pangan & Tanggap Bencana',
    englishName: 'Food Security & Disaster Relief',
    icon: Wheat,
    colorBg: 'bg-amber-500',
    colorBorder: 'border-amber-500/30',
    colorText: 'text-amber-400',
    colorHex: '#f59e0b',
    description: 'Distribusi sembako keluarga prasejahtera dan posko darurat tanggap bencana.',
  },
  {
    id: 'dakwah_3t',
    name: 'Infrastruktur & Dakwah 3T',
    englishName: 'Remote Islands (3T) & Infrastructure',
    icon: Sailboat,
    colorBg: 'bg-indigo-500',
    colorBorder: 'border-indigo-500/30',
    colorText: 'text-indigo-400',
    colorHex: '#6366f1',
    description: 'Perahu listrik surya antar-pulau anak sekolah, kafalah da\'i perbatasan, dan pompa irigasi.',
  },
];

/**
 * Maps a single ZakatSummaryRecord to its primary impact pillar and calculates estimated lives supported.
 */
function mapRecordToPillarAndLives(rec: ZakatSummaryRecord): { pillarId: Exclude<ImpactPillarId, 'all'>; livesSupported: number; regionName: string } {
  const p = (rec.programTarget + ' ' + (rec.notes || '')).toLowerCase();

  // Region extraction
  let regionName = 'Nasional';
  if (p.includes('aceh')) regionName = 'Aceh Pidie';
  else if (p.includes('sangihe')) regionName = 'Kep. Sangihe 3T';
  else if (p.includes('balikpapan')) regionName = 'Balikpapan';
  else if (p.includes('solo')) regionName = 'Surakarta (Solo)';
  else if (p.includes('ntt') || p.includes('semau')) regionName = 'P. Semau (NTT 3T)';
  else if (p.includes('sumedang')) regionName = 'Sumedang';
  else if (p.includes('maros')) regionName = 'Maros (Sulsel)';
  else if (p.includes('ciputat')) regionName = 'Ciputat (Banten)';
  else if (p.includes('jayapura') || p.includes('keerom')) regionName = 'Jayapura (Papua 3T)';
  else if (p.includes('z-chicken')) regionName = 'Jabodetabek';
  else if (p.includes('rumah sehat')) regionName = 'Parung (Bogor)';

  // Pillar & Lives calculation
  if (p.includes('z-chicken') || p.includes('gerobak')) {
    return { pillarId: 'economic', livesSupported: 104, regionName }; // 26 families x 4
  }
  if (p.includes('nelayan') || p.includes('jaring')) {
    return { pillarId: 'economic', livesSupported: 54, regionName };
  }
  if (p.includes('kakao') || p.includes('fermentasi')) {
    return { pillarId: 'economic', livesSupported: 48, regionName };
  }
  if (p.includes('difabel') || p.includes('elektronika')) {
    return { pillarId: 'economic', livesSupported: 22, regionName };
  }
  if (p.includes('umkm')) {
    return { pillarId: 'economic', livesSupported: Math.round(rec.amountIDR / 25000), regionName };
  }

  if (p.includes('rumah sehat') || p.includes('balita') || p.includes('stunting')) {
    return { pillarId: 'health', livesSupported: 85, regionName };
  }
  if (p.includes('klinik terapung') || p.includes('malaria')) {
    return { pillarId: 'health', livesSupported: 160, regionName };
  }
  if (p.includes('medis') || p.includes('kesehatan') || p.includes('pos medis')) {
    return { pillarId: 'health', livesSupported: 90, regionName };
  }

  if (p.includes('riset ai') || p.includes('cendekia')) {
    return { pillarId: 'education', livesSupported: 18, regionName };
  }
  if (p.includes('beasiswa') || p.includes('santri')) {
    return { pillarId: 'education', livesSupported: 35, regionName };
  }

  if (p.includes('sembako') || p.includes('pangan') || p.includes('fakir')) {
    return { pillarId: 'emergency', livesSupported: 95, regionName };
  }
  if (p.includes('bencana') || p.includes('banjir') || p.includes('darurat')) {
    return { pillarId: 'emergency', livesSupported: 120, regionName };
  }

  if (p.includes('semau') || p.includes('perahu surya')) {
    return { pillarId: 'dakwah_3t', livesSupported: 180, regionName };
  }
  if (p.includes('sangihe') || p.includes("da'i") || p.includes('maritim')) {
    return { pillarId: 'dakwah_3t', livesSupported: 140, regionName };
  }
  if (p.includes('irigasi') || p.includes('sawah') || p.includes('pompa')) {
    return { pillarId: 'dakwah_3t', livesSupported: 76, regionName };
  }

  // Fallback estimation
  const livesFallback = Math.max(12, Math.round(rec.amountIDR / 28000));
  return { pillarId: 'economic', livesSupported: livesFallback, regionName };
}

export const ZakatImpactInfographic: React.FC<ZakatImpactInfographicProps> = ({
  disbursedRecords,
  targetLivesCount = 1500,
  theme,
  language,
  onOpenDisburse,
  onOpenReport,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<ImpactPillarId>('all');
  const [showAllPrograms, setShowAllPrograms] = useState<boolean>(false);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Enriched records with computed pillar, lives, and region
  const enrichedRecords = useMemo(() => {
    return disbursedRecords.map((rec) => {
      const { pillarId, livesSupported, regionName } = mapRecordToPillarAndLives(rec);
      return {
        ...rec,
        pillarId,
        livesSupported,
        regionName,
      };
    });
  }, [disbursedRecords]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalFunds = enrichedRecords.reduce((sum, r) => sum + r.amountIDR, 0);
    const totalLives = enrichedRecords.reduce((sum, r) => sum + r.livesSupported, 0);
    const uniquePrograms = new Set(enrichedRecords.map((r) => r.programTarget)).size;
    const uniqueInstitutions = new Set(enrichedRecords.map((r) => r.institution)).size;
    const uniqueRegions = new Set(enrichedRecords.map((r) => r.regionName)).size;

    // Pillar Breakdown
    const pillarData = PILLARS.map((p) => {
      const recordsForPillar = enrichedRecords.filter((r) => r.pillarId === p.id);
      const funds = recordsForPillar.reduce((sum, r) => sum + r.amountIDR, 0);
      const lives = recordsForPillar.reduce((sum, r) => sum + r.livesSupported, 0);
      const programCount = recordsForPillar.length;
      const percentage = totalFunds > 0 ? (funds / totalFunds) * 100 : 0;
      const livesPercentage = totalLives > 0 ? (lives / totalLives) * 100 : 0;

      return {
        ...p,
        funds,
        lives,
        programCount,
        percentage,
        livesPercentage,
        records: recordsForPillar,
      };
    });

    return {
      totalFunds,
      totalLives,
      uniquePrograms,
      uniqueInstitutions,
      uniqueRegions,
      pillarData,
    };
  }, [enrichedRecords]);

  // Goal Progress Calculation
  const progressPercent = Math.min(100, Math.round((metrics.totalLives / targetLivesCount) * 100));

  // Filtered Records based on selected pillar
  const displayedRecords = useMemo(() => {
    const list =
      selectedPillar === 'all'
        ? enrichedRecords
        : enrichedRecords.filter((r) => r.pillarId === selectedPillar);

    return showAllPrograms ? list : list.slice(0, 4);
  }, [enrichedRecords, selectedPillar, showAllPrograms]);

  const activePillarConfig = PILLARS.find((p) => p.id === selectedPillar);

  return (
    <div
      id="zakat-impact-infographic-card"
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-emerald-100 shadow-xs'
      }`}
    >
      {/* Top Header: Title, Live Status & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Infografis Dampak Nyata Zakat (Live Social Impact)
              </h3>
              <p className="text-xs text-slate-400">
                Visualisasi kumulatif jiwa dan program mustahik yang terbantu berdasarkan Bukti Setor Zakat (BSZ) resmi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Dana Disalurkan:</span>
            <span className="text-sm font-bold text-emerald-400">{formatIDR(metrics.totalFunds)}</span>
          </div>
          {onOpenDisburse && (
            <button
              id="infographic-add-zakat-btn"
              onClick={onOpenDisburse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Salur Zakat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 4 Key Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        {/* Card 1: Lives Supported */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Jiwa Terbantu</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-teal-400">
              {metrics.totalLives.toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1">Jiwa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Mustahik & keluarga penerima manfaat</div>
          </div>
        </div>

        {/* Card 2: Programs Supported */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Program Didukung</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-emerald-400">
              {metrics.uniquePrograms}
              <span className="text-xs font-normal text-slate-400 ml-1">Inisiatif</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">5 pilar kebaikan berkelanjutan</div>
          </div>
        </div>

        {/* Card 3: Institutions Partnered */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Lembaga Amil Resmi</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-cyan-400">
              {metrics.uniqueInstitutions}
              <span className="text-xs font-normal text-slate-400 ml-1">Lembaga</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">BAZNAS, DD, RZ, Lazismu, Lazisnu</div>
          </div>
        </div>

        {/* Card 4: Regions Reached */}
        <div
          className={`p-4 rounded-xl border relative overflow-hidden ${
            theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sebaran Wilayah</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black tracking-tight text-indigo-400">
              {metrics.uniqueRegions}
              <span className="text-xs font-normal text-slate-400 ml-1">Daerah</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hingga pelosok pulau & perbatasan 3T</div>
          </div>
        </div>
      </div>

      {/* Annual Milestone Progress Bar */}
      <div
        className={`p-4 rounded-xl border mb-5 ${
          theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Kemajuan Target Dampak Sosial Tahunan (Goal: {targetLivesCount.toLocaleString('id-ID')} Jiwa)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-teal-400 font-bold">{progressPercent}% Terpenuhi</span>
            <span className="text-slate-400">
              ({metrics.totalLives} dari {targetLivesCount} Jiwa)
            </span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
          <span>Tersisa {Math.max(0, targetLivesCount - metrics.totalLives)} jiwa lagi untuk mencapai target 100% tahun ini</span>
          <span className="text-teal-500 font-semibold">Tingkat Pencapaian: Duta Berkah Nusantara</span>
        </div>
      </div>

      {/* Multi-Segment Infographic Progress Bar Across 5 Pillars */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <span>Komposisi Distribusi Dampak Berdasarkan 5 Pilar Kebaikan</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Klik pilar di bawah untuk memfilter riwayat program dan rincian mustahik terkait.
            </p>
          </div>

          {selectedPillar !== 'all' && (
            <button
              onClick={() => setSelectedPillar('all')}
              className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 underline transition-colors"
            >
              Reset ke Semua Pilar
            </button>
          )}
        </div>

        {/* Multi-Segmented Visual Progress Bar */}
        <div className="w-full h-5 rounded-xl overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner p-0.5 gap-0.5">
          {metrics.pillarData.map((p) => {
            if (p.percentage <= 0) return null;
            const isSelected = selectedPillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(selectedPillar === p.id ? 'all' : p.id)}
                className={`h-full transition-all duration-300 relative group first:rounded-l-lg last:rounded-r-lg ${p.colorBg} ${
                  isSelected ? 'ring-2 ring-white scale-y-110 z-10' : 'hover:opacity-90'
                }`}
                style={{ width: `${Math.max(4, p.percentage)}%` }}
                title={`${p.name}: ${p.lives} Jiwa (${Math.round(p.percentage)}%)`}
              />
            );
          })}
        </div>

        {/* Pillar Legend Cards / Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
          {metrics.pillarData.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(selectedPillar === p.id ? 'all' : p.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${p.colorBorder} bg-teal-500/10 shadow-xs ring-1 ring-teal-500/50`
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${p.colorBg}`} />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className={`text-xs font-black ${p.colorText}`}>
                    {p.lives} <span className="text-[10px] font-normal text-slate-400">Jiwa</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{Math.round(p.percentage)}%</span>
                </div>

                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {p.programCount} Program • {formatIDR(p.funds)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Program Breakdown Details (Filtered by Selected Pillar or All) */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {selectedPillar === 'all'
                ? `Rincian Program Penyaluran (${enrichedRecords.length} Penyaluran)`
                : `Program Terkait: ${activePillarConfig?.name} (${displayedRecords.length} Penyaluran)`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold underline transition-colors"
              >
                Lihat Arsip BSZ →
              </button>
            )}
          </div>
        </div>

        {/* List of Programs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {displayedRecords.map((item) => {
            const pillar = PILLARS.find((p) => p.id === item.pillarId) || PILLARS[0];
            const Icon = pillar.icon;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                  theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${pillar.colorText}`} />
                      {item.programTarget}
                    </span>
                    <span className="text-xs font-black text-emerald-400 shrink-0">
                      {formatIDR(item.amountIDR)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.notes || 'Penyaluran zakat terverifikasi untuk pemberdayaan masyarakat dhuafa.'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.institution}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.regionName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-teal-400">
                    <Users className="w-3 h-3" />
                    <span>~{item.livesSupported} Jiwa Terbantu</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle Show More if more than 4 */}
        {enrichedRecords.length > 4 && (
          <div className="text-center pt-1">
            <button
              onClick={() => setShowAllPrograms(!showAllPrograms)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span>{showAllPrograms ? 'Tampilkan Lebih Sedikit' : `Lihat Semua ${enrichedRecords.length} Program Dampak`}</span>
              {showAllPrograms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
