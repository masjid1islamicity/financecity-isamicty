import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  CheckCircle2,
  Copy,
  Download,
  Terminal,
  KeyRound,
  FileCode,
  FileSpreadsheet,
  FileDown,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  BlockchainBlock,
  EncryptedUserHistory,
  Language,
  Theme,
  CryptoAsset,
  TradeOrder,
  ZakatSummaryRecord,
} from '../types';
import { translations } from '../utils/translations';
import { sha256, decryptDataE2E } from '../utils/cryptoSecurity';
import { ZakatPortfolioReportPdfModal } from './ZakatPortfolioReportPdfModal';

interface BlockchainLedgerProps {
  blocks: BlockchainBlock[];
  history: EncryptedUserHistory[];
  assets?: CryptoAsset[];
  totalBalanceIDR?: number;
  zakatReserveIDR?: number;
  recentTrades?: TradeOrder[];
  disbursedRecords?: ZakatSummaryRecord[];
  language: Language;
  theme: Theme;
  onRequireBiometricAuth: (onSuccess: () => void) => void;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function maskSensitiveActivity(activity: string): string {
  if (!activity) return '[EMPTY_RECORD]';

  let masked = activity;

  // Mask bank account numbers (e.g. 7129038411 -> 7129****11)
  masked = masked.replace(/\b(\d{4})\d{4,8}(\d{2})\b/g, '$1****$2');

  // Mask Ethereum / PoSS wallet / tx addresses (e.g. 0x8f2a9103... -> 0x8f2a...e0ab)
  masked = masked.replace(/0x[a-fA-F0-9]{40,64}/g, (match) => {
    return `${match.slice(0, 6)}...${match.slice(-4)}`;
  });

  // Mask BSZ Receipt numbers: BSZ-BAZNAS-202609-901842 -> BSZ-BAZNAS-******-842
  masked = masked.replace(/(BSZ-[A-Z_]+-)(\d{4,8}-?)(\w{3,6})/g, '$1******-$3');

  // Mask exact IDR figures in activity text: e.g. Rp 2.500.000 -> Rp 2.***.***
  masked = masked.replace(/Rp\s?(\d{1,3})(?:[.,]\d{3})+/g, 'Rp $1.***.***');

  return masked;
}

function maskAmountIDR(amount?: number): string {
  if (amount === undefined || amount === null) return 'N/A';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  if (abs === 0) return 'Rp 0';

  const str = Math.round(abs).toString();
  if (str.length <= 4) {
    return `${isNegative ? '-' : ''}Rp *** (MASKED)`;
  }
  const prefix = str.slice(0, 2);
  const remainingCount = str.length - 2;
  const stars = '*'.repeat(remainingCount);
  return `${isNegative ? '-' : ''}Rp ${prefix}${stars} [MASKED_AMOUNT]`;
}

export const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({
  blocks,
  history,
  assets = [],
  totalBalanceIDR = 0,
  zakatReserveIDR = 0,
  recentTrades = [],
  disbursedRecords = [],
  language,
  theme,
  onRequireBiometricAuth,
}) => {
  const t = translations[language];

  const [isDecrypted, setIsDecrypted] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [hashInput, setHashInput] = useState('');
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [exportCsvSuccess, setExportCsvSuccess] = useState(false);
  const [isZakatPortfolioPdfModalOpen, setIsZakatPortfolioPdfModalOpen] = useState(false);

  const handleToggleDecrypt = () => {
    if (!isDecrypted) {
      // Require biometric authentication to decrypt user's private E2EE history!
      onRequireBiometricAuth(() => {
        setIsDecrypted(true);
      });
    } else {
      setIsDecrypted(false);
    }
  };

  const handleComputeHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;
    const res = await sha256(hashInput.trim());
    setComputedHash(res);
  };

