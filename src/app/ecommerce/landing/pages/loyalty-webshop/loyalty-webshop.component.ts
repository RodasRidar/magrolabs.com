import { Component } from '@angular/core';
import { FooterComponent } from '../../components/footer/footer.component';
import { AppComponent } from "../../../../app.component";
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { environment } from '../../../../../environments/env';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-loyalty-webshop',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, RouterOutlet],
  templateUrl: './loyalty-webshop.component.html',
  styleUrl: './loyalty-webshop.component.css'
})
export class LoyaltyWebshopComponent {

  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment
}
