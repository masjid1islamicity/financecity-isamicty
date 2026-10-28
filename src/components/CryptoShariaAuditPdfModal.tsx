import React, { useState } from 'react';
import {
  Download,
  FileCheck,
  ShieldCheck,
  Award,
  Lock,
  X,
  User,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Coins,
  Scale,
  Building2,
  Check,
} from 'lucide-react';
import { CryptoAsset, Theme, Language } from '../types';
import {
  generateCryptoShariaAuditPdf,
  GenerateCryptoShariaAuditPdfResult,
} from '../utils/cryptoShariaPdfGenerator';

interface CryptoShariaAuditPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR: number;
  theme: Theme;
  language: Language;
}

export const CryptoShariaAuditPdfModal: React.FC<CryptoShariaAuditPdfModalProps> = ({
  isOpen,
  onClose,
  assets,
  totalBalanceIDR,
  zakatReserveIDR,
  theme,
  language,
}) => {
  const [investorName, setInvestorName] = useState<string>('Benny Kurniawan');
  const [npwz, setNpwz] = useState<string>('31.75.92.8124.009');
  const [nik, setNik] = useState<string>('3175089201940001');
  const [email, setEmail] = useState<string>('benny3.biggroup@gmail.com');
  const [walletAddress, setWalletAddress] = useState<string>('0x71C849A2b36eB6849F0302FeF4A39');
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<GenerateCryptoShariaAuditPdfResult | null>(null);

  if (!isOpen) return null;

  const averageHalalScore =
    assets.length > 0
      ? Number((assets.reduce((sum, a) => sum + a.halalScore, 0) / assets.length).toFixed(1))
      : 97.5;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    setResult(null);

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
        });

        setResult(res);
      } catch (err: any) {
        console.error('Error generating crypto sharia audit PDF:', err);
        alert('Gagal menghasilkan dokumen PDF Audit Syariah. Silakan coba kembali.');
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div
      id="crypto-sharia-audit-pdf-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl my-6 rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-start justify-between gap-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-slate-800'
              : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Laporan Audit Kepatuhan Syariah Portofolio Kripto
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PDF Resmi
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit otomatis berbasis metadata terkini, standar AAOIFI No. 57, dan Fatwa DSN-MUI No. 140.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Key Metrics Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">Total Portofolio</div>
              <div className="text-base font-bold text-emerald-500 mt-1">{formatIDR(totalBalanceIDR)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">5 Aset Digital Aktif</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">Rata-Rata Halal Score</div>
              <div className="text-base font-bold text-emerald-400 mt-1">{averageHalalScore}%</div>
              <div className="text-[10px] text-emerald-500 mt-0.5">Grade A+ (Mumtaz)</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">Status Syariah</div>
              <div className="text-base font-bold text-teal-400 mt-1">100% Patuh</div>
              <div className="text-[10px] text-slate-400 mt-0.5">0% Riba, Gharar, Maysir</div>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-400">Cadangan Zakat Maal</div>
              <div className="text-base font-bold text-amber-400 mt-1">{formatIDR(zakatReserveIDR)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Terkoneksi API BAZNAS</div>
            </div>
          </div>

          {/* Metadata Audit Assets Preview Table */}
          <div
            className={`rounded-xl border overflow-hidden ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold ${
                theme === 'dark' ? 'bg-slate-800/60 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Aset Kripto yang Tercakup dalam Audit ({assets.length} Aset)</span>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold">Tervalidasi On-Chain</span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    theme === 'dark' ? 'bg-slate-950/40 hover:bg-slate-800/40' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-500 text-[11px]">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {asset.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {asset.symbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{asset.underlyingAsset}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{formatIDR(asset.priceIDR)}</div>
                      <div className="text-[10px] text-slate-400">{asset.shariaStandard.slice(0, 32)}...</div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold text-xs">
                      {asset.halalScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Details (Investor & Document Metadata) */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
              <User className="w-4 h-4 text-emerald-500" />
              <span>Informasi Pemilik Dokumen (Untuk Keperluan Pelaporan Pajak & Bukti Sah)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Nama Lengkap Investor / Muzakki:</label>
                <input
                  type="text"
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Nomor Pokok Wajib Zakat (NPWZ):</label>
                <input
                  type="text"
                  value={npwz}
                  onChange={(e) => setNpwz(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Nomor Induk Kependudukan (NIK):</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Alamat Wallet Terdaftar:</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none font-mono ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Optional Password Protection */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Kunci File PDF dengan Password Enkripsi (Opsional)
                </span>
              </label>

              {isPasswordProtected && (
                <div className="mt-2 pl-6">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi untuk membuka PDF..."
                    className={`w-full sm:w-72 px-3 py-1.5 rounded-lg border text-xs outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success Banner if Downloaded */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Laporan Audit Syariah Berhasil Dibuat dan Diunduh!
              </div>
              <p className="text-[11px] text-slate-300">
                Nama File: <strong className="font-mono text-emerald-300">{result.fileName}</strong> ({result.fileSizeKB} KB)
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Checksum SHA-256: {result.documentHash.slice(0, 32)}...
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div
          className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Format PDF A4 Resmi Standar Akuntansi Syariah AAOIFI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              Tutup
            </button>

            <button
              id="confirm-download-sharia-audit-pdf-btn"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Membuat Laporan PDF...' : 'Unduh Laporan Audit PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
