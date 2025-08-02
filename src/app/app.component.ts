import { afterNextRender, afterRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '../environments/env';
import { CommonModule } from '@angular/common';
import { CookiesBannerComponent } from './shared/ui/cookies-banner/cookies-banner.component';
import { ModuleRetryService } from './shared/services/module-retry.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CookiesBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private _router = inject(Router);
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
    })
  }

  ngOnInit() {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url.split('/').pop()?.split('?').shift() || '';

        if (currentUrl === 'registro' || currentUrl === 'crear-cuenta' || currentUrl === 'direccion' || currentUrl === 'creatina-monohidratada-100-gr' || currentUrl === 'creatina-monohidratada-250-gr' || currentUrl === 'creatina-monohidratada-3-kg' || currentUrl === 'creatina-monohidratada-250-gr#reviews') {
          this.isButtonVisible = true;
        } else {
          this.isButtonVisible = false;
        }

        // Limpiar contadores de reintentos en navegación exitosa
        this.moduleRetryService.clearRetryCount(event.url);
      }
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
}
