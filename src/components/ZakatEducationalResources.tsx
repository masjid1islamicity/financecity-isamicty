import React, { useState, useMemo, useTransition } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Scale,
  Coins,
  FileText,
  Calculator,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Bookmark,
  Share2,
  AlertCircle,
  Layers,
  GraduationCap,
  Globe2,
  Cpu,
  BadgeCheck,
} from 'lucide-react';
import {
  Theme,
  Language,
  ZakatGroundedAnswer,
  ZakatGroundedWebSource,
  ZakatEducationalTopic,
} from '../types';

interface ZakatEducationalResourcesProps {
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
}

// Initial curated educational topics with verified rulings and sources
const INITIAL_EDUCATIONAL_TOPICS: ZakatEducationalTopic[] = [
  {
    id: 'nisab-profesi-sk-baznas',
    category: 'calculation',
    categoryLabel: 'Kalkulasi & Nisab',
    question: 'Berapa standar nisab zakat maal dan zakat profesi tahun 2025/2026 menurut SK BAZNAS RI?',
    questionEn: 'What is the current zakat maal and professional income nisab threshold under latest BAZNAS decree?',
    shortSummary:
      'Nisab zakat profesi setara 85 gram emas per tahun (~Rp 82.312.725/tahun atau Rp 6.859.394/bulan berdasarkan SK BAZNAS RI No. 1/2024 - 2025). Kadar zakat yang wajib ditunaikan adalah 2,5%.',
    badge: 'SK BAZNAS Terkini',
    defaultAnswerMarkdown: `### ⚖️ Ketetapan Nisab Zakat Profesi & Maal Terbaru
Berdasarkan Keputusan Ketua BAZNAS RI No. 1 Tahun 2024 tentang Nilai Nisab Zakat Pendapatan dan Jasa:
* **Nisab Tahunan**: Setara harga 85 gram emas murni yaitu **Rp 82.312.725 per tahun** (atau acuan pasar emas murni Antam berjalan).
* **Nisab Bulanan**: **Rp 6.859.394 per bulan**.
* **Kadar Zakat**: Wajib dikeluarkan sebesar **2,5%** dari penghasilan kotor (bruto) atau penghasilan bersih (neto setelah kebutuhan pokok primer).

> **Dalil & Fatwa**: Fatwa MUI No. 3 Tahun 2003 tentang Zakat Penghasilan dan Peraturan Menteri Agama (PMA) No. 52 Tahun 2014.`,
    verifiedSources: [
      { title: 'BAZNAS RI - SK Nilai Nisab Zakat Pendapatan dan Jasa', uri: 'https://baznas.go.id/zakat-profesi' },
      { title: 'Bimas Islam Kementerian Agama RI - Regulasi Zakat Nasional', uri: 'https://bimasislam.kemenag.go.id' },
    ],
    calculationExample: {
      formula: 'Zakat Bulanan = Penghasilan Bersih Bulanan × 2,5%',
      sampleCalculation: 'Gaji Rp 12.000.000 / bulan (> Rp 6.859.394) → Zakat = Rp 12.000.000 × 2,5% = Rp 300.000/bulan',
      nisabStandard: '85 gram emas (Rp 6.859.394 / bulan)',
    },
  },
  {
    id: 'zakat-kripto-emas-digital',
    category: 'crypto_digital',
    categoryLabel: 'Kripto & Emas Digital',
    question: 'Bagaimana hukum dan tata cara menghitung zakat aset kripto, stablecoin, dan emas digital (PAXG)?',
    questionEn: 'How to calculate zakat on crypto assets, stablecoins, and tokenized gold (PAXG)?',
    shortSummary:
      'Kripto yang memiliki utilitas dan disimpan untuk trading/investasi dikategorikan sebagai Urudh at-Tijarah (barang dagang), dikenakan zakat 2,5% jika melampaui nisab 85 gram emas. Emas digital (PAXG) wajib zakat 2,5% setara emas murni.',
    badge: 'AAOIFI & Fatwa MUI',
    defaultAnswerMarkdown: `### ⚖️ Fikih Zakat Aset Digital Kontemporer
1. **Emas Digital (PAX Gold / PAXG)**: Karena 100% didukung emas fisik LBMA, berlaku hukum zakat emas (*Dzahab*): nisab 85 gram, haul 1 tahun, kadar 2,5%.
2. **Kripto Likuid / Trading Portofolio**: Dihukumi sebagai komoditas niaga (*'Urudh at-Tijarah*). Nilai pasar likuid akhir haul dikurangi hutang jangka pendek dikenakan zakat 2,5%.
3. **Imbal Hasil Staking PoS**: Reward staking dianalogikan sebagai hasil investasi (*Mustaghallat*), zakat dikeluarkan 2,5% saat haul atau 5%-10% dari imbal hasil bersih.

> **Rujukan Standar**: AAOIFI Shariah Standard No. 35 (Zakat on Financial Assets) dan Bahtsul Masail Kemenag/DSN-MUI tentang Aset Kripto sebagai Mal Mutaqawwim berharga.`,
    verifiedSources: [
      { title: 'AAOIFI Shariah Standard No. 35 - Zakat on Digital Currencies', uri: 'https://aaoifi.com' },
      { title: 'DSN-MUI - Fatwa Komoditas Digital & Transaksi Kripto', uri: 'https://dsnmui.or.id' },
    ],
    calculationExample: {
      formula: 'Zakat Kripto = (Nilai Pasar Akhir Haul - Hutang Pokok) × 2,5%',
      sampleCalculation: 'Portofolio Rp 150.000.000 - Hutang Rp 20.000.000 = Rp 130.000.000 → Zakat = Rp 3.250.000',
      nisabStandard: '85 gram emas (Rp 82.312.725 / tahun)',
    },
  },
  {
    id: 'bukti-setor-zakat-pajak-pph',
    category: 'tax_regulations',
    categoryLabel: 'Pajak & Regulasi BSZ',
    question: 'Bagaimana etika pelaporan pajak dan mekanisme Bukti Setor Zakat (BSZ) sebagai pengurang PPh di Indonesia?',
    questionEn: 'How does official Zakat Receipt (BSZ) function as an income tax deduction in Indonesia?',
    shortSummary:
      'Berdasarkan UU No. 23/2011 Pasal 22 & PER-11/PJ/2018, zakat yang dibayarkan ke BAZNAS/LAZ resmi dapat mengurangi Penghasilan Bruto Kena Pajak (tax deduction) pada SPT Tahunan PPh Orang Pribadi Lampiran III.',
    badge: 'UU No. 23/2011 & DJP',
    defaultAnswerMarkdown: `### ⚖️ Landasan Hukum Zakat Pengurang Pajak
* **UU No. 23 Tahun 2011 Pasal 22**: *"Zakat yang dibayarkan oleh muzakki kepada BAZNAS atau LAZ dikurangkan dari penghasilan kena pajak."*
* **Mekanisme**: Zakat memotong Penghasilan Bersih (Neto) sebelum dikenakan tarif pajak PPh Pasal 17, bukan memotong nominal pajak secara langsung (*tax deduction*, bukan *tax credit*).
* **Syarat Sah**: Melampirkan Bukti Setor Zakat (BSZ) resmi yang memuat nama lembaga amil, NPWZ (Nomor Pokok Wajib Zakat), nomor seri BSZ, dan stempel barcode resmi.`,
    verifiedSources: [
      { title: 'Direktorat Jenderal Pajak - Tata Cara Pengurangan Zakat pada SPT', uri: 'https://pajak.go.id/id/zakat-pengurang-pajak' },
      { title: 'JDIH Kemenkeu - Peraturan Direktur Jenderal Pajak PER-11/PJ/2018', uri: 'https://jdih.kemenkeu.go.id' },
    ],
    calculationExample: {
      formula: 'Penghasilan Kena Pajak Baru = (Penghasilan Bruto - Zakat Resmi BSZ) - PTKP',
      sampleCalculation: 'Penghasilan Rp 200jt, Zakat Rp 5jt → PKP turun Rp 5jt → Hemat pajak marginal 15% = Rp 750.000',
      nisabStandard: 'Dikeluarkan ke BAZNAS / LAZ Resmi Pemerintah',
    },
  },
  {
    id: 'zakat-produktif-umkm-mustahik',
    category: 'ethics',
    categoryLabel: 'Etika & Zakat Produktif',
    question: 'Apakah zakat maal boleh disalurkan untuk modal usaha produktif UMKM dan gerobak mustahik?',
    questionEn: 'Can zakat maal be disbursed as revolving productive capital for micro-enterprises?',
    shortSummary:
      'Sangat dianjurkan menurut fatwa ulama modern dan DSN-MUI. Zakat produktif bertujuan mentransformasikan mustahik menjadi muzakki secara berkelanjutan (Hadil Kifayah) sesuai tujuan Maqasid Syariah.',
    badge: 'Fatwa DSN-MUI',
    defaultAnswerMarkdown: `### ⚖️ Zakat Konsumtif vs Zakat Produktif
* **Fatwa DSN-MUI & Keputusan Muktamar Tarjih**: Menyalurkan zakat dalam wujud modal kerja bergulir, sarana kerja higienis (gerobak Z-Chicken/Z-Mart), dan pelatihan vokasi diperbolehkan dan sangat utama untuk asnaf Fakir dan Miskin yang masih memiliki etos kerja.
* **Hadil Kifayah**: Zakat tidak semata-mata memberi makan sehari, melainkan memandirikan mustahik agar di tahun berikutnya keluar dari garis kemiskinan dan berubah menjadi donatur/muzakki.`,
    verifiedSources: [
      { title: 'Puskas BAZNAS - Kajian Zakat Produktif & Indeks Transformasi Mustahik', uri: 'https://puskasbaznas.com' },
      { title: 'Dewan Syariah Nasional MUI - Fatwa Penyaluran Zakat Berdaya', uri: 'https://dsnmui.or.id' },
    ],
    calculationExample: {
      formula: 'SROI Zakat Produktif = Nilai Pertambahan Omzet Mustahik : Dana Modal Hibah Zakat',
      sampleCalculation: 'Modal gerobak Rp 3.500.000 menghasilkan profit Rp 2.500.000/bulan untuk keluarga mustahik',
      nisabStandard: 'Penyaluran asnaf Fakir & Miskin produktif',
    },
  },
  {
    id: 'zakat-saham-reksadana-sukuk',
    category: 'calculation',
    categoryLabel: 'Saham & Sukuk Syariah',
    question: 'Bagaimana cara menghitung zakat saham syariah, dividen, dan reksa dana syariah?',
    questionEn: 'How to calculate zakat on sharia stocks, dividend yields, and sukuk investments?',
    shortSummary:
      'Untuk saham trading dihitung 2,5% dari total nilai pasar + floating gain pada akhir haul. Untuk saham investasi jangka panjang, zakat dikeluarkan 2,5% dari porsi dividen dan laba bersih perusahaan (Quick Net Assets).',
    badge: 'PSAK 109 & BEI',
    defaultAnswerMarkdown: `### ⚖️ Metode Perhitungan Zakat Saham Syariah
1. **Metode Saham Trading (Aktif Diperjualbelikan)**:
   $$\\text{Zakat} = (\\text{Nilai Portofolio Akhir Haul} - \\text{Hutang Pokok Saham}) \\times 2,5\\%$$
2. **Metode Dividen (Investasi Nilai Jangka Panjang / Value Investing)**:
   Harta zakat dihitung dari dividen bersih yang diterima atau menggunakan rasio aktiva lancar bersih perusahaan (*Net Current Assets per Share*).
3. **Reksa Dana Syariah & Sukuk**:
   Dihitung 2,5% dari nilai aktiva bersih (NAB) akhir tahun kepemilikan bila melebihi nisab 85 gram emas.`,
    verifiedSources: [
      { title: 'Indonesia Stock Exchange (IDX) Islamic - Panduan Zakat Saham Syariah', uri: 'https://idx.co.id' },
      { title: 'BAZNAS RI - Kalkulator Zakat Saham & Portofolio Pasar Modal', uri: 'https://baznas.go.id' },
    ],
  },
  {
    id: 'etika-anti-riba-fintech',
    category: 'ethics',
    categoryLabel: 'Etika Keuangan Islam',
    question: 'Bagaimana etika pembiayaan syariah bebas riba, gharar, dan maysir dalam ekosistem digital fintech?',
    questionEn: 'What are the ethical Islamic finance principles (Zero-Riba, Zero-Gharar) in digital fintech?',
    shortSummary:
      'Ekosistem syariah menuntut transparansi akad (Murabahah, Mudharabah, Musyarakah), ketiadaan bunga pinjaman berbunga (Riba Nasi\'ah), kepastian underlying komoditas (bebas Gharar), dan larangan spekulasi untung-untungan (Maysir).',
    badge: 'Maqasid Syariah',
    defaultAnswerMarkdown: `### ⚖️ Pilar Integritas Keuangan Islam Kontemporer
1. **Zero-Riba**: Larangan penggelembungan uang dari waktu ke waktu tanpa ada underlying aset atau transaksi riil komoditas.
2. **Zero-Gharar**: Akad jual beli digital harus jelas spesifikasi barang, waktu serah terima (*qabd*), dan harganya tanpa klausa tersembunyi.
3. **Zero-Maysir**: Tidak dibenarkan melakukan transaksi yang hanya mengandalkan keberuntungan spekulatif semata (*zero-sum game*).
4. **Tawazun (Keseimbangan Sosial)**: Harta tidak boleh hanya berputar di kalangan orang-orang kaya saja (*QS. Al-Hasyr: 7*), melainkan harus mengalir kepada 8 golongan mustahik melalui zakat dan infaq.`,
    verifiedSources: [
      { title: 'DSN-MUI - Fatwa Layanan Pembiayaan Berbasis Teknologi Informasi Syariah', uri: 'https://dsnmui.or.id' },
      { title: 'OJK Syariah - Roadmap Pengembangan Perbankan & Fintech Syariah Indonesia', uri: 'https://ojk.go.id' },
    ],
  },
];

