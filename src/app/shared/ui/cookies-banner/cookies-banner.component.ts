import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-cookies-banner',
  standalone: true,
  imports: [],
  templateUrl: './cookies-banner.component.html',
  styleUrl: './cookies-banner.component.css'
})
export class CookiesBannerComponent {
  isCookieClose = false;
}
