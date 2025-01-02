import { Component, Input, input, output } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  // type = input<'success' | 'error' | 'warning' | 'info'>('success')
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'success';
  @Input() message: string = '';
  @Input() title: string = '';

  // message = input.required<string>()
  // title = input.required<string>()
  onClose = output<boolean>()

  closeToast() {
    this.onClose.emit(true);
  }
}
