import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import { UploadService } from '../../../../core/services/upload.service';
import { Category } from '../../../../core/models/models';

@Component({
  selector: 'app-catogery',
  standalone: false,
  templateUrl: './catogery.html',
  styleUrl: './catogery.css',
})
export class Catogery implements OnInit {
  categories: Category[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditMode = false;
  editingId: string | null = null;
  errorMessage = '';
  pendingDelete: Category | null = null;
  deleteErrorMessage = '';
  isDeleting = false;
  currentPage = 1;
  readonly pageSize = 10;
  totalCategories = 0;
  totalProductsCount = 0;
  activeCategoriesCount = 0;

  shimmerRows = [1, 2, 3, 4, 5, 6];

  get paginatedCategories(): Category[] {
    return this.categories;
  }

  newCategory = {
    name: '',
    nameEn: '',
    code: '',
    description: '',
    icon: 'bi-heart-pulse',
    image: '',
    active: true
  };

  stats = [
    {
      title: 'إجمالي الأقسام الصحية',
      value: '0',
      description: 'قسمًا نشطًا',
      note: 'مفعلة بالكتالوج',
      icon: 'layers',
      type: 'green'
    },
    {
      title: 'المنتجات المصنفة',
      value: '0',
      description: 'جهاز ومستلزم',
      note: 'مطابق لمعايير SFDA',
      icon: 'boxes',
      type: 'blue'
    },
    {
      title: 'الأكثر طلباً وتوريداً',
      value: 'تشخيص',
      description: 'الأجهزة التشخيصية',
      note: 'بنسبة توريد 94%',
      icon: 'file-medical',
      type: 'blue'
    },
    {
      title: 'أقسام تحت التطوير',
      value: '0',
      description: 'فئات',
      note: 'مراجعة المواصفات',
      icon: 'clipboard',
      type: 'red'
    }
  ];

  constructor(
    private categoryService: CategoryService,
    private uploadService: UploadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    const loadingStartTime = Date.now();

    this.cdr.detectChanges();

    this.categoryService.getCategories({ page: this.currentPage, limit: this.pageSize }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
          this.totalCategories = res.total ?? res.count ?? res.data.length;
          this.totalProductsCount = res.totalProducts ?? this.totalProductsCount;
          this.activeCategoriesCount = res.activeTotal ?? res.data.filter(c => c.active !== false).length;
          const totalPages = Math.max(1, Math.ceil(this.totalCategories / this.pageSize));
          if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
            this.loadCategories();
            return;
          }
          this.updateStats();
        }

        this.finishLoading(loadingStartTime);
      },
      error: (err) => {
        this.errorMessage = err.message || 'حدث خطأ أثناء تحميل الأقسام الطبية.';
        this.finishLoading(loadingStartTime);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCategories();
  }

  private finishLoading(startTime: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(1000 - elapsed, 0);

    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, remaining);
  }

  updateStats(): void {
    this.stats[0].value = this.activeCategoriesCount.toString();
    this.stats[1].value = this.totalProductsCount.toString();
  }

  openModal(cat?: Category): void {
    this.errorMessage = '';

    if (cat) {
      this.isEditMode = true;
      this.editingId = cat._id;

      this.newCategory = {
        name: cat.name,
        nameEn: cat.nameEn || '',
        code: cat.code || '',
        description: cat.description || '',
        icon: cat.icon || 'bi-heart-pulse',
        image: cat.image || '',
        active: cat.active !== false
      };
    } else {
      this.isEditMode = false;
      this.editingId = null;

      this.newCategory = {
        name: '',
        nameEn: '',
        code: 'CAT-MED-' + Math.floor(10 + Math.random() * 90),
        description: '',
        icon: 'bi-heart-pulse',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=500&q=80',
        active: true
      };
    }

    this.showModal = true;
  }

  closeModal(): void {
    if (this.saving) {
      return;
    }

    this.showModal = false;
  }

  saveCategory(): void {
    this.newCategory.name = this.newCategory.name.trim();
    if (this.newCategory.name.length < 2) {
      this.errorMessage = 'اسم القسم يجب أن يحتوي على حرفين على الأقل';
      return;
    }

    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';

    if (this.isEditMode && this.editingId) {
      this.categoryService
        .updateCategory(this.editingId, this.newCategory)
        .subscribe({
          next: (res) => {
            this.saving = false;

            if (res.success) {
              this.closeModal();
              this.loadCategories();
            }
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage =
              err.message || 'حدث خطأ أثناء تحديث القسم.';
          }
        });
    } else {
      this.categoryService
        .createCategory(this.newCategory)
        .subscribe({
          next: (res) => {
            this.saving = false;

            if (res.success) {
              this.closeModal();
              this.loadCategories();
            }
          },
          error: (err) => {
            this.saving = false;
            this.errorMessage =
              err.message || 'حدث خطأ أثناء إضافة القسم.';
          }
        });
    }
  }

  requestDeleteCategory(category: Category): void {
    this.pendingDelete = category;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    if (!this.isDeleting) {
      this.pendingDelete = null;
      this.deleteErrorMessage = '';
    }
  }

  confirmDelete(): void {
    const category = this.pendingDelete;

    if (!category || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.deleteErrorMessage = '';

    this.categoryService
      .deleteCategory(category._id)
      .subscribe({
        next: (res) => {
          this.isDeleting = false;

          if (res.success) {
            this.cancelDelete();
            this.loadCategories();
          } else {
            this.deleteErrorMessage = 'تعذر حذف القسم.';
          }
        },
        error: (err) => {
          this.isDeleting = false;
          this.deleteErrorMessage =
            'تعذر حذف القسم: ' + err.message;
        }
      });
  }
}