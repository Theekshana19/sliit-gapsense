import { Component, Input } from '@angular/core';
import { Curriculum } from '../../models/curriculum/curriculum.model';
import { StatusPillComponent, StatusPillTone } from '../ui/status-pill/status-pill.component';

@Component({
  standalone: true,
  selector: 'app-curriculum-row',
  imports: [StatusPillComponent],
  template: `
    <div class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{{
            item.code
          }}</span>
          <app-status-pill [label]="statusLabel" [tone]="statusTone" />
        </div>
        <h3 class="mt-2 text-sm font-semibold text-slate-900">{{ item.name }}</h3>
        <p class="mt-1 text-sm text-slate-600">{{ item.description }}</p>
      </div>
      <div class="text-sm text-slate-500 sm:text-right">
        <div class="font-medium text-slate-800">{{ item.credits }} credits</div>
        <div class="text-xs">Curriculum item</div>
      </div>
    </div>
  `,
})
export class CurriculumRowComponent {
  @Input({ required: true }) item!: Curriculum;

  get statusLabel(): string {
    return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
  }

  get statusTone(): StatusPillTone {
    switch (this.item.status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'neutral';
    }
  }
}
