import { Injectable, signal } from '@angular/core';
import { SHELL_SEARCH_MAX_LENGTH } from '../validators/form-utils';

@Injectable({ providedIn: 'root' })
export class ShellSearchService {
  /** Bound to the app shell search field; filters sidebar navigation labels/paths. */
  readonly query = signal('');

  setQuery(value: string): void {
    const t =
      value.length > SHELL_SEARCH_MAX_LENGTH ? value.slice(0, SHELL_SEARCH_MAX_LENGTH) : value;
    this.query.set(t);
  }
}
