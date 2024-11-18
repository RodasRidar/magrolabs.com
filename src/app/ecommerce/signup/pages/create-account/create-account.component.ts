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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private _summaryService = inject(SummaryService)
  private _route = inject(ActivatedRoute)

  private nextUrl = '';
  stepEnum = StepEnum;

  form = this._formBuilder.group<SignUp>({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^[0-9]{9}$/)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9A-Za-z]{8,12}$/)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocumentEnum>'1', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  });




  ngOnInit(): void {
    let summary = this._summaryService.getSummary()
    if (!summary?.chosePlan) {
      this._router.navigate(['registro/']);
    }

    this._route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || '';
    });

    this.form.get('firtName')?.setValue(summary?.userData?.nombre ?? '');
    this.form.get('lastName')?.setValue(summary?.userData?.apellido ?? '');
    this.form.get('cellphone')?.setValue(summary?.userData?.cellphone ?? '');
    this.form.get('nroDocument')?.setValue(summary?.userData?.dni ?? '');
    this.form.get('typeDocument')?.setValue(summary?.userData?.typeDocument ?? TypeDocumentEnum.DNI);
    this.form.get('email')?.setValue(summary?.userData?.email ?? '');
    this.form.get('password')?.setValue(summary?.userData?.password ?? '');

  }

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

  hasValidatorError(field: string) {
    const control = this.form.get(field);
    if (field === 'nroDocument' && this.form.get('typeDocument')?.value === TypeDocumentEnum.DNI) {
      return control?.value.toString().length !== 8 && control?.touched && control?.invalid;
    }
    if (field === 'nroDocument' && this.form.get('typeDocument')?.value === TypeDocumentEnum.CarnetExt) {
      return control?.value.toString().length !== 12 && control?.touched && control?.invalid;
    }
    return control?.invalid && control?.touched;
  }

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

  limitDigits(nroDigits: number, field: string) {
    const control = this.form.get(field);
    control?.setValue(control.value.toString().slice(0, nroDigits));
  }

  nextStep() {
    console.log(this.nextUrl);
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this._summaryService.setUserData({
      nombre: this.form.get('firtName')?.value ?? '',
      apellido: this.form.get('lastName')?.value ?? '',
      dni: this.form.get('nroDocument')?.value ?? '',
      email: this.form.get('email')?.value ?? '',
      cellphone: this.form.get('cellphone')?.value ?? '',
      typeDocument: this.form.get('typeDocument')?.value ?? TypeDocumentEnum.DNI,
      password: this.form.get('password')?.value ?? '',
    })

    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/' + this.nextUrl]);
    }
    else {
      this._router.navigate(['/registro/direccion']);
    }
  }
}
