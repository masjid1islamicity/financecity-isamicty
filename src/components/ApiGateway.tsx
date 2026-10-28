import React, { useState } from 'react';
import {
  Code,
  Key,
  Copy,
  CheckCircle2,
  Play,
  Terminal,
  ShieldCheck,
  Send,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface ApiGatewayProps {
  language: Language;
  theme: Theme;
}

export const ApiGateway: React.FC<ApiGatewayProps> = ({ language, theme }) => {
  const t = translations[language];

  const [activeEndpoint, setActiveEndpoint] = useState<string>('POST /api/v1/trade/execute');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('fc_live_948a209b_sharia_e2ee_88102a');
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        pair: 'PAXG/USDT',
        amount: 0.15,
        shariaMode: 'Mudharabah',
        autoZakatPercent: 2.5,
        clientReferenceId: 'ORD-' + Date.now(),
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestApi = () => {
    setIsLoading(true);
    setApiResponse(null);

    setTimeout(() => {
      setIsLoading(false);
      const mockResult = {
        status: 'SUCCESS',
        code: 200,
        data: {
          transactionId: 'TX-ISL-' + Math.floor(100000 + Math.random() * 900000),
          shariaProofHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          qabdStatus: 'PHYSICAL_SPOT_ALLOCATED',
          settlementCurrency: 'IDR',
          settlementAmount: 6250000,
          zakatDeducted: 156250,
          timestamp: new Date().toISOString(),
          compliance: 'AAOIFI_STANDARD_NO_57_VERIFIED',
        },
      };
      setApiResponse(JSON.stringify(mockResult, null, 2));
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
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
                <Code className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.apiGateway.title}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                REST & Webhook
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t.apiGateway.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Autentikasi HMAC SHA-256 + mTLS</span>
          </div>
        </div>

        {/* API Key Management */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Kunci API Produksi
          </label>
          <div className="flex items-center gap-2 max-w-xl">
            <div className="flex-1 px-4 py-2.5 rounded-xl border font-mono text-xs bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-200">{apiKey}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                PRODUKSI
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(apiKey, 'key')}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:text-emerald-500 text-slate-400"
              title="Salin Kunci API"
            >
              {copiedKey === 'key' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox & Documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Endpoints Index */}
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            {t.apiGateway.sandboxEndpoints}
          </h3>

          <div className="space-y-2 text-xs">
            {[
              {
                method: 'POST',
                path: '/api/v1/trade/execute',
                desc: 'Eksekusi trading otomatis spot syariah',
              },
              {
                method: 'POST',
                path: '/api/v1/voucher/redeem',
                desc: 'Tukarkan voucher Islamicity saldo tunai',
              },
              {
                method: 'GET',
                path: '/api/v1/portfolio/summary',
                desc: 'Ambil ringkasan aset & alokasi emas',
              },
              {
                method: 'POST',
                path: '/api/v1/banking/sync',
                desc: 'Webhook sinkronisasi Open Banking BSI',
              },
            ].map((ep) => {
              const fullKey = `${ep.method} ${ep.path}`;
              const isActive = activeEndpoint === fullKey;
              return (
                <button
                  key={fullKey}
                  onClick={() => {
                    setActiveEndpoint(fullKey);
                    setApiResponse(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        ep.method === 'POST'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-sky-600 text-white'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Sandbox Request / Response Runner */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800'
              : 'bg-white border-emerald-100 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">
                {activeEndpoint.split(' ')[0]}
              </span>
              <span className="text-slate-900 dark:text-slate-100">
                https://api.financecity.islamicity.org{activeEndpoint.split(' ')[1]}
              </span>
            </div>

            <button
              id="test-api-call-btn"
              onClick={handleTestApi}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Mengirim...' : t.apiGateway.testRequest}</span>
            </button>
          </div>

          {/* Request Headers & Body */}
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Request Payload (JSON)
              </span>
              <textarea
                rows={5}
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                className={`w-full mt-1 p-3 rounded-xl border font-mono text-[11px] outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Response Area */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                Respon API (200 OK)
              </span>
              <div
                className={`w-full mt-1 p-3 rounded-xl border font-mono text-[11px] min-h-[160px] overflow-x-auto ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-emerald-400'
                }`}
              >
                {isLoading ? (
                  <span className="text-slate-500">Memproses eksekusi transaksi terenkripsi...</span>
                ) : apiResponse ? (
                  <pre>{apiResponse}</pre>
                ) : (
                  <span className="text-slate-500">
                    Klik "Kirim Permintaan Uji Coba" untuk mensimulasikan integrasi API pihak ketiga.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
