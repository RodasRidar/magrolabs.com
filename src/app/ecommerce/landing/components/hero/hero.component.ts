import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/env';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
 ENV = environment
}
