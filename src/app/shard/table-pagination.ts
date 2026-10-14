import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="table-pagination" aria-label="التنقل بين صفحات الجدول" [attr.aria-busy]="isBusy">
      <span class="range" aria-live="polite">
        عرض {{ startItem }} - {{ endItem }} من {{ totalItems }}
      </span>

      @if (pageSizes.length) {
        <label class="page-size">
          عدد العناصر:
          <select [value]="pageSize" [disabled]="isBusy" (change)="requestPageSize($event)">
            @for (size of pageSizes; track size) {
              <option [value]="size">{{ size }}</option>
            }
          </select>
        </label>
      }

      <span class="page-status">صفحة {{ currentPage }} من {{ totalPages }}</span>

      @if (isBusy) {
        <span class="loading" role="status">
          <span class="spinner"></span>
          جاري تحميل الصفحة...
        </span>
      }

      <div class="controls">
        <button type="button" [disabled]="isBusy || currentPage <= 1" (click)="requestPage(currentPage - 1)">
          السابق
        </button>

        @for (page of visiblePages; track page) {
          <button
            type="button"
            [class.active]="page === currentPage"
            [attr.aria-current]="page === currentPage ? 'page' : null"
            [disabled]="isBusy || totalPages <= 1"
            (click)="requestPage(page)">
            {{ page }}
          </button>
        }

        <button type="button" [disabled]="isBusy || currentPage >= totalPages" (click)="requestPage(currentPage + 1)">
          التالي
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .table-pagination {
      min-height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px 16px;
      padding: 12px 16px;
      border-top: 1px solid #edf0f5;
      background: #fff;
      color: #667085;
      font: 12px 'Cairo', sans-serif;
    }
    .range { white-space: nowrap; }
    .page-size { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
    .page-size select {
      min-height: 34px;
      padding: 0 8px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: #fff;
      color: #475569;
      font: inherit;
    }
    .page-status { white-space: nowrap; }
    .controls { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    button {
      min-width: 34px;
      min-height: 34px;
      padding: 0 9px;
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      background: #fff;
      color: #475569;
      font: inherit;
      cursor: pointer;
    }
    button.active { border-color: #008b68; background: #008b68; color: #fff; }
    button:disabled { cursor: default; opacity: .55; }
    .loading { display: inline-flex; align-items: center; gap: 7px; color: #008b68; }
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #cdeee2;
      border-top-color: #008b68;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 560px) {
      .table-pagination { justify-content: center; }
      .range { width: 100%; text-align: center; }
    }
  `],
})
export class TablePagination {
  @Input() totalItems = 0;
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() pageSizes: number[] = [];
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  private isTransitioning = false;

  constructor(private changeDetector: ChangeDetectorRef) {}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const first = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const last = Math.min(this.totalPages, first + 4);
    return Array.from({ length: last - first + 1 }, (_, index) => first + index);
  }

  get isBusy(): boolean {
    return this.loading || this.isTransitioning;
  }

  requestPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage || this.isBusy) {
      return;
    }

    this.isTransitioning = true;
    this.pageChange.emit(page);
    this.changeDetector.detectChanges();

    window.setTimeout(() => {
      this.isTransitioning = false;
      this.changeDetector.detectChanges();
    }, 300);
  }

  requestPageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    if (this.pageSizes.includes(pageSize) && pageSize !== this.pageSize && !this.isBusy) {
      this.pageSizeChange.emit(pageSize);
    }
  }
}
