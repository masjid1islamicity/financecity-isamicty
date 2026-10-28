import React, { useState, useEffect } from 'react';
import {
  BellRing,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Settings2,
  Clock,
  Coins,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Volume2,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { SmartZakatAssetThreshold, Language, Theme, PushNotification } from '../types';
import { translations } from '../utils/translations';

interface SmartZakatReminderProps {
  thresholds: SmartZakatAssetThreshold[];
  onUpdateThresholds?: (thresholds: SmartZakatAssetThreshold[]) => void;
  onSendPushNotification: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
  onOpenDisburseZakat?: () => void;
  goldPricePerGramIDR?: number;
  theme: Theme;
  language: Language;
}

export const SmartZakatReminder: React.FC<SmartZakatReminderProps> = ({
  thresholds,
  onUpdateThresholds,
  onSendPushNotification,
  onOpenDisburseZakat,
  goldPricePerGramIDR = 1353000,
  theme,
  language,
}) => {
  const t = translations[language];
  const [items, setItems] = useState<SmartZakatAssetThreshold[]>(thresholds);
  const [selectedLeadDays, setSelectedLeadDays] = useState<number>(3);
  const [autoPushEnabled, setAutoPushEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('threshold-paxg');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with prop changes if any
  useEffect(() => {
    setItems((prev) => {
      if (
        prev.length === thresholds.length &&
        prev.every(
          (p, i) =>
            p.id === thresholds[i]?.id &&
            p.daysRemaining === thresholds[i]?.daysRemaining &&
            p.currentValueIDR === thresholds[i]?.currentValueIDR &&
            p.isNotificationSent === thresholds[i]?.isNotificationSent
        )
      ) {
        return prev;
      }
      return thresholds;
    });
  }, [thresholds]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Find the asset that is closest to Haul (e.g. PAXG which has 3 days remaining)
  const imminentAsset = items.find((item) => item.isNisabReached && item.daysRemaining <= selectedLeadDays) || items[0];

  // Trigger simulated push notification for the 3-day reminder
  const handleTrigger3DayReminder = (asset: SmartZakatAssetThreshold) => {
    onSendPushNotification({
      title: `🔔 Pengingat Cerdas: Haul ${asset.assetName} Tinggal ${asset.daysRemaining} Hari!`,
      message: `Aset ${asset.assetSymbol} senilai ${formatIDR(asset.currentValueIDR)} telah melampaui ${asset.nisabUnitLabel} selama masa 1 tahun penuh (Haul: ${asset.calculatedHaulDate}). Estimasi Zakat Maal wajib (2.5%): ${formatIDR(asset.estimatedZakatDueIDR)}.`,
      type: 'HAUL_REMINDER',
      amountIDR: asset.estimatedZakatDueIDR,
      actionUrl: '#smart-zakat-reminder',
      actionLabel: 'Tunaikan Zakat Sekarang',
    });

    // Mark as notified in local state
    const updated = items.map((it) => (it.id === asset.id ? { ...it, isNotificationSent: true } : it));
    setItems(updated);
    if (onUpdateThresholds) {
      onUpdateThresholds(updated);
    }

    // Play subtle chime sound effect using Web Audio API if enabled
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        // Silently ignore if audio autoplay policy restricts
      }
    }

    setToastMessage(`Notifikasi Push H-${asset.daysRemaining} Haul berhasil dikirimkan ke perangkat Anda!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleAutoPush = () => {
    const next = !autoPushEnabled;
    setAutoPushEnabled(next);
    setToastMessage(next ? 'Sistem Pengingat Cerdas Otomatis diaktifkan.' : 'Sistem Pengingat Cerdas dinonaktifkan.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div
      id="smart-zakat-reminder-container"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-emerald-100 shadow-xs'
      }`}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-200 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 relative">
            <BellRing className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Smart Zakat Reminder System
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/30">
                Haul H-3 Auto-Push
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deteksi otomatis siklus kepemilikan harta 1 tahun penuh (*Haul*) melampaui ambang batas Nisab 85g emas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-reminder-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              showSettings
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Konfigurasi H-3</span>
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            id="test-haul-push-btn"
            onClick={() => handleTrigger3DayReminder(imminentAsset)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            title="Kirim Notifikasi Push Simulasi H-3"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim Notifikasi H-3</span>
          </button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 transition-all text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                Waktu Pengingat Sebelum Haul:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    onClick={() => setSelectedLeadDays(days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      selectedLeadDays === days
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    H-{days} Hari {days === 3 && '(Standar)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                Pengaturan Saluran Push:
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAutoPush}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    autoPushEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${autoPushEnabled ? 'bg-emerald-300 animate-pulse' : 'bg-slate-400'}`} />
                  {autoPushEnabled ? 'Auto-Push Aktif' : 'Auto-Push Nonaktif'}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold border transition-colors ${
                    soundEnabled
                      ? 'border-teal-500/40 text-teal-400 bg-teal-500/10'
                      : 'border-slate-300 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {soundEnabled ? 'Suara Lonceng ON' : 'Mute'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                Ambang Batas Nisab Emas Acuan:
              </label>
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800/80 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                85g Emas × {formatIDR(goldPricePerGramIDR)}/g = <span className="font-bold text-amber-500">{formatIDR(85 * goldPricePerGramIDR)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Countdown Alert: 3 Days Imminent Asset */}
      {imminentAsset && (
        <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 font-black flex flex-col items-center justify-center min-w-[64px] shadow-lg shadow-amber-500/20">
                <span className="text-2xl leading-none font-black">{imminentAsset.daysRemaining}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider">HARI LAGI</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Peringatan Wajib Zakat H-3
                  </span>
                  <span className="text-xs text-slate-400">
                    Jatuh Tempo Haul: <strong className="text-slate-200">{imminentAsset.calculatedHaulDate}</strong>
                  </span>
                </div>
                <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Haul 1 Tahun {imminentAsset.assetName} Akan Tercapai dalam 3 Hari
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5 max-w-2xl">
                  Harta telah mengendap melampaui ambang batas Nisab ({imminentAsset.nisabUnitLabel}) sejak{' '}
                  <strong>{imminentAsset.wealthAcquisitionDate}</strong>. Sistem telah menjadwalkan dan mengirimkan notifikasi push pengingat ke perangkat Anda.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:border-l lg:border-amber-500/20 lg:pl-6">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Kewajiban Zakat Maal (2.5%)
                </span>
                <span className="text-lg md:text-xl font-black text-amber-400">
                  {formatIDR(imminentAsset.estimatedZakatDueIDR)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Dari total saldo: {formatIDR(imminentAsset.currentValueIDR)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onOpenDisburseZakat && (
                  <button
                    id="haul-direct-disburse-btn"
                    onClick={onOpenDisburseZakat}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-teal-500/20 whitespace-nowrap"
                  >
                    <span>Salurkan ke BAZNAS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Threshold Tracking Grid */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daftar Ambang Batas Aset & Jadwal Haul 1 Tahun
            </h4>
            <p className="text-[11px] text-slate-500">
              Evaluasi kepemilikan penuh harta per kategori sesuai ketentuan fiqih zakat maal.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {items.filter((i) => i.isNisabReached).length}/{items.length} Aset Mencapai Nisab
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {items.map((asset) => {
            const isImminent = asset.isNisabReached && asset.daysRemaining <= selectedLeadDays;
            const isSelected = selectedAssetId === asset.id;

            return (
              <div
                key={asset.id}
                id={`threshold-card-${asset.id}`}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isImminent
                    ? 'border-amber-500/60 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/20'
                    : asset.isNisabReached
                    ? theme === 'dark'
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                    : theme === 'dark'
                    ? 'border-slate-800/60 bg-slate-900/30 opacity-70'
                    : 'border-slate-200/60 bg-slate-50/40 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg font-bold text-xs ${
                        asset.category === 'GOLD'
                          ? 'bg-amber-500/20 text-amber-400'
                          : asset.category === 'COMMERCIAL_TRADING'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-sky-500/20 text-sky-400'
                      }`}
                    >
                      {asset.category === 'GOLD' ? 'EMAS' : asset.category === 'COMMERCIAL_TRADING' ? 'TRADING' : 'KAS'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {asset.assetName}
                      </h5>
                      <span className="text-[11px] font-mono text-slate-400">
                        {asset.assetSymbol}
                      </span>
                    </div>
                  </div>

                  {asset.isNisabReached ? (
                    isImminent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-slate-950 animate-pulse">
                        H-{asset.daysRemaining} Hari
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {asset.daysRemaining} Hari Lagi
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      Belum Nisab
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Nilai Aset Terkini:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatIDR(asset.currentValueIDR)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ambang Nisab:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {formatIDR(asset.nisabThresholdIDR)}
                    </span>
                  </div>
                </div>

                {/* Dates & Status Footer */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Haul: <strong>{asset.calculatedHaulDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {asset.isNisabReached && (
                      <span className="font-bold text-amber-500">
                        Zakat: {formatIDR(asset.estimatedZakatDueIDR)}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrigger3DayReminder(asset);
                      }}
                      title="Kirim Notifikasi Push"
                      className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sharia Reference & Governance note */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Landasan Syariah Haul & Ambang Batas Nisab:
            </span>
            <p className="text-[11px] leading-relaxed">
              *"Tidak ada zakat atas harta hingga berlalu masa satu tahun (haul)"* (HR. Abu Dawud No. 1573). Sistem pengingat ini otomatis mendeteksi hari ke-352 (H-3 sebelum haul genap 354 hari qamariyah / 365 hari syamsiyah) untuk memberikan waktu persiapan likuiditas dan pemilihan asnaf mustahik terverifikasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
