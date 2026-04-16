import { Injectable, signal } from '@angular/core';
import { InterventionPlan } from '../models/monitoring/monitoring.model';

/** @deprecated Intervention plans are loaded from the API via {@link InterventionPlanningService}. */
const seed: InterventionPlan[] = [];

@Injectable({ providedIn: 'root' })
export class MonitoringService {
  private readonly plans = signal<InterventionPlan[]>([...seed]);

  list(): InterventionPlan[] {
    return this.plans();
  }

  add(plan: Omit<InterventionPlan, 'id'>): InterventionPlan {
    const created: InterventionPlan = { ...plan, id: `ip-${Date.now()}` };
    this.plans.update((all) => [created, ...all]);
    return created;
  }

  remove(id: string): void {
    this.plans.update((all) => all.filter((p) => p.id !== id));
  }
}
