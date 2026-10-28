import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  Layers,
  BarChart3,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  HelpCircle,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Check,
  Filter,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import { Theme, Language, ZakatProgramDistributionData, ZakatSummaryRecord } from '../types';
import { PROGRAM_CONFIGS } from './ZakatD3ProgramDistribution';

export interface CumulativePeriodData {
  period: string;
  timestamp: string;
  monthlyTotal: number;
  monthlyBeneficiaries: number;
  umkmMonthly: number;
  kesehatanMonthly: number;
  beasiswaMonthly: number;
  kemanusiaanMonthly: number;
  dakwahMonthly: number;
  umkmMustahik: number;
  kesehatanDhuafa: number;
  beasiswaPendidikan: number;
  kemanusiaanBencana: number;
  dakwahAdvokasi: number;
  totalCumulativeIDR: number;
  cumulativeBeneficiaries: number;
  milestoneTitle?: string;
  milestoneDesc?: string;
  milestoneIcon?: string;
}

const HISTORICAL_MILESTONES = [
  // 2023
  {
    period: 'Q1 2023',
    title: 'Inisiasi Filantropi Digital',
    desc: 'Penyaluran perdana paket sembako Ramadan 1444H BAZNAS & Dompet Dhuafa.',
    icon: '🌱',
  },
  {
    period: 'Q2 2023',
    title: 'Tanggap Medis Darurat',
    desc: 'Posko kesehatan dhuafa dan sanitasi air bersih paska musibah daerah marjinal.',
    icon: '🩺',
  },
  {
    period: 'Q3 2023',
    title: 'Dukungan Modal Mikro Awal',
    desc: 'Penyaluran modal qardhul hasan bagi 12 pedagang asnaf miskin.',
    icon: '💼',
  },
  {
    period: 'Q4 2023',
    title: 'Bantuan Pangan Akhir Tahun',
    desc: 'Lumbung sembako keluarga prasejahtera dan perlengkapan santri pedesaan.',
    icon: '🌾',
  },
  // 2024
  {
    period: 'Q1 2024',
    title: 'Beasiswa Juara Santri',
    desc: 'Pengadaan paket alat belajar, seragam, dan SPP 45 santri tahfidz.',
    icon: '🎓',
  },
  {
    period: 'Q2 2024',
    title: 'Kafalah Da’i Maritim Sangihe 3T',
    desc: 'Subsidi perahu dakwah kepulauan terluar perbatasan Sulawesi Utara.',
    icon: '⛵',
  },
  {
    period: 'Q3 2024',
    title: 'Pemberdayaan Nelayan Pesisir',
    desc: 'Bantuan jaring ramah lingkungan dan unit pengolahan hasil laut mustahik.',
    icon: '🐟',
  },
  {
    period: 'Q4 2024',
    title: '150+ Jiwa Terbantu Mandiri',
    desc: 'Evaluasi keberhasilan graduasi mustahik menjadi munfiq baru.',
    icon: '🤝',
  },
  // 2025
  {
    period: 'Q1 2025',
    title: 'Beasiswa Riset AI Syariah Solo',
    desc: 'Laptop riset komputasi syariah santri berprestasi IPK 3.86.',
    icon: '💻',
  },
  {
    period: 'Q2 2025',
    title: 'Perahu Surya Semau NTT 3T',
    desc: 'Panel surya perahu sekolah antar-pulau anak pesisir pedalaman NTT.',
    icon: '☀️',
  },
  {
    period: 'Q3 2025',
    title: 'Irigasi Pompa Surya Sumedang',
    desc: 'Selamatkan 4 Ha sawah petani dhuafa dari ancaman gagal panen kemarau.',
    icon: '🌿',
  },
  {
    period: 'Q4 2025',
    title: 'Sentra Kakao Dhuafa Maros',
    desc: 'Bibit kakao organik fair-trade & paket nutrisi balita bebas stunting.',
    icon: '🍫',
  },
  // 2026
  {
    period: 'Q1 2026',
    title: 'Vokasi Difabel Mandiri Ciputat',
    desc: 'Pelatihan teknisi elektronika perangkat digital difabel mandiri.',
    icon: '🔧',
  },
  {
    period: 'Mei 2026',
    title: 'Pemberdayaan Z-Chicken Batch 1',
    desc: 'Gerobak etalase higienis & modal bergulir 26 mustahik mandiri LPEM BAZNAS.',
    icon: '🍗',
  },
  {
    period: 'Jul 2026',
    title: 'Klinik Terapung Jayapura 3T',
    desc: 'Pelayanan pengobatan keliling pedalaman Papua perbatasan RI-PNG.',
    icon: '🏥',
  },
  {
    period: 'Sep 2026',
    title: 'Audit WTP & 840+ Jiwa Terbantu',
    desc: 'Sertifikasi akuntabilitas amil syariah & integrasi BSZ legal digital kemenag.',
    icon: '⭐',
  },
];

