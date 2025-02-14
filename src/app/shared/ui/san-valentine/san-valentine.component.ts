import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-sv',
  standalone: true,
  imports: [],
  templateUrl: './san-valentine.component.html'
})
export class SanComponent {
    showMessage = false;

    toggleMessage() {
      this.showMessage = !this.showMessage;
    }
}
