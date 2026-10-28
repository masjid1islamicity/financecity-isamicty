export type Language = 'id' | 'en' | 'ar';
export type Theme = 'dark' | 'light';

export type AssetType = 'gold-backed' | 'pos-utility' | 'store-of-value';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  priceUSD: number;
  priceIDR: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  halalScore: number; // e.g. 99%
  shariaStandard: string; // e.g. 'AAOIFI Standard No. 57 (Gold) & DSN-MUI No. 140'
  assetType: AssetType;
  underlyingAsset: string;
  sparkline: number[];
  halalCertOrg: string;
}

export interface TradeOrder {
  id: string;
  timestamp: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  profitUSDT: number;
  profitIDR: number;
  halalAuditHash: string;
  status: 'EXECUTED' | 'MATCHING' | 'SETTLED';
  shariaMode: 'Mudharabah' | 'Murabahah' | 'Musyarakah';
  zakatDeductionIDR: number;
}

export interface AutoTradingConfig {
  isRunning: boolean;
  strategy: 'conservative' | 'balanced' | 'dynamic';
  allocatedCapitalIDR: number;
  dailyTargetPercent: number;
  mudharabahSplit: {
    userShare: number; // e.g. 80%
    platformShare: number; // e.g. 17.5%
    zakatInfaqShare: number; // e.g. 2.5%
  };
  totalProfitEarnedIDR: number;
  totalTradesCount: number;
  winRate: number;
  activePairs: string[];
}

export interface IslamicityVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  cashValueIDR: number;
  earnBoosterPercent: number; // e.g. +5% trading yield for 24h
  type: 'RAMADAN_BLESSING' | 'HALAL_COMMERCE' | 'YIELD_BOOSTER' | 'ZAKAT_MATCH';
  merchant: string;
  expiresAt: string;
  isClaimed: boolean;
  isRedeemed: boolean;
  shariaContract: string;
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  hash: string;
  previousHash: string;
  merkleRoot: string;
  txCount: number;
  validatorNode: string;
  consensus: 'Proof-of-Shariah-Stake (PoSS)';
  nonce: number;
}

export interface EncryptedUserHistory {
  id: string;
  timestamp: string;
  activity: string;
  amountIDR?: number;
  category: 'TRADE' | 'WITHDRAW' | 'VOUCHER' | 'BANK_SYNC' | 'SECURITY' | 'ZAKAT';
  cipherText: string;
  signature: string;
  isDecrypted?: boolean;
  isBiometricVerified?: boolean;
  authMethod?: string;
}

export type ExpenseCategory =
  | 'zakat_infaq'
  | 'kebutuhan_pokok'
  | 'makanan_halal'
  | 'utilitas_rumah'
  | 'investasi_syariah'
  | 'bisnis_pendidikan';

export interface ExpenseItem {
  id: string;
  date: string;
  title: string;
  amountIDR: number;
  category: ExpenseCategory;
  bankSource: 'BSI' | 'Bank Mandiri' | 'BCA Syariah' | 'FinanceCity Vault';
  isAutoSynced: boolean;
}

export interface SmartBill {
  id: string;
  title: string;
  biller: string;
  accountNumber: string;
  amountIDR: number;
  dueDate: string;
  isPaid: boolean;
  autoPayWithProfits: boolean;
  iconType: 'electric' | 'water' | 'internet' | 'bpjs' | 'zakat';
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'TRADE_SUCCESS' | 'WITHDRAWAL' | 'VOUCHER' | 'SECURITY' | 'BILL_REMINDER' | 'BANK_SYNC' | 'ZAKAT_DISBURSED' | 'HAUL_REMINDER' | 'GOLD_PRICE_ALERT';
  read: boolean;
  amountIDR?: number;
  actionUrl?: string;
  actionLabel?: string;
}

