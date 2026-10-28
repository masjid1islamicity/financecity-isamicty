import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Users,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Receipt,
  HeartHandshake,
} from 'lucide-react';
import { ZakatSummaryRecord, Language, Theme } from '../types';
import { formatRupiah, formatRupiahCompact } from '../utils/shariaWealthProjectionEngine';

interface MonthlyZakatDistributionChartProps {
  disbursedRecords: ZakatSummaryRecord[];
  theme: Theme;
  language: Language;
  onOpenDisburse?: () => void;
  onOpenReport?: () => void;
}

type ViewMode = 'total' | 'stacked' | 'impact';
type InstitutionFilter = 'ALL' | 'BAZNAS' | 'DOMPET_DHUAFA' | 'RUMAH_ZAKAT' | 'LAZIS';

interface MonthlyBucket {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // e.g. 'Okt 25'
  monthFull: string; // e.g. 'Oktober 2025'
  year: number;
  monthIndex: number; // 0-11
  totalAmountIDR: number;
  baznasAmountIDR: number;
  dompetDhuafaAmountIDR: number;
  rumahZakatAmountIDR: number;
  lazisAmountIDR: number;
  recordsCount: number;
  estimatedLivesImpacted: number;
  records: ZakatSummaryRecord[];
  isPeakMonth?: boolean;
  isCurrentMonth?: boolean;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export const MonthlyZakatDistributionChart: React.FC<MonthlyZakatDistributionChartProps> = ({
  disbursedRecords = [],
  theme,
  language,
  onOpenDisburse,
  onOpenReport,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('total');
  const [institutionFilter, setInstitutionFilter] = useState<InstitutionFilter>('ALL');
  const [showAverageLine, setShowAverageLine] = useState<boolean>(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

  // Generate the last 12 calendar months strictly ending at current month (or latest record date)
  const last12MonthsData = useMemo(() => {
    // Current reference date (October 2026 in app context)
    const referenceDate = new Date();
    // In case system time is not 2026, check latest record year to stay contextual
    const latestRecordYear = disbursedRecords.reduce((max, r) => {
      const year = parseInt(r.date.slice(0, 4), 10);
      return !isNaN(year) && year > max ? year : max;
    }, 2026);

    const refYear = Math.max(referenceDate.getFullYear(), latestRecordYear);
    const refMonth = referenceDate.getFullYear() === refYear ? referenceDate.getMonth() : 9; // October

    const buckets: MonthlyBucket[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(refYear, refMonth - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const monthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const monthLabel = `${MONTH_SHORT_ID[monthIdx]} '${String(year).slice(2)}`;
      const monthFull = `${MONTH_NAMES_ID[monthIdx]} ${year}`;

      buckets.push({
        monthKey,
        monthLabel,
        monthFull,
        year,
        monthIndex: monthIdx,
        totalAmountIDR: 0,
        baznasAmountIDR: 0,
        dompetDhuafaAmountIDR: 0,
        rumahZakatAmountIDR: 0,
        lazisAmountIDR: 0,
        recordsCount: 0,
        estimatedLivesImpacted: 0,
        records: [],
        isCurrentMonth: i === 0,
      });
    }

    // Populate each record into its corresponding bucket
    disbursedRecords.forEach((record) => {
      if (!record.date) return;
      const recMonthKey = record.date.slice(0, 7); // 'YYYY-MM'
      const bucket = buckets.find((b) => b.monthKey === recMonthKey);
      if (!bucket) return;

      const inst = (record.institution || '').toUpperCase();

      // Apply institution filter if active
      if (institutionFilter !== 'ALL') {
        if (institutionFilter === 'BAZNAS' && !inst.includes('BAZNAS')) return;
        if (institutionFilter === 'DOMPET_DHUAFA' && !inst.includes('DOMPET')) return;
        if (institutionFilter === 'RUMAH_ZAKAT' && !inst.includes('RUMAH')) return;
        if (institutionFilter === 'LAZIS' && !inst.includes('LAZIS')) return;
      }

      bucket.totalAmountIDR += record.amountIDR;
      bucket.recordsCount += 1;
      bucket.records.push(record);

      if (inst.includes('BAZNAS')) {
        bucket.baznasAmountIDR += record.amountIDR;
      } else if (inst.includes('DOMPET')) {
        bucket.dompetDhuafaAmountIDR += record.amountIDR;
      } else if (inst.includes('RUMAH')) {
        bucket.rumahZakatAmountIDR += record.amountIDR;
      } else {
        bucket.lazisAmountIDR += record.amountIDR;
      }
    });

    // Compute estimated lives (±1.250.000 IDR per family uplift)
    buckets.forEach((b) => {
      b.estimatedLivesImpacted = Math.round(b.totalAmountIDR / 1250000);
    });

    // Determine peak month
    const maxAmount = Math.max(...buckets.map((b) => b.totalAmountIDR), 0);
    if (maxAmount > 0) {
      buckets.forEach((b) => {
        if (b.totalAmountIDR === maxAmount) {
          b.isPeakMonth = true;
        }
      });
    }

    return buckets;
  }, [disbursedRecords, institutionFilter]);

  // Aggregate 12-Month Summary Statistics
  const stats = useMemo(() => {
    const totalDisbursed12M = last12MonthsData.reduce((acc, curr) => acc + curr.totalAmountIDR, 0);
    const totalTransactions12M = last12MonthsData.reduce((acc, curr) => acc + curr.recordsCount, 0);
    const activeMonthsCount = last12MonthsData.filter((b) => b.totalAmountIDR > 0).length;
    const averageMonthlyIDR = Math.round(totalDisbursed12M / 12);
    const peakBucket = last12MonthsData.find((b) => b.isPeakMonth) || last12MonthsData[0];
    const totalLivesImpacted12M = Math.round(totalDisbursed12M / 1250000);
    const consistencyRate = Math.round((activeMonthsCount / 12) * 100);

    return {
      totalDisbursed12M,
      totalTransactions12M,
      averageMonthlyIDR,
      activeMonthsCount,
      peakBucket,
      totalLivesImpacted12M,
      consistencyRate,
    };
  }, [last12MonthsData]);

  // Active Selected Month for detailed view
  const activeSelectedMonth = useMemo(() => {
    if (!selectedMonthKey) {
      // Default to peak month or latest active month
      const peak = last12MonthsData.find((b) => b.isPeakMonth && b.totalAmountIDR > 0);
      if (peak) return peak;
      const latestActive = [...last12MonthsData].reverse().find((b) => b.totalAmountIDR > 0);
      return latestActive || last12MonthsData[last12MonthsData.length - 1];
    }
    return last12MonthsData.find((b) => b.monthKey === selectedMonthKey) || last12MonthsData[0];
  }, [selectedMonthKey, last12MonthsData]);

  // Custom Recharts Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MonthlyBucket = payload[0].payload;

    return (
      <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900/95 shadow-xl text-xs backdrop-blur-md min-w-[220px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{data.monthFull}</span>
          </div>
          {data.isPeakMonth && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Puncak
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Penyaluran:</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">
              {formatRupiah(data.totalAmountIDR)}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Jumlah Transaksi:</span>
            <span className="font-semibold text-slate-200">{data.recordsCount} Penyaluran</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Dampak Mustahik:</span>
            <span className="font-semibold text-cyan-300">±{data.estimatedLivesImpacted} Keluarga</span>
          </div>

          {/* Institution Breakdown Mini Bar */}
          {data.totalAmountIDR > 0 && (
            <div className="pt-2 mt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
              <span className="text-slate-400 block font-semibold">Alokasi Lembaga:</span>
              {data.baznasAmountIDR > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>• BAZNAS RI:</span>
                  <span className="font-mono">{formatRupiahCompact(data.baznasAmountIDR)}</span>
                </div>
              )}
              {data.dompetDhuafaAmountIDR > 0 && (
                <div className="flex justify-between text-cyan-400">
                  <span>• Dompet Dhuafa:</span>
                  <span className="font-mono">{formatRupiahCompact(data.dompetDhuafaAmountIDR)}</span>
                </div>
              )}
              {data.rumahZakatAmountIDR > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>• Rumah Zakat:</span>
                  <span className="font-mono">{formatRupiahCompact(data.rumahZakatAmountIDR)}</span>
                </div>
              )}
              {data.lazisAmountIDR > 0 && (
                <div className="flex justify-between text-purple-400">
                  <span>• LAZIS Mitra:</span>
                  <span className="font-mono">{formatRupiahCompact(data.lazisAmountIDR)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      id="monthly-zakat-distribution-trends-chart"
      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-emerald-100 text-slate-800 shadow-xs'
      }`}
    >
      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Tren Penyaluran Zakat 12 Bulan Terakhir
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Visualisasi historis akumulasi distribusi Zakat Maal & Infaq bulanan yang disalurkan secara
            amanah ke lembaga amil terverifikasi (BAZNAS, Dompet Dhuafa, Rumah Zakat, LAZIS).
          </p>
        </div>

        {/* View Controls & CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'total'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Total Nominal
            </button>
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'stacked'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Per Lembaga
            </button>
            <button
              onClick={() => setViewMode('impact')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                viewMode === 'impact'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Dampak Jiwa
            </button>
          </div>

          {/* Toggle Average Line */}
          <button
            onClick={() => setShowAverageLine(!showAverageLine)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showAverageLine
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilkan garis rata-rata bulanan"
          >
            <span>Rata-rata</span>
          </button>
        </div>
      </div>

      {/* Key Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Total Salur (12 Bulan)
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-500 font-mono mt-0.5">
            {formatRupiahCompact(stats.totalDisbursed12M)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {stats.totalTransactions12M} transaksi resmi
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Rata-rata / Bulan
          </div>
          <div className="text-base sm:text-lg font-black text-teal-400 font-mono mt-0.5">
            {formatRupiah(stats.averageMonthlyIDR)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            ±{Math.round(stats.averageMonthlyIDR / 1250000)} mustahik/bln
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Bulan Puncak Salur
          </div>
          <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5 truncate">
            {stats.peakBucket.monthFull}
          </div>
          <div className="text-[10px] text-amber-300 font-mono mt-0.5">
            {formatRupiah(stats.peakBucket.totalAmountIDR)}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Konsistensi & Dampak
          </div>
          <div className="text-base sm:text-lg font-black text-cyan-300 font-mono mt-0.5">
            {stats.consistencyRate}% ({stats.activeMonthsCount}/12 Bln)
          </div>
          <div className="text-[10px] text-cyan-400 mt-0.5">
            ±{stats.totalLivesImpacted12M} Keluarga Terbantu
          </div>
        </div>
      </div>

      {/* Filter Tabs by Amil Institution */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            Lembaga:
          </span>
          {(['ALL', 'BAZNAS', 'DOMPET_DHUAFA', 'RUMAH_ZAKAT', 'LAZIS'] as InstitutionFilter[]).map((f) => {
            const isSelected = institutionFilter === f;
            const labelMap: Record<InstitutionFilter, string> = {
              ALL: 'Semua Lembaga',
              BAZNAS: 'BAZNAS RI',
              DOMPET_DHUAFA: 'Dompet Dhuafa',
              RUMAH_ZAKAT: 'Rumah Zakat',
              LAZIS: 'LAZIS Mitra',
            };
            return (
              <button
                key={f}
                onClick={() => setInstitutionFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {labelMap[f]}
              </button>
            );
          })}
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Klik batang bulan untuk melihat rincian tanda terima (BSZ)
        </span>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-72 sm:h-80 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={last12MonthsData}
            margin={{ top: 20, right: 10, left: 10, bottom: 25 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length) {
                const clickedBucket: MonthlyBucket = state.activePayload[0].payload;
                setSelectedMonthKey(clickedBucket.monthKey);
              }
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'}
            />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
              tick={{
                fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                fontSize: 11,
                fontWeight: 500,
              }}
              dy={10}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: theme === 'dark' ? '#334155' : '#cbd5e1' }}
              tickFormatter={(val) => {
                if (viewMode === 'impact') return `${val} Jiwa`;
                return formatRupiahCompact(val);
              }}
              tick={{
                fill: theme === 'dark' ? '#94a3b8' : '#64748b',
                fontSize: 10,
              }}
              width={75}
            />
            <Tooltip content={<CustomChartTooltip />} />

            {/* Average Monthly Reference Line */}
            {showAverageLine && viewMode !== 'impact' && (
              <ReferenceLine
                y={stats.averageMonthlyIDR}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Rata-rata: ${formatRupiahCompact(stats.averageMonthlyIDR)}`,
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'top',
                }}
              />
            )}

            {/* View Mode: Total Nominal */}
            {viewMode === 'total' && (
              <Bar
                dataKey="totalAmountIDR"
                name="Total Zakat Disalurkan"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
                className="cursor-pointer"
              >
                {last12MonthsData.map((entry) => {
                  const isSelected = activeSelectedMonth.monthKey === entry.monthKey;
                  let fillColor = '#10b981'; // default emerald
                  if (entry.isPeakMonth) fillColor = '#f59e0b'; // amber peak
                  if (entry.isCurrentMonth && !entry.isPeakMonth) fillColor = '#06b6d4'; // cyan current

                  return (
                    <Cell
                      key={`cell-${entry.monthKey}`}
                      fill={fillColor}
                      opacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#ffffff' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            )}

            {/* View Mode: Stacked by Institution */}
            {viewMode === 'stacked' && (
              <>
                <Bar
                  dataKey="baznasAmountIDR"
                  name="BAZNAS RI"
                  stackId="zakatStack"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={45}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="dompetDhuafaAmountIDR"
                  name="Dompet Dhuafa"
                  stackId="zakatStack"
                  fill="#06b6d4"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={45}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="rumahZakatAmountIDR"
                  name="Rumah Zakat"
                  stackId="zakatStack"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={45}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="lazisAmountIDR"
                  name="LAZIS Mitra"
                  stackId="zakatStack"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                  className="cursor-pointer"
                />
              </>
            )}

            {/* View Mode: Impact (Lives / Families Empowered) */}
            {viewMode === 'impact' && (
              <Bar
                dataKey="estimatedLivesImpacted"
                name="Keluarga Terbantu"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
                className="cursor-pointer"
              >
                {last12MonthsData.map((entry) => {
                  const isSelected = activeSelectedMonth.monthKey === entry.monthKey;
                  return (
                    <Cell
                      key={`cell-impact-${entry.monthKey}`}
                      fill={entry.isPeakMonth ? '#f59e0b' : '#06b6d4'}
                      opacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#ffffff' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 0}
                    />
                  );
                })}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Chart Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          {viewMode === 'stacked' ? (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>BAZNAS RI</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Dompet Dhuafa</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Rumah Zakat</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>LAZIS Mitra</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Distribusi Rutin</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
                <span>Puncak Musiman (Ramadan / Dzulhijjah)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                <span>Bulan Berjalan</span>
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenDisburse && (
            <button
              onClick={onOpenDisburse}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Salurkan Zakat Maal</span>
            </button>
          )}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1 transition-all"
            >
              <Receipt className="w-3.5 h-3.5 text-teal-400" />
              <span>Tanda Terima Resmi</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Month Drilldown Card */}
      {activeSelectedMonth && (
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">
                  Rincian Penyaluran: {activeSelectedMonth.monthFull}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {activeSelectedMonth.records.length > 0
                    ? `${activeSelectedMonth.records.length} transaksi zakat/infaq terdaftar`
                    : 'Tidak ada penyaluran pada bulan ini'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Total Disalurkan</span>
                <span className="font-black text-emerald-400 font-mono text-sm">
                  {formatRupiah(activeSelectedMonth.totalAmountIDR)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Dampak Mustahik</span>
                <span className="font-bold text-cyan-300 font-mono text-sm">
                  ±{activeSelectedMonth.estimatedLivesImpacted} Keluarga
                </span>
              </div>
            </div>
          </div>

          {/* List of Transactions in This Month */}
          {activeSelectedMonth.records.length > 0 ? (
            <div className="space-y-2">
              {activeSelectedMonth.records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:border-emerald-500/40 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-100">{rec.institutionName}</span>
                      <span className="px-2 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        BSZ: {rec.receiptNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="text-teal-400 font-medium">{rec.programTarget}</span>
                      <span>•</span>
                      <span>{rec.date}</span>
                    </div>
                    {rec.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">
                        &quot;{rec.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                    <span className="font-black text-emerald-400 font-mono text-sm">
                      {formatRupiah(rec.amountIDR)}
                    </span>
                    <span className="text-[10px] text-emerald-500/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Terverifikasi Blockchain</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              <p>Belum ada catatan penyaluran pada bulan {activeSelectedMonth.monthFull}.</p>
              {onOpenDisburse && (
                <button
                  onClick={onOpenDisburse}
                  className="mt-2 text-emerald-400 hover:text-emerald-300 font-semibold underline text-xs"
                >
                  Tunaikan zakat dari cadangan sekarang →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
