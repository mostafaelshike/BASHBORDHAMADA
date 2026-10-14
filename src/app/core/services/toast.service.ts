import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
  duration: number;
}

/**
 * Global Toast / Notification service for the Dashboard.
 * Mirrors the front-end ToastService API so both apps share
 * the same usage pattern.
 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly messages = signal<ToastMessage[]>([]);

  show(message: string, type: ToastType = 'success', duration = 4500): void {
    const id = ++this.nextId;
    const toast: ToastMessage = { id, text: message, type, duration };

    this.messages.update((items) => [...items, toast].slice(-4));
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.messages.update((items) => items.filter((t) => t.id !== id));
  }
}
