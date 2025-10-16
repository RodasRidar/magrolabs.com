import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-urgency-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './urgency-bar.component.html',
  styles: [`
    @media (max-width: 800px) {
      .urgency-wrapper {
        overflow: hidden;
        position: relative;
        width: 100%;
      }
      
      .urgency-content {
        display: inline-flex;
        animation: marquee 20s linear infinite;
      }
    }

    @keyframes marquee {
      0% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    /* Pausar animación al hacer hover */
    @media (max-width: 800px) {
      .urgency-content:hover {
        animation-play-state: paused;
      }
    }
  `]
})
export class UrgencyBarComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  // Temporizador
  timeLeft = {
    hours: 48,
    minutes: 0,
    seconds: 2
  };
  private timerInterval: any;
  
  // Estado de la oferta
  isLastChance = false;
  unitsAvailable = 10;
  isVisible = true;
  
  ngOnInit(): void {
    // Solo iniciar el temporizador si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadUnitsFromStorage();
      this.loadVisibilityFromStorage();
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startCountdown(): void {
    // Verificar si ya existe un tiempo guardado en localStorage
    const savedEndTime = localStorage.getItem('offerEndTime');
    const isLastChanceStored = localStorage.getItem('isLastChance');
    
    let endTime: number;

    if (isLastChanceStored === 'true') {
      this.isLastChance = true;
    }

    if (savedEndTime) {
      endTime = parseInt(savedEndTime, 10);
    } else {
      // Si no existe, crear uno nuevo (48 horas desde ahora)
      endTime = Date.now() + (48 * 60 * 60 * 1000);
      localStorage.setItem('offerEndTime', endTime.toString());
      localStorage.setItem('isLastChance', 'false');
    }

    this.updateTimer(endTime);

    this.timerInterval = setInterval(() => {
      this.updateTimer(endTime);
    }, 1000);
  }

  private updateTimer(endTime: number): void {
    const now = Date.now();
    const difference = endTime - now;

    if (difference <= 0) {
      // Cuando el tiempo termine, cambiar a "última oportunidad" y reiniciar desde 12 horas
      if (!this.isLastChance) {
        this.isLastChance = true;
        this.unitsAvailable = 3;
        localStorage.setItem('unitsAvailable', '3');
        const newEndTime = Date.now() + (12 * 60 * 60 * 1000); // 12 horas
        localStorage.setItem('offerEndTime', newEndTime.toString());
        localStorage.setItem('isLastChance', 'true');
        
        // Reiniciar el intervalo con el nuevo endTime
        this.restartInterval(newEndTime);
      } else {
        // Si ya es última oportunidad y se acabó, ocultar la barra
        this.isVisible = false;
        localStorage.setItem('urgencyBarVisible', 'false');
        
        // Detener el intervalo
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
        }
        
        console.log('🚫 Barra de urgencia oculta - Oferta finalizada');
      }
      return;
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    this.timeLeft = { hours, minutes, seconds };
  }

  /**
   * Reinicia el intervalo del temporizador con un nuevo endTime
   */
  private restartInterval(endTime: number): void {
    // Detener el intervalo actual
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Actualizar el timer inmediatamente
    this.updateTimer(endTime);
    
    // Crear nuevo intervalo
    this.timerInterval = setInterval(() => {
      this.updateTimer(endTime);
    }, 1000);
  }

  getOfferText(): string {
    return this.isLastChance 
      ? `Última oportunidad. Solo quedan ${this.unitsAvailable} unidades gratis.`
      : `Oferta por tiempo limitado. Solo quedan ${this.unitsAvailable} unidades gratis.`;
  }

  getUnitsLeft(): number {
    return this.unitsAvailable;
  }

  /**
   * Carga las unidades disponibles desde localStorage
   */
  private loadUnitsFromStorage(): void {
    const savedUnits = localStorage.getItem('unitsAvailable');
    const isLastChance = localStorage.getItem('isLastChance') === 'true';
    
    if (savedUnits !== null) {
      this.unitsAvailable = parseInt(savedUnits, 10);
    } else {
      // Inicializar con 10 unidades si no existe
      this.unitsAvailable = 10;
      localStorage.setItem('unitsAvailable', '10');
    }

    // Ajustar según el estado de última oportunidad
    if (isLastChance && this.unitsAvailable > 3) {
      this.unitsAvailable = 3;
      localStorage.setItem('unitsAvailable', '3');
    }
  }

  /**
   * Carga la visibilidad de la barra desde localStorage
   */
  private loadVisibilityFromStorage(): void {
    const savedVisibility = localStorage.getItem('urgencyBarVisible');
    
    if (savedVisibility !== null) {
      this.isVisible = savedVisibility === 'true';
    } else {
      // Por defecto es visible
      this.isVisible = true;
      localStorage.setItem('urgencyBarVisible', 'true');
    }
  }

  /**
   * Método público para decrementar unidades (llamado desde otros componentes)
   */
  static decrementUnits(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentUnits = parseInt(localStorage.getItem('unitsAvailable') || '10', 10);
      const newUnits = Math.max(0, currentUnits - 1);
      localStorage.setItem('unitsAvailable', newUnits.toString());
    }
  }

  /**
   * Método público para reiniciar las unidades
   */
  static resetUnits(units: number = 10): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('unitsAvailable', units.toString());
    }
  }

  /**
   * Método para desarrollo: establece el contador a 4 segundos del final
   */
  setCountdownToFourSeconds(): void {
    if (isPlatformBrowser(this.platformId)) {
      const newEndTime = Date.now() + (4 * 1000); // 4 segundos
      localStorage.setItem('offerEndTime', newEndTime.toString());
      
      // Reiniciar el intervalo con el nuevo endTime
      this.restartInterval(newEndTime);
      
      console.log('⏰ Contador establecido a 4 segundos del final');
    }
  }
}
