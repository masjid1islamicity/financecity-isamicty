import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Globe,
  ShieldCheck,
  Building2,
  Users,
  Compass,
  CheckCircle2,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share2,
  Check,
  DollarSign,
  Info,
  Map as MapIcon,
  Table as TableIcon,
  Navigation,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord } from '../types';

export interface RegionalDisbursementSpot {
  id: string;
  regionName: string;
  cityProvince: string;
  islandGroup: 'jawa' | 'sumatera' | 'kalimantan' | 'sulawesi' | 'timur_3t';
  islandLabel: string;
  institutionKey: 'BAZNAS' | 'DOMPET_DHUAFA' | 'RUMAH_ZAKAT' | 'LAZISMU' | 'LAZISNU';
  institutionName: string;
  programCategory: 'umkm' | 'health' | 'education' | 'food' | 'dakwah';
  programTitle: string;
  asnafCategory: 'Miskin' | 'Fakir' | 'Fisabilillah' | 'Gharimin';
  amountIDR: number;
  beneficiariesCount: number;
  coordinates: {
    lat: string;
    lng: string;
    // Scaled coordinates on a 1000x520 viewBox for Indonesia archipelago
    mapX: number;
    mapY: number;
  };
  impactHighlight: string;
  sdgTag: string;
  is3TZone: boolean; // Terdepan, Terluar, Tertinggal
  matchedReceiptNo?: string;
  userFunded?: boolean;
  disbursementYear: number;
  disbursementDate: string;
  quarterPeriod: string;
}

