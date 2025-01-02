import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../../../../shared/services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _cookieService = inject(CookieService);
  private _toastService = inject(ToastService);
  ENV = environment;
  isProcessing = false;
  credentialsFailed = false;
  toastTitle = 'Credenciales incorrectas';
  toastMessage = 'Por favor, verifica tu usuario y contraseña.';

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this._formBuilder.control(false, [Validators.required])
  })

  ngOnInit() {
    const rememberMe = this._cookieService.get('rememberMe');
    const rememberMeEmail = this._cookieService.get('rememberMeEmail');
    if (rememberMe === 'true' && rememberMeEmail) {
      this.form.get('email')?.setValue(rememberMeEmail);
      this.form.get('rememberMe')?.setValue(true);
      this._toastService.onToastClosed().pipe(
        takeUntilDestroyed(),
      ).subscribe(() => {
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
    const rememberMe = this.form.get('rememberMe')?.value;
    if (rememberMe) {
      this._cookieService.set('rememberMe', 'true', 365);
      const email = this.form.get('email')?.value;
      this._cookieService.set('rememberMeEmail', email ?? '', 365);
    } else {
      this._cookieService.delete('rememberMe');
      this._cookieService.delete('rememberMeEmail');
    }
    // setInterval(() => {
    //   this.credentialsFailed = true;
    //   // this._router.navigate(['/account']);
    // }, 2000);
    this._toastService.error(this.toastTitle, this.toastMessage);
    this.credentialsFailed = true;
    this.isProcessing = false;
  }
}
