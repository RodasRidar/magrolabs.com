import { Injectable, signal, inject } from '@angular/core';
import { Summary } from '../models/summary.model';
import { SummaryService } from './summary-service.service';

@Injectable({
  providedIn: 'root'
})
export class VerificationPaymentModalService {
  private _summaryService = inject(SummaryService);
  
  // Señal para controlar si el modal está abierto
  isOpen = signal(false);
  
  // Señal para pasar datos al componente
  summaryData = signal<Summary | null>(null);

  // Callback opcional para ejecutar después de cerrar el modal
  private onCloseCallback?: () => void;

  /**
   * Abre el modal con los datos del summary
   * @param summary - Datos del summary para el proceso de suscripción
   * @param onClose - Callback opcional a ejecutar después de cerrar el modal
   */
  open(summary: Summary, onClose?: () => void): void {
    this.summaryData.set(summary);
    this.isOpen.set(true);
    this.onCloseCallback = onClose;
    
    // Prevenir scroll del body cuando el modal está abierto
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal, limpia el summary service y ejecuta el callback si existe
   */
  close(): void {
    this.isOpen.set(false);
    this.summaryData.set(null);
    
    // Limpiar SOLO el summary (sin afectar cookies de autenticación)
    this._summaryService.clearSummaryOnly();
    
    // Restaurar scroll del body
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    // Ejecutar callback si existe
    if (this.onCloseCallback) {
      this.onCloseCallback();
      this.onCloseCallback = undefined; // Limpiar callback después de ejecutar
    }
  }
}
