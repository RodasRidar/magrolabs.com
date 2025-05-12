import { Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { StepEnum } from '../../models/step.model';
import { StepComponent } from '../../components/step/step.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Information, InformationComponent } from '../../components/information/information.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../shared/services/seo.service';
import { environment } from '../../../../../environments/env';
import { SummaryEnum, UserDataSummary } from '../../../../shared/models/summary.model';
import { FlowService } from '../../../../shared/services/flow.service';
import { CreateCustomerRequest, CreateCustomerResponse, EditCustomerRequest } from '../../../../shared/models/flow.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { RegisterUserRequest, TypeDocument } from '../../../../shared/interfaces/auth.interfaces';
import { switchMap, catchError, EMPTY, Subject, debounceTime, distinctUntilChanged, filter, Subscription, of, map, finalize } from 'rxjs';
import { UpdateUserRequest, UpdatePasswordRequest } from '../../../../shared/interfaces/user.interfaces';

export interface SignUp {
  firtName: FormControl<string>;
  lastName: FormControl<string>;
  cellphone: FormControl<string>;
  nroDocument: FormControl<string>;
  typeDocument: FormControl<TypeDocument>;
  email: FormControl<string>;
  password: FormControl<string>;
  isSignUpAcepted: FormControl<boolean>;
}

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule, InformationComponent, RouterLink, FormsModule],
  templateUrl: './create-account.component.html',
})
export class CreateAccountComponent implements OnDestroy {
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _route = inject(ActivatedRoute)
  private _seo = inject(SeoService)
  private _flowService = inject(FlowService)
  private readonly destroy$ = takeUntilDestroyed();
  private _toastService = inject(ToastService)
  private _authService = inject(AuthService)
  private _userService = inject(UserService)
  private platformId = inject(PLATFORM_ID);
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
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocument>'DNI', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.minLength(8)]),
    isSignUpAcepted: this._formBuilder.nonNullable.control(false, []),
  });

  private emailSubject = new Subject<string>();
  private phoneSubject = new Subject<string>();
  private documentSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

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
    this.form.get('nroDocument')?.setValue(summary?.userData?.nroDocument ?? '');
    this.form.get('typeDocument')?.setValue(summary?.userData?.typeDocument ?? 'DNI');
    this.form.get('email')?.setValue(summary?.userData?.email ?? '');
    this.form.get('password')?.setValue(summary?.userData?.password ?? '');
    this.form.get('isSignUpAcepted')?.setValue(summary?.userData?.isSignUpAcepted ?? false);

    // Configurar debounce para email
    const emailSubscription = this.emailSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(email => !!email && email.length > 5 && this.isValidEmail(email))
    ).subscribe(email => {
      if (this.form.get('isSignUpAcepted')?.value) {
        this.validateEmailWithServer(email);
      }
    });

    // Configurar validación en tiempo real para teléfono
    const phoneSubscription = this.phoneSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(phone => !!phone && phone.length === 9)
    ).subscribe(phone => {
      if (this.form.get('isSignUpAcepted')?.value) {
        this.validatePhoneWithServer(phone);
      }
    });

    // Configurar validación en tiempo real para documento
    const documentSubscription = this.documentSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(document => {
        const typeDoc = this.form.get('typeDocument')?.value;
        if (typeDoc === 'DNI') return !!document && document.length === 8;
        return !!document && document.length >= 8 && document.length <= 12;
      })
    ).subscribe(document => {
      if (this.form.get('isSignUpAcepted')?.value) {
        this.validateDocumentWithServer(document);
      }
    });

    this.subscriptions.push(emailSubscription, phoneSubscription, documentSubscription);

    // Escuchar cambios en el email
    this.form.get('email')?.valueChanges.subscribe(val => {
      if (val) {
        this.emailSubject.next(val);
      }
    });

    // Escuchar cambios en el teléfono
    this.form.get('cellphone')?.valueChanges.subscribe(val => {
      if (val) {
        this.phoneSubject.next(val);
      }
    });

    // Escuchar cambios en el documento
    this.form.get('nroDocument')?.valueChanges.subscribe(val => {
      if (val) {
        this.documentSubject.next(val);
      }
    });

    if (this.form.get('isSignUpAcepted')) {
      this.form.get('isSignUpAcepted')!.valueChanges.subscribe(signUp => {
        const passwordControl = this.form.get('password');

        if (signUp) {
          passwordControl?.addValidators(Validators.required);
        } else {
          passwordControl?.clearValidators();
        }

        passwordControl?.updateValueAndValidity();
      });
    }

    if (isPlatformBrowser(this.platformId) && localStorage.getItem('passwordSignal') == 'true') {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
      this.form.get('password')?.markAsTouched()
    }
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Verificar si el email tiene un formato válido
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validar email con el servidor
  private validateEmailWithServer(email: string): void {
    this.isProcessing = true;
    const control = this.form.get('email');
    if (control && !control.hasError('email')) {
      this._userService.validateEmail(email).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing = false)
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ emailExists: true });
        } else {
          localStorage.setItem('isEmailInvalid', 'false');
        }
      });
    }
  }

  private validatePhoneWithServer(phone: string): void {
    this.isProcessing = true;
    const control = this.form.get('cellphone');
    if (control && !control.hasError('pattern')) {
      this._userService.validatePhone(phone).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing = false)
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ cellphoneExists: true });
        }
      });
    }
  }
  
  private validateDocumentWithServer(document: string): void {
    this.isProcessing = true;
    const control = this.form.get('nroDocument');
    const typeDoc = this.form.get('typeDocument')?.value;

    if (control && !control.hasError('pattern') && typeDoc) {
      this._userService.validateDocument(document, typeDoc).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing = false)
      ).subscribe((response: { data: { exists: boolean } }) => {
        if (response.data.exists) {
          control.setErrors({ nroDocumentExists: true });
        } else {
          localStorage.setItem('isExternalIdExists', 'false');
        }
      });
    }
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
    if (field === 'nroDocument' && this.form.get('typeDocument')?.value === 'DNI') {
      return control?.value.toString().length !== 8 && control?.touched && control?.invalid;
    }
    if (field === 'nroDocument' && this.form.get('typeDocument')?.value === 'CE') {
      return control?.value.toString().length !== 12 && control?.touched && control?.invalid;
    }
    if (field === 'nroDocument' && this.form.get('typeDocument')?.value === 'PASSPORT') {
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
    return (control?.hasError('nroDocumentExists') && control.dirty) ||
      (isPlatformBrowser(this.platformId) && localStorage.getItem('isExternalIdExists') === 'true');
  }

  hasInvalidEmail() {
    const control = this.form.get('email');
    return (control?.hasError('emailInvalid') && control.dirty) ||
      (isPlatformBrowser(this.platformId) && localStorage.getItem('isEmailInvalid') === 'true');
  }

  // Validar email
  hasExistEmail() {
    const control = this.form.get('email');
    return control?.hasError('emailExists') && control.dirty;
  }

  // Validar teléfono
  hasExistCellphone() {
    const control = this.form.get('cellphone');
    return control?.hasError('cellphoneExists') && control.dirty;
  }

  limitDigits(nroDigits: number, field: string): void {
    const control = this.form.get(field);
    if (control) {
      const value = control.value?.toString() || '';
      control.setValue(value.slice(0, nroDigits));
    }
  }

  nextStep() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isProcessing = true;
    //const customerId = this._summaryService.getSummary()?.userData?.customerId;
    const userId = this._summaryService.getSummary()?.userData?.id;
    let userData = this.getUserDataFromForm();
    if ((localStorage.getItem('passwordSignal') == 'true' && this.form.get('password')!.value.length > 0 )|| this.isCreatinaGratis) {
      userData.isSignUpAcepted = true;
    }
    if (userId) {
      this.updateExistingCustomerByApi(userId, userData);
    }
    else {
      this.createNewCustomerByApi(userData);
    }
    // Actualizar usuario existente en Flow
    /*
    if (customerId && userId) {
      this.updateExistingCustomerWithFlow(customerId, userData);
      return;
    }*/
    // Crear nuevo usuario
    /*
    if (!customerId) {
      const isSignUpAcepted = this.form.get('isSignUpAcepted')?.value ?? false;

      if (!isSignUpAcepted) {
        this.createNewCustomerByApi(userData);
        return;
      }

      this.createNewCustomerWithFlow(userData);
    }*/


    localStorage.removeItem('passwordSignal');
    localStorage.removeItem('isEmailInvalid');
    localStorage.removeItem('isExternalIdExists');
  }

  private updateExistingCustomerByApi(userId: string, userData: UserDataSummary) {
    const updateUserRequest: UpdateUserRequest = {
      first_name: userData.nombre,
      last_name: userData.apellido,
      phone: userData.cellphone,
      documentNumber: userData.nroDocument,
      documentType: userData.typeDocument,
      email: userData.email,
      isSignUpAcepted: userData.isSignUpAcepted ?? false,
    }

    this._userService.updateUser(userId, updateUserRequest).pipe(
      switchMap(user => {
        // Si hay contraseña y tiene longitud mayor a 0, actualizarla
        if (userData.password && userData.password.length > 0) {
          const passwordRequest: UpdatePasswordRequest = {
            currentPassword: this._summaryService.getSummary()?.userData?.password == '' ? '1231Axer1231' : this._summaryService.getSummary()?.userData?.password ?? '',  // Contraseña temporal para actualizar la contraseña
            newPassword: userData.password,
            confirmPassword: userData.password
          };

          // Retornamos la actualización de contraseña dentro del switchMap
          return this._userService.updatePassword(passwordRequest).pipe(
            // Después de actualizar la contraseña, devolvemos el usuario actualizado
            map(() => user)
          );
        }
        // Si no hay contraseña, solo devolver el usuario actualizado
        return of(user);
      }),
      catchError(err => {
        console.error(err);
        this._toastService.error('Ups!', 'Error al actualizar los datos del usuario.');
        this.isProcessing = false;
        return EMPTY;
      })
    ).subscribe({
      next: (response) => {
        const customerId = this._summaryService.getSummary()?.userData?.customerId;
        userData = { ...userData, customerId, id: response.id };
        this.saveUserDataAndNavigate(userData);
        this._toastService.success('¡Listo!', 'Datos actualizados correctamente.');
      }
    });
  }
  
  isSignUpAceptedChange() {
    if (this.form.get('isSignUpAcepted')?.value) {

      // Validar email
      this.validateEmailWithServer(this.form.get('email')?.value ?? '');

      // Validar teléfono
      this.validatePhoneWithServer(this.form.get('cellphone')?.value ?? '');

      // Validar documento
      this.validateDocumentWithServer(this.form.get('nroDocument')?.value ?? '');
    } else {
      let emailControl = this.form.get('email');
      let cellphoneControl = this.form.get('cellphone');
      let nroDocumentControl = this.form.get('nroDocument');

      emailControl?.setErrors({ emailExists: false });
      cellphoneControl?.setErrors({ cellphoneExists: false });
      nroDocumentControl?.setErrors({ nroDocumentExists: false });


      let emailValue = emailControl?.value;
      let cellphoneValue = cellphoneControl?.value;
      let nroDocumentValue = nroDocumentControl?.value;

      if (emailControl) {
        emailControl.setValue(emailValue ?? '');
      }
      if (cellphoneControl) {
        cellphoneControl.setValue(cellphoneValue ?? '');
      }
      if (nroDocumentControl) {
        nroDocumentControl.setValue(nroDocumentValue ?? '');
      }
    }
  }
  
  private createNewCustomerByApi(userData: UserDataSummary) {
    const registerRequest: RegisterUserRequest = {
      email: userData.email,
      first_name: userData.nombre,
      last_name: userData.apellido,
      isSignUpAcepted: userData.isSignUpAcepted ?? false,
      documentNumber: userData.nroDocument,
      documentType: userData.typeDocument,
      phone: userData.cellphone,
    };

    if (this.form.get('password')?.value && this.form.get('password')!.value.length > 0) {
      registerRequest.password = this.form.get('password')?.value;
    }

    this._authService.register(registerRequest)
      .pipe(
        catchError(err => {
          this.isProcessing = false;
          console.error(err);
          this._toastService.error('Ups!', 'Error al crear la cuenta. Por favor, intenta nuevamente.');
          return EMPTY;
        })
      )
      .subscribe(response => {
        userData.id = response.data.user.id;
        userData.referralCode = response.data.user.referralCode;
        this._toastService.success('¡Listo!', 'Datos guardados correctamente.');
        this.saveUserDataAndNavigate(userData);
      });
  }

  // Extraer datos del formulario
  private getUserDataFromForm(): UserDataSummary {
    const userData: UserDataSummary = {
      nombre: this.form.get('firtName')?.value ?? '',
      apellido: this.form.get('lastName')?.value ?? '',
      nroDocument: this.form.get('nroDocument')?.value ?? '',
      email: this.form.get('email')?.value ?? '',
      cellphone: this.form.get('cellphone')?.value ?? '',
      typeDocument: this.form.get('typeDocument')?.value ?? 'DNI' as TypeDocument,
      isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
      password: this.form.get('password')?.value ?? '',
    }
    return userData;
  }

  // Guardar datos y navegar
  private saveUserDataAndNavigate(userData: UserDataSummary, customerId?: string) {
    if (customerId) {
      userData.customerId = customerId;
    }

    this._summaryService.setUserData(userData);
    this.isProcessing = false;

    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/' + this.nextUrl]);
    } else {
      this._router.navigate(['/registro/direccion']);
    }
  }

  // Actualizar cliente existente
  private updateExistingCustomerWithFlow(customerId: string, userData: UserDataSummary) {
    const customerRequest: EditCustomerRequest = {
      name: `${userData.nombre} ${userData.apellido}`,
      email: userData.email,
      externalId: userData.nroDocument,
      customerId: customerId,
    };

    this._flowService.editCustomer(customerRequest)
      .pipe(
        switchMap(response => {
          userData.customerId = response.customerId;

          const updateUserRequest: UpdateUserRequest = {
            first_name: userData.nombre,
            last_name: userData.apellido,
            phone: userData.cellphone,
            documentNumber: userData.nroDocument,
            documentType: userData.typeDocument,
            isSignUpAcepted: userData.isSignUpAcepted,
            email: userData.email,
          };

          return this._userService.updateUser(customerId, updateUserRequest);
        }),
        catchError(err => {
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.saveUserDataAndNavigate(userData, customerId);
        },
        error: (err) => {
          console.error(err);
          this._toastService.error('Ups!', 'Error al actualizar los datos del usuario.');
        }
      });
  }

  // Crear nuevo cliente
  private createNewCustomerWithFlow(userData: UserDataSummary) {
    const flowCustomerRequest: CreateCustomerRequest = {
      name: `${userData.nombre} ${userData.apellido}`,
      email: userData.email,
      externalId: userData.nroDocument,
    };

    this._flowService.createCustomer(flowCustomerRequest)
      .pipe(
        switchMap(response => {
          userData.customerId = response.customerId;
          this._summaryService.setUserData(userData);

          const registerRequest: RegisterUserRequest = {
            email: userData.email,
            password: userData.password ?? '',
            first_name: userData.nombre,
            last_name: userData.apellido,
            isSignUpAcepted: userData.isSignUpAcepted ?? false,
            documentNumber: userData.nroDocument,
            documentType: userData.typeDocument,
            flowCustomerId: response.customerId,
            phone: userData.cellphone,
          };

          if (userData.id) {
            return EMPTY;
          }
          return this._authService.register(registerRequest);
        }),
        catchError(err => {
          this.handleCustomerError(err);
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          this.isProcessing = false;
          this.navigateToNextStep();
        },
        error: (err) => {
          this.isProcessing = false;
          console.error(err);
          this._toastService.error('Ups!', 'Error al crear la cuenta en la plataforma. Por favor, intenta nuevamente.');
        }
      });
  }

  // Manejar errores de cliente
  private handleCustomerError(err: any) {
    this.isProcessing = false;

    if (err.error?.code === 501) {
      if (err.error.message.includes('externalId')) {
        this._toastService.error('Ups!', 'Ya existe una cuenta con el N° de documento ingresado.');
        this.form.get('nroDocument')?.setErrors({ nroDocumentExists: true });
      } else if (err.error.message.includes('email')) {
        this._toastService.error('Ups!', 'El correo ingresado no existe o no es válido.');
        this.form.get('email')?.setErrors({ emailInvalid: true });
      }
    } else {
      this._toastService.error('Ups!', 'Error al crear la cuenta. Por favor, intenta nuevamente.');
      console.error(err);
    }
  }

  // Navegar al siguiente paso
  private navigateToNextStep() {
    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/' + this.nextUrl]);
    } else {
      this._router.navigate(['/registro/direccion']);
    }
  }
}
