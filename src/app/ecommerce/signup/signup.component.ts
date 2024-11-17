import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SummaryComponent],
  templateUrl: './signup.component.html',
})

export class SignupComponent {
  goBack() {
    window.history.back()
  }
}
