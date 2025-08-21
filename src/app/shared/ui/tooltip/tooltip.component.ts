import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getPositionClasses()">
      {{ text }}
      <div [class]="getArrowClasses()"></div>
    </div>
  `,
  styles: [`
    /* Estilos adicionales para el tooltip si son necesarios */
    .tooltip-enter {
      opacity: 0;
      transform: scale(0.95);
    }

    .tooltip-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
    }

    .tooltip-leave {
      opacity: 1;
      transform: scale(1);
    }

    .tooltip-leave-active {
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
    }
  `]
})
export class TooltipComponent {
  /**
   * Texto que se mostrará en el tooltip
   */
  @Input() text: string = '';

  /**
   * Posición del tooltip relativa al elemento padre
   * 'top' | 'bottom' | 'left' | 'right'
   */
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  /**
   * Alineación del tooltip
   * 'center' | 'left' | 'right' | 'start' | 'end'
   */
  @Input() align: 'center' | 'left' | 'right' | 'start' | 'end' = 'center';

  /**
   * Clases CSS adicionales para personalizar el tooltip
   */
  @Input() customClasses: string = '';

  /**
   * Retorna las clases CSS para la posición del tooltip
   */
  getPositionClasses(): string {
    const baseClasses = 'absolute px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50';
    
    let positionClasses = '';
    
    switch (this.position) {
      case 'top':
        positionClasses = 'bottom-full mb-2';
        break;
      case 'bottom':
        positionClasses = 'top-full mt-2';
        break;
      case 'left':
        positionClasses = 'right-full mr-2 top-1/2 transform -translate-y-1/2';
        break;
      case 'right':
        positionClasses = 'left-full ml-2 top-1/2 transform -translate-y-1/2';
        break;
    }

    // Agregar clases de alineación
    switch (this.align) {
      case 'center':
        if (this.position === 'top' || this.position === 'bottom') {
          positionClasses += ' left-1/2 transform -translate-x-1/2';
        }
        break;
      case 'left':
      case 'start':
        if (this.position === 'top' || this.position === 'bottom') {
          positionClasses += ' left-0';
        }
        break;
      case 'right':
      case 'end':
        if (this.position === 'top' || this.position === 'bottom') {
          positionClasses += ' right-0';
        }
        break;
    }

    return `${baseClasses} ${positionClasses} ${this.customClasses}`;
  }

  /**
   * Retorna las clases CSS para la flecha del tooltip
   */
  getArrowClasses(): string {
    let arrowClasses = 'absolute border-4 border-transparent';
    
    switch (this.position) {
      case 'top':
        arrowClasses += ' top-full border-t-gray-900';
        break;
      case 'bottom':
        arrowClasses += ' bottom-full border-b-gray-900';
        break;
      case 'left':
        arrowClasses += ' left-full border-l-gray-900 top-1/2 transform -translate-y-1/2';
        break;
      case 'right':
        arrowClasses += ' right-full border-r-gray-900 top-1/2 transform -translate-y-1/2';
        break;
    }

    // Agregar posición de la flecha según alineación
    if (this.position === 'top' || this.position === 'bottom') {
      switch (this.align) {
        case 'center':
          arrowClasses += ' left-1/2 transform -translate-x-1/2';
          break;
        case 'left':
        case 'start':
          arrowClasses += ' left-4';
          break;
        case 'right':
        case 'end':
          arrowClasses += ' right-4';
          break;
      }
    }

    return arrowClasses;
  }
}
