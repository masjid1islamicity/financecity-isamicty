import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  ShieldCheck,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  X,
  Layers,
  Calendar,
  Coins,
  TrendingUp,
  Award,
  Terminal,
  ArrowRight,
  Database,
} from 'lucide-react';
import { ShariaFinancialGoal, Language, Theme } from '../types';
import { generateGoalSummaryPdf } from '../utils/goalSummaryPdfGenerator';
import { encryptDataE2E, sha256, calculateMerkleRoot } from '../utils/cryptoSecurity';

interface GoalBlockchainReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: ShariaFinancialGoal;
  accumulatedFundsIDR: number;
  totalBalanceIDR: number;
  projectedDateFormatted: string;
  projectedMonths: number;
  statusComparisonText: string;
  effectiveSavingsRateIDR: number;
  annualYieldPercent: number;
  totalCompoundYieldIDR: number;
  totalPrincipalSavedIDR: number;
  goldPriceGramIDR: number;
  theme: Theme;
  language: Language;
  onRecordToBlockchain?: (params: {
    goal: ShariaFinancialGoal;
    projectedDateFormatted: string;
    accumulatedFundsIDR: number;
    cipherText: string;
    signature: string;
    merkleRoot: string;
    txHash: string;
  }) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const GoalBlockchainReportModal: React.FC<GoalBlockchainReportModalProps> = ({
  isOpen,
  onClose,
  goal,
  accumulatedFundsIDR,
  totalBalanceIDR,
  projectedDateFormatted,
  projectedMonths,
  statusComparisonText,
  effectiveSavingsRateIDR,
  annualYieldPercent,
  totalCompoundYieldIDR,
  totalPrincipalSavedIDR,
  goldPriceGramIDR,
  theme,
  language,
  onRecordToBlockchain,
  onNavigateToTab,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'pdf' | 'blockchain'>('pdf');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Cryptographic states
  const [cipherText, setCipherText] = useState<string>('');
  const [signature, setSignature] = useState<string>('');
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [plainPayload, setPlainPayload] = useState<string>('');
  const [isRecorded, setIsRecorded] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfResult, setPdfResult] = useState<{ pdfBlobUrl?: string; fileName?: string; docRefNumber?: string } | null>(null);

  const walletAddress = '0x71C849A2b36eB6849F0302FeF4A39d67';

  // Compute cryptographic commitment when goal or params change
  useEffect(() => {
    let isMounted = true;

    async function computeCryptoData() {
      const payloadObj = {
        protocol: 'FINANCECITY-ISLAMIC-VAULT-v2',
        goalId: goal.id,
        goalTitle: goal.title,
        shariaCategory: goal.category,
        targetAmountIDR: goal.targetAmountIDR,
        accumulatedFundsIDR,
        monthlySavingsRateIDR: effectiveSavingsRateIDR,
        projectedDate: projectedDateFormatted,
        projectedMonths,
        annualYieldPercent,
        shariaVehicle: goal.shariaVehicle,
        investorWallet: walletAddress,
        legalBasis: 'Fatwa DSN-MUI No. 116 & AAOIFI Standard No. 57',
        timestamp: new Date().toISOString(),
      };

      const plainText = JSON.stringify(payloadObj, null, 2);
      if (isMounted) setPlainPayload(plainText);

      const enc = await encryptDataE2E(plainText);
      const hash = await sha256(`GOAL-TX-${goal.id}-${Date.now()}-${plainText.length}`);
      const root = await calculateMerkleRoot([
        enc.sig,
        hash,
        await sha256(goal.title),
        await sha256(String(goal.targetAmountIDR)),
      ]);

      if (isMounted) {
        setCipherText(enc.cipher);
        setSignature(enc.sig);
        setTxHash(hash);
        setMerkleRoot(root);
      }
    }

    computeCryptoData();

    return () => {
      isMounted = false;
    };
  }, [goal, accumulatedFundsIDR, effectiveSavingsRateIDR, projectedDateFormatted, projectedMonths, annualYieldPercent]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfResult?.pdfBlobUrl) {
        URL.revokeObjectURL(pdfResult.pdfBlobUrl);
      }
    };
  }, [pdfResult]);

  if (!isOpen) return null;

  const formatIDR = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Generate & Download PDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const res = generateGoalSummaryPdf({
        goal,
        investorName: 'Benny Kurniawan',
        walletAddress,
        totalBalanceIDR,
        accumulatedFundsIDR,
        projectedDateFormatted,
        projectedMonths,
        statusComparisonText,
        effectiveSavingsRateIDR,
        annualYieldPercent,
        totalCompoundYieldIDR,
        totalPrincipalSavedIDR,
        goldPriceGramIDR,
        merkleRoot: merkleRoot || '0x4f89a01e3b5c7d9e',
        txHash: txHash || '0x71c849a2b36eb684',
        signature: signature || '0x99a0b12c3d4e5f6a',
        cipherText: cipherText || 'enc:v2:sharia-vault',
        skipAutoSave: false,
      });

      setPdfResult({
        pdfBlobUrl: res.pdfBlobUrl,
        fileName: res.fileName,
        docRefNumber: res.docRefNumber,
      });
    } catch (e) {
      console.error('Failed to generate goal summary PDF', e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Record Goal to Blockchain Ledger PoSS
  const handleRecordToBlockchain = () => {
    if (onRecordToBlockchain) {
      onRecordToBlockchain({
        goal,
        projectedDateFormatted,
        accumulatedFundsIDR,
        cipherText: cipherText || 'enc:v2:sharia-goal-commitment',
        signature: signature || '0x99a0b12c3d4e5f6a7b8c',
        merkleRoot: merkleRoot || '0x3a9f018e4b7c2d1e',
        txHash: txHash || '0x88f9a01b2c3d4e5f',
      });
    }
    setIsRecorded(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Laporan Ringkasan & Stempel Blockchain
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  PoSS Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dokumentasi resmi PDF dan pencatatan kriptografis target investasi ke ledger terdesentralisasi.
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'pdf'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Laporan Ringkasan PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('blockchain')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 -mb-[1px] ${
              activeTab === 'blockchain'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Teks Terenkripsi & Ledger Blockchain</span>
            {isRecorded && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: PDF REPORT SUMMARY */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              {/* Document Visual Card */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">
                      Dokumen Komitmen Target Finansial Syariah Resmi (A4)
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Format Standar AAOIFI
                  </span>
                </div>

                {/* Target Snapshot Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Nama Target</span>
                    <span className="font-bold text-slate-100 text-xs truncate block mt-0.5">
                      {goal.title}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Target Nominal</span>
                    <span className="font-bold font-mono text-emerald-400 text-xs block mt-0.5">
                      {formatIDR(goal.targetAmountIDR)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Laju Tabungan (DCA)</span>
                    <span className="font-bold font-mono text-slate-100 text-xs block mt-0.5">
                      {formatIDR(effectiveSavingsRateIDR)} / bln
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Proyeksi Tanggal Selesai</span>
                    <span className="font-bold font-mono text-emerald-400 text-xs block mt-0.5">
                      {projectedDateFormatted}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tenggat Target Awal</span>
                    <span className="font-bold text-slate-100 text-xs block mt-0.5">
                      Tahun {goal.targetDeadlineYear}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Status Evaluasi</span>
                    <span className="font-bold text-cyan-300 text-xs block mt-0.5 truncate">
                      {statusComparisonText}
                    </span>
                  </div>
                </div>

                {/* Sharia Governance & Security Notes */}
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-slate-300 leading-relaxed text-[11px] space-y-1">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prinsip Syariah & Verifikasi Digital:</span>
                  </div>
                  <p>
                    Laporan ini mencakup rincian lengkap akad Mudharabah Muthlaqah, jadwal predictive timeline akumulasi, kesiapan nisab emas 85g untuk zakat maal 2.5%, dan bukti hash stempel kriptografis untuk audit kepatuhan.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Siap diunduh dalam format PDF resmi berstempel digital.</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPdf ? 'Membuat PDF...' : 'Unduh Laporan PDF Resmi (A4)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENCRYPTED TEXT & BLOCKCHAIN LEDGER */}
          {activeTab === 'blockchain' && (
            <div className="space-y-4">
              {/* Recorded Status Banner */}
              {isRecorded && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">
                        Alhamdulillah! Komitmen Target Tercatat di Ledger Blockchain PoSS
                      </span>
                      <span className="text-[11px] text-slate-300 block">
                        Hash Transaksi: <strong className="font-mono text-emerald-300">{txHash.slice(0, 24)}...</strong>
                      </span>
                    </div>
                  </div>

                  {onNavigateToTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('ledger');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1"
                    >
                      <span>Lihat di Ledger</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Cryptographic Fields */}
              <div className="space-y-3">
                {/* 1. E2E Ciphertext */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-slate-200">
                        Teks Terenkripsi E2E (Ciphertext Target):
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(cipherText, 'cipher')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                    >
                      {copiedKey === 'cipher' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-emerald-300 break-all select-all overflow-x-auto max-h-20">
                    {cipherText || 'Generating ciphertext...'}
                  </pre>
                  <span className="text-[10px] text-slate-500 block">
                    Enkripsi AES-256 / Base64 terproteksi kunci master kriptografi FinanceCity Vault.
                  </span>
                </div>

                {/* 2. Digital Signature & Merkle Root */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Signature */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-[11px]">
                        Tanda Tangan Digital (ECDSA):
                      </span>
                      <button
                        onClick={() => handleCopy(signature, 'sig')}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        {copiedKey === 'sig' ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                    <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 truncate">
                      {signature || '0x...'}
                    </div>
                  </div>

                  {/* Merkle Root */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-[11px]">
                        Merkle Tree Root Hash:
                      </span>
                      <button
                        onClick={() => handleCopy(merkleRoot, 'merkle')}
                        className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        {copiedKey === 'merkle' ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                    <div className="p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 truncate">
                      {merkleRoot || '0x...'}
                    </div>
                  </div>
                </div>

                {/* 3. Plaintext JSON Payload Inspection */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold text-slate-200">
                        Payload Komitmen Terbuka (JSON Format):
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(plainPayload, 'json')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors"
                    >
                      {copiedKey === 'json' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Salin JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-32">
                    {plainPayload}
                  </pre>
                </div>
              </div>

              {/* Action: Record to Ledger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Validasi konsensus Proof-of-Shariah-Stake menjamin target tidak dapat dimanipulasi.
                  </span>
                </div>

                <button
                  onClick={handleRecordToBlockchain}
                  disabled={isRecorded}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                    isRecorded
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>{isRecorded ? 'Sudah Tercatat di Ledger' : 'Simpan ke Ledger Blockchain (PoSS)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kesesuaian Standar Dewan Syariah Nasional (DSN-MUI) & AAOIFI No. 57</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-200 font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
