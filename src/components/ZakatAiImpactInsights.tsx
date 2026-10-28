import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Copy,
  Check,
  Send,
  Sliders,
  DollarSign,
  Users,
  Compass,
  Building2,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  Target,
  FileCheck,
  Heart,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Wheat,
  Scale
} from 'lucide-react';
import {
  Theme,
  Language,
  ZakatSummaryRecord,
  ZakatProgramDistributionData,
  ZakatImpactGoalConfig,
  ZakatAiInsightsData,
  ZakatAiRecommendation,
} from '../types';

interface ZakatAiImpactInsightsProps {
  disbursedRecords: ZakatSummaryRecord[];
  programDistributions?: ZakatProgramDistributionData[];
  annualImpactGoal?: ZakatImpactGoalConfig | null;
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
}

type StrategyPreset = 'comprehensive' | 'asnaf_equity' | 'productive_umkm' | 'health_nutrition';

export const ZakatAiImpactInsights: React.FC<ZakatAiImpactInsightsProps> = ({
  disbursedRecords,
  programDistributions = [],
  annualImpactGoal = null,
  theme,
  language,
  onOpenDisburse,
}) => {
  const [insights, setInsights] = useState<ZakatAiInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('gemini-3.8-flash');
  const [strategyPreset, setStrategyPreset] = useState<StrategyPreset>('comprehensive');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedRecId, setAppliedRecId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchInsights = useCallback(
    async (overridePreset?: StrategyPreset, specificQuestion?: string) => {
      const activePreset = overridePreset || strategyPreset;
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/zakat/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            historicalRecords: disbursedRecords,
            programDistributions,
            annualImpactGoal,
            strategyPreset: activePreset,
            userCustomQuestion: specificQuestion || customQuestion || '',
            language,
          }),
        });

        if (!response.ok) {
          throw new Error(`Gagal menghubungi mesin analitik AI (${response.status})`);
        }

        const resData = await response.json();
        if (resData && resData.data) {
          setInsights(resData.data);
          setSource(resData.source || 'gemini-3.8-flash');
          setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        } else {
          throw new Error('Format respon wawasan AI tidak sesuai.');
        }
      } catch (err: any) {
        console.error('Error fetching AI Zakat Insights:', err);
        setError(err?.message || 'Terjadi kendala saat memproses wawasan zakat AI.');
      } finally {
        setIsLoading(false);
        setIsSubmittingQuestion(false);
      }
    },
    [disbursedRecords, programDistributions, annualImpactGoal, strategyPreset, customQuestion, language]
  );

  // Load initial insights on mount
  useEffect(() => {
    fetchInsights('comprehensive');
  }, []);

  const handleStrategyChange = (newPreset: StrategyPreset) => {
    setStrategyPreset(newPreset);
    fetchInsights(newPreset);
  };

  const handleCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || isSubmittingQuestion) return;
    setIsSubmittingQuestion(true);
    fetchInsights(strategyPreset, customQuestion.trim());
  };

  const handleQuickQuestion = (question: string) => {
    setCustomQuestion(question);
    setIsSubmittingQuestion(true);
    fetchInsights(strategyPreset, question);
  };

  const handleCopySummary = () => {
    if (!insights) return;
    const textToCopy = `✨ [FinanceCity Islamicity AI Zakat Insights] ✨
Model: ${source}
Skor Keadilan Asnaf: ${insights.asnafEquityScore}/100
Indeks Berkah: ${insights.barakahIndex.tier} (${insights.barakahIndex.score}/100)

📌 Ringkasan Eksekutif:
${insights.executiveSummary}

🎯 Rekomendasi Penyaluran Berikutnya:
${insights.recommendations
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.title} (${r.asnafTarget}) - Rp ${r.suggestedAmountIDR.toLocaleString('id-ID')}\n   Mitra: ${r.recommendedInstitution} | Dampak: ${r.multiplierImpact}`
  )
  .join('\n')}

