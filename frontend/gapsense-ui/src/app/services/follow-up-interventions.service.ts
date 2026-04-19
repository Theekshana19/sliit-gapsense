import { inject, Injectable } from '@angular/core';
import type { CourseModuleDto, StudentInterventionDto } from './optional-modules-api.service';
import { OptionalModulesApiService } from './optional-modules-api.service';
import { StudentInterventionPlansService } from './student-intervention-plans.service';
import type { InterventionType, RiskGroup } from '../models/monitoring/monitoring.model';

const NOTES_SCHEMA_VERSION = 1;

interface InterventionNotesV1 {
  readonly v: typeof NOTES_SCHEMA_VERSION;
  moduleCode: string | null;
  riskGroup: RiskGroup;
  interventionType: InterventionType;
  dueDate: string | null;
  isDraft: boolean;
  administrativeNotes: string;
}

const INTERVENTION_TYPES: readonly InterventionType[] = [
  'extra-support',
  'learning-resource',
  'remedial',
  'mentoring',
  'workshop',
  'tutorial',
  'group-discussion',
] as const;

export interface FollowUpRow {
  id: string;
  photoUrl: string;
  name: string;
  studentId: string;
  module: string;
  interventionLabel: string;
  interventionIcon: string;
  interventionTone: 'secondary' | 'surface';
  dateLine1: string;
  dateLine1Class: string;
  dateLine2: string;
  dateLine2Class: string;
  status: 'overdue' | 'pending' | 'completed';
  dimmed?: boolean;
  actions: 'check_note' | 'history_only';
  rawNotes: string | null;
  serverStatus: 'open' | 'closed';
}

export interface FollowUpNoteFeedItem {
  id: string;
  initials: string;
  initialsBg: string;
  lecturer: string;
  student: string;
  timeAgo: string;
  body: string;
}

const PLACEHOLDER_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="20" fill="#e2e8f0"/></svg>',
  );

@Injectable({ providedIn: 'root' })
export class FollowUpInterventionsService {
  private readonly api = inject(OptionalModulesApiService);
  private readonly interventionPlans = inject(StudentInterventionPlansService);

  async loadAll(): Promise<{ rows: FollowUpRow[]; dtos: StudentInterventionDto[] }> {
    const [dtos, modules] = await Promise.all([
      this.api.fetchInterventions(),
      this.interventionPlans.loadCourseModules(),
    ]);
    const byCode = new Map(modules.map((m) => [m.code.toUpperCase(), m]));
    return { rows: dtos.map((dto) => this.mapDto(dto, byCode)), dtos };
  }

  async patch(id: string, partial: { status?: 'open' | 'closed'; notes?: string | null }): Promise<StudentInterventionDto | null> {
    return this.api.patchStudentIntervention(id, partial);
  }

  buildNoteFeed(source: StudentInterventionDto[]): FollowUpNoteFeedItem[] {
    return source
      .filter((d) => (d.notes && d.notes.trim().length > 0) || d.title.trim().length > 0)
      .slice(0, 8)
      .map((d) => ({
        id: d.id,
        initials: 'R',
        initialsBg: 'bg-sky-100 text-[#003f87]',
        lecturer: 'Intervention record',
        student: d.studentUserId,
        timeAgo: this.formatRelative(d.createdAtUtc),
        body: d.notes?.trim() || d.title,
      }));
  }

