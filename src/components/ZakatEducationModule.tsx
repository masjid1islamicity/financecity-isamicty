import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  ArrowRight,
  Coins,
  Info,
  Sparkles,
  Copy,
  Building2,
  Lock,
  Scale,
  Send,
  HelpCircle,
  FileCheck,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';
import {
  Language,
  Theme,
  ZakatDisbursementData,
  ZakatMonthlyReportItem,
  AutoTradingConfig,
} from '../types';
import { ZakatMonthlyReportPdfView } from './ZakatMonthlyReportPdfView';
import { ZakatEstimationCalculator } from './ZakatEstimationCalculator';
import { ZakatHoldingsCalculator } from './ZakatHoldingsCalculator';

interface ZakatEducationModuleProps {
  zakatReserveIDR: number;
  totalPortfolioIDR: number;
  paxgPriceIDR: number; // e.g. ~42.100.000 per oz (~1.353.500 per gram)
  theme: Theme;
  language: Language;
  onDisburseSuccess: (data: ZakatDisbursementData) => void;
  onRequestBiometric?: (onSuccess: () => void, title?: string) => void;
  tradingConfig?: AutoTradingConfig;
  onUpdateTradingConfig?: (config: AutoTradingConfig) => void;
  initialTab?: 'education' | 'calculator' | 'projection' | 'disburse' | 'report';
}

interface AmilPartner {
  id: string;
  name: string;
  badge: string;
  accreditation: string;
  taxDeductible: boolean;
  programs: string[];
  logoIcon: string;
  apiLatency: string;
}

const AMIL_PARTNERS: AmilPartner[] = [
  {
    id: 'BAZNAS',
    name: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    badge: 'Lembaga Resmi Negara RI',
    accreditation: 'Regulator & Pelaksana Resmi (UU No. 23 Tahun 2011)',
    taxDeductible: true,
    programs: ['Pemberdayaan UMKM Mustahik', 'Kesehatan Dhuafa', 'Beasiswa Cendekia BAZNAS'],
    logoIcon: '🏛️',
    apiLatency: '14ms (Direct API)',
  },
  {
    id: 'DOMPET_DHUAFA',
    name: 'Dompet Dhuafa Syariah',
    badge: 'LAZ Nasional Terakreditasi',
    accreditation: 'SK Menteri Agama RI No. 439/2021',
    taxDeductible: true,
    programs: ['RS Rumah Sehat Bebas Biaya', 'Ketahanan Pangan Ternak', 'Bantuan Bencana Kemanusiaan'],
    logoIcon: '🌾',
    apiLatency: '18ms (Direct API)',
  },
  {
    id: 'RUMAH_ZAKAT',
    name: 'Rumah Zakat Indonesia',
    badge: 'Akreditasi A Kemenag',
    accreditation: 'SK Menteri Agama RI No. 42/2007',
    taxDeductible: true,
    programs: ['Program 1.000 Desa Berdaya', 'Senyum Juara Pendidikan', 'Superqurban Gizi Sehat'],
    logoIcon: '🏡',
    apiLatency: '12ms (Direct API)',
  },
  {
    id: 'LAZISMU',
    name: 'Lazismu Pusat',
    badge: 'LAZ Nasional Berdaya Umat',
    accreditation: 'SK Kemenag RI No. 730/2016',
    taxDeductible: true,
    programs: ['Klinik Surya Apung Nusantara', 'Pemberdayaan Ekonomi Dhuafa', 'Santunan Peduli Yatim'],
    logoIcon: '☀️',
    apiLatency: '20ms (Direct API)',
  },
];

