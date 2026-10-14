import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { EMPTY, expand, reduce } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { BrandService } from '../../../../core/services/brand.service';
import { UploadService } from '../../../../core/services/upload.service';
import { StatsService } from '../../../../core/services/stats.service';
import { Product as ProductModel, Category, Brand } from '../../../../core/models/models';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product implements OnInit {

  products: ProductModel[] = [];
  filteredProducts: ProductModel[] = [];
  paginatedProducts: ProductModel[] = [];

  categories: Category[] = [];
  brands: Brand[] = [];

  loading = false;
  uploadingImage = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  searchKeyword = '';
  selectedCategory = 'all';
  selectedStatus = 'all';

  totalProductsCount = 0;
  totalMatchingProducts = 0;
  activeProductsCount = 0;
  lowStockCount = 0;
  inactiveCount = 0;

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  pageNumbers: number[] = [];

  shimmerRows = [1, 2, 3, 4, 5, 6, 7, 8];
  private searchTimer?: ReturnType<typeof setTimeout>;
  private loadSequence = 0;

  showProductModal = false;
  showDeleteModal = false;

  editingProduct: ProductModel | null = null;
  productToDelete: ProductModel | null = null;
  detailsProduct: ProductModel | null = null;

  // ── Validation ──────────────────────────────────────────────────────────────
  formSubmitted = false;
  formErrors: Record<string, string> = {};

  // ── حدود رفع الملفات ───────────────────────────────────────────────────────
  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 ميجا
  readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  fileError = '';

  productForm: any = {
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    price: 0,
    oldPrice: 0,
    costPrice: 0,
    stock: 0,
    minStockAlert: 5,
    image: '',
    imagePublicId: '',
    badge: '',
    warranty: '',
    originCountry: '',
    isActive: true,
    sfdaApproved: false,
    medicalCode: ''
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private uploadService: UploadService,
    private statsService: StatsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.errorMessage = '';

    this.loadProducts();
    this.statsService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const totals = response.data.totals;
          this.totalProductsCount = totals.totalProducts;
          this.activeProductsCount = totals.activeProducts;
          this.lowStockCount = totals.lowStockCount;
          this.inactiveCount = Math.max(0, totals.totalProducts - totals.activeProducts);
        }
      },
      error: (error) => console.error('Error loading product statistics:', error)
    });

    this.categoryService.getCategories({ limit: 100 }).subscribe({
      next: (response: any) => {
        this.categories =
          response?.data ||
          response?.categories ||
          [];
      },
      error: () => {
        this.categories = [];
      }
    });

    this.brandService.getBrands({ limit: 100 }).subscribe({
      next: (response: any) => {
        this.brands =
          response?.data ||
          response?.brands ||
          [];
      },
      error: () => {
        this.brands = [];
      }
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.errorMessage = '';
    const startedAt = Date.now();
    const sequence = ++this.loadSequence;
    const params: Record<string, string | number | boolean> = {
      page: 1,
      limit: 100
    };

    if (this.searchKeyword.trim()) params['keyword'] = this.searchKeyword.trim();
    if (this.selectedCategory !== 'all') params['category'] = this.selectedCategory;
    if (this.selectedStatus === 'active') params['isActive'] = true;
    if (this.selectedStatus === 'inactive') params['isActive'] = false;
    if (this.selectedStatus === 'lowStock') params['lowStock'] = true;

    this.productService.getProducts(params).pipe(
      expand((response) => {
        const nextPage = (response.currentPage ?? 1) + 1;
        return nextPage <= (response.totalPages ?? 1)
          ? this.productService.getProducts({ ...params, page: nextPage })
          : EMPTY;
      }),
      reduce(
        (result, response) => {
          if (response.success) {
            result.products.push(...(response.data || []));
            result.total = response.total ?? result.total;
          }
          return result;
        },
        { products: [] as ProductModel[], total: 0 }
      )
    ).subscribe({
      next: (result) => {
        if (sequence !== this.loadSequence) return;
        this.products = result.products;
        this.filteredProducts = this.products;
        this.totalMatchingProducts = result.total || this.products.length;
        this.totalPages = Math.max(1, Math.ceil(this.totalMatchingProducts / this.pageSize));

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }

        this.updatePageNumbers();
        this.updateVisibleProducts();
        this.finishLoading(startedAt, sequence);
      },
      error: (error) => {
        if (sequence !== this.loadSequence) return;
        this.errorMessage = error?.message || 'حدث خطأ أثناء تحميل المنتجات';
        this.products = [];
        this.filteredProducts = [];
        this.paginatedProducts = [];
        this.totalMatchingProducts = 0;
        this.totalPages = 1;
        this.finishLoading(startedAt, sequence);
      }
    });
  }

  private finishLoading(startTime: number, sequence: number): void {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(1000 - elapsed, 0);

    setTimeout(() => {
      if (sequence !== this.loadSequence) return;
      this.loading = false;

      this.cdr.detectChanges();
    }, remaining);
  }

  calculateStats(): void {
    this.totalProductsCount = this.products.length;

    this.activeProductsCount = this.products.filter(
      product => product.isActive !== false
    ).length;

    this.inactiveCount = this.products.filter(
      product => product.isActive === false
    ).length;

    this.lowStockCount = this.products.filter(
      product =>
        Number(product.stock || 0) <=
        Number(product.minStockAlert || 5)
    ).length;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  updatePagination(): void {
    this.updateVisibleProducts();
  }

  private updateVisibleProducts(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedProducts = this.products.slice(start, start + this.pageSize);
  }

  private updatePageNumbers(): void {
    const firstPage = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const lastPage = Math.min(this.totalPages, firstPage + 4);
    this.pageNumbers = Array.from(
      { length: lastPage - firstPage + 1 },
      (_, index) => firstPage + index
    );
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.loading
    ) {
      return;
    }

    this.currentPage = page;
    this.updatePageNumbers();
    this.updateVisibleProducts();
    this.loading = false;
    this.cdr.detectChanges();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  onPageSizeChange(pageSize: number): void {
    if (pageSize === this.pageSize || pageSize < 1 || pageSize > 100) {
      return;
    }

    this.pageSize = pageSize;
    this.currentPage = 1;
    this.totalPages = Math.max(1, Math.ceil(this.totalMatchingProducts / this.pageSize));
    this.updatePageNumbers();
    this.updateVisibleProducts();
   }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getStartIndex(): number {
    if (this.totalMatchingProducts === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) *
        this.pageSize +
      1
    );
  }

  getEndIndex(): number {
    return     Math.min(this.currentPage * this.pageSize, this.totalMatchingProducts);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadProducts(), 300);
  }

  onCategorySelect(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  onStatusSelect(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  openNewProduct(): void {
    this.editingProduct = null;
    this.formSubmitted = false;
    this.formErrors = {};
    this.fileError = '';

    this.productForm = {
      name: '',
      sku: '',
      description: '',
      category: '',
      brand: '',
      price: 0,
      oldPrice: 0,
      costPrice: 0,
      stock: 0,
      minStockAlert: 5,
      image: '',
      imagePublicId: '',
      badge: '',
      warranty: '',
      originCountry: '',
      isActive: true,
      sfdaApproved: false,
      medicalCode: ''
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showProductModal = true;
  }

  openEditProduct(product: ProductModel): void {
    this.editingProduct = product;

    this.productForm = {
      name: (product as any).name || '',
      sku: (product as any).sku || '',
      description: (product as any).description || '',
      category:
        (product as any).category?._id ||
        (product as any).category?.id ||
        (product as any).category ||
        '',
      brand:
        (product as any).brand?._id ||
        (product as any).brand?.id ||
        (product as any).brand ||
        '',
      price: (product as any).price || 0,
      oldPrice: (product as any).oldPrice || 0,
      costPrice: (product as any).costPrice || 0,
      stock: (product as any).stock || 0,
      minStockAlert:
        (product as any).minStockAlert || 5,
      image: (product as any).image || '',
      imagePublicId: (product as any).imagePublicId || '',
      badge: (product as any).badge || '',
      warranty: (product as any).warranty || '',
      originCountry:
        (product as any).originCountry || '',
      isActive:
        (product as any).isActive !== false,
      sfdaApproved:
        (product as any).sfdaApproved || false,
      medicalCode:
        (product as any).medicalCode || ''
    };

    this.errorMessage = '';
    this.successMessage = '';

    this.showProductModal = true;
  }

  openProductDetails(product: ProductModel): void {
    this.detailsProduct = product;
  }

  closeProductDetails(): void {
    this.detailsProduct = null;
  }

  getProductCategoryName(product: ProductModel): string {
    if (product.categoryName) return product.categoryName;
    if (typeof product.category === 'object' && product.category) {
      return product.category.name;
    }
    return this.categories.find(category => category._id === product.category)?.name || 'غير محدد';
  }

  getProductBrandName(product: ProductModel): string {
    if (product.brandName) return product.brandName;
    if (typeof product.brand === 'object' && product.brand) {
      return product.brand.name;
    }
    return this.brands.find(brand => brand._id === product.brand)?.name || 'غير محدد';
  }

  closeProductModal(): void {
    if (this.saving || this.uploadingImage) {
      return;
    }

    this.showProductModal = false;
    this.editingProduct = null;
  }

  // ── التحقق من صحة البيانات ──────────────────────────────────────────────────
  validateProductForm(): boolean {
    this.formErrors = {};
    const f = this.productForm;

    // الاسم
    if (!f.name || !f.name.trim()) {
      this.formErrors['name'] = 'اسم المنتج مطلوب';
    } else if (f.name.trim().length < 3) {
      this.formErrors['name'] = 'اسم المنتج يجب أن يكون 3 أحرف على الأقل';
    } else if (f.name.trim().length > 200) {
      this.formErrors['name'] = 'اسم المنتج طويل جداً (الحد الأقصى 200 حرف)';
    }

    // كود SKU
    if (!f.sku || !f.sku.trim()) {
      this.formErrors['sku'] = 'كود الصنف الطبي SKU مطلوب';
    } else if (!/^[A-Za-z0-9\-_]+$/.test(f.sku.trim())) {
      this.formErrors['sku'] = 'كود SKU يجب أن يحتوي على حروف وأرقام وشرطات فقط';
    }

    // القسم
    if (!f.category) {
      this.formErrors['category'] = 'يجب اختيار القسم الطبي';
    }

    // العلامة التجارية
    if (!f.brand) {
      this.formErrors['brand'] = 'يجب اختيار الشركة المصنعة';
    }

    if (!f.image || !String(f.image).trim()) {
      this.formErrors['image'] = 'صورة المنتج مطلوبة';
    } else if (/^data:/i.test(String(f.image).trim())) {
      this.formErrors['image'] = 'يرجى رفع الصورة إلى التخزين قبل حفظ المنتج';
    }

    // السعر
    if (f.price === null || f.price === undefined || f.price === '') {
      this.formErrors['price'] = 'السعر مطلوب';
    } else if (Number(f.price) <= 0) {
      this.formErrors['price'] = 'السعر يجب أن يكون أكبر من صفر';
    } else if (Number(f.price) > 999999) {
      this.formErrors['price'] = 'السعر يتجاوز الحد الأقصى المسموح';
    }

    // السعر القديم
    if (f.oldPrice && Number(f.oldPrice) > 0 && Number(f.oldPrice) < Number(f.price)) {
      this.formErrors['oldPrice'] = 'السعر قبل الخصم يجب أن يكون أكبر من السعر الحالي';
    }

    // المخزون
    if (f.stock === null || f.stock === undefined || f.stock === '') {
      this.formErrors['stock'] = 'الكمية المتوفرة مطلوبة';
    } else if (Number(f.stock) < 0) {
      this.formErrors['stock'] = 'الكمية لا يمكن أن تكون سالبة';
    } else if (!Number.isInteger(Number(f.stock))) {
      this.formErrors['stock'] = 'الكمية يجب أن تكون عدد صحيح';
    }

    // الوصف
    if (f.description && f.description.length > 2000) {
      this.formErrors['description'] = 'الوصف طويل جداً (الحد الأقصى 2000 حرف)';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  getFieldError(field: string): string {
    return this.formErrors[field] || '';
  }

  hasFieldError(field: string): boolean {
    return this.formSubmitted && !!this.formErrors[field];
  }

  saveProduct(): void {
    if (this.saving) {
      return;
    }

    this.formSubmitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // تنظيف المدخلات
    if (this.productForm.name) {
      this.productForm.name = this.productForm.name.trim();
    }
    if (this.productForm.sku) {
      this.productForm.sku = this.productForm.sku.trim();
    }

    if (!this.validateProductForm()) {
      this.errorMessage = 'يرجى تصحيح الأخطاء في النموذج';
      return;
    }

    this.saving = true;

    const request$ = this.editingProduct
      ? this.productService.updateProduct(
          (this.editingProduct as any)._id,
          this.productForm
        )
      : this.productService.createProduct(
          this.productForm
        );

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.formSubmitted = false;

        this.successMessage =
          this.editingProduct
            ? 'تم تحديث المنتج بنجاح'
            : 'تم إضافة المنتج بنجاح';

        this.showProductModal = false;
        this.editingProduct = null;

        this.loadData();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.saving = false;
        const fieldErrors = error?.fieldErrors || error?.error?.errors || [];
        for (const fieldError of fieldErrors as Array<{ field: string; message: string }>) {
          this.formErrors[fieldError.field] = fieldError.message;
        }
        this.errorMessage = fieldErrors.length
          ? fieldErrors.map((item: { message: string }) => item.message).join('، ')
          : error?.error?.message || error?.message || 'حدث خطأ أثناء حفظ المنتج';
      }
    });
  }

  /** التحقق من صلاحية الملف (النوع والحجم) */
  private validateFile(file: File): string | null {
    // فحص نوع الملف
    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
        return `نوع الملف غير مسموح. الأنواع المسموحة: ${this.ALLOWED_EXTENSIONS.join(', ')}`;
      }
    }

    // فحص حجم الملف
    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `حجم الملف (${sizeMB} ميجا) يتجاوز الحد المسموح (${this.MAX_FILE_SIZE_MB} ميجا)`;
    }

    // فحص اسم الملف من الأحرف الخبيثة
    if (/[<>:"|\/\\?*]/.test(file.name)) {
      return 'اسم الملف يحتوي على أحرف غير مسموحة';
    }

    return null;
  }

  /** حجم الملف المسموح للعرض */
  getMaxFileSizeDisplay(): string {
    return `${this.MAX_FILE_SIZE_MB} MB`;
  }

  uploadProductImage(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    if (!input.files || !input.files.length) {
      return;
    }

    const file = input.files[0];
    this.fileError = '';

    // ── فحص الملف قبل الرفع ──
    const validationError = this.validateFile(file);
    if (validationError) {
      this.fileError = validationError;
      input.value = ''; // إعادة تعيين الحقل
      return;
    }

    this.uploadingImage = true;
    this.errorMessage = '';
    this.fileError = '';

    this.uploadService.uploadImage(file).subscribe({
      next: (response) => {
        const uploadedImage = response?.data;
        if (!response?.success || !uploadedImage?.url) {
          this.fileError = response?.message || 'لم يصل رابط الصورة بعد الرفع';
        } else {
          this.productForm.image = uploadedImage.url;
          this.productForm.imagePublicId = uploadedImage.publicId || '';
        }
        this.uploadingImage = false;
        input.value = '';
      },
      error: (error) => {
        this.uploadingImage = false;
        this.fileError =
          error?.error?.message ||
          error?.message ||
          'حدث خطأ أثناء رفع الصورة';
        input.value = '';
      }
    });
  }

  onImageUrlChange(url: string): void {
    this.productForm.image = url;
    this.productForm.imagePublicId = '';
  }

  openDeleteModal(product: ProductModel): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (this.saving) {
      return;
    }

    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (
      !this.productToDelete ||
      this.saving
    ) {
      return;
    }

    const productId =
      (this.productToDelete as any)._id;

    if (!productId) {
      return;
    }

    this.saving = true;

    this.productService
      .deleteProduct(productId)
      .subscribe({
        next: () => {
          this.saving = false;

          this.showDeleteModal = false;
          this.productToDelete = null;

          this.successMessage =
            'تم حذف المنتج بنجاح';

          this.loadData();

          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.saving = false;

          this.errorMessage =
            error?.error?.message ||
            'حدث خطأ أثناء حذف المنتج';
        }
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.detailsProduct) {
      this.closeProductDetails();
      return;
    }

    if (this.showDeleteModal) {
      this.closeDeleteModal();
      return;
    }

    if (this.showProductModal) {
      this.closeProductModal();
    }
  }
}