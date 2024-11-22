import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,ButtonComponent, RouterLink, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  animations: [
    trigger('fadeInOut', [
      state('inactive', style({
        opacity: 0,
        transform: 'translateY(-100%)'
      })),
      state('active', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('inactive => active', [
        animate('200ms ease-in-out')
      ]),
      transition('active => inactive', [
        animate('200ms ease-in-out')
      ])
    ])
  ]
})


export class NavbarComponent {

  state = 'inactive';

  toggleNavbar(): void {
    this.state = this.state === 'active' ? 'inactive' : 'active';
  }
}
