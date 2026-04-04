import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  private readonly queue = signal<ToastMessage[]>([]);

  messages = this.queue.asReadonly();

  show(text: string, variant: ToastVariant = 'info'): void {
    const id = this.nextId++;
    this.queue.update((all) => [...all, { id, text, variant }]);
    window.setTimeout(() => this.dismiss(id), 4200);
  }

  dismiss(id: number): void {
    this.queue.update((all) => all.filter((m) => m.id !== id));
  }
}
