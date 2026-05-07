import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryService } from '../../services/summary-service.service';
import { FlowPaymentMethod } from '../../models/flow.model';
import { environment } from '../../../../environments/env';
import { FlowWidgetAddCardComponent } from '../flow-widget-add-card/flow-widget-add-card.component';

/**
 * Identificadores de selección visibles en el componente.
 * Internamente mapean a FlowPaymentMethod cuando aplica.
 */
export type PaymentSelection = 'CARD_ENROLLED' | 'ADD_CARD' | 'YAPE';

export interface PaymentMethodSelection {
  selection: PaymentSelection;
  flowMethod: FlowPaymentMethod;
}

/**
 * Datos de la tarjeta enrolada del usuario para mostrarla como opción.
 * El parent obtiene estos datos de localStorage o vía FlowService.getCustomer.
 */
export interface EnrolledCardInfo {
  last4: string;
  brand: string;
}

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, FlowWidgetAddCardComponent],
  templateUrl: './payment-method.component.html',
  styleUrl: './payment-method.component.css'
})
export class PaymentMethodComponent {
  private _summaryService = inject(SummaryService);
  env = environment;

  /** Tarjeta enrolada actual del cliente (si existe). */
  enrolledCard = input<EnrolledCardInfo | null>(null);

  /** Token del widget de Flow Elements (entregado por prepare-card). */
  flowToken = input<string | null>(null);

  /** Cambia a true cuando el flag "Registrarse" del checkout permite enrolar tarjeta como guest. */
  canEnrollCard = input<boolean>(true);

  /** Emite cada vez que el cliente cambia de método de pago. */
  paymentMethodChanged = output<PaymentMethodSelection>();

  /** Emite cuando el cliente selecciona "Agregar Tarjeta" y el parent debe pedir el token (prepare-card). */
  enrollmentRequested = output<void>();

  /** Emite cuando el widget de Flow confirma que la tarjeta se enroló exitosamente. */
  cardEnrolled = output<boolean>();

  /** Selección actual. Default: tarjeta enrolada si existe, si no Agregar Tarjeta. */
  currentSelection = signal<PaymentSelection>('ADD_CARD');

  /** Marca true cuando el widget está visible (acordeón expandido). */
  showWidget = computed(() => this.currentSelection() === 'ADD_CARD' && !!this.flowToken());

  ngOnInit(): void {
    // Default: si hay tarjeta enrolada, ofrecerla como primera opción.
    const initial: PaymentSelection = this.enrolledCard() ? 'CARD_ENROLLED' : 'ADD_CARD';
    this.currentSelection.set(initial);
    this.emitSelection(initial);
  }

  selectOption(selection: PaymentSelection): void {
    this.currentSelection.set(selection);
    this.emitSelection(selection);

    if (selection === 'ADD_CARD' && !this.flowToken()) {
      this.enrollmentRequested.emit();
    }
  }

  private emitSelection(selection: PaymentSelection): void {
    let flowMethod: FlowPaymentMethod;
    switch (selection) {
      case 'CARD_ENROLLED':
        flowMethod = FlowPaymentMethod.CARD_ENROLLED;
        break;
      case 'ADD_CARD':
        flowMethod = FlowPaymentMethod.DEBIT_CREDIT_CARD;
        break;
      case 'YAPE':
        flowMethod = FlowPaymentMethod.YAPE;
        break;
    }
    this.paymentMethodChanged.emit({ selection, flowMethod });
  }

  onCardEnrolled(success: boolean): void {
    this.cardEnrolled.emit(success);
  }
}
