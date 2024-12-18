import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../../signup/components/header/header.component';
import { environment } from '../../../../../environments/env';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './encuesta.component.html'
})
export class EncuestaComponent {
  private router = inject(Router);

  ENV = environment;
  ngOnInit(): void {
    if(!this.ENV.isEncuestaActive) {
      this.router.navigate(['/404']);
    }
  }
}
