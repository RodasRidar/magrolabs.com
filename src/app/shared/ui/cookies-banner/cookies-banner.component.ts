import { afterEveryRender, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-cookies-banner',
    imports: [],
    templateUrl: './cookies-banner.component.html',
    styleUrl: './cookies-banner.component.css'
})
export class CookiesBannerComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  
  isCookieClose = true;
  private interactionTimeout?: number;
  private hasInteracted = false;
  
  constructor() {
    afterEveryRender(() => {
      this.isCookieClose = localStorage.getItem('cookieBannerReaded') === 'true' ? true : false;
      this.cdr.detectChanges();
      
      // Solo agregar listeners si el banner no está cerrado
      if (!this.isCookieClose) {
        this.setupInteractionListeners();
      }
    })
  }

  private setupInteractionListeners() {
    const handleInteraction = () => {
      if (this.hasInteracted) return;
      
      this.hasInteracted = true;
      
      // Esperar 3 segundos después de la primera interacción
      this.interactionTimeout = window.setTimeout(() => {
        this.closeCookieBanner();
      }, 3000);
    };

    // Escuchar eventos de scroll y click
    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
  }

  closeCookieBanner() {
    this.isCookieClose = true;
    localStorage.setItem('cookieBannerReaded', 'true');
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Limpiar el timeout si el componente se destruye
    if (this.interactionTimeout) {
      clearTimeout(this.interactionTimeout);
    }
  }
}