  private formatRelative(iso: string): string {
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) {
      return '';
    }
    const diffMs = Date.now() - t;
    const hrs = Math.floor(diffMs / 3600000);
    if (hrs < 24) {
      return `${Math.max(0, hrs) || '<1'}h ago`;
    }
    const days = Math.floor(diffMs / 86400000);
    return `${days}d ago`;
  }

  private mapDto(dto: StudentInterventionDto, modulesByCode: Map<string, CourseModuleDto>): FollowUpRow {
    const parsed = this.tryParseNotes(dto.notes);
    const codeUpper = parsed?.moduleCode?.trim().toUpperCase() ?? '';
    const module =
      codeUpper && modulesByCode.has(codeUpper)
        ? `${(modulesByCode.get(codeUpper) as CourseModuleDto).title}`
        : codeUpper || '—';

    const interventionType = this.normalizeType(parsed?.interventionType);
    const label = this.typeLabel(interventionType);
    const icon = this.typeIcon(interventionType);
    const serverStatus = dto.status.toLowerCase() === 'closed' ? 'closed' : 'open';

    const due = parsed?.dueDate?.trim();
    const { line1, line1Class, line2, line2Class, rowStatus } = this.deriveDates(due, serverStatus, dto.createdAtUtc);

    const studentGuid = dto.studentUserId;
    const short = studentGuid.replace(/-/g, '').slice(-6);

    return {
      id: dto.id,
      photoUrl: PLACEHOLDER_AVATAR,
      name: `Student ${short}`,
      studentId: studentGuid,
      module,
      interventionLabel: label,
      interventionIcon: icon,
      interventionTone: serverStatus === 'closed' ? 'surface' : 'secondary',
      dateLine1: line1,
      dateLine1Class: line1Class,
      dateLine2: line2,
      dateLine2Class: line2Class,
      status: rowStatus,
      dimmed: serverStatus === 'closed',
      actions: serverStatus === 'closed' ? 'history_only' : 'check_note',
      rawNotes: dto.notes,
      serverStatus,
    };
  }

  private deriveDates(
    dueYmd: string | undefined,
    serverStatus: 'open' | 'closed',
    createdAtUtc: string,
  ): {
    line1: string;
    line1Class: string;
    line2: string;
    line2Class: string;
    rowStatus: 'overdue' | 'pending' | 'completed';
  } {
    if (serverStatus === 'closed') {
      return {
        line1: this.formatDisplayDate(createdAtUtc),
        line1Class: 'text-slate-600',
        line2: 'Closed',
        line2Class: 'font-bold uppercase text-emerald-600',
        rowStatus: 'completed',
      };
    }

    const due = dueYmd ? this.parseYmd(dueYmd) : null;
    const today = this.startOfDay(new Date());
    if (due) {
      const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
      const line1 = this.formatLocalDate(due);
      if (diffDays < 0) {
        return {
          line1,
          line1Class: 'text-red-600',
          line2: `${Math.abs(diffDays)}d overdue`,
          line2Class: 'text-red-600',
          rowStatus: 'overdue',
        };
      }
      if (diffDays === 0) {
        return {
          line1,
          line1Class: 'text-[#003f87]',
          line2: 'Today',
          line2Class: 'text-slate-500 uppercase',
          rowStatus: 'pending',
        };
      }
      return {
        line1,
        line1Class: 'text-[#003f87]',
        line2: `In ${diffDays}d`,
        line2Class: 'text-slate-500 uppercase',
        rowStatus: 'pending',
      };
    }

    return {
      line1: this.formatDisplayDate(createdAtUtc),
      line1Class: 'text-slate-600',
      line2: 'No due date',
      line2Class: 'text-slate-500 uppercase',
      rowStatus: 'pending',
    };
  }

  private parseYmd(ymd: string): Date | null {
    const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
    if (!p) {
      return null;
    }
    return new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  }

  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private formatDisplayDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso.slice(0, 10);
    }
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private formatLocalDate(d: Date): string {
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
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

  private normalizeType(t: string | undefined): InterventionType {
    if (t && (INTERVENTION_TYPES as readonly string[]).includes(t)) {
      return t as InterventionType;
    }
    return 'tutorial';
  }

  private typeLabel(type: InterventionType): string {
    const map: Record<string, string> = {
      'extra-support': 'Extra Support',
      'learning-resource': 'Learning Resource',
      remedial: 'Remedial',
      mentoring: 'Mentoring',
      workshop: 'Workshop',
      tutorial: 'Tutorial',
      'group-discussion': 'Group Discussion',
    };
    return map[type] ?? type;
  }

  private typeIcon(type: InterventionType): string {
    const map: Record<string, string> = {
      'extra-support': 'support_agent',
      'learning-resource': 'menu_book',
      remedial: 'construction',
      mentoring: 'school',
      workshop: 'groups',
      tutorial: 'auto_stories',
      'group-discussion': 'forum',
    };
    return map[type] ?? 'health_and_safety';
  }
}
