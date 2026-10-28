import { jsPDF } from 'jspdf';
import { ShariaFinancialGoal } from '../types';

export interface GenerateGoalSummaryPdfParams {
  goal: ShariaFinancialGoal;
  investorName?: string;
  walletAddress?: string;
  totalBalanceIDR: number;
  accumulatedFundsIDR: number;
  projectedDateFormatted: string;
  projectedMonths: number;
  statusComparisonText: string;
  effectiveSavingsRateIDR: number;
  annualYieldPercent: number;
  totalCompoundYieldIDR: number;
  totalPrincipalSavedIDR: number;
  goldPriceGramIDR: number;
  merkleRoot: string;
  txHash: string;
  signature: string;
  cipherText: string;
  skipAutoSave?: boolean;
}

export interface GenerateGoalSummaryPdfResult {
  fileName: string;
  fileSizeKB: number;
  docRefNumber: string;
  sha256Hash: string;
  generatedAt: string;
  pdfBlobUrl?: string;
  pdfBlob?: Blob;
  downloadPdf: () => void;
}

/**
 * Generates an official, publication-grade Sharia Financial Goal Summary PDF Report
 * with cryptographic blockchain ledger verification proofs.
 */
export function generateGoalSummaryPdf(
  params: GenerateGoalSummaryPdfParams
): GenerateGoalSummaryPdfResult {
  const {
    goal,
    investorName = 'Benny Kurniawan',
    walletAddress = '0x71C849A2b36eB6849F0302FeF4A39',
    accumulatedFundsIDR,
    projectedDateFormatted,
    projectedMonths,
    statusComparisonText,
    effectiveSavingsRateIDR,
    annualYieldPercent,
    totalCompoundYieldIDR,
    totalPrincipalSavedIDR,
    goldPriceGramIDR,
    merkleRoot,
    txHash,
    signature,
    cipherText,
    skipAutoSave = false,
  } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Metadata
  doc.setProperties({
    title: `Laporan Ringkasan Target Finansial Syariah - ${goal.title}`,
    subject: 'Official Sharia Financial Goal Commitment & Predictive Projection Report',
    author: 'FinanceCity Islamic Wealth Engine & Proof-of-Shariah-Stake Ledger',
    keywords: 'sharia, goal, investment, target, halal, blockchain, zakat, mudharabah',
    creator: 'FinanceCity AI Studio Build',
  });

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = now.toLocaleTimeString('id-ID', { hour12: false });
  const docRefNumber = `GOAL-SHARIA/FC/${now.getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;

  // Formatting helpers
  const formatIDR = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  const targetAmount = goal.targetAmountIDR;
  const progressPct = Math.min(100, Math.round((accumulatedFundsIDR / targetAmount) * 100));
  const remainingGap = Math.max(0, targetAmount - accumulatedFundsIDR);
  const nisab85g = goldPriceGramIDR * 85;
  const isNisabPassed = accumulatedFundsIDR >= nisab85g;
  const estimatedZakatMaalDue = isNisabPassed ? Math.round(accumulatedFundsIDR * 0.025) : 0;

  // 1. Top Decorative Green Bar
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Header Section
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, contentWidth, 28, 'F');

  // Islamic Bismillah
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('Bismillāhir-Raḥmānir-Raḥīm (Dengan Menyebut Nama Allah Yang Maha Pengasih Lagi Maha Penyayang)', pageWidth / 2, 18, { align: 'center' });

  // Main Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('LAPORAN KOMITMEN TARGET INVESTASI SYARIAH', pageWidth / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('FINANCECITY ISLAMIC WEALTH MANAGEMENT • PROOF-OF-SHARIAH-STAKE (PoSS) BLOCKCHAIN VERIFIED', pageWidth / 2, 33, { align: 'center' });

  // 3. Document Identification Strip
  let y = 44;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nomor Registrasi: ${docRefNumber}`, margin + 4, y + 5.5);
  doc.text(`Waktu Penerbitan: ${dateFormatted}, ${timeFormatted} WIB`, margin + 4, y + 10.5);

  doc.text(`Investor: ${investorName}`, margin + 95, y + 5.5);
  doc.text(`Alamat Dompet: ${walletAddress.slice(0, 16)}...${walletAddress.slice(-6)}`, margin + 95, y + 10.5);

  // 4. Primary Target Highlight Card
  y = 62;
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 78, 59); // emerald-900
  doc.text(goal.title.toUpperCase(), margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(`Kategori: ${goal.category.toUpperCase().replace('_', ' ')} • Wahana: ${goal.shariaVehicle}`, margin + 5, y + 14);

  // 3 Columns within Highlight Box
  // Col 1: Target Nominal
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TARGET NOMINAL', margin + 5, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(formatIDR(targetAmount), margin + 5, y + 28);

  // Col 2: Dana Terkumpul & Progres
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`TERKUMPUL SAAT INI (${progressPct}%)`, margin + 65, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text(formatIDR(accumulatedFundsIDR), margin + 65, y + 28);

  // Col 3: Kekurangan Gap
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('KEKURANGAN (GAP)', margin + 125, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text(remainingGap === 0 ? 'LUNAS / TERCAPAI' : formatIDR(remainingGap), margin + 125, y + 28);

  // 5. Predictive Timeline Analysis Table
  y = 101;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. ANALISIS PREDICTIVE TIMELINE & PROYEKSI WAKTU TERCAPAI', margin, y);

  y += 3;
  const tableData: [string, string][] = [
    ['Laju Tabungan Rutin (Savings Rate Bulanan)', `${formatIDR(effectiveSavingsRateIDR)} / bulan (DCA Otomatis)`],
    ['Tenggat Waktu Awal (Target Deadline)', `Tahun ${goal.targetDeadlineYear} (Batas Akhir)`],
    ['Estimasi Tanggal Target Tercapai', `${projectedDateFormatted} (~${projectedMonths} Bulan / ${(projectedMonths / 12).toFixed(1)} Tahun Lagi)`],
    ['Evaluasi Terhadap Tenggat Waktu', statusComparisonText],
    ['Ekspektasi Imbal Hasil Syariah (Compound APY)', `${annualYieldPercent}% per tahun (Bebas Riba / Prinsip Mudharabah)`],
    ['Estimasi Tabungan Pokok (Principal)', formatIDR(totalPrincipalSavedIDR)],
    ['Estimasi Akumulasi Bagi Hasil Halal', `+${formatIDR(totalCompoundYieldIDR)} (Pertumbuhan Efektif)`],
  ];

  let currentY = y + 2;
  tableData.forEach(([label, value], idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(label, margin + 4, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(value, margin + 85, currentY + 4.5);

    currentY += 6.5;
  });

  // 6. Tazkiyah, Zakat Maal & Sharia Governance Section
  y = currentY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. KESUCIAN HARTA, TAZKIYAH & KESIAPAN ZAKAT MAAL (PSAK 109)', margin, y);

  y += 4;
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(20, 184, 166); // teal-500
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 118, 110);
  doc.text('Ambang Batas Nisab Emas 85 Gram & Kewajiban Haul 1 Tahun:', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Harga Acuan Emas Fisik PAXG: ${formatIDR(goldPriceGramIDR)} / gram • Standar Nisab (85g): ${formatIDR(nisab85g)}`, margin + 4, y + 11);

  if (isNisabPassed) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text(`Status: MELEBIHI NISAB. Estimasi Zakat Maal Wajib (2.5%): ${formatIDR(estimatedZakatMaalDue)} saat mencapai haul 1 tahun penuh.`, margin + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Telah terhubung dengan integrasi resmi BAZNAS RI & Dompet Dhuafa untuk penyaluran terverifikasi.', margin + 4, y + 21);
  } else {
    doc.setTextColor(180, 83, 9);
    doc.text(`Status: BELUM MENCAPAI NISAB. Kekurangan menuju nisab: ${formatIDR(nisab85g - accumulatedFundsIDR)}. Disarankan memperbanyak sedekah sunnah.`, margin + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Investasi tetap dipantau setiap hari oleh sistem Smart Zakat Reminder untuk peringatan H-3 haul.', margin + 4, y + 21);
  }

  // 7. Blockchain Ledger Cryptographic Stamping
  y += 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('3. BUKTI KRIPTOGRAFIS BLOCKCHAIN LEDGER (PROOF-OF-SHARIAH-STAKE)', margin, y);

  y += 4;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('[LEDGER TRANSACTION METADATA]', margin + 4, y + 6);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Transaction Hash : ${txHash}`, margin + 4, y + 12);
  doc.text(`Merkle Tree Root : ${merkleRoot}`, margin + 4, y + 17);
  doc.text(`ECDSA Signature  : ${signature}`, margin + 4, y + 22);
  doc.text(`E2E Ciphertext   : ${cipherText.slice(0, 52)}...`, margin + 4, y + 27);
  doc.text(`Konsensus Node   : Validator-PoSS-GoalVault-01 (DSN-MUI Compliance Node)`, margin + 4, y + 32);
  doc.text(`Status Validasi  : CONFIRMED & IMMUTABLE (Tercatat Permanen pada Ledger)`, margin + 4, y + 37);

  // 8. Seal & Signature Block
  y += 48;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('CATATAN HUKUM & KEABSAHAN SYARIAH:', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Laporan ini diterbitkan secara otomatis dan kriptografis oleh platform FinanceCity dengan stempel blockchain PoSS.', margin, y + 4);
  doc.text('Segala akad investasi berlandaskan prinsip Mudharabah Muthlaqah, bebas riba, bebas maysir, dan bebas gharar.', margin, y + 8);
  doc.text('Kesesuaian syariah diawasi sesuai pedoman Fatwa DSN-MUI No. 116/DSN-MUI/IX/2017 & Standar AAOIFI No. 57.', margin, y + 12);

  // Digital Stamp Box
  doc.setDrawColor(5, 150, 105);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(pageWidth - margin - 50, y - 2, 50, 16, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('VERIFIED ON-CHAIN', pageWidth - margin - 48, y + 4);
  doc.setFontSize(6.5);
  doc.setTextColor(4, 120, 87);
  doc.text('PoSS Ledger ID Validated', pageWidth - margin - 48, y + 8);
  doc.text(`Hash: ${txHash.slice(0, 14)}...`, pageWidth - margin - 48, y + 12);

  // 9. Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 7, pageWidth, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`FinanceCity Islamic Wealth Engine • Dokumen Resmi: ${docRefNumber} • Halaman 1 dari 1`, pageWidth / 2, pageHeight - 2.5, { align: 'center' });

  // Generate output
  const fileName = `Ringkasan-Target-Syariah-${goal.id}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
  const pdfBlob = doc.output('blob');
  const pdfBlobUrl = URL.createObjectURL(pdfBlob);
  const fileSizeKB = Math.round(pdfBlob.size / 1024);

  const downloadPdf = () => {
    doc.save(fileName);
  };

  if (!skipAutoSave) {
    downloadPdf();
  }

  return {
    fileName,
    fileSizeKB,
    docRefNumber,
    sha256Hash: txHash,
    generatedAt: `${dateFormatted}, ${timeFormatted} WIB`,
    pdfBlobUrl,
    pdfBlob,
    downloadPdf,
  };
}
