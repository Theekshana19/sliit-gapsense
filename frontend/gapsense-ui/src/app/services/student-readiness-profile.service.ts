import { computed, Injectable, signal } from '@angular/core';
import type { BatchOption } from '../models/risk-analysis/batch-option.model';
import type { GroupOption } from '../models/risk-analysis/group-option.model';
import type { SemesterOption } from '../models/risk-analysis/semester-option.model';
import type { StudentOption } from '../models/risk-analysis/student-option.model';
import type { StudentReadinessProfileViewModel } from '../models/risk-analysis/student-readiness-profile.model';

const MOCK_SEMESTERS: SemesterOption[] = [
  { id: 'sem-y3s1', label: 'Year 3, Semester 1' },
  { id: 'sem-y3s2', label: 'Year 3, Semester 2' },
];

const MOCK_BATCHES: BatchOption[] = [
  { id: 'batch-y3s1-it21', label: 'IT21 Intake', semesterId: 'sem-y3s1' },
  { id: 'batch-y3s1-it20', label: 'IT20 Intake', semesterId: 'sem-y3s1' },
  { id: 'batch-y3s2-it21', label: 'IT21 Intake', semesterId: 'sem-y3s2' },
];

const MOCK_GROUPS: GroupOption[] = [
  { id: 'grp-y3s1-a', label: 'Group A', batchId: 'batch-y3s1-it21' },
  { id: 'grp-y3s1-b', label: 'Group B', batchId: 'batch-y3s1-it21' },
  { id: 'grp-y3s1-c', label: 'Group A', batchId: 'batch-y3s1-it20' },
  { id: 'grp-y3s2-a', label: 'Group A', batchId: 'batch-y3s2-it21' },
];

const MOCK_STUDENTS: StudentOption[] = [
  { id: 'stu-kaveen', label: 'Wickramasinghe, K. (SE20445692)', groupId: 'grp-y3s1-a' },
  { id: 'stu-jay', label: 'Jayasekara, A. (IT210452)', groupId: 'grp-y3s1-a' },
  { id: 'stu-per', label: 'Perera, M. (IT210892)', groupId: 'grp-y3s1-a' },
  { id: 'stu-sil', label: 'Silva, K. (IT210123)', groupId: 'grp-y3s1-b' },
  { id: 'stu-ann', label: 'Anne, B. (IT210200)', groupId: 'grp-y3s1-c' },
  { id: 'stu-kum', label: 'Kumar, R. (IT210901)', groupId: 'grp-y3s2-a' },
];

const PROFILE_KAVEEN: StudentReadinessProfileViewModel = {
  summary: {
    studentId: 'SE20445692',
    fullName: 'Kaveen Wickramasinghe',
    yearSemesterText: 'Year 3 Semester 1',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face',
    module: 'Advanced Algorithms',
    attendance: '92%',
    status: 'active',
  },
  riskLevel: {
    label: 'Elevated',
    description: 'Student is currently showing a 40% readiness deficit in core logic modules.',
    requiresIntervention: true,
  },
  credentials: [
    { id: 'c1', icon: 'workspace_premium', label: 'Top 10% Attendance', iconColorClass: 'text-blue-600' },
    { id: 'c2', icon: 'speed', label: 'Fast Learner', inactive: true },
    { id: 'c3', icon: 'menu_book', label: 'Resource Heavy', iconColorClass: 'text-blue-600' },
    { id: 'c4', icon: 'military_tech', label: 'Logic Pro', iconColorClass: 'text-amber-500' },
  ],
  topicMastery: {
    overallPercent: 60,
    proficientLabel: 'Proficient',
    lastAssessmentText: '2 days ago',
    items: [
      { topicName: 'Dynamic Programming', percent: 85, barColor: 'primary' },
      { topicName: 'Graph Theory', percent: 32, barColor: 'error' },
      { topicName: 'Complexity Analysis', percent: 62, barColor: 'secondary' },
    ],
  },
  assessmentTrajectory: {
    items: [
      { id: 'a1', assessmentName: 'Diagnostic Quiz 01', date: 'Oct 12, 2023', score: '72/100', outcome: 'ready', trendDirection: 'up', trendPercent: '+5%' },
      { id: 'a2', assessmentName: 'Mid-Semester Check', date: 'Nov 05, 2023', score: '45/100', outcome: 'not_ready', trendDirection: 'down', trendPercent: '-27%' },
      { id: 'a3', assessmentName: 'Logic Proficiency', date: 'Nov 28, 2023', score: '58/100', outcome: 'marginal', trendDirection: 'up', trendPercent: '+13%' },
    ],
    canNavigatePrev: false,
    canNavigateNext: true,
  },
};

const PROFILE_ALT: StudentReadinessProfileViewModel = {
  ...PROFILE_KAVEEN,
  summary: {
    ...PROFILE_KAVEEN.summary,
    fullName: 'Jayasekara, A.',
    studentId: 'IT210452',
    yearSemesterText: 'Year 3 Semester 1',
  },
};

const PROFILE_BY_STUDENT: Record<string, StudentReadinessProfileViewModel> = {
  'stu-kaveen': PROFILE_KAVEEN,
  'stu-jay': PROFILE_ALT,
  'stu-per': PROFILE_ALT,
  'stu-sil': PROFILE_ALT,
  'stu-ann': PROFILE_ALT,
  'stu-kum': PROFILE_ALT,
};

/**
 * Mock student readiness profile with cascading filters and search.
 * Replace catalog + buildProfile with HTTP when backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class StudentReadinessProfileService {
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

  readonly allSemesters = MOCK_SEMESTERS;

  readonly batchOptions = computed(() => {
    const sid = this._semesterId();
    if (!sid) return [];
    return MOCK_BATCHES.filter((b) => b.semesterId === sid);
  });

  readonly groupOptions = computed(() => {
    const bid = this._batchId();
    if (!bid) return [];
    return MOCK_GROUPS.filter((g) => g.batchId === bid);
  });

  readonly studentOptionsBase = computed(() => {
    const gid = this._groupId();
    if (!gid) return [];
    return MOCK_STUDENTS.filter((s) => s.groupId === gid);
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
    const id = this._studentId();
    if (!id) return null;
    return PROFILE_BY_STUDENT[id] ?? PROFILE_KAVEEN;
  });

  initDefaults(): void {
    const sem = MOCK_SEMESTERS[0];
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
