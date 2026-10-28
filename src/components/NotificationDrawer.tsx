import React, { useState } from 'react';
import {
  Bell,
  X,
  TrendingUp,
  Ticket,
  ShieldCheck,
  Calendar,
  Building,
  CheckCircle2,
  Trash2,
  Volume2,
  HeartHandshake,
  BellRing,
  ArrowRight,
  Coins,
} from 'lucide-react';
import { PushNotification, Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onAddSampleNotif: () => void;
  onOpenZakat?: () => void;
  language: Language;
  theme: Theme;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onAddSampleNotif,
  onOpenZakat,
  language,
  theme,
}) => {
  const t = translations[language];
  const [filter, setFilter] = useState<'ALL' | 'GOLD' | 'TRADE' | 'BILL' | 'BANK' | 'ZAKAT'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    if (filter === 'GOLD') return n.type === 'GOLD_PRICE_ALERT';
    if (filter === 'TRADE') return n.type === 'TRADE_SUCCESS';
    if (filter === 'BILL') return n.type === 'BILL_REMINDER';
    if (filter === 'BANK') return n.type === 'BANK_SYNC';
    if (filter === 'ZAKAT') return n.type === 'ZAKAT_DISBURSED' || n.type === 'HAUL_REMINDER';
    return true;
  });

  const getIcon = (type: PushNotification['type']) => {
    switch (type) {
      case 'GOLD_PRICE_ALERT':
        return <Coins className="w-4 h-4 text-amber-400 animate-bounce" />;
      case 'HAUL_REMINDER':
        return <BellRing className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'TRADE_SUCCESS':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'VOUCHER':
        return <Ticket className="w-4 h-4 text-amber-500" />;
      case 'BILL_REMINDER':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'BANK_SYNC':
        return <Building className="w-4 h-4 text-purple-500" />;
      case 'ZAKAT_DISBURSED':
        return <HeartHandshake className="w-4 h-4 text-teal-400" />;
      case 'SECURITY':
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div
      id="notification-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs"
    >
      <div
        id="notification-drawer-panel"
        className={`w-full max-w-md h-full flex flex-col border-l shadow-2xl transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">{t.notifications.title}</h3>
              <p className="text-[11px] text-slate-400">
                {notifications.length} riwayat aktivitas akun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="test-push-notif-btn"
              onClick={onAddSampleNotif}
              title="Kirim Uji Coba Notifikasi Push Instan"
              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 text-xs flex items-center gap-1 font-medium"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">Tes Push</span>
            </button>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-2 flex items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(['ALL', 'GOLD', 'ZAKAT', 'TRADE', 'BILL', 'BANK'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  filter === cat
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat === 'ALL'
                  ? 'Semua'
                  : cat === 'GOLD'
                  ? 'Emas PAXG'
                  : cat === 'ZAKAT'
                  ? 'Zakat & Haul'
                  : cat === 'TRADE'
                  ? 'Trading'
                  : cat === 'BILL'
                  ? 'Tagihan'
                  : 'Bank'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              id="mark-all-read-btn"
              onClick={onMarkAllRead}
              title={t.notifications.markAllRead}
              className="p-1 text-slate-400 hover:text-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              id="clear-all-notif-btn"
              onClick={onClearAll}
              title="Hapus Semua"
              className="p-1 text-slate-400 hover:text-rose-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Push Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              {t.notifications.empty}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all ${
                  item.read
                    ? theme === 'dark'
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                      : 'bg-slate-50 border-slate-200/60 opacity-80'
                    : theme === 'dark'
                    ? 'bg-slate-800/60 border-emerald-500/30 shadow-xs'
                    : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    {item.amountIDR && (
                      <span
                        className={`inline-block mt-1 text-[11px] font-bold ${
                          item.type === 'HAUL_REMINDER' ? 'text-amber-400' : 'text-emerald-500'
                        }`}
                      >
                        {item.type === 'HAUL_REMINDER' ? 'Kewajiban Zakat: ' : '+'}Rp {item.amountIDR.toLocaleString('id-ID')}
                      </span>
                    )}

                    {item.type === 'HAUL_REMINDER' && onOpenZakat && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <button
                          onClick={() => {
                            onClose();
                            onOpenZakat();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold transition-all shadow-xs"
                        >
                          <span>{item.actionLabel || 'Tunaikan Zakat via BAZNAS'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t text-center text-[10px] text-slate-400 border-slate-200 dark:border-slate-800">
          Enkripsi Push Notifikasi End-to-End dengan Verifikasi Kunci Perangkat
        </div>
      </div>
    </div>
  );
};
