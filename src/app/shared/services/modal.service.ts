import { Injectable, signal, Component, Type } from '@angular/core';

export interface ModalConfig {
  component: Type<any>;
  data?: any;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Señales para controlar el estado del modal
  isOpen = signal(false);
  modalConfig = signal<ModalConfig | null>(null);

  /**
   * Abre un modal con la configuración especificada
   */
  open(config: ModalConfig): void {
    this.modalConfig.set(config);
    this.isOpen.set(true);
    
    // Prevenir scroll del body cuando el modal está abierto
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.isOpen.set(false);
    this.modalConfig.set(null);
    
    // Restaurar scroll del body
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  /**
   * Cierra el modal si closeOnBackdrop está habilitado
   */
  closeOnBackdropClick(event: MouseEvent): void {
    const config = this.modalConfig();
    if (config?.closeOnBackdrop !== false) {
      this.close();
    }
  }
}
