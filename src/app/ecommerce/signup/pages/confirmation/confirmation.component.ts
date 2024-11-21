import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { Information, InformationComponent } from '../../components/information/information.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalData, ModalTypeEnum, ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { SeoService } from '../../../../shared/services/seo.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [StepComponent, ButtonComponent, CommonModule, InformationComponent, RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  private _summaryService = inject(SummaryService)
  private _router = inject(Router)
  private _route = inject(ActivatedRoute)
  private _dialog = inject(MatDialog)
  private _seo = inject(SeoService)

  stepEnum = StepEnum;
  clientName = '';
  isSuccess = true;
  creditos = 'S/10';

  informationExitoList: Information[] = [
    { name: 'Tu periodo de reflexión comienza despues de recibir tu creatina.' },
    { name: 'Te avisaremos cuando finalice tu periodo de reflexión.' },
    { name: 'Entrega estimada de la creatina gratis: 6 a 9 días hábiles.' },
  ]

  informationErrorList: Information[] = [
    { name: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.' },
    { name: 'Tu periodo de reflexión comienza despues de recibir tu creatina.' },
    { name: 'En las proximas 48 horas nos pondremos en contacto vía Whatsapp.' },
    { name: 'Te avisaremos cuando hagamos envíos a tu ciudad.' },
  ]

  parrafoExito = {
    parrafo1: '¡Tu registro se ha completado con éxito!',
    parrafo2: 'El email de confirmación está en camino, si no lo recibes puedes revisar tu bandeja de spam.',
    parrafo3: 'Ten en cuenta que:',
  }

  parrafoError = {
    parrafo1: '¡El registro se ha completado con éxito, aunque tenemos noticias!',
    parrafo2: 'Revisamos que tu domicilio no esta dentro de la zona de cobertura, pronto estaremos por tu ciudad. Por el momento no es posible enviarte tu creatina gratis. ' +
    'Aún así, nos pondremos en contacto contigo para confirmar tu domicilio.',
    parrafo3: 'Ten en cuenta que:',
  }

  ngOnInit() {
    this._seo.title.setTitle('Magrolabs | Bienvenido');
    this._seo.setCanonicalURL('magrolabs.com/registro/confirmacion');
    this._seo.setIndexFollow(false);

    let summary = this._summaryService.getSummary()

    if (!summary?.address || !summary?.userData || !summary?.chosePlan) {
      this._router.navigate(['registro/verificacion']);
    }

    this.creditos = summary?.chosePlan?.selection == 'Creatina 3kg' ? 'S/120' : 'S/10';
    this.clientName = summary?.userData?.nombre ?? '';

    this._route.queryParams.subscribe(params => {
      let status = params['status'] || '';
      if (status === '1') {
        this.openModal();
        this._summaryService.clearSummary();
        this.isSuccess = true;
      }
      //Fuere de covertura
      else if (status === '0') { 
        this._summaryService.clearSummary();
        this.isSuccess = false;
      }
      else {
        this._router.navigate(['registro/verificacion']);
      }
    });
  }

  openModal(){
    const modalData :ModalData = {
      type: ModalTypeEnum.WELCOME,
      title: 'titulo',
      message: 'mensaje',
      afiliateCode: 'KOSDJ1',
    }

    const dialogRef = this._dialog.open(ModalComponent, {
      width: '500px',
      disableClose: true,
      data: modalData
    });
    
    dialogRef.componentInstance.activate();
  }

}
