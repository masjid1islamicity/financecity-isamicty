import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Scale,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  Info,
  Sliders,
  DollarSign,
  Building2,
  Wallet,
  BadgeAlert,
  HelpCircle,
  HeartHandshake,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { CryptoAsset, Theme, Language } from '../types';
import { formatRupiah, formatRupiahCompact } from '../utils/shariaWealthProjectionEngine';

export interface GoldBenchmark {
  id: string;
  name: string;
  shortName: string;
  source: string;
  pricePerGramIDR: number;
  badge: string;
  description: string;
  isOfficialAgency?: boolean;
}

interface ZakatBenchmarkCalculatorProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR?: number;
  theme: Theme;
  language: Language;
  onOpenDisburse?: (suggestedAmountIDR?: number) => void;
  onUpdateAnnualTarget?: (newTarget: number) => void;
}

export const ZakatBenchmarkCalculator: React.FC<ZakatBenchmarkCalculatorProps> = ({
  assets,
  totalBalanceIDR,
  zakatReserveIDR = 0,
  theme,
  language,
  onOpenDisburse,
  onUpdateAnnualTarget,
}) => {
  // 1. Calculate live PAX Gold LBMA market price per gram
  const paxgAsset = assets.find((a) => a.symbol === 'PAXG');
  const liveMarketPaxgPricePerGram = Math.round(
    (paxgAsset?.priceIDR || 42100000) / 31.1035
  );

  // 2. Predefined Gold Benchmarks for 85g Nisab
  const defaultBenchmarks: GoldBenchmark[] = useMemo(
    () => [
      {
        id: 'paxg_market',
        name: 'Harga Pasar Real-time (PAXG / LBMA)',
        shortName: 'Pasar Real-time',
        source: 'London Bullion Market (LBMA) & PAX Gold',
        pricePerGramIDR: liveMarketPaxgPricePerGram,
        badge: 'Live Crypto Gold',
        description: 'Harga emas murni 99.99% fisik spot internasional yang mendasari token PAXG.',
      },
      {
        id: 'baznas_official',
        name: 'Standar Resmi BAZNAS RI',
        shortName: 'BAZNAS RI',
        source: 'SK Ketua BAZNAS RI No. 1 Tahun 2026',
        pricePerGramIDR: 1385000,
        badge: 'Regulasi Resmi',
        isOfficialAgency: true,
        description: 'Ambang batas nisab resmi yang ditetapkan Badan Amil Zakat Nasional untuk tahun 1447H / 2026M.',
      },
      {
        id: 'antam_boutique',
        name: 'Emas Batangan Logam Mulia ANTAM',
        shortName: 'Antam Butik LM',
        source: 'PT Aneka Tambang Tbk (Butik Emas LM)',
        pricePerGramIDR: 1412000,
        badge: 'Fisik Domestik',
        description: 'Harga acuan emas batangan fisik pecahan 100g Butik Antam Indonesia.',
      },
      {
        id: 'pegadaian_syariah',
        name: 'Pegadaian Syariah / Kemenag RI',
        shortName: 'Pegadaian Syariah',
        source: 'Kementerian Agama & Pegadaian Syariah',
        pricePerGramIDR: 1370000,
        badge: 'BUMN Syariah',
        description: 'Standar penafsiran emas syariah untuk taksiran pembiayaan emas dan zakat maal.',
      },
    ],
    [liveMarketPaxgPricePerGram]
  );

  // Benchmark Selection State
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>('baznas_official');
  const [customPricePerGram, setCustomPricePerGram] = useState<number>(1400000);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Calendar standard: Hijriyah (354 days: 2.5%) vs Masehi (365 days: 2.577% AAOIFI Standard)
  const [calendarStandard, setCalendarStandard] = useState<'hijriyah' | 'masehi'>('hijriyah');

  // Custom Asset Inputs
  const [cryptoAssetsIDR, setCryptoAssetsIDR] = useState<number>(totalBalanceIDR);
  const [cashAndBankIDR, setCashAndBankIDR] = useState<number>(45000000);
  const [goldHoldingsGrams, setGoldHoldingsGrams] = useState<number>(25); // Grams of gold
  const [stocksAndMutualFundsIDR, setStocksAndMutualFundsIDR] = useState<number>(20000000);
  const [businessTradeInventoryIDR, setBusinessTradeInventoryIDR] = useState<number>(15000000);
  const [receivablesCollectableIDR, setReceivablesCollectableIDR] = useState<number>(5000000);
  
  // Deductible immediate liabilities (Hutang jatuh tempo yang harus dibayar segera)
  const [deductibleDebtIDR, setDeductibleDebtIDR] = useState<number>(10000000);
  const [includeDebtDeduction, setIncludeDebtDeduction] = useState<boolean>(true);

  // Optional extra Infaq/Sedekah
  const [extraInfaqPercent, setExtraInfaqPercent] = useState<number>(0);

  // UI helpers
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showFiqhReference, setShowFiqhReference] = useState<boolean>(false);
  const [targetSaveSuccess, setTargetSaveSuccess] = useState<boolean>(false);

  // Resolve active gold price
  const activeBenchmark = defaultBenchmarks.find((b) => b.id === selectedBenchmarkId) || defaultBenchmarks[0];
  const activeGoldPricePerGram = isCustomMode ? customPricePerGram : activeBenchmark.pricePerGramIDR;

  // Nisab threshold: exactly 85 grams of gold
  const nisabGold85gIDR = activeGoldPricePerGram * 85;

  // Gold holding in IDR based on active benchmark price
  const goldValueIDR = goldHoldingsGrams * activeGoldPricePerGram;

  // Total Gross Wealth
  const totalGrossAssetsIDR =
    cryptoAssetsIDR +
    cashAndBankIDR +
    goldValueIDR +
    stocksAndMutualFundsIDR +
    businessTradeInventoryIDR +
    receivablesCollectableIDR;

  // Deductions
  const activeDebtDeductionIDR = includeDebtDeduction ? Math.max(0, deductibleDebtIDR) : 0;

  // Net Zakatable Wealth
  const netZakatableWealthIDR = Math.max(0, totalGrossAssetsIDR - activeDebtDeductionIDR);

  // Nisab obligation check
  const isNisabReached = netZakatableWealthIDR >= nisabGold85gIDR;
  const nisabProgressPercent = Math.min(
    500,
    Math.round((netZakatableWealthIDR / (nisabGold85gIDR || 1)) * 100)
  );

  // Zakat Rate: Hijriyah (2.5%) vs Masehi AAOIFI (2.577%) + optional infaq
  const baseRatePercent = calendarStandard === 'hijriyah' ? 2.5 : 2.577;
  const effectiveRatePercent = baseRatePercent + extraInfaqPercent;

  // Calculated Zakat Due
  const calculatedZakatDueIDR = isNisabReached
    ? Math.round(netZakatableWealthIDR * (effectiveRatePercent / 100))
    : 0;

  const baseZakatOnlyIDR = isNisabReached
    ? Math.round(netZakatableWealthIDR * (baseRatePercent / 100))
    : 0;

  const extraInfaqOnlyIDR = isNisabReached
    ? Math.round(netZakatableWealthIDR * (extraInfaqPercent / 100))
    : 0;

  // Quick preset handlers
  const handleLoadCurrentPortfolio = () => {
    setCryptoAssetsIDR(totalBalanceIDR);
  };

  const handleResetToZero = () => {
    setCryptoAssetsIDR(0);
    setCashAndBankIDR(0);
    setGoldHoldingsGrams(0);
    setStocksAndMutualFundsIDR(0);
    setBusinessTradeInventoryIDR(0);
    setReceivablesCollectableIDR(0);
    setDeductibleDebtIDR(0);
  };

  const handleApplyPresetProfile = (preset: 'balanced' | 'crypto_focused' | 'merchant') => {
    if (preset === 'balanced') {
      setCryptoAssetsIDR(totalBalanceIDR);
      setCashAndBankIDR(35000000);
      setGoldHoldingsGrams(20);
      setStocksAndMutualFundsIDR(25000000);
      setBusinessTradeInventoryIDR(0);
      setReceivablesCollectableIDR(0);
      setDeductibleDebtIDR(5000000);
    } else if (preset === 'crypto_focused') {
      setCryptoAssetsIDR(totalBalanceIDR * 1.25);
      setCashAndBankIDR(15000000);
      setGoldHoldingsGrams(10);
      setStocksAndMutualFundsIDR(0);
      setBusinessTradeInventoryIDR(0);
      setReceivablesCollectableIDR(0);
      setDeductibleDebtIDR(0);
    } else if (preset === 'merchant') {
      setCryptoAssetsIDR(50000000);
      setCashAndBankIDR(60000000);
      setGoldHoldingsGrams(15);
      setStocksAndMutualFundsIDR(10000000);
      setBusinessTradeInventoryIDR(85000000);
      setReceivablesCollectableIDR(20000000);
      setDeductibleDebtIDR(25000000);
    }
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const summaryText = `[RINGKASAN KALKULATOR ZAKAT MAAL - AMBANG BATAS 85g]
Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
Acuan Emas: ${isCustomMode ? 'Kustom Pengguna' : activeBenchmark.name}
Harga Emas/Gram: ${formatRupiah(activeGoldPricePerGram)}/g
Ambang Nisab 85g: ${formatRupiah(nisabGold85gIDR)}

--- RINCIAN HARTA WAJIB ZAKAT ---
1. Aset Kripto & Token: ${formatRupiah(cryptoAssetsIDR)}
2. Tabungan Kas & Bank: ${formatRupiah(cashAndBankIDR)}
3. Emas Logam Mulia (${goldHoldingsGrams}g): ${formatRupiah(goldValueIDR)}
4. Saham Syariah & Sukuk: ${formatRupiah(stocksAndMutualFundsIDR)}
5. Modal Dagang & Stok UMKM: ${formatRupiah(businessTradeInventoryIDR)}
6. Piutang Lancar: ${formatRupiah(receivablesCollectableIDR)}
Total Bruto Harta: ${formatRupiah(totalGrossAssetsIDR)}
Hutang Jatuh Tempo: -${formatRupiah(activeDebtDeductionIDR)}
---------------------------------
Total Harta Bersih: ${formatRupiah(netZakatableWealthIDR)}
Status Nisab: ${isNisabReached ? `MEMENUHI NISAB (${nisabProgressPercent}%)` : `BELUM MENCAPAI NISAB (${nisabProgressPercent}%)`}
Standar Haul: ${calendarStandard === 'hijriyah' ? 'Tahun Hijriyah (2.5%)' : 'Tahun Masehi AAOIFI (2.577%)'}
${extraInfaqPercent > 0 ? `Infaq Tambahan: +${extraInfaqPercent}% (${formatRupiah(extraInfaqOnlyIDR)})` : ''}

KEWAJIBAN ZAKAT MAAL: ${isNisabReached ? formatRupiah(calculatedZakatDueIDR) : 'Rp 0 (Belum Wajib)'}
Disusun via FinanceCity Sharia Engine (Fatwa DSN-MUI & BAZNAS RI)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Save to Annual Target
  const handleSaveAsAnnualTarget = () => {
    if (onUpdateAnnualTarget && calculatedZakatDueIDR > 0) {
      onUpdateAnnualTarget(calculatedZakatDueIDR);
      setTargetSaveSuccess(true);
      setTimeout(() => setTargetSaveSuccess(false), 3000);
    }
  };

  return (
    <div
      id="zakat-benchmark-calculator-section"
      className={`p-5 sm:p-7 rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5 text-amber-400" />
            </span>
            <h3 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Kalkulator Zakat Maal & Ambang Nisab 85g Emas
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Multi-Benchmark Fiqh
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            Hitung kewajiban Zakat Maal secara akurat berdasarkan ambang batas 85 gram emas murni.
            Pilih berbagai acuan harga emas resmi (BAZNAS RI, Antam, Pegadaian, PAXG) atau tetapkan acuan kustom.
          </p>
        </div>

        {/* Quick Profile Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-semibold mr-1 hidden sm:inline">Preset:</span>
          <button
            onClick={() => handleApplyPresetProfile('balanced')}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            Seimbang
          </button>
          <button
            onClick={() => handleApplyPresetProfile('crypto_focused')}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all"
          >
            Kripto Murni
          </button>
          <button
            onClick={() => handleApplyPresetProfile('merchant')}
            className="px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all"
          >
            Perniagaan / UMKM
          </button>
          <button
            onClick={handleResetToZero}
            className="px-2.5 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-semibold flex items-center gap-1 transition-all"
            title="Reset semua nilai harta ke nol"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Benchmark Selection Cards */}
      <div className="my-5 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Pilih Acuan Tolok Ukur Harga Emas (Ambang Batas Nisab 85g)</span>
          </label>
          <span className="text-[11px] text-amber-400/90 font-medium">
            Nisab 85g = 85 × Harga Emas Terpilih
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {defaultBenchmarks.map((b) => {
            const isSelected = !isCustomMode && selectedBenchmarkId === b.id;
            const bNisab = b.pricePerGramIDR * 85;

            return (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedBenchmarkId(b.id);
                  setIsCustomMode(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      b.isOfficialAgency
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {b.badge}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{b.shortName}</h4>
                  <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                    {formatRupiah(b.pricePerGramIDR)}
                    <span className="text-[10px] font-normal text-slate-400">/gram</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between border-t border-slate-800/80 pt-1.5">
                    <span>Nisab 85g:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {formatRupiahCompact(bNisab)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Benchmark Toggle */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isCustomMode
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gunakan Harga Emas Kustom</span>
            </button>
            {isCustomMode && (
              <span className="text-amber-400 text-xs font-mono">
                Aktif: {formatRupiah(customPricePerGram)}/g (Nisab: {formatRupiahCompact(customPricePerGram * 85)})
              </span>
            )}
          </div>

          {/* Calendar Standard Selector */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2 font-semibold uppercase">Tahun Acuan:</span>
            <button
              onClick={() => setCalendarStandard('hijriyah')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarStandard === 'hijriyah'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="354 hari: Tarif zakat 2.5% standar Jumhur Ulama"
            >
              Hijriyah (2.5%)
            </button>
            <button
              onClick={() => setCalendarStandard('masehi')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                calendarStandard === 'masehi'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="365 hari: Tarif zakat 2.577% standar AAOIFI Sharia No. 35"
            >
              Masehi (2.577% AAOIFI)
            </button>
          </div>
        </div>

        {/* Custom Price Slider Drawer */}
        {isCustomMode && (
          <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/5 mt-2 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Input Harga Emas Kustom per Gram (Rp):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={500000}
                  max={3000000}
                  step={10000}
                  value={customPricePerGram}
                  onChange={(e) => setCustomPricePerGram(Math.max(0, Number(e.target.value)))}
                  className="w-40 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-right font-mono text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                />
                <span className="text-xs text-slate-400">IDR/g</span>
              </div>
            </div>
            <input
              type="range"
              min={1000000}
              max={2000000}
              step={10000}
              value={customPricePerGram}
              onChange={(e) => setCustomPricePerGram(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        )}
      </div>

      {/* Main Grid: Inputs Left vs Calculation Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        {/* Left Column: Asset Inputs Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Komponen Harta Zakatable (Telah Genap Haul 1 Tahun)</span>
            </h4>
            <button
              onClick={handleLoadCurrentPortfolio}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>Isi dari Portofolio Aktif</span>
              <span>✨</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* Input 1: Crypto Assets */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Aset Kripto & Saldo Token Halal
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatRupiahCompact(cryptoAssetsIDR)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={cryptoAssetsIDR}
                  onChange={(e) => setCryptoAssetsIDR(Math.max(0, Number(e.target.value)))}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setCryptoAssetsIDR((prev) => prev + 10000000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white text-[11px] font-semibold transition-colors"
                >
                  +10 Jt
                </button>
              </div>
            </div>

            {/* Input 2: Cash & Bank Savings */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Uang Tunai, Rekening Bank & Deposito Syariah
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatRupiahCompact(cashAndBankIDR)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={cashAndBankIDR}
                  onChange={(e) => setCashAndBankIDR(Math.max(0, Number(e.target.value)))}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setCashAndBankIDR((prev) => prev + 10000000)}
                  className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white text-[11px] font-semibold transition-colors"
                >
                  +10 Jt
                </button>
              </div>
            </div>

            {/* Input 3: Gold Holdings in Grams */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Emas Batangan & Logam Mulia (PAXG / Fisik)
                </span>
                <span className="text-[11px] text-amber-400 font-mono">
                  {goldHoldingsGrams} gram ≈ {formatRupiahCompact(goldValueIDR)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={goldHoldingsGrams}
                    onChange={(e) => setGoldHoldingsGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 pr-14 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-semibold">
                    gram
                  </span>
                </div>
                <button
                  onClick={() => setGoldHoldingsGrams((prev) => prev + 10)}
                  className="px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 text-[11px] font-semibold transition-colors"
                >
                  +10g
                </button>
              </div>
            </div>

            {/* Input 4: Stocks & Sukuk */}
            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Saham Syariah, Sukuk Negara & Reksadana
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatRupiahCompact(stocksAndMutualFundsIDR)}
                </span>
              </div>
              <input
                type="number"
                min={0}
                step={1000000}
                value={stocksAndMutualFundsIDR}
                onChange={(e) => setStocksAndMutualFundsIDR(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Input 5: Business Inventory & Receivables */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1">
                <span className="text-xs font-semibold text-slate-300 block">
                  Modal Dagang / Stok Usaha UMKM
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={businessTradeInventoryIDR}
                  onChange={(e) => setBusinessTradeInventoryIDR(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 space-y-1">
                <span className="text-xs font-semibold text-slate-300 block">
                  Piutang Lancar Dapat Ditagih
                </span>
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={receivablesCollectableIDR}
                  onChange={(e) => setReceivablesCollectableIDR(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Deductible Debt Section */}
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Hutang Jatuh Tempo / Beban Segera (Pengurang Zakat)</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDebtDeduction}
                      onChange={(e) => setIncludeDebtDeduction(e.target.checked)}
                      className="rounded accent-red-500 cursor-pointer"
                    />
                    <span>Terapkan Pengurang</span>
                  </label>
                </div>
              </div>
              <input
                type="number"
                min={0}
                step={500000}
                disabled={!includeDebtDeduction}
                value={deductibleDebtIDR}
                onChange={(e) => setDeductibleDebtIDR(Math.max(0, Number(e.target.value)))}
                className={`w-full px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-900 text-right font-mono text-xs font-bold text-red-400 focus:outline-none ${
                  includeDebtDeduction
                    ? 'border-red-500/40 focus:border-red-400'
                    : 'border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-slate-400 italic">
                *Berdasarkan Fatwa MUI No. 3/2003 & Standar AAOIFI: Hutang jangka pendek yang jatuh tempo pada tahun berjalan mengurangi total harta wajib zakat.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Calculation Summary & Nisab Gauge (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-4 shadow-sm">
            {/* Nisab Status Hero Badge */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isNisabReached
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-amber-500/50 bg-amber-500/15 text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isNisabReached ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
                )}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider">
                    {isNisabReached ? 'Wajib Zakat Maal' : 'Belum Mencapai Nisab'}
                  </h5>
                  <p className="text-[11px] text-slate-300">
                    {isNisabReached
                      ? `Harta bersih melampaui tolok ukur 85g emas (${nisabProgressPercent}%).`
                      : `Kurang ${formatRupiahCompact(
                          Math.max(0, nisabGold85gIDR - netZakatableWealthIDR)
                        )} untuk mencapai batas 85g.`}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-black px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-800">
                {nisabProgressPercent}%
              </span>
            </div>

            {/* Nisab Progress Bar Visual */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Harta Bersih: {formatRupiahCompact(netZakatableWealthIDR)}</span>
                <span className="font-semibold text-amber-400">
                  Nisab 85g: {formatRupiahCompact(nisabGold85gIDR)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    isNisabReached ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, nisabProgressPercent)}%` }}
                />
                {/* 100% Nisab Marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xs"
                  style={{ left: '100%', transform: 'translateX(-100%)' }}
                  title="Ambang Batas Nisab 85g"
                />
              </div>
            </div>

            {/* Financial Breakdown Table */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Bruto Harta:</span>
                <span className="font-mono text-slate-200">{formatRupiah(totalGrossAssetsIDR)}</span>
              </div>
              {includeDebtDeduction && activeDebtDeductionIDR > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Hutang Pengurang:</span>
                  <span className="font-mono">-{formatRupiah(activeDebtDeductionIDR)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-200 border-t border-slate-800 pt-1.5">
                <span>Harta Bersih Kena Zakat:</span>
                <span className="font-mono text-emerald-400">{formatRupiah(netZakatableWealthIDR)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ambang Nisab 85g ({activeBenchmark.shortName}):</span>
                <span className="font-mono text-amber-400">{formatRupiah(nisabGold85gIDR)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tarif Berlaku:</span>
                <span className="font-semibold text-slate-300">
                  {effectiveRatePercent}% ({calendarStandard === 'hijriyah' ? 'Hijriyah' : 'Masehi AAOIFI'})
                </span>
              </div>
            </div>

            {/* Calculated Zakat Obligation Display */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                Total Kewajiban Zakat Maal
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {isNisabReached ? formatRupiah(calculatedZakatDueIDR) : 'Rp 0'}
              </div>
              <span className="text-[11px] text-slate-400 block">
                {isNisabReached
                  ? `Setara ${formatRupiahCompact(baseZakatOnlyIDR)} zakat wajib${
                      extraInfaqOnlyIDR > 0 ? ` + ${formatRupiahCompact(extraInfaqOnlyIDR)} infaq` : ''
                    }`
                  : 'Belum ada kewajiban Zakat Maal karena belum melampaui Nisab 85g.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                id="zakat-benchmark-disburse-btn"
                disabled={!isNisabReached}
                onClick={() => {
                  if (onOpenDisburse) {
                    onOpenDisburse(calculatedZakatDueIDR);
                  }
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isNisabReached
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Salurkan Zakat via API BAZNAS</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopySummary}
                  className="py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Salin Rincian</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveAsAnnualTarget}
                  disabled={!isNisabReached}
                  className={`py-2 px-3 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                    isNisabReached
                      ? targetSaveSuccess
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20'
                      : 'border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {targetSaveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Set Target</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Cross-Comparison Table */}
      <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Tabel Perbandingan Kewajiban Zakat Antar-Acuan Harga Emas (85g)
            </h4>
          </div>
          <button
            onClick={() => setShowFiqhReference(!showFiqhReference)}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
          >
            <span>Dalil & Rujukan Fiqh Nisab</span>
            {showFiqhReference ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Lembaga / Acuan Tolok Ukur</th>
                <th className="py-2.5 px-3">Harga/Gram</th>
                <th className="py-2.5 px-3">Nisab 85g Emas</th>
                <th className="py-2.5 px-3">Status Kepatuhan</th>
                <th className="py-2.5 px-3 text-right">Kewajiban Zakat (2.5%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {defaultBenchmarks.map((b) => {
                const bNisab = b.pricePerGramIDR * 85;
                const bReached = netZakatableWealthIDR >= bNisab;
                const bDue = bReached ? Math.round(netZakatableWealthIDR * (effectiveRatePercent / 100)) : 0;
                const isCurrentActive = !isCustomMode && selectedBenchmarkId === b.id;

                return (
                  <tr
                    key={b.id}
                    onClick={() => {
                      setSelectedBenchmarkId(b.id);
                      setIsCustomMode(false);
                    }}
                    className={`cursor-pointer transition-colors ${
                      isCurrentActive
                        ? 'bg-amber-500/10 font-bold text-amber-300'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-medium flex items-center gap-1.5">
                      {isCurrentActive && <span className="text-amber-400 font-bold">▶</span>}
                      <span>{b.name}</span>
                    </td>
                    <td className="py-2.5 px-3">{formatRupiah(b.pricePerGramIDR)}</td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">{formatRupiah(bNisab)}</td>
                    <td className="py-2.5 px-3 font-sans">
                      {bReached ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Wajib Zakat Maal
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                          Belum Mencapai
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {bReached ? formatRupiah(bDue) : 'Rp 0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Fiqh Accordion Reference */}
        {showFiqhReference && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-slate-300 space-y-2 mt-3">
            <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Dasar Hukum Syariah Ambang Batas 85 Gram Emas</span>
            </h5>
            <p className="leading-relaxed text-slate-300">
              <strong>Hadits Rasulullah SAW:</strong> <em>&quot;Tidak ada kewajiban atasmu sesuatu pun (dalam emas) sampai engkau memiliki 20 dinar. Apabila engkau telah memiliki 20 dinar dan telah berlalu masa satu tahun (haul), maka zakatnya adalah setengah dinar (2.5%).&quot;</em> (HR. Abu Dawud No. 1573). Berdasarkan timbangan mitsqal murni, 20 Dinar setara dengan <strong>85 gram emas murni 24 karat (99.99%)</strong>.
            </p>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              <strong>Ketetapan Fatwa DSN-MUI & BAZNAS RI:</strong> Berdasarkan Fatwa MUI No. 3 Tahun 2003 tentang Zakat Penghasilan dan Pedoman Teknis BAZNAS RI, harta simpanan dan investasi finansial (termasuk emas fisik, tabungan, saham syariah, dan portofolio kripto halal) diqiyaskan pada nisab emas 85 gram dengan tarif zakat 2.5% per tahun haul Hijriyah (atau 2.577% per tahun Masehi menurut Standar AAOIFI No. 35).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
