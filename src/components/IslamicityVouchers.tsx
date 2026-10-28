import React, { useState } from 'react';
import {
  Ticket,
  Sparkles,
  Gift,
  CheckCircle2,
  Copy,
  TrendingUp,
  Percent,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IslamicityVoucher, Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface IslamicityVouchersProps {
  vouchers: IslamicityVoucher[];
  onClaimVoucher: (id: string) => void;
  onRedeemVoucher: (code: string) => boolean;
  onAddNewVoucher: (newVoucher: IslamicityVoucher) => void;
  language: Language;
  theme: Theme;
}

export const IslamicityVouchers: React.FC<IslamicityVouchersProps> = ({
  vouchers,
  onClaimVoucher,
  onRedeemVoucher,
  onAddNewVoucher,
  language,
  theme,
}) => {
  const t = translations[language];
  const [inputCode, setInputCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New voucher creator modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('250000');
  const [newBooster, setNewBooster] = useState('3.0');

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    const success = onRedeemVoucher(inputCode.trim());
    if (success) {
      setRedeemStatus('SUCCESS');
      setInputCode('');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6'],
      });
      setTimeout(() => setRedeemStatus('IDLE'), 3500);
    } else {
      setRedeemStatus('ERROR');
      setErrorMessage('Kode voucher tidak ditemukan atau telah digunakan sebelumnya.');
      setTimeout(() => setRedeemStatus('IDLE'), 3500);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCustomVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = 'ISLAMICITY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdVoucher: IslamicityVoucher = {
      id: 'vouch-' + Date.now(),
      code: cleanCode,
      title: newTitle || 'Gift Voucher Syariah Ramadan',
      description: 'Voucher hadiah digital FinanceCity dengan proteksi akad Hibah Syariah.',
      cashValueIDR: Number(newAmount) || 250000,
      earnBoosterPercent: Number(newBooster) || 2.5,
      type: 'RAMADAN_BLESSING',
      merchant: 'FinanceCity Halal Treasury',
      expiresAt: '2026-12-31',
      isClaimed: true,
      isRedeemed: false,
      shariaContract: 'Akad Hibah & Tabarru Berkah',
    };

    onAddNewVoucher(createdVoucher);
    setShowCreateModal(false);
    setNewTitle('');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-slate-800'
            : 'bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/50 border-emerald-100 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <Gift className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.vouchers.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Auto-Earn Booster
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              {t.vouchers.subtitle}
            </p>
          </div>

          <button
            id="open-create-voucher-btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            {t.vouchers.generateVoucher}
          </button>
        </div>

        {/* Quick Redeem Box */}
        <form onSubmit={handleRedeem} className="mt-6 max-w-xl">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 block">
            {t.vouchers.redeemCode}
          </label>
          <div className="flex gap-2">
            <input
              id="voucher-code-input"
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder={t.vouchers.enterCode}
              className={`flex-1 px-4 py-2.5 rounded-xl border text-xs font-mono uppercase tracking-wider outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'
              }`}
            />
            <button
              id="submit-redeem-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all whitespace-nowrap"
            >
              {t.vouchers.redeemBtn}
            </button>
          </div>

          {redeemStatus === 'SUCCESS' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {t.vouchers.successRedeem}
            </div>
          )}
          {redeemStatus === 'ERROR' && (
            <div className="text-xs text-rose-500 font-medium mt-2 animate-in fade-in">
              {errorMessage}
            </div>
          )}
        </form>
      </div>

      {/* Grid of Available Vouchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t.vouchers.availableVouchers}
          </h3>
          <span className="text-xs text-slate-400">
            {vouchers.filter((v) => !v.isRedeemed).length} Voucher Siap Digunakan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`p-5 rounded-2xl border relative overflow-hidden transition-all ${
                voucher.isRedeemed
                  ? 'opacity-60 bg-slate-100 dark:bg-slate-900/40 border-slate-300 dark:border-slate-800'
                  : theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-white border-emerald-100 shadow-xs hover:border-emerald-300'
              }`}
            >
              {/* Left Notch / Decorative Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      voucher.type === 'RAMADAN_BLESSING'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : voucher.type === 'YIELD_BOOSTER'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-teal-500/10 text-teal-400'
                    }`}
                  >
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {voucher.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {voucher.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Exp: {voucher.expiresAt}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-emerald-500">
                        {voucher.shariaContract}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-500">
                    {formatIDR(voucher.cashValueIDR)}
                  </div>
                  {voucher.earnBoosterPercent > 0 && (
                    <div className="text-[10px] font-bold text-amber-500 mt-0.5">
                      +{voucher.earnBoosterPercent}% APY Booster
                    </div>
                  )}
                </div>
              </div>

              {/* Code Bar & Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                    {voucher.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="p-1 text-slate-400 hover:text-emerald-500"
                    title="Salin Kode Voucher"
                  >
                    {copiedCode === voucher.code ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div>
                  {voucher.isRedeemed ? (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Ditukarkan
                    </span>
                  ) : !voucher.isClaimed ? (
                    <button
                      onClick={() => onClaimVoucher(voucher.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
                    >
                      {t.vouchers.claim}
                    </button>
                  ) : (
                    <button
                      onClick={() => onRedeemVoucher(voucher.code)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      {t.vouchers.useVoucher}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Gift Voucher */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-500" />
              {t.vouchers.generateVoucher}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Buat voucher syariah untuk keluarga, rekan bisnis, atau mustahik dengan jaminan saldo terverifikasi.
            </p>

            <form onSubmit={handleCreateCustomVoucher} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Judul Voucher</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Voucher Sedekah Berkah Idul Fitri"
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nilai Saldo (IDR)</label>
                <select
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="100000">Rp 100.000</option>
                  <option value="250000">Rp 250.000</option>
                  <option value="500000">Rp 500.000</option>
                  <option value="1000000">Rp 1.000.000</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Booster Imbal Hasil Trading</label>
                <select
                  value={newBooster}
                  onChange={(e) => setNewBooster(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="1.5">+1.5% APY Booster</option>
                  <option value="3.0">+3.0% APY Booster</option>
                  <option value="5.0">+5.0% APY Booster</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 font-semibold"
                >
                  {t.common.close}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Terbitkan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
