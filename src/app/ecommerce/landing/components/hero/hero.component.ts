import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { LinkButtonComponent } from '../../../../shared/ui/link-button/link-button.component';

@Component({
    selector: 'app-hero',
    imports: [RouterLink, LinkButtonComponent],
    templateUrl: './hero.component.html'
})
export class HeroComponent {
 ENV = environment
}
