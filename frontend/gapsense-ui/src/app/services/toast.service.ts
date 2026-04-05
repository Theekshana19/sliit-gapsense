import { Injectable, computed, signal } from '@angular/core';

// toast types - different colors for different messages
export type ToastType = 'success' | 'error' | 'info';

// single toast notification
export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

// toast service - shows small notification messages at the bottom right
// use this to tell the user something happened (saved, deleted, error, etc.)
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // list of active toasts
  toasts = signal<Toast[]>([]);

  /** Tharindu-style read-only queue (`text` + `variant`). */
  readonly messages = computed(() =>
    this.toasts().map((t) => ({ id: t.id, text: t.message, variant: t.type }))
  );

  // counter to give each toast a unique id
  private nextId = 1;

  /** Tharindu API: `toast.show('Saved', 'success')`. */
  show(text: string, variant: ToastType = 'info'): void {
    this.addToast(variant, text);
  }

  // show a success toast (green - for save, create, update)
  success(message: string) {
    this.addToast('success', message);
  }

  // show an error toast (red - for errors, failures)
  error(message: string) {
    this.addToast('error', message);
  }

  // show an info toast (blue - for general info)
  info(message: string) {
    this.addToast('info', message);
  }

  // remove a specific toast by id
  dismiss(id: number) {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  // add a toast and auto remove it after 4 seconds
  private addToast(type: ToastType, message: string) {
    const id = this.nextId++;
    const toast: Toast = { id, type, message };

    // add to the list
    this.toasts.update((list) => [...list, toast]);

    // auto dismiss after 4 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }
}
