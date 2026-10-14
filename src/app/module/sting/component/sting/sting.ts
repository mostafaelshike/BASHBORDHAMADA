import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-sting',
  standalone: false,
  templateUrl: './sting.html',
  styleUrl: './sting.css',
})
export class Sting implements OnInit {
  loading = false;
  saving = false;
  successMessage = '';
  errorMessage = '';

  settings = {
    storeName: 'سوق طبي - Medical Market',
    storeDescription: 'المنصة الرائدة لتوريد الأجهزة والمستلزمات الطبية المعتمدة',
    email: 'support@medicalmarket.com',
    phone: '+966 50 123 4567',
    address: 'طريق الملك فهد، الرياض، المملكة العربية السعودية',
    currency: 'ر.س',
    taxRate: 15,
    shippingFee: 35,
    freeShippingThreshold: 500,
    maintenanceMode: false
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.api.get<any>('settings').subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.settings = { ...this.settings, ...res.data };
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading settings:', err);
      }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.api.put<any>('settings', this.settings).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success) {
          this.successMessage = 'تم حفظ الإعدادات بنجاح في قاعدة البيانات!';
          setTimeout(() => (this.successMessage = ''), 4000);
        }
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = 'تعذر حفظ الإعدادات: ' + err.message;
      }
    });
  }
}
