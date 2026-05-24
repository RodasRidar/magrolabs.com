import { Component } from '@angular/core';
import { LogoComponent } from '../../../../shared/ui/logo/logo.component';

@Component({
  selector: 'app-header',
  imports: [LogoComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
