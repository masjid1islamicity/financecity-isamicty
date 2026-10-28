import React, { useState, useMemo } from 'react';
import {
  Share2,
  Check,
  Copy,
  Sparkles,
  Award,
  ShieldCheck,
  Users,
  ExternalLink,
  X,
  HeartHandshake,
  TrendingUp,
  GraduationCap,
  Store,
  Stethoscope,
  Globe,
  MessageCircle,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatImpactGoalConfig } from '../types';

interface ZakatSocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  disbursedRecords: ZakatSummaryRecord[];
  annualImpactGoal?: ZakatImpactGoalConfig | null;
  annualTargetIDR?: number;
  remainingReserveIDR?: number;
  theme: Theme;
  language: Language;
}

export const ZakatSocialShareModal: React.FC<ZakatSocialShareModalProps> = ({
  isOpen,
  onClose,
  disbursedRecords,
  annualImpactGoal,
  annualTargetIDR = 15000000,
  remainingReserveIDR = 3750000,
  theme,
  language,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<'milestone' | 'impact' | 'tax'>('milestone');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Calculations
  const totalPaidIDR = useMemo(() => {
    return disbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  }, [disbursedRecords]);

  const targetAmount = annualTargetIDR || 15000000;
  const percentAchieved = Math.round((totalPaidIDR / (targetAmount || 1)) * 100);
  const totalBeneficiaries = annualImpactGoal?.targetBeneficiariesCount || Math.max(18, disbursedRecords.length * 6);
  const educationKits = annualImpactGoal?.targetEducationKits || 25;
  const umkmKits = annualImpactGoal?.targetUmkmKits || 15;
  const healthPackages = annualImpactGoal?.targetHealthPackages || 80;

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://financecity.app';

  // Social share text templates
  const shareTemplates = useMemo(() => {
    return {
      milestone: {
        title: 'Milestone Capaian Zakat',
        badge: 'Capaian Finansial & Target',
        caption: `Alhamdulillah! Saya telah menunaikan zakat maal sebesar ${formatIDR(
          totalPaidIDR
        )} (${percentAchieved}% dari target tahunan) menjangkau ${totalBeneficiaries}+ mustahik melalui lembaga mitra resmi BAZNAS RI di @FinanceCity. Mari sucikan harta dan tebarkan berkah bagi sesama! 🌿✨\n\n#ZakatMaal #FinanceCity #BAZNAS #ImpactReport #BerkahBerdampak #SocialImpact`,
      },
      impact: {
        title: 'Dampak Sosial & Santri 3T',
        badge: 'Pemberdayaan Nyata',
        caption: `Berdampak nyata bersama zakat! Telah tersalurkan dana zakat produktif yang mendukung ${educationKits} beasiswa santri 3T, ${umkmKits} gerobak UMKM mustahik mandiri, serta ${healthPackages} layanan medis dhuafa terverifikasi PSAK 109 & AAOIFI di @FinanceCity. 🤲🎓🛍️\n\n#ZakatProduktif #Santri3T #UMKMBerdikari #SDGs #FinanceCity #MaqasidSyariah`,
      },
      tax: {
        title: 'Akuntabilitas & Pajak SPT PPh',
        badge: 'Kepatuhan Hukum & Syariah',
        caption: `Menunaikan zakat maal secara transparan, diaudit WTP, dan dilengkapi Bukti Setor Zakat (BSZ) resmi sebagai pengurang penghasilan bruto SPT Tahunan PPh Orang Pribadi (UU RI No. 23/2011 Pasal 22). Transparansi akuntabel di @FinanceCity! 📑🏛️\n\n#SadarZakat #PengurangPajak #UU23Tahun2011 #BSZResmi #FinanceCity`,
      },
    };
  }, [totalPaidIDR, percentAchieved, totalBeneficiaries, educationKits, umkmKits, healthPackages]);

  const [customCaption, setCustomCaption] = useState<string>(shareTemplates.milestone.caption);

  // Sync custom caption when template tab changes
  const handleSelectTemplate = (key: 'milestone' | 'impact' | 'tax') => {
    setSelectedTemplate(key);
    setCustomCaption(shareTemplates[key].caption);
  };

  if (!isOpen) return null;

  // Share handlers
  const handleCopyText = () => {
    navigator.clipboard.writeText(customCaption);
    setCopiedStatus('text');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedStatus('url');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleShareTwitter = () => {
    const tweetText = encodeURIComponent(customCaption);
    const shareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    // Copy the formatted text first so user can paste it directly
    navigator.clipboard.writeText(customCaption);
    setCopiedStatus('linkedin-copied');
    setTimeout(() => setCopiedStatus(null), 3000);

    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=650,height=600');
  };

  const handleShareWhatsApp = () => {
    const waText = encodeURIComponent(`${customCaption}\n\nInfo lengkap: ${appUrl}`);
    const shareUrl = `https://api.whatsapp.com/send?text=${waText}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const tgText = encodeURIComponent(customCaption);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${tgText}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Milestone Dampak Zakat Maal & Akuntabilitas Sosial',
          text: customCaption,
          url: appUrl,
        });
      } catch (err) {
        console.error('Web share aborted or failed:', err);
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-teal-500/30 text-slate-100 shadow-teal-950/30'
            : 'bg-white border-teal-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-inner">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">
                  Bagikan Capaian Dampak Zakat ke Media Sosial
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  Share Milestone
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Sebarkan inspirasi kebaikan, transparansi penyaluran zakat maal, dan kepatuhan syariah
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Executive Visual Milestone Shareable Graphic Card Preview */}
          <div
            id="social-share-milestone-preview-card"
            className="relative rounded-2xl overflow-hidden p-5 border border-teal-500/40 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white shadow-xl"
          >
            {/* Ambient Graphic Elements */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Card Brand Header */}
            <div className="flex items-center justify-between border-b border-teal-500/30 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 block">
                    FINANCECITY ISLAMICITY ECOSYSTEM
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Akreditasi BAZNAS RI & PSAK 109
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% BSZ Sah
              </span>
            </div>

            {/* Card Main Highlight */}
            <div className="py-4 relative z-10 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Total Realisasi Penyaluran Zakat Maal (Tahun Buku 2026):
              </span>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono drop-shadow-sm">
                  {formatIDR(totalPaidIDR)}
                </h2>
                <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/30 self-start">
                  {percentAchieved}% Target Terpenuhi
                </span>
              </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 mb-4 overflow-hidden relative z-10 border border-slate-700">
              <div
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, percentAchieved))}%` }}
              />
            </div>

            {/* 4 Pillars of Social Impact Mini Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 relative z-10 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Mustahik</span>
                <span className="font-bold text-teal-300 font-mono text-xs">{totalBeneficiaries}+ Jiwa</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Beasiswa Santri</span>
                <span className="font-bold text-cyan-300 font-mono text-xs">{educationKits} Paket</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">UMKM Mandiri</span>
                <span className="font-bold text-amber-300 font-mono text-xs">{umkmKits} Usaha</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[9px] text-slate-400 block uppercase font-semibold">Kesehatan</span>
                <span className="font-bold text-rose-300 font-mono text-xs">{healthPackages} Pasien</span>
              </div>
            </div>

            {/* Card Footer Verification */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Pengurang Penghasilan Bruto PPh (UU No. 23/2011)
              </span>
              <span className="font-mono text-slate-400">#FinanceCityZakat</span>
            </div>
          </div>

          {/* Template Selection Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pilih Sudut Pandang Pesan (Template):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['milestone', 'impact', 'tax'] as const).map((tplKey) => {
                const isSelected = selectedTemplate === tplKey;
                const tpl = shareTemplates[tplKey];
                return (
                  <button
                    key={tplKey}
                    type="button"
                    onClick={() => handleSelectTemplate(tplKey)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600/10 border-teal-500 text-teal-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">{tpl.title}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{tpl.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Caption Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-600 dark:text-slate-400">
                Teks Pesan Siap Dibagikan (Dapat Diubah):
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedStatus === 'text' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              value={customCaption}
              onChange={(e) => setCustomCaption(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs leading-relaxed outline-none transition-all font-sans resize-none ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-teal-500'
              }`}
            />
          </div>

          {/* Social Platform Direct Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Bagikan Langsung ke Platform:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Twitter / X */}
              <button
                id="share-twitter-btn"
                type="button"
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm border border-slate-700 cursor-pointer active:scale-97"
              >
                {/* Custom X Logo */}
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </button>

              {/* LinkedIn */}
              <button
                id="share-linkedin-btn"
                type="button"
                onClick={handleShareLinkedIn}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-97"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.95 0-1.66.72-1.66 1.63 0 .92.71 1.64 1.66 1.64.96 0 1.67-.72 1.67-1.64 0-.91-.71-1.63-1.67-1.63z" />
                </svg>
                <span>LinkedIn</span>
              </button>

              {/* WhatsApp */}
              <button
                id="share-whatsapp-btn"
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-97"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              {/* Telegram */}
              <button
                id="share-telegram-btn"
                type="button"
                onClick={handleShareTelegram}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1C88BD] text-white font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-97"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </button>
            </div>

            {copiedStatus === 'linkedin-copied' && (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Teks narasi telah disalin otomatis ke clipboard! Tempelkan (paste) pada postingan LinkedIn Anda.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Format Resmi Terverifikasi BAZNAS & Dewan Pengawas Syariah</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600/15 hover:bg-teal-600/25 text-teal-400 border border-teal-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Menu Share Bawaan</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyText}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/25 cursor-pointer"
            >
              {copiedStatus === 'text' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Lengkap</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
