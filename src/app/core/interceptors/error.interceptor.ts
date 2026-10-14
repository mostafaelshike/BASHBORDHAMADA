import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';

/**
 * Global Error Interceptor — Dashboard
 *
 * Handles:
 *  • HTTP 429  → rate-limit toast
 *  • HTTP 409  → conflict toast
 *  • HTTP 422  → attaches structured field errors to the thrown error
 *                so components can read err.fieldErrors[]
 *  • HTTP 401  → session-expired toast (but lets the error propagate
 *                so guards/components can redirect)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = err.error ?? {};

      switch (err.status) {
        case 429:
          toast.show(
            body.message || 'تم تجاوز الحد الأقصى للطلبات، يرجى الانتظار قليلاً ثم المحاولة مجدداً',
            'warning'
          );
          break;

        case 409:
          toast.show(
            body.message || 'يوجد تعارض في البيانات، يرجى التحقق والمحاولة مجدداً',
            'error'
          );
          break;

        case 401:
          if (!/\/auth\/(login|register)(?:\?|$)/.test(req.urlWithParams)) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.dispatchEvent(new Event('medical-market:session-expired'));
            }
            toast.show('انتهت صلاحية جلستك، يرجى تسجيل الدخول من جديد', 'info');
            void router.navigate(['/login'], {
              queryParams: { returnUrl: router.url }
            });
          }
          break;

        default:
          break;
      }

      // For 422 — attach fieldErrors so components can display inline
      const fallbackMessage = err.status === 0
        ? 'تعذر الاتصال بالخادم، تحقق من اتصال الإنترنت وحاول مرة أخرى'
        : 'حدث خطأ في الخادم';
      const enhanced: any = new Error(body.message || fallbackMessage);
      enhanced.status = err.status;
      enhanced.error = body;

      if (err.status === 422 && Array.isArray(body.errors)) {
        enhanced.fieldErrors = body.errors as Array<{ field: string; message: string }>;
      }

      return throwError(() => enhanced);
    })
  );
};