export const ZakatEducationalResources: React.FC<ZakatEducationalResourcesProps> = ({
  theme,
  language,
  onOpenDisburse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>('nisab-profesi-sk-baznas');
  const [isPendingQuery, startQueryTransition] = useTransition();

  // Search grounded result from Gemini
  const [groundedResult, setGroundedResult] = useState<ZakatGroundedAnswer | null>(null);
  const [isLoadingGrounded, setIsLoadingGrounded] = useState(false);
  const [groundedError, setGroundedError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Nisab Rule Checker interactive inputs
  const [checkerAssetIDR, setCheckerAssetIDR] = useState<number>(10000000);
  const [goldPricePerGram] = useState<number>(1450000); // Standard Antam
  const currentNisabIDR = 85 * goldPricePerGram; // Rp 123.250.000 / thn or Rp 10.270.833 / bln
  const monthlyNisabIDR = 85 * 968385 / 12; // BAZNAS official decree standard ~ Rp 6.859.394

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered curated topics
  const filteredTopics = useMemo(() => {
    return INITIAL_EDUCATIONAL_TOPICS.filter((t) => {
      const matchCategory = selectedCategory === 'all' || t.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        t.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Execute Search Grounded AI Query
  const handleExecuteGroundedQuery = async (customQuestion?: string) => {
    const q = customQuestion || searchQuery;
    if (!q || q.trim().length === 0) return;

    setIsLoadingGrounded(true);
    setGroundedError(null);

    try {
      const response = await fetch('/api/zakat/educational-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category: selectedCategory,
          language: language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'id',
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setGroundedResult({
          query: q,
          category: data.data.category || selectedCategory,
          answerMarkdown: data.data.answerMarkdown,
          searchQueries: data.data.searchQueries || [],
          webSources: data.data.webSources || [],
          timestamp: data.data.timestamp || new Date().toISOString(),
          isGrounded: data.grounded ?? true,
          sourceEngine: data.source || 'gemini-3.8-flash',
        });
        // Scroll to the grounded response card smoothly
        setTimeout(() => {
          const el = document.getElementById('search-grounded-answer-box');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        setGroundedError(data.message || 'Gagal memproses jawaban syariah.');
      }
    } catch (err: any) {
      console.error('Error fetching educational grounded query:', err);
      setGroundedError('Koneksi terputus saat mengambil data rujukan syariah.');
    } finally {
      setIsLoadingGrounded(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleAccordion = (id: string) => {
    setExpandedTopicId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      id="zakat-educational-resources-section"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900/50 to-teal-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Pusat Edukasi Zakat & Etika Keuangan Syariah
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                  Google Search Grounding
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-teal-300 bg-teal-500/10 border border-teal-500/20">
                  Regulasi Terkini BAZNAS & DSN-MUI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Panduan komprehensif fikih zakat maal, zakat profesi, kripto & emas digital, serta etika Maqasid Syariah. Didukung model AI dengan <em>Search Grounding</em> langsung ke sumber regulasi resmi pemerintah dan fatwa dewan syariah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>UU No. 23/2011 & PSAK 109</span>
            </span>
          </div>
        </div>

        {/* Quick Question Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteGroundedQuery();
            }}
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tanyakan hal seputar zakat, nisab emas Antam hari ini, atau zakat kripto..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium transition-all outline-none ${
                  theme === 'dark'
                    ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingGrounded || !searchQuery.trim()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 cursor-pointer shrink-0"
            >
              {isLoadingGrounded ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Memeriksa Regulasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Cari Jawaban Terverifikasi</span>
                </>
              )}
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Contoh Pertanyaan:</span>
            {[
              'Standar nisab zakat profesi BAZNAS 2025/2026',
              'Zakat emas digital PAXG & kripto',
              'Bukti Setor Zakat (BSZ) pengurang pajak PPh',
              'Zakat produktif modal UMKM vs konsumtif',
              'Zakat saham & dividen pasar modal',
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(preset);
                  handleExecuteGroundedQuery(preset);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-emerald-500/50 transition-all shrink-0 cursor-pointer text-[11px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Dynamic Search Grounded AI Response Box (When user asks a question) */}
        {groundedResult && (
          <div
            id="search-grounded-answer-box"
            className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 border-emerald-500/40 shadow-lg'
                : 'bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/40 border-emerald-300 shadow-sm'
            }`}
          >
            {/* Header of grounded result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Jawaban Terverifikasi Search Grounding
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(groundedResult.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    Pertanyaan: &ldquo;{groundedResult.query}&rdquo;
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopyText(
                      'grounded-res',
                      `Pertanyaan: ${groundedResult.query}\n\n${groundedResult.answerMarkdown}`
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedId === 'grounded-res' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Panduan</span>
                    </>
                  )}
                </button>

                {onOpenDisburse && (
                  <button
                    onClick={() =>
                      onOpenDisburse({
                        notes: `Penyaluran terinspirasi edukasi: ${groundedResult.query.slice(0, 50)}...`,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Salurkan Zakat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Answer Content */}
            <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line space-y-3 font-sans">
                {groundedResult.answerMarkdown}
              </div>
            </div>

            {/* Verified Web Sources Citations (Extracted from Google Search Grounding Chunks) */}
            {groundedResult.webSources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Rujukan Resmi & Sumber Terverifikasi (Web Grounding):
                </span>
                <div className="flex flex-wrap gap-2">
                  {groundedResult.webSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 text-[11px] font-medium transition-all group"
                    >
                      <span className="truncate max-w-xs">{source.title}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Search Queries generated by AI */}
            {groundedResult.searchQueries && groundedResult.searchQueries.length > 0 && (
              <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-2">
                <span>Kueri verifikasi web:</span>
                {groundedResult.searchQueries.map((sq, i) => (
                  <span key={i} className="font-mono bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400">
                    &ldquo;{sq}&rdquo;
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interactive Quick Nisab & Obligation Rule Checker Widget */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Simulasi Mandiri: Cek Nisab & Kewajiban Zakat Maal / Profesi Anda
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Patokan Emas: {formatIDR(goldPricePerGram)}/gram (85g = {formatIDR(currentNisabIDR)}/thn)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-1">
            {/* Input Asset */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Harta Bersih / Gaji Bulanan Anda:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={checkerAssetIDR}
                  onChange={(e) => setCheckerAssetIDR(Math.max(0, Number(e.target.value)))}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-700 text-emerald-400'
                      : 'bg-white border-slate-300 text-emerald-700'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[5000000, 10000000, 25000000, 100000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCheckerAssetIDR(val)}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    {val >= 100000000 ? '100Jt' : `${val / 1000000}Jt`}
                  </button>
                ))}
              </div>
            </div>

            {/* Threshold Status */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Status Pemenuhan Nisab:
              </span>
              <div className="mt-1">
                {checkerAssetIDR >= monthlyNisabIDR ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Wajib Zakat (Melampaui Nisab)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Belum Wajib Zakat (Dianjurkan Infaq)</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Nisab BAZNAS: {formatIDR(monthlyNisabIDR)} / bulan
                </span>
              </div>
            </div>

            {/* Zakat Amount & Action */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  Kadar Zakat 2,5%:
                </span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {checkerAssetIDR >= monthlyNisabIDR
                    ? formatIDR(checkerAssetIDR * 0.025)
                    : formatIDR(checkerAssetIDR * 0.025) + ' (Opsional Infaq)'}
                </span>
                <span className="text-[9px] text-slate-500 block">
                  Sah mengurangi penghasilan kena pajak PPh
                </span>
              </div>

              {onOpenDisburse && (
                <button
                  onClick={() =>
                    onOpenDisburse({
                      amount: Math.round(checkerAssetIDR * 0.025),
                      notes: `Penyaluran dari Kalkulator Edukasi Zakat (${formatIDR(checkerAssetIDR * 0.025)})`,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  Salurkan
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Curated Educational Knowledge Base (Category Tabs & Accordions) */}
        <div>
          {/* Category Tabs */}
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Semua Topik (6)' },
                { id: 'calculation', label: 'Kalkulasi & Nisab' },
                { id: 'crypto_digital', label: 'Kripto & Emas Digital' },
                { id: 'ethics', label: 'Etika & Zakat Produktif' },
                { id: 'tax_regulations', label: 'Pajak PPh & BSZ' },
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] text-slate-400">
              Menampilkan {filteredTopics.length} artikel terakreditasi
            </span>
          </div>

          {/* Accordion / Cards List */}
          <div className="space-y-3">
            {filteredTopics.map((topic) => {
              const isExpanded = expandedTopicId === topic.id;
              return (
                <div
                  key={topic.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? theme === 'dark'
                        ? 'bg-slate-950/80 border-emerald-500/40 shadow-md'
                        : 'bg-emerald-50/20 border-emerald-300 shadow-sm'
                      : theme === 'dark'
                      ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Topic Header Row */}
                  <div
                    onClick={() => toggleAccordion(topic.id)}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {topic.categoryLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-800 text-slate-300">
                          {topic.badge}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {topic.question}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {topic.shortSummary}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-800/40 text-slate-400 shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Body Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3 animate-fadeIn">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {topic.defaultAnswerMarkdown}
                      </div>

                      {/* Mathematical or Calculation Example Card */}
                      {topic.calculationExample && (
                        <div
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            theme === 'dark'
                              ? 'bg-slate-900 border-slate-700/60'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                            Simulasi Perhitungan Nyata:
                          </span>
                          <div className="font-mono text-[11px] bg-slate-950/70 p-2 rounded-lg text-emerald-300 border border-slate-800">
                            {topic.calculationExample.formula}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {topic.calculationExample.sampleCalculation}
                          </p>
                        </div>
                      )}

                      {/* Verified Sources Links & Action Footer */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 font-semibold">Sumber Resmi:</span>
                          {topic.verifiedSources.map((src, i) => (
                            <a
                              key={i}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 text-[10px] transition-colors"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyText(
                                topic.id,
                                `${topic.question}\n\n${topic.shortSummary}\n\n${topic.defaultAnswerMarkdown}`
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {copiedId === topic.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-400" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExecuteGroundedQuery(topic.question)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Perbarui dengan data web terkini via Search Grounding"
                          >
                            <RefreshCw className="w-3 h-3 text-emerald-400" />
                            <span>Validasi Terkini</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sharia Governance & Ethical Footer */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Integritas & Landasan Hukum Syariah:
            </span>
            <p className="leading-relaxed text-[10px]">
              Seluruh materi edukasi di atas disinkronkan dengan rujukan hukum fikih zakat klasik (Al-Majmu&apos; An-Nawawi, Fiqh az-Zakat Yusuf Al-Qardhawi), Fatwa Dewan Syariah Nasional (DSN-MUI), Standar Internasional AAOIFI No. 35, serta regulasi pemerintah UU No. 23/2011 dan Peraturan Direktur Jenderal Pajak PER-11/PJ/2018.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
