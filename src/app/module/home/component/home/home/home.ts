import { Component, HostListener, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';
import { DashboardStats, Order, Product } from '../../../../../core/models/models';
import { AuthService } from '../../../../../core/services/auth.service';
import { StatsService } from '../../../../../core/services/stats.service';

export type AreaChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  stroke: ApexStroke;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

type StatKey = 'revenue' | 'orders' | 'processing' | 'delivered' | 'cancelled' | 'users' | 'products' | 'stock';

interface DashboardStat {
  key: StatKey;
  title: string;
  value: number;
  suffix: string;
  text: string;
  icon: string;
  type: string;
}

interface ModalItem {
  title: string;
  detail: string;
  value: string;
  image?: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  currentDate = new Date();
  loading = false;
  errorMessage = '';
  adminName = 'المدير العام';
  selectedStat: DashboardStat | null = null;
  private dashboardData: DashboardStats | null = null;

  stats: DashboardStat[] = [
    { key: 'revenue', title: 'إجمالي المبيعات المحصلة', value: 0, suffix: 'ر.س', text: 'للطلبات المدفوعة غير الملغاة', icon: 'money', type: 'green' },
    { key: 'orders', title: 'إجمالي الطلبات', value: 0, suffix: 'طلب', text: 'جميع الطلبات المسجلة', icon: 'truck', type: 'blue' },
    { key: 'processing', title: 'طلبات قيد التنفيذ', value: 0, suffix: 'طلب', text: 'معلقة أو قيد المعالجة', icon: 'medical', type: 'purple' },
    { key: 'delivered', title: 'طلبات تم تسليمها', value: 0, suffix: 'طلب', text: 'بحالة تم التسليم', icon: 'check', type: 'green' },
    { key: 'cancelled', title: 'طلبات ملغاة', value: 0, suffix: 'طلب', text: 'بحالة ملغاة', icon: 'close', type: 'red' },
    { key: 'users', title: 'العملاء المسجلون', value: 0, suffix: 'عميل', text: 'حسابات العملاء', icon: 'building', type: 'blue' },
    { key: 'products', title: 'المنتجات النشطة', value: 0, suffix: 'منتج', text: 'منتجات متاحة في الكتالوج', icon: 'box', type: 'purple' },
    { key: 'stock', title: 'مخزون منخفض', value: 0, suffix: 'منتج', text: 'عند حد التنبيه أو أقل', icon: 'alert', type: 'red' }
  ];

  monthlyChart: AreaChartOptions = {
    series: [
      { name: 'المبيعات المحصلة (ر.س)', type: 'area', data: [] },
      { name: 'الطلبات غير الملغاة', type: 'column', data: [] }
    ],
    chart: { height: 300, type: 'line', toolbar: { show: false }, fontFamily: 'inherit', width: '100%' },
    stroke: { width: [3, 0], curve: 'smooth' },
    fill: { type: ['gradient', 'solid'], gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.04 } },
    dataLabels: { enabled: false },
    grid: { borderColor: '#edf2f7', strokeDashArray: 4 },
    xaxis: { categories: [] },
    yaxis: [
      {
        seriesName: 'المبيعات المحصلة (ر.س)',
        labels: { formatter: (value) => value ? value.toLocaleString('ar-SA') : '٠' }
      },
      {
        seriesName: 'الطلبات غير الملغاة',
        opposite: true,
        labels: { formatter: (value) => value ? value.toLocaleString('ar-SA') : '٠' }
      }
    ],
    tooltip: { shared: true, intersect: false },
    legend: { position: 'top', horizontalAlign: 'left' }
  };

  orderStatusChart: DonutChartOptions = {
    series: [0, 0, 0, 0, 0],
    chart: { type: 'donut', height: 270, fontFamily: 'inherit', width: '100%' },
    labels: ['معلقة', 'قيد المعالجة', 'تم الشحن', 'تم التسليم', 'ملغاة'],
    colors: ['#f59e0b', '#0ea5e9', '#6366f1', '#10b981', '#f43f5e'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: { show: true, total: { show: true, label: 'إجمالي الطلبات' } }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    stroke: { width: 0 },
    tooltip: { y: { formatter: (value) => `${value.toLocaleString('ar-SA')} طلب` } }
  };

  orders: Order[] = [];
  topProducts: Array<Product & { unitsSold: number; revenue: number }> = [];
  lowStockProducts: DashboardStats['lowStockProducts'] = [];
  recentUsers: DashboardStats['recentUsers'] = [];

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.name) this.adminName = user.name;
    this.fetchDashboardData();
  }

  @HostListener('document:keydown.escape')
  closeModal(): void {
    this.selectedStat = null;
  }

  fetchDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';
    this.statsService.getDashboardStats().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.applyDashboardData(response.data);
        } else {
          this.errorMessage = 'تعذر تحميل بيانات لوحة التحكم.';
        }
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message || 'تعذر الاتصال بالخادم لتحميل الإحصائيات.';
      }
    });
  }

  private applyDashboardData(data: DashboardStats): void {
    this.dashboardData = data;
    const totals = data.totals;
    const values: Record<StatKey, number> = {
      revenue: totals.totalRevenue,
      orders: totals.totalOrders,
      processing: totals.ordersStatus.pending + totals.ordersStatus.processing,
      delivered: totals.ordersStatus.delivered,
      cancelled: totals.ordersStatus.cancelled,
      users: totals.totalUsers,
      products: totals.activeProducts,
      stock: totals.lowStockCount
    };
    this.stats = this.stats.map((stat) => ({ ...stat, value: values[stat.key] ?? 0 }));

    const [salesSeries, orderSeries] = data.charts.salesChart.series;
    this.monthlyChart.series = [
      { name: salesSeries?.name || 'المبيعات المحصلة (ر.س)', type: 'area', data: salesSeries?.data || [] },
      { name: orderSeries?.name || 'الطلبات غير الملغاة', type: 'column', data: orderSeries?.data || [] }
    ];
    this.monthlyChart.xaxis = { categories: data.charts.salesChart.categories };

    const status = totals.ordersStatus;
    this.orderStatusChart.series = [status.pending, status.processing, status.shipped, status.delivered, status.cancelled];
    this.orders = data.recentOrders || [];
    this.topProducts = data.topProducts || [];
    this.lowStockProducts = data.lowStockProducts || [];
    this.recentUsers = data.recentUsers || [];
  }

  openStatDetails(stat: DashboardStat): void {
    this.selectedStat = stat;
  }

  get modalSummary(): Array<{ label: string; value: string }> {
    if (!this.selectedStat || !this.dashboardData) return [];
    const { totals, charts } = this.dashboardData;
    const status = totals.ordersStatus;

    if (this.selectedStat.key === 'revenue') {
      return [
        { label: 'إجمالي المبيعات المحصلة', value: this.formatNumber(totals.totalRevenue) + ' ر.س' },
        ...charts.salesChart.categories.map((month, index) => ({
          label: `مبيعات ${month}`,
          value: this.formatNumber(charts.salesChart.series[0]?.data[index] || 0) + ' ر.س'
        }))
      ];
    }
    if (this.selectedStat.key === 'orders' || this.selectedStat.key === 'processing') {
      return [
        { label: 'طلبات معلقة', value: this.formatNumber(status.pending) },
        { label: 'قيد المعالجة', value: this.formatNumber(status.processing) },
        { label: 'تم الشحن', value: this.formatNumber(status.shipped) },
        { label: 'تم التسليم', value: this.formatNumber(status.delivered) },
        { label: 'ملغاة', value: this.formatNumber(status.cancelled) }
      ];
    }
    if (this.selectedStat.key === 'products') {
      return [
        { label: 'المنتجات النشطة', value: this.formatNumber(totals.activeProducts) },
        { label: 'كل المنتجات', value: this.formatNumber(totals.totalProducts) },
        { label: 'الأقسام', value: this.formatNumber(totals.totalCategories) },
        { label: 'العلامات التجارية', value: this.formatNumber(totals.totalBrands) }
      ];
    }
    return [{ label: this.selectedStat.title, value: this.formatNumber(this.selectedStat.value) }];
  }

  get modalItems(): ModalItem[] {
    if (!this.selectedStat) return [];
    switch (this.selectedStat.key) {
      case 'orders':
      case 'processing':
      case 'delivered':
      case 'cancelled':
        return this.orders
          .filter((order) => {
            if (this.selectedStat?.key === 'processing') return ['pending', 'processing'].includes(order.orderStatus);
            if (this.selectedStat?.key === 'delivered') return order.orderStatus === 'delivered';
            if (this.selectedStat?.key === 'cancelled') return order.orderStatus === 'cancelled';
            return true;
          })
          .map((order) => ({
            title: order.orderNumber,
            detail: `${order.customerInfo?.name || 'عميل'} · ${this.orderStatusLabel(order.orderStatus)}`,
            value: `${this.formatNumber(order.totalAmount)} ر.س`
          }));
      case 'users':
        return this.recentUsers.map((user) => ({
          title: user.name,
          detail: user.organization || user.email,
          value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : 'عميل مسجل'
        }));
      case 'products':
        return this.topProducts.map((product) => ({
          title: product.name,
          detail: `${product.sku} · ${this.formatNumber(product.unitsSold)} وحدة مباعة`,
          value: `${this.formatNumber(product.revenue)} ر.س`,
          image: product.image
        }));
      case 'stock':
        return this.lowStockProducts.map((product) => ({
          title: product.name,
          detail: `المتاح ${this.formatNumber(product.stock)} · حد التنبيه ${this.formatNumber(product.minStockAlert ?? 0)}`,
          value: product.sku,
          image: product.image
        }));
      default:
        return [];
    }
  }

  formatNumber(value: number): string {
    return Number(value || 0).toLocaleString('ar-SA');
  }

  orderStatusLabel(status: Order['orderStatus']): string {
    const labels: Record<Order['orderStatus'], string> = {
      pending: 'معلق',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغى'
    };
    return labels[status];
  }

  orderStatusClass(status: Order['orderStatus']): string {
    return {
      pending: 'pending',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled'
    }[status];
  }

  paymentStatusLabel(status: Order['paymentStatus']): string {
    return {
      pending: 'قيد الدفع',
      paid: 'مدفوع',
      failed: 'فشل الدفع',
      refunded: 'مسترد'
    }[status];
  }

  orderDate(date?: string): string {
    return date ? new Date(date).toLocaleDateString('ar-SA') : '—';
  }
}
