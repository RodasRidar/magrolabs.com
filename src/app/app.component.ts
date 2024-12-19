import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { environment } from '../environments/env';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private _router = inject(Router);
  title = 'Magrolabs';
  ENV = environment;
  isButtonVisible = false;

  ngOnInit() {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url.split('/').pop()?.split('?').shift() || '';

        if (currentUrl === 'registro' || currentUrl === 'crear-cuenta' || currentUrl === 'direccion' || currentUrl === 'creatina-100g' || currentUrl === 'creatina-250g' || currentUrl === 'creatina-3kg') {
          this.isButtonVisible = true;
        } else {
          this.isButtonVisible = false;
        }
      }
    });

  }
}
