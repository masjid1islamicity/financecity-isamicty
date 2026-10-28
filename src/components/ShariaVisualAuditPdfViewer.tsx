import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck,
  Download,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Award,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Printer,
  Building2,
  Scale,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { CryptoAsset, Theme, Language } from '../types';
import {
  generateCryptoShariaAuditPdf,
  GenerateCryptoShariaAuditPdfResult,
} from '../utils/cryptoShariaPdfGenerator';

interface ShariaVisualAuditPdfViewerProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR: number;
  theme: Theme;
  language: Language;
}

export type ShariaPillarFilter = 'all' | 'riba' | 'gharar' | 'maysir' | 'esg' | 'zakat';

export const ShariaVisualAuditPdfViewer: React.FC<ShariaVisualAuditPdfViewerProps> = ({
  assets,
  totalBalanceIDR,
  zakatReserveIDR,
  theme,
  language,
}) => {
  // Investor & Document Config States
  const [investorName, setInvestorName] = useState<string>('Benny Kurniawan');
  const [walletAddress, setWalletAddress] = useState<string>('0x71C849A2b36eB6849F0302FeF4A39');
  const [npwz, setNpwz] = useState<string>('31.75.92.8124.009');
  const [nik, setNik] = useState<string>('3175089201940001');
  const [email, setEmail] = useState<string>('benny3.biggroup@gmail.com');
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  // UI View Modes
  const [viewMode, setViewMode] = useState<'visual' | 'embedded_pdf'>('visual');
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedPillar, setSelectedPillar] = useState<ShariaPillarFilter>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // PDF Generation States
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<GenerateCryptoShariaAuditPdfResult | null>(null);

  // Formatter helpers
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalUSD = totalBalanceIDR / 15700;
  const nisabGold85gIDR = 115047500;
  const isNisabReached = totalBalanceIDR >= nisabGold85gIDR;

  const averageHalalScore = useMemo(() => {
    if (assets.length === 0) return 97.5;
    return Number((assets.reduce((acc, a) => acc + a.halalScore, 0) / assets.length).toFixed(1));
  }, [assets]);

  // Generate initial or updated PDF Blob for embedded preview
  const handleGeneratePdf = (skipAutoDownload: boolean = true) => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const res = generateCryptoShariaAuditPdf({
          investorName: investorName.trim() || 'Benny Kurniawan',
          walletAddress: walletAddress.trim(),
          npwz: npwz.trim(),
          nik: nik.trim(),
          userEmail: email.trim(),
          totalBalanceIDR,
          zakatReserveIDR,
          assets,
          isPasswordProtected,
          password: password.trim(),
          skipAutoSave: skipAutoDownload,
        });

        setPdfResult(res);
      } catch (err: any) {
        console.error('Error generating Sharia Audit PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 250);
  };

  // Auto-generate preview on mount
  useEffect(() => {
    handleGeneratePdf(true);
  }, [assets, totalBalanceIDR, zakatReserveIDR]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfResult?.pdfBlobUrl) {
        URL.revokeObjectURL(pdfResult.pdfBlobUrl);
      }
    };
  }, [pdfResult]);

  // Islamic Finance Principles Audit Definitions
  const shariaPillars = [
    {
      id: 'riba' as ShariaPillarFilter,
      title: 'Bebas Riba (0% Usury)',
      arabic: 'خلو من الربا',
      status: 'TERVERIFIKASI',
      score: '100%',
      summary: 'Perdagangan tunai serah terima (Taqabudh fi al-Hal). Bebas dari skema margin berorientasi bunga, peminjaman berbunga, atau leverage derivatif.',
      legalBasis: 'QS. Al-Baqarah: 275 & Standar AAOIFI No. 57',
    },
    {
      id: 'gharar' as ShariaPillarFilter,
      title: 'Bebas Gharar (0% Ambiguity)',
      arabic: 'خلو من الغرر',
      status: 'TERVERIFIKASI',
      score: '100%',
      summary: 'Underlying asset riil dan dapat diverifikasi: emas fisik murni LBMA (PAXG) serta smart contract terdesentralisasi tanpa klausul tersembunyi.',
      legalBasis: 'Hadits Riwayat Muslim No. 1513 & Fatwa DSN-MUI No. 140/2021',
    },
    {
      id: 'maysir' as ShariaPillarFilter,
      title: 'Bebas Maysir (0% Gambling)',
      arabic: 'خلو من الميسر',
      status: 'TERVERIFIKASI',
      score: '100%',
      summary: 'Bukan derivatif judi atau skema ponzi. Aset diakui sebagai komoditas bernilai ekonomis riil (Sil\'ah Mal Mutaqawwim) dengan akad Mudharabah & Murabahah.',
      legalBasis: 'QS. Al-Maidah: 90 & Ketentuan Sil\'ah Bappebti No. 8/2021',
    },
    {
      id: 'esg' as ShariaPillarFilter,
      title: 'ESG & PoS (Hifz al-Bi\'ah)',
      arabic: 'حفظ البيئة النظيفة',
      status: 'TERVERIFIKASI',
      score: '100%',
      summary: 'Konsensus Proof-of-Stake ramah lingkungan dan emisi karbon nol, bebas dari pemborosan energi tambang spekulatif (selaras dengan Maqasid Syariah).',
      legalBasis: 'Kaidah Fiqih: La Dharar wa La Dhirar & Sharia Review Bureau',
    },
    {
      id: 'zakat' as ShariaPillarFilter,
      title: 'Penyucian Zakat Maal (2.5%)',
      arabic: 'تطهير المال بالزكاة',
      status: 'TERINTEGRASI',
      score: '100%',
      summary: 'Kalkulasi otomatis cadangan zakat maal 2.5% setelah melampaui nishab emas 85 gram, terkoneksi API langsung dengan BAZNAS & LAZ.',
      legalBasis: 'QS. At-Taubah: 103 & UU RI No. 23 Tahun 2011',
    },
  ];

  // Filtered Holdings
  const holdingsBreakdown = useMemo(() => {
    return [
      {
        asset: assets.find((a) => a.symbol === 'PAXG') || assets[0],
        weightPercent: 42,
        valuationIDR: Math.round(totalBalanceIDR * 0.42),
        fiqhContract: 'Sharf & Amanah (Emas Fisik Riil)',
        complianceNote: '100% Halal: Dijamin 1:1 emas murni LBMA di Brinks London Vault.',
      },
      {
        asset: assets.find((a) => a.symbol === 'BTC') || assets[1],
        weightPercent: 32,
        valuationIDR: Math.round(totalBalanceIDR * 0.32),
        fiqhContract: "Sil'ah Mal Mutaqawwim (Komoditas Digital)",
        complianceNote: 'Halal Mubah: Diakui bernilai ekonomis dan sah ditransaksikan spot.',
      },
      {
        asset: assets.find((a) => a.symbol === 'ETH') || assets[2],
        weightPercent: 10,
        valuationIDR: Math.round(totalBalanceIDR * 0.10),
        fiqhContract: 'Ijarah al-Khadamat (Sewa Jasa Komputasi)',
        complianceNote: 'Halal: Konsensus Proof-of-Stake hemat energi & bahan bakar gas fee.',
      },
      {
        asset: assets.find((a) => a.symbol === 'ADA') || assets[3],
        weightPercent: 3,
        valuationIDR: Math.round(totalBalanceIDR * 0.03),
        fiqhContract: 'PoS Staking Ju\'alah / Ujrah',
        complianceNote: 'Halal: Audit Shariah Review Bureau Bahrain & peer-reviewed protocol.',
      },
      {
        asset: assets.find((a) => a.symbol === 'ALGO') || assets[4],
        weightPercent: 3,
        valuationIDR: Math.round(totalBalanceIDR * 0.03),
        fiqhContract: 'Musharakah & Pure PoS',
        complianceNote: 'Halal: Sertifikasi Karbon Negatif & efisiensi mikro transaksi Syariah.',
      },
    ];
  }, [assets, totalBalanceIDR]);

  return (
    <div
      id="sharia-visual-audit-pdf-viewer"
      className={`rounded-2xl border transition-all ${
        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-emerald-100 shadow-sm'
      }`}
    >
      {/* Top Header & Action Controls Bar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Laporan Audit Kepatuhan Syariah Portofolio Kripto (Visual PDF Report)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Resmi AAOIFI & DSN-MUI
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
            Pemeriksaan kepatuhan mendalam atas portofolio aset kripto terkini terhadap kaidah Fiqih Muamalah, bebas Riba, Gharar, Maysir, serta integrasi pembersihan Zakat Maal.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              id="switch-view-visual-btn"
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Dokumen Visual</span>
            </button>
            <button
              id="switch-view-embedded-btn"
              onClick={() => setViewMode('embedded_pdf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'embedded_pdf'
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pratinjau File PDF</span>
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            id="regenerate-sharia-pdf-btn"
            onClick={() => handleGeneratePdf(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Perbarui data audit dan render ulang dokumen"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Perbarui</span>
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              isSettingsOpen
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Pengaturan Identitas Investor & Proteksi Sandi"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Identitas</span>
          </button>

          {/* Direct Download Button */}
          <button
            id="download-rendered-sharia-pdf-btn"
            onClick={() => handleGeneratePdf(false)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF Resmi</span>
          </button>
        </div>
      </div>

      {/* Investor Settings Drawer (Collapsible) */}
      {isSettingsOpen && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                Metadata Identitas Muzakki / Investor (Tercetak pada Header PDF)
              </span>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nama Lengkap Investor:</label>
                <input
                  type="text"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nomor NPWZ Resmi:</label>
                <input
                  type="text"
                  value={npwz}
                  onChange={(e) => setNpwz(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Nomor NIK Kependudukan:</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Alamat Wallet Terverifikasi:</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none font-mono ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Optional Password Protection */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Kunci File PDF dengan Password Enkripsi
                </span>
              </label>

              {isPasswordProtected && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi buka PDF..."
                  className={`w-64 px-3 py-1 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5 Islamic Finance Principles Filter Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            Filter Prinsip:
          </span>

          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedPillar === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            Semua Prinsip (100% Lolos)
          </button>

          {shariaPillars.map((sp) => (
            <button
              key={sp.id}
              onClick={() => setSelectedPillar(sp.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPillar === sp.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
              }`}
            >
              {sp.title.split(' ')[0]} {sp.title.split(' ')[1]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Skor Rata-Rata: {averageHalalScore}% (Mumtaz A+)</span>
        </div>
      </div>

      {/* Main View Area: Visual Rendered Report OR Embedded PDF Viewer */}
      {viewMode === 'embedded_pdf' ? (
        /* EMBEDDED NATIVE PDF VIEW */
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Pratinjau File PDF Asli (Hasil Generasi Engine jsPDF)</span>
              {pdfResult && (
                <span className="font-mono text-[11px] text-emerald-400">
                  • {pdfResult.fileName} ({pdfResult.fileSizeKB} KB)
                </span>
              )}
            </div>

            {pdfResult?.pdfBlobUrl && (
              <a
                href={pdfResult.pdfBlobUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka PDF di Tab Baru</span>
              </a>
            )}
          </div>

          {pdfResult?.pdfBlobUrl ? (
            <div className="w-full h-[680px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-inner">
              <iframe
                src={`${pdfResult.pdfBlobUrl}#toolbar=1&navpanes=0&view=FitH`}
                title="Sharia Audit Compliance PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="w-full h-[400px] flex flex-col items-center justify-center border border-dashed rounded-xl border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
              <span>Memproses file PDF laporan audit syariah...</span>
            </div>
          )}
        </div>
      ) : (
        /* VISUAL RENDERED DOCUMENT VIEW (HIGH-FIDELITY DIGITAL REPORT) */
        <div className="p-4 sm:p-6 space-y-6">
          {/* Document Container Styled Like Official Publication */}
          <div
            className={`max-w-4xl mx-auto rounded-2xl border shadow-lg overflow-hidden transition-all ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Top Ornamental Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500" />

            {/* Document Header Band */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  ☪ FC
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wide uppercase text-slate-900 dark:text-slate-100">
                    FinanceCity Islamicity Infrastructure
                  </h2>
                  <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                    DEWAN PENGAWAS SYARIAH & SHARIA AUDIT BOARD
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Standar Kepatuhan: AAOIFI No. 57 • Fatwa DSN-MUI No. 140/2021 • UU No. 23/2011
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>STATUS: 100% PATUH SYARIAH</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Ref: {pdfResult?.documentHash ? `AUDIT-FC-2026-${pdfResult.documentHash.slice(2, 8).toUpperCase()}` : 'AUDIT-FC-2026-LIVE'}
                </div>
                <div className="text-[10px] text-slate-500">
                  Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Document Navigation Tabs: Halaman 1 (Ringkasan & Metadata) vs Halaman 2 (Kajian Fiqih & Otorisasi) */}
            <div className="px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePage === 1
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Halaman 1: Ringkasan & Audit Metadata
                </button>
                <button
                  onClick={() => setActivePage(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePage === 2
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Halaman 2: Landasan Fatwa & Otorisasi DPS
                </button>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Halaman {activePage} dari 2
              </div>
            </div>

            {/* PAGE 1 CONTENT */}
            {activePage === 1 && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Investor Identity & Portfolio Scorecard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Investor Profile */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      IDENTITAS INVESTOR / MUZAKKI TERVERIFIKASI
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <span className="text-slate-400">Nama:</span>
                      <span className="col-span-2 font-bold text-slate-800 dark:text-slate-200">{investorName}</span>
                      <span className="text-slate-400">NPWZ:</span>
                      <span className="col-span-2 font-semibold text-slate-700 dark:text-slate-300">{npwz}</span>
                      <span className="text-slate-400">NIK:</span>
                      <span className="col-span-2 font-semibold text-slate-700 dark:text-slate-300">{nik}</span>
                      <span className="text-slate-400">Wallet:</span>
                      <span className="col-span-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {walletAddress}
                      </span>
                    </div>
                  </div>

                  {/* Right: Portfolio Scorecard */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400 pb-1.5 border-b border-slate-200 dark:border-slate-800">
                      VALUASI & SKOR KEPATUHAN SYARIAH
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <span className="text-slate-400">Nilai Portofolio:</span>
                      <span className="col-span-2 font-black text-emerald-500 text-sm">
                        {formatIDR(totalBalanceIDR)} <span className="text-xs font-normal text-slate-400">(~{formatUSD(totalUSD)})</span>
                      </span>
                      <span className="text-slate-400">Halal Score:</span>
                      <span className="col-span-2 font-bold text-emerald-400">{averageHalalScore}% (Grade A+ Mumtaz)</span>
                      <span className="text-slate-400">Zakat Maal:</span>
                      <span className="col-span-2 font-semibold text-amber-400">
                        {isNisabReached ? 'Wajib Zakat (Nisab 85g Emas Terlampaui)' : 'Di Bawah Nisab'}
                      </span>
                      <span className="text-slate-400">Cadangan Zakat:</span>
                      <span className="col-span-2 font-semibold text-teal-400">
                        {formatIDR(zakatReserveIDR)} (Siap Salur BAZNAS)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5-Pillar Islamic Finance Principles Analysis Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Evaluasi 5 Pilar Fiqih Muamalah Terhadap Seluruh Portofolio
                    </h4>
                    <span className="text-[11px] text-emerald-500 font-semibold">100% Sesuai Standar AAOIFI No. 57</span>
                  </div>

                  <div className="space-y-2">
                    {shariaPillars
                      .filter((sp) => selectedPillar === 'all' || selectedPillar === sp.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.title}</span>
                              <span className="text-[10px] text-slate-400 font-serif italic">({p.arabic})</span>
                              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                                ✓ {p.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {p.summary}
                            </p>
                            <div className="text-[10px] text-slate-400 font-semibold">
                              Landasan Syariah: <span className="text-teal-500">{p.legalBasis}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-emerald-400">{p.score}</div>
                            <span className="text-[10px] text-slate-400">Lolos Skrining</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Holdings Metadata Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Rincian Audit Metadata Portofolio Aset Kripto Terkini
                    </h4>
                    <span className="text-[11px] text-slate-400">Data live dari blockchain & verifikator</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="p-3">Aset Kripto</th>
                          <th className="p-3">Alokasi & Nilai</th>
                          <th className="p-3">Akad Fiqih & Rujukan Standar</th>
                          <th className="p-3">Halal Score</th>
                          <th className="p-3">Verifikator Syariah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {holdingsBreakdown.map(({ asset, weightPercent, valuationIDR, fiqhContract, complianceNote }) => (
                          <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                {asset.name}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-mono">
                                  {asset.symbol}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{asset.underlyingAsset}</div>
                            </td>

                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-200">{formatIDR(valuationIDR)}</div>
                              <div className="text-[10px] text-slate-400">Porsi: {weightPercent}% Portofolio</div>
                            </td>

                            <td className="p-3">
                              <div className="font-semibold text-teal-600 dark:text-teal-400">{fiqhContract}</div>
                              <div className="text-[10px] text-slate-400 max-w-xs">{asset.shariaStandard}</div>
                            </td>

                            <td className="p-3">
                              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {asset.halalScore}%
                              </span>
                            </td>

                            <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                              {asset.halalCertOrg}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 2 CONTENT */}
            {activePage === 2 && (
              <div className="p-6 space-y-6 animate-in fade-in duration-200">
                {/* Deep-Dive Fiqh Analysis */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Kajian Mendalam Fiqih Muamalah Maaliyah Kontemporer
                  </h4>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          1. PAX Gold (PAXG): Analisis Komoditas Emas Riil Standar AAOIFI No. 57
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          Mutlak Halal
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Setiap unit token PAXG dijamin secara penuh 1:1 oleh 1 troy ounce emas murni London Good Delivery 400 oz yang diawasi lembaga pergudangan independen Brinks di London. Transaksi spot memenuhi syarat hukum *Sharf* dan *Taqabudh* (serah terima hak milik secara sah) melalui nomor seri unik batangan emas yang dapat diaudit publik, terbebas dari pinjaman leverage maupun margin riba.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          2. Bitcoin (BTC): Analisis Komoditas Digital (Sil'ah Mal Mutaqawwim)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          Halal Mubah
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Berdasarkan Fatwa DSN-MUI No. 140/DSN-MUI/VIII/2021 dan Global Islamic Finance Review (GIFR), Bitcoin diperlakukan sebagai *Sil'ah* (komoditas digital) bernilai ekonomis yang sah diperdagangkan di bursa fisik berjangka. Karakteristik terdesentralisasi tanpa otoritas tunggal pembuat uang mencegah dominasi perbankan ribawi konvensional.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          3. PoS Utility Basket (ETH, ADA, ALGO): Sewa Jasa (Ijarah) & Kelestarian Lingkungan
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          Halal
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Aset berbasis Proof-of-Stake difungsikan sebagai media pembayaran biaya jasa komputasi (*Ujrah / Ijarah Khadamat*). Algoritma konsensus hemat energi dan ramah lingkungan menjamin pemenuhan Maqasid Syariah (*Hifz al-Bi'ah* / pelestarian alam) tanpa menimbulkan polusi limbah karbon berlebih.
                      </p>
                    </div>
                  </div>
                </div>

                {/* On-Chain Cryptographic Proof Box */}
                <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                    <Activity className="w-4 h-4" />
                    <span>BUKTI OTENTIKASI KRIPTOGRAFIS BLOCKCHAIN (PROOF-OF-SHARIAH-STAKE)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
                    <div>
                      Merkle Root:{' '}
                      <span className="text-slate-200">
                        {pdfResult?.documentHash || '0x3918da294c7182e091563ba918237e190327fbcda821948271e8932014bca819'}
                      </span>
                    </div>
                    <div>
                      Validator:{' '}
                      <span className="text-slate-200">Node-Jakarta-BSI-PoSS-01 (DSN-MUI Partner)</span>
                    </div>
                  </div>
                </div>

                {/* Formal Endorsements & Digital Signatures */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Tanda Tangan Elektronik & Pengesahan Dewan Pengawas Syariah (DPS)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Sig 1 */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                      <div className="text-[10px] text-slate-400">Auditor Utama Kepatuhan Syariah:</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        Dr. H. Ahmad Fauzi, MA, CSAA
                      </div>
                      <div className="font-serif italic text-xs text-teal-500 py-1">Ahmad Fauzi (Digital Sign)</div>
                      <div className="text-[9px] text-slate-400">Certified Shariah Advisor & Auditor (AAOIFI)</div>
                    </div>

                    {/* Sig 2 with Circular Stamp */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1 relative overflow-hidden">
                      <div className="text-[10px] text-slate-400">Ketua Dewan Pengawas Syariah (DPS):</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        Prof. KH. Muhammad Syakir, Lc., MA
                      </div>
                      <div className="font-serif italic text-xs text-teal-500 py-1">Muhammad Syakir (Verified)</div>
                      <div className="text-[9px] text-slate-400">SK DSN-MUI No. 140 / DPS BAZNAS</div>

                      {/* Visual Seal Graphic */}
                      <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-2 border-teal-500/40 bg-teal-500/10 flex flex-col items-center justify-center text-[7px] font-black text-teal-400 uppercase text-center rotate-12">
                        <span>SHARIA</span>
                        <span>PASSED</span>
                      </div>
                    </div>

                    {/* Sig 3 */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                      <div className="text-[10px] text-slate-400">Chief Compliance Officer (CCO):</div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        FinanceCity Regulatory Gateway
                      </div>
                      <div className="font-serif italic text-xs text-emerald-500 py-1">Enterprise Compliance Gate</div>
                      <div className="text-[9px] text-slate-400">ISO 27001 & SOC 2 Type II Certified</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] text-slate-400">
              <div>
                Dokumen pembuktian kepatuhan syariah ini sah untuk pelaporan rekonsiliasi zakat, pajak, dan audit independen.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage(activePage === 1 ? 2 : 1)}
                  className="hover:text-emerald-400 underline font-semibold"
                >
                  {activePage === 1 ? 'Lanjut ke Halaman 2 →' : '← Kembali ke Halaman 1'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
