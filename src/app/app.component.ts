import { afterNextRender, afterRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '../environments/env';
import { CommonModule } from '@angular/common';
import { CookiesBannerComponent } from './shared/ui/cookies-banner/cookies-banner.component';
import { ModuleRetryService } from './shared/services/module-retry.service';
import { TiktokAnalyticsService } from './shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from './shared/services/meta-analytics.service';
import { HotjarService } from './shared/services/hotjar.service';
import { PixelInitializationService } from './shared/services/pixel-initialization.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CookiesBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private _router = inject(Router);
  private _tiktokAnalytics = inject(TiktokAnalyticsService);
  private _metaAnalytics = inject(MetaAnalyticsService);
  private _hotjar = inject(HotjarService);
  private _pixelInitialization = inject(PixelInitializationService);
  private moduleRetryService = inject(ModuleRetryService);
  title = 'Magrolabs';
  ENV = environment;
  isButtonVisible = false;
  wasScroll = signal(false);

  constructor(){
    afterNextRender(() => {
      window.addEventListener('scroll', () => {
        this.wasScroll.set(true);
      });

      // Manejar errores de carga de chunks/módulos
      this.setupChunkErrorHandler();
      
      // Inicializar pixels dinámicamente según el ambiente
      this._pixelInitialization.initializePixels();
    })
  }

  ngOnInit() {
    this._router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const url = e.urlAfterRedirects ?? e.url;

        // Track PageView
        this.trackPageView(url);

        // Limpiar contadores de reintentos en navegación exitosa
        this.moduleRetryService.clearRetryCount(url);
      });
  }

  private setupChunkErrorHandler(): void {
    // Manejar errores de carga de chunks de forma global
    window.addEventListener('error', (event) => {
      if (this.isChunkLoadError(event)) {
        event.preventDefault();
        this.moduleRetryService.handleModuleLoadError(event.error, event.filename);
      }
    });

    // Manejar promesas rechazadas (para dynamic imports)
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isChunkLoadError(event)) {
        event.preventDefault();
        this.moduleRetryService.handleModuleLoadError(event.reason);
      }
    });
  }

  private isChunkLoadError(event: any): boolean {
    const error = event.error || event.reason;
    return error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading CSS chunk') ||
      error.message?.includes('ChunkLoadError') ||
      (event.filename && event.filename.includes('chunk-'))
    );
  }

  private trackPageView(url: string): void {
    // Mapeo de rutas a nombres descriptivos
    const pageMap: { [key: string]: string } = {
      '/': 'Landing Principal',
      '/registro': 'Registro - Planes',
      '/registro/crear-cuenta': 'Registro - Crear Cuenta',
      '/registro/direccion': 'Registro - Dirección',
      '/registro/verificacion': 'Registro - Verificación de Pago',
      '/registro/confirmacion': 'Registro - Confirmación',
      '/login': 'Iniciar Sesión',
      '/productos': 'Productos',
      '/loyalty-webshop': 'Loyalty WebShop',
      '/checkout': 'Checkout',
      '/bolsa': 'Carrito de Compras',
      '/mi-primera-creatina': 'Mi Primera Creatina',
      '/referido-por-amigo': 'Referido por Amigo',
      '/atencion-cliente': 'Atención al Cliente',
      '/politicas': 'Políticas',
      '/cuenta/mi-cuenta': 'Mi Cuenta',
      '/cuenta/pedidos': 'Mis Pedidos',
      '/cuenta/credito': 'Mi Crédito',
      '/cuenta/suscripcion': 'Mi Suscripción',
      '/cuenta/perfil': 'Mi Perfil'
    };

    // Buscar coincidencia exacta o por patrón
    let pageName = pageMap[url];
    
    // Si no encontramos coincidencia exacta, buscar patrones
    if (!pageName) {
      if (url.includes('/productos/creatinas/')) {
        pageName = 'Producto - Creatina';
      } else if (url.includes('/loyalty-webshop/articulos/')) {
        pageName = 'Loyalty WebShop - Artículo';
      } else if (url.includes('/atencion-cliente/')) {
        pageName = 'Atención al Cliente - Subcategoría';
      } else if (url.includes('/politicas/')) {
        pageName = 'Políticas - Subcategoría';
      } else {
        pageName = 'Página Genérica';
      }
    }

    // Enviar tracking a TikTok
    this._tiktokAnalytics.trackViewContent({
      contents: [{
        content_id: url.replace('/', '').replace(/\//g, '-') || 'home',
        content_type: 'product_group',
        content_name: pageName
      }],
      currency: 'PEN'
    });

    // Enviar tracking a Meta
    this._metaAnalytics.trackPageView();
  }
}
