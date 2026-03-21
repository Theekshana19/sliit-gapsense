import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SHELL_SEARCH_MAX_LENGTH } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-search-bar',
  template: `
    <div class="relative">
      <span
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
        aria-hidden="true"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" stroke-linecap="round" />
        </svg>
      </span>
      <input
        type="search"
        class="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        [attr.maxlength]="maxLength"
        [placeholder]="placeholder"
        [value]="value"
        (input)="onInput($event)"
      />
    </div>
  `,
})
export class SearchBarComponent {
  /** Upper bound for search query length (shell and list filters use the same cap). */
  @Input() maxLength = SHELL_SEARCH_MAX_LENGTH;
  @Input() placeholder = 'Search…';
  @Input() value = '';
  @Output() queryChange = new EventEmitter<string>();

  onInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    let v = el.value;
    if (v.length > this.maxLength) {
      v = v.slice(0, this.maxLength);
      el.value = v;
    }
    this.queryChange.emit(v);
  }
}
