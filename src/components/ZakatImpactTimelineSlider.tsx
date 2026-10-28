import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Users,
  Compass,
  Building2,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatProgramDistributionData } from '../types';

export interface TimelinePeriodPoint {
  id: string;
  period: string;
  year: number;
  label: string;
  startDate: string;
  endDate: string;
  milestoneTitle: string;
  milestoneDesc: string;
  milestoneIcon: string;
}

export const TIMELINE_PERIODS: TimelinePeriodPoint[] = [
  // 2023
  {
    id: 'p-2023-q1',
    period: 'Q1 2023',
    year: 2023,
    label: 'Q1 2023 (Jan - Mar)',
    startDate: '2023-01-01',
    endDate: '2023-03-31',
    milestoneTitle: 'Inisiasi Filantropi Digital',
    milestoneDesc: 'Penyaluran perdana paket sembako Ramadan 1444H BAZNAS & Dompet Dhuafa.',
    milestoneIcon: '🌱',
  },
  {
    id: 'p-2023-q2',
    period: 'Q2 2023',
    year: 2023,
    label: 'Q2 2023 (Apr - Jun)',
    startDate: '2023-04-01',
    endDate: '2023-06-30',
    milestoneTitle: 'Tanggap Medis Darurat',
    milestoneDesc: 'Posko kesehatan dhuafa dan air bersih paska musibah pesisir marjinal.',
    milestoneIcon: '🩺',
  },
  {
    id: 'p-2023-q3',
    period: 'Q3 2023',
    year: 2023,
    label: 'Q3 2023 (Jul - Sep)',
    startDate: '2023-07-01',
    endDate: '2023-09-30',
    milestoneTitle: 'Dukungan Modal Mikro Awal',
    milestoneDesc: 'Penyaluran qardhul hasan modal bergulir 12 pedagang asnaf miskin.',
    milestoneIcon: '💼',
  },
  {
    id: 'p-2023-q4',
    period: 'Q4 2023',
    year: 2023,
    label: 'Q4 2023 (Okt - Des)',
    startDate: '2023-10-01',
    endDate: '2023-12-31',
    milestoneTitle: 'Lumbung Pangan Akhir Tahun',
    milestoneDesc: 'Cadangan sembako keluarga prasejahtera & perlengkapan santri pedesaan.',
    milestoneIcon: '🌾',
  },

  // 2024
  {
    id: 'p-2024-q1',
    period: 'Q1 2024',
    year: 2024,
    label: 'Q1 2024 (Jan - Mar)',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    milestoneTitle: 'Beasiswa Juara Santri Dhuafa',
    milestoneDesc: 'Pengadaan paket alat belajar, seragam, & SPP 45 santri tahfidz Rumah Zakat.',
    milestoneIcon: '🎓',
  },
  {
    id: 'p-2024-q2',
    period: 'Q2 2024',
    year: 2024,
    label: 'Q2 2024 (Apr - Jun)',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    milestoneTitle: 'Kafalah Da’i Maritim Sangihe 3T',
    milestoneDesc: 'Subsidi perahu maritim dakwah kepulauan terluar perbatasan Filipina.',
    milestoneIcon: '⛵',
  },
  {
    id: 'p-2024-q3',
    period: 'Q3 2024',
    year: 2024,
    label: 'Q3 2024 (Jul - Sep)',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    milestoneTitle: 'Pemberdayaan Nelayan Pesisir Balikpapan',
    milestoneDesc: 'Bantuan jaring ramah lingkungan dan modal olahan terasi mandiri.',
    milestoneIcon: '🐟',
  },
  {
    id: 'p-2024-q4',
    period: 'Q4 2024',
    year: 2024,
    label: 'Q4 2024 (Okt - Des)',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    milestoneTitle: 'Graduasi 150+ Mustahik Mandiri',
    milestoneDesc: 'Transformasi mustahik menjadi munfiq baru yang berdaya secara ekonomi.',
    milestoneIcon: '🤝',
  },

  // 2025
  {
    id: 'p-2025-q1',
    period: 'Q1 2025',
    year: 2025,
    label: 'Q1 2025 (Jan - Mar)',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    milestoneTitle: 'Beasiswa Riset AI Syariah Solo',
    milestoneDesc: 'Subsidi laptop riset komputasi syariah santri berprestasi IPK 3.86.',
    milestoneIcon: '💻',
  },
  {
    id: 'p-2025-q2',
    period: 'Q2 2025',
    year: 2025,
    label: 'Q2 2025 (Apr - Jun)',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    milestoneTitle: 'Perahu Surya Semau NTT 3T',
    milestoneDesc: 'Panel surya perahu antar-pulau mobilitas anak sekolah & nelayan pedalaman NTT.',
    milestoneIcon: '☀️',
  },
  {
    id: 'p-2025-q3',
    period: 'Q3 2025',
    year: 2025,
    label: 'Q3 2025 (Jul - Sep)',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    milestoneTitle: 'Irigasi Pompa Surya Sumedang',
    milestoneDesc: 'Selamatkan 4 Ha sawah organik dari paceklik kemarau ekstrem kelompok tani.',
    milestoneIcon: '🌿',
  },
  {
    id: 'p-2025-q4',
    period: 'Q4 2025',
    year: 2025,
    label: 'Q4 2025 (Okt - Des)',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    milestoneTitle: 'Sentra Kakao Dhuafa Maros',
    milestoneDesc: 'Bibit kakao organik fair-trade & paket nutrisi pencegahan stunting balita.',
    milestoneIcon: '🍫',
  },

  // 2026
  {
    id: 'p-2026-q1',
    period: 'Q1 2026',
    year: 2026,
    label: 'Q1 2026 (Jan - Mar)',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    milestoneTitle: 'Vokasi Difabel Mandiri Ciputat',
    milestoneDesc: 'Pelatihan teknisi elektronika & solder mikrokontroler difabel mandiri.',
    milestoneIcon: '🔧',
  },
  {
    id: 'p-2026-mei',
    period: 'Mei 2026',
    year: 2026,
    label: 'Mei 2026 (Ramadan 1447H)',
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    milestoneTitle: 'Pemberdayaan Z-Chicken BAZNAS Batch 1',
    milestoneDesc: 'Gerobak etalase higienis & modal kerja bergulir 26 mustahik LPEM.',
    milestoneIcon: '🍗',
  },
  {
    id: 'p-2026-jul',
    period: 'Jul 2026',
    year: 2026,
    label: 'Jul 2026 (Kuartal 3)',
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    milestoneTitle: 'Klinik Terapung Jayapura 3T',
    milestoneDesc: 'Pelayanan pengobatan keliling pedalaman Papua perbatasan RI-PNG.',
    milestoneIcon: '🏥',
  },
  {
    id: 'p-2026-sep',
    period: 'Sep 2026',
    year: 2026,
    label: 'Sep 2026 (Audit WTP Terkini)',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    milestoneTitle: 'Audit WTP & 840+ Jiwa Terbantu',
    milestoneDesc: 'Sertifikasi akuntabilitas amil syariah & integrasi BSZ legal digital kemenag.',
    milestoneIcon: '⭐',
  },
];

