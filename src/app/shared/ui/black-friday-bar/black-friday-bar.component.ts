import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-black-friday-bar',
    imports: [CommonModule],
    templateUrl: './black-friday-bar.component.html',
    styles: [`
    @media (max-width: 800px) {
      .bf-marquee-wrapper {
        overflow: hidden;
        position: relative;
        width: 100%;
      }
      
      .bf-marquee-content {
        display: inline-flex;
        animation: bf-marquee 25s linear infinite;
      }
    }

    @keyframes bf-marquee {
      0% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    /* Pausar animación al hacer hover */
    @media (max-width: 800px) {
      .bf-marquee-content:hover {
        animation-play-state: paused;
      }
    }
  `]
})
export class BlackFridayBarComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  
  // Temporizador
  timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };
  private timerInterval: any;
  
  // Estado del Black Friday
  isBlackFridayStarted = false;
  isCountingToStart = true; // Inicializar en true por defecto
  isVisible = true;
  
  // Fechas Black Friday (hora de Perú: UTC-5)
  private readonly BLACK_FRIDAY_START = new Date('2025-11-23T00:00:00-05:00').getTime();
  private readonly BLACK_FRIDAY_END = new Date('2025-11-30T23:59:59-05:00').getTime();
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startBlackFridayCountdown();
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startBlackFridayCountdown(): void {
    const now = Date.now();
    if (now < this.BLACK_FRIDAY_START) {
      // Aún no ha iniciado el Black Friday - contar hacia el inicio
      this.isCountingToStart = true;
      this.isBlackFridayStarted = false;
      this.cdr.markForCheck();
      this.updateBlackFridayTimer();
      this.timerInterval = setInterval(() => this.updateBlackFridayTimer(), 1000);
    } else if (now >= this.BLACK_FRIDAY_START && now < this.BLACK_FRIDAY_END) {
      // Black Friday en curso
      console.log('✅ Modo: Black Friday activo');
      this.isCountingToStart = false;
      this.isBlackFridayStarted = true;
      this.cdr.markForCheck();
      this.updateBlackFridayTimer();
      this.timerInterval = setInterval(() => this.updateBlackFridayTimer(), 1000);
    } else {
      // Black Friday terminado
      console.log('✅ Modo: Black Friday terminado');
      this.isVisible = false;
      this.cdr.markForCheck();
    }
  }

  private updateBlackFridayTimer(): void {
    const now = Date.now();
    let difference: number;

    if (this.isCountingToStart) {
      // Contando hacia el inicio del Black Friday
      difference = this.BLACK_FRIDAY_START - now;
      
      if (difference <= 0) {
        // Black Friday ha iniciado - cambiar estado

        this.isCountingToStart = false;
        this.isBlackFridayStarted = true;
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateBlackFridayTimer(), 1000);
      }
    } else {
      // Contando hasta el fin del Black Friday
      difference = this.BLACK_FRIDAY_END - now;
      
      
      if (difference <= 0) {
        // Black Friday terminado
        this.isVisible = false;
        clearInterval(this.timerInterval);
        return;
      }
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    this.timeLeft = { days, hours, minutes, seconds };

  }
}
