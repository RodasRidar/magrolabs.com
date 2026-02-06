import { AfterViewInit, Component, effect, ElementRef, HostListener, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { OrderSummaryItemComponent } from '../bolsa/order-summary-item/order-summary-item.component';
import { ShoppingCart, ItemShoppingCart } from '../../../../shared/models/item-cart.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, map, Observable, of, Subject, Subscription, switchMap, tap } from 'rxjs';
import { AddressService, PlaceAPI, Ubigeo } from '../../../../shared/services/address-service.service';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethodComponent } from '../../../../shared/ui/payment-method/payment-method.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { environment } from '../../../../../environments/env';
import { CreateCustomerRequest, EditCustomerRequest, FlowPaymentMethod, FlowPaymentRequest } from '../../../../shared/models/flow.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { AddressSummary, ConfirmationStatus, Summary, SummaryEnum, UserDataSummary } from '../../../../shared/models/summary.model';
import { FlowService } from '../../../../shared/services/flow.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { RegisterUserRequest, TypeDocument } from '../../../../shared/interfaces/auth.interfaces';
import { UserService } from '../../../../shared/services/user.service';
import { OrderService } from '../../../../shared/services/order.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { AddressApiService } from '../../../../shared/services/address-api.service';
import { CreateAddressRequest } from '../../../../shared/interfaces/address.interfaces';
import { CreateOrderRequest, PaymentMethod, UpdateOrderDetailsRequest } from '../../../../shared/interfaces/order.interfaces';
import { UpdateUserRequest } from '../../../../shared/interfaces/user.interfaces';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NavbarComponent, OrderSummaryItemComponent, ReactiveFormsModule, CommonModule, RouterLink, PaymentMethodComponent, ButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnDestroy, AfterViewInit {
  @ViewChild('isSignUpAceptedInput') isSignUpAceptedInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('nroDocInput') nroDocInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cellphoneInput') cellphoneInput!: ElementRef<HTMLInputElement>;
  paymentMethod: FlowPaymentMethod = FlowPaymentMethod.DEBIT_CREDIT_CARD;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
    let summary = this._summaryService.getSummary();
    // Validar si la dirección está fuera de Lima Metropolitana
    this.validateAddressLocation(summary?.address!);
    }
  }
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment;
  cartHas250Creatine = signal(false);
  isProcessing =  signal(false);
  isOutsideLimaMetropolitana = signal(false);
  precioEnvioFueraLimaMetropolitana = signal(this.ENV.precioEnvioFueraLimaMetropolitana);
  allowNavigation = signal(false); // Señal para permitir navegación cuando el pago se procesa correctamente

  private platformId = inject(PLATFORM_ID);
  private _toastService = inject(ToastService);
  private _shoppingCartService = inject(ShoppingCartService);
  private _tiktokAnalytics = inject(TiktokAnalyticsService);
  private _metaAnalytics = inject(MetaAnalyticsService);
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _flowService = inject(FlowService)
  private _userService = inject(UserService)
  private _orderService = inject(OrderService)
  private _authService = inject(AuthService)
  private _addressApiService = inject(AddressApiService)
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

  // Subjects para validación en tiempo real
  private emailSubject = new Subject<string>();
  private phoneSubject = new Subject<string>();
  private documentSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  shoppingCart: ShoppingCart = <ShoppingCart>{};
  form = this._formBuilder.group({
    firtName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    lastName: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(100), Validators.pattern(/^([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+)(n+([A-Za-zÑñÁáÉéÍíÓóÚú ]+['-]{0,1}[A-Za-zÑñÁáÉéÍíÓóÚú ]+))*$/)]),
    cellphone: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern(/^9[0-9]{8}$/)]),
    nroDocument: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9A-Za-z]{8,12}$/)]),
    typeDocument: this._formBuilder.nonNullable.control(<TypeDocument>'DNI', [Validators.required]),
    email: this._formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    searchAddress: this._formBuilder.nonNullable.control('', [Validators.minLength(3)]),
    streetAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(150), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,70}$/)]),
    department: this._formBuilder.nonNullable.control('', [Validators.required]),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    number: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern(/^[0-9A-Za-zÑñ\/\.,\-\s]{1,20}$/)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]),
    isSignUpAcepted: this._formBuilder.nonNullable.control(true, []),
    termsAccepted: this._formBuilder.nonNullable.control(false, [Validators.requiredTrue]),
  });
  buttonName = 'Pagar →';

  constructor() {
    // Effect para deshabilitar/habilitar el formulario cuando isProcessing cambia
    effect(() => {
      if (this.isProcessing()) {
        this.form.disable();
      } else {
        this.form.enable();
        
        // Re-aplicar el estado de disable específico para province y district
        // si no hay departamento seleccionado
        if (!this.departmentUbigeo) {
          this.form.get('province')?.disable();
        }
        if (!this.provinceUbigeo) {
          this.form.get('district')?.disable();
        }
      }
    });
  }

  ngOnInit() {
    this.trackInitiateCheckout();

    this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
      if (shoppingCart && shoppingCart.items.length > 0) {
        this.shoppingCart = shoppingCart;
        this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
        this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
        if (shoppingCart.items.find(item => item.product.name === 'Creatina Monohidratada 250 gr')) {
          this.cartHas250Creatine.set(true);
        }
      }
      else {
        this._router.navigate(['/bolsa']);
      }
    })

    this.form.get('searchAddress')?.valueChanges.pipe(
      debounceTime(300),
      filter(value => !!value && value.trim().length >= 3), // Solo buscar si hay al menos 3 caracteres
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
          passwordControl?.addValidators(Validators.minLength(8));
        }

        passwordControl?.updateValueAndValidity();
      });
    }
    // Configurar validación en tiempo real para email
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

    this.setValuesInFormFromSummary();

    this.form.get('district')?.valueChanges.subscribe(() => {
      this.validateAddressLocation({
        tipoVia: this.form.get('tipoVia')?.value ?? '',
        nombreVia: this.form.get('nombreVia')?.value ?? '',
        codigoPostal: this.form.get('codigoPostal')?.value ?? '',
        department: this.form.get('department')?.value ?? '',
        distrito: this.form.get('district')?.value ?? '',
        provincia: this.form.get('province')?.value ?? ''
      } as AddressSummary);
      });
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Solo mostrar la alerta si no se ha completado el pago exitosamente
    if (!this.allowNavigation() && !this.isProcessing()) {
      $event.preventDefault();
      // En navegadores modernos, el mensaje personalizado puede no mostrarse,
      // pero el navegador mostrará su propio mensaje de confirmación
      $event.returnValue = `¡Espera! Completa tu compra para obtener tu ${environment.campanaPrimeraCreatina.textos.heroOferta}.`;
    }
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

  selectDistrict(event: any): void {
    this.districtUbigeo = event.target.value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Validar email con el servidor
  private validateEmailWithServer(email: string): void {
    this.isProcessing.set(true);
    const control = this.form.get('email');
    if (control && !control.hasError('email')) {
      this._userService.validateEmail(email).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
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
    this.isProcessing.set(true);
    const control = this.form.get('cellphone');
    if (control && !control.hasError('pattern')) {
      this._userService.validatePhone(phone).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ cellphoneExists: true });
        }
      });
    }
  }

  private validateDocumentWithServer(document: string): void {
    this.isProcessing.set(true);
    const control = this.form.get('nroDocument');
    const typeDoc = this.form.get('typeDocument')?.value;

    if (control && !control.hasError('pattern') && typeDoc) {
      this._userService.validateDocument(document, typeDoc).pipe(
        catchError(() => EMPTY),
        finalize(() => this.isProcessing.set(false))
      ).subscribe((response: { data: { exists: boolean } }) => {
        if (response.data.exists) {
          control.setErrors({ nroDocumentExists: true });
        } else {
          localStorage.setItem('isExternalIdExists', 'false');
        }
      });
    }
  }

  quantityValueChanged(value: number, product: ItemShoppingCart) {
    product.quantity = value
    this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
    this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
    this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
    this._shoppingCartService.setShoppingCart(this.shoppingCart);
    if(this.isOutsideLimaMetropolitana()){
    if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 1) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana);
    if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 4) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *2);
    if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 10) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *3);
    if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 16) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *4);

    this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart) + this.precioEnvioFueraLimaMetropolitana();
    }
    else{
      this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    }
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

  hasExistEmail() {
    const control = this.form.get('email');
    return control?.hasError('emailExists') && control.dirty;
  }

  hasInvalidEmail() {
    const control = this.form.get('email');
    return (control?.hasError('emailInvalid') && control.dirty) ||
      (isPlatformBrowser(this.platformId) && localStorage.getItem('isEmailInvalid') === 'true');
  }

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
      this.form.get('number')?.setValue(address.address.house_number ?? '');
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
    
    // Tracking Meta Analytics - AddPaymentInfo cuando se selecciona método de pago
    this._metaAnalytics.trackAddPaymentInfo({
      value: this.shoppingCart.total || 0,
      currency: 'PEN',
      content_category: 'checkout_payment_method'
    });

    this._tiktokAnalytics.trackCustomEvent('AddPaymentInfo', {
      currency: 'PEN',
      value: this.shoppingCart.total || 0
    });
    
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

    this.isProcessing.set(true);

    if (this.paymentMethod === FlowPaymentMethod.RECURRENT_PAYMENT) {
      this.handleRecurrentPaymentOption();
      return;
    }

    const status = this.form.get('isSignUpAcepted')?.value ?? false
      ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION
      : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
    localStorage.setItem('status', status.toString());

    this.processPayment();
  }

  private processPayment(): void {
    const userId = this._summaryService.getSummary()?.userData?.id;

    if (!userId) {
      this.createCustomerAndCreatePayment();
    } else {
      this.updateCustomerAndCreatePayment(userId);
    }
  }

  private createCustomerAndCreatePayment(): void {
    this.saveUserDataForOnePurchase();
    const userRequest = this.createUserRequest();

    //Crear usuario
    this._authService.register(userRequest).pipe(
      tap((response) => {
        // Actualizar userData inmediatamente después de crear el usuario
        const userData = this._summaryService.getSummary()?.userData;
        if (userData) {
          this._summaryService.setUserData({
            ...userData,
            id: response.data.user.id,
            referralCode: response.data.user.referralCode
          });
        }
      }),
      //Crear direccion
      switchMap((response) => {
        return this._addressApiService.createAddress(this.createAddressRequest()).pipe(
          tap(addressResponse => {
            // Actualizar addressData inmediatamente después de crear la dirección
            const addressData = this._summaryService.getSummary()?.address;
            if (addressData) {
              this._summaryService.setAddress({
                ...addressData,
                id: addressResponse.data.address.id,
              });
            }
          })
        );
      }),
      //Actualizar direccion de usuario
      switchMap(addressResponse => {
        const addressId = addressResponse.data.address.id;
        const userId = this._summaryService.getSummary()?.userData?.id ?? '';
        return this._userService.updateUser(userId, { address_id: addressId });
      }),
      //Crear Orden de compra
      switchMap(() => {
        return this._orderService.createOrder(this.createOrderRequest()).pipe(
          tap(orderResponse => {
            // Actualizar userData con el orderId
            const userData = this._summaryService.getSummary()?.userData;
            if (userData) {
              this._summaryService.setUserData({
                ...userData,
                orderId: orderResponse.data.order.id,
              });
            }
          })
        );
      }),
      //Crear pago en flow
      switchMap((orderResponse) => {
        let createPaymentRequest = this.createPaymentRequest();
        createPaymentRequest.commerceOrder = orderResponse.data.order.id;
        return this._flowService.createPayment(createPaymentRequest);
      }),
      finalize(() => {
        this.isProcessing.set(false);
      })
    ).subscribe({
      next: (paymentResponse) => {
        this.allowNavigation.set(true); // Permitir navegación al procesar el pago exitosamente
        this._toastService.success('¡Listo!', 'Datos guardados correctamente.');
        window.location.href = paymentResponse.url + '?token=' + paymentResponse.token;
      },
      error: (err) => {
        console.error('Error creating payment: ', err);
        this._toastService.error('Ups!', 'Error al generar el pago. Por favor, intenta nuevamente.');
        this.handleCustomerError(err);
      }
    });
  }

  private createOrderRequest(): CreateOrderRequest {
    let paymentMethod = PaymentMethod.CREDIT_CARD;
    switch (this.paymentMethod) {
      case FlowPaymentMethod.BANK_TRANSFER:
        paymentMethod = PaymentMethod.BANK_TRANSFER;
        break;
      case FlowPaymentMethod.PAGO_EFECTIVO:
        paymentMethod = PaymentMethod.PAGO_EFECTIVO;
        break;
      case FlowPaymentMethod.YAPE:
        paymentMethod = PaymentMethod.YAPE;
        break;
      default:
        paymentMethod = PaymentMethod.CREDIT_CARD;
    }
    //TODO: Cambiar el id del producto de creatina 250gr algo dinamico
    return {
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
      payment_method: paymentMethod,
      isLoyaltyWebShow: false,
      orderItems: [
        {
          product_id: '00000009-50eb-4ac3-aa94-1b64fbf32b9c', // ID del producto de creatina 250gr
          quantity: this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart)
        }
      ],
      discount: 0,
      shipping_cost: this.isOutsideLimaMetropolitana() ? this.precioEnvioFueraLimaMetropolitana() : 0
    };
  }

  private createAddressRequest(): CreateAddressRequest {
    const addressSummary = {
      tipoVia: '',
      nombreVia: this.form.get('streetAddress')?.value ?? '',
      numero: this.form.get('number')?.value ?? '',
      codigoPostal: this.form.get('postalCode')?.value ?? '',
      distrito: this.form.get('district')?.value ?? '',
      provincia: this.form.get('province')?.value ?? '',
      department: this.form.get('department')?.value ?? '',
      reference: this.form.get('reference')?.value ?? '',
    };

    const department = this._addressService.getListDepartments().find((x) => x.id_ubigeo == this.departmentUbigeo);
    const province = this._addressService.getListProvinces(this.departmentUbigeo).find((x) => x.id_ubigeo == this.provinceUbigeo);
    const district = this._addressService.getListDistricts(this.provinceUbigeo).find((x) => x.id_ubigeo == this.districtUbigeo);

    const addressRequest: CreateAddressRequest = {
      avenue: addressSummary.nombreVia,
      department: department?.nombre_ubigeo ?? '',
      department_ubigeo: this.departmentUbigeo,
      province: province?.nombre_ubigeo ?? '',
      province_ubigeo: this.provinceUbigeo,
      district: district?.nombre_ubigeo ?? '',
      district_ubigeo: this.districtUbigeo,
    };
    if (addressSummary.reference !== '') {
      addressRequest.reference = addressSummary.reference;
    }
    if (addressSummary.numero !== '') {
      addressRequest.number = addressSummary.numero;
    }
    if (addressSummary.codigoPostal !== '') {
      addressRequest.postalcode = addressSummary.codigoPostal;
    }
    return addressRequest;
  }

  private createUserRequest(): RegisterUserRequest {
    const registerRequest: RegisterUserRequest = {
      email: this.form.get('email')?.value ?? '',
      first_name: this.form.get('firtName')?.value ?? '',
      last_name: this.form.get('lastName')?.value ?? '',
      isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
      documentNumber: this.form.get('nroDocument')?.value ?? '',
      documentType: this.form.get('typeDocument')?.value ?? 'DNI',
      phone: this.form.get('cellphone')?.value ?? '',
    };

    if (this.form.get('password')?.value && this.form.get('password')!.value.length > 0) {
      registerRequest.password = this.form.get('password')?.value;
    }

    return registerRequest;
  }

  private updateCustomerAndCreatePayment(userId: string): void {
    this.saveUserDataForOnePurchase();
    const updateUserRequest: UpdateUserRequest = {
      first_name: this.form.get('firtName')?.value ?? '',
      last_name: this.form.get('lastName')?.value ?? '',
      phone: this.form.get('cellphone')?.value ?? '',
      documentNumber: this.form.get('nroDocument')?.value ?? '',
      documentType: this.form.get('typeDocument')?.value ?? 'DNI',
      email: this.form.get('email')?.value ?? '',
      isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
    }

    //Actualizar usuario
    this._userService.updateUser(userId, updateUserRequest).pipe(
      tap((response) => {
        // Actualizar userData inmediatamente después de actualizar el usuario
        const userData = this._summaryService.getSummary()?.userData;
        if (userData) {
          this._summaryService.setUserData({
            ...userData,
            id: response.id,
          });
        }
      }),
      //Crear o actualizar direccion
      switchMap(() => {
        const addressId = this._summaryService.getSummary()?.address?.id;
        
        if (addressId) {
          // Si existe ID, actualizar dirección existente
          return this._addressApiService.updateAddress(
            addressId,
            this.createAddressRequest()
          ).pipe(
            tap(response => {
              // Actualizar addressData inmediatamente después de actualizar la dirección
              const addressData = this._summaryService.getSummary()?.address;
              if (addressData) {
                this._summaryService.setAddress({
                  ...addressData,
                  id: response.data.address.id,
                });
              }
            })
          );
        } else {
          // Si no existe ID, crear nueva dirección
          return this._addressApiService.createAddress(this.createAddressRequest()).pipe(
            tap(addressResponse => {
              // Actualizar addressData inmediatamente después de crear la dirección
              const addressData = this._summaryService.getSummary()?.address;
              if (addressData) {
                this._summaryService.setAddress({
                  ...addressData,
                  id: addressResponse.data.address.id,
                });
              }
            })
          );
        }
      }),
      //Actualizar o crear orden
      switchMap(() => {
        const orderId = this._summaryService.getSummary()?.userData?.orderId;
        
        if (orderId) {
          // Si existe orderId, actualizar orden existente
          const orderDetails = this.createOrderDetailsWithPaymentMethod();
          return this._orderService.updateOrderDetails(orderId, orderDetails).pipe(
            tap(orderResponse => {
              // Actualizar userData con el orderId
              const userData = this._summaryService.getSummary()?.userData;
              if (userData) {
                this._summaryService.setUserData({
                  ...userData,
                  orderId: orderResponse.data.order.id,
                });
              }
            })
          );
        } else {
          // Si no existe orderId, crear nueva orden
          return this._orderService.createOrder(this.createOrderRequest()).pipe(
            tap(orderResponse => {
              // Actualizar userData con el orderId
              const userData = this._summaryService.getSummary()?.userData;
              if (userData) {
                this._summaryService.setUserData({
                  ...userData,
                  orderId: orderResponse.data.order.id,
                });
              }
            })
          );
        }
      }),
      //Crear pago en flow
      switchMap((orderResponse) => {
        let createPaymentRequest = this.createPaymentRequest();
        createPaymentRequest.commerceOrder = orderResponse.data.order.id;
        return this._flowService.createPayment(createPaymentRequest);
      }),
      finalize(() => {
        this.isProcessing.set(false);
      })
    ).subscribe({
      next: (paymentResponse) => {
        this.allowNavigation.set(true); // Permitir navegación al procesar el pago exitosamente
        console.log('Summary', this._summaryService.getSummary())
        this._toastService.success('¡Listo!', 'Datos actualizados correctamente.');
        window.location.href = paymentResponse.url + '?token=' + paymentResponse.token;
      },
      error: (err) => {
        console.error('Error creating payment: ', err);
        this._toastService.error('Ups!', 'Error al generar el pago. Por favor, intenta nuevamente.');
        this.handleCustomerError(err);
      }
    });
  }

  private handleCustomerError(err: any): void {
    if (err.error?.code === 501) {
      if (err.error.message.includes('externalId')) {
        this._toastService.error('Ups!', 'Ya existe una cuenta con el N° de documento ingresado.');
        this.focusAndErrorInput(this.nroDocInput, 'nroDocument');
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isExternalIdExists', 'true');
        }
      } else if (err.error.message.includes('email')) {
        this._toastService.error('Ups!', 'El correo ingresado no existe o no es válido.');
        this.focusAndErrorInput(this.emailInput, 'email');
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('isEmailInvalid', 'true');
        }
      } else if (err.error.message.includes('phone')) {
        this._toastService.error('Ups!', 'El número de teléfono ya está registrado.');
        this.focusAndErrorInput(this.cellphoneInput, 'cellphone');
      }
    } else {
      this._toastService.error('Ups!', 'Error al procesar la solicitud. Por favor, intenta nuevamente.');
      console.error('Error:', err);
    }
  }

  private setValuesInFormFromSummary() {
    let summary = this._summaryService.getSummary()
    this.form.get('firtName')?.setValue(summary?.userData?.nombre ?? '');
    this.form.get('lastName')?.setValue(summary?.userData?.apellido ?? '');
    this.form.get('cellphone')?.setValue(summary?.userData?.cellphone ?? '');
    this.form.get('nroDocument')?.setValue(summary?.userData?.nroDocument ?? '');
    this.form.get('typeDocument')?.setValue(summary?.userData?.typeDocument ?? 'DNI');
    this.form.get('email')?.setValue(summary?.userData?.email ?? '');
    this.form.get('password')?.setValue(summary?.userData?.password ?? '');
    this.form.get('isSignUpAcepted')?.setValue(summary?.userData?.isSignUpAcepted ?? true);
    this.form.get('termsAccepted')?.setValue(summary?.userData?.isTermsAccepted ?? false);

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
        this.form.get('number')?.setValue(summary.address?.numero ?? '');
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

  private focusAndErrorInput(input: ElementRef<HTMLInputElement>, controlName: string) {
    const control = this.form.get(controlName);
    if (controlName === 'nroDocument') {
      control?.setErrors({ nroDocumentExists: true });
    } else if (controlName === 'email') {
      control?.setErrors({ emailInvalid: true });
    } else if (controlName === 'cellphone') {
      control?.setErrors({ cellphoneExists: true });
    } else {
      control?.setErrors({ required: true });
    }
    setTimeout(() => {
      input.nativeElement.focus();
      input.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  private handleRecurrentPaymentOption(): void {
    const totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);

    if (totalItems > 1) {
      this._toastService.warning('Lo sentimos!', 'Solo puedes suscribirte a un producto por vez.');
      this.isProcessing.set(false);
      return;
    }
    // Validar si el checkbox de registro está marcado y la contraseña está completa
    if (this.form.get('isSignUpAcepted')?.value && this.form.get('password')?.value) {
      const userRequest = this.createUserRequest();

      const userData = this._summaryService.getSummary()?.userData;
      if (userData?.id) {
        this.allowNavigation.set(true); // Permitir navegación al continuar con usuario existente
        this._summaryService.setChoosePlan({
          selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
          descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
          descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
          descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (prueba)',
          descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
          quantity: 1
        });
        this._router.navigate([`/registro/verificacion`]);
      }
      else {
        //Crear usuario
        this._authService.register(userRequest).pipe(
          tap((response) => {
            // Actualizar userData inmediatamente después de crear el usuario
            const userData = this._summaryService.getSummary()?.userData;
            if (userData) {
              this._summaryService.setUserData({
                ...userData,
                id: response.data.user.id,
                referralCode: response.data.user.referralCode
              });
            }
          }),
          //Crear direccion
          switchMap((response) => {
            return this._addressApiService.createAddress(this.createAddressRequest()).pipe(
              tap(addressResponse => {
                // Actualizar addressData inmediatamente después de crear la dirección
                const addressData = this._summaryService.getSummary()?.address;
                if (addressData) {
                  this._summaryService.setAddress({
                    ...addressData,
                    id: addressResponse.data.address.id,
                  });
                }
              })
            );
          }),
          //Actualizar direccion de usuario
          switchMap(addressResponse => {
            const addressId = addressResponse.data.address.id;
            const userId = this._summaryService.getSummary()?.userData?.id ?? '';
            return this._userService.updateUser(userId, { address_id: addressId });
          }),
          finalize(() => {
            this.isProcessing.set(false);
          })
        ).subscribe({
          next: () => {
            this.allowNavigation.set(true); // Permitir navegación al guardar los datos exitosamente
            this._summaryService.setChoosePlan({
              selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
              descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
              descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
              descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (prueba)',
              descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
              quantity: 1
            });
            this._toastService.success('¡Listo!', 'Datos guardados correctamente.');
            this._router.navigate([`/registro/verificacion`]);
          },
          error: (err) => {
            console.error('Error creating payment: ', err);
            this._toastService.error('Ups!', 'Error al generar el pago. Por favor, intenta nuevamente.');
            this.handleCustomerError(err);
          }
        });
      }

    }
    else {
      this.isProcessing.set(false);
      localStorage.setItem('passwordSignal', 'true');
      this._toastService.warning('Ups!', 'Necesitas completar la contraseña para suscribirte.');
      this.focusAndErrorInput(this.isSignUpAceptedInput, 'isSignUpAcepted');
    }
  }

  private createPaymentRequest(): FlowPaymentRequest {
    const status = this.form.get('isSignUpAcepted')?.value ?? false
      ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION
      : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;

    return {
      amount: localStorage.getItem('TEST-PROD-TWO-SOLES') == 'TEST-PROD-TWO-SOLES' ? 2 : this.shoppingCart.total,
      currency: 'PEN',
      commerceOrder: '',
      subject: this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) + ' x Creatina Monohidratada Magrolabs de 250g.',
      email: this.form.get('email')?.value ?? '',
      paymentMethod: this.paymentMethod,
      urlReturn: this.ENV.flowUrlReturn + '?status=' + Number(status).toString(),
      urlConfirmation: this.ENV.flowUrlConfirmation
    };
  }

  private createCustomerRequest(): CreateCustomerRequest {
    return {
      name: this.form.get('firtName')?.value + ' ' + this.form.get('lastName')?.value,
      email: this.form.get('email')?.value ?? '',
      externalId: this.form.get('nroDocument')?.value ?? '',
    };
  }

  private saveUserDataForSubscription(customerId: string): void {
    this._summaryService.setUserData({
      ...this._summaryService.getSummary()?.userData,
      nombre: this.form.get('firtName')?.value ?? '',
      apellido: this.form.get('lastName')?.value ?? '',
      nroDocument: this.form.get('nroDocument')?.value ?? '',
      email: this.form.get('email')?.value ?? '',
      cellphone: this.form.get('cellphone')?.value ?? '',
      typeDocument: this.form.get('typeDocument')?.value ?? 'DNI',
      password: this.form.get('password')?.value ?? '',
      customerId: customerId,
      isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
      isTermsAccepted: this.form.get('termsAccepted')?.value ?? false,
    });

    this._summaryService.setChoosePlan({
      selection: SummaryEnum.CREATINA_250G_SUBSCRIPTION,
      descriptionOne: 'Plan mensual de S/' + this.ENV.precioCreatinaSubscription + '.',
      descriptionTwo: 'Ganas ' + this.ENV.creditoRegaloPorCompraMes + ' Magropuntos 🎁 .',
      descrptionThree: 'Creatina ' + this.ENV.creatinaFreeGramos + 'gr (prueba)',
      descrptionFour: 'Periodo de prueba de ' + this.ENV.diasNormalesDePruebaOperiodoDeReflexion + ' días.',
      quantity: 1
    });

    this._summaryService.setAddress({
      ...this._summaryService.getSummary()?.address,
      tipoVia: '',
      nombreVia: this.form.get('streetAddress')?.value ?? '',
      numero: this.form.get('number')?.value ?? '',
      codigoPostal: this.form.get('postalCode')?.value ?? '',
      distrito: this.form.get('district')?.value ?? '',
      provincia: this.form.get('province')?.value ?? '',
      department: this.form.get('department')?.value ?? '',
      reference: this.form.get('reference')?.value ?? '',
    });
  }

  private saveUserDataForOnePurchase(): void {
    this._summaryService.setUserData({
      ...this._summaryService.getSummary()?.userData,
      nombre: this.form.get('firtName')?.value ?? '',
      apellido: this.form.get('lastName')?.value ?? '',
      nroDocument: this.form.get('nroDocument')?.value ?? '',
      email: this.form.get('email')?.value ?? '',
      cellphone: this.form.get('cellphone')?.value ?? '',
      typeDocument: this.form.get('typeDocument')?.value ?? 'DNI',
      password: this.form.get('password')?.value ?? '',
      isSignUpAcepted: this.form.get('isSignUpAcepted')?.value ?? false,
      isTermsAccepted: this.form.get('termsAccepted')?.value ?? false,
    });

    this._summaryService.setChoosePlan({
      selection: SummaryEnum.CREATINA_250G_ONE_PURCHASE,
      descriptionOne: 'Monohidratada 100%',
      descriptionTwo: 'Compra única de S/' + this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart) + '.',
      quantity: this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart)
    });

    this._summaryService.setAddress({
      ...this._summaryService.getSummary()?.address,
      tipoVia: '',
      nombreVia: this.form.get('streetAddress')?.value ?? '',
      numero: this.form.get('number')?.value ?? '',
      codigoPostal: this.form.get('postalCode')?.value ?? '',
      distrito: this.form.get('district')?.value ?? '',
      provincia: this.form.get('province')?.value ?? '',
      department: this.form.get('department')?.value ?? '',
      reference: this.form.get('reference')?.value ?? '',
    });
  }

  private createOrderDetailsWithPaymentMethod(): UpdateOrderDetailsRequest {
    let orderDetails: UpdateOrderDetailsRequest = {
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
    };

    switch (this.paymentMethod) {
      case FlowPaymentMethod.BANK_TRANSFER:
        orderDetails.payment_method = PaymentMethod.BANK_TRANSFER;
        break;
      case FlowPaymentMethod.PAGO_EFECTIVO:
        orderDetails.payment_method = PaymentMethod.PAGO_EFECTIVO;
        break;
      case FlowPaymentMethod.YAPE:
        orderDetails.payment_method = PaymentMethod.YAPE;
        break;
      default:
        orderDetails.payment_method = PaymentMethod.CREDIT_CARD;
    }

    return orderDetails;
  }

    /**
     * Valida si la dirección del usuario está fuera de Lima Metropolitana
     */
    private validateAddressLocation(addressSummary: AddressSummary): void {
      console.log('Validating address location:', addressSummary);
      if (addressSummary.department && addressSummary.provincia) {
        // Verificar si NO es Lima Metropolitana
        // Lima Metropolitana = departamento "Lima" y provincia "Lima"
        if (addressSummary.department?.toLowerCase() !== '3926' || addressSummary.provincia?.toLowerCase() !== '3927') {
          this.isOutsideLimaMetropolitana.set(true);
          if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 1) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana);
          if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 4) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *2);
          if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 10) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *3);
          if(this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 16) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana *4);

          this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart) + this.precioEnvioFueraLimaMetropolitana();
          
        } else {
          this.isOutsideLimaMetropolitana.set(false);
          this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        }
      }
    }          

  private trackInitiateCheckout(): void {
    // Obtener items del carrito para tracking
    if (this.shoppingCart && this.shoppingCart.items) {
      const contents = this.shoppingCart.items.map(item => ({
        content_id: item.product.id.toString(),
        content_type: 'product' as const,
        content_name: item.product.name
      }));

      this._tiktokAnalytics.trackInitiateCheckout({
        contents: contents,
        value: this.shoppingCart.total || 0,
        currency: 'PEN'
      });

      // Tracking Meta Analytics
      this._metaAnalytics.trackInitiateCheckout({
        value: this.shoppingCart.total || 0,
        currency: 'PEN',
        content_ids: this.shoppingCart.items.map(item => item.product.id.toString()),
        content_type: 'product',
        num_items: this.shoppingCart.items.length
      });
    }
  }
}