import { Component, inject, PLATFORM_ID, HostListener } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/env';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SummaryComponent, CommonModule],
  templateUrl: './signup.component.html',
})

export class SignupComponent {
  private _router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  currentUrl = '';
  isChoosePlanView = true;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl = window.location.pathname.split('/').pop()?.split('?').shift() || '';
      this.isChoosePlanView = this.currentUrl === 'registro' || this.currentUrl ==='confirmacion'

      this._router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentUrl = event.url.split('/').pop()?.split('?').shift() || '';
          this.isChoosePlanView = this.currentUrl === 'registro' || this.currentUrl ==='confirmacion';
        }
      });
    }

  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Solo mostrar la alerta si no estamos en la página de confirmación
    if (this.currentUrl !== 'confirmacion') {
      $event.preventDefault();
      // En navegadores modernos, el mensaje personalizado puede no mostrarse,
      // pero el navegador mostrará su propio mensaje de confirmación
      $event.returnValue = `¡Espera! Completa tu registro para obtener tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
  }

  goBack() {
    switch (this.currentUrl) {
      case 'crear-cuenta':
        this._router.navigate(['/registro']);
        break;
      case 'direccion':
        this._router.navigate(['/registro/crear-cuenta']);
        break;
      case 'verificacion':
        this._router.navigate(['/registro/direccion']);
        break;
      default:
        this._router.navigate(['']);
        break;
    }
  }
}
