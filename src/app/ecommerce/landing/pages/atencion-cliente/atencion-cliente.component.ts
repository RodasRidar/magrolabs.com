import { Component, inject } from '@angular/core';
import { environment } from '../../../../../environments/env';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../../../shared/services/seo.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui/breadcrumb/breadcrumb.component';

@Component({
    selector: 'app-atencion-cliente',
    imports: [NavbarComponent, FooterComponent, RouterOutlet, FormsModule, RouterLink, RouterLinkActive, BreadcrumbComponent],
    templateUrl: './atencion-cliente.component.html',
    styleUrl: './atencion-cliente.component.css'
})
export class AtencionClienteComponent {
  private router = inject(Router);
  private _seo = inject(SeoService);

  selectedOption = 'preguntas-frecuentes';
  ENV = environment;
  navbarTypeEnum = NavbarTypeEnum;

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Atención al cliente' },
  ];

  ngOnInit() {
    let currentUrl = this.router.url;

    const matchingOption = this.options.find(opt => currentUrl.includes(opt));

    if (matchingOption) {
      this.selectedOption = matchingOption;
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        currentUrl = this.router.url;
        const matchingOption = this.options.find(opt => currentUrl.includes(opt));
        if (matchingOption) {
          this.selectedOption = matchingOption;
          this.updateSEO(matchingOption);
        }
      }
    });

    // Cargar SEO inicial
    this.updateSEO(this.selectedOption);
  }

  private updateSEO(path: string) {
    const baseURL = 'https://magrolabs.com';
    
    switch (path) {
      case '/atencion-cliente/preguntas-frecuentes':
        this.loadFAQSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/contactanos':
        this.loadContactoSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/nosotros':
        this.loadNosotrosSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/como-funciona':
        this.loadComoFuncionaSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/envio-y-entrega':
        this.loadEnvioSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/cambio':
        this.loadCambioSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/pausar-cancelar':
        this.loadPausarCancelarSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/pago':
        this.loadPagoSEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/programa-loyalty':
        this.loadLoyaltySEO(`${baseURL}${path}`);
        break;
      case '/atencion-cliente/spromociones':
        this.loadPromocionesSEO(`${baseURL}${path}`);
        break;
      default:
        this.loadDefaultSEO(baseURL);
    }
  }

  private loadFAQSEO(url: string) {
    const title = 'Preguntas Frecuentes - Centro de Ayuda Magrolabs';
    const description = `Encuentra respuestas sobre tu suscripción, envíos, ${this.ENV.campanaPrimeraCreatina.textos.heroOferta}, programa de lealtad y más. Resuelve tus dudas sobre Magrolabs.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAICrawlers(true);
    this._seo.setAIMetadata({
      summary: 'Centro de ayuda completo con preguntas frecuentes sobre productos, suscripciones, envíos y políticas de Magrolabs',
      contentType: 'faq-support',
      audience: 'clientes actuales y potenciales con dudas',
      purpose: 'soporte-informativo',
      entityType: 'FAQPage'
    });

    // Breadcrumbs
    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Atención al Cliente', url: 'https://magrolabs.com/atencion-cliente' },
      { name: 'Preguntas Frecuentes', url: url }
    ]);

    // FAQ Schema con preguntas comunes
    this._seo.setFAQStructuredData([
      {
        question: '¿Cómo funciona la suscripción de Magrolabs?',
        answer: `Por S/${this.ENV.precioCreatinaSubscription} al mes recibes creatina premium de 250g mensualmente con envío gratis. Puedes pausar o cancelar cuando quieras.`
      },
      {
        question: this.ENV.campanaPrimeraCreatina.textos.faqTituloOferta,
        answer: this.ENV.campanaPrimeraCreatina.textos.faqRespuestaOferta
      },
      {
        question: '¿Cuánto tarda el envío?',
        answer: `Los envíos en Lima Metropolitana llegan entre ${this.ENV.plazoDeEntregaHorasCreatinaFree.min} y ${this.ENV.plazoDeEntregaHorasCreatinaFree.max} horas desde la confirmación del pedido.`
      },
      {
        question: '¿Qué es el programa Magropuntos?',
        answer: `Cada mes acumulas ${this.ENV.creditoRegaloPorCompraMes} Magropuntos automáticamente que puedes canjear por productos exclusivos sin costo adicional.`
      },
      {
        question: '¿Puedo cancelar mi suscripción?',
        answer: `Sí, puedes cancelar en cualquier momento desde tu cuenta. Tienes ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días de período de reflexión después de tu primera entrega.`
      }
    ]);
  }

  private loadContactoSEO(url: string) {
    const title = 'Contáctanos - Atención al Cliente Magrolabs';
    const description = `¿Necesitas ayuda? Contáctanos por WhatsApp al +${this.ENV.telefonoAtencionClientes} o email a ${this.ENV.emailAtencionClientes}. Estamos aquí para ayudarte.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Información de contacto directo con el equipo de atención al cliente de Magrolabs',
      contentType: 'contact-page',
      audience: 'clientes que necesitan soporte personalizado',
      purpose: 'soporte-comunicación',
      entityType: 'ContactPage'
    });

    // ContactPoint Schema
    const contactSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contacto Magrolabs',
      description: description,
      mainEntity: {
        '@type': 'Organization',
        name: 'Magrolabs',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: `+${this.ENV.telefonoAtencionClientes}`,
            contactType: 'customer service',
            availableLanguage: 'Spanish',
            areaServed: 'PE',
            contactOption: 'TollFree'
          },
          {
            '@type': 'ContactPoint',
            email: this.ENV.emailAtencionClientes,
            contactType: 'customer service',
            availableLanguage: 'Spanish'
          }
        ]
      }
    };

    this._seo.setStructuredData(contactSchema);
  }

  private loadNosotrosSEO(url: string) {
    const title = 'Sobre Magrolabs - Nuestra Historia y Misión';
    const description = 'Magrolabs nace para democratizar el acceso a suplementos deportivos de calidad premium en Perú. Conoce nuestra historia, valores y compromiso con tu salud.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Historia, misión y valores de Magrolabs como empresa líder en suplementos deportivos premium en Perú',
      contentType: 'about-company',
      audience: 'personas interesadas en conocer la marca',
      purpose: 'informativo-branding',
      entityType: 'AboutPage'
    });

    this._seo.setOrganizationStructuredData({
      name: 'Magrolabs',
      url: 'https://magrolabs.com',
      logo: 'https://magrolabs.com/favicon.png',
      description: description,
      contactPoint: {
        telephone: `+${this.ENV.telefonoAtencionClientes}`,
        contactType: 'customer service'
      },
      sameAs: [
        'https://www.facebook.com/magrolabs',
        'https://www.instagram.com/magrolabs',
        'https://twitter.com/magrolabs',
        'https://www.tiktok.com/@magrolabs'
      ]
    });
  }

  private loadComoFuncionaSEO(url: string) {
    const title = '¿Cómo Funciona? - Guía Completa de Suscripción Magrolabs';
    const description = `Descubre cómo funciona nuestra suscripción: ${this.ENV.campanaPrimeraCreatina.textos.heroOferta}, envíos automáticos mensuales, y beneficios exclusivos de lealtad.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Explicación detallada del modelo de suscripción de Magrolabs, beneficios, entregas y programa de lealtad',
      contentType: 'how-it-works-guide',
      audience: 'nuevos usuarios considerando suscribirse',
      purpose: 'educativo-conversión',
      entityType: 'HowTo'
    });

    // HowTo Schema
    const howToSchema = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'Cómo funciona la suscripción de Magrolabs',
      description: description,
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Regístrate',
          text: `Crea tu cuenta y obtén tu ${this.ENV.campanaPrimeraCreatina.textos.heroOferta}`
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Recibe tu creatina',
          text: `Tu primera entrega llega en ${this.ENV.plazoDeEntregaHorasCreatinaFree.min}-${this.ENV.plazoDeEntregaHorasCreatinaFree.max} horas gratis`
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Disfruta los beneficios',
          text: `Recibe ${this.ENV.creditoRegaloPorCompraMes} Magropuntos cada mes y envíos automáticos mensuales`
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Gestiona tu suscripción',
          text: 'Pausa, modifica o cancela en cualquier momento desde tu cuenta'
        }
      ]
    };

    this._seo.setStructuredData(howToSchema);
  }

  private loadEnvioSEO(url: string) {
    const title = 'Envío y Entrega - Información de Envíos Magrolabs';
    const description = `Envío gratis en Lima Metropolitana. Entrega en ${this.ENV.plazoDeEntregaHorasCreatinaFree.min}-${this.ENV.plazoDeEntregaHorasCreatinaFree.max} horas. Conoce nuestras zonas de cobertura y tiempos de entrega.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Información detallada sobre políticas de envío, tiempos de entrega y cobertura geográfica de Magrolabs',
      contentType: 'shipping-policy',
      audience: 'clientes interesados en detalles de entrega',
      purpose: 'informativo-logístico',
      entityType: 'ShippingPolicy'
    });
  }

  private loadCambioSEO(url: string) {
    const title = 'Política de Cambios y Devoluciones - Magrolabs';
    const description = 'Conoce nuestra política de cambios y devoluciones. Tu satisfacción es nuestra prioridad. Proceso simple y rápido.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Política de cambios, devoluciones y garantías para productos Magrolabs',
      contentType: 'return-policy',
      audience: 'clientes con dudas sobre cambios',
      purpose: 'informativo-legal',
      entityType: 'ReturnPolicy'
    });
  }

  private loadPausarCancelarSEO(url: string) {
    const title = 'Pausar o Cancelar Suscripción - Magrolabs';
    const description = `Gestiona tu suscripción fácilmente. Pausa, reactiva o cancela cuando quieras. Período de reflexión de ${this.ENV.diasNormalesDePruebaOperiodoDeReflexion} días garantizado.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Guía para pausar, modificar o cancelar la suscripción de Magrolabs sin complicaciones',
      contentType: 'subscription-management-guide',
      audience: 'suscriptores actuales',
      purpose: 'soporte-gestión',
      entityType: 'HelpArticle'
    });
  }

  private loadPagoSEO(url: string) {
    const title = 'Métodos de Pago - Información de Pagos Magrolabs';
    const description = 'Conoce nuestros métodos de pago seguros. Pagos automáticos, facturación transparente y sin cargos ocultos.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Información sobre métodos de pago aceptados, facturación y seguridad en transacciones',
      contentType: 'payment-information',
      audience: 'usuarios con dudas sobre pagos',
      purpose: 'informativo-comercial',
      entityType: 'PaymentPolicy'
    });
  }

  private loadLoyaltySEO(url: string) {
    const title = 'Programa Magropuntos - Programa de Lealtad Magrolabs';
    const description = `Acumula ${this.ENV.creditoRegaloPorCompraMes} Magropuntos cada mes automáticamente. Canjea por productos exclusivos sin costo adicional. ¡Mientras más tiempo estés, más beneficios!`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Programa de lealtad Magropuntos: acumulación automática, niveles de membresía y recompensas exclusivas',
      contentType: 'loyalty-program',
      audience: 'suscriptores actuales y potenciales',
      purpose: 'informativo-engagement',
      entityType: 'LoyaltyProgram'
    });

    // LoyaltyProgram Schema
    const loyaltySchema = {
      '@context': 'https://schema.org',
      '@type': 'LoyaltyProgram',
      name: 'Magropuntos',
      description: description,
      programBenefits: `${this.ENV.creditoRegaloPorCompraMes} puntos mensuales automáticos, productos exclusivos, envío gratis prioritario`,
      provider: {
        '@type': 'Organization',
        name: 'Magrolabs'
      }
    };

    this._seo.setStructuredData(loyaltySchema);
  }

  private loadPromocionesSEO(url: string) {
    const title = 'Promociones Especiales - Ofertas Magrolabs';
    const description = `${this.ENV.campanaPrimeraCreatina.textos.heroOfertaMayuscula} disponible. Conoce nuestras promociones activas y beneficios exclusivos para suscriptores.`;

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Promociones activas, ofertas especiales y descuentos exclusivos para suscriptores de Magrolabs',
      contentType: 'promotions-page',
      audience: 'usuarios buscando ofertas',
      purpose: 'comercial-conversión',
      entityType: 'OfferCatalog'
    });
  }

  private loadDefaultSEO(url: string) {
    const title = 'Centro de Ayuda - Atención al Cliente Magrolabs';
    const description = 'Centro completo de ayuda y soporte. Encuentra respuestas sobre productos, suscripciones, envíos, pagos y más.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Portal de ayuda centralizado con recursos de soporte para clientes de Magrolabs',
      contentType: 'help-center',
      audience: 'todos los usuarios',
      purpose: 'soporte-general',
      entityType: 'HelpCenter'
    });
  }

  onSelectOption(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.router.navigate([selectedValue]);
  }

  options: string[] = [
    '/atencion-cliente/preguntas-frecuentes',
    '/atencion-cliente/contactanos',
    '/atencion-cliente/nosotros',
    '/atencion-cliente/como-funciona',
    '/atencion-cliente/envio-y-entrega',
    '/atencion-cliente/cambio',
    '/atencion-cliente/pausar-cancelar',
    '/atencion-cliente/pago',
    '/atencion-cliente/programa-loyalty',
    '/atencion-cliente/spromociones'
  ];
}
