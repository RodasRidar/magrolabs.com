import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './recuperar-password.component.html',
  styleUrl: './recuperar-password.component.css'
})
export class RecuperarPasswordComponent {

  private _formBuilder = inject(FormBuilder);
  private _cookieService = inject(CookieService);
  isProcessing = false;
  isEmailSent = false;

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
  })

  ngOnInit() {
    const rememberMe = this._cookieService.get('rememberMe');
    const rememberMeEmail = this._cookieService.get('rememberMeEmail');
    if (rememberMe === 'true' && rememberMeEmail) {
      this.form.get('email')?.setValue(rememberMeEmail);
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

  recoverPassword() {
    if (!this.form.valid || this.isProcessing) {
      this.form.markAllAsTouched();
      return;
    }
    this.isProcessing = true;
    this.isEmailSent = true;
    console.log('Recover password');

  }
}
