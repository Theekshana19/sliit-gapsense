import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BatchReadinessExportData, BatchReadinessLedgerRow } from '../models/batch-readiness/batch-readiness.model';

export const BATCH_READINESS_PDF_FILENAME = 'Batch-Readiness-Overview-Report.pdf';

function riskLabel(r: BatchReadinessLedgerRow['riskUi']): string {
  if (r === 'high') {
    return 'High Risk';
  }
  if (r === 'medium') {
    return 'Medium Risk';
  }
  return 'Low Risk';
}

function statusLabel(s: BatchReadinessLedgerRow['statusUi']): string {
  if (s === 'intervention') {
    return 'Intervention Pending';
  }
  if (s === 'monitoring') {
    return 'Monitoring';
  }
  return 'On Track';
}

export function downloadBatchReadinessOverviewPdf(data: BatchReadinessExportData): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 63, 135);
  doc.text('Batch Readiness Overview', margin, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exported: ${new Date().toLocaleString()}`, margin, y);

  y += 6;
  doc.text(`Filters: ${data.filterDescription}`, margin, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 43, 75);
  doc.text('Summary', margin, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const sum = data.summary;
  doc.text(`Total Students: ${sum.totalStudents}`, margin, y);
  y += 6;
  doc.text(`High-Risk Count: ${sum.highRiskCount}`, margin, y);
  y += 6;
  doc.text(`Batch Readiness Score: ${sum.batchReadinessScorePercent}%`, margin, y);
  if (sum.scoreDeltaPercent != null) {
    y += 6;
    doc.text(`Score delta vs cohort baseline: ${sum.scoreDeltaPercent >= 0 ? '+' : ''}${sum.scoreDeltaPercent}%`, margin, y);
  }

  const tableStartY = y + 10;
  const body = data.ledgerRows.map((row) => [
    row.studentId,
    row.fullName,
    row.module,
    `${row.scorePercent}%`,
    riskLabel(row.riskUi),
    statusLabel(row.statusUi),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Student ID', 'Name', 'Module', 'Score', 'Risk Level', 'Status']],
    body,
    styles: { fontSize: 8, cellPadding: 1.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [0, 63, 135], textColor: 255, fontStyle: 'bold' },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  doc.save(BATCH_READINESS_PDF_FILENAME);
}
