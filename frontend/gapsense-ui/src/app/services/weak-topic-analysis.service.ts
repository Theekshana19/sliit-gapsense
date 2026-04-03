import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import type { BatchOption } from '../models/risk-analysis/batch-option.model';
import type { GroupOption } from '../models/risk-analysis/group-option.model';
import type { ModuleOption } from '../models/risk-analysis/module-option.model';
import type { SemesterOption } from '../models/risk-analysis/semester-option.model';
import type { StudentOption } from '../models/risk-analysis/student-option.model';
import type { WeakTopicAnalysisViewModel } from '../models/risk-analysis/weak-topic-analysis.model';
import type { WeakTopicMatrixRow } from '../models/risk-analysis/weak-topic-row.model';

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
  { id: 'stu-jay', label: 'Jayasekara, A. (IT210452)', groupId: 'grp-y3s1-a' },
  { id: 'stu-per', label: 'Perera, M. (IT210892)', groupId: 'grp-y3s1-a' },
  { id: 'stu-sil', label: 'Silva, K. (IT210123)', groupId: 'grp-y3s1-b' },
  { id: 'stu-ann', label: 'Anne, B. (IT210200)', groupId: 'grp-y3s1-c' },
  { id: 'stu-kum', label: 'Kumar, R. (IT210901)', groupId: 'grp-y3s2-a' },
];

const MOCK_MODULES: ModuleOption[] = [
  { id: 'mod-se', label: 'Software Engineering' },
  { id: 'mod-db', label: 'Database Systems' },
  { id: 'mod-ds', label: 'Data Structures' },
];

const DEMO_MATRIX_SE: WeakTopicMatrixRow[] = [
  {
    topicName: 'Risk Analysis',
    blockLabel: 'Block: System Planning',
    currentScorePercent: 30,
    expectedLevelPercent: 75,
    weaknessLevel: 'critical',
    status: 'immediate_action',
  },
  {
    topicName: 'Requirement Planning',
    blockLabel: 'Block: SDLC Phases',
    currentScorePercent: 52,
    expectedLevelPercent: 75,
    weaknessLevel: 'moderate',
    status: 'scheduled_review',
  },
  {
    topicName: 'Functional Modeling',
    blockLabel: 'Block: System Design',
    currentScorePercent: 68,
    expectedLevelPercent: 75,
    weaknessLevel: 'minor',
    status: 'self_study',
  },
  {
    topicName: 'UML Diagrams',
    blockLabel: 'Block: Architecture',
    currentScorePercent: 82,
    expectedLevelPercent: 75,
    weaknessLevel: 'none',
    status: 'meeting_target',
  },
];

const DEMO_MATRIX_ALT: WeakTopicMatrixRow[] = [
  {
    topicName: 'Normalization',
    blockLabel: 'Block: Relational Design',
    currentScorePercent: 45,
    expectedLevelPercent: 70,
    weaknessLevel: 'moderate',
    status: 'scheduled_review',
  },
  {
    topicName: 'SQL Joins',
    blockLabel: 'Block: Querying',
    currentScorePercent: 72,
    expectedLevelPercent: 70,
    weaknessLevel: 'minor',
    status: 'self_study',
  },
];

/**
 * Mock weak-topic analysis with cascading filters. Replace catalog + `buildViewModel`
 * with HTTP responses when the backend is ready.
 */
