import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NavbarComponent, NavbarTypeEnum } from "../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../components/footer/footer.component";
import { environment } from '../../../../../environments/env';

@Component({
  selector: 'app-politicas',
  standalone: true,
  imports: [NavbarComponent, FormsModule, RouterOutlet, FooterComponent, RouterLink, RouterLinkActive],
  templateUrl: './politicas.component.html',
  styleUrl: './politicas.component.css'
})
export class PoliticasComponent {
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
    '/politicas/terminos-y-condiciones',
    '/politicas/condiciones-de-uso',
    '/politicas/privacidad',
    '/politicas/cookies'
  ];
}