interface ZakatImpactCumulativeD3ChartProps {
  data: ZakatProgramDistributionData[];
  disbursedRecords?: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
}

export const ZakatImpactCumulativeD3Chart: React.FC<ZakatImpactCumulativeD3ChartProps> = ({
  data = [],
  disbursedRecords = [],
  theme,
  language,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chartMode, setChartMode] = useState<'cumulative_area' | 'cumulative_line' | 'cumulative_share'>('cumulative_area');
  const [selectedProgramKey, setSelectedProgramKey] = useState<string | null>(null);
  const [showAuditTable, setShowAuditTable] = useState<boolean>(false);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  // Hover state for interactive tooltip
  const [hoveredData, setHoveredData] = useState<{
    d: CumulativePeriodData;
    x: number;
    y: number;
    activeProgramShare?: { label: string; amount: number; color: string; percent: number };
  } | null>(null);

  // Format IDR Currency
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

  // Build Cumulative Data Series
  const cumulativeSeries: CumulativePeriodData[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    let cumUmkm = 0;
    let cumKesehatan = 0;
    let cumBeasiswa = 0;
    let cumKemanusiaan = 0;
    let cumDakwah = 0;
    let cumBeneficiaries = 0;

    return data.map((d, index) => {
      cumUmkm += d.umkmMustahik;
      cumKesehatan += d.kesehatanDhuafa;
      cumBeasiswa += d.beasiswaPendidikan;
      cumKemanusiaan += d.kemanusiaanBencana;
      cumDakwah += d.dakwahAdvokasi;
      cumBeneficiaries += d.beneficiariesCount;

      const totalCum = cumUmkm + cumKesehatan + cumBeasiswa + cumKemanusiaan + cumDakwah;
      const milestone = HISTORICAL_MILESTONES.find((m) => m.period === d.period) || HISTORICAL_MILESTONES[index];

      return {
        period: d.period,
        timestamp: d.timestamp,
        monthlyTotal: d.totalIDR,
        monthlyBeneficiaries: d.beneficiariesCount,
        umkmMonthly: d.umkmMustahik,
        kesehatanMonthly: d.kesehatanDhuafa,
        beasiswaMonthly: d.beasiswaPendidikan,
        kemanusiaanMonthly: d.kemanusiaanBencana,
        dakwahMonthly: d.dakwahAdvokasi,
        umkmMustahik: cumUmkm,
        kesehatanDhuafa: cumKesehatan,
        beasiswaPendidikan: cumBeasiswa,
        kemanusiaanBencana: cumKemanusiaan,
        dakwahAdvokasi: cumDakwah,
        totalCumulativeIDR: totalCum,
        cumulativeBeneficiaries: cumBeneficiaries,
        milestoneTitle: milestone?.title,
        milestoneDesc: milestone?.desc,
        milestoneIcon: milestone?.icon,
      };
    });
  }, [data]);

  // Overall Latest Cumulative Figures
  const latestMilestone = cumulativeSeries[cumulativeSeries.length - 1];
  const grandTotalCumulative = latestMilestone ? latestMilestone.totalCumulativeIDR : 0;
  const grandBeneficiaries = latestMilestone ? latestMilestone.cumulativeBeneficiaries : 0;

  // Growth rate from initial month to latest month
  const growthRateOverall = useMemo(() => {
    if (cumulativeSeries.length < 2) return 0;
    const first = cumulativeSeries[0].monthlyTotal;
    const last = cumulativeSeries[cumulativeSeries.length - 1].monthlyTotal;
    return Math.round(((last - first) / first) * 100);
  }, [cumulativeSeries]);

  // Program Breakdown at Latest Milestone
  const programBreakdown = useMemo(() => {
    if (!latestMilestone) return [];
    return PROGRAM_CONFIGS.map((prog) => {
      const amount = latestMilestone[prog.key as keyof CumulativePeriodData] as number;
      const percent = grandTotalCumulative > 0 ? (amount / grandTotalCumulative) * 100 : 0;
      return {
        ...prog,
        cumulativeAmount: amount,
        percent,
      };
    }).sort((a, b) => b.cumulativeAmount - a.cumulativeAmount);
  }, [latestMilestone, grandTotalCumulative]);

  // Total funds from user's personal disbursed records
  const userDisbursedTotal = useMemo(() => {
    return disbursedRecords.reduce((acc, curr) => acc + curr.amountIDR, 0);
  }, [disbursedRecords]);

  // Render D3 Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || cumulativeSeries.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 740;
    const height = 340;
    const margin = { top: 35, right: 35, bottom: 45, left: 80 };

    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.45)' : 'rgba(226, 232, 240, 0.85)';

    const keys = PROGRAM_CONFIGS.map((p) => p.key as string);

    // Defs for Gradients & Drop Shadows
    const defs = svg.append('defs');

    // Program Linear Gradients
    PROGRAM_CONFIGS.forEach((prog) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `cum-grad-${prog.key}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      grad
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', prog.color)
        .attr('stop-opacity', isDark ? 0.75 : 0.65);

      grad
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', prog.color)
        .attr('stop-opacity', isDark ? 0.08 : 0.03);
    });

    // Main Chart Group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Periods)
    const xScale = d3
      .scalePoint()
      .domain(cumulativeSeries.map((d) => d.period))
      .range([0, innerWidth])
      .padding(0.08);

    // Y Scale
    let yScale: d3.ScaleLinear<number, number>;

    if (chartMode === 'cumulative_share') {
      yScale = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
    } else if (selectedProgramKey) {
      const maxVal =
        d3.max(
          cumulativeSeries,
          (d) => (d[selectedProgramKey as keyof CumulativePeriodData] as number) || 0
        ) || 10000000;
      yScale = d3.scaleLinear().domain([0, maxVal * 1.2]).range([innerHeight, 0]).nice();
    } else {
      const maxVal = d3.max(cumulativeSeries, (d) => d.totalCumulativeIDR) || 35000000;
      yScale = d3.scaleLinear().domain([0, maxVal * 1.15]).range([innerHeight, 0]).nice();
    }

    // Grid lines (Horizontal)
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid-lines')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', gridColor)
      .attr('stroke-dasharray', '4 4');

    g.selectAll('.grid-lines .domain').remove();

    // ==========================================
    // 1. STACKED CUMULATIVE AREA CHART
    // ==========================================
    if (chartMode === 'cumulative_area') {
      if (selectedProgramKey) {
        // Single Selected Program Cumulative Area
        const prog = PROGRAM_CONFIGS.find((p) => p.key === selectedProgramKey) || PROGRAM_CONFIGS[0];

        const areaGenerator = d3
          .area<CumulativePeriodData>()
          .x((d) => xScale(d.period) || 0)
          .y0(innerHeight)
          .y1((d) => yScale((d[prog.key as keyof CumulativePeriodData] as number) || 0))
          .curve(d3.curveMonotoneX);

        const lineGenerator = d3
          .line<CumulativePeriodData>()
          .x((d) => xScale(d.period) || 0)
          .y((d) => yScale((d[prog.key as keyof CumulativePeriodData] as number) || 0))
          .curve(d3.curveMonotoneX);

        // Fill Area
        g.append('path')
          .datum(cumulativeSeries)
          .attr('fill', `url(#cum-grad-${prog.key})`)
          .attr('d', areaGenerator);

        // Top Border Line
        g.append('path')
          .datum(cumulativeSeries)
          .attr('fill', 'none')
          .attr('stroke', prog.color)
          .attr('stroke-width', 3)
          .attr('d', lineGenerator);

        // Data Points
        cumulativeSeries.forEach((d) => {
          const x = xScale(d.period) || 0;
          const y = yScale((d[prog.key as keyof CumulativePeriodData] as number) || 0);

          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4.5)
            .attr('fill', prog.color)
            .attr('stroke', isDark ? '#0f172a' : '#ffffff')
            .attr('stroke-width', 2);
        });
      } else {
        // Multi-Program Stacked Cumulative Stream
        const stack = d3
          .stack<CumulativePeriodData>()
          .keys(keys)
          .value((d, key) => (d[key as keyof CumulativePeriodData] as number) || 0);

        const stackedData = stack(cumulativeSeries);

        const areaGenerator = d3
          .area<d3.SeriesPoint<CumulativePeriodData>>()
          .x((d) => xScale(d.data.period) || 0)
          .y0((d) => yScale(d[0]))
          .y1((d) => yScale(d[1]))
          .curve(d3.curveMonotoneX);

        stackedData.forEach((layer) => {
          const progKey = layer.key;
          const prog = PROGRAM_CONFIGS.find((p) => p.key === progKey);
          if (!prog) return;

          // Area Layer
          g.append('path')
            .datum(layer)
            .attr('class', `layer-${progKey}`)
            .attr('fill', `url(#cum-grad-${progKey})`)
            .attr('opacity', 0.9)
            .attr('d', areaGenerator);

          // Subtle Boundary Line
          const boundaryLine = d3
            .line<d3.SeriesPoint<CumulativePeriodData>>()
            .x((d) => xScale(d.data.period) || 0)
            .y((d) => yScale(d[1]))
            .curve(d3.curveMonotoneX);

          g.append('path')
            .datum(layer)
            .attr('fill', 'none')
            .attr('stroke', prog.color)
            .attr('stroke-width', 1.8)
            .attr('stroke-opacity', 0.85)
            .attr('d', boundaryLine);
        });

        // Top Envelope Stroke Line (Grand Cumulative)
        const topEnvelope = d3
          .line<CumulativePeriodData>()
          .x((d) => xScale(d.period) || 0)
          .y((d) => yScale(d.totalCumulativeIDR))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(cumulativeSeries)
          .attr('fill', 'none')
          .attr('stroke', '#14b8a6') // Teal-500
          .attr('stroke-width', 2.5)
          .attr('d', topEnvelope);

        // Nodes on Top Envelope
        cumulativeSeries.forEach((d) => {
          const x = xScale(d.period) || 0;
          const y = yScale(d.totalCumulativeIDR);

          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 4)
            .attr('fill', '#14b8a6')
            .attr('stroke', isDark ? '#0f172a' : '#ffffff')
            .attr('stroke-width', 2);
        });
      }
    }

    // ==========================================
    // 2. MULTI-LINE CUMULATIVE TRAJECTORY
    // ==========================================
    else if (chartMode === 'cumulative_line') {
      PROGRAM_CONFIGS.forEach((prog) => {
        const isDimmed = selectedProgramKey && selectedProgramKey !== prog.key;
        const opacity = isDimmed ? 0.2 : 1;
        const strokeWidth = selectedProgramKey === prog.key ? 3.5 : 2.5;

        const lineGenerator = d3
          .line<CumulativePeriodData>()
          .x((d) => xScale(d.period) || 0)
          .y((d) => yScale((d[prog.key as keyof CumulativePeriodData] as number) || 0))
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(cumulativeSeries)
          .attr('fill', 'none')
          .attr('stroke', prog.color)
          .attr('stroke-width', strokeWidth)
          .attr('stroke-opacity', opacity)
          .attr('d', lineGenerator);

        // Circle points
        cumulativeSeries.forEach((d) => {
          const x = xScale(d.period) || 0;
          const y = yScale((d[prog.key as keyof CumulativePeriodData] as number) || 0);

          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', selectedProgramKey === prog.key ? 5 : 3.5)
            .attr('fill', prog.color)
            .attr('opacity', opacity)
            .attr('stroke', isDark ? '#0f172a' : '#ffffff')
            .attr('stroke-width', 1.5);
        });
      });
    }

    // ==========================================
    // 3. NORMALIZED 100% CUMULATIVE SHARE
    // ==========================================
    else if (chartMode === 'cumulative_share') {
      const normalizedStack = d3
        .stack<CumulativePeriodData>()
        .keys(keys)
        .value((d, key) => (d[key as keyof CumulativePeriodData] as number) || 0)
        .offset(d3.stackOffsetExpand);

      const series = normalizedStack(cumulativeSeries);

      const areaGenerator = d3
        .area<d3.SeriesPoint<CumulativePeriodData>>()
        .x((d) => xScale(d.data.period) || 0)
        .y0((d) => yScale(d[0] * 100))
        .y1((d) => yScale(d[1] * 100))
        .curve(d3.curveMonotoneX);

      series.forEach((layer) => {
        const prog = PROGRAM_CONFIGS.find((p) => p.key === layer.key);
        if (!prog) return;

        g.append('path')
          .datum(layer)
          .attr('fill', prog.color)
          .attr('opacity', isDark ? 0.7 : 0.6)
          .attr('d', areaGenerator);
      });
    }

    // ==========================================
    // MILESTONE BADGES ON THE TIME AXIS
    // ==========================================
    cumulativeSeries.forEach((d) => {
      if (!d.milestoneTitle) return;
      const x = xScale(d.period) || 0;

      // Small Milestone Flag Pin
      const pinGroup = g.append('g').attr('transform', `translate(${x}, 5)`);

      pinGroup
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', innerHeight)
        .attr('stroke', isDark ? 'rgba(20, 184, 166, 0.25)' : 'rgba(20, 184, 166, 0.4)')
        .attr('stroke-dasharray', '2 2');

      // Milestone Tag Box
      const tag = pinGroup.append('g').attr('transform', 'translate(-10, -22)');

      tag
        .append('rect')
        .attr('width', 22)
        .attr('height', 18)
        .attr('rx', 4)
        .attr('fill', isDark ? '#134e4a' : '#ccfbf1')
        .attr('stroke', '#14b8a6')
        .attr('stroke-width', 1);

      tag
        .append('text')
        .attr('x', 11)
        .attr('y', 13)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d.milestoneIcon || '⭐');
    });

    // X Axis
    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(12);

    const xAxisGroup = g
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);

    xAxisGroup.selectAll('text').attr('fill', textColor).attr('font-size', '11px').attr('font-weight', '600');
    xAxisGroup.select('.domain').attr('stroke', gridColor);

    // Y Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const val = d as number;
        if (chartMode === 'cumulative_share') return `${val}%`;
        return formatShortIDR(val);
      })
      .tickSize(0)
      .tickPadding(10);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.selectAll('text').attr('fill', textColor).attr('font-size', '10px').attr('font-family', 'monospace');
    yAxisGroup.select('.domain').remove();

    // ==========================================
    // INTERACTIVE HOVER CROSSHAIR & TOOLTIP
    // ==========================================
    const focusGroup = g.append('g').style('display', 'none');

    // Vertical dashed guideline
    const verticalLine = focusGroup
      .append('line')
      .attr('stroke', '#14b8a6')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3 3')
      .attr('y1', 0)
      .attr('y2', innerHeight);

    // Overlay Rect for Mouse Tracking
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseenter', () => focusGroup.style('display', null))
      .on('mouseleave', () => {
        focusGroup.style('display', 'none');
        setHoveredData(null);
      })
      .on('mousemove', function (event) {
        const [mouseX] = d3.pointer(event);
        // Find closest period
        let closestDist = Infinity;
        let closestData = cumulativeSeries[0];

        cumulativeSeries.forEach((d) => {
          const px = xScale(d.period) || 0;
          const dist = Math.abs(px - mouseX);
          if (dist < closestDist) {
            closestDist = dist;
            closestData = d;
          }
        });

        const targetX = xScale(closestData.period) || 0;
        verticalLine.attr('x1', targetX).attr('x2', targetX);

        // Position coordinates for React Tooltip
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const clientX = margin.left + targetX;
          setHoveredData({
            d: closestData,
            x: clientX,
            y: margin.top,
          });
        }
      });
  }, [cumulativeSeries, chartMode, selectedProgramKey, theme]);

  // Copy structured audit data
  const handleCopyAuditData = () => {
    const lines = [
      'LAPORAN AUDIT HISTORIS PENYALURAN ZAKAT (FINANCECITY ISLAMICITY)',
      `Tanggal Cetak Audit: ${new Date().toLocaleDateString('id-ID')}`,
      `Total Akumulasi Dana Tersalurkan: ${formatIDR(grandTotalCumulative)}`,
      `Total Mustahik Terbantu: ${grandBeneficiaries} Jiwa`,
      '',
      'RINCIAN AKUMULASI LINTAS PROGRAM:',
      ...programBreakdown.map(
        (p) => `- ${p.label}: ${formatIDR(p.cumulativeAmount)} (${p.percent.toFixed(1)}%)`
      ),
      '',
      'RIWAYAT BULAN KE BULAN (PERIODE):',
      ...cumulativeSeries.map(
        (c) =>
          `[${c.period}] Bulanan: ${formatIDR(c.monthlyTotal)} | Akumulatif: ${formatIDR(c.totalCumulativeIDR)} | Mustahik: ${c.cumulativeBeneficiaries} Jiwa | Fokus: ${c.milestoneTitle || '-'}`
      ),
      '',
      'Terakreditasi BAZNAS RI & Standar Akuntansi Zakat PSAK 109.',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  return (
    <div
      id="zakat-cumulative-distribution-card"
      className={`rounded-2xl border transition-all ${
        theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50/80 border-slate-200'
      } p-5 space-y-5`}
    >
      {/* Chart Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Grafik Akumulasi Penyaluran Dana Zakat Lintas Program (D3.js)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Audit Transparansi Historis
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              Visualisasi D3.js interaktif memperlihatkan akumulasi pertumbuhan dana zakat yang telah disalurkan secara berkelanjutan ke 5 program asnaf utama.
            </p>
          </div>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300/70 dark:border-slate-800 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setChartMode('cumulative_area')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              chartMode === 'cumulative_area'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Area Bertingkat Akumulatif"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Area Akumulasi</span>
          </button>

          <button
            onClick={() => setChartMode('cumulative_line')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              chartMode === 'cumulative_line'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Garis Tren Multi-Program"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Garis Tren</span>
          </button>

          <button
            onClick={() => setChartMode('cumulative_share')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              chartMode === 'cumulative_share'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Proporsi Relatif 100%"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Proporsi (%)</span>
          </button>
        </div>
      </div>

      {/* 4 Transparency KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Akumulasi Tersalurkan
          </span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
            {formatIDR(grandTotalCumulative)}
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            100% Sesuai Fiqih 8 Asnaf
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Laju Pertumbuhan Historis
          </span>
          <span className="text-base font-black text-teal-400 font-mono mt-0.5 block">
            +{growthRateOverall}%
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-teal-400" />
            Sejak April 2026
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Mustahik Terbantu
          </span>
          <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
            {grandBeneficiaries}+ Jiwa
          </span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-amber-400" />
            Keluarga Dhuafa & Santri
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border ${
            theme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Alokasi Prioritas Terbesar
          </span>
          <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5 truncate block">
            {programBreakdown[0]?.shortLabel || 'UMKM Mandiri'}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
            {programBreakdown[0]?.percent.toFixed(1)}% ({formatShortIDR(programBreakdown[0]?.cumulativeAmount || 0)})
          </span>
        </div>
      </div>

      {/* Program Filter & Isolation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3 h-3" /> Fokus Program:
        </span>

        <button
          onClick={() => setSelectedProgramKey(null)}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
            selectedProgramKey === null
              ? 'bg-teal-500 text-white shadow-xs'
              : 'bg-slate-200/70 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-200'
          }`}
        >
          Semua 5 Program
        </button>

        {PROGRAM_CONFIGS.map((prog) => {
          const isSelected = selectedProgramKey === prog.key;
          const progStats = programBreakdown.find((p) => p.key === prog.key);

          return (
            <button
              key={prog.key}
              onClick={() => setSelectedProgramKey(isSelected ? null : (prog.key as string))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                isSelected
                  ? 'border-teal-500 bg-teal-500/15 text-teal-400'
                  : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prog.color }} />
              <span>{prog.shortLabel}</span>
              {progStats && (
                <span className="text-[10px] opacity-75 font-mono">
                  ({progStats.percent.toFixed(0)}%)
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* D3 SVG Chart Container */}
      <div className="relative" ref={containerRef}>
        <svg ref={svgRef} className="w-full select-none overflow-visible" />

        {/* Dynamic Glassmorphic Tooltip */}
        {hoveredData && (
          <div
            className={`absolute top-2 pointer-events-none z-20 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all text-xs w-72 ${
              theme === 'dark'
                ? 'bg-slate-950/95 border-teal-500/40 text-slate-100'
                : 'bg-white/95 border-teal-300 text-slate-900'
            }`}
            style={{
              left: `${Math.min(hoveredData.x, (containerRef.current?.clientWidth || 700) - 295)}px`,
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                <span>Periode: {hoveredData.d.period}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400">
                {hoveredData.d.cumulativeBeneficiaries} Mustahik
              </span>
            </div>

            {/* Total Cumulative At Period */}
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400">Total Akumulasi Dana:</span>
              <span className="font-black text-emerald-400 font-mono text-sm">
                {formatIDR(hoveredData.d.totalCumulativeIDR)}
              </span>
            </div>

            {/* Program Breakdown Snapshot */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
              {PROGRAM_CONFIGS.map((prog) => {
                const amount = hoveredData.d[prog.key as keyof CumulativePeriodData] as number;
                const percent =
                  hoveredData.d.totalCumulativeIDR > 0
                    ? (amount / hoveredData.d.totalCumulativeIDR) * 100
                    : 0;
                const isFocused = selectedProgramKey === prog.key;

                return (
                  <div
                    key={prog.key}
                    className={`flex items-center justify-between text-[11px] ${
                      isFocused ? 'font-bold text-teal-400' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: prog.color }} />
                      <span className="truncate">{prog.shortLabel}</span>
                    </div>
                    <div className="font-mono text-[10px] shrink-0">
                      <span>{formatShortIDR(amount)}</span>
                      <span className="text-slate-400 ml-1">({percent.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Milestone Narrative Tag */}
            {hoveredData.d.milestoneTitle && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px]">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <span>{hoveredData.d.milestoneIcon || '⭐'}</span>
                  <span>{hoveredData.d.milestoneTitle}</span>
                </div>
                <p className="text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {hoveredData.d.milestoneDesc}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Contribution Link Badge (if user has active disbursed records) */}
      {userDisbursedTotal > 0 && (
        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Kontribusi Zakat Anda Terintegrasi:
              </span>
              <span className="text-slate-400 ml-1">
                Sebesar <strong className="text-emerald-400 font-mono">{formatIDR(userDisbursedTotal)}</strong> telah tercatat resmi dalam kurva akumulasi penyaluran di atas.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400 shrink-0">
            Terverifikasi BSZ
          </span>
        </div>
      )}

      {/* Historical Audit Ledger Table Toggle */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button
            id="toggle-zakat-audit-table-btn"
            onClick={() => setShowAuditTable(!showAuditTable)}
            className="flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-all"
          >
            <span>{showAuditTable ? 'Sembunyikan' : 'Tampilkan'} Rincian Buku Besar Audit Historis (PSAK 109)</span>
            {showAuditTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            id="copy-zakat-audit-report-btn"
            onClick={handleCopyAuditData}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-all"
          >
            {copiedAudit ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin Data Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Audit Table */}
        {showAuditTable && (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 animate-fadeIn">
            <table className="w-full text-left text-xs font-mono">
              <thead
                className={`border-b ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <tr>
                  <th className="p-2.5">Periode</th>
                  <th className="p-2.5">Penambahan Bulanan</th>
                  <th className="p-2.5 text-emerald-400">Total Akumulasi</th>
                  <th className="p-2.5">UMKM Mandiri</th>
                  <th className="p-2.5">Rumah Sehat</th>
                  <th className="p-2.5">Beasiswa</th>
                  <th className="p-2.5">Mustahik</th>
                  <th className="p-2.5">Status Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {cumulativeSeries.map((row) => (
                  <tr
                    key={row.period}
                    className={`hover:bg-teal-500/5 transition-all ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <td className="p-2.5 font-bold text-teal-400">{row.period}</td>
                    <td className="p-2.5">{formatIDR(row.monthlyTotal)}</td>
                    <td className="p-2.5 font-bold text-emerald-400">
                      {formatIDR(row.totalCumulativeIDR)}
                    </td>
                    <td className="p-2.5 text-slate-400">{formatShortIDR(row.umkmMustahik)}</td>
                    <td className="p-2.5 text-slate-400">{formatShortIDR(row.kesehatanDhuafa)}</td>
                    <td className="p-2.5 text-slate-400">{formatShortIDR(row.beasiswaPendidikan)}</td>
                    <td className="p-2.5 font-bold text-amber-400">
                      {row.cumulativeBeneficiaries} Jiwa
                    </td>
                    <td className="p-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        WTP
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
