import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { RiskThreshold } from '../../../models/risk-analysis/risk-threshold.model';
import {
  DEFAULT_FORM_VALUE,
  getPercentageErrorMessage,
  highRiskMaxLessThanMediumMin,
  lowRiskMinGreaterThanMediumMax,
  mediumRiskMaxGreaterThanMin,
  PERCENTAGE_VALIDATORS,
  type RiskThresholdFormValue,
  type RiskThresholdPanelMode,
} from '../../../models/risk-analysis/risk-threshold-form.model';

@Component({
  selector: 'app-threshold-form-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './threshold-form-panel.component.html',
  styleUrl: './threshold-form-panel.component.css',
})
export class ThresholdFormPanelComponent {
  readonly open = input.required<boolean>();
  readonly mode = input<RiskThresholdPanelMode>('create');
  readonly initialValue = input<RiskThreshold | null>(null);

  readonly close = output<void>();
  readonly save = output<RiskThresholdFormValue>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        ruleName: ['', Validators.required],
        lowRiskMin: [DEFAULT_FORM_VALUE.lowRiskMin, PERCENTAGE_VALIDATORS],
        mediumRiskMin: [DEFAULT_FORM_VALUE.mediumRiskMin, PERCENTAGE_VALIDATORS],
        mediumRiskMax: [DEFAULT_FORM_VALUE.mediumRiskMax, [
          ...PERCENTAGE_VALIDATORS,
          mediumRiskMaxGreaterThanMin('mediumRiskMin'),
        ]],
        highRiskMax: [DEFAULT_FORM_VALUE.highRiskMax, [
          ...PERCENTAGE_VALIDATORS,
          highRiskMaxLessThanMediumMin('mediumRiskMin'),
        ]],
        status: [DEFAULT_FORM_VALUE.status as 'active' | 'inactive', Validators.required],
        notes: [''],
      }
    );
    this.form.get('lowRiskMin')?.addValidators(
      lowRiskMinGreaterThanMediumMax('mediumRiskMax')
    );

    this.form.get('mediumRiskMin')?.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.get('mediumRiskMax')?.updateValueAndValidity();
      this.form.get('highRiskMax')?.updateValueAndValidity();
    });
    this.form.get('mediumRiskMax')?.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.get('lowRiskMin')?.updateValueAndValidity();
    });

    effect(() => {
      const isOpen = this.open();
      const init = this.initialValue();
      const mode = this.mode();
      if (isOpen) {
        if (mode === 'edit' && init) {
          this.form.patchValue({
            ruleName: init.ruleName,
            lowRiskMin: init.lowRiskMin,
            mediumRiskMin: init.mediumRiskMin,
            mediumRiskMax: init.mediumRiskMax,
            highRiskMax: init.highRiskMax,
            status: init.status,
            notes: init.notes,
          });
        } else {
          this.form.reset(DEFAULT_FORM_VALUE);
        }
      }
    });
  }

  protected get title(): string {
    return this.mode() === 'edit' ? 'Edit Threshold' : 'Add New Threshold';
  }

  protected getRuleNameError(): string | null {
    const c = this.form.get('ruleName');
    if (!c?.errors || !c.touched && !c.dirty) return null;
    if (c.errors['required']) return 'Rule name is required';
    return null;
  }

  protected getPercentageError(controlName: string): string | null {
    const c = this.form.get(controlName);
    if (!c?.errors || (!c.touched && !c.dirty)) return null;
    return getPercentageErrorMessage(c.errors);
  }

  protected onCancel(): void {
    this.close.emit();
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.save.emit({
      ruleName: raw.ruleName,
      lowRiskMin: Number(raw.lowRiskMin),
      mediumRiskMin: Number(raw.mediumRiskMin),
      mediumRiskMax: Number(raw.mediumRiskMax),
      highRiskMax: Number(raw.highRiskMax),
      status: raw.status,
      notes: raw.notes ?? '',
    });
  }

  protected onBackdropClick(): void {
    this.close.emit();
  }
}
