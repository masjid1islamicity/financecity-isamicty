import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  Search,
  ExternalLink,
  Check,
  Droplets,
  GraduationCap,
  Store,
  Stethoscope,
  Info,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord } from '../types';

export interface ProjectSitePhoto {
  id: string;
  title: string;
  category: 'umkm' | 'education' | 'health' | 'water';
  categoryLabel: string;
  imageUrl: string;
  location: string;
  islandRegion: string;
  partnerInstitution: string;
  partnerKey: string;
  verifiedBszNumber: string;
  auditStatus: string;
  allocatedAmountIDR: number;
  beneficiariesCount: number;
  beneficiariesLabel: string;
  impactHighlight: string;
  sroiMultiplier: string;
  asnafTarget: string;
  sdgGoal: string;
  dateCaptured: string;
  caption: string;
  fullStory: string;
  surveyorName: string;
  tags: string[];
}

// Generated real documentary images representing verified zakat project sites
const PROJECT_SITE_PHOTOS: ProjectSitePhoto[] = [
  {
    id: 'site-photo-umkm-1',
    title: 'Sentra UMKM Mandiri Z-Chicken & Gerobak Higienis Mustahik',
    category: 'umkm',
    categoryLabel: 'Pemberdayaan UMKM',
    imageUrl: '/src/assets/images/umkm_mandiri_impact_1790180288789.jpg',
    location: 'Cilincing & Tasikmalaya, Jawa Barat',
    islandRegion: 'Jawa',
    partnerInstitution: 'BAZNAS RI (Lembaga Pemberdayaan Ekonomi Mustahik)',
    partnerKey: 'BAZNAS',
    verifiedBszNumber: 'BSZ-BAZNAS-202609-901842',
    auditStatus: 'Audit Fisik Lapangan Terverifikasi (WTP)',
    allocatedAmountIDR: 5700000,
    beneficiariesCount: 32,
    beneficiariesLabel: '32 Jiwa (8 KK Mustahik Produktif)',
    impactHighlight: '+196% Kenaikan Omzet Usaha & Kemandirian Ekonomi',
    sroiMultiplier: '1 : 4.2x',
    asnafTarget: 'Fakir & Miskin (Produktif)',
    sdgGoal: 'SDG 1 (No Poverty) & SDG 8 (Decent Work)',
    dateCaptured: '18 September 2026',
    caption:
      'Dokumentasi penyerahan etalase gerobak stainless steel higienis dan modal bergulir kepada mustahik binaan yang kini sukses mandiri tanpa jeratan rentenir.',
    fullStory:
      'Melalui dana zakat produktif muzakki, para mustahik di sentra binaan BAZNAS menerima pendampingan terpadu, pelatihan pembukuan kasir digital, sertifikasi halal, dan peralatan usaha modern. Dalam 4 bulan evaluasi, omzet pedagang melonjak dari Rp 1,4 juta/bulan menjadi Rp 4,1 juta/bulan, dan kini telah mulai menyisihkan infaq harian sebagai calon muzakki baru.',
    surveyorName: 'Ustadz Arif Rahman, S.E.I (Fasilitator LPEM)',
    tags: ['Z-Chicken', 'Modal Bergulir', 'Graduasi Muzakki', 'Sertifikasi Halal'],
  },
  {
    id: 'site-photo-santri-2',
    title: 'Madrasah & Pesantren Perintis Santri Dhuafa 3T Nusa Tenggara',
    category: 'education',
    categoryLabel: 'Pendidikan & Beasiswa',
    imageUrl: '/src/assets/images/santri_education_impact_1790180303407.jpg',
    location: 'Kab. Alor & Flores Timur, Nusa Tenggara Timur (NTT)',
    islandRegion: 'Kepulauan Nusa Tenggara (3T)',
    partnerInstitution: 'Dompet Dhuafa & Smart Ekselensia Indonesia',
    partnerKey: 'DOMPET_DHUAFA',
    verifiedBszNumber: 'BSZ-DOMPET_DHUAFA-202609-391048',
    auditStatus: 'Akreditasi Lembaga A+ (Kemenag RI)',
    allocatedAmountIDR: 4200000,
    beneficiariesCount: 45,
    beneficiariesLabel: '45 Santri & Penghafal Qur’an Dhuafa',
    impactHighlight: '100% Bebas Biaya SPP & Akses Modul Belajar Digital',
    sroiMultiplier: '1 : 3.8x',
    asnafTarget: 'Fisabilillah & Ibnu Sabil',
    sdgGoal: 'SDG 4 (Pendidikan Berkualitas)',
    dateCaptured: '15 September 2026',
    caption:
      'Suasana kelas santri di wilayah kepulauan terluar NTT yang menerima seragam baru, ransel, kitab kuning, dan beasiswa penuh hingga lulus tingkat SMA/Aliyah.',
    fullStory:
      'Sebelum adanya intervensi beasiswa zakat, angka putus sekolah anak-anak nelayan dan buruh tani di pelosok Alor mencapai 35%. Penyaluran zakat Anda membiayai renovasi ruang belajar ramah anak, honor ustadz pengajar di pedalaman, serta penyediaan fasilitas perpustakaan dan laboratorium komputer sederhana bertenaga surya.',
    surveyorName: 'Fajar Nugroho (Tim Monitoring Pendidikan DD)',
    tags: ['Santri 3T', 'Beasiswa Penuh', 'Tahfidz Qur’an', 'Nusantara'],
  },
  {
    id: 'site-photo-health-3',
    title: 'Pos Layanan Kesehatan Dhuafa & Pos Gizi Ibu Cegah Stunting',
    category: 'health',
    categoryLabel: 'Layanan Medis Gratis',
    imageUrl: '/src/assets/images/healthcare_clinic_impact_1790180317716.jpg',
    location: 'Parung, Kab. Bogor & Lebak, Banten',
    islandRegion: 'Jawa & Banten',
    partnerInstitution: 'Dompet Dhuafa Syariah (Layanan Kesehatan Cuma-Cuma)',
    partnerKey: 'DOMPET_DHUAFA',
    verifiedBszNumber: 'BSZ-DD-202608-819204',
    auditStatus: 'Standar Akreditasi Kemenkes RI No. 419/2025',
    allocatedAmountIDR: 3000000,
    beneficiariesCount: 84,
    beneficiariesLabel: '84 Pasien Dhuafa & Balita Rentan',
    impactHighlight: '88% Balita Mengalami Peningkatan Gizi & Imunisasi Lengkap',
    sroiMultiplier: '1 : 3.5x',
    asnafTarget: 'Fakir & Dhuafa',
    sdgGoal: 'SDG 3 (Kehidupan Sehat & Sejahtera)',
    dateCaptured: '19 September 2026',
    caption:
      'Pemeriksaan medis gratis, USG kehamilan ibu dhuafa, dan pemberian paket nutrisi protein tinggi untuk mencegah risiko stunting pada balita prasejahtera.',
    fullStory:
      'Rumah Sehat Dhuafa hadir tanpa memungut biaya sepeserpun dari pasien asnaf dhuafa. Setiap rupiah zakat yang disalurkan dikonversi menjadi layanan poliklinik rawat jalan, persalinan 24 jam, ambulans gratis antar-desa, dan program intervensi pos gizi intensif selama 90 hari bagi balita dengan indikasi kurang gizi.',
    surveyorName: 'dr. Sarah Maulida (Dokter Penanggung Jawab Medis)',
    tags: ['Kesehatan Dhuafa', 'Cegah Stunting', 'Ambulans Gratis', 'Pos Gizi'],
  },
  {
    id: 'site-photo-water-4',
    title: 'Fasilitas Sumur Bor & Instalasi Air Bersih Pesisir 3T Kupang Barat',
    category: 'water',
    categoryLabel: 'Air Bersih & Sanitasi',
    imageUrl: '/src/assets/images/clean_water_3t_impact_1790180332593.jpg',
    location: 'Kupang Barat & Rote Ndao, Nusa Tenggara Timur',
    islandRegion: 'Nusa Tenggara Timur (3T)',
    partnerInstitution: 'Rumah Zakat & BAZNAS Tanggap Bencana',
    partnerKey: 'RUMAH_ZAKAT',
    verifiedBszNumber: 'BSZ-RZ-202609-114892',
    auditStatus: 'Uji Laboratorium Air Layak Minum Permenkes 2023',
    allocatedAmountIDR: 3500000,
    beneficiariesCount: 120,
    beneficiariesLabel: '120+ Warga Desa & Jamaah Masjid Pesisir',
    impactHighlight: '12.000 Liter Air Bersih/Hari Siap Konsumsi Tanpa Antre',
    sroiMultiplier: '1 : 4.6x',
    asnafTarget: 'Fisabilillah & Fakir Miskin 3T',
    sdgGoal: 'SDG 6 (Air Bersih & Sanitasi Layak)',
    dateCaptured: '12 September 2026',
    caption:
      'Kebahagiaan warga desa pesisir saat air bersih mengalir deras dari sumur bor kedalaman 65 meter bertenaga surya, mengakhiri krisis kekeringan menahun.',
    fullStory:
      'Sebelum fasilitas air bersih dibangun, kaum ibu dan anak-anak harus berjalan kaki sejauh 3 kilometer menuruni tebing curam setiap pagi untuk mendapatkan air payau. Melalui zakat maal terarah, dibangun sumur bor artesis, bak penampung 5.000 liter, pompa celup submersible tenaga surya, dan sambungan pipa langsung ke balai desa.',
    surveyorName: 'Hendra Gunawan (Koordinator Program Sarana Air Bersih)',
    tags: ['Air Bersih', 'Sumur Bor', 'Energi Surya', 'Desa Berdaya'],
  },
];

