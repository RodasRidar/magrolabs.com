import { Injectable, signal, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export interface MonthlyRewardData {
  points: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyRewardModalService {
  // Señal para controlar si el modal está abierto
  isOpen = signal(false);
  
  // Señal para los datos de la recompensa
  rewardData = signal<MonthlyRewardData | null>(null);
  private _cookieService = inject(CookieService);
  private cookieName = 'monthlyRewardShown';

  /**
   * Abre el modal con los datos de la recompensa mensual
   * @param data - Datos de la recompensa (puntos y fecha)
   */
  open(data: MonthlyRewardData): void {
    this.rewardData.set(data);
    this.isOpen.set(true);
    // Marcar como mostrado en cookie de 24 horas para que el usuario solo lo vea 1 vez
    try {
      const expire = new Date();
      expire.setHours(expire.getHours() + 24);
      this._cookieService.set(this.cookieName, '1', { expires: expire, path: '/' });
    } catch (e) {
      // Si por alguna razón la librería de cookies no está disponible, fallback a localStorage
      try { localStorage.setItem(this.cookieName, new Date().toISOString()); } catch {}
    }

    // Prevenir scroll del body cuando el modal está abierto
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal y marca la recompensa como vista
   */
  close(): void {
    this.isOpen.set(false);
    this.rewardData.set(null);

    // Restaurar scroll del body
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  /**
   * Verifica si ya se mostró la recompensa hoy
   */
  wasShownToday(): boolean {
    // Prefer cookie check (24h flag)
    try {
      if (this._cookieService.check(this.cookieName)) {
        return true;
      }
    } catch (e) {
      // ignore and fallback
    }

    // Fallback: localStorage value (older approach)
    try {
      const last = localStorage.getItem(this.cookieName);
      if (!last) return false;
      const lastDate = new Date(last);
      const now = new Date();
      // If stored time is within last 24 hours, consider shown
      return (now.getTime() - lastDate.getTime()) < (24 * 60 * 60 * 1000);
    } catch (e) {
      return false;
    }
  }
}
