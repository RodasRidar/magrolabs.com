import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, Inject, input, OnDestroy, output, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/env';
import { FlowService } from '../../services/flow.service';
import { SummaryService } from '../../services/summary-service.service';

@Component({
  selector: 'app-flow-widget-add-card',
  standalone: true,
  imports: [],
  templateUrl: './flow-widget-add-card.component.html',
  styleUrl: './flow-widget-add-card.component.css'
})
export class FlowWidgetAddCardComponent implements AfterViewInit, OnDestroy {
  cardAddedSuccessfully = output<boolean>();
  ENV = environment;
  token = input<string>('');
  private flowInstance: any;
  private _flowService = inject(FlowService);
  private _summaryService = inject(SummaryService);

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadFlowScript().then(() => this.initializeFlow());
    }
  }

  private loadFlowScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        return resolve();
      }

      if (document.getElementById('flow-script')) {
        return resolve();
      }

      const script = document.createElement('script');
      script.id = 'flow-script';
      this.ENV.production ? script.src = 'https://www.flow.cl/app/elements/flow-1.1.0.min.js?20241202' :
        script.src = 'https://sandbox.flow.cl/app/elements/flow-1.1.0.min.js?20241202';
        
      script.src = 'https://sandbox.flow.cl/app/elements/flow-1.1.0.min.js?20241202'
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private initializeFlow(): void {
    if (isPlatformBrowser(this.platformId) && (window as any).Flow) {
      this.flowInstance = (window as any).Flow();
      const elements = this.flowInstance.elements();
      const subscribe = elements.create('subscribe', {
        style: { backgroundColor: '#f8f9fa' }
      });
      subscribe.mount('#subscribe-container', this.token());

      this.flowInstance.handleCardSubscribed(subscribe)
        .then((data: any) => {
          console.log('Suscripción procesada correctamente:', data);
          const customerId = this._summaryService.getSummary()?.userData?.customerId ?? '';
          this._flowService.getCustomer(customerId).subscribe((customer) => {
            if (customer.last4CardDigits !== '') {
              const usrData = this._summaryService.getSummary()?.userData;
              if(usrData){
                usrData.isPaymentVerified = true;
                usrData.last4CardDigits = customer.last4CardDigits;
                usrData.creditCardType = customer.creditCardType;
                this._summaryService.setUserData(usrData);
              }
              this.cardAddedSuccessfully.emit(true);
            }
            else {
              this.cardAddedSuccessfully.emit(false);
            }
            setTimeout(() => {
              (this.el.nativeElement.querySelector('#formSubscribe') as HTMLFormElement).submit();
            }, 3000);
          });
        })
        .catch((error: any) => {
          console.error('Error en el pago:', error);
        });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      const script = document.getElementById('flow-script');
      if (script) {
        script.remove();
      }
    }
  }
}