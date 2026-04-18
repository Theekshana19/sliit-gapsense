import { inject, Injectable } from '@angular/core';
import type { CourseModuleDto, StudentInterventionDto } from './optional-modules-api.service';
import { OptionalModulesApiService } from './optional-modules-api.service';
import type {
  InterventionPlan,
  InterventionStatus,
  InterventionType,
  RiskGroup,
} from '../models/monitoring/monitoring.model';

const NOTES_SCHEMA_VERSION = 1 as const;

const INTERVENTION_TYPES: readonly InterventionType[] = [
  'extra-support',
  'learning-resource',
  'remedial',
  'mentoring',
  'workshop',
  'tutorial',
  'group-discussion',
] as const;

interface InterventionNotesV1 {
  readonly v: typeof NOTES_SCHEMA_VERSION;
  moduleCode: string | null;
  riskGroup: RiskGroup;
  interventionType: InterventionType;
  dueDate: string | null;
  isDraft: boolean;
  /** UI status when server row is still `open` (only `open`/`closed` exist on the server). */
  uiStatus?: InterventionStatus;
  administrativeNotes: string;
}

export interface CreateInterventionWizardPayload {
  moduleCode: string;
  studentUserId: string;
  riskGroup: RiskGroup;
  title: string;
  interventionType: InterventionType;
  dueDate: string;
  uiStatus: InterventionStatus;
  administrativeNotes: string;
  isDraft: boolean;
}

@Injectable({ providedIn: 'root' })
export class StudentInterventionPlansService {
  private readonly api = inject(OptionalModulesApiService);

  async loadCourseModules(): Promise<CourseModuleDto[]> {
    return this.api.fetchCourseModules();
  }

  async loadPlans(): Promise<InterventionPlan[]> {
    const [rows, modules] = await Promise.all([this.api.fetchInterventions(), this.api.fetchCourseModules()]);
    const byCode = new Map(modules.map((m) => [m.code.toUpperCase(), m]));
    return rows.map((r) => this.mapDtoToPlan(r, byCode));
  }

  async createFromWizard(payload: CreateInterventionWizardPayload): Promise<boolean> {
    const status = this.mapUiStatusToApi(payload.uiStatus, payload.isDraft);
    const notes = this.serializeNotes(payload);
    return this.api.createIntervention({
      studentUserId: payload.studentUserId.trim(),
      title: payload.title.trim(),
      notes,
      status,
    });
  }

  private mapUiStatusToApi(ui: InterventionStatus, isDraft: boolean): string {
    if (isDraft) {
      return 'open';
    }
    if (ui === 'completed') {
      return 'closed';
    }
    return 'open';
  }

  private serializeNotes(p: CreateInterventionWizardPayload): string {
    const meta: InterventionNotesV1 = {
      v: NOTES_SCHEMA_VERSION,
      moduleCode: p.moduleCode ? p.moduleCode.trim().toUpperCase() : null,
      riskGroup: p.riskGroup,
      interventionType: p.interventionType,
      dueDate: p.dueDate.trim() || null,
      isDraft: p.isDraft,
      uiStatus: p.uiStatus,
      administrativeNotes: p.administrativeNotes.trim(),
    };
    return JSON.stringify(meta);
  }

  private mapDtoToPlan(dto: StudentInterventionDto, modulesByCode: Map<string, CourseModuleDto>): InterventionPlan {
    const parsed = this.tryParseNotes(dto.notes);
    const codeUpper = parsed?.moduleCode?.trim().toUpperCase() ?? '';
    const courseCode =
      codeUpper && modulesByCode.has(codeUpper) ? (modulesByCode.get(codeUpper) as CourseModuleDto).code : codeUpper || '—';

    const riskGroup: RiskGroup =
      parsed?.riskGroup === 'high' || parsed?.riskGroup === 'medium' || parsed?.riskGroup === 'low'
        ? parsed.riskGroup
        : 'medium';

    const interventionType = this.normalizeInterventionType(parsed?.interventionType);

    const apiStatus = dto.status.toLowerCase() === 'closed' ? 'closed' : 'open';
    const status = this.mapApiStatusToUi(apiStatus, parsed);

    const dueDate = parsed?.dueDate?.trim() || dto.createdAtUtc.slice(0, 10);
    const actions = parsed?.administrativeNotes?.trim() || (dto.notes?.trim() && !parsed ? dto.notes.trim() : '—');

    return {
      id: dto.id,
      title: dto.title,
      studentRef: dto.studentUserId,
      courseCode,
      actions,
      dueDate,
      status,
      riskGroup,
      interventionType,
      apiStatus,
    };
  }

  private mapApiStatusToUi(api: 'open' | 'closed', parsed: InterventionNotesV1 | null): InterventionStatus {
    if (api === 'closed') {
      return 'completed';
    }
    if (parsed?.isDraft) {
      return 'planned';
    }
    const u = parsed?.uiStatus;
    if (u === 'planned' || u === 'active') {
      return u;
    }
    return 'active';
  }

  private tryParseNotes(notes: string | null | undefined): InterventionNotesV1 | null {
    if (!notes) {
      return null;
    }
    const t = notes.trim();
    if (!t.startsWith('{')) {
      return null;
    }
    try {
      const o = JSON.parse(t) as unknown;
      if (o && typeof o === 'object' && (o as { v?: number }).v === NOTES_SCHEMA_VERSION) {
        return o as InterventionNotesV1;
      }
    } catch {
      /* ignore */
    }
    return null;
  }

  private normalizeInterventionType(t: string | undefined): InterventionType {
    if (t && (INTERVENTION_TYPES as readonly string[]).includes(t)) {
      return t as InterventionType;
    }
    return 'tutorial';
  }
}
