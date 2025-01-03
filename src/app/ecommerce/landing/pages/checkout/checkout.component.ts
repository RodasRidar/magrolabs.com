import { Component } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  navbarTypeEnum = NavbarTypeEnum;
}