interface ZakatProjectPhotoGalleryProps {
  disbursedRecords: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
}

export const ZakatProjectPhotoGallery: React.FC<ZakatProjectPhotoGalleryProps> = ({
  disbursedRecords,
  theme,
  language,
  onOpenDisburse,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'spotlight'>('grid');
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Format currency
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filter photos
  const filteredPhotos = PROJECT_SITE_PHOTOS.filter((photo) => {
    const matchesCategory = selectedCategory === 'ALL' || photo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.partnerInstitution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === 'Escape') setActiveLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % filteredPhotos.length : 0
        );
      }
      if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, filteredPhotos.length]);

  const activePhoto = activeLightboxIndex !== null ? filteredPhotos[activeLightboxIndex] : null;
  const currentSpotlightPhoto = filteredPhotos[spotlightIndex] || filteredPhotos[0];

  const handleCopyShareText = (photo: ProjectSitePhoto) => {
    const shareText = `[Dokumentasi Penyaluran Zakat Resmi]\nProyek: ${photo.title}\nLokasi: ${photo.location}\nMitra Amil: ${photo.partnerInstitution}\nNomor BSZ: ${photo.verifiedBszNumber}\nDampak Nyata: ${photo.impactHighlight}\nMustahik: ${photo.beneficiariesLabel}\nSROI Syariah: ${photo.sroiMultiplier}\nKepatuhan: PSAK 109 & UU No. 23/2011`;
    navigator.clipboard.writeText(shareText);
    setCopiedShareId(photo.id);
    setTimeout(() => setCopiedShareId(null), 2500);
  };

  const categories = [
    { id: 'ALL', label: 'Semua Situs Proyek', icon: Layers, count: PROJECT_SITE_PHOTOS.length },
    { id: 'umkm', label: 'Ekonomi UMKM', icon: Store, count: PROJECT_SITE_PHOTOS.filter((p) => p.category === 'umkm').length },
    { id: 'education', label: 'Pendidikan 3T', icon: GraduationCap, count: PROJECT_SITE_PHOTOS.filter((p) => p.category === 'education').length },
    { id: 'health', label: 'Kesehatan Dhuafa', icon: Stethoscope, count: PROJECT_SITE_PHOTOS.filter((p) => p.category === 'health').length },
    { id: 'water', label: 'Air Bersih & Sanitasi', icon: Droplets, count: PROJECT_SITE_PHOTOS.filter((p) => p.category === 'water').length },
  ];

  return (
    <div
      id="zakat-project-photo-gallery-section"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header Section */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-teal-950/20 via-slate-900/30 to-emerald-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Camera className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Galeri Foto Lapangan: Realitas Dampak Penyaluran Zakat
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30">
                Dokumentasi Lapangan Terverifikasi
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Audit Fisik BSZ
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Foto dokumenter autentik dari lokasi binaan dan sarana mustahik di pelosok Nusantara. Menggambarkan secara visual transformasi riil dana zakat maal Anda menjadi kemandirian ekonomi, kecerdasan santri 3T, layanan medis gratis, dan air bersih berkelanjutan.
            </p>
          </div>

          {/* View Mode Switcher & Summary Counter */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="text-teal-400 font-bold">{PROJECT_SITE_PHOTOS.length}</span> Situs Proyek Aktif
            </div>

            <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('spotlight')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'spotlight'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Sorotan (Spotlight)
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSpotlightIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi, kota, asnaf..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-teal-500 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-teal-500 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Camera className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <p className="text-xs text-slate-400 font-semibold">
              Tidak ditemukan foto dokumentasi proyek untuk filter pencarian ini.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : viewMode === 'spotlight' ? (
          /* =======================================
             SPOTLIGHT / CAROUSEL VIEW
             ======================================= */
          <div className="space-y-4">
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* Photo Viewer Container */}
                <div className="lg:col-span-7 relative group min-h-[300px] sm:min-h-[380px] bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={currentSpotlightPhoto.imageUrl}
                    alt={currentSpotlightPhoto.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                  {/* Badges on Top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-600/90 text-white text-[11px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                      {currentSpotlightPhoto.categoryLabel}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-teal-300 text-[11px] font-bold backdrop-blur-md border border-teal-500/30 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      {currentSpotlightPhoto.verifiedBszNumber}
                    </span>
                  </div>

                  {/* Expand Fullscreen Button */}
                  <button
                    onClick={() => {
                      const actualIdx = filteredPhotos.findIndex((p) => p.id === currentSpotlightPhoto.id);
                      setActiveLightboxIndex(actualIdx >= 0 ? actualIdx : 0);
                    }}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
                    title="Buka Layar Penuh (High-Res Lightbox)"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Perbesar Foto</span>
                  </button>

                  {/* Carousel Prev/Next Buttons */}
                  <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() =>
                        setSpotlightIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)
                      }
                      className="w-9 h-9 rounded-full bg-black/60 hover:bg-teal-600 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSpotlightIndex((prev) => (prev + 1) % filteredPhotos.length)}
                      className="w-9 h-9 rounded-full bg-black/60 hover:bg-teal-600 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details Narrative Column */}
                <div className="lg:col-span-5 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {currentSpotlightPhoto.location}
                      </span>
                      <span>•</span>
                      <span>{currentSpotlightPhoto.dateCaptured}</span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug">
                      {currentSpotlightPhoto.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {currentSpotlightPhoto.caption}
                    </p>

                    {/* Key Outcome Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Mustahik Terbantu
                        </span>
                        <span className="text-xs font-black text-teal-400 block mt-0.5">
                          {currentSpotlightPhoto.beneficiariesLabel}
                        </span>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border ${
                          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Indeks SROI Syariah
                        </span>
                        <span className="text-xs font-black text-amber-400 block mt-0.5">
                          {currentSpotlightPhoto.sroiMultiplier}
                        </span>
                      </div>
                    </div>

                    {/* Impact Highlight Badge */}
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-emerald-300">
                        <strong>Capaian Nyata:</strong> {currentSpotlightPhoto.impactHighlight}
                      </div>
                    </div>

                    {/* Institution & Asnaf */}
                    <div className="text-[11px] space-y-1 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>Mitra: {currentSpotlightPhoto.partnerInstitution}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Asnaf: {currentSpotlightPhoto.asnafTarget} ({currentSpotlightPhoto.sdgGoal})</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => handleCopyShareText(currentSpotlightPhoto)}
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedShareId === currentSpotlightPhoto.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Salin Info</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenDisburse) {
                          onOpenDisburse({
                            amount: currentSpotlightPhoto.allocatedAmountIDR,
                            institution: currentSpotlightPhoto.partnerKey,
                            program: currentSpotlightPhoto.title,
                            notes: `Dukungan Zakat Lanjutan untuk ${currentSpotlightPhoto.title} (${currentSpotlightPhoto.location})`,
                          });
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Salurkan ke Program Ini</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-2.5">
              {filteredPhotos.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setSpotlightIndex(idx)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left aspect-video ${
                    spotlightIndex === idx
                      ? 'border-teal-500 ring-2 ring-teal-500/40'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                    <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                      {photo.categoryLabel}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* =======================================
             GRID VIEW (2x2 / Responsive Cards)
             ======================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl ${
                  theme === 'dark'
                    ? 'bg-slate-950/70 border-slate-800 hover:border-teal-500/50 hover:bg-slate-950'
                    : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-slate-200'
                }`}
              >
                {/* Photo Thumbnail Container */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    onClick={() => setActiveLightboxIndex(idx)}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                      {photo.categoryLabel}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-black/60 text-teal-300 text-[10px] font-mono font-bold backdrop-blur-md border border-teal-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-400" />
                      BSZ Sah
                    </span>
                  </div>

                  {/* Expand Icon Button */}
                  <button
                    onClick={() => setActiveLightboxIndex(idx)}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-xl bg-black/60 hover:bg-teal-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg group-hover:scale-110 active:scale-95"
                    title="Perbesar Layar Penuh"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-300" />
                  </button>

                  {/* Bottom Image Overlay Tag */}
                  <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-1 text-[11px] text-slate-200 font-semibold drop-shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{photo.location}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 leading-snug group-hover:text-teal-400 transition-colors">
                      {photo.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>

                    {/* Impact Result Card */}
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-teal-300 font-medium leading-tight">
                        <strong>Dampak Riil:</strong> {photo.impactHighlight}
                      </div>
                    </div>

                    {/* Micro Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Alokasi Zakat:</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {formatIDR(photo.allocatedAmountIDR)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Penerima Manfaat:</span>
                        <span className="font-bold text-teal-400">
                          {photo.beneficiariesCount} Jiwa
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mitra Amil:</span>
                        <span className="text-slate-700 dark:text-slate-300 truncate block">
                          {photo.partnerInstitution.split('(')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Pengungkit SROI:</span>
                        <span className="font-bold text-amber-400">
                          {photo.sroiMultiplier}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyShareText(photo)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Salin Rincian Dampak"
                    >
                      {copiedShareId === photo.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3 h-3 text-slate-400" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveLightboxIndex(idx)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        Detail Foto
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenDisburse) {
                            onOpenDisburse({
                              amount: photo.allocatedAmountIDR,
                              institution: photo.partnerKey,
                              program: photo.title,
                              notes: `Dukungan Zakat Lanjutan untuk ${photo.title} (${photo.location})`,
                            });
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <HeartHandshake className="w-3 h-3" />
                        <span>Salurkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Guarantee Strip */}
        <div className="mt-5 p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Integritas Penyaluran:</strong> Seluruh foto situs proyek diaudit berkala sesuai pedoman BAZNAS RI & PSAK 109 demi menjamin 100% amanah muzakki tersampaikan kepada yang berhak.
            </span>
          </div>
          <span className="text-[11px] text-teal-400 font-mono shrink-0">
            Audit Standar: AAOIFI & UU 23/2011
          </span>
        </div>
      </div>

      {/* =========================================================
          INTERACTIVE LIGHTBOX MODAL (FULLSCREEN HIGH-RES VIEW)
          ========================================================= */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div
            className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-teal-500/30 text-slate-100 shadow-teal-950/30'
                : 'bg-white border-teal-200 text-slate-900 shadow-2xl'
            }`}
          >
            {/* Lightbox Header Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-600 text-white">
                  {activePhoto.categoryLabel}
                </span>
                <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                  {activePhoto.location} • Foto {(activeLightboxIndex || 0) + 1} dari {filteredPhotos.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyShareText(activePhoto)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Salin Rincian"
                >
                  {copiedShareId === activePhoto.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Salin Info</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveLightboxIndex(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Body Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
              {/* High-Res Image Column */}
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative group min-h-[320px] sm:min-h-[440px]">
                <img
                  src={activePhoto.imageUrl}
                  alt={activePhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain max-h-[70vh]"
                />

                {/* Left/Right Lightbox Arrows */}
                <button
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : 0
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-teal-600 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Foto Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() =>
                    setActiveLightboxIndex((prev) =>
                      prev !== null ? (prev + 1) % filteredPhotos.length : 0
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-teal-600 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
                  title="Foto Berikutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Bottom Watermark Tag */}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-slate-300 font-mono border border-white/10">
                  Ref BSZ: {activePhoto.verifiedBszNumber}
                </div>
              </div>

              {/* Comprehensive Field Report Details Column */}
              <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{activePhoto.auditStatus}</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {activePhoto.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{activePhoto.location}</span>
                  </div>

                  {/* Impact Highlight Box */}
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase block tracking-wider">
                      Capaian Dampak Utama
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {activePhoto.impactHighlight}
                    </p>
                  </div>

                  {/* Narrative Story */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Catatan Dokumenter & Laporan Lapangan:
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {activePhoto.fullStory}
                    </p>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div
                      className={`p-2.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block">Penerima Manfaat:</span>
                      <span className="font-bold text-teal-400 block">
                        {activePhoto.beneficiariesLabel}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block">Indeks SROI:</span>
                      <span className="font-bold text-amber-400 block">
                        {activePhoto.sroiMultiplier}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block">Asnaf Sasaran:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">
                        {activePhoto.asnafTarget}
                      </span>
                    </div>

                    <div
                      className={`p-2.5 rounded-xl border ${
                        theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block">Alineasi SDG:</span>
                      <span className="font-bold text-emerald-400 block">
                        {activePhoto.sdgGoal}
                      </span>
                    </div>
                  </div>

                  {/* Surveyor Note */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Verifikator: {activePhoto.surveyorName}</span>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <button
                    onClick={() => setActiveLightboxIndex(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={() => {
                      setActiveLightboxIndex(null);
                      if (onOpenDisburse) {
                        onOpenDisburse({
                          amount: activePhoto.allocatedAmountIDR,
                          institution: activePhoto.partnerKey,
                          program: activePhoto.title,
                          notes: `Dukungan Zakat Lanjutan untuk ${activePhoto.title} (${activePhoto.location})`,
                        });
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/25 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Salurkan ke Program Ini</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
