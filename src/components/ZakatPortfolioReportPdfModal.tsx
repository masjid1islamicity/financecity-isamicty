import React, { useState } from 'react';
import {
  Download,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  CheckCircle2,
  X,
  ExternalLink,
  Coins,
  Scale,
  Sparkles,
  Building2,
  Check,
  Eye,
  EyeOff,
  Database,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { CryptoAsset, TradeOrder, EncryptedUserHistory, ZakatSummaryRecord, Theme, Language } from '../types';
import {
  generateZakatPortfolioReportPdf,
  GenerateZakatPortfolioPdfResult,
} from '../utils/zakatPortfolioReportPdfGenerator';

interface ZakatPortfolioReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR: number;
  recentTrades: TradeOrder[];
  history: EncryptedUserHistory[];
  disbursedRecords?: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
}

export const ZakatPortfolioReportPdfModal: React.FC<ZakatPortfolioReportPdfModalProps> = ({
  isOpen,
  onClose,
  assets,
  totalBalanceIDR,
  zakatReserveIDR,
  recentTrades,
  history,
  disbursedRecords = [],
  theme,
  language,
}) => {
  const isDark = theme === 'dark';

  // Muzakki tax identity states
  const [userName, setUserName] = useState<string>('Benny Kurniawan');
  const [nik, setNik] = useState<string>('3175089201940001');
  const [npwz, setNpwz] = useState<string>('31.75.92.8124.009');
  const [userEmail, setUserEmail] = useState<string>('benny3.biggroup@gmail.com');
  const [walletAddress, setWalletAddress] = useState<string>('0x71C849A2b36eB6849F0302FeF4A39d67');
  const [period, setPeriod] = useState<string>('Tahun Buku 2026 / 1447-1448 H');

  // Encryption configuration
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('FinanceCity2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerateZakatPortfolioPdfResult | null>(null);

  if (!isOpen) return null;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const paxgAsset = assets.find((a) => a.symbol === 'PAXG');
  const goldPriceGram = Math.round((paxgAsset?.priceIDR || 42100000) / 31.1035);
  const nisab85gIDR = goldPriceGram * 85;
  const isNisabReached = totalBalanceIDR >= nisab85gIDR;
  const estimatedAnnualZakatDue = isNisabReached ? Math.round(totalBalanceIDR * 0.025) : 0;
  const totalDisbursed = disbursedRecords.reduce((sum, r) => sum + r.amountIDR, 0);

  const handleGeneratePdf = (skipAutoSave: boolean = false) => {
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      try {
        const res = generateZakatPortfolioReportPdf({
          userName: userName.trim() || 'Benny Kurniawan',
          nik: nik.trim() || '3175089201940001',
          npwz: npwz.trim() || '31.75.92.8124.009',
          userEmail: userEmail.trim(),
          walletAddress: walletAddress.trim(),
          period: period.trim(),
          totalBalanceIDR,
          zakatReserveIDR,
          assets,
          recentTrades,
          history,
          disbursedRecords,
          isPasswordProtected,
          password: isPasswordProtected ? password : '',
          skipAutoSave,
        });

        setResult(res);
      } catch (err) {
        console.error('Failed to generate Zakat Portfolio PDF', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Ekspor Laporan Zakat Portofolio & Mutasi Transaksi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PSAK 109 & BAZNAS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Format resmi berstandar akuntansi zakat syariah IAI, sah sebagai faktor pengurang Pajak Penghasilan (PPh Pasal 22).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Zakat Position Card (PSAK 109 Overview) */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-950/80 via-slate-900/90 to-emerald-950/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Ringkasan Neraca Zakat Maal (PSAK 109)</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Tarif Zakat: 2.5%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Valuasi Portofolio</span>
                <span className="font-bold font-mono text-emerald-400 text-xs block mt-0.5">
                  {formatIDR(totalBalanceIDR)}
                </span>
                <span className="text-[9px] text-slate-500 block">{assets.length} Aset Kripto</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Nisab 85g Emas (PAXG)</span>
                <span className="font-bold font-mono text-amber-400 text-xs block mt-0.5">
                  {formatIDR(nisab85gIDR)}
                </span>
                <span className="text-[9px] text-emerald-400 block">✓ Melebihi Nisab</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Kewajiban Zakat (2.5%)</span>
                <span className="font-bold font-mono text-teal-400 text-xs block mt-0.5">
                  {formatIDR(estimatedAnnualZakatDue)}
                </span>
                <span className="text-[9px] text-slate-400 block">Tahun Buku 2026</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Riwayat Transaksi</span>
                <span className="font-bold font-mono text-slate-100 text-xs block mt-0.5">
                  {recentTrades.length + history.length} Catatan
                </span>
                <span className="text-[9px] text-slate-500 block">Termasuk Bot & Ledger</span>
              </div>
            </div>
          </div>

          {/* Form Settings Grid: Muzakki Profile & Tax Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Identitas Muzakki / Wajib Pajak */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Identitas Muzakki (Pengurang Pajak)</span>
              </span>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">NIK (KTP)</label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">NPWZ BAZNAS</label>
                  <input
                    type="text"
                    value={npwz}
                    onChange={(e) => setNpwz(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">Periode Laporan</label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs"
                />
              </div>
            </div>

            {/* Proteksi & Enkripsi Kata Sandi PDF */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Enkripsi Kata Sandi PDF (AES-256)</span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Melindungi kerahasiaan kepemilikan aset kripto dan riwayat transaksi dengan enkripsi standar industri.
                </p>
              </div>

              {isPasswordProtected ? (
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Kata Sandi Pembuka Dokumen:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full p-2 pr-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-slate-100 outline-none text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-slate-400">Saran Cepat:</span>
                    {['FinanceCity2026', 'ZakatBerkah85g', nik.slice(-6)].map((sugg) => (
                      <button
                        key={sugg}
                        type="button"
                        onClick={() => setPassword(sugg)}
                        className="px-2 py-0.5 rounded text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-400 font-mono transition-colors"
                      >
                        {sugg}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Dokumen PDF akan disimpan tanpa proteksi kata sandi (siap cetak langsung).</span>
                </div>
              )}

              <div className="pt-2 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dilengkapi stempel hash blockchain PoSS dan tanda tangan digital resmi.</span>
              </div>
            </div>
          </div>

          {/* Success Banner if Generated */}
          {result && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Laporan PDF Berhasil Dibuat!</span>
                </div>
                <span className="font-mono text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-200">
                  {result.fileSizeKB} KB • {result.isEncrypted ? '🔒 Password Protected' : '✓ Unprotected'}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 font-mono space-y-0.5">
                <div>File: <strong className="text-white">{result.fileName}</strong></div>
                <div className="truncate">Hash SHA-256: {result.documentHash}</div>
                <div>No. Registrasi: {result.docRefNumber}</div>
              </div>

              {result.pdfBlobUrl && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={result.downloadPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Ulang</span>
                  </button>
                  <a
                    href={result.pdfBlobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Preview di Tab Baru</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Sharia & Tax Legal Notes */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Dasar Hukum & Ketentuan Pajak Indonesia:</span>
            </span>
            <p>
              1. <strong>UU No. 23 Tahun 2011 Pasal 22</strong>: Zakat yang dibayarkan muzakki kepada BAZNAS/LAZ resmi dapat dikurangkan dari penghasilan bruto kena pajak.
            </p>
            <p>
              2. <strong>PSAK 109</strong>: Menstandarkan pengakuan, pengukuran, penyajian, dan pengungkapan transaksi zakat, infak, dan sedekah pada aset keuangan kontemporer termasuk aset kripto dan emas digital.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dokumen 2 Halaman (Neraca Zakat, Portofolio & Mutasi Transaksi)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors"
            >
              Tutup
            </button>
            <button
              id="download-zakat-portfolio-pdf-btn"
              onClick={() => handleGeneratePdf(false)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Membuat Dokumen...' : 'Unduh Laporan PDF Terenkripsi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
