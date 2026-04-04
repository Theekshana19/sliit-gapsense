import { Injectable, inject } from '@angular/core';
import { OptionalModulesApiService } from './optional-modules-api.service';
import { InterventionPlan, InterventionType, RiskGroup } from '../models/monitoring/monitoring.model';

const INTERVENTION_TYPES: InterventionType[] = [
  'extra-support',
  'learning-resource',
  'remedial',
  'mentoring',
  'workshop',
  'tutorial',
  'group-discussion',
];

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly api = inject(OptionalModulesApiService);

  async fetchPlans(): Promise<InterventionPlan[]> {
    const dtos = await this.api.fetchInterventions();
    return dtos.map((d) => this.mapDtoToPlan(d));
  }

  async createPlan(input: {
    studentRef: string;
    title: string;
    notes: string;
    status: InterventionPlan['status'];
  }): Promise<boolean> {
    const status = input.status === 'completed' ? 'closed' : 'open';

    return await this.api.createIntervention({
      studentUserId: input.studentRef,
      title: input.title,
      notes: input.notes || null,
      status,
    });
  }

  private mapDtoToPlan(d: {
    id: string;
    studentUserId: string;
    title: string;
    notes: string | null;
    status: string;
    createdAtUtc: string;
  }): InterventionPlan {
    // API only stores open/closed; treat open as an active follow-up in the UI.
    const status: InterventionPlan['status'] = d.status === 'closed' ? 'completed' : 'active';

    const moduleCode = this.pickNoteField(d.notes, 'Module')?.toUpperCase() ?? '';
    const dueFromNotes = this.pickNoteField(d.notes, 'Due');
    const dueDate =
      dueFromNotes && /^\d{4}-\d{2}-\d{2}$/.test(dueFromNotes)
        ? dueFromNotes
        : d.createdAtUtc
          ? d.createdAtUtc.slice(0, 10)
          : '';

    const riskRaw = (this.pickNoteField(d.notes, 'Risk') ?? '').toLowerCase();
    const riskGroup: RiskGroup =
      riskRaw === 'high' || riskRaw === 'medium' || riskRaw === 'low' ? riskRaw : 'medium';

    const typeRaw = (this.pickNoteField(d.notes, 'Type') ?? '').toLowerCase();
    const interventionType: InterventionType = INTERVENTION_TYPES.includes(typeRaw as InterventionType)
      ? (typeRaw as InterventionType)
      : 'tutorial';

    return {
      id: d.id,
      title: d.title,
      studentRef: d.studentUserId,
      courseCode: moduleCode,
      actions: d.notes ?? '',
      dueDate,
      status,
      riskGroup,
      interventionType,
    };
  }

  /** Reads "Label: value" lines from multi-line notes produced by the intervention form. */
  private pickNoteField(notes: string | null, label: string): string | null {
    if (!notes) return null;
    const re = new RegExp(`^${label}:\\s*(.+)$`, 'im');
    const m = notes.match(re);
    const v = m?.[1]?.trim();
    return v && v.length > 0 ? v : null;
  }
}
