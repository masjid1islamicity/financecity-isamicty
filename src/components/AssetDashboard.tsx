import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Award,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CreditCard,
  Ticket,
  HelpCircle,
  BookOpen,
  FileText,
  Calculator,
  Scale,
  Target,
  BellRing,
  FileCheck,
  Download,
  Activity,
  Coins,
  Bell,
  BarChart3,
  FileDown,
  GraduationCap,
  Users,
} from 'lucide-react';
import {
  CryptoAsset,
  Language,
  Theme,
  ZakatDisbursementData,
  AutoTradingConfig,
  ZakatSummaryRecord,
  SmartZakatAssetThreshold,
  PushNotification,
  TradeOrder,
  ShariaFinancialGoal,
  EncryptedUserHistory,
} from '../types';
import { translations } from '../utils/translations';
import { initialSmartZakatAssetThresholds } from '../data/initialState';
import { ZakatEducationModule } from './ZakatEducationModule';
import { ZakatSummary } from './ZakatSummary';
import { SmartZakatReminder } from './SmartZakatReminder';
import { CryptoShariaAuditPdfModal } from './CryptoShariaAuditPdfModal';
import { ZakatPortfolioReportPdfModal } from './ZakatPortfolioReportPdfModal';
import { ZakatImpactInfographic } from './ZakatImpactInfographic';
import { SmartWealthProjection } from './SmartWealthProjection';
import { PortfolioHealthIndex } from './PortfolioHealthIndex';
import { SmartRebalanceAssistant } from './SmartRebalanceAssistant';
import { ShariaComplianceDashboard } from './ShariaComplianceDashboard';
import { GoldPriceAlertManager } from './GoldPriceAlertManager';
import { MonthlyZakatDistributionChart } from './MonthlyZakatDistributionChart';
import { ZakatBenchmarkCalculator } from './ZakatBenchmarkCalculator';
import { FinancialGoalSettingCard } from './FinancialGoalSettingCard';
import { CommunityImpactWidget } from './CommunityImpactWidget';

interface AssetDashboardProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  autoProfitTodayIDR: number;
  zakatReserveIDR: number;
  annualZakatTargetIDR?: number;
  onUpdateAnnualTarget?: (newTarget: number) => void;
  disbursedZakatRecords?: ZakatSummaryRecord[];
  smartZakatThresholds?: SmartZakatAssetThreshold[];
  onUpdateSmartZakatThresholds?: (thresholds: SmartZakatAssetThreshold[]) => void;
  onSendPushNotification?: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
  language: Language;
  theme: Theme;
  onOpenWithdrawal: () => void;
  onNavigateToTab: (tab: string) => void;
  onSelectAssetForAudit: (asset: CryptoAsset) => void;
  onDisburseZakat?: (data: ZakatDisbursementData) => void;
  onRequestBiometric?: (onSuccess: () => void, title?: string) => void;
  tradingConfig?: AutoTradingConfig;
  onUpdateTradingConfig?: (config: AutoTradingConfig) => void;
  onExecuteTrades?: (trades: TradeOrder[]) => void;
  onRecordGoalToBlockchain?: (params: {
    goal: ShariaFinancialGoal;
    projectedDateFormatted: string;
    accumulatedFundsIDR: number;
    cipherText: string;
    signature: string;
    merkleRoot: string;
    txHash: string;
  }) => void;
  recentTrades?: TradeOrder[];
  history?: EncryptedUserHistory[];
}

