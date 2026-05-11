import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../components/footer/footer.component";
import { environment } from '../../../../../environments/env';
import { SeoService } from '../../../../shared/services/seo.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [NavbarComponent, FormsModule, RouterOutlet, FooterComponent, RouterLink, RouterLinkActive, BreadcrumbComponent],
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.css'
})
export class PoliticasComponent {
  private router = inject(Router);
  private _seo = inject(SeoService);

  selectedOption = 'preguntas-frecuentes';
  ENV = environment;
  navbarTypeEnum = NavbarTypeEnum;

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Políticas' },
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
      case '/politicas/terminos-y-condiciones':
        this.loadTerminosSEO(`${baseURL}${path}`);
        break;
      case '/politicas/condiciones-de-uso':
        this.loadCondicionesSEO(`${baseURL}${path}`);
        break;
      case '/politicas/privacidad':
        this.loadPrivacidadSEO(`${baseURL}${path}`);
        break;
      case '/politicas/cookies':
        this.loadCookiesSEO(`${baseURL}${path}`);
        break;
      default:
        this.loadDefaultSEO(baseURL);
    }
  }

  private loadTerminosSEO(url: string) {
    const title = 'Términos y Condiciones - Magrolabs';
    const description = 'Lee nuestros términos y condiciones de uso del servicio de suscripción de Magrolabs. Información legal importante sobre tu suscripción, cancelaciones y políticas.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAICrawlers(true);
    this._seo.setAIMetadata({
      summary: 'Documento legal que establece los términos y condiciones del servicio de suscripción de Magrolabs, incluyendo derechos, obligaciones y políticas de cancelación',
      contentType: 'legal-document',
      audience: 'clientes actuales y potenciales',
      purpose: 'legal-informativo',
      entityType: 'TermsOfService'
    });

    // Breadcrumbs
    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Políticas', url: 'https://magrolabs.com/politicas' },
      { name: 'Términos y Condiciones', url: url }
    ]);

    // WebPage Schema para documento legal
    const legalSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: url,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Magrolabs',
        url: 'https://magrolabs.com'
      },
      specialty: 'TermsOfService',
      publisher: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: 'https://magrolabs.com'
      },
      datePublished: '2025-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'es-PE'
    };

    this._seo.setStructuredData(legalSchema);
  }

  private loadCondicionesSEO(url: string) {
    const title = 'Condiciones de Uso - Magrolabs';
    const description = 'Condiciones de uso del sitio web y servicios de Magrolabs. Normas de conducta, responsabilidades y uso apropiado de nuestros servicios.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Condiciones específicas de uso del sitio web y plataforma digital de Magrolabs',
      contentType: 'legal-document',
      audience: 'usuarios del sitio web',
      purpose: 'legal-informativo',
      entityType: 'WebPageTerms'
    });

    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Políticas', url: 'https://magrolabs.com/politicas' },
      { name: 'Condiciones de Uso', url: url }
    ]);
  }

  private loadPrivacidadSEO(url: string) {
    const title = 'Política de Privacidad - Magrolabs';
    const description = 'Conoce cómo Magrolabs protege tu información personal. Política de privacidad conforme a la Ley de Protección de Datos Personales del Perú. Transparencia y seguridad garantizadas.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Política de privacidad detallada sobre recopilación, uso, almacenamiento y protección de datos personales de usuarios de Magrolabs, conforme a normativa peruana',
      contentType: 'legal-document',
      audience: 'todos los usuarios',
      purpose: 'legal-transparencia',
      entityType: 'PrivacyPolicy'
    });

    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Políticas', url: 'https://magrolabs.com/politicas' },
      { name: 'Política de Privacidad', url: url }
    ]);

    // PrivacyPolicy Schema
    const privacySchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: url,
      specialty: 'PrivacyPolicy',
      publisher: {
        '@type': 'Organization',
        name: 'Magrolabs',
        url: 'https://magrolabs.com',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Privacy Officer',
          email: this.ENV.emailAtencionClientes,
          availableLanguage: 'Spanish'
        }
      },
      datePublished: '2025-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'es-PE',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Magrolabs'
      }
    };

    this._seo.setStructuredData(privacySchema);
  }

  private loadCookiesSEO(url: string) {
    const title = 'Política de Cookies - Magrolabs';
    const description = 'Información sobre el uso de cookies en Magrolabs. Aprende qué cookies usamos, para qué las utilizamos y cómo puedes controlarlas.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Política detallada sobre el uso de cookies, tipos de cookies utilizadas y opciones de control para usuarios del sitio Magrolabs',
      contentType: 'legal-document',
      audience: 'visitantes del sitio web',
      purpose: 'legal-transparencia',
      entityType: 'CookiePolicy'
    });

    this._seo.setBreadcrumbStructuredData([
      { name: 'Inicio', url: 'https://magrolabs.com' },
      { name: 'Políticas', url: 'https://magrolabs.com/politicas' },
      { name: 'Política de Cookies', url: url }
    ]);

    // Cookie Policy Schema
    const cookieSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description,
      url: url,
      specialty: 'CookiePolicy',
      publisher: {
        '@type': 'Organization',
        name: 'Magrolabs'
      },
      datePublished: '2025-01-01',
      dateModified: new Date().toISOString().split('T')[0],
      inLanguage: 'es-PE',
      about: {
        '@type': 'Thing',
        name: 'Cookies y Tecnologías de Seguimiento',
        description: 'Información sobre cookies esenciales, analíticas y de marketing utilizadas en el sitio'
      }
    };

    this._seo.setStructuredData(cookieSchema);
  }

  private loadDefaultSEO(url: string) {
    const title = 'Políticas Legales - Magrolabs';
    const description = 'Accede a todas nuestras políticas legales: términos y condiciones, privacidad, cookies y condiciones de uso. Transparencia y compromiso legal.';

    this._seo.setTitle(title);
    this._seo.setDescription(description);
    this._seo.setCanonicalURL(url);
    this._seo.setIndexFollow(true);

    this._seo.setAIMetadata({
      summary: 'Portal centralizado con toda la información legal y políticas de Magrolabs',
      contentType: 'legal-hub',
      audience: 'todos los usuarios',
      purpose: 'legal-informativo',
      entityType: 'CollectionPage'
    });
  }

  onSelectOption(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.router.navigate([selectedValue]);
  }

  options: string[] = [
    '/politicas/terminos-y-condiciones',
    '/politicas/condiciones-de-uso',
    '/politicas/privacidad',
    '/politicas/cookies'
  ];
}
