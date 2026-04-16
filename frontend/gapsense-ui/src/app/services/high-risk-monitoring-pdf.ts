import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MonitoringSummary, StudentProfileListItem } from '../models/student-monitoring/student-monitoring.model';

/** File name for the downloaded report (browser may append (1) if the name already exists). */
export const HIGH_RISK_MONITORING_PDF_FILENAME = 'High-Risk-Students-Report.pdf';

function riskLabelForPdf(level: string): string {
  const v = level?.toLowerCase() ?? '';
  if (v === 'critical') {
    return 'Critical';
  }
  if (v === 'low') {
    return 'Low Risk';
  }
  return 'Moderate';
}

export interface HighRiskMonitoringPdfInput {
  summary: MonitoringSummary | null;
  /** Rows to include in the queue table (e.g. filtered list matching the UI). */
  students: StudentProfileListItem[];
  /** Human-readable filter label shown on the PDF. */
  filterLabel: string;
}

/**
 * Builds a PDF from summary KPIs and queue rows, then triggers a download (no print dialog).
 */
export function downloadHighRiskMonitoringPdf(input: HighRiskMonitoringPdfInput): void {
  const { summary, students, filterLabel } = input;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 14;
  let y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(0, 63, 135);
  doc.text('High-Risk Student Monitoring', margin, y);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Exported: ${new Date().toLocaleString()}`, margin, y);

  y += 6;
  doc.text(`Queue filter: ${filterLabel}`, margin, y);

  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 43, 75);
  doc.text('Summary', margin, y);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const fmt = (n: number | undefined | null) => (n == null ? '—' : String(n));
  const s = summary;
  doc.text(`Critical Risk Cases: ${fmt(s?.criticalRiskCases)}`, margin, y);
  y += 6;
  doc.text(`Active Interventions: ${fmt(s?.activeInterventions)}`, margin, y);
  y += 6;
  doc.text(
    `Students Recovered: ${fmt(s?.studentsRecovered)} (success rate ${fmt(s?.successRatePercent)}%)`,
    margin,
    y,
  );

  const tableStartY = y + 10;

  const body = students.map((row) => [
    row.studentId,
    row.fullName,
    row.currentModule,
    riskLabelForPdf(row.riskLevel),
    row.weakTopicNames?.length ? row.weakTopicNames.join(', ') : '—',
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Student ID', 'Name', 'Module', 'Risk Level', 'Weak Topics']],
    body,
    styles: { fontSize: 8, cellPadding: 1.5, textColor: [30, 41, 59] },
    headStyles: { fillColor: [0, 63, 135], textColor: 255, fontStyle: 'bold' },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.1,
  });

  doc.save(HIGH_RISK_MONITORING_PDF_FILENAME);
}
