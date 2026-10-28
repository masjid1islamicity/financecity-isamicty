import React, { useState, useMemo, useCallback } from 'react';
import {
  HeartHandshake,
  Users,
  Sparkles,
  ShieldCheck,
  Building2,
  MapPin,
  Quote,
  TrendingUp,
  GraduationCap,
  Stethoscope,
  Briefcase,
  Sprout,
  Filter,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Share2,
  Check,
  Award,
  Globe,
  DollarSign,
  FileDown,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatProgramDistributionData, ZakatImpactGoalConfig } from '../types';
import { initialZakatProgramDistributions } from '../data/initialState';
import { ZakatImpactCumulativeD3Chart } from './ZakatImpactCumulativeD3Chart';
import { ZakatImpactGeoMap } from './ZakatImpactGeoMap';
import { ZakatAnnualImpactGoal } from './ZakatAnnualImpactGoal';
import { ZakatAiImpactInsights } from './ZakatAiImpactInsights';
import { ZakatAnnualImpactPdfModal } from './ZakatAnnualImpactPdfModal';
import { ZakatProjectPhotoGallery } from './ZakatProjectPhotoGallery';
import { ZakatSocialShareModal } from './ZakatSocialShareModal';
import { ZakatBadgesAchievements } from './ZakatBadgesAchievements';
import { ZakatCommunityImpactComparison } from './ZakatCommunityImpactComparison';
import { ZakatEducationalResources } from './ZakatEducationalResources';
import { ZakatImpactTimelineSlider, ZakatTimelineFilterRange } from './ZakatImpactTimelineSlider';

export interface BeneficiaryStory {
  id: string;
  institutionKey: 'BAZNAS' | 'DOMPET_DHUAFA' | 'RUMAH_ZAKAT' | 'LAZISMU' | 'LAZISNU';
  institutionName: string;
  beneficiaryName: string;
  age: number;
  location: string;
  role: string;
  programCategory: 'umkm' | 'health' | 'education' | 'food';
  programTitle: string;
  asnafCategory: 'Fakir' | 'Miskin' | 'Fisabilillah' | 'Gharimin';
  quote: string;
  fullNarrative: string;
  metrics: {
    label: string;
    before: string;
    after: string;
    growthHighlight: string;
  };
  surveyorNote: string;
  surveyDate: string;
  sdgGoal: string;
  defaultReceiptNo?: string;
  tags: string[];
}

