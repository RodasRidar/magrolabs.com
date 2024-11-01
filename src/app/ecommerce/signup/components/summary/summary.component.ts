import { Component, inject } from '@angular/core';
import { Summary } from '../../../../shared/models/summary.model';
import { SummaryServiceService } from '../../../../shared/services/summary-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html'
})
export class SummaryComponent {
  summaryService = inject(SummaryServiceService);
  summaryState$ = this.summaryService.summaryState$;
  summary : Summary = 
    {
      // chosePlan: {
      //   selection: 'Creatina 250g',
      //   descriptionOne: '100% Creatina monohidratada',
      //   descriptionTwo: 'Cobro anual recurrente de S/399'
      // },
    //   userData: {
    //     email: 'JHlPQ@example.com',
    //     nombreApellido: 'Carlos Lozano',
    //     dni: '12345678',
    // },
      // address: {
      //   tipoVia: 'Calle',
      //   nombreVia: 'Calle 1',
      //   numero: '123',
      //   codigoPostal: '15002',
      //   distrito: 'Lima',
      //   provincia: 'Lima'
      // }
  }
  ngOnInit(): void {
    this.summaryService.setSummary(this.summary);
  }
}

