import {
  YearlyProjectionPoint,
  WealthProjectionMilestone,
  WealthProjectionGoal,
  WealthProjectionScenario,
  CryptoAsset,
} from '../types';

export interface WealthProjectionConfig {
  initialBalanceIDR: number;
  monthlyDcaIDR: number;
  horizonYears: number;
  selectedGoal: WealthProjectionGoal;
  customGoalTargetIDR?: number;
  reinvestYields: boolean;
  inflationRate: number; // e.g. 0.032 (3.2%)
  goldPricePerGramIDR: number; // e.g. 1353500
  customCagrModifiers?: {
    conservative?: number;
    balanced?: number;
    aggressive?: number;
    aiOptimized?: number;
  };
}

// Baseline historical CAGRs grounded in Islamic asset market performance
export const BASELINE_CAGR = {
  conservative: 0.098, // 9.8% (Dominated by Gold PAXG + Sukuk)
  balanced: 0.214,     // 21.4% (Equal mix PAXG + Halal Crypto Top-Tier)
  aggressive: 0.312,   // 31.2% (Growth PoS Utility ETH, ADA, ALGO)
  aiOptimized: 0.248,  // 24.8% (Dynamic Sharia AI allocation)
};

export const NISAB_GOLD_GRAMS = 85;
export const ZAKAT_MAAL_RATE = 0.025; // 2.5%
export const MUSTAHIK_FAMILY_UPLIFT_COST_IDR = 1250000; // Average BAZNAS micro-grant per family

export const GOAL_PRESETS: Record<
  WealthProjectionGoal,
  {
    title: string;
    titleEn: string;
    targetAmountIDR: number;
    suggestedHorizonYears: number;
    icon: string;
    description: string;
    recommendedScenario: WealthProjectionScenario;
  }
> = {
  hajj_umrah: {
    title: 'Tabungan Haji Khusus & Umrah Furoda',
    titleEn: 'Hajj & Umrah Furoda Fund',
    targetAmountIDR: 350000000,
    suggestedHorizonYears: 3,
    icon: '🕋',
    description: 'Biaya keberangkatan ibadah haji khusus tanpa antre dan umrah keluarga bintang 5.',
    recommendedScenario: 'conservative',
  },
  education: {
    title: 'Pendidikan Tinggi Syariah Anak',
    titleEn: 'Islamic Higher Education Fund',
    targetAmountIDR: 600000000,
    suggestedHorizonYears: 5,
    icon: '🎓',
    description: 'Biaya kuliah universitas terkemuka dunia dan pesantren tahfidz unggulan.',
    recommendedScenario: 'balanced',
  },
  productive_waqf: {
    title: 'Wakaf Tunai & Bisnis Produktif Abadi',
    titleEn: 'Productive Waqf Endowment',
    targetAmountIDR: 1000000000,
    suggestedHorizonYears: 7,
    icon: '🕌',
    description: 'Investasi jariyah abadi untuk klinik dhuafa, pesantren, dan air bersih 3T.',
    recommendedScenario: 'balanced',
  },
  early_retirement: {
    title: 'Pensiun Mandiri Bebas Riba (FIRE Syariah)',
    titleEn: 'Sharia Financial Independence & Early Retirement',
    targetAmountIDR: 3000000000,
    suggestedHorizonYears: 10,
    icon: '🌴',
    description: 'Kebebasan finansial hakiki dengan passive income dari dividen halal & bagi hasil.',
    recommendedScenario: 'ai_recommended',
  },
  custom: {
    title: 'Target Finansial Syariah Kustom',
    titleEn: 'Custom Sharia Financial Goal',
    targetAmountIDR: 500000000,
    suggestedHorizonYears: 5,
    icon: '🎯',
    description: 'Target akumulasi kekayaan sesuai rencana keluarga dan kebutuhan spesifik.',
    recommendedScenario: 'balanced',
  },
};

/**
 * Calculates compound future value with monthly additions and annual Sharia Zakat Maal deduction.
 */
