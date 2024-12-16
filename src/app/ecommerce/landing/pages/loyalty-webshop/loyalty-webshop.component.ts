import { Component } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { environment } from '../../../../../environments/env';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-loyalty-webshop',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './loyalty-webshop.component.html',
  styleUrl: './loyalty-webshop.component.css'
})
export class LoyaltyWebshopComponent {

  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment
}
