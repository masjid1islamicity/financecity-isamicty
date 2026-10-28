import React, { useState, useEffect } from 'react';
import {
  Language,
  Theme,
  CryptoAsset,
  IslamicityVoucher,
  BlockchainBlock,
  EncryptedUserHistory,
  TradeOrder,
  ExpenseItem,
  SmartBill,
  BankAccountSync,
  PushNotification,
  AutoTradingConfig,
  ZakatDisbursementData,
  ZakatSummaryRecord,
  SmartZakatAssetThreshold,
  ShariaFinancialGoal,
} from './types';
import {
  initialCryptoAssets,
  initialVouchers,
  initialBlocks,
  initialUserHistory,
  initialRecentTrades,
  initialExpenses,
  initialBills,
  initialConnectedBanks,
  initialNotifications,
  initialTradingConfig,
  initialZakatDisbursedRecords,
  initialSmartZakatAssetThresholds,
} from './data/initialState';
import { Navbar } from './components/Navbar';
import { AssetDashboard } from './components/AssetDashboard';
import { AutoTradingEngine } from './components/AutoTradingEngine';
import { IslamicityVouchers } from './components/IslamicityVouchers';
import { ExpenseAnalytics } from './components/ExpenseAnalytics';
import { BlockchainLedger } from './components/BlockchainLedger';
import { ApiGateway } from './components/ApiGateway';
import { ShariaAiAdvisor } from './components/ShariaAiAdvisor';
import { SmartWealthProjection } from './components/SmartWealthProjection';
import { ShariaComplianceDashboard } from './components/ShariaComplianceDashboard';
import { FinanceMasteryHub } from './components/FinanceMasteryHub';
import { BiometricModal } from './components/BiometricModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { WithdrawalModal } from './components/WithdrawalModal';
import { translations } from './utils/translations';
import { encryptDataE2E } from './utils/cryptoSecurity';