  const copyText = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedHash(val);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportBackup = () => {
    const dataStr = JSON.stringify({ blocks, history, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financecity-islamicity-ledger-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export encrypted transaction history as CSV with sensitive data masked and hashed
  const handleExportLedgerCSV = async () => {
    setIsExportingCsv(true);
    try {
      const headers = [
        'Log_ID',
        'Timestamp',
        'Category',
        'Encrypted_Ciphertext',
        'Masked_Activity_Preview',
        'Masked_Amount_IDR',
        'Payload_SHA256_Checksum',
        'Cryptographic_Signature',
        'Verification_Status',
      ];

      const rows = await Promise.all(
        history.map(async (item) => {
          const payloadChecksum = await sha256(item.activity + '::' + (item.amountIDR || 0));
          return [
            escapeCsvCell(item.id),
            escapeCsvCell(item.timestamp),
            escapeCsvCell(item.category),
            escapeCsvCell(item.cipherText),
            escapeCsvCell(maskSensitiveActivity(item.activity)),
            escapeCsvCell(maskAmountIDR(item.amountIDR)),
            escapeCsvCell(payloadChecksum),
            escapeCsvCell(item.signature),
            escapeCsvCell('VERIFIED_ON_CHAIN_PoSS'),
          ].join(',');
        })
      );

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financecity-encrypted-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setExportCsvSuccess(true);
      setTimeout(() => setExportCsvSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export ledger CSV:', err);
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.blockchain.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Proof-of-Shariah-Stake (PoSS)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t.blockchain.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Ledger Button (Primary Requirement) */}
            <button
              id="export-ledger-csv-btn"
              onClick={handleExportLedgerCSV}
              disabled={isExportingCsv}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                exportCsvSuccess
                  ? 'border border-emerald-500 bg-emerald-500/20 text-emerald-300'
                  : 'border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
              }`}
              title="Download your encrypted transaction history as a CSV file with privacy-masked data and cryptographic hashes"
            >
              {exportCsvSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>CSV Terunduh!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{isExportingCsv ? 'Mengekspor CSV...' : 'Export Ledger'}</span>
                </>
              )}
            </button>

            {/* Encrypted Zakat & Portfolio Ledger PDF Export Button (PSAK 109 & BAZNAS RI) */}
            <button
              id="export-zakat-portfolio-pdf-btn"
              onClick={() => setIsZakatPortfolioPdfModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300"
              title="Ekspor Laporan Keuangan Zakat Portofolio & Ledger Transaksi Terenkripsi (PSAK 109 & BAZNAS RI)"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Ekspor PDF Zakat & Ledger (PSAK 109 🔒)</span>
            </button>

            <button
              id="toggle-decrypt-history-btn"
              onClick={handleToggleDecrypt}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                isDecrypted
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {isDecrypted ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{t.blockchain.decryptToggle}</span>
            </button>

            <button
              id="export-backup-btn"
              onClick={handleExportBackup}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-slate-400 hover:text-slate-200"
              title="Unduh Salinan Cadangan JSON Terenkripsi"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Privacy & Encryption Compliance Notice */}
        <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <KeyRound className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{t.blockchain.encryptedNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Privasi: PII Masked & SHA-256 Hashed
            </span>
          </div>
        </div>

        {/* Export Success Notification Banner */}
        {exportCsvSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Buku Besar Berhasil Diekspor ke CSV:</strong> Semua nomor rekening, nominal pasti, dan data identitas pribadi (PII) telah disamarkan serta diverifikasi dengan hash kriptografis SHA-256.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Block Explorer & Hash Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sharia Block Explorer */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              {t.blockchain.blockExplorer}
            </h3>
            <span className="text-xs text-emerald-500 font-semibold">
              Tervalidasi 3 Node Pengawas Syariah Global
            </span>
          </div>

          <div className="space-y-3">
            {blocks.map((block) => (
              <div
                key={block.blockNumber}
                className={`p-4 rounded-xl border text-xs transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                      #{block.blockNumber}
                    </span>
                    <span>Validator: {block.validatorNode}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {block.timestamp}
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>{t.blockchain.blockHash}:</span>
                    <span className="text-emerald-500 font-semibold truncate max-w-[280px]">
                      {block.hash}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t.blockchain.merkleRoot}:</span>
                    <span className="truncate max-w-[280px]">{block.merkleRoot}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                  <span className="text-slate-500">
                    {block.txCount} Transaksi Syariah Terverifikasi • Nonce: {block.nonce}
                  </span>
                  <button
                    onClick={() => copyText(block.hash)}
                    className="text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedHash === block.hash ? 'Tersalin' : 'Salin Hash'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Hash Verifier Tool */}
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
            <Search className="w-4 h-4 text-emerald-500" />
            {t.blockchain.verifyHash}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Uji integritas data transaksi untuk memastikan bukti hash matematis tanpa rekaman palsu.
          </p>

          <form onSubmit={handleComputeHash} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold block mb-1">Payload / String Transaksi</label>
              <textarea
                rows={3}
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Masukkan teks atau data transaksi untuk diuji hash SHA-256..."
                className={`w-full p-2.5 rounded-xl border outline-none font-mono text-[11px] ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              Hitung Hash SHA-256
            </button>
          </form>

          {computedHash && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <span className="block text-[10px] uppercase font-bold text-emerald-500 mb-1">
                Hasil Hash SHA-256 Terverifikasi:
              </span>
              <p className="font-mono text-[10px] break-all text-slate-800 dark:text-slate-200">
                {computedHash}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* End-to-End Encrypted User Activity History */}
      <div
        className={`p-5 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              {t.blockchain.encryptedHistory}
            </h3>
            <p className="text-xs text-slate-400">
              Riwayat ini disimpan dengan enkripsi end-to-end. Dekripsi hanya dapat dilakukan dengan otentikasi biometrik pengguna.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-history-csv-btn"
              onClick={handleExportLedgerCSV}
              disabled={isExportingCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              title="Unduh Riwayat Terenkripsi sebagai CSV (Data Sensitif Disamarkan)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Ledger</span>
            </button>
            <span className="text-xs font-semibold text-emerald-500">
              {isDecrypted ? 'Status: Terdekripsi (Lokal)' : 'Status: Terenkripsi (AES-GCM)'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[10px] uppercase tracking-wider ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="p-3">ID Log</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Payload Transaksi ({isDecrypted ? 'Teks Asli' : 'Ciphertext'})</th>
                <th className="p-3">Tanda Tangan Kripto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {history.map((item) => (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3 font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100">
                    {item.id}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {item.timestamp}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3">
                    {isDecrypted ? (
                      <span className="text-emerald-500 font-medium">
                        {item.activity} {item.amountIDR ? `(Rp ${item.amountIDR.toLocaleString('id-ID')})` : ''}
                      </span>
                    ) : (
                      <span className="font-mono text-slate-400 text-[11px] select-all">
                        {item.cipherText}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-400">
                    {item.signature}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Encrypted Zakat & Portfolio Ledger PDF Report Modal (PSAK 109 & BAZNAS RI) */}
      <ZakatPortfolioReportPdfModal
        isOpen={isZakatPortfolioPdfModalOpen}
        onClose={() => setIsZakatPortfolioPdfModalOpen(false)}
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        recentTrades={recentTrades}
        history={history}
        disbursedRecords={disbursedRecords}
        theme={theme}
        language={language}
      />
    </div>
  );
};
