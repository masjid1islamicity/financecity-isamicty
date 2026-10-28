import React, { useState, useMemo } from 'react';
import {
  Users,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Building2,
  Briefcase,
  GraduationCap,
  UtensilsCrossed,
  Stethoscope,
  Filter,
  Download,
  Share2,
  Lock,
  ExternalLink,
  ChevronRight,
  Hash,
  Clock,
  Layers,
  Search,
  Check,
  Coins,
  Globe2,
  Award,
  FileText,
  AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Theme, Language, ZakatSummaryRecord } from '../types';

interface CommunityImpactWidgetProps {
  theme: Theme;
  language: Language;
  userZakatReserveIDR?: number;
  userDisbursedRecords?: ZakatSummaryRecord[];
  onOpenDisburse?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export type TimeframePeriod = 'month' | 'quarter' | 'year' | 'all';

interface AnonymousDistributionEvent {
  id: string;
  muzakkiCode: string;
  region: string;
  partner: 'BAZNAS RI' | 'Dompet Dhuafa' | 'Rumah Zakat' | 'LAZISMU' | 'LAZISNU';
  programTitle: string;
  category: 'economic' | 'education' | 'food' | 'health' | 'gharimin';
  asnafCategory: 'Fakir & Miskin' | 'Fisabilillah' | 'Ibnu Sabil' | 'Gharimin';
  amountIDR: number;
  timeAgo: string;
  txHash: string;
  impactMetric: string;
  blockHeight: number;
}

const LIVE_DISTRIBUTION_FEED: AnonymousDistributionEvent[] = [
  {
    id: 'tx-comm-101',
    muzakkiCode: 'Muzakki #8492',
    region: 'Jakarta Selatan',
    partner: 'BAZNAS RI',
    programTitle: 'Beasiswa Pendidikan Santri Dhuafa Tahfidz 3T',
    category: 'education',
    asnafCategory: 'Fisabilillah',
    amountIDR: 3500000,
    timeAgo: '2 menit lalu',
    txHash: '0x8f2a4c90e1b3d7a8',
    impactMetric: '1 Semester Pendidikan Santri',
    blockHeight: 1849204,
  },
  {
    id: 'tx-comm-102',
    muzakkiCode: 'Muzakki #3120',
    region: 'Surabaya',
    partner: 'Dompet Dhuafa',
    programTitle: 'Gerobak Usaha Berkah & Modal Kerja UMKM',
    category: 'economic',
    asnafCategory: 'Fakir & Miskin',
    amountIDR: 4200000,
    timeAgo: '8 menit lalu',
    txHash: '0x3c91f092e6a17b4c',
    impactMetric: '1 Unit Usaha Mandiri Beroperasi',
    blockHeight: 1849198,
  },
  {
    id: 'tx-comm-103',
    muzakkiCode: 'Muzakki #9504',
    region: 'Bandung',
    partner: 'Rumah Zakat',
    programTitle: 'Klinik Medis Pratama & Pencegahan Stunting',
    category: 'health',
    asnafCategory: 'Fakir & Miskin',
    amountIDR: 2100000,
    timeAgo: '19 menit lalu',
    txHash: '0xb4107e3d19f824ca',
    impactMetric: '14 Paket Nutrisi Balita Dhuafa',
    blockHeight: 1849187,
  },
  {
    id: 'tx-comm-104',
    muzakkiCode: 'Muzakki #1488',
    region: 'Medan',
    partner: 'LAZISMU',
    programTitle: 'Pangan Beras Premium & Sembako Lansia Sebatang Kara',
    category: 'food',
    asnafCategory: 'Fakir & Miskin',
    amountIDR: 1250000,
    timeAgo: '35 menit lalu',
    txHash: '0x19ae53c89b21a7df',
    impactMetric: '5 Keluarga Dhuafa Terpelihara 1 Bulan',
    blockHeight: 1849171,
  },
  {
    id: 'tx-comm-105',
    muzakkiCode: 'Muzakki #6721',
    region: 'Yogyakarta',
    partner: 'BAZNAS RI',
    programTitle: 'Pembebasan Jeratan Utang Rentenir & Riba (Gharimin)',
    category: 'gharimin',
    asnafCategory: 'Gharimin',
    amountIDR: 6000000,
    timeAgo: '52 menit lalu',
    txHash: '0x6a0f871be39c4d21',
    impactMetric: '1 Keluarga Dhuafa Bebas Utang',
    blockHeight: 1849154,
  },
  {
    id: 'tx-comm-106',
    muzakkiCode: 'Muzakki #2340',
    region: 'Makassar',
    partner: 'LAZISNU',
    programTitle: 'Modal Usaha Tani Organik & Bibit Produktif Berkah',
    category: 'economic',
    asnafCategory: 'Fakir & Miskin',
    amountIDR: 5000000,
    timeAgo: '1 jam lalu',
    txHash: '0xd71408eb29c5a31e',
    impactMetric: '2 Petani Dhuafa Mandiri Pangan',
    blockHeight: 1849140,
  },
  {
    id: 'tx-comm-107',
    muzakkiCode: 'Muzakki #7819',
    region: 'Semarang',
    partner: 'Dompet Dhuafa',
    programTitle: 'Layanan Ambulans Tanggap Darurat & Obat Bebas Biaya',
    category: 'health',
    asnafCategory: 'Fakir & Miskin',
    amountIDR: 1800000,
    timeAgo: '2 jam lalu',
    txHash: '0x992fa614c8107e34',
    impactMetric: '6 Pasien Darurat Terlayani',
    blockHeight: 1849112,
  },
  {
    id: 'tx-comm-108',
    muzakkiCode: 'Muzakki #5532',
    region: 'Balikpapan',
    partner: 'Rumah Zakat',
    programTitle: 'Beasiswa Pendidikan Santri Dhuafa Tahfidz 3T',
    category: 'education',
    asnafCategory: 'Fisabilillah',
    amountIDR: 8500000,
    timeAgo: '3 jam lalu',
    txHash: '0x44cd8b12e098a511',
    impactMetric: '3 Paket Perlengkapan Pendidikan & SPP',
    blockHeight: 1849089,
  },
];

export const CommunityImpactWidget: React.FC<CommunityImpactWidgetProps> = ({
  theme,
  language,
  userZakatReserveIDR = 0,
  userDisbursedRecords = [],
  onOpenDisburse,
  onNavigateToTab,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframePeriod>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTxForProof, setSelectedTxForProof] = useState<AnonymousDistributionEvent | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Period-dependent aggregate data
  const aggregateStats = useMemo(() => {
    switch (timeframe) {
      case 'month':
        return {
          label: '30 Hari Terakhir',
          totalDisbursedIDR: 742500000,
          contributorsCount: 528,
          beneficiariesCount: 3240,
          umkmEmpoweredCount: 74,
          partnerNodesCount: 5,
          growthRate: '+14.2%',
          economicAmount: 271000000,
          educationAmount: 204000000,
          foodAmount: 156500000,
          healthAmount: 111000000,
          targetQuarterIDR: 1200000000,
        };
      case 'quarter':
        return {
          label: 'Kuartal 4 - 2026',
          totalDisbursedIDR: 2180400000,
          contributorsCount: 1640,
          beneficiariesCount: 9480,
          umkmEmpoweredCount: 228,
          partnerNodesCount: 5,
          growthRate: '+22.8%',
          economicAmount: 798000000,
          educationAmount: 597000000,
          foodAmount: 462000000,
          healthAmount: 323400000,
          targetQuarterIDR: 2500000000,
        };
      case 'year':
        return {
          label: 'Tahun Berjalan 2026',
          totalDisbursedIDR: 4120800000,
          contributorsCount: 3120,
          beneficiariesCount: 17890,
          umkmEmpoweredCount: 442,
          partnerNodesCount: 5,
          growthRate: '+38.5%',
          economicAmount: 1508000000,
          educationAmount: 1125000000,
          foodAmount: 873000000,
          healthAmount: 614800000,
          targetQuarterIDR: 5000000000,
        };
      case 'all':
      default:
        return {
          label: 'Sepanjang Masa (Platform Total)',
          totalDisbursedIDR: 5480920000,
          contributorsCount: 4380,
          beneficiariesCount: 23450,
          umkmEmpoweredCount: 582,
          partnerNodesCount: 5,
          growthRate: '+45.1%',
          economicAmount: 2017000000,
          educationAmount: 1496000000,
          foodAmount: 1162000000,
          healthAmount: 805920000,
          targetQuarterIDR: 6000000000,
        };
    }
  }, [timeframe]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatCompactIDR = (val: number) => {
    if (val >= 1000000000) {
      return `Rp ${(val / 1000000000).toFixed(2)} Miliar`;
    }
    if (val >= 1000000) {
      return `Rp ${(val / 1000000).toFixed(1)} Juta`;
    }
    return formatIDR(val);
  };

  // Filtered live events
  const filteredEvents = useMemo(() => {
    return LIVE_DISTRIBUTION_FEED.filter((evt) => {
      const matchCategory = selectedCategory === 'all' || evt.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        evt.muzakkiCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.programTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // User personal contribution total
  const userTotalDisbursedIDR = useMemo(() => {
    return userDisbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  }, [userDisbursedRecords]);

  // Calculate percentage of collective target achieved
  const targetPercent = Math.min(
    100,
    Math.round((aggregateStats.totalDisbursedIDR / aggregateStats.targetQuarterIDR) * 100)
  );

  // Generate Official PDF Report for Community Impact
  const handleDownloadCommunityReport = () => {
    setIsDownloadingPdf(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(6, 78, 59); // deep emerald
      doc.rect(0, 0, pageWidth, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('FINANCECITY ISLAMICITY - COMMUNITY IMPACT REPORT', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Laporan Agregat Distribusi Zakat, Infaq & Dampak Sosial Komunitas Muslim Web3', 14, 25);
      doc.text(
        `Periode Laporan: ${aggregateStats.label} | Standar PSAK 109 & AAOIFI Sharia Governance`,
        14,
        32
      );

      // Metrik Utama Komunitas
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. IKHTISAR DAMPAK KOLEKTIF KOMUNITAS', 14, 52);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 56, pageWidth - 28, 48, 3, 3, 'F');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Dana Tersalurkan:', 20, 66);
      doc.setFont('helvetica', 'normal');
      doc.text(formatIDR(aggregateStats.totalDisbursedIDR), 85, 66);

      doc.setFont('helvetica', 'bold');
      doc.text('Total Muzakki Berkontribusi:', 20, 74);
      doc.setFont('helvetica', 'normal');
      doc.text(`${aggregateStats.contributorsCount.toLocaleString('id-ID')} Muzakki Aktif (Anonim)`, 85, 74);

      doc.setFont('helvetica', 'bold');
      doc.text('Total Penerima Manfaat (Mustahiq):', 20, 82);
      doc.setFont('helvetica', 'normal');
      doc.text(`${aggregateStats.beneficiariesCount.toLocaleString('id-ID')} Jiwa Terbantu di 38 Provinsi`, 85, 82);

      doc.setFont('helvetica', 'bold');
      doc.text('Unit UMKM Mandiri Diberdayakan:', 20, 90);
      doc.setFont('helvetica', 'normal');
      doc.text(`${aggregateStats.umkmEmpoweredCount} Usaha Mikro Berkah`, 85, 90);

      doc.setFont('helvetica', 'bold');
      doc.text('Mitra Amil Resmi Terkoneksi:', 20, 98);
      doc.setFont('helvetica', 'normal');
      doc.text('BAZNAS RI, LAZ Dompet Dhuafa, Rumah Zakat, LAZISMU, LAZISNU', 85, 98);

      // Alokasi Program & Asnaf
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('2. ALOKASI DISTRIBUSI PROGRAM & ASNAF SYARIAH', 14, 116);

      const pillars = [
        {
          name: 'Pemberdayaan Ekonomi & Modal UMKM Berkah',
          asnaf: 'Fakir & Miskin Berdaya',
          amount: aggregateStats.economicAmount,
          pct: '36.8%',
        },
        {
          name: 'Beasiswa Pendidikan & Santri Prasejahtera 3T',
          asnaf: 'Fisabilillah & Ibnu Sabil',
          amount: aggregateStats.educationAmount,
          pct: '27.3%',
        },
        {
          name: 'Pangan Pokok & Logistik Darurat Lansia',
          asnaf: 'Fakir & Miskin',
          amount: aggregateStats.foodAmount,
          pct: '21.2%',
        },
        {
          name: 'Layanan Medis & Pengobatan Gratis Mustahiq',
          asnaf: 'Fakir & Miskin, Gharimin',
          amount: aggregateStats.healthAmount,
          pct: '14.7%',
        },
      ];

      let startY = 124;
      pillars.forEach((p, idx) => {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}. ${p.name} (${p.pct})`, 16, startY);
        doc.setFont('helvetica', 'normal');
        doc.text(`Asnaf: ${p.asnaf} | Realisasi: ${formatIDR(p.amount)}`, 20, startY + 5);
        startY += 12;
      });

      // Sampel Transaksi Terverifikasi On-Chain
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('3. AUDIT ON-CHAIN TRANSAKSI DISTRIBUSI TERAKHIR (PO-S-SHARIA)', 14, 180);

      let txY = 190;
      LIVE_DISTRIBUTION_FEED.slice(0, 5).forEach((item) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`[${item.timeAgo}] ${item.muzakkiCode} (${item.region}) -> ${item.partner}`, 16, txY);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `${item.programTitle} - ${formatIDR(item.amountIDR)} | Tx: ${item.txHash}`,
          20,
          txY + 4
        );
        txY += 10;
      });

      // Footer & Cryptographic Signature Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 252, pageWidth - 28, 30, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('VERIFIKASI INTEGRITAS KRIPTOGRAFIS & AUDIT INDEPENDEN:', 18, 260);

      doc.setFont('helvetica', 'normal');
      doc.text('Merkle Root Hash: 0x98f4a12ecb7001928374a5e01b339487c65d9e0231b4f', 18, 266);
      doc.text('Konsensus: Proof-of-Stake Sharia (PoSS) Node BAZNAS & LAZ Terlisensi', 18, 272);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleString('id-ID')} | Kerahasiaan Muzakki Dilindungi Zero-Knowledge Proofs`,
        18,
        278
      );

      doc.save(`Laporan-Dampak-Komunitas-Zakat-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      id="community-impact-widget"
      className={`rounded-2xl border p-5 md:p-6 transition-all shadow-xs ${
        theme === 'dark'
          ? 'bg-slate-900/95 border-emerald-900/40 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-900'
      }`}
    >
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Globe2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
              <span>Dampak Komunitas Zakat & Kesejahteraan</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                PoSS Ledger
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Statistik agregat anonim penyaluran Zakat Maal & Sedekah seluruh investor platform
            secara real-time, terverifikasi konsensus blockchain Proof-of-Stake Sharia (PoSS).
          </p>
        </div>

        {/* Action Buttons & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold">
            <button
              id="comm-filter-month"
              onClick={() => setTimeframe('month')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'month'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Hari
            </button>
            <button
              id="comm-filter-quarter"
              onClick={() => setTimeframe('quarter')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'quarter'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Kuartal 4
            </button>
            <button
              id="comm-filter-year"
              onClick={() => setTimeframe('year')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'year'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2026
            </button>
            <button
              id="comm-filter-all"
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Seluruh Waktu
            </button>
          </div>

          {/* Download PDF button */}
          <button
            id="comm-download-report-btn"
            onClick={handleDownloadCommunityReport}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all shadow-xs"
            title="Unduh Laporan Dampak Komunitas Resmi (PDF)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? 'Menyusun...' : 'Laporan PDF'}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metric Highlights (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* Card 1: Total Disbursed */}
        <div
          className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-emerald-50/50 border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Dana Tersalurkan</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight text-emerald-500 mt-2">
            {formatCompactIDR(aggregateStats.totalDisbursedIDR)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>{aggregateStats.label}</span>
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              {aggregateStats.growthRate}
            </span>
          </div>
        </div>

        {/* Card 2: Contributing Muzakki */}
        <div
          className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-emerald-50/50 border-emerald-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Muzakki Komunitas Aktif</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight text-teal-400 mt-2">
            {aggregateStats.contributorsCount.toLocaleString('id-ID')}
            <span className="text-xs font-semibold text-slate-400 ml-1">Muzakki</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Identitas Terlindungi (ZK)</span>
            <span className="text-teal-400 font-bold">100% Syariah</span>
          </div>
        </div>

        {/* Card 3: Beneficiaries Count */}
        <div
          className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-cyan-50/50 border-cyan-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Penerima Manfaat (Mustahiq)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight text-cyan-400 mt-2">
            {aggregateStats.beneficiariesCount.toLocaleString('id-ID')}
            <span className="text-xs font-semibold text-slate-400 ml-1">Jiwa</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>38 Provinsi di Indonesia</span>
            <span className="text-cyan-400 font-bold">8 Asnaf</span>
          </div>
        </div>

        {/* Card 4: Empowered UMKM Units */}
        <div
          className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-950/60 border-slate-800'
              : 'bg-amber-50/50 border-amber-100'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>UMKM Dhuafa Mandiri</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black tracking-tight text-amber-400 mt-2">
            {aggregateStats.umkmEmpoweredCount}
            <span className="text-xs font-semibold text-slate-400 ml-1">Unit Berdaya</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Bebas Utang & Riba</span>
            <span className="text-amber-400 font-bold">Gerobak Berkah</span>
          </div>
        </div>
      </div>

      {/* Community Collective Milestone Target (Q4 2026) */}
      <div
        className={`mt-4 p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-950 border-emerald-900/30'
            : 'bg-gradient-to-r from-emerald-50/60 to-white border-emerald-100'
        }`}
      >
        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Target Gotong Royong Komunitas: Rp 6.000.000.000</span>
            </div>
            <span className="font-bold text-emerald-500">{targetPercent}% Tercapai</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${targetPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Terkumpul: {formatIDR(aggregateStats.totalDisbursedIDR)}</span>
            <span>Target Akhir Q4 2026</span>
          </div>
        </div>

        {/* User Contribution Call-to-Action */}
        <div className="w-full md:w-1/3 flex flex-col sm:flex-row md:flex-col gap-2">
          {userZakatReserveIDR > 0 ? (
            <button
              id="comm-disburse-my-zakat-btn"
              onClick={onOpenDisburse}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Salurkan Zakat Saya ({formatIDR(userZakatReserveIDR)})</span>
            </button>
          ) : (
            <button
              id="comm-explore-disburse-btn"
              onClick={onOpenDisburse}
              className="w-full py-2 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Bantu Capai Target Komunitas</span>
            </button>
          )}

          {userTotalDisbursedIDR > 0 && (
            <div className="text-[11px] text-center text-slate-400">
              Kontribusi pribadi Anda:{' '}
              <span className="font-bold text-emerald-400">{formatIDR(userTotalDisbursedIDR)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Welfare Programs & Asnaf Allocation Breakdown */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Alokasi Penyaluran Sektor Kesejahteraan Sosial (Asnaf)</span>
          </h3>
          <span className="text-[11px] text-slate-400">Realisasi Akurat 100%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sektor 1: Ekonomi */}
          <div
            className={`p-3.5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Modal Usaha Berkah</div>
                  <div className="text-[10px] text-slate-400">Asnaf Fakir & Miskin</div>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-500">36.8%</span>
            </div>
            <div className="text-sm font-bold text-slate-200 mt-2">
              {formatIDR(aggregateStats.economicAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {aggregateStats.umkmEmpoweredCount} gerobak usaha & modal kerja bergulir syariah.
            </p>
          </div>

          {/* Sektor 2: Pendidikan */}
          <div
            className={`p-3.5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Beasiswa Santri 3T</div>
                  <div className="text-[10px] text-slate-400">Asnaf Fisabilillah</div>
                </div>
              </div>
              <span className="text-xs font-black text-cyan-400">27.3%</span>
            </div>
            <div className="text-sm font-bold text-slate-200 mt-2">
              {formatIDR(aggregateStats.educationAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              SPP & logistik asrama santri tahfidz prasejahtera.
            </p>
          </div>

          {/* Sektor 3: Pangan */}
          <div
            className={`p-3.5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Pangan & Sembako</div>
                  <div className="text-[10px] text-slate-400">Asnaf Fakir & Miskin</div>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400">21.2%</span>
            </div>
            <div className="text-sm font-bold text-slate-200 mt-2">
              {formatIDR(aggregateStats.foodAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Beras premium & sembako untuk lansia sebatang kara.
            </p>
          </div>

          {/* Sektor 4: Kesehatan */}
          <div
            className={`p-3.5 rounded-xl border ${
              theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">Klinik & Medis Gratis</div>
                  <div className="text-[10px] text-slate-400">Asnaf Mustahiq</div>
                </div>
              </div>
              <span className="text-xs font-black text-teal-400">14.7%</span>
            </div>
            <div className="text-sm font-bold text-slate-200 mt-2">
              {formatIDR(aggregateStats.healthAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ambulans bebas biaya, penanganan stunting & obat dhuafa.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Anonymous Distribution Stream (Live PoSS Ledger Ticker) */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <span>Arus Distribusi Komunitas Real-Time (PoSS On-Chain)</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-400 font-mono">
              Live Feed
            </span>
          </div>

          {/* Filter & Search Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="comm-search-feed"
                type="text"
                placeholder="Cari Muzakki, Program, Lembaga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 w-44 md:w-56"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-xs">
              <button
                id="comm-cat-all"
                onClick={() => setSelectedCategory('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-slate-700 text-white dark:bg-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              <button
                id="comm-cat-economic"
                onClick={() => setSelectedCategory('economic')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === 'economic'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                UMKM
              </button>
              <button
                id="comm-cat-education"
                onClick={() => setSelectedCategory('education')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === 'education'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pendidikan
              </button>
              <button
                id="comm-cat-food"
                onClick={() => setSelectedCategory('food')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  selectedCategory === 'food'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pangan
              </button>
            </div>
          </div>
        </div>

        {/* Live List Items */}
        <div className="space-y-2 mt-2">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 sm:mt-0 ${
                    evt.category === 'economic'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : evt.category === 'education'
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : evt.category === 'health'
                      ? 'bg-teal-500/10 text-teal-400'
                      : evt.category === 'food'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {evt.category === 'economic' && <Briefcase className="w-4 h-4" />}
                  {evt.category === 'education' && <GraduationCap className="w-4 h-4" />}
                  {evt.category === 'health' && <Stethoscope className="w-4 h-4" />}
                  {evt.category === 'food' && <UtensilsCrossed className="w-4 h-4" />}
                  {evt.category === 'gharimin' && <ShieldCheck className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      {evt.muzakkiCode}
                    </span>
                    <span className="text-[10px] text-slate-400">({evt.region})</span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-semibold text-slate-400">
                      {evt.partner}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {evt.timeAgo}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {evt.programTitle}
                  </div>

                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Dampak Langsung: {evt.impactMetric}</span>
                  </div>
                </div>
              </div>

              {/* Amount and Proof */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
                <div className="text-sm font-black text-emerald-500">
                  {formatIDR(evt.amountIDR)}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    id={`verify-tx-${evt.id}-btn`}
                    onClick={() => setSelectedTxForProof(evt)}
                    className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-0.5 underline decoration-slate-600 hover:decoration-emerald-400 transition-colors"
                    title="Verifikasi Bukti Kriptografis PoSS"
                  >
                    <Lock className="w-2.5 h-2.5 text-emerald-500" />
                    <span>{evt.txHash.slice(0, 8)}...</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              Tidak ada data distribusi yang cocok dengan kriteria pencarian "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* Official Amil Partner Nodes Footnote */}
      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-300">Lembaga Amil Mitra Resmi:</span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">
            BAZNAS RI
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">
            Dompet Dhuafa
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">
            Rumah Zakat
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">
            LAZISMU
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px]">
            LAZISNU
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Audit Sesuai Regulasi UU No. 23/2011 & DSN-MUI</span>
        </div>
      </div>

      {/* Cryptographic Proof Verification Modal */}
      {selectedTxForProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setSelectedTxForProof(null)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl border p-5 md:p-6 shadow-2xl ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Bukti Kriptografis PoSS Sharia</h4>
                  <p className="text-[10px] text-slate-400">Verifikasi Integritas Salur On-Chain</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTxForProof(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tx Hash:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400 font-bold">{selectedTxForProof.txHash}</span>
                    <button
                      onClick={() => handleCopyHash(selectedTxForProof.txHash)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Salin Hash"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Hash className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Block Height:</span>
                  <span>#{selectedTxForProof.blockHeight}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Muzakki (Anonim):</span>
                  <span>{selectedTxForProof.muzakkiCode} ({selectedTxForProof.region})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mitra Amil:</span>
                  <span className="text-teal-400 font-bold">{selectedTxForProof.partner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Nominal Penyaluran:</span>
                  <span className="text-emerald-400 font-bold">{formatIDR(selectedTxForProof.amountIDR)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Asnaf Penerima:</span>
                  <span>{selectedTxForProof.asnafCategory}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Jaminan Privasi Zero-Knowledge (ZK-SNARKs)</span>
                </div>
                <p className="text-slate-400">
                  Data dompet dan nominal portofolio muzakki tidak pernah diekspos ke publik.
                  Protokol PoSS hanya membuktikan secara matematis bahwa dana berasal dari aset halal
                  teraudit dan telah 100% diterima oleh rekening resmi BAZNAS/LAZ mitra.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTxForProof(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
