import { afterRender, Component } from '@angular/core';

@Component({
  selector: 'app-cookies-banner',
  standalone: true,
  imports: [],
  templateUrl: './cookies-banner.component.html',
  styleUrl: './cookies-banner.component.css'
})
export class CookiesBannerComponent {
  isCookieClose = true;
  constructor() {
    afterRender(() => {
      this.isCookieClose = localStorage.getItem('cookieBannerReaded') === 'true' ? true : false;
    })
  }

  closeCookieBanner() {
    this.isCookieClose = true
    localStorage.setItem('cookieBannerReaded', 'true');
  }
}
