import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Coins,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Scale,
  DollarSign,
  X,
  Clock,
  Zap,
} from 'lucide-react';
import { CryptoAsset, GoldPriceThresholdAlert, Language, PushNotification, Theme } from '../types';
import { formatRupiah, formatRupiahCompact } from '../utils/shariaWealthProjectionEngine';

interface GoldPriceAlertManagerProps {
  assets: CryptoAsset[];
  totalBalanceIDR: number;
  theme: Theme;
  language: Language;
  onSendPushNotification?: (notification: Omit<PushNotification, 'id' | 'timestamp' | 'read'>) => void;
  onNavigateToTab?: (tab: string) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

const STORAGE_KEY = 'sharia_gold_price_alerts_v1';

// Web Audio API gold bell chime synthesizer (no external audio assets required)
const playGoldBellChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (e) {
    // Audio context may be restricted before user interaction
  }
};

export const GoldPriceAlertManager: React.FC<GoldPriceAlertManagerProps> = ({
  assets,
  totalBalanceIDR,
  theme,
  language,
  onSendPushNotification,
  onNavigateToTab,
  isOpenModal = false,
  onCloseModal,
}) => {
  // Find PAX Gold asset
  const paxgAsset = assets.find((a) => a.symbol === 'PAXG');
  const pricePerTroyOzIDR = paxgAsset?.priceIDR || 42100000;
  const currentPricePerGramIDR = Math.round(pricePerTroyOzIDR / 31.1035); // ~Rp 1.353.545 / gram

  // User's estimated gold holdings in portfolio (35% allocation = ~Rp 121.887.500 => ~90.05 gram)
  const goldHoldingValueIDR = totalBalanceIDR * 0.35;
  const goldHoldingGrams = Number((goldHoldingValueIDR / currentPricePerGramIDR).toFixed(2));
  const goldHoldingOz = Number((goldHoldingGrams / 31.1035).toFixed(3));

  // State: List of alerts
  const [alerts, setAlerts] = useState<GoldPriceThresholdAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    // Default initial alert presets
    return [
      {
        id: 'ALERT-GOLD-1',
        assetSymbol: 'PAXG',
        assetName: 'PAX Gold (Emas Murni LBMA)',
        targetPricePerGramIDR: 1450000,
        targetTotalValuationIDR: Math.round(1450000 * 90.05),
        condition: 'ABOVE_OR_EQUAL',
        label: 'Target Take Profit & Salur Zakat Maal Emas',
        isEnabled: true,
        isTriggered: false,
        createdAt: '2026-09-20',
        actionOnTrigger: 'REBALANCE_PROMPT',
        notificationChannel: 'ALL',
      },
      {
        id: 'ALERT-GOLD-2',
        assetSymbol: 'PAXG',
        assetName: 'PAX Gold (Emas Murni LBMA)',
        targetPricePerGramIDR: 1550000,
        targetTotalValuationIDR: Math.round(1550000 * 90.05),
        condition: 'ABOVE_OR_EQUAL',
        label: 'All-Time High Emas Fisik Baru (Realisasi Umroh)',
        isEnabled: true,
        isTriggered: false,
        createdAt: '2026-09-22',
        actionOnTrigger: 'NOTIFY_ONLY',
        notificationChannel: 'ALL',
      },
    ];
  });

  // Form State for creating new alert
  const [targetPricePerGram, setTargetPricePerGram] = useState<number>(1450000);
  const [condition, setCondition] = useState<'ABOVE_OR_EQUAL' | 'BELOW_OR_EQUAL'>('ABOVE_OR_EQUAL');
  const [label, setLabel] = useState<string>('Target Kenaikan Harga Emas');
  const [actionOnTrigger, setActionOnTrigger] = useState<'NOTIFY_ONLY' | 'REBALANCE_PROMPT' | 'ZAKAT_RECALCULATE'>('REBALANCE_PROMPT');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {
      // Ignore
    }
  }, [alerts]);

  // Derived Target Valuation
  const calculatedTotalValuation = Math.round(targetPricePerGram * goldHoldingGrams);
  const percentChangeFromCurrent = Number(
    (((targetPricePerGram - currentPricePerGramIDR) / currentPricePerGramIDR) * 100).toFixed(1)
  );

  // Handler: Add new alert
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPricePerGram || targetPricePerGram <= 0) return;

    const newAlert: GoldPriceThresholdAlert = {
      id: 'ALERT-GOLD-' + Date.now(),
      assetSymbol: 'PAXG',
      assetName: 'PAX Gold (Emas Murni LBMA)',
      targetPricePerGramIDR: targetPricePerGram,
      targetTotalValuationIDR: calculatedTotalValuation,
      condition,
      label: label.trim() || 'Target Ambang Batas Emas',
      isEnabled: true,
      isTriggered: false,
      createdAt: new Date().toISOString().split('T')[0],
      actionOnTrigger,
      notificationChannel: soundEnabled ? 'ALL' : 'PUSH',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setIsSuccessToast(`Alert ambang batas Rp ${targetPricePerGram.toLocaleString('id-ID')}/gram berhasil dibuat!`);
    setTimeout(() => setIsSuccessToast(null), 4000);
  };

  // Handler: Toggle active
  const handleToggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  // Handler: Delete alert
  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Handler: Test / Simulate Trigger
  const handleSimulateTrigger = (alert: GoldPriceThresholdAlert) => {
    if (soundEnabled) {
      playGoldBellChime();
    }

    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const formattedPrice = `Rp ${alert.targetPricePerGramIDR.toLocaleString('id-ID')}`;
    const formattedValuation = `Rp ${alert.targetTotalValuationIDR.toLocaleString('id-ID')}`;

    if (onSendPushNotification) {
      onSendPushNotification({
        title: `🔔 Target Valuasi Emas (PAXG) Tercapai!`,
        message: `Instrumen emas fisik PAXG telah menyentuh ${formattedPrice}/gram (Total Valuasi Portofolio Emas: ${formattedValuation}). Catatan: "${alert.label}". Akad Bai' as-Sarf terverifikasi AAOIFI No. 57.`,
        type: 'GOLD_PRICE_ALERT',
        amountIDR: alert.targetTotalValuationIDR,
        actionLabel: alert.actionOnTrigger === 'REBALANCE_PROMPT' ? 'Buka Smart Rebalance' : 'Cek Nisab Zakat',
      });
    }

    // Mark as triggered in state
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alert.id
          ? { ...a, isTriggered: true, lastTriggeredAt: timestamp }
          : a
      )
    );

    setIsSuccessToast(`Notifikasi pengingat harga emas berhasil dikirim & nada dering dibunyikan!`);
    setTimeout(() => setIsSuccessToast(null), 4000);
  };

  // Content body
  const content = (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-yellow-500/5 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Coins className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Notifikasi Ambang Batas Harga Emas Fisik (PAXG)</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LBMA London Standard
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Terima pemberitahuan seketika saat emas fisik PAX Gold mencapai target harga per gram atau valuasi portofolio untuk keperluan take profit halal, akumulasi spot, atau penyaluran zakat maal.
            </p>
          </div>
        </div>

        {/* Live Gold Price Pill */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 self-start md:self-auto shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Harga Emas Spot Terkini</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              Rp {currentPricePerGramIDR.toLocaleString('id-ID')}
              <span className="text-xs text-slate-400 font-normal"> /gram</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ~Rp {pricePerTroyOzIDR.toLocaleString('id-ID')} /troy oz
            </div>
          </div>
        </div>
      </div>

      {/* Gold Holding Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-[11px] text-slate-400 font-semibold">Kepemilikan Emas Murni Anda</div>
          <div className="text-base font-black text-slate-100 font-mono mt-1">
            {goldHoldingGrams} Gram Emas
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">
            ~{goldHoldingOz} Troy Ounce (Brink's Vault London)
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="text-[11px] text-slate-400 font-semibold">Valuasi Emas Saat Ini</div>
          <div className="text-base font-black text-emerald-400 font-mono mt-1">
            {formatRupiah(goldHoldingValueIDR)}
          </div>
          <div className="text-[10px] text-emerald-300 mt-0.5">
            Porsi 35% Portofolio Syariah (Perisai Inflasi)
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-teal-500/20 bg-teal-500/5">
          <div className="text-[11px] text-slate-400 font-semibold">Batas Nisab Zakat Maal (85g)</div>
          <div className="text-base font-black text-teal-300 font-mono mt-1">
            Rp {(85 * currentPricePerGramIDR).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-teal-400 mt-0.5">
            Status: {goldHoldingGrams >= 85 ? '✅ Melebihi Nisab (Wajib Zakat 2.5%)' : 'Belum Mencapai Nisab'}
          </div>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {isSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{isSuccessToast}</span>
        </div>
      )}

      {/* Main Grid: Create Alert Form (Left) & Active Alerts List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Pasang Ambang Batas Baru</span>
            </h4>
            <span className="text-[10px] text-slate-400">Notifikasi Otomatis</span>
          </div>

          <form onSubmit={handleAddAlert} className="space-y-4 text-xs">
            {/* Condition Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Kondisi Pemicu Alert:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCondition('ABOVE_OR_EQUAL');
                    setLabel('Target Kenaikan / Take Profit Emas');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 font-bold ${
                    condition === 'ABOVE_OR_EQUAL'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Naik Mencapai (≥)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCondition('BELOW_OR_EQUAL');
                    setLabel('Target Dip Buy / Akumulasi Emas');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-1.5 font-bold ${
                    condition === 'BELOW_OR_EQUAL'
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Turun Mencapai (≤)</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Pilihan Cepat Target Harga Emas:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: '+5% (Rp 1.421k)', price: Math.round(currentPricePerGramIDR * 1.05) },
                  { label: '+10% (Rp 1.488k)', price: Math.round(currentPricePerGramIDR * 1.1) },
                  { label: 'ATH Rp 1.500.000', price: 1500000 },
                  { label: 'Super Bull Rp 1.600k', price: 1600000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setTargetPricePerGram(preset.price)}
                    className={`py-1.5 px-2 rounded-lg border text-[10px] font-mono font-semibold transition-all ${
                      targetPricePerGram === preset.price
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Target Price Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400">Target Harga per Gram (IDR):</label>
                <span className="text-[10px] font-mono text-amber-400">
                  {percentChangeFromCurrent >= 0 ? `+${percentChangeFromCurrent}%` : `${percentChangeFromCurrent}%`} dari harga kini
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-xs">Rp</span>
                <input
                  type="number"
                  step="5000"
                  value={targetPricePerGram}
                  onChange={(e) => setTargetPricePerGram(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="1450000"
                  required
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                <span>Setara Troy Ounce: Rp {Math.round(targetPricePerGram * 31.1035).toLocaleString('id-ID')}</span>
                <span className="font-bold text-slate-300">Valuasi: {formatRupiahCompact(calculatedTotalValuation)}</span>
              </div>
            </div>

            {/* Note / Label */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Catatan Sasaran:</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="Contoh: Realokasi Umroh atau Zakat Maal"
                required
              />
            </div>

            {/* Action on Trigger */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Rekomendasi Tindakan Saat Terpicu:</label>
              <select
                value={actionOnTrigger}
                onChange={(e) => setActionOnTrigger(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="REBALANCE_PROMPT">Tampilkan Rekomendasi Smart Rebalance (1-Klik)</option>
                <option value="ZAKAT_RECALCULATE">Rekalkulasi Kewajiban Zakat Maal Emas (2.5%)</option>
                <option value="NOTIFY_ONLY">Hanya Kirimkan Notifikasi & Bunyikan Chime</option>
              </select>
            </div>

            {/* Sound switch */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="rounded border-slate-700 accent-amber-500"
                />
                <span className="flex items-center gap-1.5">
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Bunyikan Chime Suara Emas</span>
                </span>
              </label>

              <button
                type="button"
                onClick={playGoldBellChime}
                className="text-[10px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Uji Suara 🔔
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Simpan Ambang Batas Emas</span>
            </button>
          </form>
        </div>

        {/* Active Alerts List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>Daftar Ambang Batas Aktif ({alerts.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Sinkronisasi Push Notification & Ledger
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700 text-slate-400 space-y-2">
              <Coins className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-semibold text-xs">Belum ada target ambang batas emas</div>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Gunakan formulir di samping untuk memasang pengingat kenaikan harga emas atau target valuasi.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => {
                const isAbove = alert.condition === 'ABOVE_OR_EQUAL';
                const deltaToCurrent = alert.targetPricePerGramIDR - currentPricePerGramIDR;
                const deltaPct = Number(((deltaToCurrent / currentPricePerGramIDR) * 100).toFixed(1));

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.isTriggered
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : alert.isEnabled
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                        : 'border-slate-800 bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                              isAbove
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                            }`}
                          >
                            {isAbove ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            <span>{isAbove ? '≥' : '≤'} Rp {alert.targetPricePerGramIDR.toLocaleString('id-ID')}/g</span>
                          </span>

                          <span className="font-bold text-slate-200 text-xs">
                            {alert.label}
                          </span>

                          {alert.isTriggered && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/30 text-amber-200 animate-pulse">
                              Tercapai {alert.lastTriggeredAt || 'Hari ini'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                          <span>
                            Valuasi Emas: <strong className="text-slate-200 font-mono">{formatRupiah(alert.targetTotalValuationIDR)}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Jarak: <strong className={deltaPct >= 0 ? 'text-amber-400' : 'text-cyan-400'}>
                              {deltaPct >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="capitalize text-slate-400">
                            {alert.actionOnTrigger === 'REBALANCE_PROMPT'
                              ? 'Prompt Rebalance'
                              : alert.actionOnTrigger === 'ZAKAT_RECALCULATE'
                              ? 'Kalkulasi Zakat'
                              : 'Notifikasi Saja'}
                          </span>
                        </div>
                      </div>

                      {/* Right action tools */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Simulate Trigger Button */}
                        <button
                          type="button"
                          onClick={() => handleSimulateTrigger(alert)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs"
                          title="Uji simulasi pengiriman push notification & suara bell"
                        >
                          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="hidden sm:inline">Tes Trigger</span>
                        </button>

                        {/* Toggle active */}
                        <button
                          type="button"
                          onClick={() => handleToggleAlert(alert.id)}
                          className={`w-8 h-5 rounded-full transition-colors relative flex items-center ${
                            alert.isEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                              alert.isEnabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Hapus alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sharia Compliance Guarantee for Gold Trades */}
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-2.5 text-xs text-emerald-300">
            <Scale className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Prinsip Bai' as-Sarf (Standar AAOIFI No. 57):</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Setiap 1 token PAXG mewakili 1 troy ounce emas murni fisik (99.99% LBMA Good Delivery) di brankas Brink's London. Transaksi spot terjadi secara seketika (*Taqabudh Haqiqi*) tanpa penundaan serah terima, bebas dari Riba Nasi'ah maupun spekulasi margin derivatif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // If used as modal
  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
        <div
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-emerald-100 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold">Pengaturan Ambang Batas Harga Emas</h3>
            </div>
            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {content}
        </div>
      </div>
    );
  }

  // In-line view
  return (
    <div
      id="gold-price-alert-manager-card"
      className={`p-6 rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {content}
    </div>
  );
};
