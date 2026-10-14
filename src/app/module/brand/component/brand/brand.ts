import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand as BrandModel } from '../../../../core/models/models';

@Component({
  selector: 'app-brand',
  standalone: false,
  templateUrl: './brand.html',
  styleUrl: './brand.css',
})
export class Brand implements OnInit {
  brands: BrandModel[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditMode = false;
  editingId: string | null = null;
  errorMessage = '';
  pendingDelete: BrandModel | null = null;
  deleteErrorMessage = '';
  isDeleting = false;

  readonly brandForm;

  totalBrandsCount = 0;
  totalProductsCount = 0;
  currentPage = 1;
  readonly pageSize = 10;

  get paginatedBrands(): BrandModel[] {
    return this.brands;
  }

  constructor(
    private brandService: BrandService,
    private formBuilder: FormBuilder
  ) {
    this.brandForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: [''],
      code: [''],
      country: ['ألمانيا'],
      description: [''],
      website: ['', Validators.pattern(/^https?:\/\/.+$/i)],
      logo: ['https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=150&q=80'],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.loading = true;
    this.brandService.getBrands({ page: this.currentPage, limit: this.pageSize }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.data) {
          this.brands = res.data;
          this.totalBrandsCount = res.total ?? res.count ?? res.data.length;
          this.totalProductsCount = res.totalProducts ?? this.totalProductsCount;
          const totalPages = Math.max(1, Math.ceil(this.totalBrandsCount / this.pageSize));
          if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
            this.loadBrands();
            return;
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadBrands();
  }

  openModal(b?: BrandModel): void {
    this.errorMessage = '';
    if (b) {
      this.isEditMode = true;
      this.editingId = b._id;
      this.brandForm.reset({
        name: b.name,
        nameAr: b.nameAr || '',
        code: b.code || '',
        country: b.country || 'ألمانيا',
        description: b.description || '',
        website: b.website || '',
        logo: b.logo || '',
        active: b.active !== false
      });
    } else {
      this.isEditMode = false;
      this.editingId = null;
      this.brandForm.reset({
        name: '',
        nameAr: '',
        code: 'BRD-' + Math.floor(10 + Math.random() * 90),
        country: 'ألمانيا',
        description: '',
        website: '',
        logo: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=150&q=80',
        active: true
      });
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveBrand(): void {
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    if (this.isEditMode && this.editingId) {
      this.brandService.updateBrand(this.editingId, this.brandForm.getRawValue()).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.closeModal();
            this.loadBrands();
          }
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.message;
        }
      });
    } else {
      this.brandService.createBrand(this.brandForm.getRawValue()).subscribe({
        next: (res) => {
          this.saving = false;
          if (res.success) {
            this.closeModal();
            this.loadBrands();
          }
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.message;
        }
      });
    }
  }

  requestDeleteBrand(brand: BrandModel): void {
    this.pendingDelete = brand;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    if (!this.isDeleting) {
      this.pendingDelete = null;
      this.deleteErrorMessage = '';
    }
  }

  confirmDelete(): void {
    const brand = this.pendingDelete;
    if (!brand || this.isDeleting) return;

    this.isDeleting = true;
    this.deleteErrorMessage = '';
    this.brandService.deleteBrand(brand._id).subscribe({
      next: (res) => {
        this.isDeleting = false;
        if (res.success) {
          this.cancelDelete();
          this.loadBrands();
        } else {
          this.deleteErrorMessage = 'تعذر حذف العلامة التجارية.';
        }
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = 'تعذر حذف العلامة التجارية: ' + err.message;
      }
    });
  }
}
