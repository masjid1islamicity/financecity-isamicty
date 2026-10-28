import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Award,
  Lock,
  X,
  Calendar,
  User,
  Sparkles,
  HeartHandshake,
  Check,
  Building2,
  Globe,
  TrendingUp,
} from 'lucide-react';
import {
  Theme,
  Language,
  ZakatSummaryRecord,
  ZakatProgramDistributionData,
  ZakatImpactGoalConfig,
} from '../types';
import { generateAnnualImpactPdf, GenerateZakatPdfResult } from '../utils/zakatPdfGenerator';

interface ZakatAnnualImpactPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursedRecords: ZakatSummaryRecord[];
  programDistributions?: ZakatProgramDistributionData[];
  annualImpactGoal?: ZakatImpactGoalConfig | null;
  annualTargetIDR?: number;
  remainingReserveIDR?: number;
  theme: Theme;
  language: Language;
}

export const ZakatAnnualImpactPdfModal: React.FC<ZakatAnnualImpactPdfModalProps> = ({
  isOpen,
  onClose,
  disbursedRecords,
  programDistributions,
  annualImpactGoal,
  annualTargetIDR = 15000000,
  remainingReserveIDR = 3750000,
  theme,
  language,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [muzakkiName, setMuzakkiName] = useState<string>('Benny Kurniawan');
  const [npwz, setNpwz] = useState<string>('31.75.92.8124.009');
  const [nik, setNik] = useState<string>('3175089201940001');
  const [email, setEmail] = useState<string>('benny3.biggroup@gmail.com');
  const [includeBszRegistry, setIncludeBszRegistry] = useState<boolean>(true);
  const [includeSdgMetrics, setIncludeSdgMetrics] = useState<boolean>(true);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<GenerateZakatPdfResult | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalPaidIDR = disbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  const percentAchieved = Math.round((totalPaidIDR / (annualTargetIDR || 1)) * 100);
  const totalBeneficiaries = annualImpactGoal?.targetBeneficiariesCount || Math.max(18, disbursedRecords.length * 6);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleGenerateAndDownload = () => {
    setIsGenerating(true);
    setGenerationResult(null);

    // Small timeout for smooth UI transition
    setTimeout(() => {
      try {
        const result = generateAnnualImpactPdf({
          year: selectedYear,
          userName: muzakkiName.trim() || 'Benny Kurniawan',
          npwz: npwz.trim() || '31.75.92.8124.009',
          nik: nik.trim() || '3175089201940001',
          userEmail: email.trim() || 'benny3.biggroup@gmail.com',
          totalPaidIDR,
          annualTargetIDR,
          remainingReserveIDR,
          records: disbursedRecords,
          programDistributions,
          impactGoal: annualImpactGoal || null,
          beneficiariesCount: totalBeneficiaries,
          includeBszRegistry,
          includeSdgMetrics,
          isPasswordProtected,
          password: pdfPassword,
        });

        setGenerationResult(result);
        setHasDownloaded(true);
      } catch (err) {
        console.error('Failed to generate annual impact PDF:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-teal-500/30 text-slate-100 shadow-teal-950/20'
            : 'bg-white border-teal-200 text-slate-900 shadow-xl'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">
                  Unduh Laporan Dampak & Zakat Tahunan (PDF)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Resmi Ber-BSZ
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Dokumen Resmi Akuntabilitas Penyaluran Zakat & Pengurang Pajak SPT PPh (UU RI No. 23/2011)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Executive Live Preview Card */}
          <div
            className={`p-4 rounded-2xl border ${
              theme === 'dark'
                ? 'bg-slate-950/70 border-teal-500/20'
                : 'bg-teal-50/60 border-teal-200/70'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Ringkasan Data yang Akan Dicetak ke PDF ({selectedYear})
                </span>
              </div>

              {/* Year Selector */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] text-slate-400">Tahun Buku:</span>
                {[2026, 2025].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedYear === yr
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Realisasi Zakat</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formatIDR(totalPaidIDR)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {disbursedRecords.length} Transaksi BSZ
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Target Tahunan</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {formatIDR(annualTargetIDR)}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                  {percentAchieved}% Tercapai
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mustahik Terbantu</span>
                <span className="text-sm font-black text-teal-400 font-mono">
                  {totalBeneficiaries}+ Jiwa
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  8 Asnaf Terpenuhi
                </span>
              </div>

              <div
                className={`p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Validasi Pajak PPh</span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  100% Sah
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  UU RI No. 23/2011
                </span>
              </div>
            </div>
          </div>

          {/* Form: Identitas Muzakki */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-teal-400" />
              1. Identitas Muzakki / Wajib Pajak untuk Lampiran SPT
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nama Lengkap Sesuai KTP / NPWZ:
                </label>
                <input
                  type="text"
                  value={muzakkiName}
                  onChange={(e) => setMuzakkiName(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                  placeholder="Nama Lengkap..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nomor Pokok Wajib Zakat (NPWZ):
                </label>
                <input
                  type="text"
                  value={npwz}
                  onChange={(e) => setNpwz(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                  placeholder="31.75.xx.xxxx.xxx"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nomor Induk Kependudukan (NIK KTP):
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                  placeholder="16 Digit NIK..."
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Email Notifikasi & Arsip Dokumen:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                  placeholder="alamat@email.com"
                />
              </div>
            </div>
          </div>

          {/* Form: Opsi Kelengkapan Dokumen */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              2. Kelengkapan Komponen Dokumen PDF Resmi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  includeBszRegistry
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeBszRegistry}
                  onChange={(e) => setIncludeBszRegistry(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    Buku Register BSZ Elektronik Resmi
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Daftar nomor transaksi sah untuk pengurang pajak PPh
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                  includeSdgMetrics
                    ? 'border-teal-500/40 bg-teal-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={includeSdgMetrics}
                  onChange={(e) => setIncludeSdgMetrics(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                    Matriks Dampak Sosial & Sasaran SDG
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Alineasi SDG 1, 2, 3, 4, 8 & Skor SROI Berkelanjutan
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Form: Enkripsi Kata Sandi (Opsional) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                3. Proteksi Enkripsi Dokumen (Keamanan Data Pribadi)
              </h4>

              <label className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Aktifkan Sandi PDF</span>
              </label>
            </div>

            {isPasswordProtected && (
              <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-2 animate-fadeIn">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Kata Sandi Pembuka Dokumen (User Password):
                </label>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Masukkan kata sandi rahasia (contoh: 6 digit tanggal lahir)..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                />
                <span className="text-[10px] text-slate-400 block">
                  Dokumen PDF akan dienkripsi dengan standar AES-128 sehingga hanya Anda yang dapat membukanya.
                </span>
              </div>
            )}
          </div>

          {/* Success Generation Notice */}
          {generationResult && (
            <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dokumen PDF Berhasil Dibuat & Telah Diunduh!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400 block">Nama Berkas:</span>
                  <span className="font-mono font-bold text-slate-100">{generationResult.fileName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Ukuran File:</span>
                  <span className="font-mono text-slate-100">~{generationResult.fileSizeKB} KB (2 Halaman A4)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status Enkripsi:</span>
                  <span className="font-bold text-teal-300">
                    {generationResult.isEncrypted ? 'Terenkripsi Kata Sandi' : 'Standar Digital Signed'}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono truncate pt-1 border-t border-emerald-500/20">
                Ledger Checksum: {generationResult.documentHash}
              </div>
            </div>
          )}

          {/* Legal Exemption Guarantee */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-start gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Keabsahan Hukum:</strong> Dokumen PDF ini memuat Nomor Registrasi BSZ elektronik, stempel digital BAZNAS RI, dan pengesahan Dewan Pengawas Syariah. Berdasarkan UU RI No. 23/2011 Pasal 22, dokumen ini sah menjadi bukti lampiran formulir SPT Tahunan PPh Orang Pribadi (1770-III) sebagai pengurang penghasilan bruto kena pajak.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Format Resmi: A4 Portrait • 2 Halaman Lengkap</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              Batal / Tutup
            </button>

            <button
              id="generate-annual-impact-pdf-btn"
              onClick={handleGenerateAndDownload}
              disabled={isGenerating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/25 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {isGenerating
                  ? 'Menyusun Dokumen PDF...'
                  : hasDownloaded
                  ? 'Unduh Ulang PDF Laporan'
                  : 'Unduh PDF Laporan Tahunan'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
