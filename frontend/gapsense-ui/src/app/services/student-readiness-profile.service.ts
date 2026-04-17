import { computed, inject, Injectable, signal } from '@angular/core';
import type { AssessmentOutcome } from '../models/risk-analysis/assessment-trajectory-item.model';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { BatchOption } from '../models/risk-analysis/batch-option.model';
import type { GroupOption } from '../models/risk-analysis/group-option.model';
import type { SemesterOption } from '../models/risk-analysis/semester-option.model';
import type { StudentOption } from '../models/risk-analysis/student-option.model';
import type { StudentReadinessProfileViewModel } from '../models/risk-analysis/student-readiness-profile.model';

const SCOPE_SEMESTERS: SemesterOption[] = [{ id: 'all', label: 'Current account' }];
const SCOPE_BATCHES: BatchOption[] = [{ id: 'all', label: 'All intakes', semesterId: 'all' }];
const SCOPE_GROUPS: GroupOption[] = [{ id: 'all', label: 'All groups', batchId: 'all' }];
const SCOPE_STUDENTS: StudentOption[] = [{ id: 'me', label: 'Signed-in student', groupId: 'all' }];

type ReadinessProfileApiPayload = {
  studentDisplayName: string;
  studentCode: string;
  recentAssessments: Array<{
    id: string;
    assessmentName: string;
    date: string;
    score: string;
    outcome: string;
    trendDirection: string;
    trendPercent: string;
  }>;
};

@Injectable({ providedIn: 'root' })
export class StudentReadinessProfileService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly _apiMe = signal<ReadinessProfileApiPayload | null>(null);

  private readonly _searchQuery = signal('');
  private readonly _semesterId = signal<string | null>(null);
  private readonly _batchId = signal<string | null>(null);
  private readonly _groupId = signal<string | null>(null);
  private readonly _studentId = signal<string | null>(null);
  private readonly _exportNotice = signal<string | null>(null);
  private readonly _notifyNotice = signal<string | null>(null);

  readonly searchQuery = this._searchQuery.asReadonly();
  readonly semesterId = this._semesterId.asReadonly();
  readonly batchId = this._batchId.asReadonly();
  readonly groupId = this._groupId.asReadonly();
  readonly studentId = this._studentId.asReadonly();
  readonly exportNotice = this._exportNotice.asReadonly();
  readonly notifyNotice = this._notifyNotice.asReadonly();

  readonly allSemesters = SCOPE_SEMESTERS;

  readonly batchOptions = computed(() => {
    const sid = this._semesterId();
    if (!sid) return [];
    return SCOPE_BATCHES.filter((b) => b.semesterId === sid);
  });

  readonly groupOptions = computed(() => {
    const bid = this._batchId();
    if (!bid) return [];
    return SCOPE_GROUPS.filter((g) => g.batchId === bid);
  });

  readonly studentOptionsBase = computed(() => {
    const gid = this._groupId();
    if (!gid) return [];
    return SCOPE_STUDENTS.filter((s) => s.groupId === gid);
  });

  readonly studentOptions = computed(() => {
    const base = this.studentOptionsBase();
    const q = (this._searchQuery() ?? '').trim().toLowerCase();
    const currentId = this._studentId();
    if (!q) return base;
    const filtered = base.filter((s) => s.label.toLowerCase().includes(q));
    const currentInBase = base.find((s) => s.id === currentId);
    if (currentInBase && !filtered.some((s) => s.id === currentId)) {
      return [currentInBase, ...filtered];
    }
    return filtered;
  });

  readonly profile = computed((): StudentReadinessProfileViewModel | null => {
    const api = this._apiMe();
    if (!api) return null;
    return profileFromApi(api);
  });

  async tryLoadFromApi(): Promise<void> {
    const data = await this.analyticsApi.fetchReadinessProfile();
    if (data) this._apiMe.set(data);
  }

  initDefaults(): void {
    const sem = SCOPE_SEMESTERS[0];
    if (!sem) return;
    this._semesterId.set(sem.id);
    this.cascadeAfterSemester();
  }

  setSearchQuery(value: string): void {
    this._searchQuery.set(value ?? '');
  }

  setSemesterId(id: string): void {
    this._semesterId.set(id);
    this.cascadeAfterSemester();
  }

  setBatchId(id: string): void {
    this._batchId.set(id);
    this.cascadeAfterBatch();
  }

  setGroupId(id: string): void {
    this._groupId.set(id);
    this.cascadeAfterGroup();
  }

  setStudentId(id: string): void {
    this._studentId.set(id);
  }

  clearExportNotice(): void {
    this._exportNotice.set(null);
  }

  clearNotifyNotice(): void {
    this._notifyNotice.set(null);
  }

  requestExportPdf(): void {
    const msg = 'PDF export will be available when the reporting API is connected.';
    this._exportNotice.set(msg);
    window.setTimeout(() => {
      if (this._exportNotice() === msg) this._exportNotice.set(null);
    }, 8000);
  }

  requestNotifyStudent(): void {
    const msg = 'Notify Student will send an email when the notification API is connected.';
    this._notifyNotice.set(msg);
    window.setTimeout(() => {
      if (this._notifyNotice() === msg) this._notifyNotice.set(null);
    }, 8000);
  }

  navigateTrajectoryPrev(): void {
    // Placeholder: future pagination
  }

  navigateTrajectoryNext(): void {
    // Placeholder: future pagination
  }

  private cascadeAfterSemester(): void {
    const batches = this.batchOptions();
    const first = batches[0]?.id ?? null;
    this._batchId.set(first);
    this.cascadeAfterBatch();
  }

  private cascadeAfterBatch(): void {
    const groups = this.groupOptions();
    const first = groups[0]?.id ?? null;
    this._groupId.set(first);
    this.cascadeAfterGroup();
  }

  private cascadeAfterGroup(): void {
    const students = this.studentOptionsBase();
    const first = students[0]?.id ?? null;
    this._studentId.set(first);
  }
}

