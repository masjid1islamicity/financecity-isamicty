import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Coins,
  Scale,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wallet,
  Banknote,
  Building2,
  Copy,
  RotateCcw,
  Info,
  HelpCircle,
  HeartHandshake,
  BookOpen,
  PieChart,
  Sliders,
  Check,
} from 'lucide-react';
import { Theme, Language } from '../types';

interface ZakatHoldingsCalculatorProps {
  paxgPriceIDR?: number; // e.g. ~42.100.000 / oz (~1.353.500 / gram)
  userPortfolioBalanceIDR?: number;
  theme: Theme;
  language: Language;
  onNavigateToDisburse?: (amountIDR: number) => void;
  onNavigateToProjection?: () => void;
}

export const ZakatHoldingsCalculator: React.FC<ZakatHoldingsCalculatorProps> = ({
  paxgPriceIDR = 42100000,
  userPortfolioBalanceIDR = 148500000,
  theme,
  language,
  onNavigateToDisburse,
  onNavigateToProjection,
}) => {
  // Live calculated gold price per gram (from PAX Gold)
  const defaultGoldPricePerGram = Math.round(paxgPriceIDR / 31.1035);

  // Gold Inputs
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(88); // 88 grams default
  const [unwornJewelryGrams, setUnwornJewelryGrams] = useState<number>(0);
  const [wornJewelryGrams, setWornJewelryGrams] = useState<number>(15); // exempt under standard fiqh
  const [customGoldPrice, setCustomGoldPrice] = useState<number>(defaultGoldPricePerGram);
  const [useCustomGoldPrice, setUseCustomGoldPrice] = useState<boolean>(false);

  // Cash & Liquid Savings Inputs
  const [bankSavingsIDR, setBankSavingsIDR] = useState<number>(45000000);
  const [cashOnHandIDR, setCashOnHandIDR] = useState<number>(5000000);
  const [stablecoinsDepositsIDR, setStablecoinsDepositsIDR] = useState<number>(15000000);

  // Investment & Business Holdings Inputs
  const [cryptoTradingIDR, setCryptoTradingIDR] = useState<number>(65000000);
  const [shariaStocksMutualFundsIDR, setShariaStocksMutualFundsIDR] = useState<number>(20000000);
  const [businessInventoryIDR, setBusinessInventoryIDR] = useState<number>(0);
  const [receivablesCollectableIDR, setReceivablesCollectableIDR] = useState<number>(0);

  // Liabilities / Immediate Debt Deductible
  const [deductibleDebtIDR, setDeductibleDebtIDR] = useState<number>(10000000);
  const [includeDebtDeduction, setIncludeDebtDeduction] = useState<boolean>(true);

  // Feedback states
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showFiqhGuide, setShowFiqhGuide] = useState<boolean>(false);

  // Effective gold price
  const activeGoldPrice = useCustomGoldPrice ? customGoldPrice : defaultGoldPricePerGram;

  // Nisab threshold: 85 grams of pure gold
  const nisabGold85gIDR = activeGoldPrice * 85;

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // 1. Calculate Category Totals
  const totalZakatableGoldGrams = Math.max(0, goldWeightGrams + unwornJewelryGrams);
  const totalGoldValueIDR = totalZakatableGoldGrams * activeGoldPrice;

  const totalCashIDR = Math.max(0, bankSavingsIDR + cashOnHandIDR + stablecoinsDepositsIDR);

  const totalInvestmentIDR = Math.max(
    0,
    cryptoTradingIDR + shariaStocksMutualFundsIDR + businessInventoryIDR + receivablesCollectableIDR
  );

  const totalGrossWealthIDR = totalGoldValueIDR + totalCashIDR + totalInvestmentIDR;

  const effectiveDebtDeductionIDR = includeDebtDeduction ? Math.max(0, deductibleDebtIDR) : 0;
  const totalNetZakatableWealthIDR = Math.max(0, totalGrossWealthIDR - effectiveDebtDeductionIDR);

  // 2. Nisab Evaluation
  const isNisabReached = totalNetZakatableWealthIDR >= nisabGold85gIDR;
  const zakatObligationIDR = isNisabReached ? Math.round(totalNetZakatableWealthIDR * 0.025) : 0;
  const monthlyInstallmentIDR = Math.round(zakatObligationIDR / 12);
  const dailyZakatReserveIDR = Math.round(zakatObligationIDR / 365);

  const deficitToNisabIDR = Math.max(0, nisabGold85gIDR - totalNetZakatableWealthIDR);
  const deficitGoldGrams = (deficitToNisabIDR / activeGoldPrice).toFixed(1);

  const nisabProgressPercent = Math.min(
    250,
    Math.round((totalNetZakatableWealthIDR / (nisabGold85gIDR || 1)) * 100)
  );

  // 3. Asset Composition Percentages
  const goldPercent = totalGrossWealthIDR > 0 ? Math.round((totalGoldValueIDR / totalGrossWealthIDR) * 100) : 0;
  const cashPercent = totalGrossWealthIDR > 0 ? Math.round((totalCashIDR / totalGrossWealthIDR) * 100) : 0;
  const investPercent = totalGrossWealthIDR > 0 ? Math.max(0, 100 - goldPercent - cashPercent) : 0;

  // Preset Handlers
  const handleLoadAppPortfolio = () => {
    // 35g gold from app holding, cash reserve, and trading balance
    setGoldWeightGrams(45);
    setUnwornJewelryGrams(0);
    setWornJewelryGrams(10);
    setBankSavingsIDR(35000000);
    setCashOnHandIDR(5000000);
    setStablecoinsDepositsIDR(15000000);
    setCryptoTradingIDR(userPortfolioBalanceIDR > 0 ? userPortfolioBalanceIDR : 85000000);
    setShariaStocksMutualFundsIDR(15000000);
    setBusinessInventoryIDR(0);
    setReceivablesCollectableIDR(0);
    setDeductibleDebtIDR(5000000);
  };

  const handlePresetGoldSaver = () => {
    setGoldWeightGrams(95); // above 85g nisab
    setUnwornJewelryGrams(10);
    setWornJewelryGrams(20);
    setBankSavingsIDR(25000000);
    setCashOnHandIDR(3000000);
    setStablecoinsDepositsIDR(0);
    setCryptoTradingIDR(0);
    setShariaStocksMutualFundsIDR(0);
    setBusinessInventoryIDR(0);
    setReceivablesCollectableIDR(0);
    setDeductibleDebtIDR(0);
  };

  const handlePresetTraderBusiness = () => {
    setGoldWeightGrams(20);
    setUnwornJewelryGrams(0);
    setWornJewelryGrams(5);
    setBankSavingsIDR(60000000);
    setCashOnHandIDR(10000000);
    setStablecoinsDepositsIDR(25000000);
    setCryptoTradingIDR(140000000);
    setShariaStocksMutualFundsIDR(30000000);
    setBusinessInventoryIDR(50000000);
    setReceivablesCollectableIDR(15000000);
    setDeductibleDebtIDR(20000000);
  };

  const handleReset = () => {
    setGoldWeightGrams(0);
    setUnwornJewelryGrams(0);
    setWornJewelryGrams(0);
    setBankSavingsIDR(0);
    setCashOnHandIDR(0);
    setStablecoinsDepositsIDR(0);
    setCryptoTradingIDR(0);
    setShariaStocksMutualFundsIDR(0);
    setBusinessInventoryIDR(0);
    setReceivablesCollectableIDR(0);
    setDeductibleDebtIDR(0);
  };

  // Copy Calculation Summary
  const handleCopySummary = () => {
    const text = `=== RINGKASAN KALKULATOR ZAKAT MAAL (FINANCECITY) ===
Tanggal: ${new Date().toLocaleDateString('id-ID')}
Harga Emas Referensi: ${formatIDR(activeGoldPrice)} / gram
Ambang Batas Nisab (85g Emas): ${formatIDR(nisabGold85gIDR)}

[RINCIAN KEKAYAAN]
1. Emas & Logam Mulia (${totalZakatableGoldGrams} gram): ${formatIDR(totalGoldValueIDR)}
2. Uang Kas & Tabungan: ${formatIDR(totalCashIDR)}
3. Investasi & Perdagangan Komersial: ${formatIDR(totalInvestmentIDR)}
--------------------------------------------------
Total Harta Kotor: ${formatIDR(totalGrossWealthIDR)}
Pengurang Hutang Jatuh Tempo: -${formatIDR(effectiveDebtDeductionIDR)}
==================================================
Total Harta Bersih Wajib Zakat: ${formatIDR(totalNetZakatableWealthIDR)}
Status Nisab: ${isNisabReached ? 'WAJIB ZAKAT (Mencapai Batas 85g Emas)' : 'BELUM WAJIB ZAKAT (Di Bawah Nisab)'}
Kewajiban Zakat Maal (2.5%): ${formatIDR(zakatObligationIDR)}
Opsi Cicilan Zakat Bulanan: ${formatIDR(monthlyInstallmentIDR)} / bulan
Opsi Pencadangan Harian: ${formatIDR(dailyZakatReserveIDR)} / hari

Dasar Hukum: QS. At-Taubah: 103, Fatwa MUI No. 3/2003, Standar AAOIFI No. 57.`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Nisab Reference & Gold Price */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border-teal-500/30'
            : 'bg-gradient-to-r from-teal-50/80 via-emerald-50/60 to-amber-50/60 border-teal-200'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Kalkulator Zakat Maal Interaktif (Emas, Kas & Investasi)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Standar DSN-MUI & BAZNAS RI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Hitung kewajiban zakat 2.5% secara presisi dengan menggabungkan kepemilikan emas murni, saldo kas/tabungan likuid, dan portofolio investasi terhadap ambang batas nisab 85 gram emas.
              </p>
            </div>
          </div>

          {/* Live Nisab Reference Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-4 shrink-0 ${
              theme === 'dark'
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
                Batas Nisab Terkini (85g Emas)
              </span>
              <span className="text-lg font-black text-amber-500 font-mono">
                {formatIDR(nisabGold85gIDR)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Basis: {formatIDR(activeGoldPrice)} / gram
              </span>
            </div>

            <div className="border-l border-slate-200 dark:border-slate-800 pl-3 space-y-1 text-right">
              <button
                onClick={() => setUseCustomGoldPrice(!useCustomGoldPrice)}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 underline block"
              >
                {useCustomGoldPrice ? 'Gunakan Harga Pasar' : 'Ubah Harga Emas'}
              </button>
              <button
                onClick={() => setShowFiqhGuide(!showFiqhGuide)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 justify-end"
              >
                <BookOpen className="w-3 h-3" />
                <span>Panduan Fiqih</span>
              </button>
            </div>
          </div>
        </div>

        {/* Custom Gold Price Input Field (Conditional) */}
        {useCustomGoldPrice && (
          <div className="mt-3 pt-3 border-t border-teal-500/20 flex flex-wrap items-center gap-3 text-xs animate-fadeIn">
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              Kustomisasi Harga Emas Murni per Gram (IDR):
            </span>
            <input
              type="number"
              value={customGoldPrice}
              onChange={(e) => setCustomGoldPrice(Math.max(100000, Number(e.target.value)))}
              className="px-3 py-1.5 rounded-lg border border-teal-500/40 bg-slate-900 text-white font-mono text-xs w-40 focus:outline-teal-500"
            />
            <span className="text-[11px] text-slate-400">
              (Nisab otomatis terhitung: 85 × {formatIDR(customGoldPrice)})
            </span>
            <button
              onClick={() => {
                setCustomGoldPrice(defaultGoldPricePerGram);
                setUseCustomGoldPrice(false);
              }}
              className="text-[11px] text-teal-400 hover:underline ml-auto"
            >
              Reset ke Harga Pasar (~{formatIDR(defaultGoldPricePerGram)}/g)
            </button>
          </div>
        )}
      </div>

      {/* Preset Action Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold text-[11px] mr-1">Muat Contoh:</span>
          <button
            id="preset-load-app-portfolio-btn"
            onClick={handleLoadAppPortfolio}
            className="px-3 py-1.5 rounded-lg border border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-semibold transition-all flex items-center gap-1.5"
            title="Muat data aset Anda dari portofolio FinanceCity"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Portofolio Saya Saat Ini</span>
          </button>
          <button
            id="preset-gold-saver-btn"
            onClick={handlePresetGoldSaver}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all"
          >
            Investor Emas & Tabungan (Nisab Terpenuhi)
          </button>
          <button
            id="preset-trader-business-btn"
            onClick={handlePresetTraderBusiness}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all"
          >
            Pebisnis & Trader Kripto
          </button>
        </div>

        <button
          onClick={handleReset}
          className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] font-semibold transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Semua</span>
        </button>
      </div>

      {/* Collapsible Fiqh Reference Guide */}
      {showFiqhGuide && (
        <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/5 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-400 flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Ketentuan Fiqih Zakat Maal (DSN-MUI & BAZNAS)
            </span>
            <button
              onClick={() => setShowFiqhGuide(false)}
              className="text-slate-400 hover:text-slate-200 text-[11px]"
            >
              Tutup
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            1. <strong>Nisab Emas 85 Gram</strong>: Standar minimal kekayaan wajib zakat maal adalah setara nilai 85 gram emas murni (24 karat) yang telah dimiliki atau berputar selama 1 tahun (haul).
          </p>
          <p className="text-slate-300 leading-relaxed">
            2. <strong>Emas Perhiasan</strong>: Emas perhiasan wanita yang dipakai secara wajar dalam keseharian dibebaskan dari zakat. Namun emas batangan, koin, tabungan emas digital, atau perhiasan berlebih yang disimpan untuk investasi wajib dizakati.
          </p>
          <p className="text-slate-300 leading-relaxed">
            3. <strong>Uang Kas & Investasi</strong>: Seluruh saldo rekening, uang tunai, reksa dana, saham, dan portofolio trading syariah digabungkan nilai likuidnya (*al-amwal az-zakawiyyah*).
          </p>
          <p className="text-slate-300 leading-relaxed">
            4. <strong>Pengurang Hutang</strong>: Hutang jatuh tempo yang wajib dibayar dalam waktu dekat sebelum haul diperbolehkan untuk dikurangkan dari total kekayaan kotor.
          </p>
        </div>
      )}

      {/* Main 2-Column Layout: Inputs (Left) and Results / Calculation Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Gold Holdings */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    1. Kepemilikan Emas & Logam Mulia
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Emas batangan Antam, PAXG digital, atau koin simpanan
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-amber-500 font-mono">
                {formatIDR(totalGoldValueIDR)}
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Gold Weight Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-600 dark:text-slate-300 font-medium">
                    Emas Batangan / Investasi / PAXG (gram):
                  </label>
                  <span className="font-bold text-amber-400 font-mono">{goldWeightGrams} gram</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={goldWeightGrams}
                    onChange={(e) => setGoldWeightGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-teal-500"
                  />
                  {/* Quick Addition Chips */}
                  <div className="flex items-center gap-1 shrink-0">
                    {[10, 25, 85].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoldWeightGrams((prev) => prev + g)}
                        className="px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/20 transition-all"
                      >
                        +{g}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unworn Jewelry vs Worn Jewelry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Emas Perhiasan Simpanan / Tidak Dipakai (gram):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={unwornJewelryGrams}
                    onChange={(e) => setUnwornJewelryGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                    placeholder="0"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Wajib dizakati (masuk hitungan)</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Perhiasan yang Dipakai Rutin (gram):
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={wornJewelryGrams}
                    onChange={(e) => setWornJewelryGrams(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-xs focus:outline-teal-500"
                    placeholder="15"
                  />
                  <span className="text-[9px] text-emerald-400 mt-0.5 block">
                    Bebas zakat (Fiqh perhiasan halal)
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Berat Emas Terkena Zakat:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {totalZakatableGoldGrams} gram = {formatIDR(totalGoldValueIDR)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Cash & Liquid Savings */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    2. Uang Kas, Tabungan & Rekening Likuid
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Saldo bank, tunai, e-wallet, dan deposito cair
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-teal-400 font-mono">
                {formatIDR(totalCashIDR)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">
                  Saldo Tabungan Bank Syariah / Konvensional (IDR):
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={bankSavingsIDR}
                  onChange={(e) => setBankSavingsIDR(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Uang Tunai (Cash) & Dompet Digital:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500000}
                    value={cashOnHandIDR}
                    onChange={(e) => setCashOnHandIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Deposito Likuid / Stablecoin (USDT/IDRT):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={stablecoinsDepositsIDR}
                    onChange={(e) => setStablecoinsDepositsIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Investment & Commercial Holdings */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    3. Portofolio Investasi & Perdagangan Komersial
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Trading kripto, saham syariah, sukuk, modal kerja dagang
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {formatIDR(totalInvestmentIDR)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">
                    Portofolio Trading Kripto / Saham Syariah:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={cryptoTradingIDR}
                    onChange={(e) => setCryptoTradingIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 dark:text-slate-300 block mb-1">
                    Reksadana Syariah & Sukuk:
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={shariaStocksMutualFundsIDR}
                    onChange={(e) => setShariaStocksMutualFundsIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Stok Barang Dagang / Usaha (Urudh at-Tijarah):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={businessInventoryIDR}
                    onChange={(e) => setBusinessInventoryIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Piutang Lancar yang Pasti Cair (IDR):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={receivablesCollectableIDR}
                    onChange={(e) => setReceivablesCollectableIDR(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-teal-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Deductible Immediate Liabilities */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    4. Pengurang: Hutang Jatuh Tempo
                  </h5>
                  <span className="text-[10px] text-slate-400">
                    Hutang jangka pendek yang wajib dilunasi saat masa haul
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeDebtDeduction}
                  onChange={(e) => setIncludeDebtDeduction(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-slate-400 text-[11px]">Gunakan Pengurang</span>
              </label>
            </div>

            {includeDebtDeduction && (
              <div className="pt-2">
                <input
                  type="number"
                  min={0}
                  step={1000000}
                  value={deductibleDebtIDR}
                  onChange={(e) => setDeductibleDebtIDR(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-teal-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  *Catatan Fiqih: Hanya hutang yang jatuh tempo saat haul yang boleh mengurangi harta wajib zakat. Hutang jangka panjang yang belum jatuh tempo tidak mengurangi kewajiban.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Calculations, Nisab Threshold & Action Card (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Calculation Status Card */}
          <div
            className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
              isNisabReached
                ? theme === 'dark'
                  ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                  : 'bg-gradient-to-b from-emerald-50/90 to-white border-emerald-300 shadow-sm'
                : theme === 'dark'
                ? 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-500/30'
                : 'bg-gradient-to-b from-amber-50/70 to-white border-amber-200'
            }`}
          >
            {/* Top Status Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Hasil Evaluasi Nisab & Zakat
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                  isNisabReached
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isNisabReached ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Wajib Zakat Maal</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Belum Wajib Zakat</span>
                  </>
                )}
              </span>
            </div>

            {/* Total Zakatable Wealth Figure */}
            <div className="py-4 space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Total Harta Bersih Wajib Zakat (Net Zakatable Wealth):
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {formatIDR(totalNetZakatableWealthIDR)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-0.5">
                <span>Batas Minimal Nisab (85g Emas):</span>
                <span className="font-bold text-amber-500 font-mono">{formatIDR(nisabGold85gIDR)}</span>
              </div>
            </div>

            {/* Nisab Progress Bar with 100% Marker */}
            <div className="space-y-1.5 py-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Pencapaian Terhadap Nisab:</span>
                <span className={`font-black font-mono ${isNisabReached ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {nisabProgressPercent}%
                </span>
              </div>

              <div className="relative w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isNisabReached
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalNetZakatableWealthIDR / nisabGold85gIDR) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>Rp 0</span>
                <span className="text-amber-500 font-bold">100% Nisab ({formatIDR(nisabGold85gIDR)})</span>
              </div>
            </div>

            {/* Zakat Obligation Display Box */}
            <div
              className={`mt-4 p-4 rounded-xl border ${
                isNisabReached
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/20'
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {isNisabReached ? 'Kewajiban Zakat Maal Anda (2.5%)' : 'Status Kewajiban Zakat'}
              </div>

              {isNisabReached ? (
                <div className="mt-1">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatIDR(zakatObligationIDR)}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Wajib ditunaikan bila telah genap haul 1 tahun
                  </span>

                  {/* Payment Options Breakdown */}
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Opsi Dicicil Bulanan:</span>
                      <span className="font-bold text-teal-300 font-mono">
                        {formatIDR(monthlyInstallmentIDR)} / bln
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Opsi Dicadangkan Harian:</span>
                      <span className="font-bold text-teal-300 font-mono">
                        {formatIDR(dailyZakatReserveIDR)} / hari
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 space-y-1 text-xs">
                  <div className="text-lg font-bold text-amber-400">
                    Belum Wajib Mengeluarkan Zakat (Rp 0)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Kekayaan Anda masih kurang <strong>{formatIDR(deficitToNisabIDR)}</strong> (setara {deficitGoldGrams} gram emas) untuk mencapai ambang batas nisab 85 gram.
                  </p>
                  <p className="text-[11px] text-teal-400/90 italic pt-1">
                    💡 Sangat dianjurkan untuk tetap menyalurkan Infaq / Sedekah sukarela untuk mensucikan harta dan memicu keberkahan rezeki.
                  </p>
                </div>
              )}
            </div>

            {/* Asset Composition Visual Breakdown */}
            <div className="mt-5 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Komposisi Portofolio Harta:
              </span>

              {/* Stacked Proportional Bar */}
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{ width: `${goldPercent}%` }}
                  title={`Emas: ${goldPercent}%`}
                />
                <div
                  className="bg-teal-500 transition-all duration-500"
                  style={{ width: `${cashPercent}%` }}
                  title={`Kas & Tabungan: ${cashPercent}%`}
                />
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${investPercent}%` }}
                  title={`Investasi: ${investPercent}%`}
                />
              </div>

              {/* Legend with Values */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Emas ({goldPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                  <span className="truncate">Kas ({cashPercent}%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Invest ({investPercent}%)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
              {onNavigateToDisburse && (
                <button
                  id="calc-disburse-direct-btn"
                  onClick={() => onNavigateToDisburse(zakatObligationIDR > 0 ? zakatObligationIDR : 500000)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>
                    {isNisabReached ? 'Salurkan Zakat Ini via API BAZNAS' : 'Salurkan Infaq / Sedekah Berkah'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                id="calc-copy-summary-btn"
                onClick={handleCopySummary}
                className="w-full py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Rincian Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Rincian Perhitungan Zakat</span>
                  </>
                )}
              </button>

              {onNavigateToProjection && (
                <button
                  onClick={onNavigateToProjection}
                  className="w-full text-center text-[11px] text-teal-400 hover:underline pt-1 block"
                >
                  Lihat Proyeksi Akumulasi Laba Bot 12 Bulan ke Depan →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
