import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, HeroComponent],
  templateUrl: './landing.component.html'
})
export class LandingComponent {

}
