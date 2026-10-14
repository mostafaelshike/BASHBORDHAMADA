import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// ── ثوابت الحماية من الهجمات ──────────────────────────────────────────────────
const MAX_ATTEMPTS      = 5;                // الحد الأقصى للمحاولات
const LOCKOUT_SECONDS   = 300;              // 5 دقائق حظر
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;  // نافذة 15 دقيقة لإعادة الضبط
const STORAGE_KEY       = 'login_attempts';

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

/** التحقق الصارم من صيغة البريد الإلكتروني */
function strictEmailValidator(ctrl: AbstractControl): ValidationErrors | null {
  if (!ctrl.value) return null;
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(ctrl.value.trim()) ? null : { emailFormat: true };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false
})
export class Login implements OnInit, OnDestroy {

  loginForm: FormGroup;
  showPassword  = false;
  loading       = false;
  errorMessage  = '';
  submitted     = false;

  // ── حالة الحماية من الهجمات ────────────────────────────────────────────────
  isLocked                = false;
  lockoutRemainingSeconds = 0;
  attemptsLeft            = MAX_ATTEMPTS;
  showAttemptsWarning     = false;

  private lockoutTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [Validators.required, strictEmailValidator]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(128)
        ]
      ],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.checkLockoutState();
  }

  ngOnDestroy(): void {
    if (this.lockoutTimer) clearInterval(this.lockoutTimer);
  }

  // ────────────────────────── إدارة سجل المحاولات ──────────────────────────

  private getAttemptRecord(): AttemptRecord {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AttemptRecord;
    } catch { /* تجاهل */ }
    return { count: 0, firstAttemptAt: Date.now(), lockedUntil: null };
  }

  private saveAttemptRecord(rec: AttemptRecord): void {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rec)); } catch { /* تجاهل */ }
  }

  private clearAttemptRecord(): void {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* تجاهل */ }
  }

  private checkLockoutState(): void {
    const rec = this.getAttemptRecord();
    const now = Date.now();

    // انتهت نافذة الزمن → إعادة ضبط
    if (rec.count > 0 && (now - rec.firstAttemptAt) > ATTEMPT_WINDOW_MS) {
      this.clearAttemptRecord();
      return;
    }

    if (rec.lockedUntil && now < rec.lockedUntil) {
      this.activateLockout(Math.ceil((rec.lockedUntil - now) / 1000));
    } else if (rec.lockedUntil && now >= rec.lockedUntil) {
      this.clearAttemptRecord();
    } else {
      this.attemptsLeft       = Math.max(0, MAX_ATTEMPTS - rec.count);
      this.showAttemptsWarning = rec.count > 0 && rec.count < MAX_ATTEMPTS;
    }
  }

  private activateLockout(seconds: number): void {
    this.isLocked               = true;
    this.lockoutRemainingSeconds = seconds;
    this.loginForm.disable();
    this.cdr.detectChanges();

    if (this.lockoutTimer) clearInterval(this.lockoutTimer);

    this.lockoutTimer = setInterval(() => {
      this.lockoutRemainingSeconds--;
      if (this.lockoutRemainingSeconds <= 0) {
        clearInterval(this.lockoutTimer!);
        this.lockoutTimer            = null;
        this.isLocked                = false;
        this.attemptsLeft            = MAX_ATTEMPTS;
        this.showAttemptsWarning     = false;
        this.errorMessage            = '';
        this.clearAttemptRecord();
        this.loginForm.enable();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private recordFailedAttempt(): void {
    let rec = this.getAttemptRecord();
    const now = Date.now();

    if ((now - rec.firstAttemptAt) > ATTEMPT_WINDOW_MS) {
      rec = { count: 0, firstAttemptAt: now, lockedUntil: null };
    }

    rec.count++;

    if (rec.count >= MAX_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_SECONDS * 1000;
      this.saveAttemptRecord(rec);
      this.activateLockout(LOCKOUT_SECONDS);
      this.errorMessage = `تم تجاوز الحد الأقصى للمحاولات. سيتم رفع الحظر بعد ${LOCKOUT_SECONDS / 60} دقائق.`;
    } else {
      rec.lockedUntil = null;
      this.saveAttemptRecord(rec);
      this.attemptsLeft        = MAX_ATTEMPTS - rec.count;
      this.showAttemptsWarning = true;
    }
  }

  private recordSuccessfulLogin(): void {
    this.clearAttemptRecord();
    this.isLocked            = false;
    this.attemptsLeft        = MAX_ATTEMPTS;
    this.showAttemptsWarning = false;
  }

  // ────────────────────────── مساعدات العرض ────────────────────────────────

  get lockoutMinutes(): number { return Math.floor(this.lockoutRemainingSeconds / 60); }
  get lockoutSeconds(): number { return this.lockoutRemainingSeconds % 60; }

  // ────────────────────────── واجهة النموذج ────────────────────────────────

  get email()    { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  toggleShowPassword(): void { this.showPassword = !this.showPassword; }

  isFieldInvalid(fieldName: string): boolean {
    const f = this.loginForm.get(fieldName);
    return !!(f && f.invalid && (f.touched || this.submitted));
  }

  isFieldValid(fieldName: string): boolean {
    const f = this.loginForm.get(fieldName);
    return !!(f && f.valid && (f.touched || this.submitted));
  }

  getEmailError(): string {
    const e = this.loginForm.get('email')?.errors;
    if (!e) return '';
    if (e['required'])     return 'البريد الإلكتروني مطلوب';
    if (e['emailFormat'])  return 'صيغة البريد الإلكتروني غير صحيحة';
    return 'بريد إلكتروني غير صالح';
  }

  getPasswordError(): string {
    const e = this.loginForm.get('password')?.errors;
    if (!e) return '';
    if (e['required'])   return 'كلمة المرور مطلوبة';
    if (e['minlength'])  return 'كلمة المرور 6 أحرف على الأقل';
    if (e['maxlength'])  return 'كلمة المرور طويلة جداً';
    return 'كلمة مرور غير صالحة';
  }

  onFieldBlur(fieldName: string): void {
    this.loginForm.get(fieldName)?.markAsTouched();
    this.cdr.detectChanges();
  }

  useDemoAccount(): void {
    if (this.isLocked) return;
    this.loginForm.patchValue({
      email: 'admin@medicalmarket.com',
      password: 'admin123456',
      rememberMe: true
    });
    this.loginForm.markAllAsTouched();
    this.errorMessage = '';
    this.onLogin();
  }

  showForgotMessage(): void {
    this.errorMessage =
      'يرجى التواصل مع مدير النظام الرئيسي لإعادة تعيين كلمة المرور';
    this.cdr.detectChanges();
  }

  onLogin(): void {
    if (this.isLocked) return;

    this.errorMessage = '';
    this.submitted    = true;

    // تنظيف المدخلات
    const emailCtrl = this.loginForm.get('email');
    if (emailCtrl?.value) {
      emailCtrl.setValue(emailCtrl.value.trim().toLowerCase(), { emitEvent: false });
    }

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    const credentials = {
      email:    this.email?.value,
      password: this.password?.value
    };

    this.authService.login(credentials).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          if (!this.authService.isAdmin()) {
            this.authService.logout();
            this.errorMessage = 'هذا الحساب غير مصرح له بدخول لوحة التحكم';
            this.cdr.detectChanges();
            return;
          }
          this.recordSuccessfulLogin();
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard/Home';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.recordFailedAttempt();
          if (!this.isLocked) {
            this.errorMessage = 'فشل تسجيل الدخول، تحقق من البيانات المدخلة';
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.recordFailedAttempt();

        if (!this.isLocked) {
          const status = err?.status;
          if (status === 401) {
            this.errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
          } else if (status === 403) {
            this.errorMessage = 'حسابك محظور. يرجى التواصل مع الإدارة';
          } else if (status === 429) {
            this.errorMessage = 'تم تجاوز حد المحاولات على الخادم. حاول لاحقاً';
          } else {
            this.errorMessage =
              err?.error?.message ||
              err?.message ||
              'فشل تسجيل الدخول، تحقق من البريد الإلكتروني وكلمة المرور';
          }
        }
        this.cdr.detectChanges();
      }
    });
  }
}