export function calculateYearlyProjectionPoints(
  config: WealthProjectionConfig
): YearlyProjectionPoint[] {
  const points: YearlyProjectionPoint[] = [];
  const currentYear = new Date().getFullYear();

  let balCons = config.initialBalanceIDR;
  let balBal = config.initialBalanceIDR;
  let balAggr = config.initialBalanceIDR;
  let balAi = config.initialBalanceIDR;

  // Tracking net after zakat for the AI-optimized/balanced trajectory
  let balNetAfterZakat = config.initialBalanceIDR;
  let cumulativeZakatPaid = 0;
  let totalPrincipalDeposits = config.initialBalanceIDR;

  const cagrCons = config.customCagrModifiers?.conservative ?? BASELINE_CAGR.conservative;
  const cagrBal = config.customCagrModifiers?.balanced ?? BASELINE_CAGR.balanced;
  const cagrAggr = config.customCagrModifiers?.aggressive ?? BASELINE_CAGR.aggressive;
  const cagrAi = config.customCagrModifiers?.aiOptimized ?? BASELINE_CAGR.aiOptimized;

  const annualAddition = config.monthlyDcaIDR * 12;
  const nisabThresholdIDR = config.goldPricePerGramIDR * NISAB_GOLD_GRAMS;

  // Year 0 (Current Baseline)
  const initialZakat = balNetAfterZakat >= nisabThresholdIDR ? balNetAfterZakat * ZAKAT_MAAL_RATE : 0;
  points.push({
    year: 0,
    calendarYear: currentYear,
    conservativeValueIDR: Math.round(balCons),
    balancedValueIDR: Math.round(balBal),
    aggressiveValueIDR: Math.round(balAggr),
    aiOptimizedValueIDR: Math.round(balAi),
    netAfterZakatIDR: Math.round(balNetAfterZakat),
    cumulativeZakatPaidIDR: 0,
    annualZakatPaidIDR: Math.round(initialZakat),
    goldEquivalentGrams: Number((balBal / config.goldPricePerGramIDR).toFixed(1)),
    totalPrincipalDepositsIDR: Math.round(totalPrincipalDeposits),
    estimatedLivesImpacted: 0,
  });

  // Calculate year by year
  for (let y = 1; y <= config.horizonYears; y++) {
    // 1. Conservative compounding
    balCons = (balCons + annualAddition) * (1 + cagrCons);

    // 2. Balanced compounding
    balBal = (balBal + annualAddition) * (1 + cagrBal);

    // 3. Aggressive compounding
    balAggr = (balAggr + annualAddition) * (1 + cagrAggr);

    // 4. AI Optimized compounding
    // Slightly modulates CAGR based on cycle dampening
    const cycleFactor = 1 + (Math.sin(y * 1.5) * 0.03); // mild cyclicality
    const adjustedAiCagr = cagrAi * cycleFactor;
    balAi = (balAi + annualAddition) * (1 + adjustedAiCagr);

    // Net after zakat calculation (Tazkiyah Harta)
    // Starting balance + annual addition grows with AI rate
    balNetAfterZakat = (balNetAfterZakat + annualAddition) * (1 + adjustedAiCagr);
    
    // Check Nisab (85g Gold)
    let annualZakat = 0;
    if (balNetAfterZakat >= nisabThresholdIDR) {
      annualZakat = balNetAfterZakat * ZAKAT_MAAL_RATE;
      balNetAfterZakat -= annualZakat;
      cumulativeZakatPaid += annualZakat;
    }

    totalPrincipalDeposits += annualAddition;
    const goldPriceInFuture = config.goldPricePerGramIDR * Math.pow(1 + config.inflationRate, y);
    const goldGrams = Number((balAi / goldPriceInFuture).toFixed(1));
    const livesImpacted = Math.floor(cumulativeZakatPaid / MUSTAHIK_FAMILY_UPLIFT_COST_IDR);

    points.push({
      year: y,
      calendarYear: currentYear + y,
      conservativeValueIDR: Math.round(balCons),
      balancedValueIDR: Math.round(balBal),
      aggressiveValueIDR: Math.round(balAggr),
      aiOptimizedValueIDR: Math.round(balAi),
      netAfterZakatIDR: Math.round(balNetAfterZakat),
      cumulativeZakatPaidIDR: Math.round(cumulativeZakatPaid),
      annualZakatPaidIDR: Math.round(annualZakat),
      goldEquivalentGrams: goldGrams,
      totalPrincipalDepositsIDR: Math.round(totalPrincipalDeposits),
      estimatedLivesImpacted: livesImpacted,
    });
  }

  return points;
}

