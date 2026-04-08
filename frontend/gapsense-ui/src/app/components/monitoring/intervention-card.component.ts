import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InterventionPlan } from '../../models/monitoring/monitoring.model';
import { StatusPillComponent, StatusPillTone } from '../ui/status-pill/status-pill.component';

@Component({
  standalone: true,
  selector: 'app-intervention-card',
  imports: [StatusPillComponent],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">{{ item.title }}</h3>
          <p class="mt-1 text-xs text-slate-500">
            {{ item.studentRef }} · {{ item.courseCode }} · Due {{ item.dueDate }}
          </p>
        </div>
        <app-status-pill [label]="statusLabel" [tone]="statusTone" />
      </div>
      <p class="mt-3 text-sm text-slate-600">{{ item.actions }}</p>
      <div class="mt-4 flex justify-end">
        <button
          type="button"
          class="text-xs font-semibold text-rose-600 hover:text-rose-500"
          (click)="remove.emit(item.id)"
        >
          Remove
        </button>
      </div>
    </div>
  `,
})
export class InterventionCardComponent {
  @Input({ required: true }) item!: InterventionPlan;
  @Output() remove = new EventEmitter<string>();

  get statusLabel(): string {
    return this.item.status.charAt(0).toUpperCase() + this.item.status.slice(1);
  }

  get statusTone(): StatusPillTone {
    if (this.item.status === 'completed') {
      return 'success';
    }
    if (this.item.status === 'active') {
      return 'info';
    }
    return 'neutral';
  }
}
