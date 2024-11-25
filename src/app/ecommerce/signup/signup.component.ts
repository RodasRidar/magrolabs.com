import { Component, inject, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ActivatedRoute, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { CommonModule, isPlatformBrowser } from '@angular/common';

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
