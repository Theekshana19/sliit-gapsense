import {
  afterNextRender,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  type ValidatorFn,
} from '@angular/forms';
import { startWith } from 'rxjs';
import type { RecommendationRule } from '../../../models/risk-analysis/recommendation-rule.model';
import {
  DEFAULT_RECOMMENDATION_FORM,
  getRecommendationFieldError,
  isLinkResourceType as isLinkResourceTypeModel,
  isReadingMaterialResourceType,
  linkResourceUrlValidator,
  RECOMMENDATION_FORM_VALIDATORS,
  RESOURCE_TYPE_OPTIONS,
  type RecommendationRuleFormBody,
} from '../../../models/risk-analysis/recommendation-rule-form.model';
import {
  MODULE_OPTIONS,
  topicsForModule,
} from '../../../models/risk-analysis/module-topic.constants';
import { fileNameFromAttachmentPath } from '../../../models/risk-analysis/recommendation-rule.model';
import { CONDITION_TYPE_LABELS } from '../../../models/risk-analysis/recommendation-condition-type.model';
import { PRIORITY_LABELS } from '../../../models/risk-analysis/recommendation-priority.model';

@Component({
  selector: 'app-recommendation-rule-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './recommendation-rule-form.component.html',
  styleUrl: './recommendation-rule-form.component.css',
})
export class RecommendationRuleFormComponent {
  readonly initialRule = input<RecommendationRule | null>(null);

  readonly valueChange = output<RecommendationRuleFormBody>();

  readonly form: FormGroup;

  protected readonly conditionLabels = CONDITION_TYPE_LABELS;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly resourceTypes = RESOURCE_TYPE_OPTIONS;
  protected readonly MODULE_OPTIONS = MODULE_OPTIONS;

  private patchedRuleId: string | null = null;

  /** New file chosen for upload (parent uploads before save). */
  protected readonly pendingFile = signal<File | null>(null);
  /** User removed an existing server-side attachment. */
  protected readonly attachmentCleared = signal(false);

