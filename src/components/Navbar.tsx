import React from 'react';
import {
  ShieldCheck,
  Moon,
  Sun,
  Bell,
  Fingerprint,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Lock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Language, Theme, PushNotification } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  totalBalanceIDR: number;
  autoProfitTodayIDR: number;
  isBotRunning: boolean;
  notifications: PushNotification[];
  onOpenNotifications: () => void;
  onOpenBiometric: () => void;
  onOpenWithdrawal: () => void;
  isBiometricAuthenticated: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  setLanguage,
  theme,
  toggleTheme,
  currentTab,
  setCurrentTab,
  totalBalanceIDR,
  autoProfitTodayIDR,
  isBotRunning,
  notifications,
  onOpenNotifications,
  onOpenBiometric,
  onOpenWithdrawal,
  isBiometricAuthenticated,
}) => {
  const t = translations[language];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'mastery', label: (t.nav as any).mastery || 'Finance Mastery', isMastery: true },
    { id: 'compliance', label: 'Risk Map Syariah' },
    { id: 'projection', label: 'Proyeksi AI Syariah' },
    { id: 'trading', label: t.nav.autoTrading },
    { id: 'vouchers', label: t.nav.vouchers },
    { id: 'expenses', label: t.nav.expenses },
    { id: 'bills', label: t.nav.bills },
    { id: 'blockchain', label: t.nav.blockchain },
    { id: 'apiGateway', label: t.nav.apiGateway },
    { id: 'aiOracle', label: t.nav.aiOracle },
  ];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950/90 border-slate-800 text-slate-100'
          : 'bg-white/95 border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {/* Top Banner: Status & Quick Metric */}
      <div
        className={`px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b ${
          theme === 'dark'
            ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300'
            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t.networkStatus}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Audit DSN-MUI & AAOIFI No. 57
          </span>
        </div>

        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1 text-emerald-500">
            <TrendingUp className="w-3.5 h-3.5" />
            {t.autoEarnToday}: +{formatIDR(autoProfitTodayIDR)}
          </span>
          {isBotRunning && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              BOT ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div
          id="brand-logo-btn"
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-amber-300 font-bold text-base">
              ☪
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                FinanceCity
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase tracking-wider">
                Islamicity
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Center Quick Portfolio Badge (Desktop) */}
        <div
          className={`hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {t.balance}
            </div>
            <div className="text-sm font-bold text-emerald-500">
              {formatIDR(totalBalanceIDR)}
            </div>
          </div>
          <button
            id="nav-quick-withdraw-btn"
            onClick={onOpenWithdrawal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {t.dashboard.withdrawQuick}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Biometric Status / Trigger */}
          <button
            id="nav-biometric-btn"
            onClick={onOpenBiometric}
            title="Biometric Security (FaceID / Fingerprint)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isBiometricAuthenticated
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-500 hover:bg-amber-500/20'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isBiometricAuthenticated ? 'Biometrik Aktif' : 'Verifikasi Biometrik'}
            </span>
            {isBiometricAuthenticated ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            ) : (
              <Lock className="w-3 h-3 text-amber-500" />
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-800 p-0.5 text-xs font-medium">
            <button
              id="lang-btn-id"
              onClick={() => setLanguage('id')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'id'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              ID
            </button>
            <button
              id="lang-btn-en"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              EN
            </button>
            <button
              id="lang-btn-ar"
              onClick={() => setLanguage('ar')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                language === 'ar'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              عربي
            </button>
          </div>

          {/* Theme Toggle (Dark/Light mode) */}
          <button
            id="nav-theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
            className={`p-2 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Notification Bell */}
          <button
            id="nav-notification-bell-btn"
            onClick={onOpenNotifications}
            className={`relative p-2 rounded-lg border transition-colors ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs bar */}
      <div
        className={`px-4 overflow-x-auto border-t scrollbar-none ${
          theme === 'dark' ? 'border-slate-900' : 'border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : item.isMastery
                    ? theme === 'dark'
                      ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
                      : 'text-amber-700 hover:text-amber-800 hover:bg-amber-50 border border-amber-300'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.isMastery && <GraduationCap className="w-3.5 h-3.5 text-amber-400" />}
                <span>{item.label}</span>
                {item.isMastery && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 tracking-wider uppercase">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
