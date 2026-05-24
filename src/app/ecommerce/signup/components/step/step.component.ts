import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepItemComponent } from './step-item/step-item.component';
import { StepEnum } from '../../models/step.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { SummaryEnum } from '../../../../shared/models/summary.model';
import { environment } from '../../../../../environments/env';
import { IconComponent } from '../../../../shared/ui/icon/icon.component';

export type StepType = 'signup' | 'order-tracking' | 'delivery-preview';
export type StepState = 'past' | 'current' | 'future';

@Component({
    selector: 'app-step',
    imports: [StepItemComponent, IconComponent],
    templateUrl: './step.component.html'
})
export class StepComponent {
  private _summaryService = inject(SummaryService);

  stepEnum = StepEnum;

  // ── type discriminator ───────────────────────────────────────────────────
  type = input<StepType>('signup');

  // ── signup inputs ────────────────────────────────────────────────────────
  step = input<StepEnum | undefined>(undefined);
  totalToPay = input<number | null>(null);

  // Una sola fuente de verdad: el paso actual. Cada `stepX` indica si el
  // usuario alcanzó o superó ese paso (comparación numérica con el enum).
  private readonly currentStep = computed(() => this.step() ?? 0);
  readonly stepChosePlan       = computed(() => this.currentStep() >= StepEnum.CHOSE_PLAN);
  readonly stepUserData        = computed(() => this.currentStep() >= StepEnum.USER_DATA);
  readonly stepAddress         = computed(() => this.currentStep() >= StepEnum.ADDRESS);
  readonly stepCardValidation  = computed(() => this.currentStep() >= StepEnum.CARD_VALIDATION);
  readonly stepConfirmation    = computed(() => this.currentStep() >= StepEnum.CONFIRMATION);

  private summaryState = toSignal(this._summaryService.summaryState$);

  flag = computed(() => {
    const summarySelection = this.summaryState()?.chosePlan?.selection;
    if (
      environment.campanaPrimeraCreatina.tipo === 'gratis' &&
      summarySelection === SummaryEnum.CREATINA_250G_SUBSCRIPTION
    ) {
      return 'Gratis';
    } else if (
      environment.campanaPrimeraCreatina.tipo !== 'gratis' &&
      summarySelection === SummaryEnum.CREATINA_250G_SUBSCRIPTION
    ) {
      const price = this.totalToPay() ?? environment.campanaPrimeraCreatina.precio;
      return price.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
    }
    return '';
  });

  // ── order-tracking inputs ─────────────────────────────────────────────────
  orderStatus      = input<string>('');
  orderCreatedAt   = input<string>('');
  orderUpdatedAt   = input<string>('');
  deliveryHoursMin = input<number>(24);
  deliveryHoursMax = input<number>(48);

  // ── delivery-preview inputs ───────────────────────────────────────────────
  preparandoDate = input<string>('');
  enviadoDate    = input<string>('');
  entregadoDate  = input<string>('');

  // ── order-tracking state ──────────────────────────────────────────────────
  getOrderStepState(stepIndex: 1 | 2 | 3 | 4): StepState {
    const s = this.orderStatus();
    const atLeast2 = ['PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED'].includes(s);
    const atLeast3 = ['SHIPPED', 'DELIVERED'].includes(s);
    const at4      = s === 'DELIVERED';

    switch (stepIndex) {
      case 1: return atLeast2 ? 'past' : 'current';
      case 2:
        if (atLeast3) return 'past';
        if (atLeast2) return 'current';
        return 'future';
      case 3:
        if (at4) return 'past';
        if (atLeast3) return 'current';
        return 'future';
      case 4: return at4 ? 'past' : 'future';
    }
  }

  getOrderStepDate(stepIndex: 1 | 2 | 3 | 4): string {
    const s = this.orderStatus();
    if (stepIndex === 1)
      return this.formatDate(this.orderCreatedAt());
    if (stepIndex === 2 && ['PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED'].includes(s))
      return this.formatDate(this.orderUpdatedAt());
    if (stepIndex === 3 && ['SHIPPED', 'DELIVERED'].includes(s))
      return this.formatDate(this.orderUpdatedAt());
    if (stepIndex === 4 && s === 'DELIVERED')
      return this.formatDate(this.orderUpdatedAt());
    return '';
  }

  // ── delivery-preview state ────────────────────────────────────────────────
  getDeliveryStepState(stepIndex: 1 | 2 | 3): StepState {
    const hasEnv = !!this.enviadoDate();
    const hasEnt = !!this.entregadoDate();
    switch (stepIndex) {
      case 1: return hasEnv ? 'past' : 'current';
      case 2: return hasEnt ? 'past' : hasEnv ? 'current' : 'future';
      case 3: return hasEnt ? 'past' : 'future';
    }
  }

  // ── style helpers ─────────────────────────────────────────────────────────
  circleLg(state: StepState): string {
    const style = state === 'future'
      ? 'bg-border-strong border-border-strong'
      : 'bg-fg border-fg';
    return `rounded-full h-10 w-10 sm:h-16 sm:w-16 flex items-center justify-center border-2 sm:border-4 z-10 ${style}`;
  }

  circleSm(state: StepState): string {
    const style = state === 'future'
      ? 'bg-border-strong border-border-strong'
      : 'bg-fg border-fg';
    return `rounded-full h-8 w-8 flex items-center justify-center border-2 z-10 ${style}`;
  }

  iconLg(state: StepState): string {
    return state === 'future' ? 'w-5 h-5 sm:w-8 sm:h-8 text-fg-subtle' : 'w-5 h-5 sm:w-8 sm:h-8 text-bg';
  }

  iconSm(state: StepState): string {
    return state === 'future' ? 'w-4 h-4 text-fg-subtle' : 'w-4 h-4 text-bg';
  }

  labelLg(state: StepState): string {
    const color = state !== 'future' ? 'text-fg' : 'text-fg-subtle';
    return `mt-4 text-center font-bold text-sm sm:text-base ${color}`;
  }

  labelSm(state: StepState): string {
    const color = state !== 'future' ? 'text-fg' : 'text-fg-subtle';
    return `mt-2 text-center font-bold text-xs ${color}`;
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
