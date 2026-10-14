import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit
} from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { Order as OrderModel } from '../../../../core/models/models';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order implements OnInit {
  orders: OrderModel[] = [];
  filteredOrders: OrderModel[] = [];

  loading = false;
  currentPage = 1;
  readonly pageSize = 10;
  totalOrders = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private loadSequence = 0;

  statusFilter = 'all';
  searchKeyword = '';
  errorMessage = '';

  selectedOrder: OrderModel | null = null;
  showDetailsModal = false;

  skeletonRows = [1, 2, 3, 4, 5, 6];

  get paginatedOrders(): OrderModel[] {
    return this.filteredOrders;
  }

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const startedAt = Date.now();
    const sequence = ++this.loadSequence;
    const params: Record<string, string | number> = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.searchKeyword.trim()) params['keyword'] = this.searchKeyword.trim();
    if (this.statusFilter !== 'all') params['orderStatus'] = this.statusFilter;

    this.orderService.getAllOrders(params).subscribe({
      next: (res) => {
        if (sequence !== this.loadSequence) return;
        if (res.success && res.data) {
          this.orders = res.data;
          this.filteredOrders = res.data;
          this.totalOrders = res.total ?? res.count ?? res.data.length;
          const totalPages = Math.max(1, res.totalPages ?? Math.ceil(this.totalOrders / this.pageSize));
          if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
            this.loadOrders();
            return;
          }
          this.currentPage = res.currentPage ?? this.currentPage;
        }

        this.finishLoading(startedAt, sequence);
      },
      error: (err) => {
        if (sequence !== this.loadSequence) return;
        console.error('Error loading orders:', err);
        this.errorMessage = err.message || 'تعذر تحميل الطلبات';
        this.orders = [];
        this.filteredOrders = [];
        this.totalOrders = 0;
        this.finishLoading(startedAt, sequence);
      }
    });
  }

  private finishLoading(startedAt: number, sequence: number): void {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, 1000 - elapsed);

    window.setTimeout(() => {
      this.zone.run(() => {
        if (sequence !== this.loadSequence) return;
        this.loading = false;
        this.cdr.detectChanges();
      });
    }, remaining);
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  onFilterStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilter();
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadOrders(), 300);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  openOrderDetails(order: OrderModel): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  closeOrderDetails(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  updateStatus(
    order: OrderModel,
    newStatus: string
  ): void {
    this.orderService
      .updateOrderStatus(order._id, {
        orderStatus: newStatus
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.loadOrders();
          }
        },
        error: (err) => {
          alert(
            'تعذر تحديث حالة الطلب: ' + err.message
          );
        }
      });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';

      case 'processing':
        return 'قيد التجهيز الطبي';

      case 'shipped':
        return 'تم الشحن';

      case 'delivered':
        return 'تم التسليم';

      case 'cancelled':
        return 'ملغي';

      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';

      case 'processing':
        return 'status-processing';

      case 'shipped':
        return 'status-shipped';

      case 'delivered':
        return 'status-delivered';

      case 'cancelled':
        return 'status-cancelled';

      default:
        return '';
    }
  }
}