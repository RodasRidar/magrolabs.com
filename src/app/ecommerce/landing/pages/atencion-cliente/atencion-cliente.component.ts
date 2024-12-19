import { Component } from '@angular/core';
import { environment } from '../../../../../environments/env';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-atencion-cliente',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './atencion-cliente.component.html',
  styleUrl: './atencion-cliente.component.css'
})
export class AtencionClienteComponent {

  ENV = environment;
  navbarTypeEnum = NavbarTypeEnum;
}
