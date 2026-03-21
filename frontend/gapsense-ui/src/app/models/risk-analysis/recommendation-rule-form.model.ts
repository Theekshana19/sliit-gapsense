import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import type { RecommendationConditionType } from './recommendation-condition-type.model';
import type { RecommendationPriority } from './recommendation-priority.model';

export interface RecommendationRuleFormValue {
  ruleName: string;
  moduleId: string;
  topic: string;
  conditionType: RecommendationConditionType;
  scoreThreshold: number;
  isActive: boolean;
  recommendationTitle: string;
  resourceType: string;
  priorityLevel: RecommendationPriority;
  resourceUrl: string;
  administrativeRationale: string;
}

/** Form body from RecommendationRuleFormComponent (isActive set by parent header toggle). */
export type RecommendationRuleFormBody = Omit<RecommendationRuleFormValue, 'isActive'>;

export const DEFAULT_RECOMMENDATION_FORM: RecommendationRuleFormBody = {
  ruleName: '',
  moduleId: 'IT3040',
  topic: 'Risk Analysis',
  conditionType: 'scoreUnderThreshold',
  scoreThreshold: 45,
  recommendationTitle: '',
  resourceType: 'Video Tutorial',
  priorityLevel: 'medium',
  resourceUrl: '',
  administrativeRationale: '',
};

export const RESOURCE_TYPE_OPTIONS = [
  'Video Tutorial',
  'Reading Material',
  'Interactive Quiz',
  'External Workshop',
] as const;

/** Must match `RESOURCE_TYPE_OPTIONS` entry exactly. */
export const READING_MATERIAL_RESOURCE_TYPE = 'Reading Material' as const;

export function isReadingMaterialResourceType(type: string): boolean {
  return type === READING_MATERIAL_RESOURCE_TYPE;
}

export function isLinkResourceType(type: string): boolean {
  return !isReadingMaterialResourceType(type);
}

/** Non-empty trimmed string for link-type Resource URL. */
export function linkResourceUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || String(v).trim() === '') {
      return { linkUrlRequired: true };
    }
    return null;
  };
}

function scoreThresholdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v === null || v === undefined || v === '') return { required: true };
    const n = Number(v);
    if (Number.isNaN(n)) return { required: true };
    if (n < 0 || n > 100) return { scoreRange: { min: 0, max: 100 } };
    return null;
  };
}

export const RECOMMENDATION_FORM_VALIDATORS = {
  ruleName: [Validators.required],
  moduleId: [Validators.required],
  topic: [Validators.required],
  conditionType: [Validators.required],
  scoreThreshold: [Validators.required, scoreThresholdValidator()],
  recommendationTitle: [Validators.required],
  priorityLevel: [Validators.required],
};

export function getRecommendationFieldError(
  _field: string,
  errors: ValidationErrors | null
): string | null {
  if (!errors) return null;
  if (errors['required']) return 'Field is required';
  if (errors['scoreRange']) return 'Must be between 0 and 100%';
  if (errors['linkUrlRequired']) return 'Enter a valid URL for this resource type';
  if (errors['readingAttachmentRequired'])
    return 'Upload a PDF or document, or keep the existing file';
  return null;
}

export function mergeRecommendationForm(
  body: RecommendationRuleFormBody,
  isActive: boolean
): RecommendationRuleFormValue {
  return { ...body, isActive };
}