function profileFromApi(api: ReadinessProfileApiPayload): StudentReadinessProfileViewModel {
  const items = api.recentAssessments.map((r) => ({
    id: r.id,
    assessmentName: r.assessmentName,
    date: r.date,
    score: r.score,
    outcome: mapTrajectoryOutcome(r.outcome),
    trendDirection: r.trendDirection === 'down' ? ('down' as const) : ('up' as const),
    trendPercent: r.trendPercent,
  }));

  const sorted = [...api.recentAssessments].sort((a, b) => b.date.localeCompare(a.date));
  const last = sorted[0];
  const overall = last ? parseLeadingPercent(last.score) : 0;

  return {
    summary: {
      studentId: api.studentCode,
      fullName: api.studentDisplayName,
      yearSemesterText: '—',
      avatarUrl: '',
      module: '—',
      attendance: '—',
      status: 'active',
    },
    riskLevel: {
      label: overall >= 60 ? 'On track' : overall >= 40 ? 'Moderate' : 'Needs attention',
      description: 'Based on your most recent assessments in the list below.',
      requiresIntervention: overall < 40,
    },
    credentials: [],
    topicMastery: {
      overallPercent: overall,
      proficientLabel: overall >= 60 ? 'Proficient' : 'Building',
      lastAssessmentText: last?.date ?? '—',
      items: [],
    },
    assessmentTrajectory: {
      items,
      canNavigatePrev: false,
      canNavigateNext: false,
    },
  };
}

function parseLeadingPercent(score: string): number {
  const m = /^(\d+)/.exec(score.trim());
  return m ? Math.min(100, Math.max(0, parseInt(m[1], 10))) : 0;
}

function mapTrajectoryOutcome(o: string): AssessmentOutcome {
  if (o === 'needs_work') return 'not_ready';
  if (o === 'ready' || o === 'not_ready' || o === 'marginal') return o;
  return 'marginal';
}