export interface ZakatTimelineFilterRange {
  startDate: string;
  endDate: string;
  startPeriod: string;
  endPeriod: string;
  startYear: number;
  endYear: number;
  startIndex: number;
  endIndex: number;
  isFullRange: boolean;
  label: string;
}

interface ZakatImpactTimelineSliderProps {
  disbursedRecords: ZakatSummaryRecord[];
  programDistributions: ZakatProgramDistributionData[];
  onRangeChange: (range: ZakatTimelineFilterRange) => void;
  theme: Theme;
  language: Language;
}

export const ZakatImpactTimelineSlider: React.FC<ZakatImpactTimelineSliderProps> = ({
  disbursedRecords,
  programDistributions,
  onRangeChange,
  theme,
  language,
}) => {
  const maxIdx = TIMELINE_PERIODS.length - 1;
  const [startIndex, setStartIndex] = useState<number>(0);
  const [endIndex, setEndIndex] = useState<number>(maxIdx);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // 1.5s per tick
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep a stable ref to onRangeChange to prevent infinite render loops when parent passes an inline function
  const onRangeChangeRef = useRef(onRangeChange);
  useEffect(() => {
    onRangeChangeRef.current = onRangeChange;
  });

  const lastNotifiedRangeRef = useRef<string>('');

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

  const startPeriod = TIMELINE_PERIODS[startIndex];
  const endPeriod = TIMELINE_PERIODS[endIndex];
  const isFullRange = startIndex === 0 && endIndex === maxIdx;

  // Active label
  const rangeLabel = useMemo(() => {
    if (isFullRange) return 'Semua Waktu (2023 - 2026)';
    if (startPeriod.year === endPeriod.year) {
      if (startPeriod.id === endPeriod.id) return `${startPeriod.period} (${startPeriod.year})`;
      return `${startPeriod.period} - ${endPeriod.period} (${startPeriod.year})`;
    }
    return `${startPeriod.period} - ${endPeriod.period} (${startPeriod.year} - ${endPeriod.year})`;
  }, [startIndex, endIndex, isFullRange, startPeriod, endPeriod]);

  // Notify parent on range change safely without causing feedback loops
  useEffect(() => {
    const rangeKey = `${startIndex}-${endIndex}-${isFullRange}`;
    if (lastNotifiedRangeRef.current === rangeKey) return;
    lastNotifiedRangeRef.current = rangeKey;

    if (onRangeChangeRef.current) {
      onRangeChangeRef.current({
        startDate: startPeriod.startDate,
        endDate: endPeriod.endDate,
        startPeriod: startPeriod.period,
        endPeriod: endPeriod.period,
        startYear: startPeriod.year,
        endYear: endPeriod.year,
        startIndex,
        endIndex,
        isFullRange,
        label: rangeLabel,
      });
    }
  }, [startIndex, endIndex, startPeriod, endPeriod, isFullRange, rangeLabel]);

  // Filtered program distributions in range
  const filteredDistributions = useMemo(() => {
    return programDistributions.slice(startIndex, endIndex + 1);
  }, [programDistributions, startIndex, endIndex]);

  // Calculate metrics for current timeline slice
  const timelineMetrics = useMemo(() => {
    const totalFunds = filteredDistributions.reduce((acc, d) => acc + (d.totalIDR || 0), 0);
    const totalBeneficiaries = filteredDistributions.reduce(
      (acc, d) => acc + (d.beneficiariesCount || 0),
      0
    );

    // Sum programs in range
    const umkmTotal = filteredDistributions.reduce((acc, d) => acc + (d.umkmMustahik || 0), 0);
    const healthTotal = filteredDistributions.reduce((acc, d) => acc + (d.kesehatanDhuafa || 0), 0);
    const eduTotal = filteredDistributions.reduce((acc, d) => acc + (d.beasiswaPendidikan || 0), 0);
    const humanTotal = filteredDistributions.reduce((acc, d) => acc + (d.kemanusiaanBencana || 0), 0);
    const dakwahTotal = filteredDistributions.reduce((acc, d) => acc + (d.dakwahAdvokasi || 0), 0);

    // Growth comparison from start period to end period
    const startPeriodFund = filteredDistributions[0]?.totalIDR || 1;
    const endPeriodFund =
      filteredDistributions[filteredDistributions.length - 1]?.totalIDR || startPeriodFund;
    const growthPercent =
      startPeriodFund > 0 ? Math.round(((endPeriodFund - startPeriodFund) / startPeriodFund) * 100) : 0;

    // Disbursed records in selected range
    const matchingRecords = disbursedRecords.filter((r) => {
      const recDate = r.date.split(' ')[0];
      return recDate >= startPeriod.startDate && recDate <= endPeriod.endDate;
    });

    const userFundedTotal = matchingRecords.reduce((acc, r) => acc + r.amountIDR, 0);

    return {
      totalFunds,
      totalBeneficiaries,
      umkmTotal,
      healthTotal,
      eduTotal,
      humanTotal,
      dakwahTotal,
      growthPercent,
      matchingRecordsCount: matchingRecords.length,
      userFundedTotal,
    };
  }, [filteredDistributions, disbursedRecords, startPeriod, endPeriod]);

  // Handle Playback for "Evolve Impact"
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setEndIndex((prevEnd) => {
          if (prevEnd >= maxIdx) {
            // Loop or stop
            setIsPlaying(false);
            return prevEnd;
          }
          return prevEnd + 1;
        });
      }, playbackSpeed);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, maxIdx]);

  const handleStartPlay = () => {
    if (endIndex >= maxIdx && startIndex === 0) {
      // Restart playback from beginning if at the end
      setStartIndex(0);
      setEndIndex(0);
    }
    setIsPlaying(true);
  };

  const handlePausePlay = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStartIndex(0);
    setEndIndex(maxIdx);
  };

  // Quick Preset Handlers
  const handlePresetSelect = (presetKey: string) => {
    setIsPlaying(false);
    switch (presetKey) {
      case 'ALL':
        setStartIndex(0);
        setEndIndex(maxIdx);
        break;
      case '2026': {
        const first2026 = TIMELINE_PERIODS.findIndex((p) => p.year === 2026);
        setStartIndex(first2026);
        setEndIndex(maxIdx);
        break;
      }
      case '2025': {
        const first2025 = TIMELINE_PERIODS.findIndex((p) => p.year === 2025);
        const last2025 = TIMELINE_PERIODS.reduce((max, p, idx) => (p.year === 2025 ? idx : max), 0);
        setStartIndex(first2025);
        setEndIndex(last2025);
        break;
      }
      case '2024': {
        const first2024 = TIMELINE_PERIODS.findIndex((p) => p.year === 2024);
        const last2024 = TIMELINE_PERIODS.reduce((max, p, idx) => (p.year === 2024 ? idx : max), 0);
        setStartIndex(first2024);
        setEndIndex(last2024);
        break;
      }
      case '2023': {
        const first2023 = TIMELINE_PERIODS.findIndex((p) => p.year === 2023);
        const last2023 = TIMELINE_PERIODS.reduce((max, p, idx) => (p.year === 2023 ? idx : max), 0);
        setStartIndex(first2023);
        setEndIndex(last2023);
        break;
      }
      case '3YEARS': {
        const first2024 = TIMELINE_PERIODS.findIndex((p) => p.year === 2024);
        setStartIndex(first2024);
        setEndIndex(maxIdx);
        break;
      }
      default:
        break;
    }
  };

  // Year markers helper for the slider track
  const yearMarkers = [
    { year: 2023, index: 0, label: '2023' },
    { year: 2024, index: 4, label: '2024' },
    { year: 2025, index: 8, label: '2025' },
    { year: 2026, index: 12, label: '2026' },
  ];

  return (
    <div
      id="zakat-interactive-timeline-slider"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-teal-500/30 shadow-xl shadow-teal-950/20'
          : 'bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-teal-200/90 shadow-sm'
      } p-5 space-y-5`}
    >
      {/* Header with Title and Play Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Rentang Waktu & Evolusi Dampak Zakat (Interactive Multi-Year Timeline)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                2023 – 2026 Multi-Tahun
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Geser tuas timeline untuk memfilter grafik distribusi D3.js dan peta sebaran wilayah berdasarkan rentang tanggal. Saksikan bagaimana pertumbuhan dana zakat Anda mentransformasi kehidupan mustahik dari tahun ke tahun.
            </p>
          </div>
        </div>

        {/* Playback Controls (Evolve Impact) */}
        <div className="flex items-center gap-2 self-start lg:self-auto shrink-0 flex-wrap">
          {!isPlaying ? (
            <button
              id="timeline-slider-play-btn"
              onClick={handleStartPlay}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/30 cursor-pointer"
              title="Putar animasi evolusi dampak dari periode awal hingga tahun berjalan"
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Putar Evolusi Dampak</span>
            </button>
          ) : (
            <button
              id="timeline-slider-pause-btn"
              onClick={handlePausePlay}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/30 cursor-pointer animate-pulse"
              title="Jeda pemutaran animasi"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Jeda Animasi ({endPeriod.period})</span>
            </button>
          )}

          <button
            id="timeline-slider-reset-btn"
            onClick={handleReset}
            disabled={isFullRange && !isPlaying}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isFullRange && !isPlaying
                ? 'opacity-40 border-slate-700 text-slate-500 cursor-not-allowed'
                : theme === 'dark'
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
            title="Reset ke semua periode (2023 - 2026)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Semua</span>
          </button>

          {/* Speed Toggle */}
          <button
            id="timeline-slider-speed-toggle-btn"
            onClick={() => setPlaybackSpeed((prev) => (prev === 1500 ? 800 : 1500))}
            className="px-2.5 py-2 rounded-xl border border-slate-700/60 dark:border-slate-800 bg-slate-800/40 text-[11px] font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Ubah kecepatan animasi"
          >
            {playbackSpeed === 800 ? '⚡ 2x Cepat' : '1x Normal'}
          </button>
        </div>
      </div>

      {/* Quick Filter Presets Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Preset Cepat:</span>

        <button
          onClick={() => handlePresetSelect('ALL')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            isFullRange
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Semua (2023 - 2026)
        </button>

        <button
          onClick={() => handlePresetSelect('2026')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            startPeriod.year === 2026 && endPeriod.year === 2026 && startIndex === 12 && endIndex === maxIdx
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Tahun Ini (2026)
        </button>

        <button
          onClick={() => handlePresetSelect('3YEARS')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            startPeriod.year === 2024 && endIndex === maxIdx
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          3 Tahun Terakhir (2024 - 2026)
        </button>

        <button
          onClick={() => handlePresetSelect('2025')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            startPeriod.year === 2025 && endPeriod.year === 2025
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          2025
        </button>

        <button
          onClick={() => handlePresetSelect('2024')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            startPeriod.year === 2024 && endPeriod.year === 2024
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          2024
        </button>

        <button
          onClick={() => handlePresetSelect('2023')}
          className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer text-xs ${
            startPeriod.year === 2023 && endPeriod.year === 2023
              ? 'bg-teal-500 text-white shadow-xs'
              : theme === 'dark'
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          2023 (Awal Inisiasi)
        </button>
      </div>

      {/* Main Dual Slider Controls & Visual Track */}
      <div className="p-4 rounded-xl bg-slate-950/60 dark:bg-slate-950/90 border border-slate-800 space-y-4">
        {/* Selected Range Display Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Rentang Terpilih:</span>
            <span className="text-sm font-black text-teal-400 bg-teal-500/15 border border-teal-500/30 px-3 py-0.5 rounded-lg flex items-center gap-1.5">
              <span>{startPeriod.period}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span>{endPeriod.period}</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              ({endIndex - startIndex + 1} Periode Kuartal)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Tanggal:</span>
            <span className="font-mono text-slate-300 font-semibold text-[11px]">
              {startPeriod.startDate} s/d {endPeriod.endDate}
            </span>
          </div>
        </div>

        {/* Visual Year Milestones on Track */}
        <div className="relative pt-2 pb-1">
          {/* Active Range Highlight Track */}
          <div className="relative h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400 transition-all duration-200 rounded-full"
              style={{
                left: `${(startIndex / maxIdx) * 100}%`,
                width: `${((endIndex - startIndex) / maxIdx) * 100}%`,
              }}
            />
          </div>

          {/* Tick Markers */}
          <div className="relative flex justify-between items-center mt-2.5">
            {TIMELINE_PERIODS.map((period, idx) => {
              const isInRange = idx >= startIndex && idx <= endIndex;
              const isStart = idx === startIndex;
              const isEnd = idx === endIndex;
              const isYearBoundary = idx % 4 === 0;

              return (
                <button
                  key={period.id}
                  onClick={() => {
                    // Click selects end point or shifts range
                    if (idx < startIndex) {
                      setStartIndex(idx);
                    } else {
                      setEndIndex(idx);
                    }
                  }}
                  className={`group flex flex-col items-center cursor-pointer transition-all ${
                    idx % 2 !== 0 ? 'hidden md:flex' : 'flex'
                  }`}
                  title={`${period.period}: ${period.milestoneTitle}`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all border ${
                      isStart || isEnd
                        ? 'w-4 h-4 bg-teal-400 border-white shadow-md shadow-teal-500/50 scale-125'
                        : isInRange
                        ? 'bg-teal-500 border-teal-300'
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-500'
                    }`}
                  />
                  {isYearBoundary && (
                    <span
                      className={`text-[10px] font-black mt-1 transition-all ${
                        isInRange ? 'text-teal-300 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {period.year}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Dual Slider Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/80">
            {/* Start Period Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="timeline-start-slider" className="text-slate-400 font-bold flex items-center gap-1">
                  <span>Mulai Dari:</span>
                  <span className="text-teal-400 font-black">{startPeriod.period}</span>
                </label>
                <span className="text-[10px] text-slate-500">{startPeriod.startDate}</span>
              </div>
              <input
                id="timeline-start-slider"
                type="range"
                min={0}
                max={maxIdx}
                value={startIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= endIndex) {
                    setStartIndex(val);
                  } else {
                    setStartIndex(val);
                    setEndIndex(val);
                  }
                }}
                className="w-full accent-teal-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* End Period Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="timeline-end-slider" className="text-slate-400 font-bold flex items-center gap-1">
                  <span>Sampai Dengan:</span>
                  <span className="text-emerald-400 font-black">{endPeriod.period}</span>
                </label>
                <span className="text-[10px] text-slate-500">{endPeriod.endDate}</span>
              </div>
              <input
                id="timeline-end-slider"
                type="range"
                min={0}
                max={maxIdx}
                value={endIndex}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= startIndex) {
                    setEndIndex(val);
                  } else {
                    setStartIndex(val);
                    setEndIndex(val);
                  }
                }}
                className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Impact KPI Cards for Current Timeline Range */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Funds Disbursed in Timeline */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Total Dana Tersalurkan
            </span>
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono">
            {formatIDR(timelineMetrics.totalFunds)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Penyaluran 8 Asnaf Terverifikasi</span>
          </div>
        </div>

        {/* Total Beneficiaries Helped */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Mustahik Terbantu</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400 font-mono">
            {timelineMetrics.totalBeneficiaries.toLocaleString('id-ID')} Jiwa
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-amber-400" />
            <span>Fakir, Miskin & Fisabilillah</span>
          </div>
        </div>

        {/* Growth Rate Across Selected Window */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pertumbuhan Dampak</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-black text-cyan-400 font-mono flex items-center gap-1">
            <span>+{timelineMetrics.growthPercent}%</span>
            <span className="text-xs font-normal text-slate-400 font-sans">
              ({startPeriod.period} → {endPeriod.period})
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Eskalasi Penyaluran Berkelanjutan</span>
          </div>
        </div>

        {/* User-Funded Records in Window */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Realisasi Anda</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-black text-teal-400 font-mono">
            {formatShortIDR(timelineMetrics.userFundedTotal || timelineMetrics.totalFunds)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-teal-400" />
            <span>{timelineMetrics.matchingRecordsCount || 6} Kwitansi BSZ Legal Terbit</span>
          </div>
        </div>
      </div>

      {/* Active Milestone Highlight Card */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-amber-950/20 border-teal-500/30'
            : 'bg-gradient-to-r from-teal-50 via-white to-amber-50 border-teal-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-teal-500/20 border border-teal-500/30 shrink-0">
            {endPeriod.milestoneIcon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                Milestone Capaian: {endPeriod.milestoneTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-bold border border-teal-500/30">
                {endPeriod.period}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              {endPeriod.milestoneDesc}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block font-semibold">Status Sinkronisasi</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Grafik D3.js & Peta Tersinkron
          </span>
        </div>
      </div>
    </div>
  );
};
