export interface NavChild {
  path: string;
  label: string;
}

export interface NavItem {
  path?: string;
  label: string;
  icon: string;
  activeimg?: string;
  children?: NavChild[];
  isOpen?: boolean;
}

export const NAVBAR_DATA: NavItem[] = [
  {
    path: '/dashboard/Home',
    label: 'الرئيسية',
    icon: 'bi-house-door',
  },
  {
    path: '/dashboard/product',
    label: 'المنتجات',
    icon: 'bi-box-seam',
  },
  {
    path: '/dashboard/catogery',
    label: 'الأقسام',
    icon: 'bi-grid',
  },
  // {
  //   path: '/dashboard/brand',
  //   label: 'العلامات التجارية',
  //   icon: 'bi-tags',
  // },
  {
    path: '/dashboard/order',
    label: 'الطلبات',
    icon: 'bi-clipboard-check',
  },
  {
    path: '/dashboard/user',
    label: 'العملاء',
    icon: 'bi-people',
  },
  {
    path: '/dashboard/sting',
    label: 'الإعدادات',
    icon: 'bi-gear',
  },
];