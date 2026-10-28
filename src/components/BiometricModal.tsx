import React, { useState } from 'react';
import { Fingerprint, Scan, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, Theme } from '../types';
import { translations } from '../utils/translations';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
  theme: Theme;
  actionTitle?: string;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
  theme,
  actionTitle,
}) => {
  const t = translations[language];
  const [authMode, setAuthMode] = useState<'fingerprint' | 'faceid'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartScan = () => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanSuccess(false);

    // Simulate cryptographic biometric authentication
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    }, 1400);
  };

  return (
    <div
      id="biometric-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
    >
      <div
        id="biometric-modal-card"
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          id="close-biometric-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">
            {actionTitle || t.biometrics.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.biometrics.subtitle}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-6 text-xs font-semibold">
          <button
            id="tab-fingerprint-btn"
            onClick={() => {
              setAuthMode('fingerprint');
              setScanSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              authMode === 'fingerprint'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            TouchID / Sensor
          </button>
          <button
            id="tab-faceid-btn"
            onClick={() => {
              setAuthMode('faceid');
              setScanSuccess(false);
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              authMode === 'faceid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Scan className="w-4 h-4" />
            FaceID Scan
          </button>
        </div>

        {/* Interactive Biometric Scanner Target */}
        <div className="flex flex-col items-center justify-center py-6">
          <div
            id="biometric-scanner-zone"
            onClick={!isScanning && !scanSuccess ? handleStartScan : undefined}
            className={`relative w-36 h-36 rounded-3xl border-2 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
              scanSuccess
                ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20 scale-105'
                : isScanning
                ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/30 animate-pulse'
                : 'border-dashed border-emerald-500/40 hover:border-emerald-500 hover:bg-emerald-500/5'
            }`}
          >
            {/* Animated Laser Scanning Line */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line shadow-sm shadow-emerald-400" />
            )}

            {scanSuccess ? (
              <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in-50 duration-300" />
            ) : authMode === 'fingerprint' ? (
              <Fingerprint
                className={`w-16 h-16 transition-colors ${
                  isScanning ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            ) : (
              <Scan
                className={`w-16 h-16 transition-colors ${
                  isScanning ? 'text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            )}
          </div>

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-4 text-center">
            {scanSuccess
              ? t.biometrics.verified
              : isScanning
              ? t.biometrics.scanning
              : `Klik sensor untuk memverifikasi ${authMode === 'fingerprint' ? 'Sidik Jari' : 'Wajah'}`}
          </p>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-2">
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMsg}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-4 flex gap-2">
          <button
            id="cancel-biometric-btn"
            onClick={onClose}
            className="w-1/3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t.biometrics.cancel}
          </button>
          <button
            id="trigger-biometric-scan-btn"
            disabled={isScanning || scanSuccess}
            onClick={handleStartScan}
            className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
          >
            {isScanning
              ? t.biometrics.scanning
              : scanSuccess
              ? t.biometrics.verified
              : authMode === 'fingerprint'
              ? t.biometrics.scanFinger
              : t.biometrics.scanFace}
          </button>
        </div>
      </div>
    </div>
  );
};
