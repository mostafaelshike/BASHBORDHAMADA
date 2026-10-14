export interface ValidationFieldError {
  field: string;
  code?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  totalProducts?: number;
  activeTotal?: number;
  totalPages?: number;
  currentPage?: number;
  /** Cursor/Keyset pagination — returned when ?cursor= is supplied */
  pagination?: {
    hasNextPage: boolean;
    nextCursor: string | null;
    limit: number;
  };
  /** Zod / field-level validation errors (HTTP 422) */
  errors?: ValidationFieldError[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'vendor' | 'doctor';
  phone?: string;
  avatar?: string;
  organization?: string;
  status: 'active' | 'inactive' | 'blocked';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  token?: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  code?: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  active?: boolean;
  displayOrder?: number;
  productCount?: number;
  createdAt?: string;
}

export interface Brand {
  _id: string;
  name: string;
  nameAr?: string;
  code?: string;
  slug?: string;
  logo?: string;
  description?: string;
  country?: string;
  website?: string;
  active?: boolean;
  productCount?: number;
  createdAt?: string;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  _id: string;
  id?: string | number;
  name: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  category: Category | string;
  categoryName?: string;
  brand: Brand | string;
  brandName?: string;
  price: number;
  oldPrice?: number;
  costPrice?: number;
  stock: number;
  minStockAlert?: number;
  image: string;
  imagePublicId?: string;
  images?: Array<{ url: string; publicId?: string }>;
  badge?: string;
  badgePrice?: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  medicalCode?: string;
  sfdaApproved?: boolean;
  warranty?: string;
  originCountry?: string;
  specifications?: ProductSpecification[];
  tags?: string[];
  createdAt?: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  image: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  hospitalOrClinic?: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: User | string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cash_on_delivery' | 'credit_card' | 'bank_transfer' | 'mada' | 'tabby';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  medicalVerificationStatus?: 'verified' | 'pending_check' | 'not_required';
  trackingNumber?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
}

export interface Review {
  _id: string;
  product: string;
  user: User | string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  reply?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totals: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    totalBrands: number;
    totalUsers: number;
    lowStockCount: number;
    ordersStatus: {
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
  };
  charts: {
    salesChart: {
      categories: string[];
      series: Array<{ name: string; data: number[] }>;
    };
    categoryChart: {
      labels: string[];
      series: number[];
    };
  };
  recentOrders: Order[];
  topProducts: Array<Product & { unitsSold: number; revenue: number }>;
  lowStockProducts: Array<Pick<Product, '_id' | 'name' | 'sku' | 'stock' | 'minStockAlert' | 'image'>>;
  recentUsers: Array<Pick<User, '_id' | 'name' | 'email' | 'organization' | 'createdAt'>>;
}
