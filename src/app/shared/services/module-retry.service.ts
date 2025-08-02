import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ModuleRetryService {
  private router = inject(Router);
  private retryAttempts = new Map<string, number>();
  private readonly MAX_RETRIES = 3;

  /**
   * Maneja errores de carga de módulos lazy y reintenta la carga
   */
  handleModuleLoadError(error: any, moduleUrl?: string): void {
    console.warn('Error loading module:', error);
    
    // Detectar si es un error de carga de chunk
    if (this.isChunkLoadError(error)) {
      this.handleChunkLoadError(moduleUrl);
    }
  }

  private isChunkLoadError(error: any): boolean {
    return error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Loading CSS chunk') ||
      error.message?.includes('ChunkLoadError')
    );
  }

  private handleChunkLoadError(moduleUrl?: string): void {
    const currentUrl = this.router.url;
    const retryKey = moduleUrl || currentUrl;
    
    const attempts = this.retryAttempts.get(retryKey) || 0;
    
    if (attempts < this.MAX_RETRIES) {
      this.retryAttempts.set(retryKey, attempts + 1);
      
      console.log(`Reintentando carga de módulo (intento ${attempts + 1}/${this.MAX_RETRIES})`);
      
      // Esperar un poco antes de reintentar
      setTimeout(() => {
        window.location.reload();
      }, 1000 * (attempts + 1)); // Backoff progresivo
    } else {
      console.error('Máximo número de reintentos alcanzado');
      this.retryAttempts.delete(retryKey);
      
      // Redirigir a página de inicio como fallback
      this.router.navigateByUrl('/').catch(() => {
        window.location.href = '/';
      });
    }
  }

  /**
   * Limpia los contadores de reintentos para una URL específica
   */
  clearRetryCount(url: string): void {
    this.retryAttempts.delete(url);
  }

  /**
   * Limpia todos los contadores de reintentos
   */
  clearAllRetryCounts(): void {
    this.retryAttempts.clear();
  }
}