import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/env';

declare global {
  interface Window {
    hj: any;
    _hjSettings: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class HotjarService {
  private platformId = inject(PLATFORM_ID);
  private isInitialized = false;

  constructor() {
    // Solo inicializar en producción y en el navegador
    if (isPlatformBrowser(this.platformId) && environment.production) {
      this.initialize();
    }
  }

  /**
   * Inicializa Hotjar
   */
  private initialize(): void {
    if (this.isInitialized) {
      return;
    }

    try {
      // Hotjar Tracking Code
      (function(h: any, o: any, t: any, j: any, a: any, r: any) {
        h.hj = h.hj || function() {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
        h._hjSettings = { hjid: 6549097, hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=', undefined, undefined);

      this.isInitialized = true;
      console.log('✅ Hotjar initialized in production');
    } catch (error) {
      console.error('❌ Error initializing Hotjar:', error);
    }
  }

  /**
   * Trigger manual de evento (opcional)
   */
  trigger(eventName: string): void {
    if (!isPlatformBrowser(this.platformId) || !environment.production) {
      return;
    }

    if (typeof window !== 'undefined' && window.hj) {
      try {
        window.hj('trigger', eventName);
      } catch (error) {
        console.error('Error triggering Hotjar event:', error);
      }
    }
  }

  /**
   * Identificar usuario (opcional)
   */
  identify(userId: string, attributes?: any): void {
    if (!isPlatformBrowser(this.platformId) || !environment.production) {
      return;
    }

    if (typeof window !== 'undefined' && window.hj) {
      try {
        window.hj('identify', userId, attributes);
      } catch (error) {
        console.error('Error identifying user in Hotjar:', error);
      }
    }
  }

  /**
   * Verificar si Hotjar está disponible
   */
  isAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && 
           environment.production && 
           typeof window !== 'undefined' && 
           !!window.hj;
  }
}
