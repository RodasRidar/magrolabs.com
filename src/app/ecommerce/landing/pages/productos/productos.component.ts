import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, RouterOutlet],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent {
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment
}
