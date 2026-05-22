import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../../../shared/services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { AlertComponent } from '../../../../shared/ui/alert/alert.component';

@Component({
    selector: 'app-recuperar-password',
    imports: [ButtonComponent, ReactiveFormsModule, CommonModule, RouterLink, CardComponent, AlertComponent],
    templateUrl: './recuperar-password.component.html',
    styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent implements OnInit {

  private _formBuilder = inject(FormBuilder);
  private _cookieService = inject(CookieService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  isProcessing = false;
  isEmailSent = false;
  isResetPasswordMode = false;
  isPasswordReset = false;
  errorMessage = '';
  token = '';

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
  });

  resetPasswordForm = this._formBuilder.group({
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this._formBuilder.control('', [Validators.required])
  });

  ngOnInit() {
    // Verificar si hay un token en la URL
    this._route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.token = params['token'];
      
      if (this.token) {
        this.isResetPasswordMode = true;
      } else {
        // Modo de solicitud de recuperación
        const rememberMe = this._cookieService.get('rememberMe');
        const rememberMeEmail = this._cookieService.get('rememberMeEmail');
        if (rememberMe === 'true' && rememberMeEmail) {
          this.form.get('email')?.setValue(rememberMeEmail);
        }
      }
    });
  }

  hasRequiredError(field: string, formGroup: 'resetPassword' | 'requestReset' = 'requestReset') {
    const control = formGroup === 'requestReset' 
      ? this.form.get(field) 
      : this.resetPasswordForm.get(field);
    
    return control?.hasError('required') && control.touched;
  }

  hasValidatorError(field: string, formGroup: 'resetPassword' | 'requestReset' = 'requestReset') {
    const control = formGroup === 'requestReset' 
      ? this.form.get(field) 
      : this.resetPasswordForm.get(field);
    
    return control?.invalid && control?.touched;
  }

  hasMinLengthError(field: string) {
    const control = this.resetPasswordForm.get(field);
    return control?.hasError('minlength') && control.touched;
  }

  passwordsMatch(): boolean {
    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  recoverPassword() {
    if (!this.form.valid || this.isProcessing) {
      this.form.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    
    const email = this.form.get('email')?.value;
    
    if (!email) {
      this.isProcessing = false;
      return;
    }

    this._authService.requestPasswordRecovery(email)
      .pipe(
        catchError(error => {
          // Incluso si hay un error, no mostramos mensaje específico por seguridad
          console.error('Error al solicitar recuperación de contraseña:', error);
          return of({ success: true }); // Simulamos éxito por razones de seguridad
        }),
        finalize(() => {
          this.isProcessing = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          // Siempre mostramos el mensaje de éxito, incluso si el correo no existe
          // por razones de seguridad para evitar enumeración de usuarios
          this.isEmailSent = true;
        }
      });
  }

  resetPassword() {
    if (!this.resetPasswordForm.valid || this.isProcessing) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.passwordsMatch()) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    
    const newPassword = this.resetPasswordForm.get('password')?.value || '';
    
    this._authService.resetPassword(this.token, newPassword)
      .pipe(
        catchError(error => {
          if (error.status === 400) {
            this.errorMessage = 'El token es inválido o ha expirado';
          } else {
            this.errorMessage = 'Ocurrió un error al restablecer la contraseña';
          }
          return of(null);
        }),
        finalize(() => {
          this.isProcessing = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response) {
            this.isPasswordReset = true;
          }
        }
      });
  }
}
