import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Edit3,
  Target,
  Coins,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  HeartHandshake,
  Download,
  Info,
  Calculator,
  Globe,
  FileDown,
  Camera,
  Share2,
  Award,
  BookOpen,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatProgramDistributionData } from '../types';
import { initialZakatProgramDistributions } from '../data/initialState';
import { ZakatD3ProgramDistribution } from './ZakatD3ProgramDistribution';
import { ZakatImpactReport } from './ZakatImpactReport';
import { generateDisbursementHistoryPdf } from '../utils/zakatPdfGenerator';

interface ZakatSummaryProps {
  totalPaidIDR: number;
  remainingReserveIDR: number;
  annualTargetIDR: number;
  onUpdateAnnualTarget: (newTarget: number) => void;
  disbursedRecords?: ZakatSummaryRecord[];
  programDistributions?: ZakatProgramDistributionData[];
  onOpenDisburse?: () => void;
  onOpenReport?: () => void;
  onOpenEstimator?: () => void;
  onOpenCalculator?: () => void;
  theme: Theme;
  language: Language;
}

export const ZakatSummary: React.FC<ZakatSummaryProps> = ({
  totalPaidIDR,
  remainingReserveIDR,
  annualTargetIDR,
  onUpdateAnnualTarget,
  disbursedRecords = [],
  programDistributions,
  onOpenDisburse,
  onOpenReport,
  onOpenEstimator,
  onOpenCalculator,
  theme,
  language,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [tempTarget, setTempTarget] = useState<number>(annualTargetIDR);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const handleExportHistoryPdf = () => {
    setIsExportingPdf(true);
    try {
      const result = generateDisbursementHistoryPdf({
        userName: 'Benny Kurniawan',
        npwz: '31.75.92.8124.009',
        nik: '3175089201940001',
        totalPaidIDR,
        remainingReserveIDR,
        annualTargetIDR,
        records: disbursedRecords,
      });

      setExportSuccessMessage(
        `File "${result.fileName}" berhasil diunduh (${result.fileSizeKB} KB)! Dokumen sah dengan Hash: ${result.documentHash.slice(0, 14)}...`
      );

      // Auto-clear message after 7 seconds
      setTimeout(() => {
        setExportSuccessMessage(null);
      }, 7000);
    } catch (err: any) {
      console.error('Error generating Zakat disbursement history PDF:', err);
      alert('Terjadi kesalahan saat memproses ekspor PDF riwayat Zakat. Silakan coba kembali.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Progress calculations
  const progressPercent = Math.min(100, Math.round((totalPaidIDR / (annualTargetIDR || 1)) * 100));
  const potentialProgressPercent = Math.min(
    100,
    Math.round(((totalPaidIDR + remainingReserveIDR) / (annualTargetIDR || 1)) * 100)
  );
  const remainingDeficit = Math.max(0, annualTargetIDR - totalPaidIDR);
  const deficitAfterReserve = Math.max(0, annualTargetIDR - (totalPaidIDR + remainingReserveIDR));

  const handleSaveTarget = () => {
    if (tempTarget > 0) {
      onUpdateAnnualTarget(tempTarget);
      setIsEditingTarget(false);
    }
  };

  const handleCancelTarget = () => {
    setTempTarget(annualTargetIDR);
    setIsEditingTarget(false);
  };

  // Preset chips for annual target
  const targetPresets = [
    { label: '10 Jt', val: 10000000 },
    { label: '15 Jt', val: 15000000 },
    { label: '20 Jt', val: 20000000 },
    { label: '25 Jt', val: 25000000 },
    { label: '50 Jt', val: 50000000 },
  ];

  return (
    <div
      id="zakat-summary-container"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-teal-500/30 shadow-xl shadow-teal-950/20 text-slate-100'
          : 'bg-white border-teal-200/90 shadow-md text-slate-900'
      }`}
    >
      {/* Top Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Ringkasan Zakat Maal (Zakat Summary)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  Siklus Haul 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Agregasi total zakat tersalurkan, saldo cadangan escrow brankas, dan progres pemenuhan target tahunan.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              id="zakat-summary-scroll-d3-btn"
              onClick={() => {
                const el = document.getElementById('zakat-d3-distribution-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all shadow-xs"
              title="Lihat Visualisasi D3.js Distribusi Program Sosial"
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Grafik D3.js</span>
            </button>

            {/* Jump to Impact Report Section */}
            <button
              id="zakat-summary-scroll-impact-btn"
              onClick={() => {
                const el = document.getElementById('zakat-impact-report-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all shadow-xs"
              title="Lihat Laporan Dampak Sosial & Kisah Nyata Mustahik"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Laporan Dampak</span>
            </button>

            {/* Quick Link: AI-Driven Zakat Insights Section */}
            <button
              id="zakat-summary-scroll-ai-insights-btn"
              onClick={() => {
                const el = document.getElementById('zakat-ai-impact-insights-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-all shadow-xs"
              title="Wawasan Cerdas Zakat AI (Gemini 3.8 Flash) - Rekomendasi Optimalisasi Penyaluran"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Wawasan AI</span>
            </button>

            {/* Quick Link: Annual Impact Goal Section */}
            <button
              id="zakat-summary-scroll-impact-goal-btn"
              onClick={() => {
                const el = document.getElementById('zakat-annual-impact-goal-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all shadow-xs"
              title="Pantau & Tetapkan Target Dampak Sosial Zakat Tahunan (Annual Impact Goal)"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Dampak</span>
            </button>

            {/* Quick Link: Geographical Distribution Map Section */}
            <button
              id="zakat-summary-scroll-geomap-btn"
              onClick={() => {
                const el = document.getElementById('zakat-geographical-distribution-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold transition-all shadow-xs"
              title="Lihat Peta Persebaran Dampak Zakat Nusantara"
            >
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>Peta Wilayah</span>
            </button>

            {/* Quick Link: Interactive Photo Gallery Section */}
            <button
              id="zakat-summary-scroll-gallery-btn"
              onClick={() => {
                const el = document.getElementById('zakat-project-photo-gallery-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition-all shadow-xs"
              title="Lihat Galeri Foto Lapangan Situs Proyek Zakat"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Galeri Foto</span>
            </button>

            {/* Quick Link: Annual Impact PDF Report Section */}
            <button
              id="zakat-summary-scroll-annual-pdf-btn"
              onClick={() => {
                const el = document.getElementById('annual-zakat-impact-pdf-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold transition-all shadow-xs"
              title="Unduh Dokumen PDF Resmi Laporan Kontribusi & Dampak Sosial Tahunan"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-300" />
              <span>PDF Tahunan</span>
            </button>

            {/* Quick Link: Badges & Achievements */}
            <button
              id="zakat-summary-scroll-badges-btn"
              onClick={() => {
                const el = document.getElementById('zakat-badges-achievements-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  const section = document.getElementById('zakat-impact-report-section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Lihat Lencana & Prestasi Digital atas Capaian Penyaluran Zakat"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Lencana</span>
            </button>

            {/* Quick Link: Community Impact Comparison */}
            <button
              id="zakat-summary-scroll-community-btn"
              onClick={() => {
                const el = document.getElementById('zakat-community-impact-comparison-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  const section = document.getElementById('zakat-impact-report-section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Lihat Komparasi Dampak Personal vs. Rata-Rata Komunitas & SDG Global"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>vs. Komunitas</span>
            </button>

            {/* Quick Link: Educational Zakat Resources */}
            <button
              id="zakat-summary-scroll-education-btn"
              onClick={() => {
                const el = document.getElementById('zakat-educational-resources-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  const section = document.getElementById('zakat-impact-report-section');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Pusat Edukasi Zakat, Standar Nisab & Etika Keuangan Syariah dengan Search Grounding"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edukasi Syariah</span>
            </button>

            {/* Quick Link: Share to Social Media */}
            <button
              id="zakat-summary-scroll-share-btn"
              onClick={() => {
                const shareBtn = document.getElementById('share-social-media-milestone-header-btn');
                if (shareBtn) {
                  shareBtn.click();
                } else {
                  const el = document.getElementById('zakat-impact-report-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold transition-all shadow-xs"
              title="Bagikan Capaian Zakat & Milestone Sosial ke Media Sosial"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Bagikan Medsos</span>
            </button>

            {/* Export Zakat Disbursement History PDF Button */}
            <button
              id="zakat-summary-export-pdf-btn"
              onClick={handleExportHistoryPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
              title="Ekspor Ringkasan Riwayat Penyaluran Zakat ke format PDF Resmi (BSZ)"
            >
              <Download className="w-3.5 h-3.5 text-rose-400" />
              <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Ekspor Riwayat PDF'}</span>
            </button>

            {onOpenReport && (
              <button
                id="zakat-summary-open-report-btn"
                onClick={onOpenReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shadow-xs"
                title="Lihat Laporan Bulanan & Unduh Bukti Potong Pajak (BSZ)"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400" />
                <span>Laporan BSZ</span>
              </button>
            )}

            {onOpenCalculator && (
              <button
                id="zakat-summary-open-calculator-btn"
                onClick={onOpenCalculator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-all shadow-xs"
                title="Hitung kewajiban zakat maal interaktif dari kepemilikan emas, kas, dan investasi"
              >
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                <span>Kalkulator Zakat</span>
              </button>
            )}

            {onOpenEstimator && (
              <button
                id="zakat-summary-open-estimator-btn"
                onClick={onOpenEstimator}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all shadow-xs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Zakat Estimasi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Export Success Notification Banner */}
        {exportSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 font-bold text-xs shrink-0"
            >
              Tutup
            </button>
          </div>
        )}
        {/* Metric Cards Grid: Aggregates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Zakat Paid */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950/70 border-emerald-500/30 shadow-inner'
                : 'bg-emerald-50/70 border-emerald-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Total Zakat Tersalurkan (Paid)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                Resmi BAZNAS
              </span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-emerald-400">
              {formatIDR(totalPaidIDR)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{disbursedRecords.length} Penyaluran Terverifikasi</span>
              {disbursedRecords.length > 0 && (
                <button
                  id="toggle-zakat-history-btn"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>{showHistory ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                  {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Remaining Reserve in Vault */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950/70 border-teal-500/30 shadow-inner'
                : 'bg-teal-50/70 border-teal-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Sisa Cadangan di Brankas (Reserve)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-400">
                Siap Salur
              </span>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-teal-400">
              {formatIDR(remainingReserveIDR)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Terisolasi dari modal trading</span>
              {onOpenDisburse && remainingReserveIDR > 0 && (
                <button
                  id="summary-salurkan-btn"
                  onClick={onOpenDisburse}
                  className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 underline decoration-teal-400/50"
                >
                  <span>Salurkan Sekarang</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Annual Target */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-950/70 border-amber-500/30 shadow-inner'
                : 'bg-amber-50/70 border-amber-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                Target Zakat Tahunan (Annual Goal)
              </span>
              <button
                id="edit-annual-target-toggle-btn"
                onClick={() => {
                  setTempTarget(annualTargetIDR);
                  setIsEditingTarget(!isEditingTarget);
                }}
                className="text-amber-400 hover:text-amber-300 font-bold text-[11px] flex items-center gap-1"
                title="Sesuaikan nominal target tahunan Anda"
              >
                <Edit3 className="w-3 h-3" />
                <span>{isEditingTarget ? 'Batal' : 'Ubah Target'}</span>
              </button>
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-amber-400">
              {formatIDR(annualTargetIDR)}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                {remainingDeficit > 0
                  ? `Kurang ${formatIDR(remainingDeficit)} lagi`
                  : '✓ Target Tahunan Tercapai!'}
              </span>
              <span className="font-semibold text-slate-400">
                1 Haul Penuh
              </span>
            </div>
          </div>
        </div>

        {/* Inline Target Editor when user clicks 'Ubah Target' */}
        {isEditingTarget && (
          <div
            className={`p-4 rounded-xl border animate-fadeIn space-y-3 ${
              theme === 'dark' ? 'bg-slate-950 border-amber-500/30' : 'bg-amber-50/50 border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-500" />
                Pengaturan Target Zakat Tahunan Baru
              </label>
              <span className="text-xs font-black text-amber-400 font-mono">
                {formatIDR(tempTarget)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                id="annual-target-input"
                type="number"
                step={1000000}
                min={1000000}
                max={500000000}
                value={tempTarget}
                onChange={(e) => setTempTarget(Math.max(1000000, Number(e.target.value)))}
                className={`flex-1 min-w-[200px] px-3 py-2 text-sm rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                {targetPresets.map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setTempTarget(preset.val)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      tempTarget === preset.val
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleCancelTarget}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  id="save-annual-target-btn"
                  type="button"
                  onClick={handleSaveTarget}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs transition-all flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Target</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              *Target zakat tahunan memudahkan Anda memantau pemenuhan kewajiban zakat perniagaan dan investasi syariah sebelum jatuh tempo haul.
            </p>
          </div>
        )}

        {/* Section: Annual Progress Bar & Milestone Visualizer */}
        <div
          className={`p-5 rounded-xl border space-y-4 ${
            theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50/80 border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  Progres Pemenuhan Target Zakat Tahunan
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  {progressPercent}% Tercapai
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {progressPercent >= 100
                  ? '🎉 Barakallah! Target zakat tahunan Anda telah terpenuhi 100%.'
                  : `Telah tersalurkan ${formatIDR(totalPaidIDR)} dari target ${formatIDR(annualTargetIDR)}.`}
              </p>
            </div>

            {/* Status Breakdown Chips */}
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Tersalurkan ({progressPercent}%)
              </span>
              <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-500/40" />
                Cadangan Escrow (+{Math.max(0, potentialProgressPercent - progressPercent)}%)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                Sisa Target
              </span>
            </div>
          </div>

          {/* High-Precision Progress Bar with Milestone Markers */}
          <div className="space-y-1.5">
            <div className="relative w-full h-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
              {/* Layer 1: Potential with Reserve (striped teal) */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-teal-500/30 rounded-full transition-all duration-500"
                style={{ width: `${potentialProgressPercent}%` }}
                title={`Potensi total jika cadangan disalurkan: ${potentialProgressPercent}% (${formatIDR(totalPaidIDR + remainingReserveIDR)})`}
              />

              {/* Layer 2: Actual Disbursed (vibrant emerald-to-teal gradient) */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
                title={`Tersalurkan: ${progressPercent}% (${formatIDR(totalPaidIDR)})`}
              />

              {/* Milestone Marker Lines (25%, 50%, 75%) */}
              <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-slate-400/40 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-slate-400/40 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-slate-400/40 pointer-events-none" />
            </div>

            {/* Milestone Labels */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-0.5">
              <span>0% (Awal Haul)</span>
              <span className="text-center">25% (Q1)</span>
              <span className="text-center font-bold text-teal-400">50% (Ramadan)</span>
              <span className="text-center">75% (Q3)</span>
              <span className="text-right font-bold text-amber-400">100% (Haul 1 Th)</span>
            </div>
          </div>

          {/* Quick Impact Highlight */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Jika sisa cadangan sebesar <strong>{formatIDR(remainingReserveIDR)}</strong> disalurkan sekarang, progres target tahunan Anda akan langsung melonjak ke <strong>{potentialProgressPercent}%</strong>.
              </span>
            </div>

            {onOpenDisburse && remainingReserveIDR > 0 && (
              <button
                id="summary-quick-disburse-all-btn"
                onClick={onOpenDisburse}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shrink-0 transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-auto"
              >
                <span>Salurkan Cadangan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* D3.js Social Program Distribution Visualization Over Time */}
        <ZakatD3ProgramDistribution
          data={programDistributions || initialZakatProgramDistributions}
          disbursedRecords={disbursedRecords}
          theme={theme}
          language={language}
        />

        {/* Impact Report: Beneficiary Stories & Transparent Social Impact View with D3 Cumulative Distribution */}
        <ZakatImpactReport
          disbursedRecords={disbursedRecords}
          programDistributions={programDistributions || initialZakatProgramDistributions}
          annualTargetIDR={annualTargetIDR}
          remainingReserveIDR={remainingReserveIDR}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
          onOpenReport={onOpenReport}
        />

        {/* Collapsible Verified Disbursement History */}
        {showHistory && disbursedRecords.length > 0 && (
          <div
            className={`p-4 rounded-xl border animate-fadeIn space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  Daftar Penyaluran Zakat Terverifikasi ({disbursedRecords.length} Transaksi)
                </h5>
                <span className="text-[10px] text-slate-400">
                  Bukti Setor Zakat (BSZ) Resmi & Pengurang Pajak (UU No. 23/2011)
                </span>
              </div>

              <button
                id="export-disbursement-history-table-btn"
                onClick={handleExportHistoryPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
                title="Unduh seluruh daftar riwayat penyaluran zakat ke dalam file PDF ringkasan resmi"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Menyiapkan PDF...' : 'Ekspor PDF Riwayat'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {disbursedRecords.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {item.institutionName}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                        Tervalidasi BAZNAS
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>Program: {item.programTarget}</span>
                      <span>•</span>
                      <span>No BSZ: {item.receiptNumber}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="font-black text-emerald-400 font-mono text-sm block">
                      {formatIDR(item.amountIDR)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Tx: {item.txHash ? item.txHash.slice(0, 10) + '...' : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-teal-400/90 flex items-center gap-1.5 pt-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                Setiap pembayaran zakat menghasilkan Nomor BSZ yang sah untuk dilaporkan pada Lampiran SPT Tahunan PPh Orang Pribadi / Badan (UU RI No. 23/2011).
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