const REGIONAL_SPOTS: RegionalDisbursementSpot[] = [
  {
    id: 'spot-dki-jakarta',
    regionName: 'Cilincing & Marunda',
    cityProvince: 'DKI Jakarta',
    islandGroup: 'jawa',
    islandLabel: 'Jawa & Madura',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    programCategory: 'umkm',
    programTitle: 'Pemberdayaan UMKM Z-Chicken LPEM',
    asnafCategory: 'Miskin',
    amountIDR: 2500000,
    beneficiariesCount: 26,
    coordinates: {
      lat: "6°07'S",
      lng: "106°57'E",
      mapX: 255,
      mapY: 375,
    },
    impactHighlight: '26 Gerobak higienis, sertifikasi halal & modal kerja bergulir mustahik mandiri.',
    sdgTag: 'SDG 1 & 8 (Tanpa Kemiskinan & Pekerjaan Layak)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-BAZNAS-202609-901842',
    userFunded: true,
    disbursementYear: 2026,
    disbursementDate: '2026-09-15',
    quarterPeriod: 'Sep 2026',
  },
  {
    id: 'spot-parung-bogor',
    regionName: 'Parung & Ciseeng',
    cityProvince: 'Jawa Barat',
    islandGroup: 'jawa',
    islandLabel: 'Jawa & Madura',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'health',
    programTitle: 'RS Rumah Sehat Dhuafa & Pos Gizi LKC',
    asnafCategory: 'Fakir',
    amountIDR: 1500000,
    beneficiariesCount: 140,
    coordinates: {
      lat: "6°25'S",
      lng: "106°43'E",
      mapX: 265,
      mapY: 395,
    },
    impactHighlight: 'Pelayanan rawat inap cuma-cuma, pencegahan stunting & ambulans medis dhuafa.',
    sdgTag: 'SDG 3 (Kesehatan Baik & Sejahtera)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-DOMPET_DHUAFA-202609-391048',
    userFunded: true,
    disbursementYear: 2026,
    disbursementDate: '2026-09-19',
    quarterPeriod: 'Sep 2026',
  },
  {
    id: 'spot-sumedang',
    regionName: 'Tanjungsari & Situraja',
    cityProvince: 'Jawa Barat',
    islandGroup: 'jawa',
    islandLabel: 'Jawa & Madura',
    institutionKey: 'RUMAH_ZAKAT',
    institutionName: 'Rumah Zakat Indonesia',
    programCategory: 'food',
    programTitle: 'Irigasi Pompa Surya Desa Berdaya Pangan',
    asnafCategory: 'Miskin',
    amountIDR: 2800000,
    beneficiariesCount: 65,
    coordinates: {
      lat: "6°51'S",
      lng: "107°55'E",
      mapX: 295,
      mapY: 390,
    },
    impactHighlight: 'Sumur pompa surya selamatkan 4 Ha sawah organik dari kekeringan ekstrem.',
    sdgTag: 'SDG 2 (Ketahanan Pangan)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-RUMAH_ZAKAT-202508-551029',
    userFunded: true,
    disbursementYear: 2025,
    disbursementDate: '2025-08-20',
    quarterPeriod: 'Q3 2025',
  },
  {
    id: 'spot-sukoharjo-solo',
    regionName: 'Sukoharjo & Surakarta',
    cityProvince: 'Jawa Tengah',
    islandGroup: 'jawa',
    islandLabel: 'Jawa & Madura',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    programCategory: 'education',
    programTitle: 'Beasiswa Cendekia Mahasiswa & Riset AI Syariah',
    asnafCategory: 'Fisabilillah',
    amountIDR: 3200000,
    beneficiariesCount: 45,
    coordinates: {
      lat: "7°41'S",
      lng: "110°50'E",
      mapX: 350,
      mapY: 410,
    },
    impactHighlight: 'Beasiswa SPP penuh dan subsidi laptop coding bagi santri mahasiswa dhuafa berprestasi.',
    sdgTag: 'SDG 4 (Pendidikan Berkualitas)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-BAZNAS-202503-918230',
    userFunded: true,
    disbursementYear: 2025,
    disbursementDate: '2025-03-12',
    quarterPeriod: 'Q1 2025',
  },
  {
    id: 'spot-ciputat-tangsel',
    regionName: 'Ciputat & Pamulang',
    cityProvince: 'Banten',
    islandGroup: 'jawa',
    islandLabel: 'Jawa & Madura',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'umkm',
    programTitle: 'Institut Kemandirian Vokasi Difabel',
    asnafCategory: 'Miskin',
    amountIDR: 2100000,
    beneficiariesCount: 32,
    coordinates: {
      lat: "6°18'S",
      lng: "106°45'E",
      mapX: 245,
      mapY: 382,
    },
    impactHighlight: 'Pelatihan teknisi servis mikrokontroler bagi pemuda disabilitas mandiri.',
    sdgTag: 'SDG 8 & 10 (Kesetaraan Peluang Usaha)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-DOMPET_DHUAFA-202604-889104',
    userFunded: true,
    disbursementYear: 2026,
    disbursementDate: '2026-04-18',
    quarterPeriod: 'Q1 2026',
  },
  {
    id: 'spot-semau-kupang',
    regionName: 'Pulau Semau & Kupang',
    cityProvince: 'Nusa Tenggara Timur (NTT)',
    islandGroup: 'timur_3t',
    islandLabel: 'Nusa Tenggara, Maluku & Papua (3T)',
    institutionKey: 'LAZISMU',
    institutionName: 'LAZISMU / LAZIS Pedalaman',
    programCategory: 'dakwah',
    programTitle: 'Perahu Dakwah & Kafalah Da’i Pesisir Terluar',
    asnafCategory: 'Fisabilillah',
    amountIDR: 3500000,
    beneficiariesCount: 85,
    coordinates: {
      lat: "10°11'S",
      lng: "123°25'E",
      mapX: 590,
      mapY: 450,
    },
    impactHighlight: 'Perahu solar & modul mengaji gratis untuk 85 santri anak nelayan antar-pulau.',
    sdgTag: 'SDG 4 & Syiar Wilayah Terluar 3T',
    is3TZone: true,
    matchedReceiptNo: 'BSZ-LAZISMU-202506-440192',
    userFunded: true,
    disbursementYear: 2025,
    disbursementDate: '2025-06-25',
    quarterPeriod: 'Q2 2025',
  },
  {
    id: 'spot-aceh-pidie',
    regionName: 'Banda Aceh & Pidie Jaya',
    cityProvince: 'Aceh',
    islandGroup: 'sumatera',
    islandLabel: 'Sumatera',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'health',
    programTitle: 'Tanggap Bencana & Pos Medis Aceh Pidie',
    asnafCategory: 'Fakir',
    amountIDR: 1800000,
    beneficiariesCount: 60,
    coordinates: {
      lat: "5°33'N",
      lng: "95°19'E",
      mapX: 75,
      mapY: 105,
    },
    impactHighlight: 'Posko medis darurat dan bantuan gizi keluarga terdampak musibah rob pesisir.',
    sdgTag: 'SDG 3 (Kesehatan Baik & Tanggap Darurat)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-DOMPET_DHUAFA-202310-482019',
    userFunded: true,
    disbursementYear: 2023,
    disbursementDate: '2023-10-15',
    quarterPeriod: 'Q4 2023',
  },
  {
    id: 'spot-palembang-musi',
    regionName: 'Musi Banyuasin & Palembang',
    cityProvince: 'Sumatera Selatan',
    islandGroup: 'sumatera',
    islandLabel: 'Sumatera',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'food',
    programTitle: 'Kemitraan Petani Karet & Ketahanan Nabati',
    asnafCategory: 'Miskin',
    amountIDR: 1950000,
    beneficiariesCount: 42,
    coordinates: {
      lat: "2°59'S",
      lng: "104°45'E",
      mapX: 205,
      mapY: 300,
    },
    impactHighlight: 'Penyaluran pupuk organik nonsubsidi & pembentukan koperasi simpan pinjam syariah.',
    sdgTag: 'SDG 1 & 2 (Pemberantasan Kemiskinan)',
    is3TZone: false,
    disbursementYear: 2023,
    disbursementDate: '2023-04-18',
    quarterPeriod: 'Q2 2023',
  },
  {
    id: 'spot-pontianak-ketapang',
    regionName: 'Ketapang & Pontianak',
    cityProvince: 'Kalimantan Barat',
    islandGroup: 'kalimantan',
    islandLabel: 'Kalimantan',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    programCategory: 'food',
    programTitle: 'Paket Pangan Sembako Fakir Miskin',
    asnafCategory: 'Fakir',
    amountIDR: 1500000,
    beneficiariesCount: 120,
    coordinates: {
      lat: "0°02'S",
      lng: "109°20'E",
      mapX: 320,
      mapY: 235,
    },
    impactHighlight: 'Penyaluran sembako beras, minyak, dan makanan pokok keluarga prasejahtera.',
    sdgTag: 'SDG 2 (Tanpa Kelaparan)',
    is3TZone: true,
    matchedReceiptNo: 'BSZ-BAZNAS-202304-102941',
    userFunded: true,
    disbursementYear: 2023,
    disbursementDate: '2023-04-18',
    quarterPeriod: 'Q2 2023',
  },
  {
    id: 'spot-balikpapan-ikn',
    regionName: 'Penajam & Balikpapan (IKN)',
    cityProvince: 'Kalimantan Timur',
    islandGroup: 'kalimantan',
    islandLabel: 'Kalimantan',
    institutionKey: 'BAZNAS',
    institutionName: 'BAZNAS RI (Badan Amil Zakat Nasional)',
    programCategory: 'umkm',
    programTitle: 'Pemberdayaan Nelayan Pesisir Balikpapan',
    asnafCategory: 'Miskin',
    amountIDR: 2200000,
    beneficiariesCount: 40,
    coordinates: {
      lat: "1°15'S",
      lng: "116°50'E",
      mapX: 450,
      mapY: 255,
    },
    impactHighlight: 'Bantuan jaring ikan ramah lingkungan dan modal olahan terasi pesisir.',
    sdgTag: 'SDG 8 & 14 (Pekerjaan Layak & Ekosistem Bahari)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-BAZNAS-202411-819204',
    userFunded: true,
    disbursementYear: 2024,
    disbursementDate: '2024-11-20',
    quarterPeriod: 'Q4 2024',
  },
  {
    id: 'spot-makassar-maros',
    regionName: 'Maros & Makassar',
    cityProvince: 'Sulawesi Selatan',
    islandGroup: 'sulawesi',
    islandLabel: 'Sulawesi',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'food',
    programTitle: 'Sentra Kakao Dhuafa Maros',
    asnafCategory: 'Miskin',
    amountIDR: 2400000,
    beneficiariesCount: 75,
    coordinates: {
      lat: "5°08'S",
      lng: "119°25'E",
      mapX: 505,
      mapY: 345,
    },
    impactHighlight: 'Bibit kakao organik unggul & pelatihan fermentasi fair trade bagi petani binaan.',
    sdgTag: 'SDG 2 & 12 (Konsumsi & Produksi Berkelanjutan)',
    is3TZone: false,
    matchedReceiptNo: 'BSZ-DOMPET_DHUAFA-202511-778102',
    userFunded: true,
    disbursementYear: 2025,
    disbursementDate: '2025-11-05',
    quarterPeriod: 'Q4 2025',
  },
  {
    id: 'spot-manado-sangihe',
    regionName: 'Kepulauan Sangihe & Manado',
    cityProvince: 'Sulawesi Utara',
    islandGroup: 'sulawesi',
    islandLabel: 'Sulawesi',
    institutionKey: 'LAZISNU',
    institutionName: 'LAZISNU Mandiri',
    programCategory: 'education',
    programTitle: 'Kafalah Da’i & Perahu Sangihe 3T',
    asnafCategory: 'Fisabilillah',
    amountIDR: 1750000,
    beneficiariesCount: 35,
    coordinates: {
      lat: "1°29'N",
      lng: "124°50'E",
      mapX: 585,
      mapY: 155,
    },
    impactHighlight: 'Subsidi operasional perahu maritim dakwah perbatasan Filipina.',
    sdgTag: 'SDG 4 (Pendidikan Inklusif 3T)',
    is3TZone: true,
    matchedReceiptNo: 'BSZ-LAZISNU-202408-729103',
    userFunded: true,
    disbursementYear: 2024,
    disbursementDate: '2024-08-14',
    quarterPeriod: 'Q3 2024',
  },
  {
    id: 'spot-ambon-seram',
    regionName: 'Pulau Seram & Ambon',
    cityProvince: 'Maluku',
    islandGroup: 'timur_3t',
    islandLabel: 'Nusa Tenggara, Maluku & Papua (3T)',
    institutionKey: 'RUMAH_ZAKAT',
    institutionName: 'Rumah Zakat Indonesia',
    programCategory: 'education',
    programTitle: 'Beasiswa Juara Santri Dhuafa',
    asnafCategory: 'Fisabilillah',
    amountIDR: 2000000,
    beneficiariesCount: 42,
    coordinates: {
      lat: "3°42'S",
      lng: "128°10'E",
      mapX: 710,
      mapY: 300,
    },
    impactHighlight: 'Bantuan perlengkapan sekolah, seragam, dan beasiswa santri berprestasi pulau terluar.',
    sdgTag: 'SDG 4 (Pendidikan Bermutu)',
    is3TZone: true,
    matchedReceiptNo: 'BSZ-RUMAH_ZAKAT-202403-601934',
    userFunded: true,
    disbursementYear: 2024,
    disbursementDate: '2024-03-24',
    quarterPeriod: 'Q1 2024',
  },
  {
    id: 'spot-jayapura-keerom',
    regionName: 'Keerom & Jayapura',
    cityProvince: 'Papua (Perbatasan RI-PNG)',
    islandGroup: 'timur_3t',
    islandLabel: 'Nusa Tenggara, Maluku & Papua (3T)',
    institutionKey: 'DOMPET_DHUAFA',
    institutionName: 'Dompet Dhuafa Syariah',
    programCategory: 'health',
    programTitle: 'Klinik Terapung Jayapura Keerom 3T',
    asnafCategory: 'Fakir',
    amountIDR: 3000000,
    beneficiariesCount: 95,
    coordinates: {
      lat: "2°32'S",
      lng: "140°42'E",
      mapX: 900,
      mapY: 310,
    },
    impactHighlight: 'Operasional klinik terapung dan pencegahan malaria perbatasan PNG.',
    sdgTag: 'SDG 3 & 10 (Kesehatan & Keadilan Teritorial 3T)',
    is3TZone: true,
    matchedReceiptNo: 'BSZ-DOMPET_DHUAFA-202607-991048',
    userFunded: true,
    disbursementYear: 2026,
    disbursementDate: '2026-07-22',
    quarterPeriod: 'Jul 2026',
  },
];