const BENEFICIARY_STORIES: BeneficiaryStory[] = [
  {
    id: 'story-baznas-umkm-1',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    beneficiaryName: 'Pak Suparman',
    age: 48,
    location: 'Cilincing, Jakarta Utara',
    role: 'Pedagang Olahan Ayam / Anggota Z-Chicken',
    programCategory: 'umkm',
    programTitle: 'Pemberdayaan UMKM Mustahik',
    asnafCategory: 'Miskin',
    quote:
      'Dulu gerobak saya reyot dan modal habis terpakai kebutuhan darurat keluarga. Alhamdulillah berkat dana zakat muzakki BAZNAS, saya menerima gerobak etalase baru, sertifikasi higienis, dan modal kerja Rp 2.500.000.',
    fullNarrative:
      'Pak Suparman merupakan tulang punggung keluarga dengan 3 anak yang sempat terancam putus sekolah. Melalui program Lembaga Pemberdayaan Ekonomi Mustahik (LPEM) BAZNAS yang didanai zakat maal, beliau menerima gerobak Z-Chicken standar higienis, pelatihan pembukuan digital kasir, dan suntikan modal kerja bahan baku. Dalam tempo 4 bulan, omzet usaha beliau naik drastis dan stabil, bahkan kini mulai menyisihkan tabungan infaq harian di celengan BAZNAS.',
    metrics: {
      label: 'Pendapatan Bersih Usaha',
      before: 'Rp 1.400.000 / bln',
      after: 'Rp 4.150.000 / bln',
      growthHighlight: '+196% Kenaikan Omzet',
    },
    surveyorNote:
      'Usaha berkembang pesat, 2 anak kini melanjutkan pendidikan ke jenjang SMK dan SMP. Mustahik siap bertransisi menjadi Munfiq mandiri.',
    surveyDate: '18 September 2026',
    sdgGoal: 'SDG 1 (Tanpa Kemiskinan) & SDG 8 (Pekerjaan Layak)',
    defaultReceiptNo: 'BSZ-BAZNAS-202609-901842',
    tags: ['Z-Chicken', 'Modal Bergulir', 'Transformasi Mustahik'],
  },
  {
    id: 'story-dd-kesehatan-1',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    beneficiaryName: 'Ibu Siti Aminah & Balita Zidni',
    age: 38,
    location: 'Parung, Kab. Bogor, Jawa Barat',
    role: 'Ibu Rumah Tangga / Keluarga Buruh Tani',
    programCategory: 'health',
    programTitle: 'RS Rumah Sehat Dhuafa & LKC',
    asnafCategory: 'Fakir',
    quote:
      'Zidni (3 tahun) sempat sesak napas akut dan demam tinggi 40°C. Kami panik karena tidak punya biaya rumah sakit umum. Di RS Rumah Sehat Dompet Dhuafa, anak saya dirawat 8 hari penuh kasih tanpa dipungut biaya satu rupiah pun.',
    fullNarrative:
      'Sebagai keluarga buruh lepas tani tanpa jaminan kesehatan komprehensif, sakit mendadak adalah momok menakutkan bagi Ibu Aminah. Fasilitas Layanan Kesehatan Cuma-Cuma (LKC) RS Rumah Sehat Dompet Dhuafa membiayai seluruh pemeriksaan radiologi toraks, infus obat bronkopneumonia, dan pendampingan gizi anak. Program ini 100% dialokasikan dari pos asnaf fakir-miskin zakat maal muzakki.',
    metrics: {
      label: 'Efisiensi Biaya Penyelamatan Jiwa',
      before: 'Beban Medis Rp 5.200.000',
      after: 'Biaya Pasien Rp 0 (100% Tercover Zakat)',
      growthHighlight: 'Pulih Total & Bebas Stunting',
    },
    surveyorNote:
      'Kondisi balita telah sembuh total, berat badan naik 1.2 kg dalam pemantauan pos gizi terpadu Dompet Dhuafa.',
    surveyDate: '20 September 2026',
    sdgGoal: 'SDG 3 (Kesehatan yang Baik & Kesejahteraan)',
    defaultReceiptNo: 'BSZ-DOMPET_DHUAFA-202609-391048',
    tags: ['Rumah Sehat', 'Layanan Medis Gratis', 'Penyelamatan Balita'],
  },
  {
    id: 'story-baznas-pendidikan-1',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    beneficiaryName: 'Ahmad Fauzi',
    age: 20,
    location: 'Sukoharjo, Jawa Tengah',
    role: 'Mahasiswa Teknik Informatika / Santri Dhuafa',
    programCategory: 'education',
    programTitle: 'Beasiswa Cendekia BAZNAS (BCB)',
    asnafCategory: 'Fisabilillah',
    quote:
      'Ayah saya bekerja menarik becak ontel, penghasilan tidak menentu. BAZNAS hadir memberikan beasiswa SPP kuliah penuh hingga lulus sarjana dan subsidi laptop untuk coding tugas akhir.',
    fullNarrative:
      'Ahmad Fauzi memiliki potensi akademik luar biasa dengan indeks prestasi kumulatif (IPK) 3.86, namun sempat berniat mengundurkan diri dari bangku perguruan tinggi karena keterbatasan ekonomi. Program Beasiswa Cendekia BAZNAS menyalurkan bantuan dana zakat pendidikan untuk biaya UKT, pembinaan karakter kepemimpinan, dan uang saku riset komputasi syariah.',
    metrics: {
      label: 'Capaian Prestasi Akademik',
      before: 'Terancam Drop Out Ekonomi',
      after: 'IPK 3.86 & Juara Hackathon Nasional',
      growthHighlight: '100% Biaya UKT & Laptop Riset',
    },
    surveyorNote:
      'Aktif mengajar ngaji anak-anak dhuafa sekitar kampus setiap sore akhir pekan sebagai wujud dedikasi sosial.',
    surveyDate: '12 September 2026',
    sdgGoal: 'SDG 4 (Pendidikan Berkualitas)',
    tags: ['Beasiswa Santri', 'Teknologi AI Syariah', 'Generasi Emas'],
  },
  {
    id: 'story-dd-umkm-2',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    beneficiaryName: 'Fajar Kurniawan',
    age: 27,
    location: 'Ciputat, Tangerang Selatan',
    role: 'Teknisi Elektronika & Servis Digital (Difabel Mandiri)',
    programCategory: 'umkm',
    programTitle: 'Institut Kemandirian (Vokasi Difabel)',
    asnafCategory: 'Miskin',
    quote:
      'Sebagai penyandang disabilitas tuna daksa, dulu saya ditolak puluhan lamaran kerja. Melalui beasiswa pelatihan vokasi 3 bulan di Dompet Dhuafa, saya dibekali keahlian solder micro-chip dan kini punya bengkel servis sendiri.',
    fullNarrative:
      'Fajar kini mengoperasikan workshop mikro servis smartphone dan laptop di kontrakannya. Selain mandiri secara finansial, Fajar kini melatih 2 pemuda dhuafa di lingkungannya agar memiliki keahlian teknis serupa sehingga tidak menganggur.',
    metrics: {
      label: 'Kemandirian Ekonomi Difabel',
      before: 'Pengangguran 0 Penghasilan',
      after: 'Laba Bersih Rp 3.800.000 / bln',
      growthHighlight: 'Membuka Lapangan Kerja 2 Orang',
    },
    surveyorNote:
      'Kemandirian luar biasa, telah mampu membeli alat ukur osiloskop mandiri dan aktif berinfaq.',
    surveyDate: '16 September 2026',
    sdgGoal: 'SDG 8 & 10 (Pekerjaan Layak & Kesetaraan)',
    tags: ['Vokasi Kemandirian', 'Pemberdayaan Difabel', 'Teknologi Servis'],
  },
  {
    id: 'story-rz-pangan-1',
    institutionKey: 'RUMAH_ZAKAT',
    institutionName: 'Rumah Zakat Indonesia',
    beneficiaryName: 'Kelompok Tani Berkah (Pak Endang & 14 Petani)',
    age: 51,
    location: 'Sumedang, Jawa Barat',
    role: 'Petani Padi Organik Desa Berdaya',
    programCategory: 'food',
    programTitle: 'Desa Berdaya & Ketahanan Pangan',
    asnafCategory: 'Miskin',
    quote:
      'Bantuan sumur bor pompa tenaga surya dan bibit padi organik dari zakat Rumah Zakat menyelamatkan 4 hektar sawah kami dari kekeringan ekstrem. Panen musim ini selamat dan berlimpah.',
    fullNarrative:
      'Program Desa Berdaya Rumah Zakat mengintegrasikan modal wakaf produktif dan zakat pertanian untuk membangun ekosistem irigasi ramah lingkungan bagi kelompok tani marjinal. Hasil panen dipasarkan ke koperasi syariah dengan margin harga adil tanpa perantara tengkulak.',
    metrics: {
      label: 'Produktivitas Panen Kelompok',
      before: '2.8 Ton / Ha (Sering Gagal)',
      after: '4.7 Ton / Ha (Panen Organik)',
      growthHighlight: '+67% Hasil Panen Selamat',
    },
    surveyorNote:
      '14 Kepala Keluarga mustahik kini memiliki cadangan lumbung pangan beras mandiri untuk 1 tahun ke depan.',
    surveyDate: '10 September 2026',
    sdgGoal: 'SDG 2 (Tanpa Kelaparan) & SDG 12 (Pertanian Berkelanjutan)',
    tags: ['Ketahanan Pangan', 'Desa Berdaya', 'Irigasi Tenaga Surya'],
  },
  {
    id: 'story-lazis-dakwah-1',
    institutionKey: 'LAZISMU',
    institutionName: 'LAZISMU / LAZIS Pedalaman',
    beneficiaryName: 'Ustadz Mansyur',
    age: 44,
    location: 'Pulau Semau, Kupang, Nusa Tenggara Timur',
    role: 'Da’i Pemberdaya & Pengajar Madrasah Pesisir',
    programCategory: 'education',
    programTitle: 'Kafalah Da’i & Madrasah Bahari',
    asnafCategory: 'Fisabilillah',
    quote:
      'Anak-anak nelayan di pulau ini dulunya harus menyeberang laut perahu 1 jam untuk belajar membaca dan mengaji. Berkat kafalah dan renovasi perahu dakwah dari LAZIS, 85 santri kini belajar setiap hari dengan aman.',
    fullNarrative:
      'Ustadz Mansyur mendedikasikan 12 tahun hidupnya membina masyarakat nelayan terpencil. Penyaluran zakat maal memastikan beliau menerima tunjangan kehormatan berkala, bantuan modul iqro/Al-Qur’an tahan air, serta solar perahu untuk mobilitas antar pulau pesisir.',
    metrics: {
      label: 'Jangkauan Edukasi & Dakwah',
      before: '18 Santri (Perahu Rusak)',
      after: '85 Santri Aktif Mengaji Gratis',
      growthHighlight: '85 Generasi Qur’ani Bahari Terbantu',
    },
    surveyorNote:
      'Penyaluran berkala aman dan diterima langsung dengan tanda tangan berita acara resmi para tokoh nelayan.',
    surveyDate: '08 September 2026',
    sdgGoal: 'SDG 4 (Pendidikan) & Syiar Pemberdayaan',
    tags: ['Da’i Pedalaman', 'Perahu Dakwah', 'Pesisir Terluar'],
  },
];