export const ZakatEducationModule: React.FC<ZakatEducationModuleProps> = ({
  zakatReserveIDR,
  totalPortfolioIDR,
  paxgPriceIDR,
  theme,
  language,
  onDisburseSuccess,
  onRequestBiometric,
  tradingConfig,
  onUpdateTradingConfig,
  initialTab,
}) => {
  const [activeTab, setActiveTab] = useState<'education' | 'projection' | 'calculator' | 'disburse' | 'report'>(
    initialTab || 'education'
  );
  
  // Direct Disbursement Form State
  const [selectedAmilId, setSelectedAmilId] = useState<string>('BAZNAS');
  const [selectedProgram, setSelectedProgram] = useState<string>('Pemberdayaan UMKM Mustahik');
  const [disburseAmount, setDisburseAmount] = useState<number>(zakatReserveIDR);
  const [donorName, setDonorName] = useState<string>('Hamba Allah');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [receiptResult, setReceiptResult] = useState<ZakatDisbursementData | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Historical & monthly disbursements for official report & PDF export
  const [reportDisbursements, setReportDisbursements] = useState<ZakatMonthlyReportItem[]>([
    {
      id: 'z-rep-1',
      date: '2026-09-15 09:30',
      institution: 'BAZNAS',
      institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
      receiptNumber: 'BSZ-BAZNAS-202609-901842',
      programTarget: 'Pemberdayaan UMKM Mustahik',
      amountIDR: 2500000,
      txHash: '0x8f2a9103c842e174b09cf9321588d9a20984f1837acb43e82910fa847321e0ab',
      status: 'VERIFIED',
    },
    {
      id: 'z-rep-2',
      date: '2026-09-19 14:15',
      institution: 'DOMPET_DHUAFA',
      institutionName: 'Dompet Dhuafa Syariah',
      receiptNumber: 'BSZ-DOMPET_DHUAFA-202609-391048',
      programTarget: 'RS Rumah Sehat Dhuafa',
      amountIDR: 1500000,
      txHash: '0x17c09341b8312e9874a621fe0819c6298103e58912ba09e392187c938120bda3',
      status: 'VERIFIED',
    },
  ]);

  // Interactive Nisab & Zakat Simulator state
  const goldPricePerGram = Math.round(paxgPriceIDR / 31.1035); // 1 troy oz = 31.1035 grams
  const nisabGold85gIDR = goldPricePerGram * 85;
  const isPortfolioNisabEligible = totalPortfolioIDR >= nisabGold85gIDR;
  const [simulatedProfit, setSimulatedProfit] = useState<number>(50000000);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSelectPresetAmount = (percentage: number) => {
    const calculated = Math.round((zakatReserveIDR * percentage) / 100);
    setDisburseAmount(calculated);
  };

  const handleExecuteDisbursement = async () => {
    if (disburseAmount <= 0) {
      setErrorMessage('Nominal penyaluran zakat harus lebih dari Rp 0.');
      return;
    }
    if (disburseAmount > zakatReserveIDR) {
      setErrorMessage('Nominal penyaluran melebihi total cadangan zakat yang tersedia.');
      return;
    }

    setErrorMessage(null);

    const proceedDisbursement = async () => {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/zakat/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            institution: selectedAmilId,
            amountIDR: disburseAmount,
            donorName: isAnonymous ? 'Hamba Allah' : donorName,
            programTarget: selectedProgram,
            shariaAgreement: true,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const disbursementRecord: ZakatDisbursementData = result.data;
          setReceiptResult(disbursementRecord);
          onDisburseSuccess(disbursementRecord);

          // Append to monthly report disbursements
          const newReportItem: ZakatMonthlyReportItem = {
            id: 'z-rep-' + Date.now(),
            date: new Date().toISOString().replace('T', ' ').slice(0, 16),
            institution: disbursementRecord.institution,
            institutionName: disbursementRecord.institutionName,
            receiptNumber: disbursementRecord.receiptNumber,
            programTarget: disbursementRecord.programTarget,
            amountIDR: disbursementRecord.amountIDR,
            txHash: disbursementRecord.txHash,
            status: 'VERIFIED',
          };
          setReportDisbursements((prev) => [newReportItem, ...prev]);
        } else {
          setErrorMessage(result.message || 'Gagal menyalurkan zakat via API.');
        }
      } catch (err: any) {
        setErrorMessage('Koneksi API Lembaga Amil terputus. Silakan coba kembali.');
      } finally {
        setIsSubmitting(false);
      }
    };

    // If biometric auth trigger is supplied, request biometric confirmation for high-assurance action
    if (onRequestBiometric) {
      onRequestBiometric(proceedDisbursement, 'Otorisasi Penyaluran Zakat Maal Resmi via API');
    } else {
      proceedDisbursement();
    }
  };

  const handleCopyReceipt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const selectedAmil = AMIL_PARTNERS.find((a) => a.id === selectedAmilId) || AMIL_PARTNERS[0];

  return (
    <div
      id="zakat-education-governance-module"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-emerald-100 shadow-xs'
      }`}
    >
      {/* Module Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Tata Kelola & Edukasi Cadangan Zakat Maal Otomatis
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-500 border border-teal-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Standar DSN-MUI & BAZNAS API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Pelajari transparansi perhitungan zakat 2.5% otomatis dari profit trading syariah, batas nisab 85 gram emas fisik, dan salurkan langsung ke lembaga amil terakreditasi melalui gateway API resmi.
            </p>
          </div>
        </div>

        {/* Current Zakat Reserve Badge & Actions */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-teal-500/30 bg-teal-500/5">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase">
              Total Cadangan Zakat Tersedia
            </span>
            <span className="text-lg font-black text-teal-400">
              {formatIDR(zakatReserveIDR)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="top-zakat-estimator-btn"
              onClick={() => setActiveTab('projection')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Zakat Estimasi</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('disburse');
                setDisburseAmount(zakatReserveIDR);
              }}
              disabled={zakatReserveIDR <= 0}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-xs"
            >
              Salurkan API
            </button>
            <button
              id="top-download-zakat-pdf-tab-btn"
              onClick={() => setActiveTab('report')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-semibold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold px-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'education'
              ? 'border-teal-500 text-teal-500 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Edukasi Fiqih & Rumus 2.5%</span>
        </button>

        <button
          id="tab-zakat-estimation-projection-btn"
          onClick={() => setActiveTab('projection')}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'projection'
              ? 'border-teal-500 text-teal-500 font-bold bg-teal-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="flex items-center gap-1.5">
            Kalkulator 'Zakat Estimasi' (Proyeksi Bot)
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Proyeksi
            </span>
          </span>
        </button>

        <button
          id="tab-zakat-holdings-calculator-btn"
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'calculator'
              ? 'border-teal-500 text-teal-500 font-bold bg-teal-500/5'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-amber-400" />
          <span className="flex items-center gap-1.5">
            Kalkulator Zakat (Emas, Kas & Investasi)
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Nisab 85g
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('disburse')}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'disburse'
              ? 'border-teal-500 text-teal-500 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Penyaluran API Lembaga Amil Terpercaya</span>
        </button>

        <button
          id="tab-zakat-monthly-report-btn"
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'report'
              ? 'border-teal-500 text-teal-500 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laporan & Arsip PDF Terenkripsi</span>
        </button>
      </div>

      {/* Tab 1: Fiqh & Calculation Education */}
      {activeTab === 'education' && (
        <div className="p-5 space-y-6">
          {/* Fiqh Explanation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Mengapa Otomatis */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 text-teal-500 font-bold text-xs">
                <Coins className="w-4 h-4" />
                <span>Pencadangan Otomatis Laba (2.5%)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Setiap kali bot mengeksekusi perdagangan spot syariah yang menghasilkan laba bersih, <strong>2.5%</strong> dari bagian profit langsung dicadangkan ke <em>Escrow Vault</em> terpisah.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[11px] font-mono text-teal-400">
                Formula: Cadangan = 2.5% × Net Profit Eksekusi
              </div>
            </div>

            {/* Card 2: Standar Nisab Emas */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>Nisab 85 Gram Emas Murni</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Sesuai Fatwa DSN-MUI & AAOIFI No. 57, aset kripto dan keuntungan komoditas digital disetarakan dengan nisab emas fisik murni (85 gram) dalam tempo perputaran 1 tahun (haul).
              </p>
              <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-500">
                Nisab Emas Terkini: {formatIDR(nisabGold85gIDR)}
              </div>
            </div>

            {/* Card 3: Proteksi Escrow & Transparansi PoSS */}
            <div
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Isolated Escrow & Bebas Risiko</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dana cadangan zakat disimpan dalam brankas terisolasi (tidak diikutsertakan dalam modal trading aktif), menjamin hak asnaf tetap utuh dan terlindung dari risiko penurunan pasar (*drawdown*).
              </p>
              <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono text-emerald-400">
                Smart Contract: Proof-of-Shariah-Stake Audited
              </div>
            </div>
          </div>

          {/* 8 Asnaf Penerima Zakat (QS. At-Taubah: 60) */}
          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/70 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-500" />
                8 Golongan Mustahik Penerima Zakat Sesuai Al-Qur'an (QS. At-Taubah: 60)
              </h4>
              <span className="text-[11px] text-slate-400">Penyaluran resmi via BAZNAS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {[
                { name: '1. Fakir', desc: 'Tidak memiliki harta/penghasilan untuk kebutuhan primer' },
                { name: '2. Miskin', desc: 'Memiliki penghasilan namun belum mencukupi kebutuhan pokok' },
                { name: '3. Amil', desc: 'Pengelola & pengumpul zakat resmi berizin negara' },
                { name: '4. Mualaf', desc: 'Orang yang baru masuk Islam untuk penguatan akidah & ekonomi' },
                { name: '5. Riqab', desc: 'Upaya pembebasan perbudakan modern & human trafficking' },
                { name: '6. Gharimin', desc: 'Orang berutang demi mempertahankan kebutuhan darurat hidup' },
                { name: '7. Fisabilillah', desc: 'Aktivitas dakwah, pendidikan Islam, dan kemaslahatan umat' },
                { name: '8. Ibnu Sabil', desc: 'Musafir yang kehabisan bekal dalam perjalanan ketaatan' },
              ].map((asnaf, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-bold text-teal-500 text-xs">{asnaf.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {asnaf.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Interactive Zakat Holdings Calculator (Gold, Cash, Investments & Nisab) */}
      {activeTab === 'calculator' && (
        <div className="p-5">
          <ZakatHoldingsCalculator
            paxgPriceIDR={paxgPriceIDR}
            userPortfolioBalanceIDR={totalPortfolioIDR}
            theme={theme}
            language={language}
            onNavigateToDisburse={(amountIDR) => {
              setDisburseAmount(amountIDR);
              setActiveTab('disburse');
            }}
            onNavigateToProjection={() => setActiveTab('projection')}
          />
        </div>
      )}

      {/* Tab: Zakat Estimasi (Forward Profit Trend & Projection Planner) */}
      {activeTab === 'projection' && (
        <div className="p-5">
          <ZakatEstimationCalculator
            currentCapitalIDR={tradingConfig?.allocatedCapitalIDR || 120000000}
            dailyTargetPercent={tradingConfig?.dailyTargetPercent || 1.5}
            paxgPriceIDR={paxgPriceIDR}
            theme={theme}
            language={language}
            tradingConfig={tradingConfig}
            onApplyToTradingBot={(updatedFields) => {
              if (onUpdateTradingConfig && tradingConfig) {
                onUpdateTradingConfig({
                  ...tradingConfig,
                  ...updatedFields,
                });
              }
            }}
            onNavigateToDisburse={() => {
              setActiveTab('disburse');
              setDisburseAmount(zakatReserveIDR);
            }}
            onNavigateToReport={() => setActiveTab('report')}
          />
        </div>
      )}

      {/* Tab 3: Direct API Disbursement to Trusted Amil Institutions */}
      {activeTab === 'disburse' && (
        <div className="p-5 space-y-6">
          {receiptResult ? (
            /* Success Receipt Display */
            <div className="p-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Zakat Maal Berhasil Disalurkan via API
                    </h4>
                    <span className="text-xs text-emerald-500 font-semibold">
                      Bukti Setor Zakat (BSZ) Elektronik Diterbitkan
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Resmi Terverifikasi BAZNAS
                </span>
              </div>

              {/* Receipt Details Box */}
              <div
                className={`p-4 rounded-xl border font-mono text-xs space-y-2.5 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nomor Registrasi BSZ:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">{receiptResult.receiptNumber}</span>
                    <button
                      onClick={() => handleCopyReceipt(receiptResult.receiptNumber)}
                      className="text-slate-400 hover:text-emerald-500"
                      title="Salin Nomor BSZ"
                    >
                      {copiedReceipt ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Lembaga Amil Zakat:</span>
                  <span className="font-bold text-slate-200">{receiptResult.institutionName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nominal Zakat:</span>
                  <span className="font-black text-teal-400 text-sm">
                    {formatIDR(receiptResult.amountIDR)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Muzakki (Donatur):</span>
                  <span className="font-semibold text-slate-200">{receiptResult.donorName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Program Penyaluran:</span>
                  <span className="font-semibold text-slate-200">{receiptResult.programTarget}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Hash Transaksi Blockchain:</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                    {receiptResult.txHash}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                  <span>Dasar Hukum Pengurang Pajak:</span>
                  <span className="text-emerald-400 font-semibold">{receiptResult.legalReference}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  onClick={() => setReceiptResult(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Tutup & Kembali
                </button>
                <button
                  id="receipt-download-pdf-btn"
                  onClick={() => setActiveTab('report')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Lembar BSZ (PDF Terenkripsi)</span>
                </button>
                <button
                  onClick={() => handleCopyReceipt(JSON.stringify(receiptResult, null, 2))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{copiedReceipt ? 'Tersalin ke Clipboard!' : 'Salin Detail Bukti Setor'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Disbursement Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Form Controls */}
              <div className="lg:col-span-2 space-y-4">
                {/* Step 1: Select Amil Institution */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    1. Pilih Lembaga Amil Zakat Terpercaya (Integrasi API Resmi):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {AMIL_PARTNERS.map((amil) => {
                      const isSelected = selectedAmilId === amil.id;
                      return (
                        <button
                          key={amil.id}
                          type="button"
                          onClick={() => {
                            setSelectedAmilId(amil.id);
                            setSelectedProgram(amil.programs[0]);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500/10 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-lg">{amil.logoIcon}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold">
                              {amil.apiLatency}
                            </span>
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {amil.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {amil.accreditation}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Target Program */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    2. Pilih Alokasi Program Mustahik:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {selectedAmil.programs.map((prog) => (
                      <button
                        key={prog}
                        type="button"
                        onClick={() => setSelectedProgram(prog)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          selectedProgram === prog
                            ? 'border-teal-500 bg-teal-500/10 font-bold text-teal-500'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        {prog}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Amount Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      3. Nominal Penyaluran Zakat:
                    </label>
                    <span className="text-xs text-slate-400">
                      Cadangan Tersedia: <strong className="text-teal-400">{formatIDR(zakatReserveIDR)}</strong>
                    </span>
                  </div>

                  {/* Preset Percentages */}
                  <div className="flex gap-2 mb-2">
                    {[25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleSelectPresetAmount(pct)}
                        className="px-3 py-1.5 rounded-lg border border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 text-teal-400 text-xs font-semibold"
                      >
                        {pct === 100 ? 'Salurkan Seluruhnya (100%)' : `${pct}%`}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    value={disburseAmount || ''}
                    onChange={(e) => setDisburseAmount(Number(e.target.value))}
                    max={zakatReserveIDR}
                    placeholder="Masukkan nominal penyaluran IDR..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
                    }`}
                  />
                </div>

                {/* Step 4: Donor Identity */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    4. Nama Muzakki (Donatur):
                  </label>
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded accent-teal-500"
                      />
                      <span>Salurkan Secara Anonim ("Hamba Allah")</span>
                    </label>
                  </div>
                  {!isAnonymous && (
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Masukkan nama lengkap muzakki untuk bukti setor..."
                      className={`w-full px-4 py-2 rounded-xl border text-xs outline-none ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-slate-100'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
                    {errorMessage}
                  </div>
                )}
              </div>

              {/* Right Col: Niat, Summary & Action */}
              <div
                className={`p-5 rounded-xl border flex flex-col justify-between ${
                  theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-500 block mb-1">
                      Niat Zakat Maal
                    </span>
                    <p className="text-xs font-serif text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى"
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      (Aku berniat mengeluarkan zakat hartaku fardhu karena Allah Ta'ala)
                    </p>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lembaga:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedAmil.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Program:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{selectedProgram}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nominal:</span>
                      <span className="font-black text-teal-400 text-sm">{formatIDR(disburseAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Otorisasi terenkripsi & Bukti Setor Zakat Elektronik resmi diterbitkan seketika.</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    id="submit-zakat-disburse-btn"
                    type="button"
                    onClick={handleExecuteDisbursement}
                    disabled={isSubmitting || disburseAmount <= 0 || zakatReserveIDR <= 0}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Menghubungi API Lembaga Amil...'
                        : `Salurkan ${formatIDR(disburseAmount)} via API`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Monthly Zakat Report & Encrypted PDF Archive */}
      {activeTab === 'report' && (
        <div className="p-5">
          <ZakatMonthlyReportPdfView
            totalPortfolioIDR={totalPortfolioIDR}
            nisabGoldIDR={nisabGold85gIDR}
            zakatReserveIDR={zakatReserveIDR}
            disbursements={reportDisbursements}
            theme={theme}
            language={language}
            onRequestBiometric={onRequestBiometric}
          />
        </div>
      )}
    </div>
  );
};
