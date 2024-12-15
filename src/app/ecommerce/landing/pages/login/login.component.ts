import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/env';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  ENV = environment;
}
