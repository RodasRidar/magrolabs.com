import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../../environments/env';

@Component({
    selector: 'app-footer',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})
export class FooterComponent {
 ENV = environment

 //get current year in format YYYY
  get Year() {
    return new Date().getFullYear();
  }
}
