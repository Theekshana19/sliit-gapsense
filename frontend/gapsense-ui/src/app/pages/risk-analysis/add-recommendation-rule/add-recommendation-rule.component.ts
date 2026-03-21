import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
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
import {
  formatTriggerPreview,
} from '../../../models/risk-analysis/recommendation-rule.model';
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
export class AddRecommendationRuleComponent {
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

  protected readonly initialRule = computed(() => {
    const id = this.editId();
    if (!id) return null;
    return this.service.getById(id) ?? null;
  });

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
    return this.service.hasConflict(
      v.moduleId,
      v.topic,
      this.editId() ?? undefined
    );
  });

  protected readonly conflictMessage = computed(() => {
    const v = this.previewBody();
    if (!v) return '';
    const mod = MODULE_OPTIONS.find((m) => m.id === v.moduleId)?.label ?? v.moduleId;
    return `A rule with similar logic (Module: ${mod}, Topic: ${v.topic}) already exists. Saving this will create Version 2 of the intervention logic for this topic.`;
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
      const rule = this.initialRule();
      if (rule) {
        this.headerForm.patchValue({ isActive: rule.isActive });
      } else {
        this.headerForm.patchValue({ isActive: true });
      }
      this.conflictDismissed.set(false);
    });
  }

  protected onFormValue(v: RecommendationRuleFormBody): void {
    this.previewBody.set(v);
  }

  protected dismissConflict(): void {
    this.conflictDismissed.set(true);
  }

  protected discard(): void {
    this.router.navigate(['/recommendation-rules']);
  }

  protected save(): void {
    const cmp = this.ruleForm();
    if (!cmp) return;
    cmp.markAllTouched();
    if (cmp.invalid) return;
    const body = cmp.getValue();
    const isActive = this.headerForm.get('isActive')?.value ?? true;
    const full = mergeRecommendationForm(body, !!isActive);
    const id = this.editId();
    if (id) {
      this.service.update(id, full);
    } else {
      this.service.create(full);
    }
    this.router.navigate(['/recommendation-rules']);
  }

  protected saveDisabled(): boolean {
    return this.ruleForm()?.invalid ?? true;
  }
}
