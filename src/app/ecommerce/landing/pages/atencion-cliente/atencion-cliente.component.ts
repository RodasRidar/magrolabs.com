import { Component, inject } from '@angular/core';
import { environment } from '../../../../../environments/env';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-atencion-cliente',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterOutlet, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './atencion-cliente.component.html',
  styleUrl: './atencion-cliente.component.css'
})
export class AtencionClienteComponent {
  private router = inject(Router);

  selectedOption = 'preguntas-frecuentes';
  ENV = environment;
  navbarTypeEnum = NavbarTypeEnum;

  ngOnInit() {
    let currentUrl = this.router.url;

    const matchingOption = this.options.find(opt => currentUrl.includes(opt));

    if (matchingOption) {
      this.selectedOption = matchingOption;
    }

        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            currentUrl = this.router.url;
            const matchingOption = this.options.find(opt => currentUrl.includes(opt));
            if (matchingOption) {
              this.selectedOption = matchingOption;
            }
          }
        });
  }
  onSelectOption(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.router.navigate([selectedValue]);
  }

  options: string[] = [
    '/atencion-cliente/preguntas-frecuentes',
    '/atencion-cliente/contactanos',
    '/atencion-cliente/como-funciona',
    '/atencion-cliente/envio-y-entrega',
    '/atencion-cliente/cambio',
    '/atencion-cliente/pausar-cancelar',
    '/atencion-cliente/pago',
    '/atencion-cliente/programa-loyalty',
    '/atencion-cliente/spromociones'
  ];
}
