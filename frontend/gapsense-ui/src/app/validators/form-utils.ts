import { AbstractControl } from '@angular/forms';

/** Max length for shell / list search strings (aligned with API-friendly limits). */
export const SHELL_SEARCH_MAX_LENGTH = 200;

/** Max length for table filter inputs (e.g. intervention list). */
export const TABLE_FILTER_MAX_LENGTH = 200;

export type ControlInvalidOptions = { includeDirty?: boolean };

/** True when the control should show invalid styling (touched, or dirty when `includeDirty`). */
export function controlInvalid(control: AbstractControl | null, opts?: ControlInvalidOptions): boolean {
  if (!control?.invalid) {
    return false;
  }
  if (opts?.includeDirty) {
    return control.touched || control.dirty;
  }
  return control.touched;
}
