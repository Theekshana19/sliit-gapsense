import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolve: (v: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly state = signal<ConfirmState | null>(null);

  dialog = this.state.asReadonly();

  ask(options: Omit<ConfirmState, 'resolve'>): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ ...options, resolve });
    });
  }

  respond(value: boolean): void {
    const current = this.state();
    if (!current) {
      return;
    }
    current.resolve(value);
    this.state.set(null);
  }
}
