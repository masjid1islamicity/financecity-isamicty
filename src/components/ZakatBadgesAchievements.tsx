import React, { useState, useMemo } from 'react';
import {
  Award,
  Trophy,
  ShieldCheck,
  Sparkles,
  Crown,
  Building2,
  GraduationCap,
  Store,
  Stethoscope,
  Droplets,
  Flame,
  Globe,
  Lock,
  Unlock,
  CheckCircle2,
  Share2,
  Check,
  Copy,
  ExternalLink,
  X,
  HeartHandshake,
  TrendingUp,
  Layers,
  ChevronRight,
  Info,
  Medal,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatAchievementBadge, ZakatBadgeTier } from '../types';

interface ZakatBadgesAchievementsProps {
  disbursedRecords: ZakatSummaryRecord[];
  annualTargetIDR?: number;
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
}

export const ZakatBadgesAchievements: React.FC<ZakatBadgesAchievementsProps> = ({
  disbursedRecords,
  annualTargetIDR = 15000000,
  theme,
  language,
  onOpenDisburse,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED' | 'COMMUNITY' | 'EDUCATION' | 'ECONOMIC'>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<ZakatAchievementBadge | null>(null);
  const [copiedBadgeId, setCopiedBadgeId] = useState<string | null>(null);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics derived from actual transactions
  const metrics = useMemo(() => {
    const totalPaidIDR = disbursedRecords.reduce((sum, r) => sum + r.amountIDR, 0);
    const totalCount = disbursedRecords.length;
    const distinctInstitutions = new Set(disbursedRecords.map((r) => r.institution)).size;

    const umkmAmount = disbursedRecords
      .filter((r) => /umkm|usaha|modal|ekonomi|pedagang|gerobak/i.test(r.programTarget))
      .reduce((sum, r) => sum + r.amountIDR, 0);

    const educationAmount = disbursedRecords
      .filter((r) => /pendidikan|beasiswa|santri|sekolah|madrasah/i.test(r.programTarget))
      .reduce((sum, r) => sum + r.amountIDR, 0);

    const healthAmount = disbursedRecords
      .filter((r) => /kesehatan|sehat|medis|klinik|stunting|gizi|pasien/i.test(r.programTarget))
      .reduce((sum, r) => sum + r.amountIDR, 0);

    const waterAmount = disbursedRecords
      .filter((r) => /air|sumur|sanitasi|filtrasi/i.test(r.programTarget))
      .reduce((sum, r) => sum + r.amountIDR, 0);

    const bszCount = disbursedRecords.filter(
      (r) => r.receiptNumber && r.receiptNumber.trim() !== ''
    ).length;

    const targetProgressPercent = Math.round((totalPaidIDR / (annualTargetIDR || 1)) * 100);

    return {
      totalPaidIDR,
      totalCount,
      distinctInstitutions,
      umkmAmount,
      educationAmount,
      healthAmount,
      waterAmount,
      bszCount,
      targetProgressPercent,
    };
  }, [disbursedRecords, annualTargetIDR]);

  // Badges Definitions with Real-Time Milestone Calculation
  const badges: ZakatAchievementBadge[] = useMemo(() => {
    return [
      {
        id: 'badge-community-pillar',
        code: 'CP-10M',
        name: 'Pilar Komunitas',
        englishTitle: 'Community Pillar',
        tier: 'GOLD',
        category: 'community',
        categoryLabel: 'Pilar Kemaslahatan',
        iconName: 'Building2',
        description:
          'Dianugerahkan atas komitmen teguh menopang kesejahteraan umat dengan akumulasi penyaluran zakat produktif & sosial mencapai minimal Rp 10.000.000.',
        shariaPhilosophy:
          '“Perumpamaan kaum mukmin dalam kasih sayang bagaikan satu tubuh; bila satu anggota sakit, sekujur badan merasakan demam.” (HR. Muslim No. 2586)',
        milestoneRequirement: 'Akumulasi Penyaluran ≥ Rp 10.000.000',
        targetValue: 10000000,
        currentValue: metrics.totalPaidIDR,
        unit: 'IDR',
        isUnlocked: metrics.totalPaidIDR >= 10000000,
        unlockedAt: metrics.totalPaidIDR >= 10000000 ? '19 September 2026' : undefined,
        xpPoints: 250,
        certificateRef: 'CERT-CP-10M-BAZNAS-89104',
        socialShareSnippet:
          'Alhamdulillah! Saya telah meraih lencana kehormatan "Pilar Komunitas" (Community Pillar) di FinanceCity atas akumulasi penyaluran zakat maal berkelanjutan bagi mustahik Nusantara. 🏛️🌿 #CommunityPillar #FinanceCityZakat #BAZNAS',
      },
      {
        id: 'badge-education-champion',
        code: 'EC-3M',
        name: 'Pejuang Pendidikan Santri',
        englishTitle: 'Education Champion',
        tier: 'GOLD',
        category: 'education',
        categoryLabel: 'Pendidikan 3T',
        iconName: 'GraduationCap',
        description:
          'Dianugerahkan atas dedikasi membuka jendela ilmu bagi generasi dhuafa melalui penyaluran beasiswa santri & perlengkapan belajar pedalaman minimal Rp 3.000.000.',
        shariaPhilosophy:
          '“Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah mudahkan baginya jalan menuju surga.” (HR. Muslim) — Hak Asnaf Fisabilillah & Ibnu Sabil.',
        milestoneRequirement: 'Penyaluran Beasiswa Santri ≥ Rp 3.000.000',
        targetValue: 3000000,
        currentValue: metrics.educationAmount,
        unit: 'IDR',
        isUnlocked:
          metrics.educationAmount >= 3000000 ||
          disbursedRecords.some((r) => /pendidikan|beasiswa|santri/i.test(r.programTarget)),
        unlockedAt:
          metrics.educationAmount >= 3000000 ||
          disbursedRecords.some((r) => /pendidikan|beasiswa|santri/i.test(r.programTarget))
            ? '15 September 2026'
            : undefined,
        xpPoints: 200,
        certificateRef: 'CERT-EC-3M-DD-91024',
        socialShareSnippet:
          'Bangga menjadi "Pejuang Pendidikan Santri" (Education Champion) bersama @FinanceCity & Dompet Dhuafa! Mari dukung beasiswa anak-anak dhuafa 3T. 🎓📖 #EducationChampion #ZakatPendidikan',
      },
      {
        id: 'badge-umkm-pioneer',
        code: 'EP-3.5M',
        name: 'Penggerak UMKM Berdikari',
        englishTitle: 'Economic Empowerment Pioneer',
        tier: 'GOLD',
        category: 'economic',
        categoryLabel: 'Ekonomi Produktif',
        iconName: 'Store',
        description:
          'Dianugerahkan atas kontribusi zakat produktif minimal Rp 3.500.000 untuk pengadaan gerobak usaha modern dan modal bergulir demi graduasi mustahik menjadi muzakki.',
        shariaPhilosophy:
          '“Tangan di atas lebih baik daripada tangan di bawah.” (HR. Bukhari) — Prinsip utama Maqasid Syariah dalam menciptakan kemandirian finansial mustahik.',
        milestoneRequirement: 'Penyaluran Modal UMKM ≥ Rp 3.500.000',
        targetValue: 3500000,
        currentValue: metrics.umkmAmount,
        unit: 'IDR',
        isUnlocked: metrics.umkmAmount >= 3500000,
        unlockedAt: metrics.umkmAmount >= 3500000 ? '18 September 2026' : undefined,
        xpPoints: 200,
        certificateRef: 'CERT-EP-LPEM-BAZNAS-3312',
        socialShareSnippet:
          'Meraih lencana "Penggerak UMKM Berdikari" (Economic Empowerment Pioneer). Zakat produktif menyalakan roda usaha mustahik menuju muzakki mandiri! 🛒📈 #UMKMMandiri #ZakatProduktif',
      },
      {
        id: 'badge-health-guardian',
        code: 'HG-2M',
        name: 'Penjaga Kesehatan Dhuafa',
        englishTitle: 'Healthcare Guardian',
        tier: 'SILVER',
        category: 'health',
        categoryLabel: 'Layanan Medis',
        iconName: 'Stethoscope',
        description:
          'Dianugerahkan atas kepedulian mendanai subsidi operasional klinik cuma-cuma, pos gizi balita, dan pencegahan stunting bagi keluarga rentan minimal Rp 2.000.000.',
        shariaPhilosophy:
          'Maqasid Syariah: Hifdz An-Nafs (Memelihara Jiwa). Membebaskan dhuafa dari jerat kesulitan biaya berobat adalah manifestasi nyata ukhuwah Islamiyah.',
        milestoneRequirement: 'Penyaluran Layanan Kesehatan ≥ Rp 2.000.000',
        targetValue: 2000000,
        currentValue: metrics.healthAmount,
        unit: 'IDR',
        isUnlocked: metrics.healthAmount >= 2000000,
        unlockedAt: metrics.healthAmount >= 2000000 ? '19 September 2026' : undefined,
        xpPoints: 150,
        certificateRef: 'CERT-HG-2M-LKC-7721',
        socialShareSnippet:
          'Meraih lencana "Penjaga Kesehatan Dhuafa" (Healthcare Guardian). Dana zakat hadir sebagai obat dan perlindungan nutrisi bagi balita prasejahtera! 🩺🤍 #KesehatanDhuafa #CegahStunting',
      },
      {
        id: 'badge-water-oasis',
        code: 'WO-2.5M',
        name: 'Mata Air Kehidupan 3T',
        englishTitle: 'Oasis of Life',
        tier: 'GOLD',
        category: 'water',
        categoryLabel: 'Air Bersih & Sanitasi',
        iconName: 'Droplets',
        description:
          'Dianugerahkan atas kontribusi pembangunan sumur bor kedalaman tinggi dan instalasi filtrasi air bersih minum bagi desa pesisir pelosok minimal Rp 2.500.000.',
        shariaPhilosophy:
          'Sa’ad bin ‘Ubadah bertanya: “Wahai Rasulullah, sedekah apa yang paling utama?” Beliau menjawab: “Memberi air minum.” (HR. Abu Dawud No. 1679).',
        milestoneRequirement: 'Penyaluran Fasilitas Air Bersih ≥ Rp 2.500.000',
        targetValue: 2500000,
        currentValue: metrics.waterAmount,
        unit: 'IDR',
        isUnlocked: metrics.waterAmount >= 2500000,
        unlockedAt: metrics.waterAmount >= 2500000 ? '12 September 2026' : undefined,
        xpPoints: 200,
        certificateRef: 'CERT-WO-2.5M-RZ-9031',
        socialShareSnippet:
          'Mengalirkan berkah air minum bersih bagi saudara kita di kepulauan 3T melalui lencana "Mata Air Kehidupan" (Oasis of Life) di FinanceCity! 💧🏝️ #SedekahAir #DesaBerdaya',
      },
      {
        id: 'badge-consistent-benefactor',
        code: 'CB-3TX',
        name: 'Muzakki Istiqomah',
        englishTitle: 'Consistent Benefactor',
        tier: 'PLATINUM',
        category: 'consistency',
        categoryLabel: 'Disiplin Berkelanjutan',
        iconName: 'Flame',
        description:
          'Dianugerahkan atas komitmen disiplin menunaikan zakat minimal 3 kali transaksi resmi terverifikasi BSZ tanpa terputus secara berkesinambungan.',
        shariaPhilosophy:
          '“Amalan yang paling dicintai Allah ta’ala adalah amalan yang kontinyu (istiqomah) walaupun sedikit.” (HR. Bukhari No. 6464 & Muslim No. 783).',
        milestoneRequirement: 'Transaksi Penyaluran Terverifikasi ≥ 3 Kali',
        targetValue: 3,
        currentValue: metrics.totalCount,
        unit: 'Kali',
        isUnlocked: metrics.totalCount >= 3,
        unlockedAt: metrics.totalCount >= 3 ? '20 September 2026' : undefined,
        xpPoints: 200,
        certificateRef: 'CERT-CB-ISTIQOMAH-0926',
        socialShareSnippet:
          'Konsisten menunaikan kewajiban rukun Islam! Meraih lencana "Muzakki Istiqomah" (Consistent Benefactor) di FinanceCity. Berkah dalam kontinuitas! 🔥🤲 #MuzakkiIstiqomah #RukunIslam',
      },
      {
        id: 'badge-archipelago-unifier',
        code: 'AU-2AMIL',
        name: 'Sinergi Nusantara',
        englishTitle: 'Archipelago Unifier',
        tier: 'SILVER',
        category: 'synergy',
        categoryLabel: 'Kemitraan Amil',
        iconName: 'Globe',
        description:
          'Dianugerahkan atas sinergi penyaluran zakat melalui minimal 2 lembaga amil resmi terakreditasi BAZNAS/LAZNAS untuk jangkauan geografis Nusantara yang merata.',
        shariaPhilosophy:
          '“Dan tolong-menolonglah kamu dalam kebaikan dan ketakwaan...” (QS. Al-Ma’idah: 2) — Memperluas simpul manfaat ke pelosok pulau Indonesia.',
        milestoneRequirement: 'Tersalurkan ke ≥ 2 Lembaga Amil Terdaftar',
        targetValue: 2,
        currentValue: metrics.distinctInstitutions,
        unit: 'Lembaga',
        isUnlocked: metrics.distinctInstitutions >= 2,
        unlockedAt: '19 September 2026',
        xpPoints: 150,
        certificateRef: 'CERT-AU-2AMIL-MULTI-8812',
        socialShareSnippet:
          'Merajut berkah kebaikan dari Sabang sampai Merauke! Meraih lencana "Sinergi Nusantara" (Archipelago Unifier) bersama BAZNAS & LAZNAS. 🇮🇩🌏 #SinergiNusantara #ZakatUntukNegeri',
      },
      {
        id: 'badge-goal-conqueror',
        code: 'GC-60PCT',
        name: 'Penakluk Target Tahunan',
        englishTitle: 'Annual Goal Conqueror',
        tier: 'DIAMOND',
        category: 'community',
        categoryLabel: 'Disiplin Rencana',
        iconName: 'Trophy',
        description:
          'Dianugerahkan atas keberhasilan merealisasikan minimal 60% dari komitmen target zakat tahunan yang direncanakan pada modul Zakat Planner & Impact Goal.',
        shariaPhilosophy:
          '“Dan penuhilah janji, sesungguhnya janji itu pasti dimintai pertanggungjawabannya.” (QS. Al-Isra’: 34) — Keberkahan dalam perencanaan harta syariah.',
        milestoneRequirement: 'Realisasi Target Zakat Tahunan ≥ 60%',
        targetValue: 60,
        currentValue: metrics.targetProgressPercent,
        unit: '%',
        isUnlocked: metrics.targetProgressPercent >= 60,
        unlockedAt: metrics.targetProgressPercent >= 60 ? '19 September 2026' : undefined,
        xpPoints: 300,
        certificateRef: 'CERT-GC-60PCT-GOAL-4029',
        socialShareSnippet:
          'Target zakat tahunan tercapai lebih dari 60%! Meraih predikat "Penakluk Target Tahunan" (Annual Goal Conqueror) di FinanceCity. 🏆🎯 #AnnualGoal #ZakatTarget #AmanahFinansial',
      },
      {
        id: 'badge-transparent-giver',
        code: 'TG-BSZ',
        name: 'Ksatria Transparansi PSAK 109',
        englishTitle: 'Certified Transparent Giver',
        tier: 'BRONZE',
        category: 'governance',
        categoryLabel: 'Kepatuhan Regulasi',
        iconName: 'ShieldCheck',
        description:
          'Dianugerahkan atas kepemilikan Bukti Setor Zakat (BSZ) resmi teregistrasi yang sah secara hukum sebagai pengurang penghasilan bruto SPT Tahunan PPh Orang Pribadi.',
        shariaPhilosophy:
          'UU RI No. 23/2011 Pasal 22 & Standar Akuntansi PSAK 109 — Transparansi pelaporan audit demi kepatuhan rukun syariah dan hukum negara.',
        milestoneRequirement: 'Memiliki Bukti Setor Zakat (BSZ) Sah',
        targetValue: 1,
        currentValue: metrics.bszCount,
        unit: 'Dokumen',
        isUnlocked: metrics.bszCount >= 1,
        unlockedAt: '15 September 2026',
        xpPoints: 100,
        certificateRef: 'CERT-TG-PSAK109-TAX-0012',
        socialShareSnippet:
          'Zakat sah, akuntabel, dan legal! Meraih lencana "Ksatria Transparansi PSAK 109" (Certified Transparent Giver) dengan Bukti Setor Zakat (BSZ) resmi pengurang pajak PPh. 🛡️🧾 #PSAK109 #BSZResmi #PajakZakat',
      },
      {
        id: 'badge-ocean-generosity',
        code: 'OG-20M',
        name: 'Dermawan Bintang Samudra',
        englishTitle: 'Ocean of Generosity',
        tier: 'DIAMOND',
        category: 'community',
        categoryLabel: 'Filantropi Paripurna',
        iconName: 'Crown',
        description:
          'Dianugerahkan sebagai penghargaan tertinggi atas akumulasi penyaluran zakat maal menembus angka Rp 20.000.000 untuk pengentasan kemiskinan skala masif.',
        shariaPhilosophy:
          '“Perumpamaan nafkah yang dikeluarkan oleh orang yang menafkahkan hartanya di jalan Allah serupa dengan sebutir benih yang menumbuhkan tujuh butir...” (QS. Al-Baqarah: 261).',
        milestoneRequirement: 'Akumulasi Penyaluran ≥ Rp 20.000.000',
        targetValue: 20000000,
        currentValue: metrics.totalPaidIDR,
        unit: 'IDR',
        isUnlocked: metrics.totalPaidIDR >= 20000000,
        unlockedAt: metrics.totalPaidIDR >= 20000000 ? '20 September 2026' : undefined,
        xpPoints: 500,
        certificateRef: 'CERT-OG-20M-SUPREME-9999',
        socialShareSnippet:
          'Alhamdulillah, pencapaian istimewa "Dermawan Bintang Samudra" (Ocean of Generosity) di FinanceCity! Semoga setiap tetes berkah melipatgandakan kemaslahatan umat. 👑💎🌊 #OceanOfGenerosity #FilantropiIslam',
      },
    ];
  }, [metrics, disbursedRecords]);

  // Overall User Accolade Level & Points Calculation
  const totalEarnedXP = useMemo(() => {
    return badges.filter((b) => b.isUnlocked).reduce((sum, b) => sum + b.xpPoints, 0);
  }, [badges]);

  const unlockedCount = useMemo(() => {
    return badges.filter((b) => b.isUnlocked).length;
  }, [badges]);

  const totalBadgesCount = badges.length;

  const currentLevelInfo = useMemo(() => {
    if (totalEarnedXP >= 1600) {
      return {
        level: 5,
        title: 'Filantropis Paripurna Diamond',
        english: 'Grand Diamond Philanthropist',
        tier: 'DIAMOND' as ZakatBadgeTier,
        nextXp: 2250,
        badgeGlow: 'from-cyan-400 via-sky-300 to-indigo-500',
      };
    }
    if (totalEarnedXP >= 1000) {
      return {
        level: 4,
        title: 'Pilar Utama Emas',
        english: 'Gold Community Pillar',
        tier: 'PLATINUM' as ZakatBadgeTier,
        nextXp: 1600,
        badgeGlow: 'from-amber-300 via-yellow-400 to-amber-600',
      };
    }
    if (totalEarnedXP >= 550) {
      return {
        level: 3,
        title: 'Duta Kemaslahatan',
        english: 'Welfare Ambassador',
        tier: 'GOLD' as ZakatBadgeTier,
        nextXp: 1000,
        badgeGlow: 'from-amber-400 to-teal-400',
      };
    }
    if (totalEarnedXP >= 250) {
      return {
        level: 2,
        title: 'Muhsin Aktif Berkemajuan',
        english: 'Active Benefactor',
        tier: 'SILVER' as ZakatBadgeTier,
        nextXp: 550,
        badgeGlow: 'from-slate-300 to-teal-300',
      };
    }
    return {
      level: 1,
      title: 'Muzakki Pemula',
      english: 'Beginner Giver',
      tier: 'BRONZE' as ZakatBadgeTier,
      nextXp: 250,
      badgeGlow: 'from-amber-700 to-orange-500',
    };
  }, [totalEarnedXP]);

  // Filtering badges
  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (selectedFilter === 'UNLOCKED') return b.isUnlocked;
      if (selectedFilter === 'LOCKED') return !b.isUnlocked;
      if (selectedFilter === 'COMMUNITY') return b.category === 'community';
      if (selectedFilter === 'EDUCATION') return b.category === 'education';
      if (selectedFilter === 'ECONOMIC') return b.category === 'economic';
      return true;
    });
  }, [badges, selectedFilter]);

  // Dynamic Icon Renderer
  const renderBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Store':
        return <Store className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  // Tier Styling
  const getTierStyles = (tier: ZakatBadgeTier, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg:
          theme === 'dark'
            ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
            : 'bg-slate-100/70 border-slate-200 text-slate-400',
        badgeBg: 'bg-slate-800/50 border-slate-700/60 text-slate-500',
        ringColor: 'ring-slate-700/30',
        glow: '',
        pillBg: 'bg-slate-800 text-slate-400 border-slate-700',
      };
    }

    switch (tier) {
      case 'DIAMOND':
        return {
          cardBg:
            theme === 'dark'
              ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
              : 'bg-gradient-to-br from-cyan-50/80 via-white to-indigo-50/80 border-cyan-300 shadow-md shadow-cyan-100',
          badgeBg:
            'bg-gradient-to-br from-cyan-400 via-sky-300 to-indigo-500 text-slate-950 border-cyan-200 shadow-lg shadow-cyan-500/30',
          ringColor: 'ring-cyan-400/50',
          glow: 'from-cyan-400/20 to-indigo-500/20',
          pillBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        };
      case 'PLATINUM':
        return {
          cardBg:
            theme === 'dark'
              ? 'bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border-purple-500/30 shadow-lg shadow-purple-950/20'
              : 'bg-gradient-to-br from-purple-50/80 via-white to-slate-50 border-purple-200 shadow-md',
          badgeBg:
            'bg-gradient-to-br from-slate-200 via-purple-200 to-indigo-300 text-slate-900 border-white shadow-lg shadow-purple-500/20',
          ringColor: 'ring-purple-400/40',
          glow: 'from-purple-400/20 to-slate-400/20',
          pillBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      case 'GOLD':
        return {
          cardBg:
            theme === 'dark'
              ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border-amber-500/35 shadow-lg shadow-amber-950/20'
              : 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-amber-300 shadow-md shadow-amber-100',
          badgeBg:
            'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-slate-950 border-amber-200 shadow-lg shadow-amber-500/30',
          ringColor: 'ring-amber-400/50',
          glow: 'from-amber-400/20 to-yellow-500/20',
          pillBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'SILVER':
        return {
          cardBg:
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/20 border-slate-700/80 shadow-md'
              : 'bg-gradient-to-br from-slate-50 via-white to-teal-50/40 border-slate-300 shadow-sm',
          badgeBg:
            'bg-gradient-to-br from-slate-100 via-slate-300 to-zinc-400 text-slate-900 border-slate-200 shadow-md shadow-slate-500/20',
          ringColor: 'ring-slate-300/40',
          glow: 'from-slate-400/15 to-teal-400/15',
          pillBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        };
      case 'BRONZE':
      default:
        return {
          cardBg:
            theme === 'dark'
              ? 'bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border-amber-700/30 shadow-md'
              : 'bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 border-orange-200 shadow-sm',
          badgeBg:
            'bg-gradient-to-br from-amber-600 via-orange-500 to-amber-800 text-white border-amber-300 shadow-md shadow-orange-500/20',
          ringColor: 'ring-orange-400/40',
          glow: 'from-orange-500/15 to-amber-600/15',
          pillBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        };
    }
  };

  const handleCopyShare = (badge: ZakatAchievementBadge) => {
    navigator.clipboard.writeText(badge.socialShareSnippet);
    setCopiedBadgeId(badge.id);
    setTimeout(() => setCopiedBadgeId(null), 2500);
  };

  const handleShareToTwitter = (badge: ZakatAchievementBadge) => {
    const text = encodeURIComponent(badge.socialShareSnippet);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareToLinkedIn = (badge: ZakatAchievementBadge) => {
    navigator.clipboard.writeText(badge.socialShareSnippet);
    setCopiedBadgeId(badge.id);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=650,height=600');
  };

  return (
    <div
      id="zakat-badges-achievements-section"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header Level & XP Progress Banner */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-teal-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Title & Status */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                  <Award className="w-7 h-7 text-amber-300 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] shadow-xs">
                Lv.{currentLevelInfo.level}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Lencana & Prestasi Digital (Badges & Achievements)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentLevelInfo.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20">
                  {unlockedCount} dari {totalBadgesCount} Diraih
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Apresiasi visual digital atas setiap tonggak capaian penyaluran zakat produktif, beasiswa santri, layanan kesehatan dhuafa, dan air bersih yang terverifikasi Bukti Setor Zakat (BSZ) resmi.
              </p>
            </div>
          </div>

          {/* Right XP Metric & Level Tracker */}
          <div
            className={`p-3.5 rounded-2xl border min-w-[260px] space-y-2 shrink-0 ${
              theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Total Skor Berkah:
              </span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {totalEarnedXP} <span className="text-[10px] text-slate-400">/ {currentLevelInfo.nextXp} XP</span>
              </span>
            </div>

            {/* Level XP Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/60">
              <div
                className="bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((totalEarnedXP / currentLevelInfo.nextXp) * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Tingkat Saat Ini: <strong>{currentLevelInfo.english}</strong></span>
              <span className="text-teal-400 font-bold">
                {Math.max(0, currentLevelInfo.nextXp - totalEarnedXP)} XP ke Lv.{currentLevelInfo.level + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Navigation Chips */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Semua Lencana', count: badges.length },
              { id: 'UNLOCKED', label: 'Diraih (Unlocked)', count: unlockedCount },
              { id: 'LOCKED', label: 'Dalam Proses', count: badges.length - unlockedCount },
              { id: 'COMMUNITY', label: 'Pilar Sosial', count: badges.filter((b) => b.category === 'community').length },
              { id: 'EDUCATION', label: 'Pendidikan 3T', count: badges.filter((b) => b.category === 'education').length },
              { id: 'ECONOMIC', label: 'Ekonomi UMKM', count: badges.filter((b) => b.category === 'economic').length },
            ].map((tab) => {
              const isActive = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Klik lencana untuk melihat piagam digital & filosofi syariah</span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {filteredBadges.map((badge) => {
            const styles = getTierStyles(badge.tier, badge.isUnlocked);
            const progressPercent = Math.min(
              100,
              Math.round((badge.currentValue / (badge.targetValue || 1)) * 100)
            );

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group relative rounded-2xl border p-4 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.99] ${styles.cardBg}`}
              >
                {/* Top Status & Tier Pill */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${styles.pillBg}`}
                  >
                    {badge.tier}
                  </span>

                  {badge.isUnlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Diraih
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700">
                      <Lock className="w-3 h-3" />
                      {progressPercent}%
                    </span>
                  )}
                </div>

                {/* Central Emblem / Medallion */}
                <div className="flex flex-col items-center text-center my-1 space-y-2">
                  <div className="relative">
                    {/* Glow effect behind badge if unlocked */}
                    {badge.isUnlocked && (
                      <div
                        className={`absolute inset-0 rounded-2xl blur-lg opacity-60 bg-gradient-to-r ${styles.glow} pointer-events-none group-hover:opacity-100 transition-opacity`}
                      />
                    )}

                    <div
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 group-hover:rotate-6 ${styles.badgeBg} ${styles.ringColor}`}
                    >
                      {renderBadgeIcon(badge.iconName, 'w-7 h-7')}
                    </div>

                    {/* Unlocked Checkmark Emblem */}
                    {badge.isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Title & English Subtitle */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-400 transition-colors leading-snug">
                      {badge.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400 block tracking-tight">
                      {badge.englishTitle}
                    </span>
                  </div>
                </div>

                {/* Bottom Milestone Progress or Unlocked Timestamp */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1.5 text-[10px]">
                  {badge.isUnlocked ? (
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span className="text-slate-400">Diraih:</span>
                      <span className="font-mono">{badge.unlockedAt || 'Terverifikasi'}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <span>Capaian:</span>
                        <span className="font-mono font-bold text-slate-300">
                          {badge.unit === 'IDR'
                            ? `${formatIDR(badge.currentValue)}`
                            : `${badge.currentValue} / ${badge.targetValue} ${badge.unit}`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400 pt-0.5">
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">
                      {badge.categoryLabel}
                    </span>
                    <span className="font-bold text-amber-400 font-mono">+{badge.xpPoints} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Informational Bar */}
        <div className="mt-5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Kredo Penghargaan:</strong> Lencana digital ini tidak dimaksudkan untuk riya (pamer), melainkan sebagai syiar motivasi, pencatatan hisab infaq pribadi, dan bukti transparansi akuntabilitas syariah.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (onOpenDisburse) {
                  onOpenDisburse();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Tunaikan Zakat Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          ACCOLADE SHOWCASE & SHARING MODAL
          ========================================================= */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-amber-500/30 text-slate-100 shadow-amber-950/30'
                : 'bg-white border-amber-200 text-slate-900 shadow-2xl'
            }`}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Medal className="w-5 h-5 text-amber-200" />
                <div>
                  <h4 className="text-sm font-black tracking-tight">Piagam Lencana Kehormatan Zakat</h4>
                  <span className="text-[10px] text-amber-100/90 font-mono">
                    Ref: {selectedBadge.certificateRef || `CERT-${selectedBadge.code}-2026`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              {/* Emblem Presentation */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center">
                    <div className="w-full h-full rounded-[20px] bg-slate-950 flex items-center justify-center text-amber-300">
                      {renderBadgeIcon(selectedBadge.iconName, 'w-12 h-12')}
                    </div>
                  </div>

                  <span className="absolute -bottom-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
                    {selectedBadge.tier} TIER
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-2">
                  {selectedBadge.name}
                </h3>
                <span className="text-xs font-bold text-amber-500 dark:text-amber-400 font-mono">
                  {selectedBadge.englishTitle}
                </span>

                <div className="mt-2 flex items-center gap-2">
                  {selectedBadge.isUnlocked ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status: Telah Diraih (+{selectedBadge.xpPoints} XP)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Status: Belum Terbuka (+{selectedBadge.xpPoints} XP Potensial)
                    </span>
                  )}
                </div>
              </div>

              {/* Requirement & Current Progress */}
              <div
                className={`p-3.5 rounded-2xl border text-left space-y-2 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Syarat Capaian Milestone:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedBadge.milestoneRequirement}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Realisasi Saat Ini:</span>
                  <span className="font-mono font-bold text-teal-400">
                    {selectedBadge.unit === 'IDR'
                      ? formatIDR(selectedBadge.currentValue)
                      : `${selectedBadge.currentValue} / ${selectedBadge.targetValue} ${selectedBadge.unit}`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedBadge.isUnlocked
                        ? 'bg-emerald-400'
                        : 'bg-gradient-to-r from-amber-400 to-teal-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((selectedBadge.currentValue / (selectedBadge.targetValue || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Badge Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left">
                {selectedBadge.description}
              </p>

              {/* Sharia Philosophy Box */}
              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-left space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block">
                  Filosofi Maqasid Syariah & Dalil:
                </span>
                <p className="text-[11px] text-teal-200/90 italic leading-relaxed">
                  {selectedBadge.shariaPhilosophy}
                </p>
              </div>

              {/* Share & Action Buttons */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyShare(selectedBadge)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedBadgeId === selectedBadge.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Salin Teks Piagam</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleShareToTwitter(selectedBadge)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm border border-slate-700 cursor-pointer"
                    title="Bagikan ke X (Twitter)"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleShareToLinkedIn(selectedBadge)}
                    className="px-3.5 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    title="Bagikan ke LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.95 0-1.66.72-1.66 1.63 0 .92.71 1.64 1.66 1.64.96 0 1.67-.72 1.67-1.64 0-.91-.71-1.63-1.67-1.63z" />
                    </svg>
                  </button>
                </div>

                {!selectedBadge.isUnlocked && (
                  <button
                    onClick={() => {
                      const neededAmount = Math.max(
                        0,
                        selectedBadge.targetValue - selectedBadge.currentValue
                      );
                      setSelectedBadge(null);
                      if (onOpenDisburse) {
                        onOpenDisburse({
                          amount: selectedBadge.unit === 'IDR' ? neededAmount : 2500000,
                          program: selectedBadge.name,
                          notes: `Penyaluran Zakat untuk Membuka Lencana ${selectedBadge.name}`,
                        });
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>Salurkan Zakat untuk Membuka Lencana Ini</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
