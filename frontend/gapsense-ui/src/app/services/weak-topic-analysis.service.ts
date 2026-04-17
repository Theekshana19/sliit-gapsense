import { computed, inject, Injectable, signal } from '@angular/core';
import { StudentAnalyticsApiService } from './student-analytics-api.service';
import { OptionalModulesApiService } from './optional-modules-api.service';
import type { BatchOption } from '../models/risk-analysis/batch-option.model';
import type { GroupOption } from '../models/risk-analysis/group-option.model';
import type { ModuleOption } from '../models/risk-analysis/module-option.model';
import type { SemesterOption } from '../models/risk-analysis/semester-option.model';
import type { StudentOption } from '../models/risk-analysis/student-option.model';
import type { WeakTopicAnalysisViewModel } from '../models/risk-analysis/weak-topic-analysis.model';

const SCOPE_SEMESTERS: SemesterOption[] = [{ id: 'all', label: 'Current account' }];
const SCOPE_BATCHES: BatchOption[] = [{ id: 'all', label: 'All intakes', semesterId: 'all' }];
const SCOPE_GROUPS: GroupOption[] = [{ id: 'all', label: 'All groups', batchId: 'all' }];
const SCOPE_STUDENTS: StudentOption[] = [{ id: 'me', label: 'Signed-in student', groupId: 'all' }];

@Injectable({ providedIn: 'root' })
export class WeakTopicAnalysisService {
  private readonly analyticsApi = inject(StudentAnalyticsApiService);
  private readonly modulesApi = inject(OptionalModulesApiService);

  private readonly _remoteAnalysis = signal<WeakTopicAnalysisViewModel | null>(null);
  private readonly _moduleCatalog = signal<ModuleOption[]>([]);
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

  readonly allSemesters = SCOPE_SEMESTERS;

  readonly moduleOptions = computed(() => this._moduleCatalog());

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

  readonly studentOptions = computed(() => {
    const gid = this._groupId();
    if (!gid) return [];
    return SCOPE_STUDENTS.filter((s) => s.groupId === gid);
  });

  readonly selectedStudentLabel = computed(() => {
    const id = this._studentId();
    return SCOPE_STUDENTS.find((s) => s.id === id)?.label ?? '';
  });

  readonly analysis = computed((): WeakTopicAnalysisViewModel | null => this._remoteAnalysis());

  initDefaults(): void {
    const sem = SCOPE_SEMESTERS[0];
    if (!sem) return;
    this._semesterId.set(sem.id);
    this.cascadeAfterSemester();
  }

  /** Load module codes from the API, then weak-topic analysis for the first module (or all modules if none). */
  async loadCatalogAndAnalysis(): Promise<void> {
    const mods = await this.modulesApi.fetchCourseModules();
    const opts: ModuleOption[] = mods.map((m) => ({
      id: m.code,
      label: `${m.code} — ${m.title}`,
    }));
    this._moduleCatalog.set(opts);
    const firstCode = opts[0]?.id;
    if (firstCode) {
      this._moduleId.set(firstCode);
      await this.tryLoadFromApi(firstCode);
    } else {
      this._moduleId.set(null);
      await this.tryLoadFromApi();
    }
  }

  /** Load dashboard from API (latest quiz/readiness topics for current user). */
  async tryLoadFromApi(moduleCode?: string): Promise<void> {
    const code = moduleCode ?? this._moduleId() ?? undefined;
    const data = await this.analyticsApi.fetchWeakTopics(code);
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
    void this.tryLoadFromApi(id || undefined);
  }

  clearExportNotice(): void {
    this._exportNotice.set(null);
  }

  clearDeployNotice(): void {
    this._deployNotice.set(null);
  }

  requestExportDetailedPdf(): void {
    const msg = WeakTopicAnalysisService.PDF_PLACEHOLDER_MSG;
    this._exportNotice.set(msg);
    window.setTimeout(() => {
      if (this._exportNotice() === msg) {
        this._exportNotice.set(null);
      }
    }, 8000);
  }

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
  }
}
