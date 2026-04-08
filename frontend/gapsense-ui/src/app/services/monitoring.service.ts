import { Injectable, signal } from '@angular/core';
import { InterventionPlan } from '../models/monitoring/monitoring.model';

const seed: InterventionPlan[] = [
  {
    id: 'ip-1',
    title: 'Peer tutoring — ER modeling',
    studentRef: 'STU-1042',
    courseCode: 'IT3010',
    actions: 'Schedule two guided labs; review ER exercises.',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    status: 'active',
    riskGroup: 'medium',
    interventionType: 'tutorial',
  },
  {
    id: 'ip-2',
    title: 'Binary trees — remedial lab',
    studentRef: 'STU-2201',
    courseCode: 'IT3020',
    actions: 'Focus on traversal exercises.',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
    status: 'planned',
    riskGroup: 'high',
    interventionType: 'remedial',
  },
  {
    id: 'ip-3',
    title: 'SQL workshop follow-up',
    studentRef: 'STU-0891',
    courseCode: 'IT3010',
    actions: 'Mandatory workshop attendance.',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    status: 'active',
    riskGroup: 'high',
    interventionType: 'workshop',
  },
];

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
