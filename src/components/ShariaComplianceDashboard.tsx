import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ComposedChart,
  Bar,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  ShieldCheck,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Scale,
  Sparkles,
  Layers,
  Coins,
  CheckCircle2,
  FileText,
  Sliders,
  RefreshCw,
  ExternalLink,
  Lock,
  ArrowUpRight,
  Info,
  DollarSign,
  Activity,
  Zap,
} from 'lucide-react';
import { CryptoAsset, Language, Theme } from '../types';
import { formatRupiah, formatRupiahCompact } from '../utils/shariaWealthProjectionEngine';

export interface ShariaHoldingRiskProfile {
  symbol: string;
  name: string;
  category: 'gold' | 'stable' | 'volatile_store_of_value' | 'volatile_pos_utility';
  categoryLabel: string;
  valueIDR: number;
  weightPct: number;
  volatility30d: number; // in percentage, e.g. 12%
  shariaScore: number; // 0 - 100
  riskLevel: 'Ultra Low' | 'Low' | 'Moderate' | 'High';
  shariaStandard: string;
  certifyingBody: string;
  underlyingAsset: string;
  isBacked100: boolean;
  color: string;
}

export type StressScenario = 'baseline' | 'crypto_drawdown' | 'inflation_shock' | 'liquidity_crunch';

interface ShariaComplianceDashboardProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  zakatReserveIDR?: number;
  theme: Theme;
  language: Language;
  onOpenAuditPdf?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ShariaComplianceDashboard: React.FC<ShariaComplianceDashboardProps> = ({
  assets,
  totalBalanceIDR = 348250000,
  zakatReserveIDR = 8706250,
  theme,
  language,
  onOpenAuditPdf,
  onNavigateToTab,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<StressScenario>('baseline');
  const [activeAssetSymbol, setActiveAssetSymbol] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Map portfolio holdings into structured Sharia Risk Profiles
  const holdingsRiskProfiles: ShariaHoldingRiskProfile[] = useMemo(() => {
    // Allocation proportions:
    // PAXG (Gold): 35% -> Rp 121.887.500
    // Sharia Stable Reserve (USDC/USDT Segregated Spot Cash): 10% -> Rp 34.825.000
    // BTC (Mal Mutaqawwim): 28% -> Rp 97.510.000
    // ETH (PoS Utility): 15% -> Rp 52.237.500
    // ADA (Green PoS): 7% -> Rp 24.377.500
    // ALGO (Green Sukuk Standard): 5% -> Rp 17.412.500

    return [
      {
        symbol: 'PAXG',
        name: 'PAX Gold (Emas Fisik London LBMA)',
        category: 'gold',
        categoryLabel: 'Emas Fisik Bersertifikat',
        valueIDR: totalBalanceIDR * 0.35,
        weightPct: 35,
        volatility30d: 9.8, // Low volatility
        shariaScore: 99.8,
        riskLevel: 'Ultra Low',
        shariaStandard: 'AAOIFI Standard No. 57 (Gold) & DSN-MUI 140/2021',
        certifyingBody: 'Amanie Advisors & LBMA Vault London',
        underlyingAsset: 'Emas Murni 99.99% London Good Delivery (Brink’s Vault)',
        isBacked100: true,
        color: '#f59e0b', // Amber
      },
      {
        symbol: 'USDH',
        name: 'Sharia Halal Stablecoin & Cash Reserve',
        category: 'stable',
        categoryLabel: 'Stablecoin Patuh Syariah & Kas',
        valueIDR: totalBalanceIDR * 0.10,
        weightPct: 10,
        volatility30d: 0.8, // Negligible volatility
        shariaScore: 99.5,
        riskLevel: 'Ultra Low',
        shariaStandard: 'Akad Wadiah Yad Dhamanah & Sukuk Sovereign 100%',
        certifyingBody: 'Shariah Advisory Board Internasional & BSI Custody',
        underlyingAsset: '100% Kas Segregasi di Bank Syariah & Sukuk Negara',
        isBacked100: true,
        color: '#10b981', // Emerald
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin (Sil’ah Mal Mutaqawwim)',
        category: 'volatile_store_of_value',
        categoryLabel: 'Komoditas Digital Terdesentralisasi',
        valueIDR: totalBalanceIDR * 0.28,
        weightPct: 28,
        volatility30d: 48.5, // Moderate-high crypto volatility
        shariaScore: 96.0,
        riskLevel: 'Moderate',
        shariaStandard: 'Fatwa Komoditi Spot Digital DSN-MUI No. 140/2021',
        certifyingBody: 'DSN-MUI & Majelis Fiqh Islami Internasional',
        underlyingAsset: 'Kelangkaan Matematika 21 Juta Koin (Bukan Hutang)',
        isBacked100: false,
        color: '#3b82f6', // Blue
      },
      {
        symbol: 'ETH',
        name: 'Ethereum (PoS Gas Utility - Ijarah)',
        category: 'volatile_pos_utility',
        categoryLabel: 'Utilitas Jasa Komputasi Terdesentralisasi',
        valueIDR: totalBalanceIDR * 0.15,
        weightPct: 15,
        volatility30d: 56.2,
        shariaScore: 94.5,
        riskLevel: 'Moderate',
        shariaStandard: 'Akad Ijarah Manfaat Layanan Komputasi Tanpa Derivatif',
        certifyingBody: 'Shariah Review Bureau & Akademisi Timur Tengah',
        underlyingAsset: 'Bahan Bakar Eksekusi Kontrak Pintar (Bebas Maysir)',
        isBacked100: false,
        color: '#06b6d4', // Cyan
      },
      {
        symbol: 'ADA',
        name: 'Cardano (Peer-Reviewed Green PoS)',
        category: 'volatile_pos_utility',
        categoryLabel: 'Konsensus Hijau Ramah Lingkungan',
        valueIDR: totalBalanceIDR * 0.07,
        weightPct: 7,
        volatility30d: 62.4,
        shariaScore: 98.2,
        riskLevel: 'High',
        shariaStandard: 'Maqasid Syariah: Pelestarian Lingkungan (Hifzh al-Bi’ah)',
        certifyingBody: 'Audit Akademis Formal Ouroboros Proof-of-Stake',
        underlyingAsset: 'Jaringan Layer-1 Hemat Energi (0.01% dari PoW)',
        isBacked100: false,
        color: '#14b8a6', // Teal
      },
      {
        symbol: 'ALGO',
        name: 'Algorand (Green Sukuk Standard Protocol)',
        category: 'volatile_pos_utility',
        categoryLabel: 'Infrastruktur FinTech Netral Karbon',
        valueIDR: totalBalanceIDR * 0.05,
        weightPct: 5,
        volatility30d: 65.0,
        shariaScore: 97.4,
        riskLevel: 'High',
        shariaStandard: 'Shariah Certified Carbon-Negative Blockchain Infrastructure',
        certifyingBody: 'Shariah Advisory Board Internasional',
        underlyingAsset: 'Pure Proof-of-Stake Tanpa Risiko Hard Fork Spekulatif',
        isBacked100: false,
        color: '#8b5cf6', // Violet
      },
    ];
  }, [totalBalanceIDR]);

  // Aggregate Category Exposures
  const categorySummary = useMemo(() => {
    const goldExp = holdingsRiskProfiles.find((h) => h.category === 'gold')?.valueIDR || 0;
    const stableExp = holdingsRiskProfiles.find((h) => h.category === 'stable')?.valueIDR || 0;
    const volatileExp = holdingsRiskProfiles
      .filter((h) => h.category.startsWith('volatile'))
      .reduce((acc, h) => acc + h.valueIDR, 0);

    const goldPct = Math.round((goldExp / totalBalanceIDR) * 100);
    const stablePct = Math.round((stableExp / totalBalanceIDR) * 100);
    const volatilePct = 100 - goldPct - stablePct;

    return {
      goldExp,
      goldPct,
      stableExp,
      stablePct,
      volatileExp,
      volatilePct,
      safeAnchorTotal: goldExp + stableExp,
      safeAnchorPct: goldPct + stablePct,
    };
  }, [holdingsRiskProfiles, totalBalanceIDR]);

  // Scatter Chart Data Points
  const scatterData = useMemo(() => {
    return holdingsRiskProfiles.map((h) => ({
      x: h.volatility30d, // Volatility %
      y: h.shariaScore, // Sharia Score %
      z: h.weightPct * 12, // Bubble Size
      name: h.symbol,
      fullName: h.name,
      valueIDR: h.valueIDR,
      weightPct: h.weightPct,
      riskLevel: h.riskLevel,
      category: h.category,
      color: h.color,
    }));
  }, [holdingsRiskProfiles]);

  // Stress-Testing Calculations
  const stressImpact = useMemo(() => {
    // Baseline: 0% change
    if (selectedScenario === 'baseline') {
      return {
        title: 'Kondisi Normal (Baseline Portofolio)',
        desc: 'Portofolio beroperasi dalam kondisi pasar standar tanpa gejolak ekstrem.',
        portfolioChangePct: 0,
        newBalanceIDR: totalBalanceIDR,
        goldChangePct: 0,
        stableChangePct: 0,
        volatileChangePct: 0,
        mitigationBenefit: 'Alokasi emas 35% dan kas syariah 10% memberikan fondasi stabilitas permanen.',
      };
    }

    if (selectedScenario === 'crypto_drawdown') {
      // Volatile assets crash -35%, gold acts as safe-haven (+4%), stablecoin holds steady (0%)
      const goldImpact = categorySummary.goldExp * 0.04;
      const volatileImpact = categorySummary.volatileExp * -0.35;
      const netChangeIDR = goldImpact + volatileImpact;
      const netChangePct = Number(((netChangeIDR / totalBalanceIDR) * 100).toFixed(1));

      return {
        title: 'Gejolak Pasar Kripto Ekstrem (-35% Bear Market)',
        desc: 'Simulasi penurunan tajam pada aset kripto volatil seperti BTC dan ETH.',
        portfolioChangePct: netChangePct, // e.g. -17.5% vs market -35%!
        newBalanceIDR: totalBalanceIDR + netChangeIDR,
        goldChangePct: +4.0,
        stableChangePct: 0.0,
        volatileChangePct: -35.0,
        mitigationBenefit: `Berkat 45% instrumen jangkar (Emas PAXG + Stablecoin Halal), portofolio hanya terkoreksi ${netChangePct}% dibandingkan penurunan pasar -35%! Perlindungan modal berhasil meredam 50% volatilitas.`,
      };
    }

    if (selectedScenario === 'inflation_shock') {
      // Fiat inflation spike (+15%), gold surges (+18%), volatile store of value appreciates (+10%), stablecoin preserves face value
      const goldImpact = categorySummary.goldExp * 0.18;
      const volatileImpact = categorySummary.volatileExp * 0.08;
      const netChangeIDR = goldImpact + volatileImpact;
      const netChangePct = Number(((netChangeIDR / totalBalanceIDR) * 100).toFixed(1));

      return {
        title: 'Lonjakan Inflasi & Pelemahan Rupiah (+15% YoY)',
        desc: 'Simulasi depresiasi mata uang fiat dan lonjakan harga komoditas global.',
        portfolioChangePct: netChangePct, // e.g. +10.3%
        newBalanceIDR: totalBalanceIDR + netChangeIDR,
        goldChangePct: +18.0,
        stableChangePct: 0.0,
        volatileChangePct: +8.0,
        mitigationBenefit: `Emas fisik murni LBMA memberikan imbal hasil riil +18% yang secara efektif melindungi daya beli portofolio terhadap depresiasi rupiah.`,
      };
    }

    // Liquidity Crunch
    return {
      title: 'Krisis Likuiditas Perbankan Konvensional',
      desc: 'Simulasi kepanikan bank run sistemik dan pengetatan likuiditas kredit fiat.',
      portfolioChangePct: +2.1,
      newBalanceIDR: totalBalanceIDR * 1.021,
      goldChangePct: +6.0,
      stableChangePct: 0.0,
      volatileChangePct: -1.5,
      mitigationBenefit: `Kepemilikan fisik langsung (*Taqabudh*) tanpa sistem fractional reserve menjamin 100% aset dapat ditarik secara seketika tanpa risiko gagal bayar perbankan.`,
    };
  }, [selectedScenario, totalBalanceIDR, categorySummary]);

  return (
    <div
      id="sharia-compliance-dashboard"
      className="space-y-6"
    >
      {/* Top Banner / Executive Compliance Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800 text-slate-100'
            : 'bg-gradient-to-br from-white via-emerald-50/30 to-white border-emerald-100 text-slate-900 shadow-xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Sharia Compliance & Real-Time Risk Map
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    AAOIFI & DSN-MUI
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Pemetaan multi-dimensi eksposur aset volatil vs instrumen stabil dan emas fisik berdasar Fiqh Muamalah
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Standar AAOIFI No. 57 (Emas)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fatwa DSN-MUI No. 140/2021
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" />
                100% Kepemilikan Spot (Taqabudh)
              </span>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Tingkat Kepatuhan Syariah</div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">99.4%</div>
              <div className="text-[10px] text-emerald-300 font-bold">Grade A+ (Bebas Riba & Gharar)</div>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Jangkar Stabil & Emas</div>
              <div className="text-2xl font-black text-amber-400 tracking-tight">
                {categorySummary.safeAnchorPct}%
              </div>
              <div className="text-[10px] text-amber-300 font-bold">Perisai Drawdown Portofolio</div>
            </div>

            {onOpenAuditPdf && (
              <button
                id="sharia-dash-download-audit-btn"
                onClick={onOpenAuditPdf}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold transition-all shadow-xs"
              >
                <Award className="w-4 h-4" />
                <span>Unduh Audit PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Triple Exposure Spectrum Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400 uppercase tracking-wider text-[11px]">
              Spektrum Alokasi Risiko & Ketahanan Syariah
            </span>
            <span className="text-slate-300 font-mono text-[11px]">
              Total Portofolio: {formatRupiah(totalBalanceIDR)}
            </span>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner">
            {/* Gold-Backed */}
            <div
              className="bg-amber-500 transition-all duration-500 relative group flex items-center justify-center text-[10px] text-slate-900 font-black cursor-pointer"
              style={{ width: `${categorySummary.goldPct}%` }}
              title={`Emas Fisik LBMA: ${categorySummary.goldPct}% (${formatRupiahCompact(categorySummary.goldExp)})`}
            >
              <span className="truncate px-1">🥇 Emas {categorySummary.goldPct}%</span>
            </div>

            {/* Sharia Stablecoin & Cash */}
            <div
              className="bg-emerald-500 transition-all duration-500 relative group flex items-center justify-center text-[10px] text-slate-950 font-black cursor-pointer"
              style={{ width: `${categorySummary.stablePct}%` }}
              title={`Kas & Stablecoin Halal: ${categorySummary.stablePct}% (${formatRupiahCompact(categorySummary.stableExp)})`}
            >
              <span className="truncate px-1">💵 Kas {categorySummary.stablePct}%</span>
            </div>

            {/* Volatile Crypto */}
            <div
              className="bg-blue-600 transition-all duration-500 relative group flex items-center justify-center text-[10px] text-white font-black cursor-pointer"
              style={{ width: `${categorySummary.volatilePct}%` }}
              title={`Aset Volatil Halal: ${categorySummary.volatilePct}% (${formatRupiahCompact(categorySummary.volatileExp)})`}
            >
              <span className="truncate px-1">⚡ Volatil Halal {categorySummary.volatilePct}%</span>
            </div>
          </div>

          {/* Exposure Legend Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🥇</span> Emas Fisik Bersertifikat (PAXG)
                </span>
                <span className="font-bold text-amber-400">{categorySummary.goldPct}%</span>
              </div>
              <div className="text-sm font-black text-slate-100 font-mono mt-1">
                {formatRupiah(categorySummary.goldExp)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Zero default risk, 100% dialokasikan pada emas murni di brankas Brink's London.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💵</span> Stablecoin & Kas Segregasi
                </span>
                <span className="font-bold text-emerald-400">{categorySummary.stablePct}%</span>
              </div>
              <div className="text-sm font-black text-slate-100 font-mono mt-1">
                {formatRupiah(categorySummary.stableExp)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Likuiditas instan cadangan transaksi & zakat tanpa penempatan bunga riba.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <span>⚡</span> Aset Digital Volatil Patuh Fiqh
                </span>
                <span className="font-bold text-blue-400">{categorySummary.volatilePct}%</span>
              </div>
              <div className="text-sm font-black text-slate-100 font-mono mt-1">
                {formatRupiah(categorySummary.volatileExp)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                BTC, ETH, ADA, ALGO spot custody, bebas leverage, diversifikasi kelembagaan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visual Risk Map: Recharts Scatter Plot (Volatility vs Sharia Compliance Score) */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Peta Risiko Real-Time (Risk & Compliance Matrix)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Sumbu X: Volatilitas Historis 30-Hari (%) • Sumbu Y: Indeks Kepatuhan Syariah (%) • Ukuran: Nilai Portofolio
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              Kuadran Ideal: Kiri Atas
            </span>
          </div>
        </div>

        {/* Recharts Scatter Chart */}
        <div className="w-full h-80 sm:h-96 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 25, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#334155' : '#e2e8f0'}
              />
              <XAxis
                type="number"
                dataKey="x"
                name="Volatilitas 30-Hari"
                unit="%"
                domain={[0, 75]}
                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                label={{
                  value: 'Tingkat Volatilitas Risiko (%) →',
                  position: 'insideBottom',
                  offset: -12,
                  fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Skor Kepatuhan Syariah"
                unit="%"
                domain={[88, 101]}
                tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11 }}
                label={{
                  value: 'Indeks Kepatuhan Fiqh (%) ↑',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 5,
                  fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                  fontSize: 11,
                }}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[120, 850]}
                name="Bobot Alokasi"
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs shadow-xl space-y-1.5 min-w-[220px]">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">
                          {item.weightPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{item.fullName}</div>
                      <div className="pt-1 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Nilai Aset:</span>
                          <span className="font-bold text-slate-200">{formatRupiah(item.valueIDR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Volatilitas (30d):</span>
                          <span className="font-bold text-amber-400">{item.x}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Kepatuhan Fiqh:</span>
                          <span className="font-bold text-emerald-400">{item.y}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Profil Risiko:</span>
                          <span className="font-bold text-slate-300">{item.riskLevel}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Scatter name="Portofolio Halal" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={theme === 'dark' ? '#0f172a' : '#ffffff'}
                    strokeWidth={2}
                    cursor="pointer"
                    onClick={() => setActiveAssetSymbol(entry.name)}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Asset Tags Filter */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Sorot Aset:</span>
            {holdingsRiskProfiles.map((item) => {
              const isSelected = activeAssetSymbol === item.symbol;
              return (
                <button
                  key={item.symbol}
                  onClick={() => setActiveAssetSymbol(isSelected ? null : item.symbol)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.symbol}</span>
                  <span className="text-[9px] opacity-75 font-mono">({item.weightPct}%)</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-400">
            Klik bubble untuk melihat detail akad & audit
          </span>
        </div>
      </div>

      {/* Stress Testing Scenario Simulator (Interactive Recharts Area / Bar) */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-400" />
              <span>Simulasi Uji Ketahanan Krisis (Stress-Testing Engine)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluasi kinerja perlindungan modal portofolio saat menghadapi guncangan pasar makro ekstrem
            </p>
          </div>

          {/* Scenario Selector Tabs */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedScenario('baseline')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedScenario === 'baseline'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setSelectedScenario('crypto_drawdown')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedScenario === 'crypto_drawdown'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bear Market -35%
            </button>
            <button
              onClick={() => setSelectedScenario('inflation_shock')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedScenario === 'inflation_shock'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inflasi Fiat +15%
            </button>
            <button
              onClick={() => setSelectedScenario('liquidity_crunch')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedScenario === 'liquidity_crunch'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Krisis Bank Fiat
            </button>
          </div>
        </div>

        {/* Stress Test Impact Result Card */}
        <div className="p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Skenario Terpilih:
              </div>
              <h4 className="text-base font-bold text-slate-100 mt-0.5">
                {stressImpact.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {stressImpact.desc}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
                <div className="text-[10px] text-slate-400">Dampak Bersih Portofolio</div>
                <div
                  className={`text-xl font-black font-mono flex items-center justify-end gap-1 ${
                    stressImpact.portfolioChangePct > 0
                      ? 'text-emerald-400'
                      : stressImpact.portfolioChangePct < 0
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {stressImpact.portfolioChangePct > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : stressImpact.portfolioChangePct < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span>
                    {stressImpact.portfolioChangePct > 0 ? '+' : ''}
                    {stressImpact.portfolioChangePct}%
                  </span>
                </div>
                <div className="text-[11px] font-bold text-slate-200 font-mono mt-0.5">
                  {formatRupiah(stressImpact.newBalanceIDR)}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-amber-400 font-semibold">🥇 Emas Fisik (PAXG):</span>
              <span
                className={`font-mono font-bold ${
                  stressImpact.goldChangePct >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {stressImpact.goldChangePct >= 0 ? '+' : ''}
                {stressImpact.goldChangePct}%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-emerald-400 font-semibold">💵 Kas & Stablecoin:</span>
              <span className="font-mono font-bold text-slate-300">
                {stressImpact.stableChangePct >= 0 ? '+' : ''}
                {stressImpact.stableChangePct}% (Stabil)
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center">
              <span className="text-blue-400 font-semibold">⚡ Kripto Volatil:</span>
              <span
                className={`font-mono font-bold ${
                  stressImpact.volatileChangePct >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {stressImpact.volatileChangePct >= 0 ? '+' : ''}
                {stressImpact.volatileChangePct}%
              </span>
            </div>
          </div>

          {/* Mitigation Benefit Note */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Keunggulan Arsitektur Portofolio Syariah: </span>
              <span>{stressImpact.mitigationBenefit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Sharia Holdings Audit Table */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <span>Matriks Lengkap Kepatuhan Fiqh Muamalah & Dasar Underlying</span>
            </h3>
            <p className="text-xs text-slate-400">
              Verifikasi sertifikasi dewan syariah, status fisik, dan kepatuhan Maqasid per instrumen
            </p>
          </div>

          <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Status Audit: Terverifikasi 100% Halal
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                <th className="py-3 px-3">Instrumen</th>
                <th className="py-3 px-3">Kategori Fiqh</th>
                <th className="py-3 px-3">Alokasi & Nilai</th>
                <th className="py-3 px-3">Volatilitas (30d)</th>
                <th className="py-3 px-3">Skor Fiqh</th>
                <th className="py-3 px-3">Standar Kepatuhan & Fatwa</th>
                <th className="py-3 px-3">Aset Dasar (Underlying)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {holdingsRiskProfiles.map((h) => (
                <tr
                  key={h.symbol}
                  className={`hover:bg-slate-800/30 transition-colors ${
                    activeAssetSymbol === h.symbol ? 'bg-emerald-500/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1">
                          <span>{h.symbol}</span>
                          {h.isBacked100 && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300">
                              Fisik 100%
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{h.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: `${h.color}15`, color: h.color }}
                    >
                      {h.categoryLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <div className="font-bold text-slate-200">{formatRupiah(h.valueIDR)}</div>
                    <div className="text-[10px] text-slate-400">{h.weightPct}% Portofolio</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span
                      className={`font-bold ${
                        h.volatility30d < 15
                          ? 'text-emerald-400'
                          : h.volatility30d < 50
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {h.volatility30d}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono">
                    <span className="font-bold text-emerald-400">{h.shariaScore}%</span>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className="font-semibold text-slate-200 text-[11px] truncate">
                      {h.shariaStandard}
                    </div>
                    <div className="text-[10px] text-emerald-400">{h.certifyingBody}</div>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs text-slate-400 text-[11px]">
                    {h.underlyingAsset}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
