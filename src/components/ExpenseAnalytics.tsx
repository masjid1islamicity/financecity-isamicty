import React, { useState } from 'react';
import {
  PieChart,
  Building,
  RefreshCw,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ExpenseItem,
  SmartBill,
  BankAccountSync,
  Language,
  Theme,
} from '../types';
import { translations } from '../utils/translations';

interface ExpenseAnalyticsProps {
  expenses: ExpenseItem[];
  bills: SmartBill[];
  connectedBanks: BankAccountSync[];
  onSyncBankingAPI: () => Promise<void>;
  onPayBill: (billId: string) => void;
  onToggleAutoDebit: (billId: string) => void;
  onAddNewBill: (bill: SmartBill) => void;
  language: Language;
  theme: Theme;
}

export const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({
  expenses,
  bills,
  connectedBanks,
  onSyncBankingAPI,
  onPayBill,
  onToggleAutoDebit,
  onAddNewBill,
  language,
  theme,
}) => {
  const t = translations[language];
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // New bill modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('350000');
  const [billDueDate, setBillDueDate] = useState('2026-09-30');

  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + curr.amountIDR, 0);

  const categoryTotals: Record<string, number> = {
    zakat_infaq: 0,
    kebutuhan_pokok: 0,
    makanan_halal: 0,
    utilitas_rumah: 0,
    investasi_syariah: 0,
    bisnis_pendidikan: 0,
  };

  expenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amountIDR;
    }
  });

  const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
    zakat_infaq: { label: 'Zakat & Infaq', color: 'text-teal-400', bg: 'bg-teal-400' },
    kebutuhan_pokok: { label: 'Kebutuhan Pokok', color: 'text-emerald-500', bg: 'bg-emerald-500' },
    makanan_halal: { label: 'Makanan Halal', color: 'text-amber-500', bg: 'bg-amber-500' },
    utilitas_rumah: { label: 'Utilitas & Rumah', color: 'text-sky-400', bg: 'bg-sky-400' },
    investasi_syariah: { label: 'Investasi Sukuk & Aset', color: 'text-indigo-400', bg: 'bg-indigo-400' },
    bisnis_pendidikan: { label: 'Bisnis & Edukasi', color: 'text-rose-400', bg: 'bg-rose-400' },
  };

  const handleTriggerBankSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      await onSyncBankingAPI();
      setSyncMessage(t.expenses.syncedSuccess);
      setTimeout(() => setSyncMessage(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newBill: SmartBill = {
      id: 'bill-' + Date.now(),
      title: billTitle || 'Tagihan Rutin Baru',
      biller: 'Penyedia Layanan Terdaftar',
      accountNumber: '99281' + Math.floor(1000 + Math.random() * 9000),
      amountIDR: Number(billAmount) || 250000,
      dueDate: billDueDate,
      isPaid: false,
      autoPayWithProfits: true,
      iconType: 'electric',
    };
    onAddNewBill(newBill);
    setShowBillModal(false);
    setBillTitle('');
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
      {/* Top Banner with Banking API Sync */}
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
                <Building className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.expenses.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                Open Banking Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t.expenses.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="sync-banking-api-btn"
              onClick={handleTriggerBankSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? t.expenses.syncing : t.expenses.syncBankBtn}
            </button>
          </div>
        </div>

        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            {syncMessage}
          </div>
        )}

        {/* Connected Banks List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
          {connectedBanks.map((bank) => (
            <div
              key={bank.bankId}
              className={`p-3.5 rounded-xl border flex items-center justify-between ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800/80'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {bank.bankName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Rek: {bank.accountNumber}
                </div>
                <div className="text-xs font-bold text-emerald-500 mt-1">
                  Saldo: {formatIDR(bank.balanceIDR)}
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <div>Terhubung API</div>
                <div>{bank.lastSynced}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Breakdown Progress & Metrics */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                {t.expenses.categoryBreakdown}
              </h3>
              <p className="text-xs text-slate-400">
                Alokasi keuangan berdasarkan prinsip Maqasid al-Shariah.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {t.expenses.totalExpenses}
              </span>
              <div className="text-base font-black text-slate-900 dark:text-slate-100">
                {formatIDR(totalMonthlyExpenses)}
              </div>
            </div>
          </div>

          {/* Visual Category Bars */}
          <div className="space-y-3.5 mt-6">
            {Object.entries(categoryTotals).map(([catKey, amount]) => {
              const meta = categoryLabels[catKey] || {
                label: catKey,
                color: 'text-slate-400',
                bg: 'bg-slate-400',
              };
              const percent = totalMonthlyExpenses > 0
                ? Math.round((amount / totalMonthlyExpenses) * 100)
                : 0;

              return (
                <div key={catKey} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {meta.label}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatIDR(amount)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${meta.bg} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Transacted Feed */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {t.expenses.recentTransactions}
            </h4>
            <div className="space-y-2">
              {expenses.slice(0, 4).map((exp) => (
                <div
                  key={exp.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    theme === 'dark'
                      ? 'bg-slate-950/40 border-slate-800/80'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {exp.bankSource.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {exp.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {exp.date} • {exp.bankSource} {exp.isAutoSynced && '(API Sync)'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                    -{formatIDR(exp.amountIDR)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Smart Bill Reminders */}
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-500" />
              {t.bills.title}
            </h3>
            <button
              onClick={() => setShowBillModal(true)}
              className="p-1 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
              title="Tambah Tagihan"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            {t.bills.subtitle}
          </p>

          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  bill.isPaid
                    ? 'opacity-60 bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                    : theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {bill.title}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {bill.biller} • {bill.accountNumber}
                    </div>
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1">
                      {formatIDR(bill.amountIDR)}
                    </div>
                  </div>

                  <div>
                    {bill.isPaid ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Lunas
                      </span>
                    ) : (
                      <button
                        onClick={() => onPayBill(bill.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors"
                      >
                        {t.bills.payNow}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Jatuh Tempo: {bill.dueDate}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={bill.autoPayWithProfits}
                      onChange={() => onToggleAutoDebit(bill.id)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Auto-Debit Profit</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add New Bill */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="text-base font-bold mb-1">{t.bills.newBill}</h3>
            <p className="text-xs text-slate-400 mb-4">
              Daftarkan pengingat tagihan bulanan untuk auto-debit dari hasil trading kripto syariah.
            </p>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  placeholder="Contoh: Tagihan Air PDAM Rumah"
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Nominal (IDR)</label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none font-mono ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="w-1/3 py-2 rounded-xl border border-slate-300 dark:border-slate-800 font-semibold"
                >
                  {t.common.close}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
