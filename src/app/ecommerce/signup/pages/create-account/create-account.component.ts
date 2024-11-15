import { Component, inject } from '@angular/core';
import { StepEnum } from '../../models/step.model';
import { StepComponent } from '../../components/step/step.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Information, InformationComponent } from '../../components/information/information.component';
import { Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';

export interface SignUp {
  firtName: FormControl<string>;
  lastName: FormControl<string>;
  cellphone: FormControl<string>;
  nroDocument: FormControl<string>;
  typeDocument: FormControl<TypeDocumentEnum>;
  email: FormControl<string>;
  password: FormControl<string>;
}

export enum TypeDocumentEnum {
  DNI = '1',
  CarnetExt = '2',
}

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent, RouterLink],
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent {
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _sumaryService = inject(SummaryService)

  stepEnum = StepEnum;

  form = this._formBuilder.group<SignUp>({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocumentEnum>'1', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  });


  informationList: Information[] = [
    {
      name: 'Recibe 10 soles de crédito de compra cada mes.',
    },
    {
      name: ' Acumula automáticamente, sin costo adicional.',
    },
    {
      name: 'Canjea tus créditos por artículos exclusivos.',
    }
  ]

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
  }

  hasExistDocument() {
    const control = this.form.get('nroDocument');
    return false;
    // return control?.hasError('nroDocumentExists') && control.dirty;
  }

  hasExistEmail() {
    const control = this.form.get('email');
    return false;
    // return control?.hasError('emailExists') && control.dirty;
  }

  hasExistCellphone() {
    const control = this.form.get('cellphone');
    return false;
    // return control?.hasError('cellphoneExists') && control.dirty;
  }

  nextStep() {
    if(!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this._sumaryService.setUserData({
      nombre: this.form.get('firtName')?.value ?? '',
      apellido: this.form.get('lastName')?.value ?? '',
      dni: this.form.get('nroDocument')?.value ?? '',
      email: this.form.get('email')?.value ?? ''
    })

    
    this._router.navigate(['/registro/direccion']);
  }
}
