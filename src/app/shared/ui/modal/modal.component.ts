import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ButtonComponent } from '../button/button.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { SummaryService } from '../../services/summary-service.service';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  animations: [
    trigger('fadeInOut', [
      state('inactive', style({
        opacity: 0,
        transform: 'translateY(-100%)'
      })),
      state('active', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('inactive => active', [
        animate('2000ms ease-in-out')
      ]),
      transition('active => inactive', [
        animate('2000ms ease-in-out')
      ])
    ])
  ],
})

export class ModalComponent {
  ENV = environment
  urlShared = ''
  private _dialogRef = inject(MatDialogRef<ModalComponent>)
  private _summaryService = inject(SummaryService);

  public data: ModalData = inject(MAT_DIALOG_DATA);


  animationState: 'active' | 'inactive' = 'inactive';
  isModalWelcome = false;
  modalType = ModalTypeEnum;

  ngOnInit(): void {
    if (this.data.type === ModalTypeEnum.WELCOME) {
      const nombre = this._summaryService.getSummary()?.userData?.nombre || 'Tu amigo';
      const codigo = this.data.afiliateCode || '';
      this.isModalWelcome = true;
      this.urlShared = 'https://magrolabs.com/referido-por-amigo?codigo=' + codigo + '&nombre=' + nombre;
    }
  }

  close(): void {
    this.animationState = 'inactive'
    this._dialogRef.close();
  }

  activate() {
    this.animationState = 'active';
  }
  copyShareUrl() {
    navigator.clipboard.writeText(this.urlShared).then(
      () => {
        alert('¡Enlace copiado al portapapeles!');
      },
      (err) => {
        // console.error('Error al copiar el texto: ', err)
      }
    );
  }
}

export enum ModalTypeEnum {
  WELCOME = 1,
  CONFIRMATION = 2,
  COOKIES = 3,
}

export interface ModalData {
  title: string;
  message: string;
  afiliateCode?: string;
  type: ModalTypeEnum;
}