import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../../environments/env';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
 ENV = environment
}
