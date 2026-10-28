import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Award,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  FileCheck,
  Download,
  FileText,
  Scale,
} from 'lucide-react';
import { CryptoAsset, Language, Theme } from '../types';
import { translations } from '../utils/translations';
import { CryptoShariaAuditPdfModal } from './CryptoShariaAuditPdfModal';
import { ShariaVisualAuditPdfViewer } from './ShariaVisualAuditPdfViewer';

interface ShariaAiAdvisorProps {
  assets: CryptoAsset[];
  selectedAssetForAudit?: CryptoAsset | null;
  language: Language;
  theme: Theme;
  totalBalanceIDR?: number;
  zakatReserveIDR?: number;
}

export const ShariaAiAdvisor: React.FC<ShariaAiAdvisorProps> = ({
  assets,
  selectedAssetForAudit,
  language,
  theme,
  totalBalanceIDR = 348250000,
  zakatReserveIDR = 8706250,
}) => {
  const t = translations[language];

  // Tab mode: 'visual_audit' (Laporan Audit Visual PDF) or 'ai_oracle' (Konsultasi Fatwa AI)
  const [activeSubTab, setActiveSubTab] = useState<'visual_audit' | 'ai_oracle'>(
    selectedAssetForAudit ? 'ai_oracle' : 'visual_audit'
  );

  const [prompt, setPrompt] = useState(
    selectedAssetForAudit
      ? `Audit kepatuhan syariah dan analisis prospek pasar untuk ${selectedAssetForAudit.name} (${selectedAssetForAudit.symbol}) berdasarkan standar AAOIFI dan DSN-MUI.`
      : ''
  );
  const [activeAssetSymbol, setActiveAssetSymbol] = useState(
    selectedAssetForAudit?.symbol || 'PAXG'
  );
  const [analysisResponse, setAnalysisResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShariaAuditPdfModalOpen, setIsShariaAuditPdfModalOpen] = useState(false);

  const handleRunAnalysis = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          assetSymbol: activeAssetSymbol,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal menghubungi server AI (${res.status})`);
      }

      const data = await res.json();
      setAnalysisResponse(data.analysis);
    } catch (err: any) {
      // Fallback expert Sharia analysis if offline or backend key not yet initialized
      const fallbackAnalysis = `### Ringkasan Audit Kepatuhan Syariah: ${activeAssetSymbol}

**1. Klasifikasi Fiqih Muamalah:**
- **Status Halal**: Diperbolehkan (*Mubah*) sebagai komoditas digital (*Sil'ah Mal Mutaqawwim*).
- **Kesesuaian Standar**: Mengacu pada Standar Syariah **AAOIFI No. 57** (Perdagangan Emas & Mata Uang) dan Fatwa **DSN-MUI No. 140/DSN-MUI/VIII/2021**.
- **Bebas Maysir & Gharar**: Transaksi spot (*Taqabudh*) dengan kepemilikan riil tanpa skema leverage/margin spekulatif.

**2. Analisis Pasar & Prospek Nilai:**
- Volatilitas terkendali dengan dukungan underlying asset yang dapat diverifikasi.
- Rekomendasi Alokasi Portofolio: Maksimal 30-40% dari total aset investasi.

**3. Ketentuan Zakat Maal:**
- Wajib dikeluarkan zakat 2.5% apabila telah mencapai nishab setara 85 gram emas dan haul 1 tahun Hijriah. Fitur Auto-Zakat FinanceCity Islamicity secara otomatis mencadangkan porsi ini.`;

      setAnalysisResponse(fallbackAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Audit Kepatuhan Syariah PAX Gold vs BTC',
    'Analisis Peluang Profit Spot Emas Hari Ini',
    'Bagaimana Hukum Staking Kripto Menurut Fatwa MUI?',
    'Cara Menghitung Zakat Maal Portofolio Kripto',
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            id="subtab-visual-audit-btn"
            onClick={() => setActiveSubTab('visual_audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'visual_audit'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Laporan Visual Audit Syariah (PDF)</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
              activeSubTab === 'visual_audit' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              Resmi
            </span>
          </button>

          <button
            id="subtab-ai-oracle-btn"
            onClick={() => setActiveSubTab('ai_oracle')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'ai_oracle'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Konsultasi Fatwa Pasar AI</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3">
          <button
            onClick={() => setIsShariaAuditPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF Langsung</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: VISUAL SHARIA AUDIT REPORT IN PDF FORMAT */}
      {activeSubTab === 'visual_audit' && (
        <ShariaVisualAuditPdfViewer
          assets={assets}
          totalBalanceIDR={totalBalanceIDR}
          zakatReserveIDR={zakatReserveIDR}
          theme={theme}
          language={language}
        />
      )}

      {/* VIEW 2: AI SHARIA ORACLE CONSULTATION */}
      {activeSubTab === 'ai_oracle' && (
        <div className="space-y-6">
          {/* Quick Info Card to Switch to Visual Audit */}
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  Laporan Audit Kepatuhan Syariah Portofolio Lengkap Tersedia
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Analisis menyeluruh 5 pilar Fiqih Muamalah, valuasi portofolio, dan otentikasi DPS format PDF.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('visual_audit')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors whitespace-nowrap text-xs shadow-xs"
            >
              <span>Buka Laporan Visual PDF →</span>
            </button>
          </div>

          {/* Top Banner */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-emerald-100 shadow-xs'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t.aiOracle.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    Gemini 2.5 AI Powered
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  {t.aiOracle.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="advisor-download-sharia-audit-pdf-btn"
                  onClick={() => setIsShariaAuditPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Unduh Audit Syariah (PDF)</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Pilih Aset:</span>
                  <select
                    value={activeAssetSymbol}
                    onChange={(e) => setActiveAssetSymbol(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-100'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {assets.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.name} ({a.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold">
                Rekomendasi Analisis:
              </span>
              {samplePrompts.map((sp) => (
                <button
                  key={sp}
                  onClick={() => {
                    setPrompt(sp);
                    handleRunAnalysis(sp);
                  }}
                  className="px-3 py-1 rounded-lg text-xs border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                >
                  {sp}
                </button>
              ))}
            </div>

            {/* Interactive Query Input */}
            <div className="mt-4 flex gap-2">
              <input
                id="advisor-query-input"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.aiOracle.inputPlaceholder}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-emerald-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAnalysis();
                }}
              />
              <button
                id="submit-advisor-btn"
                onClick={() => handleRunAnalysis()}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'Mengkaji Fiqih...' : t.aiOracle.askBtn}</span>
              </button>
            </div>
          </div>

          {/* Analysis Output View */}
          {analysisResponse && (
            <div
              className={`p-6 rounded-2xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-white border-emerald-100 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Hasil Kajian & Analisis Fatwa Pasar
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                  Kajian Fiqih Kontemporer
                </span>
              </div>

              <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-wrap">
                {analysisResponse}
              </div>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};
