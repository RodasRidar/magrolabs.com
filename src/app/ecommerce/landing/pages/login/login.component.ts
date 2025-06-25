import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../../../../shared/services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../shared/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _cookieService = inject(CookieService);
  private _toastService = inject(ToastService);
  private _authService = inject(AuthService);
  private _destroyRef = inject(DestroyRef);

  ENV = environment;
  isProcessing = false;
  credentialsFailed = false;
  toastTitle = 'Credenciales incorrectas';
  toastMessage = 'Por favor, verifica tu usuario y contraseña.';
  returnUrl = '/cuenta/mi-cuenta'; // URL por defecto

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this._formBuilder.control(false, [Validators.required])
  })

  ngOnInit() {
    // Obtener returnUrl de los query parameters
    const returnUrlParam = this._route.snapshot.queryParams['returnUrl'];
    if (returnUrlParam) {
      this.returnUrl = returnUrlParam;
    }

    const rememberMe = this._cookieService.get('rememberMe');
    const rememberMeEmail = this._cookieService.get('rememberMeEmail');
    if (rememberMe === 'true' && rememberMeEmail) {
      this.form.get('email')?.setValue(rememberMeEmail);
      this.form.get('rememberMe')?.setValue(true);
      this._toastService.onToastClosed()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => {
          this.credentialsFailed = false;
        });
    }
  }

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
  }

  hasValidatorError(field: string) {
    const control = this.form.get(field);
    return control?.invalid && control?.touched;
  }

  login() {
    if (!this.form.valid || this.isProcessing) {
      this.form.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    const { email, password, rememberMe } = this.form.value;

    if (rememberMe) {
      this._cookieService.set('rememberMe', 'true', 365);
      this._cookieService.set('rememberMeEmail', email ?? '', 365);
    } else {
      this._cookieService.delete('rememberMe');
      this._cookieService.delete('rememberMeEmail');
    }

    this._authService.login({ email: email!, password: password! })
      .pipe(
        finalize(() => this.isProcessing = false)
      )
      .subscribe({
        next: () => {
          // Redirigir a la URL especificada en returnUrl
          this._router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.credentialsFailed = true;
          this._toastService.error(this.toastTitle, this.toastMessage);
          console.error('Error en login:', error);
        }
      });
  }
}