  private readonly readingAttachmentValidatorFn: ValidatorFn =
    (): ValidationErrors | null => {
      const rt = this.form?.get('resourceType')?.value as string;
      if (!isReadingMaterialResourceType(rt ?? '')) return null;
      const hasPending = !!this.pendingFile();
      const hasExisting = !!(
        this.initialRule()?.attachmentPath && !this.attachmentCleared()
      );
      if (hasPending || hasExisting) return null;
      return { readingAttachmentRequired: true };
    };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      ruleName: ['', RECOMMENDATION_FORM_VALIDATORS.ruleName],
      moduleId: ['', RECOMMENDATION_FORM_VALIDATORS.moduleId],
      topic: ['', RECOMMENDATION_FORM_VALIDATORS.topic],
      conditionType: ['scoreUnderThreshold', RECOMMENDATION_FORM_VALIDATORS.conditionType],
      scoreThreshold: [
        DEFAULT_RECOMMENDATION_FORM.scoreThreshold,
        RECOMMENDATION_FORM_VALIDATORS.scoreThreshold,
      ],
      recommendationTitle: ['', RECOMMENDATION_FORM_VALIDATORS.recommendationTitle],
      resourceType: [DEFAULT_RECOMMENDATION_FORM.resourceType],
      priorityLevel: [DEFAULT_RECOMMENDATION_FORM.priorityLevel, RECOMMENDATION_FORM_VALIDATORS.priorityLevel],
      resourceUrl: [''],
      administrativeRationale: [''],
    });

    this.form.addValidators(this.readingAttachmentValidatorFn);

    this.form
      .get('resourceType')!
      .valueChanges.pipe(
        startWith(this.form.get('resourceType')!.value),
        takeUntilDestroyed()
      )
      .subscribe((rt: string) => {
        if (isLinkResourceTypeModel(rt)) {
          this.pendingFile.set(null);
          this.resetFileInput();
        }
        this.applyResourceTypeState(rt);
      });

    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.valueChange.emit(this.getValue());
    });

    afterNextRender(() => this.valueChange.emit(this.getValue()));

    effect(() => {
      const rule = this.initialRule();
      if (rule) {
        if (this.patchedRuleId !== rule.id) {
          this.patchedRuleId = rule.id;
          this.pendingFile.set(null);
          this.attachmentCleared.set(false);
          this.resetFileInput();
          this.form.patchValue(
            {
              ruleName: rule.ruleName,
              moduleId: rule.moduleId,
              topic: rule.topic,
              conditionType: rule.conditionType,
              scoreThreshold: rule.scoreThreshold,
              recommendationTitle: rule.recommendationTitle,
              resourceType: rule.resourceType,
              priorityLevel: rule.priority,
              resourceUrl: rule.resourceUrl ?? '',
              administrativeRationale: rule.administrativeRationale ?? '',
            },
            { emitEvent: false }
          );
          this.applyResourceTypeState(rule.resourceType);
          this.form.updateValueAndValidity({ emitEvent: false });
          this.valueChange.emit(this.getValue());
        }
      } else if (this.patchedRuleId !== null) {
        this.patchedRuleId = null;
        this.pendingFile.set(null);
        this.attachmentCleared.set(false);
        this.resetFileInput();
        this.form.reset(DEFAULT_RECOMMENDATION_FORM);
        this.applyResourceTypeState(DEFAULT_RECOMMENDATION_FORM.resourceType);
        this.form.updateValueAndValidity({ emitEvent: false });
        this.valueChange.emit(this.getValue());
      }
    });

    effect(() => {
      this.pendingFile();
      this.attachmentCleared();
      this.initialRule();
      queueMicrotask(() =>
        this.form.updateValueAndValidity({ emitEvent: false })
      );
    });

    this.form
      .get('moduleId')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((mid: string) => {
        const topics = topicsForModule(mid);
        const topicCtrl = this.form.get('topic');
        const cur = topicCtrl?.value as string;
        if (topics.length && !topics.includes(cur)) {
          topicCtrl?.setValue(topics[0] ?? '', { emitEvent: true });
        }
      });
  }

  getValue(): RecommendationRuleFormBody {
    const v = this.form.getRawValue();
    const rt = v.resourceType ?? '';
    return {
      ruleName: v.ruleName ?? '',
      moduleId: v.moduleId ?? '',
      topic: v.topic ?? '',
      conditionType: v.conditionType,
      scoreThreshold: Number(v.scoreThreshold),
      recommendationTitle: v.recommendationTitle ?? '',
      resourceType: rt,
      priorityLevel: v.priorityLevel,
      resourceUrl: isReadingMaterialResourceType(rt) ? '' : (v.resourceUrl ?? ''),
      administrativeRationale: v.administrativeRationale ?? '',
    };
  }

  markAllTouched(): void {
    this.form.markAllAsTouched();
    this.form.markAsTouched();
  }

  private applyResourceTypeState(rt: string): void {
    const urlCtrl = this.form.get('resourceUrl');
    if (!urlCtrl) return;
    if (isReadingMaterialResourceType(rt)) {
      urlCtrl.disable({ emitEvent: false });
      urlCtrl.setValue('', { emitEvent: false });
      urlCtrl.clearValidators();
      urlCtrl.setErrors(null);
    } else {
      urlCtrl.enable({ emitEvent: false });
      urlCtrl.setValidators([linkResourceUrlValidator()]);
    }
    urlCtrl.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  protected isReadingMaterial(): boolean {
    return isReadingMaterialResourceType(
      (this.form.get('resourceType')?.value as string) ?? ''
    );
  }

  protected isLinkResourceType(): boolean {
    return isLinkResourceTypeModel(
      (this.form.get('resourceType')?.value as string) ?? ''
    );
  }

  protected topicsForSelectedModule(): string[] {
    const mid = this.form.get('moduleId')?.value as string;
    return topicsForModule(mid);
  }

  protected fieldError(controlName: string): string | null {
    const c = this.form.get(controlName);
    if (!c || !c.touched) return null;
    return getRecommendationFieldError(controlName, c.errors);
  }

  protected showError(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!(c && c.invalid && c.touched);
  }

  protected showReadingAttachmentError(): boolean {
    return !!(
      this.form.touched &&
      this.form.errors?.['readingAttachmentRequired']
    );
  }

  protected readingAttachmentError(): string | null {
    if (!this.form.touched) return null;
    return getRecommendationFieldError('form', this.form.errors);
  }

  get invalid(): boolean {
    return this.form.invalid;
  }

  getPendingFile(): File | null {
    return this.pendingFile();
  }

  getAttachmentCleared(): boolean {
    return this.attachmentCleared();
  }

  protected onAttachmentSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.pendingFile.set(file);
      this.attachmentCleared.set(false);
    }
  }

  protected clearAttachment(): void {
    if (this.pendingFile()) {
      this.pendingFile.set(null);
      this.resetFileInput();
      return;
    }
    if (this.initialRule()?.attachmentPath) {
      this.attachmentCleared.set(true);
    }
  }

  private resetFileInput(): void {
    const el = document.getElementById(
      'rec-rule-file-upload'
    ) as HTMLInputElement | null;
    if (el) el.value = '';
  }

  protected attachmentDisplayName(rule: RecommendationRule | null): string {
    if (!rule?.attachmentPath) return '';
    return fileNameFromAttachmentPath(rule.attachmentPath);
  }

  protected showExistingAttachment(rule: RecommendationRule | null): boolean {
    return !!(
      rule?.attachmentPath &&
      !this.pendingFile() &&
      !this.attachmentCleared()
    );
  }
}
