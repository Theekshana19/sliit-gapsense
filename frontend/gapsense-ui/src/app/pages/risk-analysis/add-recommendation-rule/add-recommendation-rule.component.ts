import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TopBarComponent } from '../../../components/layout/top-bar/top-bar.component';
import { SidebarComponent } from '../../../components/layout/sidebar/sidebar.component';
import { RecommendationConflictAlertComponent } from '../../../components/risk-analysis/recommendation-conflict-alert/recommendation-conflict-alert.component';
import { RecommendationGuidelinesPanelComponent } from '../../../components/risk-analysis/recommendation-guidelines-panel/recommendation-guidelines-panel.component';
import { RecommendationLivePreviewComponent } from '../../../components/risk-analysis/recommendation-live-preview/recommendation-live-preview.component';
import { RecommendationRuleFormComponent } from '../../../components/risk-analysis/recommendation-rule-form/recommendation-rule-form.component';
import { MODULE_OPTIONS } from '../../../models/risk-analysis/module-topic.constants';
import {
  mergeRecommendationForm,
  type RecommendationRuleFormBody,
} from '../../../models/risk-analysis/recommendation-rule-form.model';
import { formatTriggerPreview } from '../../../models/risk-analysis/recommendation-rule.model';
import type { RecommendationRule } from '../../../models/risk-analysis/recommendation-rule.model';
import { PRIORITY_LABELS } from '../../../models/risk-analysis/recommendation-priority.model';
import { RecommendationRuleService } from '../../../services/recommendation-rule.service';

@Component({
  selector: 'app-add-recommendation-rule',
  standalone: true,
  imports: [
    TopBarComponent,
    SidebarComponent,
    ReactiveFormsModule,
    RouterLink,
    RecommendationConflictAlertComponent,
    RecommendationRuleFormComponent,
    RecommendationLivePreviewComponent,
    RecommendationGuidelinesPanelComponent,
  ],
  templateUrl: './add-recommendation-rule.component.html',
  styleUrl: './add-recommendation-rule.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddRecommendationRuleComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  protected readonly service = inject(RecommendationRuleService);

  protected readonly ruleForm = viewChild(RecommendationRuleFormComponent);

  protected readonly headerForm = this.fb.group({
    isActive: [true],
  });

  protected readonly editId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null as string | null }
  );

  protected readonly loadedRule = signal<RecommendationRule | null>(null);
  protected readonly editLoading = signal(false);
  protected readonly saveInProgress = signal(false);

  protected readonly initialRule = computed(() => this.loadedRule());

  protected readonly pageTitle = computed(() =>
    this.editId() ? 'Edit Recommendation Rule' : 'Add Recommendation Rule'
  );

  protected readonly breadcrumbCurrent = computed(() =>
    this.editId() ? 'Edit Rule' : 'Add Rule'
  );

  protected readonly previewBody = signal<RecommendationRuleFormBody | null>(null);

  protected readonly conflictDismissed = signal(false);

  protected readonly showConflict = computed(() => {
    if (this.conflictDismissed()) return false;
    const v = this.previewBody();
    if (!v) return false;
    return this.service.hasDuplicateComposite(
      v.moduleId,
      v.topic,
      v.conditionType,
      v.scoreThreshold,
      this.editId() ?? undefined
    );
  });

  protected readonly conflictMessage = computed(() => {
    const v = this.previewBody();
    if (!v) return '';
    const mod =
      MODULE_OPTIONS.find((m) => m.id === v.moduleId)?.label ?? v.moduleId;
    return `A rule already exists for this module, topic, trigger condition, and score threshold (${mod}, ${v.topic}). Change one of these fields or edit the existing rule.`;
  });

  protected readonly triggerLabel = computed(() => {
    const v = this.previewBody();
    if (!v) return '';
    return formatTriggerPreview(v.conditionType, v.scoreThreshold);
  });

  protected readonly priorityLabel = computed(() => {
    const v = this.previewBody();
    if (!v) return '';
    return PRIORITY_LABELS[v.priorityLevel];
  });

  constructor() {
    effect(() => {
      const rule = this.loadedRule();
      if (rule) {
        this.headerForm.patchValue({ isActive: rule.isActive });
      } else if (!this.editId()) {
        this.headerForm.patchValue({ isActive: true });
      }
      this.conflictDismissed.set(false);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      void this.loadRuleForEdit(id);
    } else {
      this.loadedRule.set(null);
    }
  }

  private async loadRuleForEdit(id: string): Promise<void> {
    this.editLoading.set(true);
    this.loadedRule.set(null);
    let rule: RecommendationRule | undefined = this.service.getById(id);
    if (!rule) {
      const loaded = await this.service.loadById(id);
      if (loaded) rule = loaded;
    }
    this.editLoading.set(false);
    if (rule) {
      this.loadedRule.set(rule);
    } else {
      void this.router.navigate(['/recommendation-rules']);
    }
  }

  protected onFormValue(v: RecommendationRuleFormBody): void {
    this.previewBody.set(v);
  }

  protected dismissConflict(): void {
    this.conflictDismissed.set(true);
  }

  protected discard(): void {
    void this.router.navigate(['/recommendation-rules']);
  }

  protected async save(): Promise<void> {
    const cmp = this.ruleForm();
    if (!cmp) return;
    cmp.markAllTouched();
    if (cmp.invalid) return;

    this.saveInProgress.set(true);
    this.service.clearError();

    const body = cmp.getValue();
    const isActive = this.headerForm.get('isActive')?.value ?? true;
    const full = mergeRecommendationForm(body, !!isActive);

    const id = this.editId();
    const pending = cmp.getPendingFile();
    const cleared = cmp.getAttachmentCleared();

    let attachmentPath: string | null = this.loadedRule()?.attachmentPath ?? null;
    if (cleared) {
      attachmentPath = null;
    }
    if (pending) {
      const uploaded = await this.service.uploadAttachment(pending);
      if (!uploaded) {
        this.saveInProgress.set(false);
        return;
      }
      attachmentPath = uploaded;
    }

    let ok: boolean;
    if (id) {
      const result = await this.service.update(id, full, attachmentPath);
      ok = result !== null;
    } else {
      const result = await this.service.create(full, attachmentPath);
      ok = result !== null;
    }

    this.saveInProgress.set(false);
    if (!ok) return;

    await this.service.loadAll();
    void this.router.navigate(['/recommendation-rules']);
  }

  protected saveDisabled(): boolean {
    return (
      (this.ruleForm()?.invalid ?? true) ||
      this.saveInProgress() ||
      this.editLoading()
    );
  }
}