export interface GoldPriceThresholdAlert {
  id: string;
  assetSymbol: 'PAXG';
  assetName: string;
  targetPricePerGramIDR: number;
  targetTotalValuationIDR: number;
  condition: 'ABOVE_OR_EQUAL' | 'BELOW_OR_EQUAL';
  label: string;
  isEnabled: boolean;
  isTriggered: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  actionOnTrigger: 'NOTIFY_ONLY' | 'REBALANCE_PROMPT' | 'ZAKAT_RECALCULATE';
  notificationChannel: 'PUSH' | 'AUDIO_CHIME' | 'ALL';
}

export interface SmartZakatAssetThreshold {
  id: string;
  assetName: string;
  assetSymbol: string;
  category: 'GOLD' | 'COMMERCIAL_TRADING' | 'SAVINGS' | 'SUKUK';
  currentValueIDR: number;
  nisabThresholdIDR: number;
  nisabUnitLabel: string;
  isNisabReached: boolean;
  wealthAcquisitionDate: string;
  calculatedHaulDate: string;
  daysRemaining: number;
  zakatDueRatePercent: number;
  estimatedZakatDueIDR: number;
  reminderLeadDays: number;
  isNotificationSent: boolean;
  autoPushEnabled: boolean;
  shariaReference: string;
}

export interface ZakatDisbursementData {
  receiptNumber: string;
  institution: string;
  institutionName: string;
  amountIDR: number;
  donorName: string;
  programTarget: string;
  timestamp: string;
  txHash: string;
  shariaVerification: string;
  taxDeductible: boolean;
  legalReference: string;
}

export interface ZakatMonthlyReportItem {
  id: string;
  date: string;
  institution: string;
  institutionName: string;
  receiptNumber: string;
  programTarget: string;
  amountIDR: number;
  txHash: string;
  status: 'DISBURSED' | 'VERIFIED';
}

