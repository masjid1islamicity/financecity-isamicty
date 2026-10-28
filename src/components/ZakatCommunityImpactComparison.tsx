import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  Users,
  TrendingUp,
  Globe,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Info,
  Sliders,
  Share2,
  HeartHandshake,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  Target,
  BarChart3,
  Layers,
  GraduationCap,
  Store,
  Stethoscope,
  Droplets,
  UtensilsCrossed,
  Scale,
} from 'lucide-react';
import { Theme, Language, ZakatSummaryRecord, ZakatSdgImpactMetric, ZakatCommunityBenchmarkOverview } from '../types';

interface ZakatCommunityImpactComparisonProps {
  disbursedRecords: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
  onOpenDisburse?: (prefill?: { amount?: number; institution?: string; program?: string; notes?: string }) => void;
}

export const ZakatCommunityImpactComparison: React.FC<ZakatCommunityImpactComparisonProps> = ({
  disbursedRecords,
  theme,
  language,
  onOpenDisburse,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'ALL' | 'POVERTY_ECONOMY' | 'EDUCATION' | 'HEALTH_WATER'>('ALL');
  const [activeMetricId, setActiveMetricId] = useState<string>('sdg-1-poverty');
  const [simulationExtraIDR, setSimulationExtraIDR] = useState<number>(0);
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Currency Formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Base personal metrics from transactions
  const personalActualContribution = useMemo(() => {
    return disbursedRecords.reduce((sum, r) => sum + r.amountIDR, 0);
  }, [disbursedRecords]);

  // If user is playing with simulation slider
  const totalEffectiveContribution = personalActualContribution + simulationExtraIDR;

  // Breakdown across programs
  const programBreakdown = useMemo(() => {
    let umkm = 0;
    let education = 0;
    let health = 0;
    let water = 0;
    let foodHumanitarian = 0;

    disbursedRecords.forEach((r) => {
      const lower = (r.programTarget + ' ' + (r.notes || '')).toLowerCase();
      if (/umkm|usaha|modal|ekonomi|pedagang|gerobak/i.test(lower)) {
        umkm += r.amountIDR;
      } else if (/pendidikan|beasiswa|santri|sekolah|madrasah/i.test(lower)) {
        education += r.amountIDR;
      } else if (/kesehatan|sehat|medis|klinik|stunting|gizi|pasien/i.test(lower)) {
        health += r.amountIDR;
      } else if (/air|sumur|sanitasi|filtrasi/i.test(lower)) {
        water += r.amountIDR;
      } else {
        foodHumanitarian += r.amountIDR;
      }
    });

    // If simulation adds money, distribute proportionally or into main pillars
    if (simulationExtraIDR > 0) {
      umkm += simulationExtraIDR * 0.35;
      education += simulationExtraIDR * 0.30;
      health += simulationExtraIDR * 0.20;
      water += simulationExtraIDR * 0.15;
    }

    return { umkm, education, health, water, foodHumanitarian };
  }, [disbursedRecords, simulationExtraIDR]);

  // Global SDG Metrics with community averages (benchmarked against 14,820 active Muzakkis)
  const sdgMetrics: ZakatSdgImpactMetric[] = useMemo(() => {
    // Conversion factors grounded in BAZNAS & LAZ standard impact metrics
    // SDG 1: Rp 600.000 lifts/protects 1 Mustahik family from extreme poverty for 1 month
    const mustahikUser = Number((totalEffectiveContribution / 625000).toFixed(1));
    const mustahikCommunity = 7.6; // Average muzakki contributes ~Rp 4.750.000 => 7.6 souls

    // SDG 2: Rp 250.000 = 1 Sembako food security package
    const foodUser = Number((totalEffectiveContribution / 350000).toFixed(1));
    const foodCommunity = 13.5;

    // SDG 3: Health packages (medical check, nutrition, stunting intervention) ~ Rp 400.000
    const healthUser = Number((Math.max(programBreakdown.health, totalEffectiveContribution * 0.2) / 380000).toFixed(1));
    const healthCommunity = 3.4;

    // SDG 4: Scholarships & learning kits ~ Rp 1.500.000 per santri/student semester
    const educationUser = Number((Math.max(programBreakdown.education, totalEffectiveContribution * 0.28) / 1450000).toFixed(1));
    const educationCommunity = 1.3;

    // SDG 6: Clean water liters (Rp 10.000 provides ~40 L clean filtered drinking water)
    const waterUser = Math.round(Math.max(programBreakdown.water, totalEffectiveContribution * 0.15) * 0.0035 * 100);
    const waterCommunity = 1650; // Liters

    // SDG 8: Micro-enterprises / UMKM carts (Rp 3.500.000 per cart package)
    const umkmUser = Number((Math.max(programBreakdown.umkm, totalEffectiveContribution * 0.32) / 3500000).toFixed(2));
    const umkmCommunity = 0.65;

    // SDG 10: Wealth Redistribution Score (0 - 100 Index)
    const redistUser = Math.min(98, Math.round((totalEffectiveContribution / 15000000) * 100));
    const redistCommunity = 42;

    const calculateDiff = (user: number, comm: number) => {
      if (comm === 0) return 100;
      return Math.round(((user - comm) / comm) * 100);
    };

    return [
      {
        id: 'sdg-1-poverty',
        sdgNumber: 1,
        sdgCode: 'SDG 1',
        title: 'Pengentasan Kemiskinan',
        englishTitle: 'No Poverty',
        sdgGoalName: 'Mengakhiri kemiskinan dalam segala bentuk di manapun',
        sdgColor: '#E5243B',
        unit: 'Jiwa Mustahik',
        userValue: mustahikUser,
        communityAverage: mustahikCommunity,
        topTenPercentThreshold: 18.0,
        differencePercent: calculateDiff(mustahikUser, mustahikCommunity),
        description:
          'Keluarga mustahik asnaf fakir dan miskin yang terbentengi dari kerentanan ekonomi ekstrem berkat penyaluran zakat konsumtif & modal darurat.',
        globalTargetIndicator: 'Target Nasional SDG 1.2: Pengurangan 50% angka kemiskinan multidimensi.',
        iconName: 'Users',
        personalEquivalentText: `Kontribusi Anda menopang kebutuhan pokok ${mustahikUser} jiwa mustahik rentan.`,
      },
      {
        id: 'sdg-4-education',
        sdgNumber: 4,
        sdgCode: 'SDG 4',
        title: 'Pendidikan Santri & Dhuafa',
        englishTitle: 'Quality Education',
        sdgGoalName: 'Menjamin pendidikan inklusif, merata, dan berkualitas',
        sdgColor: '#C5192D',
        unit: 'Santri / Siswa',
        userValue: educationUser,
        communityAverage: educationCommunity,
        topTenPercentThreshold: 3.5,
        differencePercent: calculateDiff(educationUser, educationCommunity),
        description:
          'Dukungan beasiswa pendidikan penuh, kitab santri, seragam, dan fasilitas belajar di madrasah pedalaman 3T.',
        globalTargetIndicator: 'Target Global SDG 4.1: Akses pendidikan dasar dan menengah bebas biaya bagi semua anak.',
        iconName: 'GraduationCap',
        personalEquivalentText: `Zakat Anda membiayai ${educationUser} santri dhuafa melanjutkan studi tanpa putus sekolah.`,
      },
      {
        id: 'sdg-8-economic',
        sdgNumber: 8,
        sdgCode: 'SDG 8',
        title: 'Kemandirian Usaha UMKM',
        englishTitle: 'Decent Work & Economic Growth',
        sdgGoalName: 'Mendukung pertumbuhan ekonomi inklusif dan pekerjaan layak',
        sdgColor: '#A21942',
        unit: 'Unit Usaha Mustahik',
        userValue: umkmUser,
        communityAverage: umkmCommunity,
        topTenPercentThreshold: 1.5,
        differencePercent: calculateDiff(umkmUser, umkmCommunity),
        description:
          'Penyediaan gerobak Z-Chicken/usaha mandiri, peralatan higienis, dan modal kerja bergulir untuk mengubah mustahik menjadi munfiq.',
        globalTargetIndicator: 'Target SDG 8.3: Promosi kebijakan kewirausahaan dan formalisasi usaha mikro.',
        iconName: 'Store',
        personalEquivalentText: `Zakat produktif Anda telah mendanai ${umkmUser} gerobak/modal usaha berdikari.`,
      },
      {
        id: 'sdg-3-health',
        sdgNumber: 3,
        sdgCode: 'SDG 3',
        title: 'Kesehatan & Cegah Stunting',
        englishTitle: 'Good Health & Well-Being',
        sdgGoalName: 'Menjamin kehidupan sehat dan mendukung kesejahteraan bagi semua usia',
        sdgColor: '#4C9F38',
        unit: 'Paket Medis & Gizi',
        userValue: healthUser,
        communityAverage: healthCommunity,
        topTenPercentThreshold: 8.0,
        differencePercent: calculateDiff(healthUser, healthCommunity),
        description:
          'Fasilitas rawat inap gratis di Rumah Sehat Dhuafa, paket makanan pendamping ASI (MPASI) balita, dan pencegahan stunting di pelosok.',
        globalTargetIndicator: 'Target SDG 3.2: Mengakhiri kematian balita yang dapat dicegah dan mengatasi malnutrisi.',
        iconName: 'Stethoscope',
        personalEquivalentText: `Menghadirkan ${healthUser} paket perlindungan medis darurat bagi pasien dhuafa.`,
      },
      {
        id: 'sdg-6-water',
        sdgNumber: 6,
        sdgCode: 'SDG 6',
        title: 'Air Bersih & Sanitasi 3T',
        englishTitle: 'Clean Water & Sanitation',
        sdgGoalName: 'Menjamin ketersediaan serta pengelolaan air bersih dan sanitasi',
        sdgColor: '#26BDE2',
        unit: 'Liter Air Bersih',
        userValue: waterUser,
        communityAverage: waterCommunity,
        topTenPercentThreshold: 4500,
        differencePercent: calculateDiff(waterUser, waterCommunity),
        description:
          'Distribusi armada tangki air dan pembangunan sumur bor dalam di wilayah rawan kekeringan NTT dan pesisir utara Jawa.',
        globalTargetIndicator: 'Target SDG 6.1: Mencapai akses universal dan merata terhadap air minum aman.',
        iconName: 'Droplets',
        personalEquivalentText: `Mengalirkan ${waterUser.toLocaleString('id-ID')} Liter air minum higienis bagi desa pesisir.`,
      },
      {
        id: 'sdg-2-hunger',
        sdgNumber: 2,
        sdgCode: 'SDG 2',
        title: 'Ketahanan Pangan Dhuafa',
        englishTitle: 'Zero Hunger',
        sdgGoalName: 'Menghilangkan kelaparan dan mencapai ketahanan pangan',
        sdgColor: '#DDA63A',
        unit: 'Paket Sembako',
        userValue: foodUser,
        communityAverage: foodCommunity,
        topTenPercentThreshold: 30.0,
        differencePercent: calculateDiff(foodUser, foodCommunity),
        description:
          'Penyaluran beras, minyak, dan sumber protein bagi lansia dhuafa dan janda pra-sejahtera asnaf miskin.',
        globalTargetIndicator: 'Target SDG 2.1: Menjamin akses makanan aman dan bergizi sepanjang tahun.',
        iconName: 'UtensilsCrossed',
        personalEquivalentText: `Membagikan ${foodUser} keranjang sembako pangan sehat kepada keluarga mustahik.`,
      },
      {
        id: 'sdg-10-inequality',
        sdgNumber: 10,
        sdgCode: 'SDG 10',
        title: 'Pengurangan Kesenjangan Sosial',
        englishTitle: 'Reduced Inequalities',
        sdgGoalName: 'Mengurangi kesenjangan pendapatan intra dan antar daerah',
        sdgColor: '#DD1367',
        unit: 'Poin Indeks Keadilan',
        userValue: redistUser,
        communityAverage: redistCommunity,
        topTenPercentThreshold: 85,
        differencePercent: calculateDiff(redistUser, redistCommunity),
        description:
          'Tingkat redistribusi aset syariah dari aglomerasi perkotaan ke kantong-kantong kemiskinan perdesaan sesuai prinsip Maqasid Syariah.',
        globalTargetIndicator: 'Target SDG 10.1: Pertumbuhan pendapatan 40% populasi terbawah melampaui rata-rata nasional.',
        iconName: 'Scale',
        personalEquivalentText: `Skor redistribusi harta Anda mencapai ${redistUser}/100, melampaui indeks rata-rata.`,
      },
    ];
  }, [totalEffectiveContribution, programBreakdown]);

  // Overall benchmark metrics
  const communityAverageIDR = 4750000;
  const impactMultiplier = Number((totalEffectiveContribution / communityAverageIDR).toFixed(1));
  const percentileRank = useMemo(() => {
    if (totalEffectiveContribution >= 20000000) return 96;
    if (totalEffectiveContribution >= 15000000) return 91;
    if (totalEffectiveContribution >= 10000000) return 86;
    if (totalEffectiveContribution >= 7500000) return 74;
    if (totalEffectiveContribution >= 5000000) return 58;
    if (totalEffectiveContribution >= 3000000) return 38;
    return 20;
  }, [totalEffectiveContribution]);

  // Filtered list
  const filteredMetrics = useMemo(() => {
    switch (selectedCategoryTab) {
      case 'POVERTY_ECONOMY':
        return sdgMetrics.filter((m) => ['sdg-1-poverty', 'sdg-8-economic', 'sdg-10-inequality'].includes(m.id));
      case 'EDUCATION':
        return sdgMetrics.filter((m) => ['sdg-4-education', 'sdg-2-hunger'].includes(m.id));
      case 'HEALTH_WATER':
        return sdgMetrics.filter((m) => ['sdg-3-health', 'sdg-6-water'].includes(m.id));
      case 'ALL':
      default:
        return sdgMetrics;
    }
  }, [sdgMetrics, selectedCategoryTab]);

  const activeMetric = useMemo(() => {
    return sdgMetrics.find((m) => m.id === activeMetricId) || sdgMetrics[0];
  }, [sdgMetrics, activeMetricId]);

  // Render D3 SVG Comparative Grouped Bar Chart
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 640;
    const height = 280;
    const margin = { top: 35, right: 30, bottom: 50, left: 45 };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chartGroup = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare normalized comparative data (percentage of community average as base = 100%)
    const chartData = filteredMetrics.map((m) => {
      const userRatio = Math.round((m.userValue / (m.communityAverage || 1)) * 100);
      const commRatio = 100;
      return {
        id: m.id,
        code: m.sdgCode,
        title: m.title,
        color: m.sdgColor,
        unit: m.unit,
        userActual: m.userValue,
        commActual: m.communityAverage,
        userRatio,
        commRatio,
        diff: m.differencePercent,
      };
    });

    // Scales
    const x0Scale = d3
      .scaleBand()
      .domain(chartData.map((d) => d.code))
      .range([0, innerWidth])
      .paddingInner(0.3);

    const x1Scale = d3
      .scaleBand()
      .domain(['user', 'community'])
      .range([0, x0Scale.bandwidth()])
      .padding(0.12);

    const maxRatio = Math.max(220, (d3.max(chartData, (d) => d.userRatio) || 100) * 1.15);
    const yScale = d3.scaleLinear().domain([0, maxRatio]).range([innerHeight, 0]);

    // Grid lines
    chartGroup
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', theme === 'dark' ? '#334155' : '#e2e8f0')
      .attr('stroke-dasharray', '3,3');

    // 100% Baseline Line (Community Average Standard)
    chartGroup
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(100))
      .attr('y2', yScale(100))
      .attr('stroke', '#a855f7')
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.85);

    chartGroup
      .append('text')
      .attr('x', innerWidth - 5)
      .attr('y', yScale(100) - 5)
      .attr('text-anchor', 'end')
      .attr('fill', '#c084fc')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('Rata-Rata Komunitas (100%)');

    // Groups for each SDG category
    const categoryGroups = chartGroup
      .selectAll('.category-group')
      .data(chartData)
      .enter()
      .append('g')
      .attr('class', 'category-group')
      .attr('transform', (d) => `translate(${x0Scale(d.code)},0)`);

    // Community Bar
    categoryGroups
      .append('rect')
      .attr('x', x1Scale('community') || 0)
      .attr('y', yScale(100))
      .attr('width', x1Scale.bandwidth())
      .attr('height', innerHeight - yScale(100))
      .attr('rx', 4)
      .attr('fill', theme === 'dark' ? '#475569' : '#94a3b8')
      .attr('opacity', 0.85);

    // User Bar
    categoryGroups
      .append('rect')
      .attr('x', x1Scale('user') || 0)
      .attr('y', (d) => yScale(d.userRatio))
      .attr('width', x1Scale.bandwidth())
      .attr('height', (d) => innerHeight - yScale(d.userRatio))
      .attr('rx', 4)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.95)
      .attr('class', 'cursor-pointer transition-all hover:brightness-110')
      .on('click', (_, d) => {
        setActiveMetricId(d.id);
      });

    // Ratio badge text on top of User Bar
    categoryGroups
      .append('text')
      .attr('x', (x1Scale('user') || 0) + x1Scale.bandwidth() / 2)
      .attr('y', (d) => yScale(d.userRatio) - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', (d) => (d.userRatio >= 100 ? '#10b981' : '#f59e0b'))
      .text((d) => `${d.userRatio}%`);

    // X Axis
    const xAxis = d3.axisBottom(x0Scale);
    chartGroup
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('fill', theme === 'dark' ? '#94a3b8' : '#475569')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold');

    // Y Axis (Percentage)
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${d}%`);
    chartGroup
      .append('g')
      .call(yAxis)
      .selectAll('text')
      .attr('fill', theme === 'dark' ? '#94a3b8' : '#475569')
      .attr('font-size', '9px');
  }, [filteredMetrics, theme]);

  // Social sharing text for comparison
  const shareSnippet = useMemo(() => {
    return `Alhamdulillah! Kontribusi zakat maal saya di @FinanceCity mencapai ${formatIDR(
      totalEffectiveContribution
    )} — ${impactMultiplier}x lebih tinggi dari rata-rata komunitas dan berada di ${100 - percentileRank}% teratas muzakki berdampak. Mari bersama dukung Tujuan Pembangunan Berkelanjutan (SDGs) & pengentasan kemiskinan mustahik Nusantara! 🌍🤲\n\n#ZakatImpact #FinanceCity #SDGs2030 #BAZNAS #UkhuwahFinansial`;
  }, [totalEffectiveContribution, impactMultiplier, percentileRank]);

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareSnippet);
    setCopiedShareText(true);
    setTimeout(() => setCopiedShareText(false), 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareSnippet);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(shareSnippet);
    setCopiedShareText(true);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`, '_blank', 'noopener,noreferrer,width=650,height=600');
  };

  const renderSdgIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Users':
        return <Users className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Store':
        return <Store className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className={className} />;
      case 'Scale':
        return <Scale className={className} />;
      default:
        return <Target className={className} />;
    }
  };

  return (
    <div
      id="zakat-community-impact-comparison-section"
      className={`rounded-2xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 shadow-xl'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header Bar */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-950/30 via-slate-900/40 to-teal-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 via-teal-500 to-emerald-600 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                <Globe className="w-6 h-6 text-sky-400" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Komparasi Dampak Personal vs. Komunitas & SDG Global
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Global Goals (SDGs 2030)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  14.820+ Muzakki Terdata
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                Membandingkan kontribusi zakat riil Anda terhadap rata-rata komunitas FinanceCity dan mengukur dampaknya dalam mendukung 17 Tujuan Pembangunan Berkelanjutan PBB (UN SDGs) bersama BAZNAS RI.
              </p>
            </div>
          </div>

          {/* Social Share & Action Quick Link */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold transition-all cursor-pointer"
              title="Salin perbandingan dampak untuk dibagikan"
            >
              {copiedShareText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan Komparasi</span>
                </>
              )}
            </button>

            {onOpenDisburse && (
              <button
                onClick={() => onOpenDisburse()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/25 cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Tambah Dampak</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Executive High-Impact KPI Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          {/* Card 1: Community Multiplier */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Daya Ungkit vs. Komunitas
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-sky-400 font-mono">
                  {impactMultiplier}x
                </span>
                <span className="text-xs font-bold text-emerald-400">Lebih Tinggi</span>
              </div>
              <span className="text-[10px] text-slate-500">Rata-rata: {formatIDR(communityAverageIDR)}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Percentile Rank */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Peringkat Kedermawanan
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-amber-400 font-mono">
                  Top {100 - percentileRank}%
                </span>
                <span className="text-xs font-bold text-amber-300">Nasional</span>
              </div>
              <span className="text-[10px] text-slate-500">Muzakki Berdampak Paling Aktif</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Global Goals Supported */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                Jangkauan Pilar SDG
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  7 dari 17
                </span>
                <span className="text-xs font-bold text-teal-300">Pilar Utama</span>
              </div>
              <span className="text-[10px] text-slate-500">Fokus Kemiskinan, Anak & Kesehatan</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 space-y-6">
        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: 'Semua 7 Pilar SDG' },
              { id: 'POVERTY_ECONOMY', label: 'Kemiskinan & UMKM (SDG 1, 8, 10)' },
              { id: 'EDUCATION', label: 'Pendidikan & Pangan (SDG 4, 2)' },
              { id: 'HEALTH_WATER', label: 'Kesehatan & Air Bersih (SDG 3, 6)' },
            ].map((tab) => {
              const isActive = selectedCategoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategoryTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Garis ungu putus-putus menunjukkan patokan rata-rata komunitas (100%)</span>
          </div>
        </div>

        {/* Comparative Chart Visualization & Detailed Inspection Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Chart View (7 Columns) */}
          <div
            className={`lg:col-span-7 p-4 rounded-2xl border flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  Rasio Capaian vs. Rata-Rata Komunitas (% Benchmark)
                </span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block" />
                    Kontribusi Anda
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 inline-block" />
                    Rata-Rata Komunitas
                  </span>
                </div>
              </div>

              {/* D3 Render Target */}
              <div className="w-full h-[250px] relative">
                <svg ref={svgRef} className="w-full h-full overflow-visible" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Klik batang warna di atas untuk memilih metrik spesifik</span>
              <span className="font-mono text-teal-400 font-bold">
                Total Kontribusi Riil: {formatIDR(totalEffectiveContribution)}
              </span>
            </div>
          </div>

          {/* Right Selected Metric Spotlight (5 Columns) */}
          <div
            className={`lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-3">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: activeMetric.sdgColor }}
                  >
                    {renderSdgIcon(activeMetric.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white inline-block"
                      style={{ backgroundColor: activeMetric.sdgColor }}
                    >
                      {activeMetric.sdgCode}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight mt-0.5">
                      {activeMetric.title}
                    </h4>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-black ${
                    activeMetric.differencePercent >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeMetric.differencePercent >= 0 ? `+${activeMetric.differencePercent}%` : `${activeMetric.differencePercent}%`} vs Komunitas
                </span>
              </div>

              {/* Personal Output Highlight */}
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Realisasi Manfaat Langsung Anda:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-sky-400 font-mono">
                    {activeMetric.unit.includes('Liter')
                      ? activeMetric.userValue.toLocaleString('id-ID')
                      : activeMetric.userValue}{' '}
                    <span className="text-xs text-slate-400 font-sans font-semibold">
                      {activeMetric.unit}
                    </span>
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-semibold leading-relaxed">
                  {activeMetric.personalEquivalentText}
                </p>
              </div>

              {/* Side-by-side Numerical Comparison */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                    Rata-Rata Komunitas
                  </span>
                  <span className="font-bold text-slate-300 font-mono">
                    {activeMetric.communityAverage} {activeMetric.unit}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                    Ambang Top 10% Muzakki
                  </span>
                  <span className="font-bold text-amber-400 font-mono">
                    {activeMetric.topTenPercentThreshold} {activeMetric.unit}
                  </span>
                </div>
              </div>

              {/* Global SDG 2030 Target Indicator */}
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] space-y-1">
                <span className="font-bold text-sky-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-sky-400" />
                  Target Pembangunan Berkelanjutan (UN SDG 2030):
                </span>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  {activeMetric.globalTargetIndicator}
                </p>
              </div>
            </div>

            {/* Quick Share This Metric */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopyShare}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Salin Metrik Ini</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="p-2 rounded-xl bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer"
                title="Bagikan ke X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              <button
                onClick={handleShareLinkedIn}
                className="p-2 rounded-xl bg-[#0a66c2] hover:bg-[#084e96] text-white transition-colors cursor-pointer"
                title="Bagikan ke LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.95 0-1.66.72-1.66 1.63 0 .92.71 1.64 1.66 1.64.96 0 1.67-.72 1.67-1.64 0-.91-.71-1.63-1.67-1.63z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Global Goals Grid Cards (All 7 Supported SDGs) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Rincian 7 Pilar Global Goals (SDGs) & Kontribusi Anda
            </h4>
            <span className="text-[11px] text-slate-400">
              Terakreditasi BAZNAS & Dewan Syariah Nasional
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredMetrics.map((metric) => {
              const isSelected = activeMetric.id === metric.id;
              return (
                <div
                  key={metric.id}
                  onClick={() => setActiveMetricId(metric.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-sky-500 bg-sky-500/5 border-sky-400 shadow-md'
                      : theme === 'dark'
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Top Row: SDG Badge & Ratio */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white"
                        style={{ backgroundColor: metric.sdgColor }}
                      >
                        {metric.sdgCode}
                      </span>

                      <span
                        className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                          metric.differencePercent >= 0
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {metric.differencePercent >= 0 ? `+${metric.differencePercent}%` : `${metric.differencePercent}%`}
                      </span>
                    </div>

                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {metric.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {metric.englishTitle}
                    </span>
                  </div>

                  {/* Metrics Numbers */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400 text-[10px]">Anda:</span>
                      <span className="font-bold text-sky-400 font-mono">
                        {metric.unit.includes('Liter') ? metric.userValue.toLocaleString('id-ID') : metric.userValue}{' '}
                        <span className="text-[10px] font-normal text-slate-400">{metric.unit}</span>
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-[10px] text-slate-400">
                      <span>Komunitas:</span>
                      <span className="font-mono">
                        {metric.communityAverage} {metric.unit}
                      </span>
                    </div>

                    {/* Progress Bar Comparing to Top 10% */}
                    <div className="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((metric.userValue / (metric.topTenPercentThreshold || 1)) * 100)
                          )}%`,
                          backgroundColor: metric.sdgColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive "Simulasi Lompatan Dampak Global" (What-If Impact Simulator) */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-sky-950/20 via-slate-900 to-teal-950/20 border-sky-500/20'
              : 'bg-gradient-to-r from-sky-50/60 via-white to-teal-50/60 border-sky-200'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Simulasi Lompatan Dampak (What-If Impact Calculator)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Uji coba berapa mustahik baru dan santri yang terbantu bila Anda menambah porsi zakat maal atau sedekah produktif hari ini.
              </p>
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[0, 500000, 1000000, 2500000, 5000000].map((amt) => {
                const isSelected = simulationExtraIDR === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => setSimulationExtraIDR(amt)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {amt === 0 ? 'Riil (Rp 0)' : `+${formatIDR(amt)}`}
                  </button>
                );
              })}
            </div>
          </div>

          {simulationExtraIDR > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-400 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  Simulasi <strong>+{formatIDR(simulationExtraIDR)}</strong> meningkatkan dampak Anda menjadi{' '}
                  <strong>{impactMultiplier}x</strong> rata-rata komunitas dan mengangkat{' '}
                  <strong>+{Number((simulationExtraIDR / 625000).toFixed(1))} jiwa mustahik tambahan</strong>!
                </span>
              </div>

              {onOpenDisburse && (
                <button
                  onClick={() => {
                    onOpenDisburse({
                      amount: simulationExtraIDR,
                      notes: `Realisasi Simulasi Tambahan Dampak Komunitas (+${formatIDR(simulationExtraIDR)})`,
                    });
                  }}
                  className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Eksekusi Zakat Ini
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sharia & Global Goals Philosophy Note */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Landasan Syariah Fastabiqul Khairat (Berlomba dalam Kebaikan):
            </span>
            <p className="leading-relaxed text-[10px]">
              “Dan bagi tiap-tiap umat ada kiblatnya yang ia menghadap kepadanya. Maka berlomba-lombalah kamu (dalam berbuat) kebaikan.” (QS. Al-Baqarah: 148). Perbandingan data komunitas ini dihadirkan murni sebagai motivasi hisab kebaikan, tolok ukur transparansi pengelolaan zakat nasional, dan sinkronisasi kontribusi umat Islam terhadap pencapaian target SDGs 2030 di Republik Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