interface ZakatImpactReportProps {
  disbursedRecords: ZakatSummaryRecord[];
  programDistributions?: ZakatProgramDistributionData[];
  annualImpactGoal?: ZakatImpactGoalConfig | null;
  annualTargetIDR?: number;
  remainingReserveIDR?: number;
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
  onOpenReport?: () => void;
}

export const ZakatImpactReport: React.FC<ZakatImpactReportProps> = ({
  disbursedRecords,
  programDistributions,
  annualImpactGoal,
  annualTargetIDR = 15000000,
  remainingReserveIDR = 3750000,
  theme,
  language,
  onOpenDisburse,
  onOpenReport,
}) => {
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [activeStoryModal, setActiveStoryModal] = useState<BeneficiaryStory | null>(null);
  const [copiedStoryId, setCopiedStoryId] = useState<string | null>(null);
  const [isAnnualPdfModalOpen, setIsAnnualPdfModalOpen] = useState<boolean>(false);
  const [isSocialShareModalOpen, setIsSocialShareModalOpen] = useState<boolean>(false);
  const [timelineRange, setTimelineRange] = useState<ZakatTimelineFilterRange | null>(null);

  // Stable handler for timeline range updates to prevent render loops
  const handleTimelineRangeChange = useCallback((range: ZakatTimelineFilterRange) => {
    setTimelineRange((prev) => {
      if (
        prev &&
        prev.startIndex === range.startIndex &&
        prev.endIndex === range.endIndex &&
        prev.isFullRange === range.isFullRange
      ) {
        return prev;
      }
      return range;
    });
  }, []);

  // Active program distributions filtered by timeline slider
  const activeProgramDistributions = useMemo(() => {
    const baseDistributions = programDistributions || initialZakatProgramDistributions;
    if (!timelineRange || timelineRange.isFullRange) {
      return baseDistributions;
    }
    return baseDistributions.slice(timelineRange.startIndex, timelineRange.endIndex + 1);
  }, [programDistributions, timelineRange]);

  // Active disbursed records filtered by timeline slider
  const activeDisbursedRecords = useMemo(() => {
    if (!timelineRange || timelineRange.isFullRange) {
      return disbursedRecords;
    }
    return disbursedRecords.filter((r) => {
      const recordDate = r.date.split(' ')[0];
      return recordDate >= timelineRange.startDate && recordDate <= timelineRange.endDate;
    });
  }, [disbursedRecords, timelineRange]);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Derive unique institutions from actual user records
  const userInstitutionKeys = useMemo(() => {
    return Array.from(new Set(disbursedRecords.map((r) => r.institution)));
  }, [disbursedRecords]);

  // Total funds disbursed from records
  const totalDisbursedIDR = useMemo(() => {
    return disbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  }, [disbursedRecords]);

  // Filtered stories
  const filteredStories = useMemo(() => {
    return BENEFICIARY_STORIES.filter((story) => {
      const matchInst =
        selectedInstitutionFilter === 'ALL' ||
        story.institutionKey === selectedInstitutionFilter;
      const matchCat =
        selectedCategoryFilter === 'ALL' || story.programCategory === selectedCategoryFilter;
      return matchInst && matchCat;
    });
  }, [selectedInstitutionFilter, selectedCategoryFilter]);

  // Match actual user records to stories if available
  const getLinkedUserRecord = (story: BeneficiaryStory) => {
    // 1. Try finding a record with matching institution
    const matchedRecord = disbursedRecords.find(
      (r) =>
        r.institution === story.institutionKey ||
        r.institutionName.toLowerCase().includes(story.institutionKey.toLowerCase()) ||
        (story.defaultReceiptNo && r.receiptNumber === story.defaultReceiptNo)
    );
    return matchedRecord || null;
  };

  // Copy Impact Quote to clipboard
  const handleCopyQuote = (story: BeneficiaryStory) => {
    const text = `"${story.quote}" — ${story.beneficiaryName} (${story.role}), Penerima Manfaat Program ${story.programTitle} via ${story.institutionName}.\n\nDiverifikasi oleh BAZNAS RI & FinanceCity Islamicity Social Impact Protocol.`;
    navigator.clipboard.writeText(text);
    setCopiedStoryId(story.id);
    setTimeout(() => setCopiedStoryId(null), 2500);
  };

  // Icon helper based on program category
  const getCategoryIcon = (cat: BeneficiaryStory['programCategory']) => {
    switch (cat) {
      case 'umkm':
        return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case 'health':
        return <Stethoscope className="w-3.5 h-3.5 text-rose-400" />;
      case 'education':
        return <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />;
      case 'food':
        return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  const getCategoryBadgeClass = (cat: BeneficiaryStory['programCategory']) => {
    switch (cat) {
      case 'umkm':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'health':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'education':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'food':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    }
  };

  return (
    <div
      id="zakat-impact-report-section"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-teal-500/30 shadow-xl shadow-teal-950/10'
          : 'bg-white border-teal-200/90 shadow-sm'
      }`}
    >
      {/* Impact Report Section Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-amber-500/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Laporan Dampak Sosial (Social Impact Report)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Transparansi Penyaluran Mustahik 8 Asnaf
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Menampilkan kisah nyata transformasi kehidupan para mustahik (penerima manfaat) dari dana zakat yang telah Anda salurkan melalui lembaga amil resmi mitra (BAZNAS, Dompet Dhuafa, Rumah Zakat).
              </p>
            </div>
          </div>

          {/* Quick Aggregate Stats Badge */}
          <div className="flex items-center gap-3 self-start lg:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            <div
              className={`px-3.5 py-2 rounded-xl border text-center ${
                theme === 'dark'
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                Total Zakat Tersalurkan
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {formatIDR(totalDisbursedIDR)}
              </span>
            </div>

            <div
              className={`px-3.5 py-2 rounded-xl border text-center ${
                theme === 'dark'
                  ? 'bg-slate-950/80 border-slate-800'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">
                Estimasi Mustahik Terbantu
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {Math.max(12, disbursedRecords.length * 6)}+ Jiwa
              </span>
            </div>

            {/* Download Annual Impact PDF Report Button */}
            <button
              id="download-annual-impact-pdf-header-btn"
              onClick={() => setIsAnnualPdfModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/25 cursor-pointer shrink-0"
              title="Unduh Laporan Kontribusi & Dampak Sosial Tahunan Resmi (PDF Ber-BSZ)"
            >
              <FileDown className="w-4 h-4 text-amber-300" />
              <span>Unduh Laporan PDF</span>
            </button>

            {/* Badges & Achievements Quick Link */}
            <button
              id="scroll-to-badges-header-btn"
              onClick={() => {
                const el = document.getElementById('zakat-badges-achievements-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-98 text-amber-300 border border-amber-500/35 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
              title="Lihat Lencana & Prestasi Digital atas Capaian Penyaluran Zakat"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Lencana & Prestasi</span>
            </button>

            {/* Community Impact Comparison Quick Link */}
            <button
              id="scroll-to-community-comparison-header-btn"
              onClick={() => {
                const el = document.getElementById('zakat-community-impact-comparison-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 active:scale-98 text-sky-300 border border-sky-500/35 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
              title="Bandingkan Dampak Zakat Personal Anda dengan Rata-Rata Komunitas & Target Global SDGs"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Dampak vs. Komunitas</span>
            </button>

            {/* Educational Zakat Resources Quick Link */}
            <button
              id="scroll-to-educational-resources-header-btn"
              onClick={() => {
                const el = document.getElementById('zakat-educational-resources-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-98 text-emerald-300 border border-emerald-500/35 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
              title="Pusat Edukasi Zakat, Standar Nisab, & Etika Keuangan Syariah dengan Search Grounding"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Edukasi & Etika Syariah</span>
            </button>

            {/* Interactive Timeline Slider Quick Link */}
            <button
              id="scroll-to-timeline-slider-header-btn"
              onClick={() => {
                const el = document.getElementById('zakat-interactive-timeline-slider');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 active:scale-98 text-teal-300 border border-teal-500/35 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
              title="Filter Visual Grafik & Peta dengan Slider Rentang Waktu Multi-Tahun (2023 - 2026)"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Timeline Multi-Tahun</span>
            </button>

            {/* Share to Social Media Milestone Button */}
            <button
              id="share-social-media-milestone-header-btn"
              onClick={() => setIsSocialShareModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-500 hover:to-teal-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-sky-600/25 cursor-pointer shrink-0"
              title="Bagikan Milestone & Capaian Zakat ke Media Sosial (Twitter/X, LinkedIn, WhatsApp)"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Bagikan ke Medsos</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars of Verified Social Impact (KPI Bar) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                100% Tepat Sasaran
              </span>
              <span className="text-[10px] text-slate-400">8 Asnaf QS. At-Taubah 60</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                Lembaga Amil Resmi
              </span>
              <span className="text-[10px] text-slate-400">BAZNAS RI & LAZ Nasional</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                Bukti Setor Resmi (BSZ)
              </span>
              <span className="text-[10px] text-slate-400">Pengurang Pajak PPh Resmi</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block text-[11px]">
                Pemberdayaan Berkelanjutan
              </span>
              <span className="text-[10px] text-slate-400">Mustahik Menjadi Muzakki</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* AI-Driven Zakat Insights: Gemini 3.8 Flash Ethical Optimization & Future Allocation Recommendations */}
        <ZakatAiImpactInsights
          disbursedRecords={disbursedRecords}
          programDistributions={programDistributions || initialZakatProgramDistributions}
          annualImpactGoal={annualImpactGoal || null}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Annual Zakat Impact Goal: Social Outcome Tracking & Goal Setting */}
        <ZakatAnnualImpactGoal
          disbursedRecords={disbursedRecords}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Badges & Achievements System: Digital Visual Accolades for Cumulative Milestones */}
        <ZakatBadgesAchievements
          disbursedRecords={disbursedRecords}
          annualTargetIDR={annualTargetIDR}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Community Impact Comparison: Personal Contribution vs Community Average & UN SDGs 2030 */}
        <ZakatCommunityImpactComparison
          disbursedRecords={disbursedRecords}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Educational Zakat Resources: Q&A on Zakat Calculations & Islamic Finance Ethics with Search Grounding */}
        <ZakatEducationalResources
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Interactive Multi-Year Timeline Slider: Filter visual charts and maps by specific date ranges */}
        <ZakatImpactTimelineSlider
          disbursedRecords={disbursedRecords}
          programDistributions={programDistributions || initialZakatProgramDistributions}
          onRangeChange={handleTimelineRangeChange}
          theme={theme}
          language={language}
        />

        {/* D3.js Chart: Cumulative Distribution of Zakat Funds Over Time Across Programs */}
        <ZakatImpactCumulativeD3Chart
          data={activeProgramDistributions}
          disbursedRecords={activeDisbursedRecords}
          theme={theme}
          language={language}
        />

        {/* Geographical Distribution: Stylized Map of Indonesia Plotting Recent Disbursements Across Regions */}
        <ZakatImpactGeoMap
          disbursedRecords={activeDisbursedRecords}
          dateRangeFilter={
            timelineRange && !timelineRange.isFullRange
              ? {
                  startDate: timelineRange.startDate,
                  endDate: timelineRange.endDate,
                  label: timelineRange.label,
                }
              : undefined
          }
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Interactive Photo Gallery: Field Project Sites & Verified Zakat Impact */}
        <ZakatProjectPhotoGallery
          disbursedRecords={activeDisbursedRecords}
          theme={theme}
          language={language}
          onOpenDisburse={onOpenDisburse}
        />

        {/* Annual Zakat & Social Impact PDF Download Executive Banner */}
        <div
          id="annual-zakat-impact-pdf-card"
          className={`p-5 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/30 border-teal-500/30 shadow-lg'
              : 'bg-gradient-to-r from-teal-50 via-white to-emerald-50 border-teal-200 shadow-xs'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 shadow-inner">
                <FileDown className="w-6 h-6 text-teal-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    Ekspor Laporan Resmi: Kontribusi Zakat & Statistik Dampak Sosial Tahunan (PDF)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    UU No. 23/2011 Pasal 22
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    PSAK 109 & BAZNAS RI
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  Unduh berkas PDF 2 halaman lengkap dan terverifikasi tanda tangan tripartit digital. Memuat rincian realisasi donasi, capaian target dampak (mustahik, santri 3T, UMKM), sebaran 5 pilar SDG, jangkauan kepulauan Nusantara, serta nomor register Bukti Setor Zakat (BSZ) resmi untuk pengurang pajak SPT Tahunan PPh.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-teal-400/90 pt-1 font-semibold flex-wrap">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> 100% Bukti Setor Resmi (BSZ)
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Sah Pengurang Pajak PPh
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Stempel BAZNAS & Dewan Pengawas Syariah
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 self-start lg:self-center">
              <button
                id="annual-impact-open-share-modal-btn"
                onClick={() => setIsSocialShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 active:scale-98 text-sky-400 font-bold text-xs transition-all shadow-xs cursor-pointer"
                title="Bagikan Milestone & Capaian Zakat ke Twitter/X, LinkedIn, WhatsApp"
              >
                <Share2 className="w-4 h-4 text-sky-300" />
                <span>Bagikan Medsos</span>
              </button>

              <button
                id="annual-impact-open-pdf-modal-btn"
                onClick={() => setIsAnnualPdfModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-black text-xs transition-all shadow-md shadow-teal-600/25 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-amber-300" />
                <span>Unduh Laporan Tahunan (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stories Section Header & Filter */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h5 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Quote className="w-4 h-4 text-teal-400" />
                Kisah Nyata Penerima Manfaat & Transformasi Asnaf (Beneficiary Stories)
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kutipan testimoni dan dokumentasi verifikasi lapangan mustahik dari lembaga amil mitra terdaftar.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 self-start sm:self-auto shrink-0">
              {filteredStories.length} Kisah Terverifikasi
            </span>
          </div>

          {/* Filter Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> Lembaga:
            </span>
            <button
              onClick={() => setSelectedInstitutionFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedInstitutionFilter === 'ALL'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Semua Mitra
            </button>
            <button
              onClick={() => setSelectedInstitutionFilter('BAZNAS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedInstitutionFilter === 'BAZNAS'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              BAZNAS RI
            </button>
            <button
              onClick={() => setSelectedInstitutionFilter('DOMPET_DHUAFA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedInstitutionFilter === 'DOMPET_DHUAFA'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Dompet Dhuafa
            </button>
            <button
              onClick={() => setSelectedInstitutionFilter('RUMAH_ZAKAT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedInstitutionFilter === 'RUMAH_ZAKAT'
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Rumah Zakat
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Program:</span>
            {[
              { id: 'ALL', label: 'Semua Bidang' },
              { id: 'umkm', label: 'Ekonomi UMKM' },
              { id: 'health', label: 'Kesehatan' },
              { id: 'education', label: 'Pendidikan' },
              { id: 'food', label: 'Pangan' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedCategoryFilter === cat.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Beneficiary Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => {
            const userRecord = getLinkedUserRecord(story);

            return (
              <div
                key={story.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 hover:border-teal-500/50 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Category badge & Institution */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${getCategoryBadgeClass(
                        story.programCategory
                      )}`}
                    >
                      {getCategoryIcon(story.programCategory)}
                      <span>{story.programTitle}</span>
                    </span>

                    <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      Asnaf: {story.asnafCategory}
                    </span>
                  </div>

                  {/* Beneficiary Profile & Location */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {story.beneficiaryName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {story.beneficiaryName} ({story.age} thn)
                      </h5>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                        {story.role}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                        {story.location}
                      </span>
                    </div>
                  </div>

                  {/* Direct Testimonial Quote */}
                  <div className="relative p-3 rounded-xl bg-teal-500/5 border border-teal-500/15 text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    <Quote className="w-4 h-4 text-teal-400/40 absolute -top-1.5 left-2 bg-slate-950/80 px-0.5" />
                    "{story.quote}"
                  </div>

                  {/* Concrete Quantified Metric Box */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/60 text-xs space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{story.metrics.label}:</span>
                      <span className="font-bold text-emerald-400">{story.metrics.growthHighlight}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-500 line-through text-[11px]">{story.metrics.before}</span>
                      <ArrowRight className="w-3 h-3 text-teal-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {story.metrics.after}
                      </span>
                    </div>
                  </div>

                  {/* Active Link to User's Disbursed Record (If matching) */}
                  {userRecord && (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <CheckCircle2 className="w-3 h-3 shrink-0 text-emerald-400" />
                        <span className="truncate">
                          Didanai dari penyaluran Anda: {userRecord.receiptNumber}
                        </span>
                      </div>
                      <span className="font-bold font-mono shrink-0">
                        {formatIDR(userRecord.amountIDR)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions: Detail Modal & Copy Quote */}
                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-slate-400 truncate">
                    Via: {story.institutionName.split(' ')[0]}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyQuote(story)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition-all"
                      title="Salin Kutipan Testimoni"
                    >
                      {copiedStoryId === story.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setActiveStoryModal(story)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span>Lihat Kisah</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

        {/* Bottom Callout: Transparency & Sharia Audit */}
        <div className="p-4 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-slate-900/50 to-emerald-500/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 block">
                Protokol Transparansi & Akuntabilitas Mustahik FinanceCity
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Seluruh data penerima manfaat diverifikasi langsung oleh tim surveyor lapangan lembaga amil zakat terakreditasi Kemenag RI, dilengkapi koordinat GPS dan Berita Acara Serah Terima (BAST). Setiap penyaluran zakat Anda menghasilkan nomor BSZ legal yang valid sebagai pengurang pajak tahunan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onOpenReport && (
              <button
                onClick={onOpenReport}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition-all text-xs"
              >
                Lihat Laporan Bulanan (PDF)
              </button>
            )}

            {onOpenDisburse && (
              <button
                onClick={() => onOpenDisburse()}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all shadow-xs text-xs flex items-center gap-1.5"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Salurkan Zakat Lagi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Story Modal */}
      {activeStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveStoryModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${getCategoryBadgeClass(
                    activeStoryModal.programCategory
                  )}`}
                >
                  {getCategoryIcon(activeStoryModal.programCategory)}
                  <span>{activeStoryModal.programTitle}</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Asnaf: {activeStoryModal.asnafCategory}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 pt-1">
                Kisah {activeStoryModal.beneficiaryName} ({activeStoryModal.age} thn)
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>{activeStoryModal.location}</span>
                <span>•</span>
                <span>Lembaga: {activeStoryModal.institutionName}</span>
              </p>
            </div>

            {/* Quote Callout */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs italic text-teal-300 leading-relaxed">
              "{activeStoryModal.quote}"
            </div>

            {/* Full Narrative */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <h5 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                Narasi Transformasi Lapangan:
              </h5>
              <p>{activeStoryModal.fullNarrative}</p>
            </div>

            {/* Quantified Outcome Card */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Dampak Nyata Terukur (Outcome):
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Kondisi Sebelum Zakat:</span>
                  <span className="font-bold text-slate-300 text-xs">{activeStoryModal.metrics.before}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Kondisi Setelah Didanai:</span>
                  <span className="font-bold text-emerald-400 text-xs">{activeStoryModal.metrics.after}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Pencapaian:</span>
                <span className="font-extrabold text-emerald-300 font-mono">
                  {activeStoryModal.metrics.growthHighlight}
                </span>
              </div>
            </div>

            {/* Surveyor Verification & SDG Tags */}
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  Catatan Surveyor Amil: <em>{activeStoryModal.surveyorNote}</em>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Tanggal Verifikasi Lapangan: {activeStoryModal.surveyDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Target Pembangunan Berkelanjutan: {activeStoryModal.sdgGoal}</span>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopyQuote(activeStoryModal)}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-300"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin Kisah Inspiratif</span>
              </button>

              <button
                onClick={() => setActiveStoryModal(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annual Zakat & Social Impact PDF Download Modal */}
      <ZakatAnnualImpactPdfModal
        isOpen={isAnnualPdfModalOpen}
        onClose={() => setIsAnnualPdfModalOpen(false)}
        disbursedRecords={disbursedRecords}
        programDistributions={programDistributions}
        annualImpactGoal={annualImpactGoal}
        annualTargetIDR={annualTargetIDR}
        remainingReserveIDR={remainingReserveIDR}
        theme={theme}
        language={language}
      />

      {/* Social Media Milestone Share Modal (Twitter, LinkedIn, WhatsApp) */}
      <ZakatSocialShareModal
        isOpen={isSocialShareModalOpen}
        onClose={() => setIsSocialShareModalOpen(false)}
        disbursedRecords={disbursedRecords}
        annualImpactGoal={annualImpactGoal}
        annualTargetIDR={annualTargetIDR}
        remainingReserveIDR={remainingReserveIDR}
        theme={theme}
        language={language}
      />
    </div>
  );
};
