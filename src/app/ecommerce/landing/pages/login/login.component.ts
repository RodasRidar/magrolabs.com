import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../../../../shared/services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../shared/services/auth.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { finalize } from 'rxjs/operators';
import { SeoService } from '../../../../shared/services/seo.service';

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
  private _tiktokAnalytics = inject(TiktokAnalyticsService);
  private _metaAnalytics = inject(MetaAnalyticsService);
  private _destroyRef = inject(DestroyRef);
  private _seo = inject(SeoService);

  ENV = environment;
  isProcessing = false;
  credentialsFailed = false;
  toastTitle = signal<string>('Oops! Algo salió mal.');
  toastMessage = signal<string>('');
  returnUrl = '/cuenta/mi-cuenta'; // URL por defecto

  form = this._formBuilder.group({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    rememberMe: this._formBuilder.control(false, [Validators.required])
  })

  ngOnInit() {
    this.loadSEO();
    
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

    this.toastMessage.set('Por favor, verifica tu usuario y contraseña.');
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
        next: (response) => {
          // Identificar usuario logueado
          this._tiktokAnalytics.identify({
            email: response.data.user.email,
            external_id: response.data.user.id,
            phone_number: response.data.user.phone
          });

          // Tracking de Meta para login exitoso
          this._metaAnalytics.trackCustomEvent('Login', {
            content_name: 'User Login Success',
            status: true
          });
          
          // Redirigir a la URL especificada en returnUrl
          this._router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.credentialsFailed = true;
          this.toastMessage.set(error?.error?.error?.message || this.toastMessage());

          this._toastService.error(this.toastTitle(), this.toastMessage());
          console.error('Error en login:', error);
        }
      });
  }
  
  private loadSEO() {
    const title = 'Iniciar Sesión | Magrolabs';
    const description = `Accede a tu cuenta de Magrolabs para gestionar tu suscripción, ver pedidos y disfrutar de beneficios exclusivos. ${environment.campanaPrimeraCreatina.textos.heroOfertaMayuscula} y envío sin costo.`;
    const URL = 'https://magrolabs.com/login';
    const image = 'https://magrolabs.com/image-meta_55.png';
    const keywords = [
      'login magrolabs', 'acceso cuenta creatina', 'iniciar sesión suplementos',
      'cuenta usuario magrolabs', 'acceso suscripción creatina', 'login Peru',
      'mi cuenta magrolabs', 'acceso productos deportivos'
    ];

    // SEO básico optimizado
    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setKeywords(keywords.join(', '));
    this._seo.setCanonicalURL(URL);
    this._seo.setIndexFollow(false); // No indexar página de login por seguridad

    // Open Graph optimizado
    this._seo.setOpenGraph({
      type: 'website',
      site_name: 'Magrolabs',
      title: title,
      description: description,
      image: image,
      url: URL,
      locale: 'es_PE',
      'image:width': '1200',
      'image:height': '628',
      'image:alt': 'Magrolabs - Iniciar Sesión en Cuenta'
    });

    // Twitter Card optimizado
    this._seo.setTwitterCard({
      'twitter:card': 'summary_large_image',
      'twitter:site': '@magrolabs',
      'twitter:creator': '@magrolabs',
      'twitter:url': URL,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
      'twitter:image:alt': 'Magrolabs - Acceso a Cuenta'
    });
  }
}