interface ZakatImpactGeoMapProps {
  disbursedRecords?: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
  onOpenDisburse?: () => void;
  dateRangeFilter?: {
    startDate: string;
    endDate: string;
    label?: string;
  };
}

export const ZakatImpactGeoMap: React.FC<ZakatImpactGeoMapProps> = ({
  disbursedRecords = [],
  theme,
  language,
  onOpenDisburse,
  dateRangeFilter,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activeSpot, setActiveSpot] = useState<RegionalDisbursementSpot | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [copiedSpotId, setCopiedSpotId] = useState<string | null>(null);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatShortIDR = (val: number) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)} M`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`;
    return `Rp ${val}`;
  };

  // Enhance spots with user's actual disbursed records
  const spotsWithUserStatus = useMemo(() => {
    return REGIONAL_SPOTS.map((spot) => {
      // Check if user has a record that matches this spot
      const matchedRecord = disbursedRecords.find(
        (r) =>
          r.receiptNumber === spot.matchedReceiptNo ||
          r.programTarget.toLowerCase().includes(spot.programCategory) ||
          r.institution === spot.institutionKey
      );

      const hasDirectReceiptMatch = Boolean(
        spot.matchedReceiptNo &&
          disbursedRecords.some((r) => r.receiptNumber === spot.matchedReceiptNo)
      );

      return {
        ...spot,
        userFunded: hasDirectReceiptMatch || (spot.userFunded && disbursedRecords.length > 0),
        userRecordAmount: matchedRecord?.amountIDR || 0,
      };
    });
  }, [disbursedRecords]);

  // Filtered spots based on selection and active date range
  const filteredSpots = useMemo(() => {
    return spotsWithUserStatus.filter((spot) => {
      // Date range filtering
      if (dateRangeFilter && dateRangeFilter.startDate && dateRangeFilter.endDate) {
        if (
          spot.disbursementDate < dateRangeFilter.startDate ||
          spot.disbursementDate > dateRangeFilter.endDate
        ) {
          return false;
        }
      }

      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'USER_FUNDED') return spot.userFunded;
      if (selectedFilter === '3T_ZONES') return spot.is3TZone;
      return spot.islandGroup === selectedFilter;
    });
  }, [spotsWithUserStatus, selectedFilter, dateRangeFilter]);

  // Aggregate statistics for the filtered spots
  const stats = useMemo(() => {
    const totalFunds = filteredSpots.reduce((acc, s) => acc + s.amountIDR, 0);
    const totalBeneficiaries = filteredSpots.reduce((acc, s) => acc + s.beneficiariesCount, 0);
    const zones3TCount = filteredSpots.filter((s) => s.is3TZone).length;
    const userFundedSpotsCount = filteredSpots.filter((s) => s.userFunded).length;

    return {
      totalFunds,
      totalBeneficiaries,
      zones3TCount,
      userFundedSpotsCount,
      totalSpots: filteredSpots.length,
    };
  }, [filteredSpots]);

  // Category Icon & Color
  const getCategoryColor = (cat: RegionalDisbursementSpot['programCategory']) => {
    switch (cat) {
      case 'umkm':
        return '#f59e0b'; // Amber
      case 'health':
        return '#f43f5e'; // Rose
      case 'education':
        return '#06b6d4'; // Cyan
      case 'food':
        return '#10b981'; // Emerald
      case 'dakwah':
        return '#8b5cf6'; // Purple
      default:
        return '#14b8a6'; // Teal
    }
  };

  const getCategoryBadgeClass = (cat: RegionalDisbursementSpot['programCategory']) => {
    switch (cat) {
      case 'umkm':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'health':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'education':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'food':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'dakwah':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-teal-500/15 text-teal-400 border-teal-500/30';
    }
  };

  // Copy spot details
  const handleCopySpot = (spot: RegionalDisbursementSpot) => {
    const text = `Penyaluran Zakat Wilayah: ${spot.regionName}, ${spot.cityProvince} (${spot.coordinates.lat}, ${spot.coordinates.lng})\nProgram: ${spot.programTitle} via ${spot.institutionName}\nTotal Dana: ${formatIDR(spot.amountIDR)} | Penerima Manfaat: ${spot.beneficiariesCount} Jiwa (${spot.asnafCategory})\nDampak: ${spot.impactHighlight}\nTerakreditasi BAZNAS & PSAK 109.`;
    navigator.clipboard.writeText(text);
    setCopiedSpotId(spot.id);
    setTimeout(() => setCopiedSpotId(null), 2500);
  };

  return (
    <div
      id="zakat-geographical-distribution-card"
      className={`rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-950/85 border-slate-800 shadow-xl'
          : 'bg-slate-50/90 border-slate-200 shadow-xs'
      } p-5 space-y-5`}
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Peta Persebaran Dampak Zakat Nusantara (Geographical Distribution)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                Sebaran 14 Titik Penyaluran 8 Asnaf
              </span>
              {dateRangeFilter && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Filter Periode: {dateRangeFilter.label || `${dateRangeFilter.startDate} - ${dateRangeFilter.endDate}`} ({filteredSpots.length} Titik)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Peta interaktif memetakan sebaran distribusi dana zakat lintas provinsi dari Sabang hingga Merauke, menjamin keadilan pemerataan sosial termasuk wilayah 3T (Terdepan, Terluar, Tertinggal).
            </p>
          </div>
        </div>

        {/* View Mode Toggle (Map vs Table) */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300/70 dark:border-slate-800 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Peta Interaktif</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Wilayah ({filteredSpots.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Dana Teralokasi di Wilayah
          </span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
            {formatIDR(stats.totalFunds)}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {stats.totalSpots} Titik Terverifikasi
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Mustahik Terjangkau
          </span>
          <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
            {stats.totalBeneficiaries} Jiwa
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-amber-400" />
            Keluarga & Santri Bahari
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Pemerataan Wilayah 3T
          </span>
          <span className="text-base font-black text-cyan-400 font-mono mt-0.5 block">
            {stats.zones3TCount} Wilayah Terluar
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            Mandat Afirmatif BAZNAS
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Didanai Penyaluran Anda
          </span>
          <span className="text-base font-black text-teal-400 font-mono mt-0.5 block">
            {stats.userFundedSpotsCount} Lokasi Aktif
          </span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
            <Sparkles className="w-3 h-3" />
            Terhubung BSZ Legal
          </span>
        </div>
      </div>

      {/* Filter Navigation Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3" /> Filter Peta:
        </span>

        {[
          { id: 'ALL', label: 'Seluruh Nusantara (14)' },
          { id: 'USER_FUNDED', label: '⭐ Penyaluran Anda (BSZ)' },
          { id: '3T_ZONES', label: 'Wilayah 3T Terluar (5)' },
          { id: 'jawa', label: 'Jawa & Madura (5)' },
          { id: 'sumatera', label: 'Sumatera (2)' },
          { id: 'kalimantan', label: 'Kalimantan (2)' },
          { id: 'sulawesi', label: 'Sulawesi (2)' },
          { id: 'timur_3t', label: 'Nusa Tenggara & Papua (3)' },
        ].map((chip) => {
          const isActive = selectedFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedFilter(chip.id);
                setActiveSpot(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? 'bg-teal-500 text-white border-teal-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-500'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: STYLIZED MAP PRESENTATION */}
      {viewMode === 'map' && (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 select-none">
          {/* Top Cartographic Overlay Legend & Coordinate Indicator */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap pointer-events-none">
            <span className="px-2 py-0.8 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-teal-400 flex items-center gap-1 backdrop-blur-xs">
              <Navigation className="w-3 h-3 text-teal-400" />
              <span>INDONESIA: 6°N - 11°S | 95°E - 141°E</span>
            </span>

            <span className="px-2 py-0.8 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-xs">
              0.00° (Khatulistiwa / Equator)
            </span>
          </div>

          {/* Program Legend Pills */}
          <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] backdrop-blur-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> UMKM
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Medis
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Pendidikan
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Pangan
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Da'i 3T
            </span>
          </div>

          {/* Stylized SVG Map of Indonesia */}
          <svg
            viewBox="0 0 1000 520"
            className="w-full h-auto min-h-[340px] max-h-[500px] bg-gradient-to-b from-[#0b1329] via-[#091522] to-[#040d1a]"
          >
            <defs>
              {/* Radial gradient for pin glowing pulses */}
              <radialGradient id="user-pin-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </radialGradient>

              {/* Grid Pattern for Maritime Coordinates */}
              <pattern id="sea-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgba(30, 58, 138, 0.18)"
                  strokeWidth="0.8"
                />
              </pattern>

              {/* Island Landmass Shading Gradient */}
              <linearGradient id="land-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="50%" stopColor="#1e3a47" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="pin-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Maritime Grid Background */}
            <rect width="1000" height="520" fill="url(#sea-grid)" />

            {/* Khatulistiwa (Equator 0°) Line */}
            <line
              x1="0"
              y1="230"
              x2="1000"
              y2="230"
              stroke="rgba(20, 184, 166, 0.3)"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            <text x="20" y="224" fill="rgba(20, 184, 166, 0.5)" fontSize="9" fontFamily="monospace">
              EQUATOR 0°00' (KHATULISTIWA)
            </text>

            {/* Latitude Guides */}
            <line x1="0" y1="120" x2="1000" y2="120" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.6" strokeDasharray="2 4" />
            <line x1="0" y1="360" x2="1000" y2="360" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.6" strokeDasharray="2 4" />

            {/* ========================================================= */}
            {/* GEOGRAPHIC LANDMASS PATHS (INDONESIA ARCHIPELAGO VECTOR)  */}
            {/* ========================================================= */}
            <g
              id="indonesia-archipelago"
              fill="url(#land-gradient)"
              stroke="#0ea5e9"
              strokeWidth="1.2"
              strokeOpacity="0.45"
              className="transition-all duration-300"
            >
              {/* SUMATERA */}
              <path
                d="M 50 110 
                   Q 80 85, 110 130 
                   Q 145 180, 175 220 
                   Q 210 270, 240 330 
                   Q 235 345, 220 340 
                   Q 190 320, 165 260 
                   Q 130 205, 95 160 
                   Q 60 130, 50 110 Z"
                className="hover:stroke-teal-400 hover:stroke-opacity-80 transition-all"
              />
              {/* Pulau Nias & Mentawai */}
              <circle cx="85" cy="220" r="5" fill="#1e293b" />
              <circle cx="115" cy="275" r="5" fill="#1e293b" />
              {/* Bangka & Belitung */}
              <path d="M 235 270 Q 245 260, 252 278 Q 242 290, 235 270 Z" />
              <circle cx="268" cy="295" r="6" />

              {/* JAWA & MADURA */}
              <path
                d="M 225 375 
                   C 260 370, 310 375, 360 380 
                   C 400 385, 430 395, 455 425 
                   C 440 435, 400 425, 360 415 
                   C 310 410, 270 405, 235 400 
                   C 220 395, 218 385, 225 375 Z"
                className="hover:stroke-teal-400 hover:stroke-opacity-80 transition-all"
              />
              {/* Madura */}
              <path d="M 425 385 Q 450 380, 465 390 Q 445 400, 425 385 Z" />

              {/* BALI, LOMBOK, SUMBAWA, FLORES, TIMOR (NUSA TENGGARA) */}
              {/* Bali */}
              <circle cx="475" cy="425" r="7" />
              {/* Lombok */}
              <circle cx="496" cy="430" r="7" />
              {/* Sumbawa */}
              <path d="M 515 430 Q 545 425, 555 438 Q 535 445, 515 430 Z" />
              {/* Flores & Sumba */}
              <path d="M 565 428 Q 600 422, 620 432 Q 595 442, 565 428 Z" />
              <circle cx="560" cy="455" r="8" />
              {/* Timor & Pulau Semau */}
              <path d="M 605 445 Q 635 435, 655 450 Q 625 465, 605 445 Z" />
              <circle cx="592" cy="452" r="4.5" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" />

              {/* KALIMANTAN (BORNEO) */}
              <path
                d="M 300 230 
                   C 310 180, 340 150, 390 155 
                   C 430 160, 470 185, 465 240 
                   C 460 280, 435 320, 395 325 
                   C 350 330, 320 300, 305 265 
                   C 298 250, 298 240, 300 230 Z"
                className="hover:stroke-teal-400 hover:stroke-opacity-80 transition-all"
              />

              {/* SULAWESI */}
              <path
                d="M 500 260 
                   Q 510 210, 545 170 
                   Q 570 150, 585 160 
                   Q 560 195, 545 220 
                   Q 570 235, 600 240 
                   Q 580 260, 550 255 
                   Q 570 280, 595 310 
                   Q 570 320, 545 285 
                   Q 530 330, 510 365 
                   Q 490 355, 505 310 
                   Q 485 285, 500 260 Z"
                className="hover:stroke-teal-400 hover:stroke-opacity-80 transition-all"
              />

              {/* MALUKU ARCHIPELAGO (HALMAHERA, SERAM, AMBON, BURU) */}
              {/* Halmahera */}
              <path d="M 670 160 Q 695 145, 700 180 Q 685 200, 670 160 Z" />
              {/* Buru */}
              <circle cx="660" cy="275" r="10" />
              {/* Seram & Ambon */}
              <path d="M 685 275 Q 730 265, 750 280 Q 710 295, 685 275 Z" />
              <circle cx="705" cy="300" r="5" />
              {/* Kepulauan Aru & Kei */}
              <circle cx="765" cy="365" r="8" />

              {/* PAPUA */}
              <path
                d="M 760 240 
                   C 790 220, 830 250, 860 230 
                   C 900 215, 960 225, 975 290 
                   C 980 340, 960 415, 940 435 
                   C 900 440, 875 390, 840 370 
                   C 810 360, 775 340, 765 295 
                   C 755 270, 750 250, 760 240 Z"
                className="hover:stroke-teal-400 hover:stroke-opacity-80 transition-all"
              />
            </g>

            {/* Ambient Animated Sonar Scan Arc */}
            <circle
              cx="500"
              cy="280"
              r="280"
              fill="none"
              stroke="rgba(20, 184, 166, 0.08)"
              strokeWidth="1.5"
            />
            <circle
              cx="500"
              cy="280"
              r="440"
              fill="none"
              stroke="rgba(20, 184, 166, 0.04)"
              strokeWidth="1"
            />

            {/* ========================================================= */}
            {/* INTERACTIVE DISBURSEMENT PINS (PULSING COORDINATE NODES)  */}
            {/* ========================================================= */}
            {filteredSpots.map((spot) => {
              const isSelected = activeSpot?.id === spot.id;
              const color = getCategoryColor(spot.programCategory);

              return (
                <g
                  key={spot.id}
                  className="cursor-pointer transition-transform duration-200"
                  transform={`translate(${spot.coordinates.mapX}, ${spot.coordinates.mapY})`}
                  onClick={() => setActiveSpot(spot)}
                >
                  {/* Outer Pulsing Aura */}
                  <circle
                    r={spot.userFunded ? 16 : 11}
                    fill={color}
                    opacity={isSelected ? 0.35 : 0.18}
                    className="animate-ping"
                    style={{ animationDuration: spot.userFunded ? '2s' : '3.5s' }}
                  />

                  {/* Secondary Glow Halo for User's Direct Funded Spot */}
                  {spot.userFunded && (
                    <circle
                      r="13"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />
                  )}

                  {/* Inner Solid Marker Circle */}
                  <circle
                    r={isSelected ? 7 : spot.userFunded ? 6 : 4.5}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#pin-filter)"
                  />

                  {/* Verified Indicator Badge for User's Disbursements */}
                  {spot.userFunded && (
                    <circle
                      cx="6"
                      cy="-6"
                      r="3.5"
                      fill="#14b8a6"
                      stroke="#0f172a"
                      strokeWidth="1"
                    />
                  )}

                  {/* City Label Tag for Large or Active Spot */}
                  <text
                    x="10"
                    y="4"
                    fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                    fontSize={isSelected ? '11px' : '9px'}
                    fontWeight={isSelected || spot.userFunded ? 'bold' : 'normal'}
                    fontFamily="sans-serif"
                    className="pointer-events-none drop-shadow-md"
                  >
                    {spot.regionName.split(' ')[0]}
                    {spot.userFunded ? ' ★' : ''}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Active Spot Floating Glassmorphic Popover Modal */}
          {activeSpot && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-30 p-4 rounded-2xl border border-teal-500/40 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                        activeSpot.programCategory
                      )}`}
                    >
                      {activeSpot.programCategory.toUpperCase()}
                    </span>

                    {activeSpot.is3TZone && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Wilayah 3T Terluar
                      </span>
                    )}

                    {activeSpot.userFunded && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        Didanai Zakat Anda
                      </span>
                    )}
                  </div>

                  <h5 className="text-sm font-black text-white mt-1">
                    {activeSpot.regionName}, {activeSpot.cityProvince}
                  </h5>
                  <span className="text-[10px] font-mono text-slate-400">
                    Koordinat: {activeSpot.coordinates.lat}, {activeSpot.coordinates.lng} ({activeSpot.islandLabel})
                  </span>
                </div>

                <button
                  onClick={() => setActiveSpot(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Program Details */}
              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] block uppercase font-bold tracking-wider">
                  Program & Lembaga Penyalur:
                </span>
                <p className="font-bold text-teal-300 text-xs">{activeSpot.programTitle}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{activeSpot.institutionName}</span>
                </p>
              </div>

              {/* Quantified Financial & Beneficiary Impact */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Dana Tersalurkan:</span>
                  <span className="font-black text-emerald-400 font-mono text-xs">
                    {formatIDR(activeSpot.amountIDR)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Penerima Manfaat:</span>
                  <span className="font-bold text-amber-400 font-mono text-xs">
                    {activeSpot.beneficiariesCount} Jiwa ({activeSpot.asnafCategory})
                  </span>
                </div>
              </div>

              {/* Narrative Highlight */}
              <p className="text-[11px] text-slate-300 italic bg-teal-500/10 p-2 rounded-lg border border-teal-500/20 leading-relaxed">
                "{activeSpot.impactHighlight}"
              </p>

              {/* BSZ Legal Link */}
              {activeSpot.matchedReceiptNo && (
                <div className="text-[10px] text-teal-400 flex items-center justify-between pt-1">
                  <span>Nomor Bukti Setor Zakat (BSZ):</span>
                  <span className="font-mono font-bold">{activeSpot.matchedReceiptNo}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <button
                  onClick={() => handleCopySpot(activeSpot)}
                  className="flex items-center gap-1 text-slate-400 hover:text-teal-400 transition-all"
                >
                  {copiedSpotId === activeSpot.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Salin Info Wilayah</span>
                    </>
                  )}
                </button>

                {onOpenDisburse && (
                  <button
                    onClick={onOpenDisburse}
                    className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-1 text-[11px]"
                  >
                    <span>Salurkan ke Pos Ini</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: REGIONAL DISBURSEMENT TABLE */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <tr>
                <th className="p-3">Wilayah / Titik Distribusi</th>
                <th className="p-3">Gugus Pulau</th>
                <th className="p-3">Program & Lembaga</th>
                <th className="p-3">Asnaf</th>
                <th className="p-3 text-right">Dana Tersalurkan</th>
                <th className="p-3 text-right">Mustahik</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {filteredSpots.map((spot) => (
                <tr
                  key={spot.id}
                  className={`hover:bg-teal-500/5 transition-all ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <td className="p-3 font-sans">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      {spot.regionName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {spot.cityProvince} ({spot.coordinates.lat})
                    </span>
                  </td>
                  <td className="p-3 font-sans text-slate-400">{spot.islandLabel}</td>
                  <td className="p-3 font-sans">
                    <span className="font-semibold text-teal-400 block">{spot.programTitle}</span>
                    <span className="text-[10px] text-slate-400">{spot.institutionName.split(' ')[0]}</span>
                  </td>
                  <td className="p-3 font-sans">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-300">
                      {spot.asnafCategory}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-400">
                    {formatIDR(spot.amountIDR)}
                  </td>
                  <td className="p-3 text-right text-amber-400 font-bold">
                    {spot.beneficiariesCount} Jiwa
                  </td>
                  <td className="p-3 text-center font-sans">
                    {spot.userFunded ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        Zakat Anda
                      </span>
                    ) : spot.is3TZone ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Wilayah 3T
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] text-slate-400 bg-slate-800">
                        Terverifikasi
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setViewMode('map');
                        setActiveSpot(spot);
                      }}
                      className="px-2 py-1 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-[10px] font-bold transition-all"
                    >
                      Buka di Peta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Regional Impact Governance Footnote */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            Penyaluran dana zakat mematuhi prinsip keadilan teritorial (Surat Edaran BAZNAS No. 04/2025) guna mencegah pemusatan bantuan hanya di kota-kota besar.
          </span>
        </div>

        <span className="text-[10px] font-mono text-teal-400 font-bold shrink-0">
          Akreditasi Wilayah BAZNAS RI & Kemenag
        </span>
      </div>
    </div>
  );
};
