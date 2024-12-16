import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../../../environments/env';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, NgOptimizedImage],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent {
  ENV = environment

}
