import React, { useState } from 'react';
import {
  FileText,
  Download,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Key,
  Eye,
  EyeOff,
  Building2,
  FileCheck,
  Sparkles,
  Info,
  Scale,
  RefreshCw,
  QrCode,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { Language, Theme, ZakatMonthlyReportItem } from '../types';
import { generateMonthlyZakatPdf, GenerateZakatPdfResult } from '../utils/zakatPdfGenerator';

interface ZakatMonthlyReportPdfViewProps {
  totalPortfolioIDR: number;
  nisabGoldIDR: number;
  zakatReserveIDR: number;
  disbursements: ZakatMonthlyReportItem[];
  theme: Theme;
  language: Language;
  onRequestBiometric?: (onSuccess: () => void, title?: string) => void;
}

const MONTH_PERIODS = [
  { code: '2026-09', label: 'September 2026 (Bulan Berjalan)', status: 'BERJALAN' },
  { code: '2026-08', label: 'Agustus 2026 (Arsip Terverifikasi)', status: 'LUNAS' },
  { code: '2026-07', label: 'Juli 2026 (Arsip Terverifikasi)', status: 'LUNAS' },
  { code: '2026-06', label: 'Juni 2026 (Kuartal II)', status: 'LUNAS' },
];

export const ZakatMonthlyReportPdfView: React.FC<ZakatMonthlyReportPdfViewProps> = ({
  totalPortfolioIDR,
  nisabGoldIDR,
  zakatReserveIDR,
  disbursements,
  theme,
  language,
  onRequestBiometric,
}) => {
  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>('2026-09');
  const [userName, setUserName] = useState<string>('Benny Kurniawan');
  const [npwz, setNpwz] = useState<string>('31.75.92.8124.009');
  const [nik, setNik] = useState<string>('3175089201940001');

  // Encryption Settings
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('Zakat2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Download & State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastDownloadResult, setLastDownloadResult] = useState<GenerateZakatPdfResult | null>(null);

  const selectedPeriod = MONTH_PERIODS.find((p) => p.code === selectedPeriodCode) || MONTH_PERIODS[0];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter or compile disbursements for this selected month
  const activeDisbursements: ZakatMonthlyReportItem[] =
    disbursements.length > 0
      ? disbursements
      : [
          {
            id: 'z-rep-1',
            date: `${selectedPeriodCode}-15 09:30`,
            institution: 'BAZNAS',
            institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
            receiptNumber: `BSZ-BAZNAS-${selectedPeriodCode.replace('-', '')}-901842`,
            programTarget: 'Pemberdayaan UMKM Mustahik',
            amountIDR: 2500000,
            txHash: '0x8f2a9103c842e174b09cf9321588d9a20984f1837acb43e82910fa847321e0ab',
            status: 'VERIFIED',
          },
          {
            id: 'z-rep-2',
            date: `${selectedPeriodCode}-20 14:15`,
            institution: 'DOMPET_DHUAFA',
            institutionName: 'Dompet Dhuafa Syariah',
            receiptNumber: `BSZ-DOMPET_DHUAFA-${selectedPeriodCode.replace('-', '')}-391048`,
            programTarget: 'RS Rumah Sehat Dhuafa',
            amountIDR: 1500000,
            txHash: '0x17c09341b8312e9874a621fe0819c6298103e58912ba09e392187c938120bda3',
            status: 'VERIFIED',
          },
        ];

  const totalDisbursedThisMonth = activeDisbursements.reduce((acc, curr) => acc + curr.amountIDR, 0);

  const handleExecuteDownloadPdf = () => {
    if (isPasswordProtected && (!password || password.trim().length < 4)) {
      alert('Kata sandi proteksi PDF minimal 4 karakter.');
      return;
    }

    const doDownload = () => {
      setIsGenerating(true);
      try {
        const result = generateMonthlyZakatPdf({
          period: selectedPeriod.label.split(' (')[0],
          periodCode: selectedPeriod.code,
          userName: userName || 'Hamba Allah',
          npwz: npwz || '31.75.92.8124.009',
          nik: nik || '3175089201940001',
          totalPortfolioIDR,
          nisabGoldIDR,
          zakatReserveIDR,
          disbursements: activeDisbursements,
          isPasswordProtected,
          password,
        });

        setLastDownloadResult(result);
      } catch (err: any) {
        console.error('Error generating zakat PDF:', err);
        alert('Terjadi kendala saat menghasilkan dokumen PDF. Silakan coba kembali.');
      } finally {
        setIsGenerating(false);
      }
    };

    if (onRequestBiometric && isPasswordProtected) {
      onRequestBiometric(doDownload, 'Otorisasi Pengunduhan Laporan Zakat Terenkripsi');
    } else {
      doDownload();
    }
  };

  return (
    <div id="zakat-monthly-pdf-generator" className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-teal-500/30'
            : 'bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-white border-teal-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500 text-white shadow-sm shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Laporan & Arsip Zakat Maal Bulanan (PDF Terenkripsi)
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Sah Pengurang Pajak SPT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Unduh lembar Bukti Setor Zakat (BSZ) resmi bulanan berstandar BAZNAS & UU No. 23 Tahun 2011 Pasal 22. Dokumen dilengkapi proteksi kata sandi (kriptografi AES-128) dan hash tanda tangan digital anti-pemalsuan.
            </p>
          </div>
        </div>

        <button
          id="quick-download-zakat-pdf-btn"
          onClick={handleExecuteDownloadPdf}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Membuat Dokumen PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh PDF Bulan Ini</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Left Controls & Security Configuration | Right Live Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Encryption Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Section 1: Period Selector */}
          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              1. Pilih Periode Laporan Bulanan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MONTH_PERIODS.map((p) => {
                const isSelected = selectedPeriodCode === p.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => setSelectedPeriodCode(p.code)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 font-bold text-teal-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{p.label.split(' (')[0]}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-teal-500" /> {p.status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Muzakki / Taxpayer Identity */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-500" />
              2. Data Wajib Zakat (Muzakki) untuk Bukti Resmi:
            </label>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Lengkap Muzakki:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Contoh: Benny Kurniawan"
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">NPWZ (No. Pokok Zakat):</label>
                <input
                  type="text"
                  value={npwz}
                  onChange={(e) => setNpwz(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">NIK (KTP Wajib Pajak):</label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Password Encryption Configuration */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isPasswordProtected
                ? 'border-teal-500/40 bg-teal-500/5'
                : theme === 'dark'
                ? 'bg-slate-950/70 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 cursor-pointer">
                {isPasswordProtected ? (
                  <Lock className="w-4 h-4 text-teal-400" />
                ) : (
                  <Unlock className="w-4 h-4 text-slate-400" />
                )}
                <span>3. Enkripsi Dokumen PDF dengan Password</span>
              </label>
              <input
                type="checkbox"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Melindungi dokumen PDF dengan enkripsi standar AES-128. Pengguna atau pihak lain harus memasukkan kata sandi untuk membuka file PDF ini.
            </p>

            {isPasswordProtected && (
              <div className="space-y-2 pt-1">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi pembuka PDF..."
                    className={`w-full px-3 py-2 pr-10 rounded-xl border text-xs font-mono outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password Presets */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Preset:</span>
                  <button
                    type="button"
                    onClick={() => setPassword('Zakat2026')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:text-teal-400"
                  >
                    Zakat2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassword(nik.slice(-6) || '819204')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:text-teal-400"
                  >
                    6 Digit Terakhir NIK
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassword('ShariaPass99')}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 hover:text-teal-400"
                  >
                    ShariaPass99
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Execution Button */}
          <button
            id="download-zakat-pdf-form-btn"
            type="button"
            onClick={handleExecuteDownloadPdf}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mengekstrak Bukti Setor & Mengenkripsi...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  Unduh Laporan ({selectedPeriod.label.split(' (')[0]}) - PDF{' '}
                  {isPasswordProtected ? 'Terenkripsi' : 'Terverifikasi'}
                </span>
              </>
            )}
          </button>

          {/* Success Result Box */}
          {lastDownloadResult && (
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>File PDF Berhasil Dibuat & Diunduh!</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Nama File: <strong>{lastDownloadResult.fileName}</strong>
              </div>
              <div className="text-[10px] text-slate-400">
                Ukuran: ~{lastDownloadResult.fileSizeKB} KB | Hash: {lastDownloadResult.documentHash.slice(0, 24)}...
              </div>
              {lastDownloadResult.isEncrypted && (
                <div className="text-[10px] text-teal-300 bg-teal-950/60 p-1.5 rounded border border-teal-800/40 flex items-center gap-1 mt-1">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span>File terenkripsi dengan kata sandi: <strong>{password}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Visual Certificate Preview (7 Cols) */}
        <div className="lg:col-span-7">
          <div
            className={`p-5 rounded-2xl border ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-teal-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Pratinjau Dokumen Resmi Bukti Setor Zakat (BSZ)
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold border border-teal-500/20">
                A4 Official Format
              </span>
            </div>

            {/* Visual Simulated Document (Miniature A4 Certificate Layout) */}
            <div className="p-4 sm:p-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white text-slate-900 shadow-inner font-sans text-xs space-y-4 select-none">
              {/* Kop Surat */}
              <div className="border-b-2 border-teal-600 pb-3 flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-teal-700 tracking-wider">
                    BADAN AMIL ZAKAT NASIONAL & FINANCECITY ISLAMICITY
                  </div>
                  <div className="text-[8px] text-slate-500 font-medium">
                    Sistem Otentikasi Penyaluran Zakat Terintegrasi API & Standar DSN-MUI No. 114
                  </div>
                  <div className="text-[8px] text-slate-400 font-mono">
                    Nomor: BSZ-FC/{selectedPeriod.code.replace('-', '/')}/819204
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    SAH PENGURANG PAJAK
                  </span>
                  <div className="text-[7.5px] text-slate-400 mt-1">UU No. 23/2011 Pasal 22</div>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-1">
                <h5 className="font-bold text-xs tracking-tight text-slate-900">
                  BUKTI SETOR ZAKAT (BSZ) & LAPORAN AUDIT ZAKAT MAAL
                </h5>
                <p className="text-[9px] text-slate-500">
                  Periode Rekonsiliasi: <strong>{selectedPeriod.label.split(' (')[0]}</strong>
                </p>
              </div>

              {/* Muzakki Details & Security Box */}
              <div className="grid grid-cols-2 gap-3 text-[9px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <div className="text-slate-400 font-bold mb-1 uppercase text-[8px]">Data Wajib Zakat</div>
                  <div>Nama: <strong>{userName || 'Hamba Allah'}</strong></div>
                  <div>NPWZ: <span className="font-mono">{npwz}</span></div>
                  <div>NIK: <span className="font-mono">{nik}</span></div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold mb-1 uppercase text-[8px]">Status Keabsahan</div>
                  <div>Status Syariah: <strong className="text-emerald-700">Telah Nisab & Haul</strong></div>
                  <div>Proteksi Dokumen: <strong>{isPasswordProtected ? 'Terenkripsi Password' : 'Digital Signed'}</strong></div>
                  <div>Konsensus: <span className="font-mono text-[8px]">PoSS Blockchain</span></div>
                </div>
              </div>

              {/* Table Breakdown */}
              <div className="space-y-1">
                <div className="text-[8.5px] font-bold text-slate-700 uppercase">
                  Rincian Penyaluran ke Lembaga Amil Terakreditasi:
                </div>
                <div className="border border-slate-200 rounded overflow-hidden text-[8px]">
                  <div className="bg-slate-100 font-bold grid grid-cols-12 p-1.5 border-b border-slate-200">
                    <span className="col-span-1">No</span>
                    <span className="col-span-4">Lembaga Amil</span>
                    <span className="col-span-4">Program Mustahik</span>
                    <span className="col-span-3 text-right">Nominal (IDR)</span>
                  </div>
                  {activeDisbursements.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 p-1.5 border-b border-slate-100 last:border-0">
                      <span className="col-span-1">{idx + 1}</span>
                      <span className="col-span-4 font-semibold text-slate-800">{row.institutionName.split(' (')[0]}</span>
                      <span className="col-span-4 text-slate-600">{row.programTarget}</span>
                      <span className="col-span-3 text-right font-bold text-teal-700">
                        {formatIDR(row.amountIDR)}
                      </span>
                    </div>
                  ))}
                  <div className="bg-teal-50 font-bold grid grid-cols-12 p-1.5 text-teal-900 border-t border-teal-200">
                    <span className="col-span-9">TOTAL ZAKAT MAAL LUNAS TERSELESAIKAN:</span>
                    <span className="col-span-3 text-right font-black">
                      {formatIDR(totalDisbursedThisMonth)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Seal Section */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[8px]">
                <div>
                  <div className="text-slate-400">Muzakki (Wajib Zakat)</div>
                  <div className="mt-4 font-bold text-slate-800">{userName || 'Hamba Allah'}</div>
                  <div className="text-[7px] text-teal-600">Otorisasi Biometrik Sah</div>
                </div>
                <div>
                  <div className="text-slate-400">Badan Amil Zakat Partner</div>
                  <div className="mt-1 flex justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-teal-600 flex items-center justify-center text-[7px] font-black text-teal-700 bg-teal-50">
                      LUNAS
                    </div>
                  </div>
                  <div className="text-[7px] text-slate-500 mt-1">BAZNAS RI & LAZ</div>
                </div>
                <div>
                  <div className="text-slate-400">Khatam Dewan Syariah</div>
                  <div className="mt-4 font-bold text-slate-800">DSN-MUI & AAOIFI</div>
                  <div className="text-[7px] text-slate-500">Hash Checksum Verified</div>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-teal-500" />
                Dapat dilampirkan langsung pada form SPT 1770 / 1770 S (Lampiran Bukti Zakat).
              </span>
              <button
                onClick={handleExecuteDownloadPdf}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Unduh File</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