@Injectable({ providedIn: 'root' })
export class WeakTopicAnalysisService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);

  private readonly _remoteAnalysis = signal<WeakTopicAnalysisViewModel | null>(null);
  private readonly _semesterId = signal<string | null>(null);
  private readonly _batchId = signal<string | null>(null);
  private readonly _groupId = signal<string | null>(null);
  private readonly _studentId = signal<string | null>(null);
  private readonly _moduleId = signal<string | null>(null);
  private readonly _exportNotice = signal<string | null>(null);
  private readonly _deployNotice = signal<string | null>(null);

  private static readonly PDF_PLACEHOLDER_MSG =
    'Detailed PDF export will be available when the reporting API is connected.';
  private static readonly DEPLOY_PLACEHOLDER_MSG =
    'Deploy recommendations will call the recommendations API when it is connected.';

  readonly semesterId = this._semesterId.asReadonly();
  readonly batchId = this._batchId.asReadonly();
  readonly groupId = this._groupId.asReadonly();
  readonly studentId = this._studentId.asReadonly();
  readonly moduleId = this._moduleId.asReadonly();
  readonly exportNotice = this._exportNotice.asReadonly();
  readonly deployNotice = this._deployNotice.asReadonly();

  readonly allSemesters = MOCK_SEMESTERS;
  readonly allModules = MOCK_MODULES;

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

  readonly studentOptions = computed(() => {
    const gid = this._groupId();
    if (!gid) return [];
    return MOCK_STUDENTS.filter((s) => s.groupId === gid);
  });

  readonly selectedStudentLabel = computed(() => {
    const id = this._studentId();
    return MOCK_STUDENTS.find((s) => s.id === id)?.label ?? '';
  });

  readonly analysis = computed((): WeakTopicAnalysisViewModel | null => {
    const remote = this._remoteAnalysis();
    if (remote) return remote;

    const studentId = this._studentId();
    const moduleId = this._moduleId();
    if (!studentId || !moduleId) return null;
    const student = MOCK_STUDENTS.find((s) => s.id === studentId);
    const mod = MOCK_MODULES.find((m) => m.id === moduleId);
    if (!student || !mod) return null;
    return this.buildViewModel(student.label, mod.id, mod.label);
  });

  initDefaults(): void {
    const sem = MOCK_SEMESTERS[0];
    if (!sem) return;
    this._semesterId.set(sem.id);
    this.cascadeAfterSemester();
  }

  /** Load dashboard from API (latest quiz/readiness topics for current user). */
  async tryLoadFromApi(moduleCode?: string): Promise<void> {
    const data = await this.analyticsApi.fetchWeakTopics(moduleCode);
    if (data) this._remoteAnalysis.set(data);
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

  setModuleId(id: string): void {
    this._moduleId.set(id);
  }

  clearExportNotice(): void {
    this._exportNotice.set(null);
  }

  clearDeployNotice(): void {
    this._deployNotice.set(null);
  }

  /**
   * Visible placeholder for matrix PDF — no backend call yet.
   * Shows a short on-screen notice the user can dismiss.
   */
  requestExportDetailedPdf(): void {
    const msg = WeakTopicAnalysisService.PDF_PLACEHOLDER_MSG;
    this._exportNotice.set(msg);
    window.setTimeout(() => {
      if (this._exportNotice() === msg) {
        this._exportNotice.set(null);
      }
    }, 8000);
  }

  /** Placeholder until POST /recommendations/deploy (or similar) exists. */
  requestDeployRecommendations(): void {
    const msg = WeakTopicAnalysisService.DEPLOY_PLACEHOLDER_MSG;
    this._deployNotice.set(msg);
    window.setTimeout(() => {
      if (this._deployNotice() === msg) {
        this._deployNotice.set(null);
      }
    }, 8000);
  }

  private cascadeAfterSemester(): void {
    const batches = this.batchOptions();
    const firstBatch = batches[0]?.id ?? null;
    this._batchId.set(firstBatch);
    this.cascadeAfterBatch();
  }

  private cascadeAfterBatch(): void {
    const groups = this.groupOptions();
    const firstGroup = groups[0]?.id ?? null;
    this._groupId.set(firstGroup);
    this.cascadeAfterGroup();
  }

  private cascadeAfterGroup(): void {
    const students = this.studentOptions();
    const firstStudent = students[0]?.id ?? null;
    this._studentId.set(firstStudent);
    if (!this._moduleId()) {
      this._moduleId.set(MOCK_MODULES[0]?.id ?? null);
    }
  }

  private buildViewModel(
    studentLabel: string,
    moduleKey: string,
    moduleLabel: string
  ): WeakTopicAnalysisViewModel {
    const matrixRows =
      moduleKey === 'mod-se' ? DEMO_MATRIX_SE : DEMO_MATRIX_ALT;

    const shortName = studentLabel.split('(')[0]?.trim() ?? studentLabel;

    const summary =
      moduleKey === 'mod-se'
        ? {
            totalTopicsEvaluated: 24,
            totalTopicsHelper: 'Across 6 assessment blocks',
            weakTopicsIdentified: 8,
            weakTopicsHelper: 'Score below institutional benchmark',
            criticalWeakAreas: 3,
            criticalHelper: 'Immediate intervention required',
          }
        : {
            totalTopicsEvaluated: 18,
            totalTopicsHelper: 'Across 5 assessment blocks',
            weakTopicsIdentified: 5,
            weakTopicsHelper: 'Score below institutional benchmark',
            criticalWeakAreas: 1,
            criticalHelper: 'Immediate intervention required',
          };

    return {
      summary,
      matrixRows,
      intervention: {
        items: [
          {
            icon: 'auto_stories',
            tone: 'error',
            title: 'Targeted Workshop: Risk Analysis',
            description: `Suggested session for ${shortName} to bridge gaps in system planning assessments (${moduleLabel}).`,
          },
          {
            icon: 'video_library',
            tone: 'secondary',
            title: 'Supplemental Content: SDLC Models',
            description:
              'Assign 3 video modules regarding Agile vs. Waterfall trade-offs.',
          },
        ],
      },
      projection: {
        subtitle:
          'Estimated readiness trajectory based on historical reassessment data.',
        bars: [
          { label: 'Week 1', heightPercent: 40, variant: 'historical' },
          { label: 'Week 2', heightPercent: 55, variant: 'historical' },
          { label: 'Week 3', heightPercent: 45, variant: 'historical' },
          { label: 'Week 4', heightPercent: 70, variant: 'historical' },
          { label: 'Projection', heightPercent: 85, variant: 'projection' },
        ],
        insightTemplate:
          '{{name}} is projected to reach {{percent}} average readiness by Week 6 with recommended interventions.',
        insightHighlightPercent: moduleKey === 'mod-se' ? 78 : 72,
      },
    };
  }
}
