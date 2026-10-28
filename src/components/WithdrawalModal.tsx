import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  Smartphone,
  Coins,
  Ticket,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';
import { sha256 } from '../utils/cryptoSecurity';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceIDR: number;
  onConfirmWithdrawal: (data: {
    amountIDR: number;
    channel: string;
    destinationAccount: string;
    txHash: string;
  }) => void;
  language: Language;
  theme: Theme;
  onRequireBiometric: (onSuccess: () => void) => void;
  isBiometricVerified: boolean;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  availableBalanceIDR,
  onConfirmWithdrawal,
  language,
  theme,
  onRequireBiometric,
  isBiometricVerified,
}) => {
  const t = translations[language];

  const [channel, setChannel] = useState<'BANK' | 'EWALLET' | 'CRYPTO' | 'VOUCHER'>('BANK');
  const [amount, setAmount] = useState<string>('1000000');
  const [selectedProvider, setSelectedProvider] = useState<string>('Bank Syariah Indonesia (BSI)');
  const [destinationAccount, setDestinationAccount] = useState<string>('7129038411');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    txHash: string;
    amount: number;
  } | null>(null);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handlePreset = (fraction: number) => {
    const calc = Math.floor(availableBalanceIDR * fraction);
    setAmount(calc.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || numAmount > availableBalanceIDR) return;

    // Trigger biometric authentication check
    onRequireBiometric(async () => {
      setIsProcessing(true);
      const hash = await sha256(
        `FAST-WITHDRAW-${channel}-${selectedProvider}-${destinationAccount}-${numAmount}-${Date.now()}`
      );

      setTimeout(() => {
        setIsProcessing(false);
        setSuccessInfo({ txHash: hash, amount: numAmount });
        onConfirmWithdrawal({
          amountIDR: numAmount,
          channel: `${channel}: ${selectedProvider}`,
          destinationAccount,
          txHash: hash,
        });
      }, 1200);
    });
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      id="withdrawal-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div
        id="withdrawal-modal-card"
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          id="close-withdrawal-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Penarikan Dana Cepat Berhasil Dikirim!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Dana sebesar <span className="font-bold text-emerald-500">{formatIDR(successInfo.amount)}</span> telah ditransfer ke {selectedProvider} ({destinationAccount}).
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-xs text-slate-500 break-all text-left">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Bukti Transaksi Blockchain Hash
              </span>
              {successInfo.txHash}
            </div>

            <button
              onClick={() => {
                setSuccessInfo(null);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
            >
              Kembali ke Dasbor
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">{t.withdrawal.title}</h3>
                <p className="text-xs text-slate-400">{t.withdrawal.subtitle}</p>
              </div>
            </div>

            {/* Balance notice */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs mb-4">
              <span className="text-slate-600 dark:text-slate-300">Saldo Portofolio Tersedia:</span>
              <span className="font-bold text-emerald-500">{formatIDR(availableBalanceIDR)}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Payment Channel Tabs */}
              <div>
                <label className="font-semibold block mb-2">{t.withdrawal.method}</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChannel('BANK');
                      setSelectedProvider('Bank Syariah Indonesia (BSI)');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      channel === 'BANK'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                        : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-[10px]">Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChannel('EWALLET');
                      setSelectedProvider('GoPay / OVO Syariah');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      channel === 'EWALLET'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                        : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px]">E-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChannel('CRYPTO');
                      setSelectedProvider('PAX Gold (PAXG ERC20)');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      channel === 'CRYPTO'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                        : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Coins className="w-4 h-4" />
                    <span className="text-[10px]">Kripto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setChannel('VOUCHER');
                      setSelectedProvider('Islamicity Digital Voucher');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      channel === 'VOUCHER'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold'
                        : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <Ticket className="w-4 h-4" />
                    <span className="text-[10px]">Voucher</span>
                  </button>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="font-semibold block mb-1">Pilih Institusi / Jaringan</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border outline-none ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {channel === 'BANK' && (
                    <>
                      <option value="Bank Syariah Indonesia (BSI)">Bank Syariah Indonesia (BSI) - Prioritas</option>
                      <option value="Bank Mandiri">Bank Mandiri (Livin')</option>
                      <option value="BCA Syariah">BCA Syariah Mobile</option>
                      <option value="CIMB Niaga Syariah">CIMB Niaga Syariah</option>
                      <option value="Bank Muamalat">Bank Muamalat Indonesia</option>
                    </>
                  )}
                  {channel === 'EWALLET' && (
                    <>
                      <option value="GoPay Syariah">GoPay / GoPay Syariah</option>
                      <option value="OVO">OVO Premier</option>
                      <option value="DANA">DANA ID</option>
                      <option value="ShopeePay">ShopeePay</option>
                      <option value="LinkAja Syariah">LinkAja Layanan Syariah</option>
                    </>
                  )}
                  {channel === 'CRYPTO' && (
                    <>
                      <option value="PAX Gold (PAXG ERC20)">PAX Gold (PAXG Emas Murni) - Instan</option>
                      <option value="USDT (TRC20)">Tether USDT (TRC20 Jaringan Cepat)</option>
                      <option value="Bitcoin (BTC SegWit)">Bitcoin Network (Native SegWit)</option>
                    </>
                  )}
                  {channel === 'VOUCHER' && (
                    <>
                      <option value="Islamicity Digital Gift Voucher">Islamicity Digital Gift Voucher (Bonus +5%)</option>
                      <option value="Halal Merchant Credit Voucher">Halal Merchant Network Voucher</option>
                    </>
                  )}
                </select>
              </div>

              {/* Destination Account Number */}
              <div>
                <label className="font-semibold block mb-1">
                  {channel === 'CRYPTO' ? 'Alamat Wallet Tujuan' : t.withdrawal.accountNum}
                </label>
                <input
                  type="text"
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  placeholder={channel === 'CRYPTO' ? '0x71C... atau T...' : 'Nomor Rekening Anda'}
                  className={`w-full px-3 py-2.5 rounded-xl border outline-none font-mono ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
              </div>

              {/* Amount & Presets */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold">{t.withdrawal.amount}</label>
                  <div className="flex gap-1">
                    {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                      <button
                        key={frac}
                        type="button"
                        onClick={() => handlePreset(frac)}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                      >
                        {frac * 100}%
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="50000"
                  max={availableBalanceIDR}
                  className={`w-full px-3 py-2.5 rounded-xl border outline-none font-mono text-sm font-bold ${
                    theme === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                  required
                />
                {numAmount > availableBalanceIDR && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Saldo portofolio tidak mencukupi.
                  </p>
                )}
              </div>

              {/* Security Badge */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Fingerprint className="w-4 h-4 text-emerald-500" />
                  <span>{t.withdrawal.biometricRequired}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Proses &lt; 60 Detik</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || numAmount <= 0 || numAmount > availableBalanceIDR}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Memproses Penarikan Instan...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.withdrawal.submitWithdraw}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
