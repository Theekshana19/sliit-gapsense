import { Injectable, signal } from '@angular/core';
import { Curriculum } from '../models/curriculum/curriculum.model';

const seed: Curriculum[] = [
  {
    id: 'c-1',
    code: 'IT3020',
    name: 'Software Engineering',
    description: 'Requirements, design patterns, and delivery practices.',
    credits: 3,
    status: 'active',
  },
  {
    id: 'c-2',
    code: 'IT3010',
    name: 'Database Systems',
    description: 'Relational modeling, SQL, and transactions.',
    credits: 3,
    status: 'draft',
  },
];

@Injectable({ providedIn: 'root' })
export class CurriculumService {
  private readonly items = signal<Curriculum[]>([...seed]);

  list(): Curriculum[] {
    return this.items();
  }

  search(query: string): Curriculum[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.list();
    }
    return this.items().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  add(item: Omit<Curriculum, 'id'>): Curriculum {
    const created: Curriculum = { ...item, id: `c-${Date.now()}` };
    this.items.update((all) => [created, ...all]);
    return created;
  }
}