export interface BankAccountSync {
  bankId: 'BSI' | 'MANDIRI' | 'BCA_SYARIAH' | 'CIMB_SYARIAH';
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  balanceIDR: number;
  lastSynced: string;
  isConnected: boolean;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  apiKey: string;
  secretHash: string;
  permissions: ('read_market' | 'execute_trade' | 'redeem_voucher' | 'sync_banking' | 'query_ledger')[];
  createdAt: string;
  lastUsed: string;
  webhookUrl?: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface ZakatProjectionMilestone {
  month: number;
  monthName: string;
  projectedProfitIDR: number;
  cumulativeProfitIDR: number;
  projectedZakatIDR: number;
  cumulativeZakatIDR: number;
  projectedPortfolioIDR: number;
  isNisabReached: boolean;
}

export interface ZakatEstimationPlan {
  allocatedCapitalIDR: number;
  dailyReturnPercent: number;
  compoundingMode: 'monthly_compound' | 'flat_withdrawal';
  timeHorizonMonths: number;
  totalProjectedProfitIDR: number;
  totalProjectedZakatIDR: number;
  effectiveZakatRatePercent: number;
  nisabGoldIDR: number;
  estimatedNisabReachMonth: number | null;
  estimatedHaulDueDate: string;
  dailyZakatReserveIDR: number;
  monthlyZakatReserveIDR: number;
}

export interface ZakatSummaryRecord {
  id: string;
  date: string;
  institution: string;
  institutionName: string;
  receiptNumber: string;
  amountIDR: number;
  programTarget: string;
  txHash: string;
  notes?: string;
}

export interface ZakatProgramDistributionData {
  period: string; // e.g. "Apr 2026", "Mei 2026"
  timestamp: string; // "2026-04-15"
  umkmMustahik: number; // Pemberdayaan Ekonomi & UMKM
  kesehatanDhuafa: number; // Rumah Sehat & Layanan Medis
  beasiswaPendidikan: number; // Pendidikan & Santri
  kemanusiaanBencana: number; // Sembako & Kemanusiaan
  dakwahAdvokasi: number; // Dakwah Pedalaman & Syiar
  totalIDR: number;
  beneficiariesCount: number;
}

export interface ZakatImpactGoalConfig {
  year: number;
  profileName: string;
  targetAnnualFundsIDR: number;
  targetBeneficiariesCount: number;
  targetEducationKits: number;
  targetUmkmKits: number;
  targetHealthPackages: number;
  targetFoodBaskets: number;
  notes?: string;
}

export interface ZakatGapAuditItem {
  category: string;
  status: string;
  detail: string;
  badgeColor: 'emerald' | 'cyan' | 'amber' | 'rose' | 'purple' | string;
}

export interface ZakatAiRecommendation {
  id: string;
  title: string;
  asnafTarget: string;
  description: string;
  multiplierImpact: string;
  suggestedAmountIDR: number;
  recommendedInstitution: string;
  rationale?: string;
}

export interface ZakatAiInsightsData {
  executiveSummary: string;
  asnafEquityScore: number;
  equityAnalysis: string;
  gapAudit: ZakatGapAuditItem[];
  recommendations: ZakatAiRecommendation[];
  suggestedNextAllocation: {
    umkmPercent: number;
    educationPercent: number;
    healthPercent: number;
    foodPercent: number;
    dakwah3TPercent: number;
  };
  ethicalObservations: string[];
  barakahIndex: {
    score: number;
    tier: string;
    highlight: string;
  };
  customAnswer?: string;
}

export type ZakatBadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export interface ZakatAchievementBadge {
  id: string;
  code: string;
  name: string;
  englishTitle: string;
  tier: ZakatBadgeTier;
  category: 'community' | 'education' | 'economic' | 'health' | 'water' | 'consistency' | 'governance' | 'synergy';
  categoryLabel: string;
  iconName: string;
  description: string;
  shariaPhilosophy: string;
  milestoneRequirement: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpPoints: number;
  socialShareSnippet: string;
  certificateRef?: string;
}

export interface ZakatSdgImpactMetric {
  id: string;
  sdgNumber: number;
  sdgCode: string;
  title: string;
  englishTitle: string;
  sdgGoalName: string;
  sdgColor: string;
  unit: string;
  userValue: number;
  communityAverage: number;
  topTenPercentThreshold: number;
  differencePercent: number;
  description: string;
  globalTargetIndicator: string;
  iconName: string;
  personalEquivalentText: string;
}

export interface ZakatCommunityBenchmarkOverview {
  userTotalContributionIDR: number;
  communityAverageContributionIDR: number;
  percentileRank: number;
  impactMultiplier: number;
  totalMuzakkisInEcosystem: number;
  metrics: ZakatSdgImpactMetric[];
}

export interface ZakatGroundedWebSource {
  title: string;
  uri: string;
}

export interface ZakatGroundedAnswer {
  query: string;
  category: string;
  answerMarkdown: string;
  searchQueries?: string[];
  webSources: ZakatGroundedWebSource[];
  timestamp: string;
  isGrounded: boolean;
  sourceEngine?: string;
}

export interface ZakatEducationalTopic {
  id: string;
  category: 'calculation' | 'ethics' | 'crypto_digital' | 'tax_regulations' | 'asnaf_mustahik';
  categoryLabel: string;
  question: string;
  questionEn: string;
  shortSummary: string;
  badge: string;
  defaultAnswerMarkdown: string;
  verifiedSources: ZakatGroundedWebSource[];
  calculationExample?: {
    formula: string;
    sampleCalculation: string;
    nisabStandard: string;
  };
}

// ==========================================
// Smart Wealth Projection Types (AI-Powered)
// ==========================================
export type WealthProjectionScenario = 'conservative' | 'balanced' | 'aggressive' | 'ai_recommended';

export type WealthProjectionGoal =
  | 'hajj_umrah'
  | 'early_retirement'
  | 'education'
  | 'productive_waqf'
  | 'custom';

export type CustomMilestoneCategory =
  | 'hajj_umrah'
  | 'education'
  | 'home_purchase'
  | 'retirement'
  | 'waqf'
  | 'emergency_fund'
  | 'custom';

export interface CustomFinancialMilestone {
  id: string;
  title: string;
  category: CustomMilestoneCategory;
  categoryLabel: string;
  icon: string;
  targetAmountIDR: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetDeadlineYear?: number;
  shariaNote: string;
  createdAt: string;
  customMonthlyDcaOverride?: number;
}

export interface YearlyProjectionPoint {
  year: number;
  calendarYear: number;
  conservativeValueIDR: number;
  balancedValueIDR: number;
  aggressiveValueIDR: number;
  aiOptimizedValueIDR: number;
  netAfterZakatIDR: number;
  cumulativeZakatPaidIDR: number;
  annualZakatPaidIDR: number;
  goldEquivalentGrams: number;
  totalPrincipalDepositsIDR: number;
  estimatedLivesImpacted: number;
}

export interface WealthProjectionMilestone {
  id: string;
  title: string;
  targetAmountIDR: number;
  estimatedYear: number;
  iconName: string;
  status: 'achieved' | 'near' | 'future';
  shariaSignificance: string;
}

export interface AiWealthProjectionResponse {
  executiveSummary: string;
  marketCycleContext: string;
  macroOutlook: string;
  cagrForecast: {
    conservative: number;
    balanced: number;
    aggressive: number;
    aiOptimized: number;
  };
  recommendedAllocation: {
    symbol: string;
    name: string;
    percentage: number;
    shariaStandard: string;
    role: string;
  }[];
  riskAndMitigation: {
    risk: string;
    shariaGuardrail: string;
    mitigationStrategy: string;
  }[];
  zakatTazkiyahInsight: string;
  milestoneForecast: {
    milestone: string;
    targetIDR: number;
    projectedDate: string;
    mustahikUpliftEstimate: number;
  }[];
  customAnswer?: string;
}

export type ShariaGoalCategory =
  | 'hajj_umrah'
  | 'halal_home'
  | 'retirement_gold'
  | 'education'
  | 'business_umkm'
  | 'waqf_jariyah'
  | 'custom';

export interface ShariaFinancialGoal {
  id: string;
  title: string;
  category: ShariaGoalCategory;
  targetAmountIDR: number;
  allocatedBalanceIDR: number;
  targetDeadlineYear: number;
  monthlyDcaIDR: number;
  expectedAnnualYieldPercent: number;
  shariaVehicle: string;
  iconName: string;
  description: string;
  isCompleted?: boolean;
}

// ==========================================
// Finance & Investment Mastery Types
// ==========================================
export type MasteryLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';

export interface MasteryLesson {
  id: string;
  title: string;
  durationMinutes: number;
  summary: string;
  keyTakeaways: string[];
  fatwaReference: string;
  practicalExample: string;
  isCompleted?: boolean;
}

export interface MasteryTrack {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  level: MasteryLevel;
  badge: string;
  color: string;
  lessons: MasteryLesson[];
}

export interface MasteryQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  shariaReference: string;
  category: 'Fiqh' | 'AAOIFI' | 'Crypto' | 'FIRE' | 'Risk';
}

export interface MasteryCertificate {
  certificateId: string;
  recipientName: string;
  issueDate: string;
  score: number;
  verificationHash: string;
  grade: string;
  blockchainTxHash?: string;
  blockNumber?: number;
}

export interface AaoifiScreenerResult {
  debtRatio: number;
  cashRatio: number;
  nonHalalRevenueRatio: number;
  isDebtCompliant: boolean;
  isCashCompliant: boolean;
  isRevenueCompliant: boolean;
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'BORDERLINE';
  purificationPercentage: number;
  purificationAmountIDR: number;
}

export interface DcaSimulationYear {
  year: number;
  age: number;
  totalInvestedIDR: number;
  grossBalanceIDR: number;
  annualZakatPaidIDR: number;
  cumulativeZakatPaidIDR: number;
  netBalanceIDR: number;
  inflationAdjustedBalanceIDR: number;
  isNisabExceeded: boolean;
}


