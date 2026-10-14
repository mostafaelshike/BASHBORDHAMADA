import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="confirm-overlay" (click)="cancel()">
        <section
          class="confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          (click)="$event.stopPropagation()"
          dir="rtl">
          <div class="confirm-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />
            </svg>
          </div>
          <h2 id="confirm-dialog-title">{{ title }}</h2>
          <p>{{ message }}</p>
          @if (errorMessage) {
            <p class="confirm-error" role="alert">{{ errorMessage }}</p>
          }
          <div class="confirm-actions">
            <button type="button" class="cancel-button" [disabled]="busy" (click)="cancel()">إلغاء</button>
            <button type="button" class="delete-button" [disabled]="busy" (click)="confirmed.emit()">
              {{ busy ? 'جاري الحذف...' : 'تأكيد الحذف' }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(15, 23, 42, 0.48);
      backdrop-filter: blur(4px);
    }
    .confirm-dialog {
      width: min(100%, 410px);
      padding: 28px;
      border-radius: 14px;
      background: #fff;
      color: #172033;
      text-align: center;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
      font-family: 'Cairo', sans-serif;
    }
    .confirm-icon {
      width: 54px;
      height: 54px;
      margin: 0 auto 14px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      background: #fff1f2;
      color: #dc2626;
    }
    .confirm-icon svg { width: 25px; height: 25px; }
    h2 { margin: 0 0 8px; font-size: 19px; }
    p { margin: 0 0 22px; color: #64748b; font-size: 14px; line-height: 1.8; }
    .confirm-error {
      margin-top: -10px;
      color: #b91c1c;
      font-size: 13px;
    }
    .confirm-actions { display: flex; gap: 10px; }
    button {
      flex: 1;
      min-height: 44px;
      border: 0;
      border-radius: 8px;
      font: inherit;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }
    button:disabled { cursor: wait; opacity: 0.65; }
    .cancel-button { background: #f1f5f9; color: #334155; }
    .delete-button { background: #dc2626; color: #fff; }
    .delete-button:hover:not(:disabled) { background: #b91c1c; }
  `],
})
export class ConfirmDialog {
  @Input() visible = false;
  @Input() title = 'تأكيد الحذف';
  @Input() message = '';
  @Input() errorMessage = '';
  @Input() busy = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  cancel(): void {
    if (!this.busy) {
      this.cancelled.emit();
    }
  }
}