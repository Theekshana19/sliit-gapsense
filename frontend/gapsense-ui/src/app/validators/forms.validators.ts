import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Date input value `yyyy-MM-dd` must be today or a future calendar day (local). */
export const futureOrTodayDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = control.value as string | null | undefined;
  if (raw == null || raw === '') {
    return null;
  }
  const parts = raw.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return { date: true };
  }
  const [y, m, d] = parts;
  const selected = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  if (selected < today) {
    return { pastDate: true };
  }
  return null;
};
