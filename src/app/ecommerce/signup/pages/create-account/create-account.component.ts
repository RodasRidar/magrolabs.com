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
  imports: [StepComponent,ButtonComponent,ReactiveFormsModule, CommonModule],
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent {
  private _formBuilder = inject(FormBuilder)
  stepEnum = StepEnum;

  form = this._formBuilder.group<SignUp>({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required ,Validators.minLength(3)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required , Validators.minLength(8)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocumentEnum> '1', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  });

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
  }

  hasExistDocument() {
    const control = this.form.get('nroDocument');
    return true;
    // return control?.hasError('nroDocumentExists') && control.dirty;
  }

  hasExistEmail() {
    const control = this.form.get('email');
    return true;
    // return control?.hasError('emailExists') && control.dirty;
  }

  hasExistCellphone() {
    const control = this.form.get('cellphone');
    return true;
    // return control?.hasError('cellphoneExists') && control.dirty;
  }
}
