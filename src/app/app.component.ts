import { afterNextRender, afterRender, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '../environments/env';
import { CommonModule } from '@angular/common';
import { CookiesBannerComponent } from './shared/ui/cookies-banner/cookies-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CookiesBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private _router = inject(Router);
  title = 'Magrolabs';
  ENV = environment;
  isButtonVisible = false;
  wasScroll = signal(false);

  constructor(){
    afterNextRender(() => {
      window.addEventListener('scroll', () => {
        this.wasScroll.set(true);
      });
    })
  }

  ngOnInit() {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url.split('/').pop()?.split('?').shift() || '';

        if (currentUrl === 'registro' || currentUrl === 'crear-cuenta' || currentUrl === 'direccion' || currentUrl === 'creatina-monohidratada-100-gr' || currentUrl === 'creatina-monohidratada-250-gr' || currentUrl === 'creatina-monohidratada-3-kg' || currentUrl === 'creatina-monohidratada-250-gr#reviews') {
          this.isButtonVisible = true;
        } else {
          this.isButtonVisible = false;
        }
      }
    });
  }
}
