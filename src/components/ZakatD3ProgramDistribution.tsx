import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  Building2,
  Calendar,
  Filter,
  Info,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { Theme, Language, ZakatProgramDistributionData, ZakatSummaryRecord } from '../types';

interface ZakatD3ProgramDistributionProps {
  data?: ZakatProgramDistributionData[];
  disbursedRecords?: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
}

interface ProgramConfig {
  key: keyof Omit<ZakatProgramDistributionData, 'period' | 'timestamp' | 'totalIDR' | 'beneficiariesCount'>;
  label: string;
  shortLabel: string;
  color: string;
  darkColor: string;
  icon: string;
  asnafCategory: string;
  description: string;
}

export const PROGRAM_CONFIGS: ProgramConfig[] = [
  {
    key: 'umkmMustahik',
    label: 'Pemberdayaan UMKM Mustahik',
    shortLabel: 'UMKM Mandiri',
    color: '#10b981', // emerald-500
    darkColor: '#34d399',
    icon: '💼',
    asnafCategory: 'Fakir & Miskin (Produktif)',
    description: 'Bantuan modal usaha bergulir tanpa bunga, gerobak berkah, dan pendampingan bisnis mustahik.',
  },
  {
    key: 'kesehatanDhuafa',
    label: 'RS Rumah Sehat & Layanan Medis',
    shortLabel: 'Kesehatan Dhuafa',
    color: '#06b6d4', // cyan-500
    darkColor: '#22d3ee',
    icon: '🏥',
    asnafCategory: 'Fakir Miskin & Ibnu Sabil',
    description: 'Layanan rawat inap gratis dhuafa, obat-obatan, ambulans jenazah, dan gizi balita stunting.',
  },
  {
    key: 'beasiswaPendidikan',
    label: 'Beasiswa Cendekia & Pendidikan Santri',
    shortLabel: 'Pendidikan Santri',
    color: '#f59e0b', // amber-500
    darkColor: '#fbbf24',
    icon: '🎓',
    asnafCategory: 'Fi Sabilillah & Yatim Dhuafa',
    description: 'Biaya SPP, asrama santri tahfidz Quran, perlengkapan belajar, dan riset sains syariah.',
  },
  {
    key: 'kemanusiaanBencana',
    label: 'Logistik Sembako & Tanggap Darurat',
    shortLabel: 'Kemanusiaan',
    color: '#f43f5e', // rose-500
    darkColor: '#fb7185',
    icon: '📦',
    asnafCategory: 'Gharimin & Korban Bencana',
    description: 'Penyaluran sembako bulanan keluarga prasejahtera dan posko logistik dapur umum kebencanaan.',
  },
  {
    key: 'dakwahAdvokasi',
    label: 'Dakwah Komunitas Pedalaman & Syiar',
    shortLabel: 'Dakwah Pedalaman',
    color: '#8b5cf6', // violet-500
    darkColor: '#a78bfa',
    icon: '🕌',
    asnafCategory: 'Muallaf & Fi Sabilillah',
    description: 'Insentif guru ngaji daerah 3T (terdepan, terluar, tertinggal) dan pembinaan spiritual mualaf.',
  },
];