export const AssetDashboard: React.FC<AssetDashboardProps> = ({
  assets,
  totalBalanceIDR,
  autoProfitTodayIDR,
  zakatReserveIDR,
  annualZakatTargetIDR = 15000000,
  onUpdateAnnualTarget,
  disbursedZakatRecords = [],
  smartZakatThresholds,
  onUpdateSmartZakatThresholds,
  onSendPushNotification,
  language,
  theme,
  onOpenWithdrawal,
  onNavigateToTab,
  onSelectAssetForAudit,
  onDisburseZakat,
  onRequestBiometric,
  tradingConfig,
  onUpdateTradingConfig,
  onExecuteTrades,
  onRecordGoalToBlockchain,
  recentTrades = [],
  history = [],
}) => {
  const t = translations[language];
  const [zakatTab, setZakatTab] = useState<'education' | 'projection' | 'calculator' | 'disburse' | 'report'>('education');
  const [internalTarget, setInternalTarget] = useState<number>(annualZakatTargetIDR);
  const [isShariaAuditPdfModalOpen, setIsShariaAuditPdfModalOpen] = useState<boolean>(false);
  const [isZakatPortfolioReportModalOpen, setIsZakatPortfolioReportModalOpen] = useState<boolean>(false);
  const [isGoldAlertModalOpen, setIsGoldAlertModalOpen] = useState<boolean>(false);

  const activeAnnualTarget = annualZakatTargetIDR || internalTarget;

  const handleUpdateTarget = (val: number) => {
    setInternalTarget(val);
    if (onUpdateAnnualTarget) {
      onUpdateAnnualTarget(val);
    }
  };

  const handleOpenZakatTab = (tab: 'education' | 'projection' | 'calculator' | 'disburse' | 'report') => {
    setZakatTab(tab);
    const el = document.getElementById('zakat-education-governance-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToZakatSummary = () => {
    const el = document.getElementById('zakat-summary-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHaulReminder = () => {
    const el = document.getElementById('smart-zakat-reminder-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToZakatImpact = () => {
    const el = document.getElementById('zakat-impact-infographic-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToWealthProjection = () => {
    const el = document.getElementById('smart-wealth-projection-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToHealthIndex = () => {
    const el = document.getElementById('portfolio-health-index-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSmartRebalance = () => {
    const el = document.getElementById('smart-rebalance-assistant-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToRiskMap = () => {
    const el = document.getElementById('sharia-compliance-dashboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigateToTab('compliance');
    }
  };

  const handleScrollToGoldAlert = () => {
    const el = document.getElementById('gold-price-alert-manager-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsGoldAlertModalOpen(true);
    }
  };

  const handleScrollToMonthlyChart = () => {
    const el = document.getElementById('monthly-zakat-distribution-trends-chart');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToBenchmarkCalculator = () => {
    const el = document.getElementById('zakat-benchmark-calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToFinancialGoals = () => {
    const el = document.getElementById('financial-goal-setting-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToCommunityImpact = () => {
    const el = document.getElementById('community-impact-widget');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate total zakat paid across verified records
  const totalPaidIDR = disbursedZakatRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalUSD = totalBalanceIDR / 15700;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t.dashboard.portfolioValue}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-emerald-500">
              {formatIDR(totalBalanceIDR)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span>~${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 1 })} USD</span>
              <span className="text-emerald-500 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% (7h)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                onClick={handleScrollToWealthProjection}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group"
              >
                <span>Proyeksi AI</span>
                <span className="group-hover:translate-x-0.5 transition-transform">✨ →</span>
              </button>
              <span className="text-slate-600 dark:text-slate-700">•</span>
              <button
                id="card-portfolio-financial-goals-btn"
                onClick={handleScrollToFinancialGoals}
                className="text-[11px] font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors group"
              >
                <span>Target Finansial (Goal)</span>
                <span className="group-hover:translate-x-0.5 transition-transform">🎯 →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: 24h Net Profit */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t.dashboard.netProfit24h}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-emerald-400">
              +{formatIDR(autoProfitTodayIDR)}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bagi Hasil Mudharabah Otomatis</span>
            </div>
          </div>
        </div>

        {/* Card 3: Estimated APY */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t.dashboard.annualApy}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-amber-400">
              18.4% <span className="text-xs font-normal text-slate-400">/ Thn</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Bebas Riba, Berbasis Emas & PoSS
            </div>
          </div>
        </div>

        {/* Card 4: Zakat Maal Reserve */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {t.dashboard.zakatReserve}
            </span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black tracking-tight text-teal-400">
              {formatIDR(zakatReserveIDR)}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Siap Salur BAZNAS & LAZ</span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="card-zakat-portfolio-psak109-btn"
                  onClick={() => setIsZakatPortfolioReportModalOpen(true)}
                  className="text-amber-300 hover:text-amber-200 font-bold underline decoration-amber-400/50 flex items-center gap-1"
                  title="Unduh Laporan Portofolio & Zakat PSAK 109 Terenkripsi"
                >
                  <span>PSAK 109 📄 🔒 →</span>
                </button>
                <button
                  id="card-zakat-benchmark-calculator-btn"
                  onClick={handleScrollToBenchmarkCalculator}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline decoration-amber-400/50"
                >
                  Kalkulator 85g ⚖️ →
                </button>
                <button
                  id="card-zakat-monthly-chart-btn"
                  onClick={handleScrollToMonthlyChart}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-emerald-400/50"
                >
                  Tren 12B 📊 →
                </button>
                <button
                  id="card-community-impact-btn"
                  onClick={handleScrollToCommunityImpact}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-emerald-400/50"
                >
                  Dampak Komunitas 🤝 →
                </button>
                <button
                  id="card-zakat-impact-btn"
                  onClick={handleScrollToZakatImpact}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-cyan-400/50"
                >
                  Dampak Jiwa 👥 →
                </button>
                <button
                  id="card-zakat-haul-reminder-btn"
                  onClick={handleScrollToHaulReminder}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline decoration-amber-400/50"
                >
                  Haul H-3 🔔 →
                </button>
                <button
                  id="card-zakat-summary-btn"
                  onClick={handleScrollToZakatSummary}
                  className="text-teal-400 hover:text-teal-300 font-semibold underline decoration-teal-400/50"
                >
                  Ringkasan & Target →
                </button>
                <button
                  id="card-zakat-estimator-btn"
                  onClick={() => handleOpenZakatTab('projection')}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-emerald-400/50"
                >
                  Estimasi →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-emerald-950/30 to-slate-900 border-emerald-900/30'
            : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            ☪
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Infrastruktur Keuangan Syariah Transparan & Otomatis
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Setiap transaksi dicatat pada Ledger Blockchain PoSS dengan verifikasi Merkle Proof.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="dash-open-withdrawal-btn"
            onClick={onOpenWithdrawal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
          >
            <CreditCard className="w-4 h-4" />
            {t.dashboard.withdrawQuick}
          </button>
          {onNavigateToTab && (
            <button
              id="dash-open-mastery-btn"
              onClick={() => onNavigateToTab('mastery')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 text-xs font-bold transition-all shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Mastery Investasi</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200">
                Akademi
              </span>
            </button>
          )}
          <button
            id="dash-financial-goals-btn"
            onClick={handleScrollToFinancialGoals}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Target Finansial</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              Goal
            </span>
          </button>
          <button
            id="dash-smart-haul-reminder-btn"
            onClick={handleScrollToHaulReminder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Pengingat Haul H-3</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200">
              3 Hari
            </span>
          </button>
          <button
            id="dash-zakat-summary-btn"
            onClick={handleScrollToZakatSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Scale className="w-4 h-4" />
            <span>Ringkasan Zakat</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-teal-500/30 text-teal-200">
              Target
            </span>
          </button>
          <button
            id="dash-zakat-estimator-btn"
            onClick={() => handleOpenZakatTab('projection')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulator Estimasi</span>
          </button>
          <button
            id="dash-zakat-edu-btn"
            onClick={() => handleOpenZakatTab('report')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 text-xs font-semibold transition-colors"
          >
            <FileText className="w-4 h-4" />
            Laporan BSZ & Salur
          </button>
          <button
            id="dash-community-impact-btn"
            onClick={handleScrollToCommunityImpact}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Dampak Komunitas</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              PoSS
            </span>
          </button>
          <button
            id="dash-zakat-impact-btn"
            onClick={handleScrollToZakatImpact}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Infografis Dampak</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-teal-500/30 text-teal-200">
              Jiwa
            </span>
          </button>
          <button
            id="dash-monthly-zakat-chart-btn"
            onClick={handleScrollToMonthlyChart}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Tren 12 Bulan</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              Recharts
            </span>
          </button>
          <button
            id="dash-benchmark-calculator-btn"
            onClick={handleScrollToBenchmarkCalculator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>Kalkulator 85g Emas</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200">
              Benchmark
            </span>
          </button>
          <button
            id="dash-wealth-projection-btn"
            onClick={handleScrollToWealthProjection}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Proyeksi Cerdas</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              AI
            </span>
          </button>
          <button
            id="dash-health-index-btn"
            onClick={handleScrollToHealthIndex}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Health Index</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              96
            </span>
          </button>
          <button
            id="dash-smart-rebalance-btn"
            onClick={handleScrollToSmartRebalance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Smart Rebalance</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-teal-500/30 text-teal-200">
              1-Klik
            </span>
          </button>
          <button
            id="dash-risk-map-btn"
            onClick={handleScrollToRiskMap}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Risk Map</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200">
              AAOIFI
            </span>
          </button>
          <button
            id="dash-gold-alert-btn"
            onClick={handleScrollToGoldAlert}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Alert Emas</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-yellow-500/30 text-yellow-200">
              PAXG
            </span>
          </button>
          <button
            id="dash-vouchers-btn"
            onClick={() => onNavigateToTab('vouchers')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-semibold transition-colors"
          >
            <Ticket className="w-4 h-4" />
            Voucher Islamicity
          </button>
          <button
            id="dash-sharia-audit-pdf-btn"
            onClick={() => setIsShariaAuditPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors shadow-xs"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Syariah PDF</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/30 text-emerald-200">
              Resmi
            </span>
          </button>
          <button
            id="dash-zakat-portfolio-pdf-btn"
            onClick={() => setIsZakatPortfolioReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Laporan Zakat & Mutasi PDF</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/30 text-amber-200 flex items-center gap-0.5">
              <span>PSAK 109</span>
              <span>🔒</span>
            </span>
          </button>
          <button
            id="dash-trading-btn"
            onClick={() => onNavigateToTab('trading')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Trading Bot
          </button>
        </div>
      </div>

      {/* Financial Goal Setting Card: Long-Term Sharia Investment Targets with Circular Progress Bar */}
      <FinancialGoalSettingCard
        totalBalanceIDR={totalBalanceIDR}
        assets={assets}
        theme={theme}
        language={language}
        onNavigateToTab={onNavigateToTab}
        onScrollToProjection={handleScrollToWealthProjection}
        onRecordGoalToBlockchain={onRecordGoalToBlockchain}
      />

      {/* Community Impact Widget: Aggregated Anonymous Zakat Distribution Statistics & Total Community Welfare Contributions */}
      <CommunityImpactWidget
        theme={theme}
        language={language}
        userZakatReserveIDR={zakatReserveIDR}
        userDisbursedRecords={disbursedZakatRecords}
        onOpenDisburse={() => handleOpenZakatTab('disburse')}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Smart Zakat Haul Reminder System (Push Notification 3 Days Before Haul for Specific Asset Thresholds) */}
      <SmartZakatReminder
        thresholds={smartZakatThresholds || initialSmartZakatAssetThresholds}
        onUpdateThresholds={onUpdateSmartZakatThresholds}
        onSendPushNotification={(notif) => {
          if (onSendPushNotification) {
            onSendPushNotification(notif);
          }
        }}
        onOpenDisburseZakat={() => handleOpenZakatTab('disburse')}
        goldPricePerGramIDR={Math.round((assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000) / 31.1035)}
        theme={theme}
        language={language}
      />

      {/* Visual Progress Bar & Infographic: Total Zakat Impact Across Lives & Programs Supported */}
      <ZakatImpactInfographic
        disbursedRecords={disbursedZakatRecords}
        targetLivesCount={1500}
        theme={theme}
        language={language}
        onOpenDisburse={() => handleOpenZakatTab('disburse')}
        onOpenReport={() => handleOpenZakatTab('report')}
      />

      {/* Recharts Bar Chart: Monthly Zakat Distribution Trends over Last 12 Months */}
      <MonthlyZakatDistributionChart
        disbursedRecords={disbursedZakatRecords}
        theme={theme}
        language={language}
        onOpenDisburse={() => handleOpenZakatTab('disburse')}
        onOpenReport={() => handleOpenZakatTab('report')}
      />

      {/* Zakat Maal Calculator Section (Custom Asset Inputs & Multi-Gold-Benchmark 85g Thresholds) */}
      <ZakatBenchmarkCalculator
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        theme={theme}
        language={language}
        onOpenDisburse={(amount) => {
          handleOpenZakatTab('disburse');
        }}
        onUpdateAnnualTarget={handleUpdateTarget}
      />

      {/* AI-Powered Smart Wealth Projection Tool (Historical trends forecasting Sharia growth scenarios) */}
      <SmartWealthProjection
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        goldPricePerGramIDR={Math.round((assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000) / 31.1035)}
        theme={theme}
        language={language}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Portfolio Health Index Widget: Recharts Radial Gauge showing diversification across Sharia categories */}
      <PortfolioHealthIndex
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        theme={theme}
        language={language}
        onOpenAuditPdf={() => setIsShariaAuditPdfModalOpen(true)}
        onNavigateToTab={onNavigateToTab}
        onOpenSmartRebalance={handleScrollToSmartRebalance}
      />

      {/* Smart Rebalance Assistant (1-Click Automated Trade Redistribution into Sharia Assets) */}
      <SmartRebalanceAssistant
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        currentHealthScore={96}
        theme={theme}
        language={language}
        onExecuteTrades={onExecuteTrades}
        onRequestBiometric={onRequestBiometric}
        onOpenAuditPdf={() => setIsShariaAuditPdfModalOpen(true)}
      />

      {/* Sharia Compliance Dashboard & Real-Time Risk Map (Recharts Scatter & Stress Testing) */}
      <div id="sharia-compliance-dashboard-section">
        <ShariaComplianceDashboard
          assets={assets}
          totalBalanceIDR={totalBalanceIDR}
          zakatReserveIDR={zakatReserveIDR}
          theme={theme}
          language={language}
          onOpenAuditPdf={() => setIsShariaAuditPdfModalOpen(true)}
          onNavigateToTab={onNavigateToTab}
        />
      </div>

      {/* Gold Price Threshold Alert Manager (Ambang Batas Harga Emas Fisik LBMA / PAXG) */}
      <GoldPriceAlertManager
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        theme={theme}
        language={language}
        onSendPushNotification={onSendPushNotification}
        onNavigateToTab={onNavigateToTab}
      />

      {/* Zakat Summary Component: Aggregates total paid, remaining reserve & annual progress */}
      <ZakatSummary
        totalPaidIDR={totalPaidIDR}
        remainingReserveIDR={zakatReserveIDR}
        annualTargetIDR={activeAnnualTarget}
        onUpdateAnnualTarget={handleUpdateTarget}
        disbursedRecords={disbursedZakatRecords}
        onOpenDisburse={() => handleOpenZakatTab('disburse')}
        onOpenReport={() => handleOpenZakatTab('report')}
        onOpenEstimator={() => handleOpenZakatTab('projection')}
        onOpenCalculator={() => handleOpenZakatTab('calculator')}
        theme={theme}
        language={language}
      />

      {/* Zakat Education, Estimation Calculator & Direct Amil API Disbursement Module */}
      <div id="zakat-education-governance-module">
        <ZakatEducationModule
          key={zakatTab}
          initialTab={zakatTab}
          zakatReserveIDR={zakatReserveIDR}
          totalPortfolioIDR={totalBalanceIDR}
          paxgPriceIDR={assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000}
          theme={theme}
          language={language}
          tradingConfig={tradingConfig}
          onUpdateTradingConfig={onUpdateTradingConfig}
          onDisburseSuccess={(disbursementData) => {
            if (onDisburseZakat) {
              onDisburseZakat(disbursementData);
            }
          }}
          onRequestBiometric={onRequestBiometric}
        />
      </div>

      {/* Asset Allocation Breakdown */}
      <div
        className={`p-5 rounded-2xl border ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {t.dashboard.assetAllocation}
          </h3>
          <div className="flex items-center gap-3">
            <button
              id="allocation-sharia-audit-pdf-btn"
              onClick={() => setIsShariaAuditPdfModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/40 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Unduh Laporan Audit AAOIFI & DSN-MUI (PDF)</span>
            </button>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:inline text-xs font-medium text-emerald-500">
              100% Sesuai Kriteria AAOIFI & DSN-MUI
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-amber-400" style={{ width: '42%' }} title="PAX Gold: 42%" />
          <div className="h-full bg-orange-500" style={{ width: '32%' }} title="Bitcoin Mal: 32%" />
          <div className="h-full bg-emerald-500" style={{ width: '16%' }} title="PoS Clean Energy: 16%" />
          <div className="h-full bg-teal-400" style={{ width: '10%' }} title="BSI Saldo Kas: 10%" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">PAX Gold (42%)</span>
              <p className="text-[11px] text-slate-400">Emas Fisik London</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Bitcoin (32%)</span>
              <p className="text-[11px] text-slate-400">Sil'ah Mal Mutaqawwim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">PoS Utilities (16%)</span>
              <p className="text-[11px] text-slate-400">Cardano, Algorand, ETH</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-400" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">Kas Perbankan BSI (10%)</span>
              <p className="text-[11px] text-slate-400">Giro & Deposito Syariah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Sharia Crypto Market Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-emerald-100 shadow-xs'
        }`}
      >
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2 border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold">{t.dashboard.marketPrices}</h3>
            <p className="text-xs text-slate-400">
              Audit otomatis bebas Riba, Gharar, dan Maysir dengan akurasi data real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="download-zakat-portfolio-pdf-btn"
              onClick={() => setIsZakatPortfolioReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all shadow-xs"
              title="Unduh Laporan Neraca Zakat & Histori Transaksi Terenkripsi (PSAK 109)"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Ekspor PDF Zakat & Portofolio (PSAK 109 🔒)</span>
            </button>
            <button
              id="download-sharia-audit-pdf-btn"
              onClick={() => setIsShariaAuditPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Unduh Audit Syariah (PDF)</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Sertifikasi Sharia Review Bureau & DSN-MUI</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b text-[11px] uppercase tracking-wider ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="p-3.5">Aset Kripto Syariah</th>
                <th className="p-3.5">Harga Terkini (IDR / USD)</th>
                <th className="p-3.5">24 Jam</th>
                <th className="p-3.5">{t.dashboard.halalScore}</th>
                <th className="p-3.5">{t.dashboard.shariaRule}</th>
                <th className="p-3.5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {assets.map((coin) => (
                <tr
                  key={coin.id}
                  className={`transition-colors ${
                    theme === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-500 text-xs">
                        {coin.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                          {coin.name}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                            {coin.symbol}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {coin.underlyingAsset}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-semibold">
                    <div className="text-slate-900 dark:text-slate-100 font-bold">
                      {formatIDR(coin.priceIDR)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ${coin.priceUSD.toLocaleString('en-US')} USD
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-xs ${
                        coin.change24h >= 0
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {coin.change24h >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {coin.change24h >= 0 ? `+${coin.change24h}%` : `${coin.change24h}%`}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${coin.halalScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-emerald-500">
                        {coin.halalScore}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {coin.halalCertOrg}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span className="text-[11px] text-slate-600 dark:text-slate-300">
                      {coin.shariaStandard}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {coin.symbol === 'PAXG' && (
                        <button
                          id="gold-paxg-alert-btn"
                          onClick={() => setIsGoldAlertModalOpen(true)}
                          className="px-2 py-1 text-[11px] font-semibold rounded-lg border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                          title="Pasang Notifikasi Ambang Batas Emas"
                        >
                          <Bell className="w-3 h-3 text-amber-400" />
                          <span>Alert Emas</span>
                        </button>
                      )}
                      <button
                        id={`audit-asset-${coin.id}-btn`}
                        onClick={() => onSelectAssetForAudit(coin)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                      >
                        Audit AI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sharia Compliance Audit PDF Report Modal */}
      <CryptoShariaAuditPdfModal
        isOpen={isShariaAuditPdfModalOpen}
        onClose={() => setIsShariaAuditPdfModalOpen(false)}
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        theme={theme}
        language={language}
      />

      {/* Encrypted Zakat & Portfolio Ledger PDF Report Modal (PSAK 109 & BAZNAS RI) */}
      <ZakatPortfolioReportPdfModal
        isOpen={isZakatPortfolioReportModalOpen}
        onClose={() => setIsZakatPortfolioReportModalOpen(false)}
        assets={assets}
        totalBalanceIDR={totalBalanceIDR}
        zakatReserveIDR={zakatReserveIDR}
        recentTrades={recentTrades}
        history={history}
        disbursedRecords={disbursedZakatRecords}
        theme={theme}
        language={language}
      />

      {/* Gold Price Alert Manager Modal */}
      {isGoldAlertModalOpen && (
        <GoldPriceAlertManager
          isOpenModal={true}
          onCloseModal={() => setIsGoldAlertModalOpen(false)}
          assets={assets}
          totalBalanceIDR={totalBalanceIDR}
          theme={theme}
          language={language}
          onSendPushNotification={onSendPushNotification}
          onNavigateToTab={onNavigateToTab}
        />
      )}
    </div>
  );
};
