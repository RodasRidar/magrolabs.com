import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { StepComponent } from './components/step/step.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet,SummaryComponent,StepComponent],
  templateUrl: './signup.component.html',
})
export class SignupComponent {

}
