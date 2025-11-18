import { Component, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/env';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SummaryComponent, CommonModule],
  templateUrl: './signup.component.html',
})

export class SignupComponent {
  private _router = inject(Router);
  private _seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  currentUrl = '';
  isChoosePlanView = true;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl = window.location.pathname.split('/').pop()?.split('?').shift() || '';
      this.isChoosePlanView = this.currentUrl === 'registro' || this.currentUrl ==='confirmacion'

      this._router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url.split('/').pop()?.split('?').shift() || '';
          this.isChoosePlanView = this.currentUrl === 'registro' || this.currentUrl ==='confirmacion';
          this.updateSEO(); // Actualizar SEO en cada cambio de ruta
        }
      });

      this.updateSEO(); // Cargar SEO inicial
    }
  }

  private updateSEO() {
    const baseURL = 'https://magrolabs.com/registro';
    
    switch (this.currentUrl) {
      case 'registro':
        this.loadRegistroSEO(baseURL);
        break;
      case 'crear-cuenta':
        this.loadCrearCuentaSEO(`${baseURL}/crear-cuenta`);
        break;
      case 'direccion':
        this.loadDireccionSEO(`${baseURL}/direccion`);
        break;
      case 'verificacion':
        this.loadVerificacionSEO(`${baseURL}/verificacion`);
        break;
      case 'confirmacion':
        this.loadConfirmacionSEO(`${baseURL}/confirmacion`);
        break;
      default:
        this.loadRegistroSEO(baseURL);
    }
  }

  private loadRegistroSEO(url: string) {
    const title = `${environment.campanaPrimeraCreatina.textos.heroOfertaMayuscula} - Regístrate en Magrolabs`;
    const description = environment.campanaPrimeraCreatina.tipo === 'gratis'
      ? `¡Únete ahora y obtén tu primera creatina GRATIS! Solo S/${environment.precioCreatinaSubscription}/mes después. Suscripción flexible con ${environment.diasNormalesDePruebaOperiodoDeReflexion} días de prueba y envío gratis.`
      : `¡Únete ahora por solo S/${environment.campanaPrimeraCreatina.precio}! Luego S/${environment.precioCreatinaSubscription}/mes. Suscripción flexible con ${environment.diasNormalesDePruebaOperiodoDeReflexion} días de prueba.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(false); // No indexar páginas de registro

    this._seo.setAICrawlers(true);
    this._seo.setAIMetadata({
      summary: `Proceso de registro para obtener ${environment.campanaPrimeraCreatina.textos.heroOferta} de Magrolabs. Incluye período de prueba de ${environment.diasNormalesDePruebaOperiodoDeReflexion} días y beneficios de lealtad.`,
      contentType: 'registration-flow',
      audience: 'nuevos clientes interesados en suplementos deportivos',
      purpose: 'conversión-comercial',
      entityType: 'ServiceRegistration'
    });

    // Schema para el proceso de registro
    const serviceSchema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Suscripción Magrolabs Premium',
      description: description,
      provider: {
        '@type': 'Organization',
        name: 'Magrolabs'
      },
      offers: {
        '@type': 'Offer',
        price: environment.precioCreatinaSubscription.toString(),
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock'
      },
      termsOfService: 'https://magrolabs.com/politicas/terminos-y-condiciones'
    };

    this._seo.setStructuredData(serviceSchema);
  }

  private loadCrearCuentaSEO(url: string) {
    const title = 'Crear Cuenta - Paso 1 de 3 | Magrolabs';
    const description = 'Crea tu cuenta en Magrolabs para comenzar tu suscripción premium de creatina con beneficios exclusivos.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(false);

    this._seo.setAIMetadata({
      summary: 'Formulario de creación de cuenta para suscripción Magrolabs',
      contentType: 'registration-form',
      audience: 'nuevo usuario',
      purpose: 'conversión',
      entityType: 'WebForm'
    });
  }

  private loadDireccionSEO(url: string) {
    const title = 'Dirección de Envío - Paso 2 de 3 | Magrolabs';
    const description = 'Ingresa tu dirección para recibir tu creatina con envío gratis en Lima Metropolitana.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(false);

    this._seo.setAIMetadata({
      summary: 'Formulario de dirección de envío para pedidos Magrolabs en Lima',
      contentType: 'shipping-form',
      audience: 'cliente en proceso de registro',
      purpose: 'completar-orden',
      entityType: 'WebForm'
    });
  }

  private loadVerificacionSEO(url: string) {
    const title = 'Verificación - Paso 3 de 3 | Magrolabs';
    const description = 'Verifica tu información y confirma tu suscripción premium de Magrolabs.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(false);

    this._seo.setAIMetadata({
      summary: 'Página de verificación final antes de confirmar suscripción',
      contentType: 'verification-form',
      audience: 'cliente finalizando registro',
      purpose: 'confirmación',
      entityType: 'WebForm'
    });
  }

  private loadConfirmacionSEO(url: string) {
    const title = '¡Registro Exitoso! - Magrolabs';
    const description = `¡Felicidades! Tu ${environment.campanaPrimeraCreatina.textos.heroOferta} está en camino. Recibirás tu pedido en ${environment.plazoDeEntregaHorasCreatinaFree.min}-${environment.plazoDeEntregaHorasCreatinaFree.max} horas.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(false);

    this._seo.setAIMetadata({
      summary: 'Confirmación exitosa de registro y primer pedido en Magrolabs',
      contentType: 'confirmation-page',
      audience: 'nuevo cliente confirmado',
      purpose: 'confirmación-éxito',
      entityType: 'ConfirmationPage'
    });

    // Schema de Order para confirmación
    const orderSchema = {
      '@context': 'https://schema.org',
      '@type': 'Order',
      orderStatus: 'https://schema.org/OrderProcessing',
      seller: {
        '@type': 'Organization',
        name: 'Magrolabs'
      },
      orderedItem: {
        '@type': 'Product',
        name: 'Creatina Monohidrato Premium 250g'
      },
      orderDelivery: {
        '@type': 'ParcelDelivery',
        expectedArrivalFrom: new Date(Date.now() + environment.plazoDeEntregaHorasCreatinaFree.min * 60 * 60 * 1000).toISOString(),
        expectedArrivalUntil: new Date(Date.now() + environment.plazoDeEntregaHorasCreatinaFree.max * 60 * 60 * 1000).toISOString()
      }
    };

    this._seo.setStructuredData(orderSchema);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Solo mostrar la alerta si no estamos en la página de confirmación
    if (this.currentUrl !== 'confirmacion') {
      $event.preventDefault();
      // En navegadores modernos, el mensaje personalizado puede no mostrarse,
      // pero el navegador mostrará su propio mensaje de confirmación
      $event.returnValue = `¡Espera! Completa tu registro para obtener tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
  }

  goBack() {
    switch (this.currentUrl) {
      case 'crear-cuenta':
        this._router.navigate(['/registro']);
        break;
      case 'direccion':
        this._router.navigate(['/registro/crear-cuenta']);
        break;
      case 'verificacion':
        this._router.navigate(['/registro/direccion']);
        break;
      default:
        this._router.navigate(['']);
        break;
    }
  }
}
