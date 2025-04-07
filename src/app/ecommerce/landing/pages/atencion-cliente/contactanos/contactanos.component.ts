import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-contactanos',
  standalone: true,
  imports: [],
  templateUrl: './contactanos.component.html',
  styleUrl: './contactanos.component.css'
})
export class ContactanosComponent {
  ENV = environment;
}
