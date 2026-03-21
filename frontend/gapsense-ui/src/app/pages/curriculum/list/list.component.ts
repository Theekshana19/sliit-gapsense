import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurriculumRowComponent } from '../../../components/curriculum/curriculum-row.component';
import { EmptyStateComponent } from '../../../components/ui/empty-state/empty-state.component';
import { SearchBarComponent } from '../../../components/ui/search-bar/search-bar.component';
import { Curriculum } from '../../../models/curriculum/curriculum.model';
import { CurriculumService } from '../../../services/curriculum.service';
import { SHELL_SEARCH_MAX_LENGTH } from '../../../validators/form-utils';

@Component({
  standalone: true,
  selector: 'app-curriculum-list-page',
  imports: [RouterLink, SearchBarComponent, CurriculumRowComponent, EmptyStateComponent],
  template: `
    <div class="mx-auto max-w-5xl space-y-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="mb-2 font-headline text-3xl font-extrabold tracking-tight text-[#003f87]">Curriculum</h1>
          <p class="mt-1 text-sm text-slate-600">Modules, credits, and publication status.</p>
        </div>
        <a
          routerLink="/curriculum/add"
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Add module
        </a>
      </div>

      <app-search-bar placeholder="Search code, title, or description…" [value]="query" (queryChange)="onQuery($event)" />

      @if (filtered.length === 0) {
        <app-empty-state title="No modules match" message="Try a different search keyword or add a new curriculum item." />
      } @else {
        <div class="space-y-3">
          @for (item of filtered; track item.id) {
            <app-curriculum-row [item]="item" />
          }
        </div>
      }
    </div>
  `,
})
export class CurriculumListPageComponent {
  private readonly curriculum = inject(CurriculumService);

  query = '';
  filtered: Curriculum[] = this.curriculum.list();

  onQuery(value: string): void {
    const q = value.length > SHELL_SEARCH_MAX_LENGTH ? value.slice(0, SHELL_SEARCH_MAX_LENGTH) : value;
    this.query = q;
    this.filtered = this.curriculum.search(q);
  }
}