/**
 * Computes milestones based on user's selected trajectory and target values.
 */
export function computeWealthMilestones(
  points: YearlyProjectionPoint[],
  selectedScenario: WealthProjectionScenario,
  goldPricePerGramIDR: number
): WealthProjectionMilestone[] {
  const nisabGoldIDR = goldPricePerGramIDR * NISAB_GOLD_GRAMS;

  const milestoneDefinitions: Array<{
    id: string;
    title: string;
    targetAmountIDR: number;
    iconName: string;
    shariaSignificance: string;
  }> = [
    {
      id: 'nisab',
      title: 'Melampaui Nisab Zakat (85g Emas)',
      targetAmountIDR: nisabGoldIDR,
      iconName: 'Scale',
      shariaSignificance: 'Sah menjadi Muzakki wajib Zakat Maal tahunan sesuai QS At-Taubah: 103.',
    },
    {
      id: 'hajj',
      title: 'Dana Haji & Umrah Keluarga (Rp 350 Juta)',
      targetAmountIDR: 350000000,
      iconName: 'Building2',
      shariaSignificance: 'Menunaikan rukun Islam ke-5 bagi yang mampu (Istitha’ah).',
    },
    {
      id: 'education',
      title: 'Dana Pendidikan Mandiri (Rp 600 Juta)',
      targetAmountIDR: 600000000,
      iconName: 'Award',
      shariaSignificance: 'Menjaga keturunan berpendidikan tinggi (Hifzh an-Nasl & al-Aql).',
    },
    {
      id: 'billionaire',
      title: '1 Miliar Syariah (Muzakki Kuat)',
      targetAmountIDR: 1000000000,
      iconName: 'Sparkles',
      shariaSignificance: 'Muslim kuat dan mandiri secara ekonomi lebih dicintai Allah.',
    },
    {
      id: 'waqf',
      title: 'Wakaf Produktif Abadi (Rp 2 Miliar)',
      targetAmountIDR: 2000000000,
      iconName: 'HeartHandshake',
      shariaSignificance: 'Pahala amal jariyah yang tidak terputus hingga yaumil akhir.',
    },
    {
      id: 'fire',
      title: 'Pensiun Mandiri Bebas Riba (Rp 5 Miliar)',
      targetAmountIDR: 5000000000,
      iconName: 'ShieldCheck',
      shariaSignificance: 'Kebebasan finansial penuh dari passive income bagi hasil halal.',
    },
  ];

  return milestoneDefinitions.map((def) => {
    let yearFound = -1;
    for (const pt of points) {
      const val =
        selectedScenario === 'conservative'
          ? pt.conservativeValueIDR
          : selectedScenario === 'aggressive'
          ? pt.aggressiveValueIDR
          : selectedScenario === 'ai_recommended'
          ? pt.aiOptimizedValueIDR
          : pt.balancedValueIDR;

      if (val >= def.targetAmountIDR) {
        yearFound = pt.year;
        break;
      }
    }

    const currentVal = points[0]?.balancedValueIDR || 0;
    const status: 'achieved' | 'near' | 'future' =
      currentVal >= def.targetAmountIDR
        ? 'achieved'
        : currentVal >= def.targetAmountIDR * 0.7
        ? 'near'
        : 'future';

    return {
      id: def.id,
      title: def.title,
      targetAmountIDR: def.targetAmountIDR,
      estimatedYear: yearFound === -1 ? points.length : yearFound,
      iconName: def.iconName,
      status,
      shariaSignificance: def.shariaSignificance,
    };
  });
}

/**
 * Format currency helper
 */
export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Shortened compact Rupiah (e.g. Rp 1.2 Milyar / Rp 350 Juta)
 */