💡 Alokasi Masa Depan yang Disarankan:
- UMKM Mandiri: ${insights.suggestedNextAllocation?.umkmPercent || 35}%
- Pendidikan Santri: ${insights.suggestedNextAllocation?.educationPercent || 25}%
- Layanan Medis: ${insights.suggestedNextAllocation?.healthPercent || 20}%
- Pangan Sembako: ${insights.suggestedNextAllocation?.foodPercent || 10}%
- Dakwah Teritorial 3T: ${insights.suggestedNextAllocation?.dakwah3TPercent || 10}%`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyRecommendation = (rec: ZakatAiRecommendation) => {
    setAppliedRecId(rec.id);
    if (onOpenDisburse) {
      let mappedProgram = 'umkm';
      if (rec.title.toLowerCase().includes('santri') || rec.title.toLowerCase().includes('didik')) {
        mappedProgram = 'education';
      } else if (rec.title.toLowerCase().includes('gizi') || rec.title.toLowerCase().includes('medis') || rec.title.toLowerCase().includes('sehat')) {
        mappedProgram = 'health';
      } else if (rec.title.toLowerCase().includes('pangan') || rec.title.toLowerCase().includes('sembako')) {
        mappedProgram = 'food';
      }

      onOpenDisburse({
        amount: rec.suggestedAmountIDR,
        institution: rec.recommendedInstitution,
        program: mappedProgram,
        notes: `Rekomendasi AI Gemini (${rec.asnafTarget}): ${rec.title}`,
      });
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="zakat-ai-impact-insights-card"
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden ${
        isDark
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-500/30 shadow-2xl shadow-emerald-950/20'
          : 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 border-emerald-200 shadow-xl'
      }`}
    >
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -ml-28 -mb-28" />

      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-emerald-500/20 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className={`text-lg md:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Wawasan Cerdas Zakat AI
                  <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Gemini 3.8 Flash
                  </span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Audit etis 8 Asnaf, analisis kesenjangan program, dan rekomendasi optimalisasi masa depan berbasis data historis muzakki
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
            {lastUpdated && (
              <span className={`text-[11px] px-2.5 py-1 rounded-lg border ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
                Diperbarui: {lastUpdated}
              </span>
            )}

            <button
              onClick={handleCopySummary}
              disabled={!insights}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                  : isDark
                  ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              }`}
              title="Salin ringkasan wawasan AI ke clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Laporan'}</span>
            </button>

            <button
              onClick={() => fetchInsights()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Menganalisis...' : 'Perbarui AI'}</span>
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-1.5 rounded-xl border transition-colors ${
                isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
              title={isExpanded ? 'Ciutkan Panel' : 'Perluas Panel'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Strategy Preset Selector Pills */}
        <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className={`text-xs font-medium shrink-0 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fokus Optimasi:</span>
          </span>

          <button
            onClick={() => handleStrategyChange('comprehensive')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
              strategyPreset === 'comprehensive'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            🌟 Menyeluruh (Comprehensive)
          </button>

          <button
            onClick={() => handleStrategyChange('asnaf_equity')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
              strategyPreset === 'asnaf_equity'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            ⚖️ Keadilan 8 Asnaf & Wilayah 3T
          </button>

          <button
            onClick={() => handleStrategyChange('productive_umkm')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
              strategyPreset === 'productive_umkm'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            🚀 Akselerasi UMKM (Mustahik to Muzakki)
          </button>

          <button
            onClick={() => handleStrategyChange('health_nutrition')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
              strategyPreset === 'health_nutrition'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
            }`}
          >
            🩺 Layanan Medis & Bebas Stunting
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 md:p-6 space-y-6 relative z-10">
          {/* Loading Skeleton */}
          {isLoading && !insights && (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center gap-3 text-emerald-400">
                <Sparkles className="w-6 h-6 animate-bounce" />
                <span className="text-sm font-semibold tracking-wide animate-pulse">
                  Gemini AI sedang mengaudit portofolio zakat & menyusun rekomendasi syariah...
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-28 rounded-xl bg-emerald-500/10 animate-pulse" />
                <div className="h-28 rounded-xl bg-teal-500/10 animate-pulse" />
                <div className="h-28 rounded-xl bg-emerald-500/10 animate-pulse" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && !isLoading && (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-rose-200">Gagal Memuat Analisis AI</p>
                <p>{error}</p>
                <button
                  onClick={() => fetchInsights()}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
                </button>
              </div>
            </div>
          )}

          {insights && (
            <>
              {/* Executive Impact Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Asnaf Equity Score Card */}
                <div
                  className={`p-4 rounded-xl border relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900/80 border-emerald-500/30 shadow-lg'
                      : 'bg-white border-emerald-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Skor Keadilan 8 Asnaf
                    </span>
                    <Scale className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400">
                      {insights.asnafEquityScore}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ 100</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                      Taraf Sangat Adil
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, insights.asnafEquityScore))}%` }}
                    />
                  </div>
                  <p className={`mt-2 text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {insights.equityAnalysis}
                  </p>
                </div>

                {/* Barakah & SROI Syariah Index */}
                <div
                  className={`p-4 rounded-xl border relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900/80 border-amber-500/30 shadow-lg'
                      : 'bg-white border-amber-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Indeks Berkah & SROI Syariah
                    </span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-amber-400">
                      {insights.barakahIndex.score}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">/ 100</span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                      High Impact Tier
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs font-semibold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                      {insights.barakahIndex.tier}
                    </span>
                  </div>
                  <p className={`mt-2 text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {insights.barakahIndex.highlight}
                  </p>
                </div>

                {/* Portfolio Audit Footprint */}
                <div
                  className={`p-4 rounded-xl border relative overflow-hidden ${
                    isDark
                      ? 'bg-slate-900/80 border-cyan-500/30 shadow-lg'
                      : 'bg-white border-cyan-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Audit Kepatuhan UU 23/2011 & PSAK 109
                    </span>
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-cyan-400">
                      100% BSZ Sah
                    </span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-medium">
                      PPh Deductible
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Total Penyaluran:</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Rp {disbursedRecords.reduce((sum, r) => sum + r.amountIDR, 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Bukti Setor Resmi:</span>
                      <span className="font-semibold text-emerald-400">{disbursedRecords.length} Sertifikat</span>
                    </div>
                  </div>
                  <p className={`mt-2 text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Seluruh dana disalurkan melalui Lembaga Amil Zakat resmi terakreditasi BAZNAS RI dengan nomor tanda terima valid.
                  </p>
                </div>
              </div>

              {/* Executive Summary Narrative */}
              <div
                className={`p-4 md:p-5 rounded-xl border ${
                  isDark
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                    : 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                      <span>Ringkasan Eksekutif Dampak Historis & Portofolio</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/30 font-normal">
                        AI Synthesis
                      </span>
                    </h4>
                    <p className="text-xs leading-relaxed">
                      {insights.executiveSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ethical Gap Audit Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>Audit Kesenjangan Program & Prioritas Penyaluran</span>
                  </h4>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Evaluasi Kebutuhan Mustahik
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {insights.gapAudit.map((gap, idx) => {
                    const badgeClass =
                      gap.badgeColor === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : gap.badgeColor === 'cyan'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                        : gap.badgeColor === 'rose'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : gap.badgeColor === 'purple'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isDark
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-emerald-200 shadow-xs'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {gap.category}
                            </span>
                          </div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badgeClass}`}>
                            {gap.status}
                          </span>
                          <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {gap.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable AI Strategic Recommendations for Next Disbursements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Rekomendasi Strategis AI untuk Penyaluran Berikutnya</span>
                  </h4>
                  <span className={`text-xs font-semibold text-emerald-400`}>
                    Optimalisasi Pengungkit Sosial (SROI)
                  </span>
                </div>

                <div className="space-y-3">
                  {insights.recommendations.map((rec) => {
                    const isApplied = appliedRecId === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isDark
                            ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60'
                            : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Asnaf {rec.asnafTarget}
                              </span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                🚀 {rec.multiplierImpact}
                              </span>
                              <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Building2 className="w-3 h-3 text-emerald-400" />
                                <span>{rec.recommendedInstitution}</span>
                              </span>
                            </div>

                            <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {rec.title}
                            </h5>

                            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {rec.description}
                            </p>

                            {rec.rationale && (
                              <p className={`text-[11px] italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                💡 Fikih & Rasional: {rec.rationale}
                              </p>
                            )}
                          </div>

                          {/* Allocation & CTA Action */}
                          <div className="flex items-center lg:flex-col lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            <div className="text-left lg:text-right">
                              <div className={`text-[10px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Saran Alokasi
                              </div>
                              <div className="text-base font-extrabold text-emerald-400">
                                Rp {rec.suggestedAmountIDR.toLocaleString('id-ID')}
                              </div>
                            </div>

                            {onOpenDisburse && (
                              <button
                                onClick={() => handleApplyRecommendation(rec)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                  isApplied
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20'
                                }`}
                              >
                                {isApplied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                <span>{isApplied ? 'Dialokasikan' : 'Salurkan Rekomendasi'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Optimal Future Allocation Matrix */}
              {insights.suggestedNextAllocation && (
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Matriks Rekomendasi Alokasi Penyaluran Masa Depan (Optimal Mix)</span>
                    </h5>
                    <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Total 100%
                    </span>
                  </div>

                  {/* Multi-segment visual bar */}
                  <div className="w-full h-3.5 rounded-full overflow-hidden flex shadow-inner bg-slate-800">
                    <div
                      style={{ width: `${insights.suggestedNextAllocation.umkmPercent}%` }}
                      className="bg-emerald-500 hover:opacity-90 transition-all relative group"
                      title={`Pemberdayaan UMKM: ${insights.suggestedNextAllocation.umkmPercent}%`}
                    />
                    <div
                      style={{ width: `${insights.suggestedNextAllocation.educationPercent}%` }}
                      className="bg-cyan-500 hover:opacity-90 transition-all relative group"
                      title={`Beasiswa Pendidikan: ${insights.suggestedNextAllocation.educationPercent}%`}
                    />
                    <div
                      style={{ width: `${insights.suggestedNextAllocation.healthPercent}%` }}
                      className="bg-rose-500 hover:opacity-90 transition-all relative group"
                      title={`Layanan Medis: ${insights.suggestedNextAllocation.healthPercent}%`}
                    />
                    <div
                      style={{ width: `${insights.suggestedNextAllocation.foodPercent}%` }}
                      className="bg-amber-500 hover:opacity-90 transition-all relative group"
                      title={`Pangan Sembako: ${insights.suggestedNextAllocation.foodPercent}%`}
                    />
                    <div
                      style={{ width: `${insights.suggestedNextAllocation.dakwah3TPercent}%` }}
                      className="bg-purple-500 hover:opacity-90 transition-all relative group"
                      title={`Dakwah 3T & Syiar: ${insights.suggestedNextAllocation.dakwah3TPercent}%`}
                    />
                  </div>

                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3 pt-2 border-t border-slate-800/40 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        UMKM Mandiri: <strong className="text-emerald-400">{insights.suggestedNextAllocation.umkmPercent}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Pendidikan: <strong className="text-cyan-400">{insights.suggestedNextAllocation.educationPercent}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Kesehatan: <strong className="text-rose-400">{insights.suggestedNextAllocation.healthPercent}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Pangan: <strong className="text-amber-400">{insights.suggestedNextAllocation.foodPercent}%</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        Dakwah 3T: <strong className="text-purple-400">{insights.suggestedNextAllocation.dakwah3TPercent}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sharia Ethical Principles & Regulatory Observations */}
              {insights.ethicalObservations && insights.ethicalObservations.length > 0 && (
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <h5 className={`text-xs font-bold flex items-center gap-2 mb-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Catatan Fikih & Tata Kelola Maqasid al-Shariah</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs">
                    {insights.ethicalObservations.map((obs, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Custom Question to Gemini Zakat Oracle */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark
                    ? 'bg-gradient-to-r from-emerald-950/30 to-teal-950/20 border-emerald-500/30'
                    : 'bg-emerald-50/50 border-emerald-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className={`text-xs font-bold flex items-center gap-2 ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Konsultasi Cerdas Fikih & Dampak Penyaluran Bersama Gemini</span>
                    </h5>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Tanya Portofolio Pribadi
                    </span>
                  </div>

                  {/* Quick question suggestions */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Contoh:</span>
                    <button
                      onClick={() => handleQuickQuestion('Bagaimana memprioritaskan santri di wilayah kepulauan 3T?')}
                      className={`px-2.5 py-0.5 rounded-lg border text-left shrink-0 transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Santri Kepulauan 3T?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Apakah zakat produktif UMKM lebih utama dari sembako konsumtif?')}
                      className={`px-2.5 py-0.5 rounded-lg border text-left shrink-0 transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      UMKM vs Sembako?
                    </button>
                    <button
                      onClick={() => handleQuickQuestion('Bagaimana cara melaporkan BSZ sebagai pengurang pajak PPh 21 di SPT?')}
                      className={`px-2.5 py-0.5 rounded-lg border text-left shrink-0 transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Klaim Pajak SPT?
                    </button>
                  </div>

                  <form onSubmit={handleCustomQuestionSubmit} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Ajukan pertanyaan khusus terkait strategi penyaluran atau fikih zakat Anda..."
                      className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingQuestion || !customQuestion.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSubmittingQuestion ? 'animate-spin' : ''}`} />
                      <span>{isSubmittingQuestion ? 'Menganalisis...' : 'Tanyakan'}</span>
                    </button>
                  </form>

                  {/* Custom Answer Box */}
                  {insights.customAnswer && (
                    <div
                      className={`mt-3 p-3.5 rounded-xl border ${
                        isDark ? 'bg-slate-900/90 border-emerald-500/40 text-slate-200' : 'bg-white border-emerald-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-emerald-400">
                            Jawaban Penasihat Zakat AI (Gemini 3.8 Flash):
                          </p>
                          <p className="text-xs leading-relaxed">
                            {insights.customAnswer}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
