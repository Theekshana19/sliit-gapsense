import { inject, Injectable } from '@angular/core';
import type { CourseModuleDto, StudentInterventionDto } from './optional-modules-api.service';
import { OptionalModulesApiService } from './optional-modules-api.service';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { RiskTrendsSummaryViewModel } from '../models/risk-analysis/risk-trends-summary.model';
import type { WeakTopicAnalysisViewModel } from '../models/risk-analysis/weak-topic-analysis.model';

const NOTES_V = 1;

/** Minimal parse for Step 6 JSON notes `moduleCode`. */
function tryParseModuleCodeFromNotes(notes: string | null | undefined): string | null {
  if (!notes) {
    return null;
  }
  const t = notes.trim();
  if (!t.startsWith('{')) {
    return null;
  }
  try {
    const o = JSON.parse(t) as { v?: number; moduleCode?: string | null };
    if (o && o.v === NOTES_V && o.moduleCode) {
      return o.moduleCode.trim().toUpperCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

export interface ReportSnapshot {
  modules: CourseModuleDto[];
  interventions: StudentInterventionDto[];
  weakTopics: WeakTopicAnalysisViewModel | null;
  riskTrends: RiskTrendsSummaryViewModel | null;
}

export interface InterventionReportRow {
  id: string;
  title: string;
  meta: string;
  moduleLabel: string;
  studentId: string;
  statusLabel: string;
  isPdf: boolean;
}

@Injectable({ providedIn: 'root' })
export class ReportsSnapshotService {
  private readonly optional = inject(OptionalModulesApiService);
  private readonly analytics = inject(StudentAnalyticsApiService);

  async loadSnapshot(moduleCodeForWeakTopics: string | undefined): Promise<ReportSnapshot> {
    const [modules, interventions, weakTopics, riskTrends] = await Promise.all([
      this.optional.fetchCourseModules(),
      this.optional.fetchInterventions(),
      this.analytics.fetchWeakTopics(moduleCodeForWeakTopics),
      this.analytics.fetchRiskTrends(),
    ]);
    return { modules, interventions, weakTopics, riskTrends };
  }

  interventionTableRows(
    interventions: StudentInterventionDto[],
    modules: CourseModuleDto[],
  ): InterventionReportRow[] {
    const byCode = new Map(modules.map((m) => [m.code.toUpperCase(), `${m.code} — ${m.title}`]));
    return interventions.map((dto) => {
      const code = tryParseModuleCodeFromNotes(dto.notes);
      const moduleLabel =
        code && byCode.has(code) ? (byCode.get(code) as string) : code || '—';
      const st = (dto.status || '').toLowerCase();
      const statusLabel = st === 'closed' ? 'COMPLETED' : 'PENDING';
      return {
        id: dto.id,
        title: dto.title,
        meta: new Date(dto.createdAtUtc).toLocaleString(),
        moduleLabel,
        studentId: dto.studentUserId,
        statusLabel,
        isPdf: false,
      };
    });
  }

  buildInterventionsCsv(rows: StudentInterventionDto[], modules: CourseModuleDto[]): string {
    const byCode = new Map(modules.map((m) => [m.code.toUpperCase(), m.code]));
    const header = 'studentUserId,module,riskLevel,readinessScore,interventionStatus';
    const lines = rows.map((dto) => {
      const code = tryParseModuleCodeFromNotes(dto.notes);
      const module = code && byCode.has(code) ? (byCode.get(code) as string) : code || '';
      const status = (dto.status || '').toLowerCase();
      return [
        this.escape(dto.studentUserId),
        this.escape(module),
        this.escape(''),
        this.escape(''),
        this.escape(status),
      ].join(',');
    });
    return [header, ...lines].join('\r\n');
  }

  appendWeakTopicSummaryCsv(base: string, weak: WeakTopicAnalysisViewModel | null, moduleCode: string): string {
    if (!weak) {
      return base;
    }
    const s = weak.summary;
    const extra = [
      '',
      `# Weak topic summary (module filter: ${this.escape(moduleCode)})`,
      `totalTopicsEvaluated,${s.totalTopicsEvaluated}`,
      `weakTopicsIdentified,${s.weakTopicsIdentified}`,
      `criticalWeakAreas,${s.criticalWeakAreas}`,
    ].join('\r\n');
    return `${base}\r\n${extra}`;
  }

  downloadCsv(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private escape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