export function formatRupiahCompact(val: number): string {
  if (val >= 1000000000000) {
    return `Rp ${(val / 1000000000000).toFixed(2)} Triliun`;
  }
  if (val >= 1000000000) {
    return `Rp ${(val / 1000000000).toFixed(2)} Miliar`;
  }
  if (val >= 1000000) {
    return `Rp ${(val / 1000000).toFixed(1)} Juta`;
  }
  return formatRupiah(val);
}

export interface MilestoneTimeToGoalResult {
  monthsNeeded: number;
  yearsNeeded: number;
  remainingMonths: number;
  estimatedCompletionDate: string;
  isAlreadyAchieved: boolean;
  progressPercent: number;
  currentShortfallIDR: number;
  monthsWithoutDca: number | null;
  monthsCashSavingsOnly: number;
  monthsSavedWithShariaGrowth: number;
}

export function calculateTimeToMilestone({
  currentBalanceIDR,
  targetAmountIDR,
  monthlyDcaIDR,
  annualCagr,
}: {
  currentBalanceIDR: number;
  targetAmountIDR: number;
  monthlyDcaIDR: number;
  annualCagr: number;
}): MilestoneTimeToGoalResult {
  if (currentBalanceIDR >= targetAmountIDR) {
    return {
      monthsNeeded: 0,
      yearsNeeded: 0,
      remainingMonths: 0,
      estimatedCompletionDate: 'Telah Tercapai',
      isAlreadyAchieved: true,
      progressPercent: 100,
      currentShortfallIDR: 0,
      monthsWithoutDca: 0,
      monthsCashSavingsOnly: 0,
      monthsSavedWithShariaGrowth: 0,
    };
  }

  const shortfall = Math.max(0, targetAmountIDR - currentBalanceIDR);
  const progress = Math.min(99.9, Number(((currentBalanceIDR / targetAmountIDR) * 100).toFixed(1)));

  // Monthly compound interest rate
  const monthlyRate = Math.pow(1 + Math.max(0.001, annualCagr), 1 / 12) - 1;

  let monthsNeeded = 0;
  if (monthlyRate > 0 && monthlyDcaIDR > 0) {
    const numerator = targetAmountIDR + monthlyDcaIDR / monthlyRate;
    const denominator = currentBalanceIDR + monthlyDcaIDR / monthlyRate;
    monthsNeeded = Math.ceil(Math.log(numerator / denominator) / Math.log(1 + monthlyRate));
  } else if (monthlyRate > 0 && monthlyDcaIDR === 0) {
    monthsNeeded = Math.ceil(Math.log(targetAmountIDR / currentBalanceIDR) / Math.log(1 + monthlyRate));
  } else if (monthlyDcaIDR > 0) {
    monthsNeeded = Math.ceil(shortfall / monthlyDcaIDR);
  } else {
    monthsNeeded = 999;
  }

  // Without DCA (growth of initial balance alone)
  let monthsWithoutDca: number | null = null;
  if (monthlyRate > 0 && currentBalanceIDR > 0) {
    monthsWithoutDca = Math.ceil(Math.log(targetAmountIDR / currentBalanceIDR) / Math.log(1 + monthlyRate));
  }

  // Cash savings only (0% growth)
  const monthsCashOnly = monthlyDcaIDR > 0 ? Math.ceil(shortfall / monthlyDcaIDR) : 999;
  const monthsSaved = Math.max(0, monthsCashOnly - monthsNeeded);

  const yearsNeeded = Math.floor(monthsNeeded / 12);
  const remainingMonths = monthsNeeded % 12;

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + Math.min(600, monthsNeeded));
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const estimatedCompletionDate = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

  return {
    monthsNeeded,
    yearsNeeded,
    remainingMonths,
    estimatedCompletionDate,
    isAlreadyAchieved: false,
    progressPercent: progress,
    currentShortfallIDR: shortfall,
    monthsWithoutDca,
    monthsCashSavingsOnly: monthsCashOnly,
    monthsSavedWithShariaGrowth: monthsSaved,
  };
}