export const ZakatD3ProgramDistribution: React.FC<ZakatD3ProgramDistributionProps> = ({
  data = [],
  disbursedRecords = [],
  theme,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [chartType, setChartType] = useState<'area' | 'bar' | 'donut'>('area');
  const [activeProgramKey, setActiveProgramKey] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'ALL' | 'LAST_3' | 'LATEST'>('ALL');
  const [hoveredData, setHoveredData] = useState<{
    period: string;
    program?: ProgramConfig;
    amount: number;
    total: number;
    beneficiaries: number;
    allPrograms?: { label: string; amount: number; color: string; percent: number }[];
    x: number;
    y: number;
  } | null>(null);

  // Filter data based on timeRange
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeRange === 'LATEST') return data.slice(-1);
    if (timeRange === 'LAST_3') return data.slice(-3);
    return data;
  }, [data, timeRange]);

  // Aggregate overall metrics
  const totalAllDistributed = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.totalIDR, 0);
  }, [filteredData]);

  const totalBeneficiaries = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.beneficiariesCount, 0);
  }, [filteredData]);

  // Program totals across filtered periods
  const programTotals = React.useMemo(() => {
    const totals: Record<string, number> = {};
    PROGRAM_CONFIGS.forEach((p) => {
      totals[p.key] = filteredData.reduce((sum, item) => sum + (item[p.key] || 0), 0);
    });
    return totals;
  }, [filteredData]);

  const topProgram = React.useMemo(() => {
    let highestKey = PROGRAM_CONFIGS[0].key;
    let max = 0;
    Object.entries(programTotals).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        highestKey = k as any;
      }
    });
    return PROGRAM_CONFIGS.find((p) => p.key === highestKey) || PROGRAM_CONFIGS[0];
  }, [programTotals]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Render D3 Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const containerWidth = containerRef.current.clientWidth || 760;
    const height = chartType === 'donut' ? 360 : 320;
    const margin =
      chartType === 'donut'
        ? { top: 20, right: 20, bottom: 20, left: 20 }
        : { top: 25, right: 30, bottom: 45, left: 75 };

    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    const keys = PROGRAM_CONFIGS.map((p) => p.key);

    // ==========================================
    // 1. STACKED AREA CHART (STREAM OF ZAKAT)
    // ==========================================
    if (chartType === 'area') {
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // X Scale
      const xScale = d3
        .scalePoint()
        .domain(filteredData.map((d) => d.period))
        .range([0, innerWidth])
        .padding(0.1);

      // Y Scale (stacked max)
      const maxY = d3.max(filteredData, (d) => {
        if (activeProgramKey) {
          return (d[activeProgramKey as keyof ZakatProgramDistributionData] as number) * 1.25;
        }
        return d.totalIDR * 1.15;
      }) || 10000000;

      const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();

      // Add Gradients for Each Program
      const defs = svg.append('defs');
      PROGRAM_CONFIGS.forEach((prog) => {
        const grad = defs
          .append('linearGradient')
          .attr('id', `grad-${prog.key}`)
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
          .attr('stop-opacity', 0.05);
      });

      // Horizontal Grid Lines
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
        .attr('stroke-dasharray', '3 3');
      g.selectAll('.grid-lines .domain').remove();

      // Stack generator or single program
      if (!activeProgramKey) {
        const stack = d3.stack<ZakatProgramDistributionData>().keys(keys as string[]);
        const series = stack(filteredData);

        const areaGen = d3
          .area<d3.SeriesPoint<ZakatProgramDistributionData>>()
          .curve(d3.curveMonotoneX)
          .x((d) => xScale(d.data.period) || 0)
          .y0((d) => yScale(d[0]))
          .y1((d) => yScale(d[1]));

        // Render Stacked Areas
        g.selectAll('.program-area')
          .data(series)
          .enter()
          .append('path')
          .attr('class', 'program-area')
          .attr('d', areaGen)
          .attr('fill', (d) => `url(#grad-${d.key})`)
          .attr('stroke', (d) => {
            const cfg = PROGRAM_CONFIGS.find((p) => p.key === d.key);
            return cfg ? cfg.color : '#10b981';
          })
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .style('opacity', 0.9)
          .on('mouseover', function (event, d) {
            d3.select(this).style('opacity', 1).attr('stroke-width', 3);
          })
          .on('mouseout', function () {
            d3.select(this).style('opacity', 0.9).attr('stroke-width', 2);
          });

        // Add interactive hover overlay circles and vertical guide line
        const hoverLine = g
          .append('line')
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', isDark ? '#38bdf8' : '#0284c7')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4 4')
          .style('opacity', 0);

        // Invisible Voronoi/rect overlay for smooth mouse events across periods
        filteredData.forEach((d) => {
          const x = xScale(d.period) || 0;
          g.append('circle')
            .attr('cx', x)
            .attr('cy', yScale(d.totalIDR))
            .attr('r', 4.5)
            .attr('fill', '#10b981')
            .attr('stroke', isDark ? '#0f172a' : '#ffffff')
            .attr('stroke-width', 2);

          // Overlay column for pointer events
          g.append('rect')
            .attr('x', x - 25)
            .attr('y', 0)
            .attr('width', 50)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseenter', (event) => {
              hoverLine.attr('x1', x).attr('x2', x).style('opacity', 1);

              const allPrograms = PROGRAM_CONFIGS.map((cfg) => {
                const amt = (d[cfg.key] as number) || 0;
                return {
                  label: cfg.shortLabel,
                  amount: amt,
                  color: cfg.color,
                  percent: Math.round((amt / (d.totalIDR || 1)) * 100),
                };
              });

              const [mX, mY] = d3.pointer(event, svgRef.current);
              setHoveredData({
                period: d.period,
                amount: d.totalIDR,
                total: d.totalIDR,
                beneficiaries: d.beneficiariesCount,
                allPrograms,
                x: mX,
                y: mY,
              });
            })
            .on('mouseleave', () => {
              hoverLine.style('opacity', 0);
              setHoveredData(null);
            });
        });
      } else {
        // Single Isolated Program Area
        const cfg = PROGRAM_CONFIGS.find((p) => p.key === activeProgramKey)!;
        const lineGen = d3
          .line<ZakatProgramDistributionData>()
          .curve(d3.curveMonotoneX)
          .x((d) => xScale(d.period) || 0)
          .y((d) => yScale((d[cfg.key] as number) || 0));

        const areaGen = d3
          .area<ZakatProgramDistributionData>()
          .curve(d3.curveMonotoneX)
          .x((d) => xScale(d.period) || 0)
          .y0(innerHeight)
          .y1((d) => yScale((d[cfg.key] as number) || 0));

        g.append('path')
          .datum(filteredData)
          .attr('d', areaGen)
          .attr('fill', `url(#grad-${cfg.key})`)
          .style('opacity', 0.95);

        g.append('path')
          .datum(filteredData)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', cfg.color)
          .attr('stroke-width', 3);

        filteredData.forEach((d) => {
          const x = xScale(d.period) || 0;
          const y = yScale((d[cfg.key] as number) || 0);

          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 5)
            .attr('fill', cfg.color)
            .attr('stroke', isDark ? '#0f172a' : '#ffffff')
            .attr('stroke-width', 2);

          // Interaction rect
          g.append('rect')
            .attr('x', x - 30)
            .attr('y', 0)
            .attr('width', 60)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseenter', (event) => {
              const [mX, mY] = d3.pointer(event, svgRef.current);
              setHoveredData({
                period: d.period,
                program: cfg,
                amount: (d[cfg.key] as number) || 0,
                total: d.totalIDR,
                beneficiaries: Math.round(d.beneficiariesCount * 0.4),
                x: mX,
                y: mY,
              });
            })
            .on('mouseleave', () => setHoveredData(null));
        });
      }

      // Bottom X Axis
      const xAxis = d3.axisBottom(xScale);
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('dy', '1em');
      g.selectAll('.domain').attr('stroke', gridColor);
      g.selectAll('.tick line').attr('stroke', gridColor);

      // Left Y Axis
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => {
          const val = Number(d);
          if (val >= 1000000) return `${(val / 1000000).toFixed(1)} Jt`;
          if (val >= 1000) return `${(val / 1000).toFixed(0)} Rb`;
          return `${val}`;
        });

      g.append('g')
        .call(yAxis)
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', '10px')
        .attr('font-mono', 'true');
    }

    // ==========================================
    // 2. STACKED / GROUPED BAR CHART
    // ==========================================
    else if (chartType === 'bar') {
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const x0 = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.period))
        .range([0, innerWidth])
        .padding(0.3);

      const stack = d3.stack<ZakatProgramDistributionData>().keys(keys as string[]);
      const series = stack(filteredData);

      const maxY = d3.max(filteredData, (d) => d.totalIDR * 1.15) || 10000000;
      const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice();

      // Grid lines
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
        .attr('stroke-dasharray', '3 3');
      g.selectAll('.grid-lines .domain').remove();

      // Render Bar Groups
      series.forEach((layer) => {
        const progConfig = PROGRAM_CONFIGS.find((p) => p.key === layer.key)!;

        g.selectAll(`.bar-${layer.key}`)
          .data(layer)
          .enter()
          .append('rect')
          .attr('class', `bar-${layer.key}`)
          .attr('x', (d) => x0(d.data.period) || 0)
          .attr('y', (d) => yScale(d[1]))
          .attr('height', (d) => Math.max(0, yScale(d[0]) - yScale(d[1])))
          .attr('width', x0.bandwidth())
          .attr('fill', progConfig.color)
          .attr('rx', 3)
          .style('opacity', activeProgramKey && activeProgramKey !== layer.key ? 0.25 : 0.88)
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            d3.select(this).style('opacity', 1);
            const [mX, mY] = d3.pointer(event, svgRef.current);
            const amt = d[1] - d[0];
            setHoveredData({
              period: d.data.period,
              program: progConfig,
              amount: amt,
              total: d.data.totalIDR,
              beneficiaries: Math.round(d.data.beneficiariesCount * (amt / (d.data.totalIDR || 1))),
              x: mX,
              y: mY,
            });
          })
          .on('mouseout', function () {
            d3.select(this).style(
              'opacity',
              activeProgramKey && activeProgramKey !== layer.key ? 0.25 : 0.88
            );
            setHoveredData(null);
          });
      });

      // Total label on top of each bar
      filteredData.forEach((d) => {
        const xPos = (x0(d.period) || 0) + x0.bandwidth() / 2;
        const yPos = yScale(d.totalIDR) - 6;

        g.append('text')
          .attr('x', xPos)
          .attr('y', yPos)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .attr('fill', isDark ? '#38bdf8' : '#0284c7')
          .text(`${(d.totalIDR / 1000000).toFixed(1)}Jt`);
      });

      // Bottom X Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('dy', '1em');
      g.selectAll('.domain').attr('stroke', gridColor);

      // Left Y Axis
      g.append('g')
        .call(
          d3.axisLeft(yScale).ticks(5).tickFormat((d) => `${(Number(d) / 1000000).toFixed(1)} Jt`)
        )
        .selectAll('text')
        .attr('fill', textColor)
        .attr('font-size', '10px');
    }

    // ==========================================
    // 3. DONUT / PROPORTION CHART
    // ==========================================
    else if (chartType === 'donut') {
      const radius = Math.min(innerWidth, innerHeight) / 2 - 10;
      const g = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const pieData = PROGRAM_CONFIGS.map((cfg) => ({
        config: cfg,
        value: programTotals[cfg.key] || 0,
      }));

      const pie = d3
        .pie<{ config: ProgramConfig; value: number }>()
        .value((d) => d.value)
        .sort(null);

      const arc = d3
        .arc<d3.PieArcDatum<{ config: ProgramConfig; value: number }>>()
        .innerRadius(radius * 0.58)
        .outerRadius(radius * 0.88)
        .cornerRadius(4)
        .padAngle(0.03);

      const arcHover = d3
        .arc<d3.PieArcDatum<{ config: ProgramConfig; value: number }>>()
        .innerRadius(radius * 0.54)
        .outerRadius(radius * 0.94)
        .cornerRadius(6);

      const slices = g
        .selectAll('.donut-slice')
        .data(pie(pieData))
        .enter()
        .append('path')
        .attr('class', 'donut-slice')
        .attr('d', arc as any)
        .attr('fill', (d) => d.data.config.color)
        .style('opacity', (d) =>
          activeProgramKey && activeProgramKey !== d.data.config.key ? 0.3 : 0.9
        )
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', arcHover as any)
            .style('opacity', 1);

          const [mX, mY] = d3.pointer(event, svgRef.current);
          setHoveredData({
            period: 'Semua Periode',
            program: d.data.config,
            amount: d.data.value,
            total: totalAllDistributed,
            beneficiaries: Math.round(totalBeneficiaries * (d.data.value / (totalAllDistributed || 1))),
            x: mX,
            y: mY,
          });
        })
        .on('mouseleave', function (event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('d', arc as any)
            .style('opacity', activeProgramKey && activeProgramKey !== d.data.config.key ? 0.3 : 0.9);
          setHoveredData(null);
        });

      // Center Text Summary in Donut
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('fill', textColor)
        .text('TOTAL PENYALURAN');

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.9em')
        .attr('font-size', '15px')
        .attr('font-weight', '900')
        .attr('fill', isDark ? '#38bdf8' : '#0284c7')
        .text(formatIDR(totalAllDistributed));

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '2.5em')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .attr('fill', '#10b981')
        .text(`👥 ${totalBeneficiaries} Mustahik`);
    }
  }, [filteredData, chartType, activeProgramKey, theme, programTotals, totalAllDistributed, totalBeneficiaries]);

  return (
    <div
      ref={containerRef}
      id="zakat-d3-distribution-panel"
      className={`mt-4 rounded-xl border transition-all overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-950/80 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      {/* Header bar with controls */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
                Distribusi Dana Zakat Lintas Program Sosial (D3.js Time Series)
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-teal-500/15 text-teal-400 border border-teal-500/30">
                Interaktif & Dinamis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Visualisasi alokasi 5 pilar program sosial kemaslahatan umat dari waktu ke waktu berdasarkan ketentuan asnaf zakat.
            </p>
          </div>
        </div>

        {/* View Mode & Time Horizon Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Time range selector */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setTimeRange('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                timeRange === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua (6 Bln)
            </button>
            <button
              onClick={() => setTimeRange('LAST_3')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                timeRange === 'LAST_3'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              3 Bln Terakhir
            </button>
            <button
              onClick={() => setTimeRange('LATEST')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                timeRange === 'LATEST'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* D3 Chart Type Buttons */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              id="chart-type-area-btn"
              onClick={() => setChartType('area')}
              title="Stacked Area Chart"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                chartType === 'area'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aliran Area</span>
            </button>

            <button
              id="chart-type-bar-btn"
              onClick={() => setChartType('bar')}
              title="Stacked Bar Chart"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                chartType === 'bar'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Batang</span>
            </button>

            <button
              id="chart-type-donut-btn"
              onClick={() => setChartType('donut')}
              title="Donut Breakdown"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                chartType === 'donut'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Proporsi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Program Filter Chips / Legend */}
      <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter Program:
        </span>

        <button
          onClick={() => setActiveProgramKey(null)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
            activeProgramKey === null
              ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
          }`}
        >
          Semua Program ({PROGRAM_CONFIGS.length})
        </button>

        {PROGRAM_CONFIGS.map((prog) => {
          const isSelected = activeProgramKey === prog.key;
          const progTotal = programTotals[prog.key] || 0;
          const pct = Math.round((progTotal / (totalAllDistributed || 1)) * 100);

          return (
            <button
              key={prog.key}
              onClick={() => setActiveProgramKey(isSelected ? null : prog.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 border ${
                isSelected
                  ? 'border-transparent text-slate-950 font-black shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
              style={{
                backgroundColor: isSelected ? prog.color : 'transparent',
              }}
            >
              <span>{prog.icon}</span>
              <span>{prog.shortLabel}</span>
              <span
                className={`text-[10px] font-mono px-1 rounded ${
                  isSelected ? 'bg-slate-900/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main SVG Visualization Container */}
      <div className="relative p-3 sm:p-5">
        <svg ref={svgRef} className="w-full overflow-visible"></svg>

        {/* Floating Custom Tooltip */}
        {hoveredData && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-75 p-3 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-md text-xs w-64 -translate-x-1/2 -translate-y-full mt-[-10px]"
            style={{
              left: `${Math.min(Math.max(hoveredData.x, 140), (containerRef.current?.clientWidth || 700) - 140)}px`,
              top: `${Math.max(hoveredData.y, 40)}px`,
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {hoveredData.period}
              </span>
              <span className="text-[10px] text-slate-400">
                👥 {hoveredData.beneficiaries} Mustahik
              </span>
            </div>

            {hoveredData.program ? (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{hoveredData.program.icon}</span>
                  <div>
                    <span className="font-bold block text-slate-100">
                      {hoveredData.program.label}
                    </span>
                    <span className="text-[10px] text-teal-400 block font-mono">
                      Asnaf: {hoveredData.program.asnafCategory}
                    </span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Alokasi Zakat:</span>
                  <span className="font-black font-mono text-emerald-400">
                    {formatIDR(hoveredData.amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Porsi dari Total:</span>
                  <span className="font-bold text-slate-200">
                    {Math.round((hoveredData.amount / (hoveredData.total || 1)) * 100)}%
                  </span>
                </div>
              </div>
            ) : hoveredData.allPrograms ? (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rincian Alokasi Program:
                </div>
                {hoveredData.allPrograms.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.label}
                    </span>
                    <span className="font-mono text-slate-200">
                      {formatIDR(p.amount)} ({p.percent}%)
                    </span>
                  </div>
                ))}
                <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between font-bold text-xs">
                  <span className="text-teal-400">Total Periode:</span>
                  <span className="text-emerald-400 font-mono">
                    {formatIDR(hoveredData.amount)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Bottom Summary Metric Strip */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Total Dana Disalurkan
          </span>
          <span className="text-sm md:text-base font-black text-emerald-500 font-mono">
            {formatIDR(totalAllDistributed)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {filteredData.length} siklus penyaluran
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Pilar Terbesar ({topProgram.shortLabel})
          </span>
          <span className="text-sm md:text-base font-bold text-amber-500">
            {formatIDR(programTotals[topProgram.key] || 0)}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {Math.round(((programTotals[topProgram.key] || 0) / (totalAllDistributed || 1)) * 100)}% dari seluruh portofolio
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Estimasi Penerima Manfaat
          </span>
          <span className="text-sm md:text-base font-bold text-teal-400 flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalBeneficiaries} Mustahik</span>
          </span>
          <span className="text-[10px] text-slate-500 block">
            Tersebar di 18 provinsi Indonesia
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Mitra Amil Penyalur
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              BAZNAS RI
            </span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
              Dompet Dhuafa
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Audit Syariah WTP & BSZ Resmi
          </span>
        </div>
      </div>
    </div>
  );
};
