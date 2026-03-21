import { Component, Input } from '@angular/core';
import { WeakTopic } from '../../models/readiness/readiness.model';
import { StatusPillComponent, StatusPillTone } from '../ui/status-pill/status-pill.component';

@Component({
  standalone: true,
  selector: 'app-weak-topic-card',
  imports: [StatusPillComponent],
  template: `
    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">{{ item.courseCode }}</p>
          <h3 class="mt-1 text-sm font-semibold text-slate-900">{{ item.topicName }}</h3>
        </div>
        <app-status-pill [label]="trendLabel" [tone]="trendTone" />
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Gap score</p>
          <p class="text-lg font-semibold text-slate-900">{{ item.gapScore }}%</p>
        </div>
        <div class="rounded-lg bg-slate-50 p-3">
          <p class="text-xs text-slate-500">Students</p>
          <p class="text-lg font-semibold text-slate-900">{{ item.studentCount }}</p>
        </div>
      </div>
    </div>
  `,
})
export class WeakTopicCardComponent {
  @Input({ required: true }) item!: WeakTopic;

  get trendLabel(): string {
    if (this.item.trend === 'up') {
      return 'Rising gap';
    }
    if (this.item.trend === 'down') {
      return 'Improving';
    }
    return 'Stable';
  }

  get trendTone(): StatusPillTone {
    if (this.item.trend === 'up') {
      return 'danger';
    }
    if (this.item.trend === 'down') {
      return 'success';
    }
    return 'neutral';
  }
}
