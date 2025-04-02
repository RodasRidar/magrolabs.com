import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { OrderSummaryItemComponent } from '../bolsa/order-summary-item/order-summary-item.component';
import { ShoppingCart, ItemShoppingCart } from '../../../../shared/models/item-cart.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TypeDocumentEnum } from '../../../signup/pages/create-account/create-account.component';
import { CommonModule } from '@angular/common';
import { debounceTime, map, Observable, switchMap, tap } from 'rxjs';
import { AddressService, PlaceAPI, Ubigeo } from '../../../../shared/services/address-service.service';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethodComponent } from '../../../../shared/ui/payment-method/payment-method.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { environment } from '../../../../../environments/env';
import { CreateCustomerRequest, FlowPaymentMethod, FlowPaymentRequest } from '../../../../shared/models/flow.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { ConfirmationStatus, SummaryEnum } from '../../../../shared/models/summary.model';
import { FlowService } from '../../../../shared/services/flow.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NavbarComponent, OrderSummaryItemComponent, ReactiveFormsModule, CommonModule, RouterLink, PaymentMethodComponent, ButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  @ViewChild('isSignUpAceptedInput') isSignUpAceptedInput!: ElementRef<HTMLInputElement>;
  paymentMethod: FlowPaymentMethod = FlowPaymentMethod.DEBIT_CREDIT_CARD;
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment;
  cartHas250Creatine = false;
  isProcessing = false;

  private _toastService = inject(ToastService);
  private _shoppingCartService = inject(ShoppingCartService);
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _flowService = inject(FlowService)

  //
  private _addressService = inject(AddressService)
  addressList: PlaceAPI[] = [];
  userAddress: PlaceAPI | null = null;

  isSearched = false;
  hideSearching = false;
  departmentEmpty = true;
  provinceEmpty = true;
  isSaving = false;
  isSearchingAddress = false;

  departmentUbigeo = '';
  provinceUbigeo = '';
  districtUbigeo = '';

  departments$: Observable<Ubigeo[]> = this._addressService.getDepartments();
  provinces$: Observable<Ubigeo[]> = this._addressService.getProvinces(this.departmentUbigeo);
  districts$: Observable<Ubigeo[]> = this._addressService.getDistricts(this.provinceUbigeo);
  //

  shoppingCart: ShoppingCart = <ShoppingCart>{};
  form = this._formBuilder.group({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^9[0-9]{8}$/)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9A-Za-z]{8,12}$/)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocumentEnum>'1', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.minLength(8)]),
    searchAddress: this._formBuilder.nonNullable.control('', [Validators.minLength(3)]),
    streetAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(70), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,70}$/)]),
    department: this._formBuilder.nonNullable.control('', [Validators.required]),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    number: this._formBuilder.nonNullable.control('', [Validators.minLength(1), Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9/]{1,6}$/)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]),
    isSignUpAcepted: this._formBuilder.nonNullable.control(false, []),
  });
  buttonName = 'Pagar →';

  ngOnInit() {

    this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
      if (shoppingCart && shoppingCart.items.length > 0) {
        this.shoppingCart = shoppingCart;
        this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
        this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
        if (shoppingCart.items.find(item => item.product.name === 'Creatina Monohidratada 250 gr')) {
          this.cartHas250Creatine = true;
        }
      }
      else {
        this._router.navigate(['/bolsa']);
      }
    })

    this.form.get('searchAddress')?.valueChanges.pipe(
      debounceTime(300),
      tap(() => this.isSearchingAddress = true),
      switchMap(value => this._addressService.searchAddress(value))
    ).subscribe((results: PlaceAPI[]) => {
      this.addressList = results;
      this.isSearchingAddress = false;
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

    this.setValuesInFormFromSummary();
  }

  quantityValueChanged(value: number, product: ItemShoppingCart) {
    product.quantity = value
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
  }

  deleteItem(product: ItemShoppingCart) {
    this.shoppingCart.items = this.shoppingCart.items.filter(item => item.product.id !== product.product.id);
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
    if (this.shoppingCart.totalItems == 0) {
      this._router.navigate(['/bolsa']);
    }
  }

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

  limitDigits(nroDigits: number, field: string): void {
    const control = this.form.get(field);
    if (control) {
      const value = control.value?.toString() || '';
      control.setValue(value.slice(0, nroDigits));
    }
  }

  selectAddress(address: PlaceAPI): void {
    this.userAddress = address;
    this.isSearched = true;
    this.hideSearching = true;
    this._addressService.getDepartments().pipe(
      map((departments) => {
        this.departmentUbigeo = this.findIdUbigeo(address.address.region, departments);
        this.provinces$ = this._addressService.getProvinces(this.departmentUbigeo);
        return this.departmentUbigeo ?? '3926';
      }),
      switchMap((departmentUbigeo) =>
        this._addressService.getProvinces(departmentUbigeo).pipe(
          map((provinces) => {
            this.provinceUbigeo = this.findIdUbigeo(address.address.city == 'Lima Metropolitana' ? 'Lima' : address.address.city ?? address.address.state ?? '', provinces);
            this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
            return this.provinceUbigeo ?? '3927';
          })
        )
      ),
      switchMap((provinceUbigeo) =>
        this._addressService.getDistricts(provinceUbigeo).pipe(
          map((districts) => {
            // console.log(districts)
            // console.log(provinceUbigeo)
            this.districtUbigeo = this.findIdUbigeo(address.address.suburb, districts);
            return this.districtUbigeo ?? '3949';
          })
        )
      )
    ).subscribe(() => {
      this.form.get('streetAddress')?.setValue(address.address.road ?? '');
      this.form.get('postalCode')?.setValue(address.address.postcode ?? '');
      this.form.get('department')?.setValue(this.departmentUbigeo);
      this.form.get('province')?.setValue(this.provinceUbigeo);
      this.form.get('district')?.setValue(this.districtUbigeo);
      this.form.get('number')?.setValue(address.address.house_number ?? 'S/N');
      this.form.get('district')?.enable();
      this.form.get('province')?.enable();
    });
  }

  selectDepartment(event: any): void {
    this.districts$ = this._addressService.getDistricts('');
    this.departmentUbigeo = event.target.value;
    this.provinces$ = this._addressService.getProvinces(this.departmentUbigeo);
    this.form.get('province')?.enable();
    this.form.get('district')?.disable();
  }

  selectProvince(event: any): void {
    this.provinceUbigeo = event.target.value;
    this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
    this.form.get('district')?.enable();
  }

  findIdUbigeo(name: string | undefined, list: Ubigeo[]): string {
    if (!name) {
      return '';
    }
    return list.find((x) => x.nombre_ubigeo === name)?.id_ubigeo || '';
  }

  selectPaymentMethod(paymentMethod: FlowPaymentMethod) {
    this.paymentMethod = paymentMethod;
    if (paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.buttonName = 'Continuar →';

      const checkControl = this.form.get('isSignUpAcepted');
      checkControl?.addValidators(Validators.required);
      checkControl?.updateValueAndValidity();

    } else {
      this.buttonName = 'Pagar →';

      const checkControl = this.form.get('isSignUpAcepted');
      checkControl?.clearValidators();
      checkControl?.updateValueAndValidity();
    }
  }

  nextStep() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.hideSearching = true;
      return;
    }

    this.isProcessing = true;

    if (this.paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.processGoToSubscription();
      return;
    }
    const status = this.form.get('isSignUpAcepted')?.value ?? false ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
    localStorage.setItem('status', status.toString());

    const paymentRequest: FlowPaymentRequest = {
      amount: this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart),
      currency: 'PEN',
      commerceOrder: '#0000013',
      subject: 'Creatina Monohidratada Magrolabs de 250g',
      email: this.form.get('email')?.value ?? '',
      paymentMethod: this.paymentMethod,
      urlReturn: this.ENV.flowUrlReturn,
      urlConfirmation: this.ENV.flowUrlConfirmation + '?status=' + Number(status).toString()
    }

    this._flowService.createPayment(paymentRequest).subscribe({
      next: (response) => {
        this._summaryService.setUserData({
          nombre: this.form.get('firtName')?.value ?? '',
          apellido: this.form.get('lastName')?.value ?? '',
          dni: this.form.get('nroDocument')?.value ?? '',
          email: this.form.get('email')?.value ?? '',
          cellphone: this.form.get('cellphone')?.value ?? '',
          typeDocument: this.form.get('typeDocument')?.value ?? TypeDocumentEnum.DNI,
          password: this.form.get('password')?.value ?? '',
          customerId:'',
          isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
        });

        this._summaryService.setChoosePlan({
          selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
          descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
          descriptionTwo: 'Ganas S/' + this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
          descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
          descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
          quantity: 1
        })

        this._summaryService.setAddress(
          {
            tipoVia: '',
            nombreVia: this.form.get('streetAddress')?.value ?? '',
            numero: this.form.get('number')?.value ?? '',
            codigoPostal: this.form.get('postalCode')?.value ?? '',
            distrito: this.form.get('district')?.value ?? '',
            provincia: this.form.get('province')?.value ?? '',
            department: this.form.get('department')?.value ?? '',
            reference: this.form.get('reference')?.value ?? '',
          }
        );
        this.isProcessing = false;
        window.location.href = response.url + '?token=' + response.token;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error creating payment: ', err);
        this._toastService.error('Ups!', 'Error al redirigir al pago. Por favor, intenta nuevamente.');
      },
      complete: () => {
        this.isProcessing = false;
      }
    })
  }

  private processGoToSubscription() {

    //Validar si el checkbox de registro esta chequeado
    if (!this.form.get('isSignUpAcepted')?.value) {
      const control = this.form.get('isSignUpAcepted');
      control?.setErrors({ required: true });
      setTimeout(() => {
        this.isSignUpAceptedInput.nativeElement.focus();
        this.isSignUpAceptedInput.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      this.isProcessing = false;
      return;
    }

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
            customerId: response.customerId,
            isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
          });

          this._summaryService.setChoosePlan({
            selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
            descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
            descriptionTwo: 'Ganas S/' + this.ENV.creditoRegaloPorCompraMes + ' de crédito.',
            descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (gratis) 🎁',
            descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
            quantity: 1
          })

          this._summaryService.setAddress(
            {
              tipoVia: '',
              nombreVia: this.form.get('streetAddress')?.value ?? '',
              numero: this.form.get('number')?.value ?? '',
              codigoPostal: this.form.get('postalCode')?.value ?? '',
              distrito: this.form.get('district')?.value ?? '',
              provincia: this.form.get('province')?.value ?? '',
              department: this.form.get('department')?.value ?? '',
              reference: this.form.get('reference')?.value ?? '',
            }
          );
          this.isProcessing = false;
          this._router.navigate([`/registro/verificacion`]);
        },
        error: (err) => {
          this.isProcessing = false;
          if (err.error.code === 501 && err.error.message.includes('externalId')) {
            this._toastService.error('Ups!', 'Ya existe una cuenta con el N° de documento ingresado.');
            const control = this.form.get('nroDocument');
            control?.setErrors({ nroDocumentExists: true });
          }
          if (err.error.code === 501 && err.error.message.includes('email')) {
            this._toastService.error('Ups!', 'El correo ingresado no existe o no es válido.');
            const control = this.form.get('email');
            control?.setErrors({ emailInvalid: true });
          }
          else {
            this._toastService.error('Ups!', 'Error al crear la cuenta. Por favor, intenta nuevamente.');
            console.log(err);
          }
        }
      });
  }

  private setValuesInFormFromSummary() {
    let summary = this._summaryService.getSummary()
    this.form.get('firtName')?.setValue(summary?.userData?.nombre ?? '');
    this.form.get('lastName')?.setValue(summary?.userData?.apellido ?? '');
    this.form.get('cellphone')?.setValue(summary?.userData?.cellphone ?? '');
    this.form.get('nroDocument')?.setValue(summary?.userData?.dni ?? '');
    this.form.get('typeDocument')?.setValue(summary?.userData?.typeDocument ?? TypeDocumentEnum.DNI);
    this.form.get('email')?.setValue(summary?.userData?.email ?? '');
    this.form.get('password')?.setValue(summary?.userData?.password ?? '');
    this.form.get('isSignUpAcepted')?.setValue(summary?.userData?.isSignUpAcepted ?? false);

    if (summary && summary?.address?.nombreVia) {
      this.hideSearching = true;
      this.isSearched = true;

      this._addressService.getDepartments().pipe(
        map((departments) => {
          this.departmentUbigeo = summary.address?.department ?? '';
          this.provinces$ = this._addressService.getProvinces(this.departmentUbigeo);
          return this.departmentUbigeo ?? '3926';
        }),
        switchMap((departmentUbigeo) =>
          this._addressService.getProvinces(departmentUbigeo).pipe(
            map((provinces) => {
              this.provinceUbigeo = summary.address?.provincia ?? '';
              this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
              return this.provinceUbigeo ?? '3927';
            })
          )
        ),
        switchMap((provinceUbigeo) =>
          this._addressService.getDistricts(provinceUbigeo).pipe(
            map((districts) => {
              this.districtUbigeo = summary.address?.distrito ?? '';
              // console.log(this.districtUbigeo)
              return this.districtUbigeo ?? '3949';
            })
          )
        )
      ).subscribe(() => {
        this.form.get('streetAddress')?.setValue(summary.address?.nombreVia ?? '');
        this.form.get('number')?.setValue(summary.address?.numero ?? 'S/N');
        this.form.get('postalCode')?.setValue(summary.address?.codigoPostal ?? '');
        this.form.get('district')?.setValue(summary.address?.distrito ?? '');
        this.form.get('province')?.setValue(summary.address?.provincia ?? '');
        this.form.get('department')?.setValue(summary.address?.department ?? '');
        this.form.get('reference')?.setValue(summary.address?.reference ?? '');
        this.form.get('district')?.enable();
        this.form.get('province')?.enable();
      });
    }

  }
}


//Si el flag isSignUpAcepted es true, se debe registrar el usuario en Flow tambien y validar sus datos,
//Si una vez creado el usuario le da a pagar se le redirige pero vuelve y le da de nuevo a pagar, 
// ya no se podra crear sino editar