export default function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('id');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Data States
  const [assets, setAssets] = useState<CryptoAsset[]>(initialCryptoAssets);
  const [vouchers, setVouchers] = useState<IslamicityVoucher[]>(initialVouchers);
  const [blocks, setBlocks] = useState<BlockchainBlock[]>(initialBlocks);
  const [history, setHistory] = useState<EncryptedUserHistory[]>(initialUserHistory);
  const [recentTrades, setRecentTrades] = useState<TradeOrder[]>(initialRecentTrades);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses);
  const [bills, setBills] = useState<SmartBill[]>(initialBills);
  const [connectedBanks, setConnectedBanks] = useState<BankAccountSync[]>(initialConnectedBanks);
  const [notifications, setNotifications] = useState<PushNotification[]>(initialNotifications);
  const [tradingConfig, setTradingConfig] = useState<AutoTradingConfig>(initialTradingConfig);

  // Financial Balances
  const [totalBalanceIDR, setTotalBalanceIDR] = useState<number>(348250000);
  const [autoProfitTodayIDR, setAutoProfitTodayIDR] = useState<number>(1875000);
  const [zakatReserveIDR, setZakatReserveIDR] = useState<number>(8706250);
  const [annualZakatTargetIDR, setAnnualZakatTargetIDR] = useState<number>(15000000);
  const [zakatDisbursedRecords, setZakatDisbursedRecords] = useState<ZakatSummaryRecord[]>(initialZakatDisbursedRecords);
  const [smartZakatThresholds, setSmartZakatThresholds] = useState<SmartZakatAssetThreshold[]>(initialSmartZakatAssetThresholds);

  // Modals & Drawers
  const [isBiometricVerified, setIsBiometricVerified] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [biometricPendingAction, setBiometricPendingAction] = useState<(() => void) | null>(null);
  const [biometricActionTitle, setBiometricActionTitle] = useState<string | undefined>(undefined);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState<boolean>(false);
  const [selectedAssetForAudit, setSelectedAssetForAudit] = useState<CryptoAsset | null>(null);

  const t = translations[language];

  // Keep HTML root classes in sync with dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Biometric auth guard trigger
  const requestBiometricAuth = (onSuccess: () => void, title?: string) => {
    setBiometricPendingAction(() => onSuccess);
    setBiometricActionTitle(title);
    setIsBiometricModalOpen(true);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricVerified(true);
    if (biometricPendingAction) {
      biometricPendingAction();
      setBiometricPendingAction(null);
    }
    // Add push notification about biometric security verification
    pushNewNotification({
      title: 'Otentikasi Biometrik Berhasil',
      message: 'Identitas Anda telah diverifikasi secara kriptografis menggunakan sensor biometrik perangkat.',
      type: 'SECURITY',
    });
  };

  // Push Notification Dispatcher
  const pushNewNotification = (params: {
    title: string;
    message: string;
    type: PushNotification['type'];
    amountIDR?: number;
    actionUrl?: string;
    actionLabel?: string;
  }) => {
    const newNotif: PushNotification = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title: params.title,
      message: params.message,
      timestamp: 'Baru saja',
      type: params.type,
      read: false,
      amountIDR: params.amountIDR,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Smart Zakat Reminder Background Monitor:
  // Automatically detects assets reaching or within their reminderLeadDays (3 days before Haul)
  useEffect(() => {
    const notifiedIds: string[] = [];
    smartZakatThresholds.forEach((threshold) => {
      if (
        threshold.isNisabReached &&
        threshold.daysRemaining <= threshold.reminderLeadDays &&
        !threshold.isNotificationSent
      ) {
        // Prevent duplicate unread notifications for the same asset
        const alreadyExists = notifications.some(
          (n) => n.type === 'HAUL_REMINDER' && n.title.includes(threshold.assetSymbol)
        );
        if (!alreadyExists) {
          pushNewNotification({
            title: `🔔 Peringatan Haul H-${threshold.daysRemaining}: ${threshold.assetName} (${threshold.assetSymbol})`,
            message: `Aset ${threshold.assetName} Anda telah melampaui ambang batas ${threshold.nisabUnitLabel} selama masa 1 tahun penuh (Haul: ${threshold.calculatedHaulDate}). Estimasi Zakat Maal wajib (2.5%): Rp ${threshold.estimatedZakatDueIDR.toLocaleString('id-ID')}.`,
            type: 'HAUL_REMINDER',
            amountIDR: threshold.estimatedZakatDueIDR,
            actionUrl: '#smart-zakat-reminder',
            actionLabel: 'Tunaikan Zakat via BAZNAS',
          });
        }
        notifiedIds.push(threshold.id);
      }
    });

    if (notifiedIds.length > 0) {
      setSmartZakatThresholds((prev) =>
        prev.map((item) => (notifiedIds.includes(item.id) ? { ...item, isNotificationSent: true } : item))
      );
    }
  }, []);

  // Handler: New automated trade executed by bot
  const handleNewTradeExecuted = async (trade: TradeOrder) => {
    setRecentTrades((prev) => [trade, ...prev.slice(0, 19)]);
    setTotalBalanceIDR((prev) => prev + trade.profitIDR);
    setAutoProfitTodayIDR((prev) => prev + trade.profitIDR);
    setZakatReserveIDR((prev) => prev + trade.zakatDeductionIDR);

    // Update config stats
    setTradingConfig((prev) => ({
      ...prev,
      totalProfitEarnedIDR: prev.totalProfitEarnedIDR + trade.profitIDR,
    }));

    // Record on encrypted ledger
    const encResult = await encryptDataE2E(
      `Eksekusi Bot: ${trade.type} ${trade.pair} profit +Rp ${trade.profitIDR.toLocaleString('id-ID')}`
    );
    const historyItem: EncryptedUserHistory = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      activity: `Eksekusi Bot: ${trade.type} ${trade.pair}`,
      cipherText: encResult.cipher,
      signature: encResult.sig || ('0x' + trade.halalAuditHash.slice(0, 16)),
      category: 'TRADE',
      amountIDR: trade.profitIDR,
    };
    setHistory((prev) => [historyItem, ...prev]);

    // Push notification
    pushNewNotification({
      title: 'Profit Otomatis Kripto Islamicity',
      message: `Bot mengeksekusi spot ${trade.pair} dengan bagi hasil Mudharabah +Rp ${trade.profitIDR.toLocaleString('id-ID')}. Zakat dicadangkan: Rp ${trade.zakatDeductionIDR.toLocaleString('id-ID')}.`,
      type: 'TRADE_SUCCESS',
      amountIDR: trade.profitIDR,
    });
  };

  // Handler: Smart Rebalance execution
  const handleExecuteSmartRebalance = async (trades: TradeOrder[]) => {
    setRecentTrades((prev) => [...trades, ...prev]);

    const encResult = await encryptDataE2E(
      `Smart Rebalance Otomatis: ${trades.length} transaksi spot dieksekusi untuk optimalisasi Portfolio Health Index`
    );

    const historyItem: EncryptedUserHistory = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      activity: `Smart Rebalance Portofolio (${trades.length} Aset Spot)`,
      amountIDR: trades.reduce((acc, t) => acc + (t.price * t.amount), 0),
      category: 'TRADE',
      cipherText: encResult.cipher,
      signature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map((b) => b.toString(16).padStart(2, '0')).join(''),
    };
    setHistory((prev) => [historyItem, ...prev]);

    pushNewNotification({
      title: 'Smart Rebalance Syariah Berhasil Dieksekusi',
      message: `${trades.length} transaksi spot halal telah dieksekusi 1-klik. Portfolio Health Index kini optimal di 99/100.`,
      type: 'TRADE_SUCCESS',
    });
  };

  // Handler: Claim voucher
  const handleClaimVoucher = (voucherId: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, isClaimed: true } : v))
    );
    pushNewNotification({
      title: 'Voucher Islamicity Diklaim',
      message: 'Voucher telah berhasil diklaim ke dompet digital Anda dan siap digunakan.',
      type: 'VOUCHER',
    });
  };

  // Handler: Redeem voucher
  const handleRedeemVoucher = (code: string): boolean => {
    const target = vouchers.find(
      (v) => v.code.toUpperCase() === code.toUpperCase() && !v.isRedeemed
    );
    if (!target) return false;

    setVouchers((prev) =>
      prev.map((v) => (v.id === target.id ? { ...v, isRedeemed: true, isClaimed: true } : v))
    );

    setTotalBalanceIDR((prev) => prev + target.cashValueIDR);

    // Add push notification
    pushNewNotification({
      title: 'Voucher Islamicity Berhasil Ditukarkan!',
      message: `Saldo sebesar Rp ${target.cashValueIDR.toLocaleString('id-ID')} telah dikreditkan ke portofolio Anda via akad ${target.shariaContract}.`,
      type: 'VOUCHER',
      amountIDR: target.cashValueIDR,
    });

    return true;
  };

  // Handler: Confirm withdrawal
  const handleConfirmWithdrawal = async (data: {
    amountIDR: number;
    channel: string;
    destinationAccount: string;
    txHash: string;
  }) => {
    setTotalBalanceIDR((prev) => Math.max(0, prev - data.amountIDR));

    // Record on ledger
    const encResult = await encryptDataE2E(
      `Penarikan Dana Cepat: Rp ${data.amountIDR.toLocaleString('id-ID')} ke ${data.channel} (${data.destinationAccount})`
    );

    const historyItem: EncryptedUserHistory = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      activity: `Penarikan Dana ke ${data.channel}`,
      cipherText: encResult.cipher,
      signature: encResult.sig || ('0x' + data.txHash.slice(0, 16)),
      category: 'WITHDRAW',
      amountIDR: -data.amountIDR,
    };
    setHistory((prev) => [historyItem, ...prev]);

    // Push notification
    pushNewNotification({
      title: 'Penarikan Dana Cepat Berhasil',
      message: `Transfer dana Rp ${data.amountIDR.toLocaleString('id-ID')} ke ${data.destinationAccount} telah berhasil diproses instan via jaringan perbankan.`,
      type: 'SECURITY',
    });
  };

  // Handler: Direct Zakat Disbursement via API
  const handleDisburseZakat = async (data: ZakatDisbursementData) => {
    setZakatReserveIDR((prev) => Math.max(0, prev - data.amountIDR));

    // Record on encrypted ledger
    const encResult = await encryptDataE2E(
      `Penyaluran Zakat Maal: Rp ${data.amountIDR.toLocaleString('id-ID')} ke ${data.institutionName} (No BSZ: ${data.receiptNumber}) - Program: ${data.programTarget}`
    );

    const newSummaryRecord: ZakatSummaryRecord = {
      id: 'ZKT-REC-' + Date.now(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      institution: data.institution,
      institutionName: data.institutionName,
      receiptNumber: data.receiptNumber,
      programTarget: data.programTarget,
      amountIDR: data.amountIDR,
      txHash: data.txHash,
    };
    setZakatDisbursedRecords((prev) => [newSummaryRecord, ...prev]);

    const historyItem: EncryptedUserHistory = {
      id: 'ZKT-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      activity: `Salur Zakat ke ${data.institutionName}`,
      cipherText: encResult.cipher,
      signature: encResult.sig || ('0x' + data.txHash.slice(0, 16)),
      category: 'ZAKAT',
      amountIDR: -data.amountIDR,
    };
    setHistory((prev) => [historyItem, ...prev]);

    // Record block on PoSS Blockchain
    const newBlock: BlockchainBlock = {
      blockNumber: blocks.length + 1,
      timestamp: new Date().toISOString(),
      previousHash: blocks[0]?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      hash: data.txHash,
      merkleRoot: '0x' + data.receiptNumber.toLowerCase().replace(/[^a-f0-9]/g, 'a').padEnd(64, '0').slice(0, 64),
      txCount: 1,
      validatorNode: `Validator-Node-BAZNAS-${data.institution}`,
      consensus: 'Proof-of-Shariah-Stake (PoSS)',
      nonce: Math.floor(Math.random() * 1000000),
    };
    setBlocks((prev) => [newBlock, ...prev]);

    // Push notification
    pushNewNotification({
      title: `Zakat Disalurkan: ${data.institution}`,
      message: `Alhamdulillah! Zakat Maal Rp ${data.amountIDR.toLocaleString('id-ID')} berhasil disalurkan via API ke ${data.institutionName} (${data.programTarget}). No BSZ: ${data.receiptNumber}`,
      type: 'ZAKAT_DISBURSED',
      amountIDR: data.amountIDR,
    });
  };

  // Handler: Record Sharia Financial Goal to PoSS Blockchain Ledger
  const handleRecordGoalToBlockchain = async (params: {
    goal: ShariaFinancialGoal;
    projectedDateFormatted: string;
    accumulatedFundsIDR: number;
    cipherText: string;
    signature: string;
    merkleRoot: string;
    txHash: string;
  }) => {
    // 1. Append new block to Proof-of-Shariah-Stake blockchain
    const newBlock: BlockchainBlock = {
      blockNumber: blocks.length + 1,
      timestamp: new Date().toISOString(),
      previousHash: blocks[0]?.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
      hash: params.txHash,
      merkleRoot: params.merkleRoot,
      txCount: 1,
      validatorNode: 'Validator-PoSS-GoalVault-01',
      consensus: 'Proof-of-Shariah-Stake (PoSS)',
      nonce: Math.floor(Math.random() * 1000000),
    };
    setBlocks((prev) => [newBlock, ...prev]);

    // 2. Append to encrypted history ledger
    const historyItem: EncryptedUserHistory = {
      id: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      activity: `Komitmen Target Syariah: ${params.goal.title} (Proyeksi ${params.projectedDateFormatted})`,
      amountIDR: params.goal.targetAmountIDR,
      category: 'SECURITY',
      cipherText: params.cipherText,
      signature: params.signature,
      isBiometricVerified: true,
      authMethod: 'PO_SHARIAH_STAKE',
    };
    setHistory((prev) => [historyItem, ...prev]);

    // 3. Dispatch Push Notification
    pushNewNotification({
      title: 'Target Finansial Terenkripsi di Blockchain',
      message: `Target "${params.goal.title}" senilai Rp ${params.goal.targetAmountIDR.toLocaleString('id-ID')} telah diamankan dan dicatat ke Ledger Blockchain PoSS (Blok #${blocks.length + 1}). Hash: ${params.txHash.slice(0, 16)}...`,
      type: 'SECURITY',
      amountIDR: params.goal.targetAmountIDR,
      actionUrl: '#blockchain-ledger',
      actionLabel: 'Lihat Blok Ledger',
    });
  };

  // Handler: Open Banking API sync
  const handleSyncBankingAPI = async () => {
    try {
      const res = await fetch('/api/banking/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) {
          setConnectedBanks(data.accounts);
        }
      }
    } catch {
      // Offline fallback
    }

    setConnectedBanks((prev) =>
      prev.map((b) => ({
        ...b,
        lastSynced: 'Baru saja',
      }))
    );

    pushNewNotification({
      title: 'Sinkronisasi Perbankan Selesai',
      message: 'Rekening Bank Syariah Indonesia, Mandiri, dan BCA Syariah telah disinkronkan otomatis via Open Banking API.',
      type: 'BANK_SYNC',
    });
  };

  // Handler: Pay bill
  const handlePayBill = (billId: string) => {
    const target = bills.find((b) => b.id === billId);
    if (!target) return;

    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, isPaid: true } : b))
    );
    setTotalBalanceIDR((prev) => Math.max(0, prev - target.amountIDR));

    pushNewNotification({
      title: 'Pembayaran Tagihan Selesai',
      message: `Tagihan ${target.title} sebesar Rp ${target.amountIDR.toLocaleString('id-ID')} telah dibayar lunas otomatis.`,
      type: 'BILL_REMINDER',
    });
  };

  const handleToggleAutoDebit = (billId: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, autoPayWithProfits: !b.autoPayWithProfits } : b
      )
    );
  };

  return (
    <div
      id="financecity-islamicity-app"
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300'
          : 'bg-slate-50 text-slate-900 selection:bg-emerald-500/20 selection:text-emerald-800'
      }`}
    >
      {/* Top Main Navigation */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        totalBalanceIDR={totalBalanceIDR}
        autoProfitTodayIDR={autoProfitTodayIDR}
        isBotRunning={tradingConfig.isRunning}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenBiometric={() =>
          requestBiometricAuth(() => {}, 'Verifikasi Biometrik Akun FinanceCity')
        }
        onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
        isBiometricAuthenticated={isBiometricVerified}
      />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <AssetDashboard
            assets={assets}
            totalBalanceIDR={totalBalanceIDR}
            autoProfitTodayIDR={autoProfitTodayIDR}
            zakatReserveIDR={zakatReserveIDR}
            annualZakatTargetIDR={annualZakatTargetIDR}
            onUpdateAnnualTarget={setAnnualZakatTargetIDR}
            disbursedZakatRecords={zakatDisbursedRecords}
            smartZakatThresholds={smartZakatThresholds}
            onUpdateSmartZakatThresholds={setSmartZakatThresholds}
            onSendPushNotification={pushNewNotification}
            tradingConfig={tradingConfig}
            onUpdateTradingConfig={setTradingConfig}
            language={language}
            theme={theme}
            onOpenWithdrawal={() => setIsWithdrawalOpen(true)}
            onNavigateToTab={setActiveTab}
            onSelectAssetForAudit={(coin) => {
              setSelectedAssetForAudit(coin);
              setActiveTab('advisor');
            }}
            onDisburseZakat={handleDisburseZakat}
            onRequestBiometric={(onSuccess, title) => requestBiometricAuth(onSuccess, title)}
            onExecuteTrades={handleExecuteSmartRebalance}
            onRecordGoalToBlockchain={handleRecordGoalToBlockchain}
            recentTrades={recentTrades}
            history={history}
          />
        )}

        {activeTab === 'mastery' && (
          <FinanceMasteryHub
            assets={assets}
            totalBalanceIDR={totalBalanceIDR}
            zakatReserveIDR={zakatReserveIDR}
            language={language}
            theme={theme}
            onNavigateToTab={setActiveTab}
            onApplyBotStrategy={(strategy) => {
              setTradingConfig((prev) => ({ ...prev, strategy }));
              setActiveTab('trading');
              pushNewNotification({
                title: 'Strategi Mastery Diterapkan ke Bot',
                message: `Strategi ${strategy} dari Finance Mastery Hub telah dikonfigurasi ke Bot Trading Syariah.`,
                type: 'TRADE_SUCCESS',
              });
            }}
            onRecordCertificateToBlockchain={(params) => {
              handleRecordGoalToBlockchain({
                goal: params.goal,
                projectedDateFormatted: params.projectedDateFormatted,
                accumulatedFundsIDR: params.targetAmountIDR,
                cipherText: params.cipherText,
                signature: params.signature,
                merkleRoot: params.merkleRoot,
                txHash: params.txHash,
              });
            }}
          />
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <ShariaComplianceDashboard
              assets={assets}
              totalBalanceIDR={totalBalanceIDR}
              zakatReserveIDR={zakatReserveIDR}
              theme={theme}
              language={language}
              onNavigateToTab={setActiveTab}
            />
          </div>
        )}

        {activeTab === 'trading' && (
          <AutoTradingEngine
            assets={assets}
            config={tradingConfig}
            onUpdateConfig={setTradingConfig}
            recentTrades={recentTrades}
            onNewTradeExecuted={handleNewTradeExecuted}
            language={language}
            theme={theme}
            onOpenBiometricAuth={(onSuccess) =>
              requestBiometricAuth(onSuccess, 'Otorisasi Aktivasi Bot Trading Syariah')
            }
            onNavigateToZakatEstimator={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'vouchers' && (
          <IslamicityVouchers
            vouchers={vouchers}
            onClaimVoucher={handleClaimVoucher}
            onRedeemVoucher={handleRedeemVoucher}
            onAddNewVoucher={(newV) => {
              setVouchers((prev) => [newV, ...prev]);
              pushNewNotification({
                title: 'Voucher Baru Diterbitkan',
                message: `Voucher ${newV.title} dengan kode ${newV.code} siap digunakan.`,
                type: 'VOUCHER',
              });
            }}
            language={language}
            theme={theme}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseAnalytics
            expenses={expenses}
            bills={bills}
            connectedBanks={connectedBanks}
            onSyncBankingAPI={handleSyncBankingAPI}
            onPayBill={handlePayBill}
            onToggleAutoDebit={handleToggleAutoDebit}
            onAddNewBill={(newB) => {
              setBills((prev) => [newB, ...prev]);
              pushNewNotification({
                title: 'Pengingat Tagihan Didaftarkan',
                message: `Tagihan ${newB.title} jatuh tempo pada ${newB.dueDate}.`,
                type: 'BILL_REMINDER',
              });
            }}
            language={language}
            theme={theme}
          />
        )}

        {activeTab === 'blockchain' && (
          <BlockchainLedger
            blocks={blocks}
            history={history}
            assets={assets}
            totalBalanceIDR={totalBalanceIDR}
            zakatReserveIDR={zakatReserveIDR}
            recentTrades={recentTrades}
            disbursedRecords={zakatDisbursedRecords}
            language={language}
            theme={theme}
            onRequireBiometricAuth={(onSuccess) =>
              requestBiometricAuth(onSuccess, 'Dekripsi Riwayat Transaksi End-to-End')
            }
          />
        )}

        {activeTab === 'api' && (
          <ApiGateway language={language} theme={theme} />
        )}

        {activeTab === 'advisor' && (
          <ShariaAiAdvisor
            assets={assets}
            selectedAssetForAudit={selectedAssetForAudit}
            totalBalanceIDR={totalBalanceIDR}
            zakatReserveIDR={zakatReserveIDR}
            language={language}
            theme={theme}
          />
        )}

        {activeTab === 'projection' && (
          <div className="space-y-6">
            <SmartWealthProjection
              assets={assets}
              totalBalanceIDR={totalBalanceIDR}
              zakatReserveIDR={zakatReserveIDR}
              goldPricePerGramIDR={Math.round((assets.find((a) => a.symbol === 'PAXG')?.priceIDR || 42100000) / 31.1035)}
              theme={theme}
              language={language}
              onNavigateToTab={setActiveTab}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer
        className={`border-t py-6 text-center text-xs transition-colors ${
          theme === 'dark'
            ? 'border-slate-800 text-slate-500'
            : 'border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              FinanceCity Islamicity Infrastructure
            </span>
            <span>• Terdaftar & Diawasi DPS Syariah & AAOIFI</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Enkripsi End-to-End AES-256</span>
            <span>Proof-of-Shariah-Stake</span>
            <span>Bebas Riba, Gharar & Maysir</span>
          </div>
        </div>
      </footer>

      {/* Biometric Verification Modal */}
      <BiometricModal
        isOpen={isBiometricModalOpen}
        onClose={() => {
          setIsBiometricModalOpen(false);
          setBiometricPendingAction(null);
        }}
        onSuccess={handleBiometricSuccess}
        language={language}
        theme={theme}
        actionTitle={biometricActionTitle}
      />

      {/* Push Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
        onAddSampleNotif={() =>
          pushNewNotification({
            title: 'Uji Coba Push Notifikasi Real-time',
            message: 'Infrastruktur push notification real-time FinanceCity bekerja lancar dengan latensi ultra rendah.',
            type: 'SECURITY',
          })
        }
        onOpenZakat={() => {
          setIsNotificationOpen(false);
          setActiveTab('dashboard');
          setTimeout(() => {
            const el = document.getElementById('smart-zakat-reminder-container');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        language={language}
        theme={theme}
      />

      {/* Fast Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawalOpen}
        onClose={() => setIsWithdrawalOpen(false)}
        availableBalanceIDR={totalBalanceIDR}
        onConfirmWithdrawal={handleConfirmWithdrawal}
        language={language}
        theme={theme}
        onRequireBiometric={(onSuccess) =>
          requestBiometricAuth(onSuccess, 'Otorisasi Penarikan Dana Cepat')
        }
        isBiometricVerified={isBiometricVerified}
      />
    </div>
  );
}
