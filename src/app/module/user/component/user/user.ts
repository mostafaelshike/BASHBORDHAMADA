
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { User as UserModel } from '../../../../core/models/models';

@Component({
  selector: 'app-user',
  standalone: false,
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User implements OnInit {
  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];

  loading = false;
  saving = false;

  showModal = false;
  isEditMode = false;
  editingId: string | null = null;

  errorMessage = '';
  searchKeyword = '';

  pendingDelete: UserModel | null = null;
  deleteErrorMessage = '';
  isDeleting = false;
  currentPage = 1;
  readonly pageSize = 10;
  totalUsers = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private loadSequence = 0;

  skeletonRows = [1, 2, 3, 4, 5, 6, 7];

  get paginatedUsers(): UserModel[] {
    return this.filteredUsers;
  }

  userForm = {
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user' | 'vendor' | 'doctor',
    phone: '',
    organization: '',
    status: 'active' as 'active' | 'inactive' | 'blocked'
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const sequence = ++this.loadSequence;

    const startedAt = Date.now();

    const params: Record<string, string | number> = {
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.searchKeyword.trim()) params['keyword'] = this.searchKeyword.trim();

    this.userService.getUsers(params).subscribe({
      next: (res) => {
        if (sequence !== this.loadSequence) return;
        if (res.success && res.data) {
          this.users = res.data;
          this.filteredUsers = res.data;
          this.totalUsers = res.total ?? res.count ?? res.data.length;
          const totalPages = Math.max(1, Math.ceil(this.totalUsers / this.pageSize));
          if (this.currentPage > totalPages) {
            this.currentPage = totalPages;
            this.loadUsers();
            return;
          }
        }

        this.finishLoading(startedAt, sequence);
      },
      error: (err) => {
        if (sequence !== this.loadSequence) return;
        this.errorMessage = err.message;
        this.users = [];
        this.filteredUsers = [];
        this.totalUsers = 0;
        this.finishLoading(startedAt, sequence);
      }
    });
  }

  private finishLoading(startedAt: number, sequence: number): void {
    const minimumLoadingTime = 1000;
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minimumLoadingTime - elapsed);

    setTimeout(() => {
      this.zone.run(() => {
        if (sequence !== this.loadSequence) return;
        this.loading = false;
        this.cdr.detectChanges();
      });
    }, remaining);
  }

  applyFilter(): void {
    this.currentPage = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadUsers(), 300);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  openModal(u?: UserModel): void {
    this.errorMessage = '';

    if (u) {
      this.isEditMode = true;
      this.editingId = u._id;

      this.userForm = {
        name: u.name,
        email: u.email,
        password: '',
        role: u.role,
        phone: u.phone || '',
        organization: u.organization || '',
        status: u.status || 'active'
      };
    } else {
      this.isEditMode = false;
      this.editingId = null;

      this.userForm = {
        name: '',
        email: '',
        password: '',
        role: 'user',
        phone: '',
        organization: '',
        status: 'active'
      };
    }

    this.showModal = true;
  }

  closeModal(): void {
    if (this.saving) return;

    this.showModal = false;
  }

  saveUser(): void {
    this.userForm.name = this.userForm.name.trim();
    this.userForm.email = this.userForm.email.trim().toLowerCase();
    this.userForm.phone = this.userForm.phone.trim();
    this.userForm.organization = this.userForm.organization.trim();

    if (this.userForm.name.length < 2) {
      this.errorMessage = 'الاسم يجب أن يحتوي على حرفين على الأقل';
      return;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,3}$/i.test(this.userForm.email)) {
      this.errorMessage = 'يرجى إدخال بريد إلكتروني صحيح';
      return;
    }
    if (this.userForm.phone.length > 20 || this.userForm.organization.length > 100) {
      this.errorMessage = 'رقم الهاتف أو اسم المنشأة تجاوز الحد الأقصى المسموح';
      return;
    }

    if ((!this.isEditMode || this.userForm.password) &&
        (this.userForm.password.length < 6 || this.userForm.password.length > 64)) {
      this.errorMessage = 'كلمة المرور يجب أن تكون بين 6 و64 حرفاً';
      return;
    }
    if (this.saving) return;

    this.saving = true;
    this.errorMessage = '';

    if (this.isEditMode && this.editingId) {
      this.userService.updateUser(this.editingId, this.userForm).subscribe({
        next: (res) => {
          this.saving = false;

          if (res.success) {
            this.closeModal();
            this.loadUsers();
          }
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.message;
        }
      });
    } else {
      this.userService.createUser(this.userForm).subscribe({
        next: (res) => {
          this.saving = false;

          if (res.success) {
            this.closeModal();
            this.loadUsers();
          }
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.message;
        }
      });
    }
  }

  requestDeleteUser(user: UserModel): void {
    this.pendingDelete = user;
    this.deleteErrorMessage = '';
  }

  cancelDelete(): void {
    if (!this.isDeleting) {
      this.pendingDelete = null;
      this.deleteErrorMessage = '';
    }
  }

  confirmDelete(): void {
    const user = this.pendingDelete;

    if (!user || this.isDeleting) return;

    this.isDeleting = true;
    this.deleteErrorMessage = '';

    this.userService.deleteUser(user._id).subscribe({
      next: (res) => {
        this.isDeleting = false;

        if (res.success) {
          this.cancelDelete();
          this.loadUsers();
        } else {
          this.deleteErrorMessage = 'تعذر حذف المستخدم.';
        }
      },
      error: (err) => {
        this.isDeleting = false;
        this.deleteErrorMessage = 'تعذر حذف المستخدم: ' + err.message;
      }
    });
  }
}
