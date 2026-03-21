import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import type { RiskThresholdStatus } from './risk-threshold.model';

export type RiskThresholdPanelMode = 'create' | 'edit';

export interface RiskThresholdFormValue {
  ruleName: string;
  lowRiskMin: number;
  mediumRiskMin: number;
  mediumRiskMax: number;
  highRiskMax: number;
  status: RiskThresholdStatus;
  notes: string;
}

export const DEFAULT_FORM_VALUE: RiskThresholdFormValue = {
  ruleName: '',
  lowRiskMin: 75,
  mediumRiskMin: 50,
  mediumRiskMax: 74,
  highRiskMax: 49,
  status: 'active',
  notes: '',
};

function percentageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return { required: true };
    const n = Number(v);
    if (Number.isNaN(n)) return { required: true };
    if (n < 0 || n > 100) return { min: { min: 0, max: 100 } };
    return null;
  };
}

export function mediumRiskMaxGreaterThanMin(
  minControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const max = control.value;
    const minControl = control.parent?.get(minControlName);
    const min = minControl?.value;
    if (max == null || min == null) return null;
    const maxN = Number(max);
    const minN = Number(min);
    if (Number.isNaN(maxN) || Number.isNaN(minN)) return null;
    if (maxN <= minN)
      return { mediumRiskMaxMin: { message: 'Medium Risk Max must be higher than Medium Risk Min' } };
    return null;
  };
}

export function highRiskMaxLessThanMediumMin(
  mediumMinControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const highMax = control.value;
    const medMinControl = control.parent?.get(mediumMinControlName);
    const medMin = medMinControl?.value;
    if (highMax == null || medMin == null) return null;
    const highN = Number(highMax);
    const medN = Number(medMin);
    if (Number.isNaN(highN) || Number.isNaN(medN)) return null;
    if (highN >= medN)
      return { highRiskMaxMax: { message: 'High Risk Max must be less than Medium Risk Min' } };
    return null;
  };
}

export function lowRiskMinGreaterThanMediumMax(
  mediumMaxControlName: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const lowMin = control.value;
    const medMaxControl = control.parent?.get(mediumMaxControlName);
    const medMax = medMaxControl?.value;
    if (lowMin == null || medMax == null) return null;
    const lowN = Number(lowMin);
    const medN = Number(medMax);
    if (Number.isNaN(lowN) || Number.isNaN(medN)) return null;
    if (lowN <= medN)
      return { lowRiskMinMin: { message: 'Low Risk Min must be greater than Medium Risk Max' } };
    return null;
  };
}

export const PERCENTAGE_VALIDATORS = [
  Validators.required,
  percentageValidator(),
];

export function getPercentageErrorMessage(errors: ValidationErrors | null): string | null {
  if (!errors) return null;
  if (errors['required']) return 'This field is required';
  if (errors['min']) return 'Must be between 0 and 100';
  if (errors['mediumRiskMaxMin']) return (errors['mediumRiskMaxMin'] as { message: string }).message;
  if (errors['highRiskMaxMax']) return (errors['highRiskMaxMax'] as { message: string }).message;
  if (errors['lowRiskMinMin']) return (errors['lowRiskMinMin'] as { message: string }).message;
  return null;
}
