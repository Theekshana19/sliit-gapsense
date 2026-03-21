import { Injectable, signal } from '@angular/core';
import { RiskHeatmapCell, RiskReport } from '../models/risk-analysis/risk-analysis.model';

const reportsSeed: RiskReport[] = [
  {
    id: 'rp-1',
    title: 'Assessment drift — Week 06',
    generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    severity: 'high',
    summary: 'Submission variance increased 18% vs cohort baseline.',
  },
  {
    id: 'rp-2',
    title: 'Lab attendance correlation',
    generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    severity: 'medium',
    summary: 'Lower attendance aligns with weaker quiz outcomes in IT3020.',
  },
];

const heatmapSeed: RiskHeatmapCell[] = [
  { id: 'h-1', skill: 'Testing', module: 'IT3020', riskScore: 62 },
  { id: 'h-2', skill: 'SQL joins', module: 'IT3010', riskScore: 48 },
  { id: 'h-3', skill: 'Threat modeling', module: 'IT3030', riskScore: 71 },
  { id: 'h-4', skill: 'Requirements', module: 'IT3020', riskScore: 35 },
];

@Injectable({ providedIn: 'root' })
export class RiskAnalysisService {
  private readonly reports = signal<RiskReport[]>([...reportsSeed]);
  private readonly heatmap = signal<RiskHeatmapCell[]>([...heatmapSeed]);

  reportList(): RiskReport[] {
    return this.reports();
  }

  heatmapCells(): RiskHeatmapCell[] {
    return this.heatmap();
  }

  filterReports(query: string): RiskReport[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.reportList();
    }
    return this.reports().filter(
      (r) => r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q),
    );
  }
}
