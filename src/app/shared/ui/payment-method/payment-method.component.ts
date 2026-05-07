import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryService } from '../../services/summary-service.service';
import { FlowPaymentMethod } from '../../models/flow.model';
import { environment } from '../../../../environments/env';
import { FlowWidgetAddCardComponent } from '../flow-widget-add-card/flow-widget-add-card.component';

/**
 * Identificadores de selección visibles en el componente.
 * Internamente mapean a FlowPaymentMethod cuando aplica.
 *
 * - CARD_ENROLLED: tarjeta ya guardada del cliente (cargo síncrono).
 * - ADD_CARD: enrolar nueva tarjeta vía widget de Flow Elements (cargo síncrono).
 * - CARD_PORTAL: tarjeta sin enrolar — redirect al portal Flow para que el
 *   cliente ingrese su tarjeta directamente. Aplica al guest sin flag de
 *   registro (no queremos guardarle la tarjeta).
 * - YAPE: redirect al portal Flow con paymentMethod=152.
 */
export type PaymentSelection = 'CARD_ENROLLED' | 'ADD_CARD' | 'CARD_PORTAL' | 'YAPE';

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

  /**
   * True cuando se debe ofrecer pagar con tarjeta vía redirect al portal Flow
   * (sin enrolar). Solo aplica al guest sin flag de registro.
   * Mutuamente excluyente con canEnrollCard.
   */
  canPayCardViaPortal = input<boolean>(false);

  /** Emite cada vez que el cliente cambia de método de pago. */
  paymentMethodChanged = output<PaymentMethodSelection>();

  /** Emite cuando el cliente selecciona "Agregar Tarjeta" y el parent debe pedir el token (prepare-card). */
  enrollmentRequested = output<void>();

  /** Emite cuando el widget de Flow confirma que la tarjeta se enroló exitosamente. */
  cardEnrolled = output<boolean>();

  /**
   * Selección actual del cliente. null = aún no eligió.
   * Si hay enrolledCard cuando se monta el componente, se preselecciona CARD_ENROLLED.
   * Si NO hay enrolledCard, se deja null para que el cliente elija activamente —
   * así no se monta el widget (ni se ve el loader) hasta que el cliente toca
   * "Agregar Tarjeta".
   */
  currentSelection = signal<PaymentSelection | null>(null);

  /** El widget de Flow se renderiza solo cuando ADD_CARD está activo y hay token. */
  showWidget = computed(() => this.currentSelection() === 'ADD_CARD' && !!this.flowToken());

  constructor() {
    // Si la tarjeta enrolada llega después del init (fetch async desde backend),
    // y el cliente aún no había elegido nada, autoseleccionarla.
    effect(() => {
      const card = this.enrolledCard();
      if (card && this.currentSelection() === null) {
        this.currentSelection.set('CARD_ENROLLED');
        this.emitSelection('CARD_ENROLLED');
      }
    });
  }

  ngOnInit(): void {
    // Default solo si la tarjeta ya estaba disponible al init (caso síncrono raro).
    // En el caso normal, enrolledCard está null al init y el effect() se encarga
    // cuando llegue la respuesta async de getCustomer.
    if (this.enrolledCard()) {
      this.currentSelection.set('CARD_ENROLLED');
      this.emitSelection('CARD_ENROLLED');
    }
    // Sin enrolledCard: dejamos currentSelection en null. El cliente elige.
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
      case 'CARD_PORTAL':
        // Ambos son tarjeta de crédito/débito desde la perspectiva de Flow.
        // La diferencia (charge síncrono vs portal) la decide el parent
        // según `selection` al construir el body del checkout.
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
