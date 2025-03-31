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
import { SeoService } from '../../../../shared/services/seo.service';
import { environment } from '../../../../../environments/env';
import { SummaryEnum } from '../../../../shared/models/summary.model';
import { FlowService } from '../../../../shared/services/flow.service';
import { CreateCustomerRequest, CreateCustomerResponse, EditCustomerRequest } from '../../../../shared/models/flow.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../shared/services/toast.service';

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
  private _seo = inject(SeoService)
  private _flowService = inject(FlowService)
  private readonly destroy$ = takeUntilDestroyed();
  private _toastService = inject(ToastService)

  private nextUrl = '';
  stepEnum = StepEnum;
  ENV = environment
  isCreatinaGratis = false;
  isProcessing = false;

  form = this._formBuilder.group<SignUp>({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^9[0-9]{8}$/)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9A-Za-z]{8,12}$/)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocumentEnum>'1', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  });




  ngOnInit() {
    this._seo.title.setTitle('Registro | Datos de registro');
    this._seo.setCanonicalURL('magrolabs.com/registro/crear-cuenta');
    this._seo.setIndexFollow(false);

    let summary = this._summaryService.getSummary()
    if (!summary?.chosePlan) {
      this._router.navigate(['registro/']);
    }

    if (summary?.chosePlan?.selection === SummaryEnum.CREATINA_250G_SUBSCRIPTION) {
      this.isCreatinaGratis = true;
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
      name: 'Recibe ' + this.ENV.creditoRegaloPorCompraMes + ' soles de crédito de compra cada mes.',
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
    return control?.hasError('nroDocumentExists') && control.dirty;
  }

  hasExistEmail() {
    const control = this.form.get('email');
    return false;
    // return control?.hasError('emailExists') && control.dirty;
  }

  hasInvalidEmail() {
    const control = this.form.get('email');
    return control?.hasError('emailInvalid') && control.dirty;
  }

  hasExistCellphone() {
    const control = this.form.get('cellphone');
    return false;
    // return control?.hasError('cellphoneExists') && control.dirty;
  }

  limitDigits(nroDigits: number, field: string): void {
    const control = this.form.get(field);
    if (control) {
      const value = control.value?.toString() || '';
      control.setValue(value.slice(0, nroDigits));
    }
  }

  nextStep() {
    const customerId = this._summaryService.getSummary()?.userData?.customerId;
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isProcessing = true;

    if (customerId) {
      
      const customerRequest: EditCustomerRequest = {
        name: this.form.get('firtName')?.value + ' ' + this.form.get('lastName')?.value,
        email: this.form.get('email')?.value ?? '',
        externalId: this.form.get('nroDocument')?.value ?? '',
        customerId: this._summaryService.getSummary()?.userData?.customerId ?? '',
      }

      this._flowService.editCustomer(customerRequest)
      .subscribe({
        next: (response) => { 
          this._summaryService.setUserData({
            nombre: this.form.get('firtName')?.value ?? '',
            apellido: this.form.get('lastName')?.value ?? '',
            dni: this.form.get('nroDocument')?.value ?? '',
            email: this.form.get('email')?.value ?? '',
            cellphone: this.form.get('cellphone')?.value ?? '',
            typeDocument: this.form.get('typeDocument')?.value ?? TypeDocumentEnum.DNI,
            password: this.form.get('password')?.value ?? '',
            customerId: response.customerId
          });
          this.isProcessing = false;
          if (this.nextUrl !== '') {
            this._router.navigate(['/registro/' + this.nextUrl]);
          }
  
          else {
            this._router.navigate(['/registro/direccion']);
          }
        },
        error: (err) => {
          this.isProcessing = false;
          if(err.error.code === 501 && err.error.message.includes('externalId')) {
            this._toastService.error('Ups!','Ya existe una cuenta con el N° de documento ingresado.');
            const control = this.form.get('nroDocument');
            control?.setErrors({nroDocumentExists: true});
          }
          if(err.error.code === 501 && err.error.message.includes('email')) {
            this._toastService.error('Ups!','El correo ingresado no existe o no es válido.');
            const control = this.form.get('email');
            control?.setErrors({emailInvalid: true});
          }
          else{
            console.log(err);
          }
        }
      });

    }
    else {
      const customerRequest: CreateCustomerRequest = {
        name: this.form.get('firtName')?.value + ' ' + this.form.get('lastName')?.value,
        email: this.form.get('email')?.value ?? '',
        externalId: this.form.get('nroDocument')?.value ?? '',
      }
      this._flowService.createCustomer(customerRequest)
      .subscribe({
        next: (response) => { 
          this._summaryService.setUserData({
            nombre: this.form.get('firtName')?.value ?? '',
            apellido: this.form.get('lastName')?.value ?? '',
            dni: this.form.get('nroDocument')?.value ?? '',
            email: this.form.get('email')?.value ?? '',
            cellphone: this.form.get('cellphone')?.value ?? '',
            typeDocument: this.form.get('typeDocument')?.value ?? TypeDocumentEnum.DNI,
            password: this.form.get('password')?.value ?? '',
            customerId: response.customerId
          });
          this.isProcessing = false;
          if (this.nextUrl !== '') {
            this._router.navigate(['/registro/' + this.nextUrl]);
          }
  
          else {
            this._router.navigate(['/registro/direccion']);
          }
        },
        error: (err) => {
          this.isProcessing = false;
          if(err.error.code === 501 && err.error.message.includes('externalId')) {
            this._toastService.error('Ups!','Ya existe una cuenta con el N° de documento ingresado.');
            const control = this.form.get('nroDocument');
            control?.setErrors({nroDocumentExists: true});
          }
          if(err.error.code === 501 && err.error.message.includes('email')) {
            this._toastService.error('Ups!','El correo ingresado no existe o no es válido.');
            const control = this.form.get('email');
            control?.setErrors({emailInvalid: true});
          }
          else{
            this._toastService.error('Ups!','Error al crear la cuenta. Por favor, intenta nuevamente.');
            console.log(err);
          }
        }
      });
    }



  }
}
