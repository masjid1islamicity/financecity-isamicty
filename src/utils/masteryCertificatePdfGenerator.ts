import { jsPDF } from 'jspdf';
import { MasteryCertificate } from '../types';

export interface GenerateMasteryCertificateParams {
  certificate: MasteryCertificate;
  investorWallet?: string;
  skipAutoSave?: boolean;
}

export interface GenerateMasteryCertificateResult {
  fileName: string;
  docRefNumber: string;
  downloadPdf: () => void;
  pdfBlobUrl?: string;
}

/**
 * Generates an official, publication-grade Certificate of Sharia Finance & Investment Mastery
 * in landscape A4 format with Islamic aesthetic geometric borders, verification seal,
 * and cryptographic blockchain hash.
 */
export function generateMasteryCertificatePdf(
  params: GenerateMasteryCertificateParams
): GenerateMasteryCertificateResult {
  const {
    certificate,
    investorWallet = '0x71C849A2b36eB6849F0302FeF4A39',
    skipAutoSave = false,
  } = params;

  // A4 Landscape: 297mm width x 210mm height
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Background subtle cream fill
  doc.setFillColor(252, 253, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Outer Border (Deep Emerald)
  doc.setDrawColor(6, 78, 59); // emerald-900
  doc.setLineWidth(1.8);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

  // Inner Border (Gold)
  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.8);
  doc.rect(13, 13, pageWidth - 26, pageHeight - 26, 'S');

  // Decorative Corner Rosettes
  const corners = [
    [15, 15],
    [pageWidth - 15, 15],
    [15, pageHeight - 15],
    [pageWidth - 15, pageHeight - 15],
  ];
  doc.setFillColor(217, 119, 6);
  corners.forEach(([cx, cy]) => {
    doc.circle(cx, cy, 2, 'F');
  });

  // Top Arabic Bismillah Calligraphy (Text representation)
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('Bismi-llahi r-Rahmani r-Rahim', pageWidth / 2, 24, { align: 'center' });

  // Academy Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(6, 78, 59); // deep emerald
  doc.text('FINANCECITY ISLAMICITY ACADEMY', pageWidth / 2, 33, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('GLOBAL SHARIA CAPITAL MARKETS & DIGITAL WEALTH INSTITUTE', pageWidth / 2, 38, { align: 'center' });

  // Gold separator line with diamond
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.6);
  doc.line(60, 42, pageWidth - 60, 42);
  doc.setFillColor(217, 119, 6);
  doc.circle(pageWidth / 2, 42, 1.5, 'F');

  // Certificate Title
  doc.setFont('times', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('CERTIFICATE OF FINANCE & INVESTMENT MASTERY', pageWidth / 2, 51, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('This is to certify that', pageWidth / 2, 58, { align: 'center' });

  // Recipient Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(certificate.recipientName || 'Benny Kurniawan', pageWidth / 2, 69, { align: 'center' });

  // Underline for name
  const nameWidth = doc.getTextWidth(certificate.recipientName || 'Benny Kurniawan');
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line((pageWidth - nameWidth) / 2 - 10, 71, (pageWidth + nameWidth) / 2 + 10, 71);

  // Body Description
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const certBody = [
    'has successfully completed the comprehensive curriculum and rigorous assessment in',
    'Sharia Financial Engineering, AAOIFI Standard No. 57 Compliance, Algorithmic Risk Management,',
    'Halal Digital Asset Valuation, and Zakat Maal Portfolio Optimization with exemplary distinction.',
  ];
  doc.text(certBody[0], pageWidth / 2, 79, { align: 'center' });
  doc.text(certBody[1], pageWidth / 2, 85, { align: 'center' });
  doc.text(certBody[2], pageWidth / 2, 91, { align: 'center' });

  // Achievement Badges Box
  const boxY = 100;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.setLineWidth(0.4);
  doc.roundedRect(40, boxY, pageWidth - 80, 28, 3, 3, 'FD');

  // Badge 1: Grade / Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text('EXAM SCORE & GRADE', 65, boxY + 7);
  doc.setFontSize(14);
  doc.setTextColor(4, 120, 87);
  doc.text(`${certificate.score}% (${certificate.grade})`, 65, boxY + 15);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Mumtaz / Distinction Tier', 65, boxY + 21);

  // Vertical line
  doc.setDrawColor(203, 213, 225);
  doc.line(115, boxY + 4, 115, boxY + 24);

  // Badge 2: Accreditation
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text('SHARIA GOVERNANCE', 135, boxY + 7);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('AAOIFI No. 57 & DSN-MUI 140', 135, boxY + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Proof-of-Shariah-Stake Validated', 135, boxY + 21);

  // Vertical line
  doc.line(195, boxY + 4, 195, boxY + 24);

  // Badge 3: Issue Date & Credential ID
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 78, 59);
  doc.text('CREDENTIAL VERIFICATION', 215, boxY + 7);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(certificate.certificateId, 215, boxY + 14);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${certificate.issueDate}`, 215, boxY + 21);

  // Cryptographic Ledger Verification Section
  const cryptoBoxY = 135;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(30, cryptoBoxY, pageWidth - 60, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ON-CHAIN CRYPTOGRAPHIC PROOF (BLOCKCHAIN LEDGER PoSS)', 36, cryptoBoxY + 6);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Proof Hash   : ${certificate.verificationHash}`, 36, cryptoBoxY + 12);
  doc.text(`Wallet Sign  : ${investorWallet} | Nonce: ${certificate.certificateId.replace(/\D/g, '') || '948271'}`, 36, cryptoBoxY + 17);
  doc.text(`Consensus    : PoSS Halal Mainnet Node-01 | Block #${certificate.blockNumber || 1420}`, 36, cryptoBoxY + 22);

  // Signatures & Stamp
  const sigY = 168;

  // Left Signature: Sharia Board
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(45, sigY + 12, 105, sigY + 12);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Prof. Dr. Ahmad Al-Farabi, Ph.D.', 75, sigY + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of Sharia Supervisory Board', 75, sigY + 17, { align: 'center' });
  doc.setFontSize(7);
  doc.text('DSN-MUI Certified Sharia Advisor', 75, sigY + 21, { align: 'center' });

  // Center Emblem / Seal
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.circle(pageWidth / 2, sigY + 8, 12, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SEAL OF MASTERY', pageWidth / 2, sigY + 6, { align: 'center' });
  doc.text('★ HALAL ★', pageWidth / 2, sigY + 11, { align: 'center' });

  // Right Signature: Chief Algorithmic Financial Engineer
  doc.line(192, sigY + 12, 252, sigY + 12);
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('H. Benny Kurniawan, M.Fin, CFA', 222, sigY + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Chief Quantitative Financial Engineer', 222, sigY + 17, { align: 'center' });
  doc.setFontSize(7);
  doc.text('FinanceCity Islamicity Protocol', 222, sigY + 21, { align: 'center' });

  // Bottom Notice
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This credential is mathematically verifiable via FinanceCity Blockchain Ledger. Authenticity guaranteed under AAOIFI & DSN-MUI criteria.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  const fileName = `Certificate_Mastery_${certificate.certificateId}.pdf`;

  if (!skipAutoSave) {
    doc.save(fileName);
  }

  let pdfBlobUrl: string | undefined;
  try {
    const pdfBlob = doc.output('blob');
    pdfBlobUrl = URL.createObjectURL(pdfBlob);
  } catch {
    // blob url fallback
  }

  return {
    fileName,
    docRefNumber: certificate.certificateId,
    downloadPdf: () => doc.save(fileName),
    pdfBlobUrl,
  };
}
