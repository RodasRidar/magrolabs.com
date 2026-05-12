import { AfterViewInit, Component, effect, ElementRef, HostListener, inject, OnDestroy, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { OrderSummaryItemComponent } from '../bolsa/order-summary-item/order-summary-item.component';
import { ShoppingCart, ItemShoppingCart } from '../../../../shared/models/item-cart.model';
import { ShoppingCartService } from '../../../../shared/services/cart-service.service';
import { TiktokAnalyticsService } from '../../../../shared/services/tiktok-analytics.service';
import { MetaAnalyticsService } from '../../../../shared/services/meta-analytics.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, filter, finalize, map, Observable, of, Subject, Subscription, switchMap, take, tap } from 'rxjs';
import { AddressService, PlaceAPI, Ubigeo } from '../../../../shared/services/address-service.service';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethodComponent, PaymentMethodSelection, EnrolledCardInfo, PaymentSelection } from '../../../../shared/ui/payment-method/payment-method.component';
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
import { CreateOrderRequest, PaymentMethod } from '../../../../shared/interfaces/order.interfaces';
import { CheckoutRequest } from '../../../../shared/interfaces/checkout.interfaces';
import { CheckoutService } from '../../../../shared/services/checkout.service';
import { CouponService } from '../../../../shared/services/coupon.service';
import { DiscountType } from '../../../../shared/interfaces/coupon.interfaces';
import { ProductService } from '../../../../shared/services/product.service';
import { ProductResponse } from '../../../../shared/interfaces/product.interfaces';
import { CREATINA_PRODUCT_SLUGS } from '../../../../shared/constants/product-slugs.constants';
import { FormFieldComponent } from '../../../../shared/ui/form-field/form-field.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent } from '../../../../shared/ui/select/select.component';
import { PasswordInputComponent } from '../../../../shared/ui/password-input/password-input.component';

@Component({
    selector: 'app-checkout',
    imports: [NavbarComponent, OrderSummaryItemComponent, ReactiveFormsModule, CommonModule, RouterLink, PaymentMethodComponent, ButtonComponent, FormFieldComponent, InputComponent, SelectComponent, PasswordInputComponent],
    templateUrl: './checkout.component.html',
    styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnDestroy, AfterViewInit {
  @ViewChild('isSignUpAceptedInput') isSignUpAceptedInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('nroDocInput') nroDocInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cellphoneInput') cellphoneInput!: ElementRef<HTMLInputElement>;
  paymentMethod: FlowPaymentMethod = FlowPaymentMethod.DEBIT_CREDIT_CARD;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const summary = this._summaryService.getSummary();
      if (summary?.address) {
        this.validateAddressLocation(summary.address);
      }
      this.trackInitiateCheckout();
    }
  }
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment;
  cartHas250Creatine = signal(false);
  isProcessing = signal(false);
  isOutsideLimaMetropolitana = signal(false);
  precioEnvioFueraLimaMetropolitana = signal(this.ENV.precioEnvioFueraLimaMetropolitana);
  allowNavigation = signal(false); // Señal para permitir navegación cuando el pago se procesa correctamente

  // Variables para código de descuento.
  // El backend (POST /coupons/validate) resuelve type+value+amount; el
  // front solo persiste el resultado en signals y no calcula nada.
  discountAmount = signal(0);                                    // soles
  discountCode = signal('');
  discountType = signal<DiscountType | null>(null);
  discountValue = signal(0);                                     // 10 (=10%) ó 9.10 (=S/.9.10)
  isDiscountApplied = signal(false);
  discountError = signal('');
  isApplyingDiscount = signal(false);

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
  private _checkoutService = inject(CheckoutService)
  private _couponService = inject(CouponService)
  private _productService = inject(ProductService)

  /**
   * Producto canónico de compra única (Creatina 250gr) resuelto desde
   * BD vía slug. Reemplaza el UUID hardcodeado anterior
   * (`00000009-50eb-4ac3-aa94-1b64fbf32b9c`).
   */
  onePurchaseProduct = signal<ProductResponse | null>(null);
  //
  private _addressService = inject(AddressService)
  addressList: PlaceAPI[] = [];
  userAddress: PlaceAPI | null = null;

  isSearched = false;
  hideSearching = true;
  departmentEmpty = true;
  provinceEmpty = true;
  isSaving = false;
  isSearchingAddress = false;

  /** Selección actual del método de pago en el componente <app-payment-method>. null = el cliente aún no eligió. */
  paymentSelection = signal<PaymentSelection | null>(null);
  /** Tarjeta enrolada del cliente (si está autenticado y tiene flowCustomerId). */
  enrolledCard = signal<EnrolledCardInfo | null>(null);
  /** Token devuelto por POST /api/v1/checkout/prepare-card para montar el widget. */
  flowToken = signal<string | null>(null);
  /** flowCustomerId obtenido en prepare-card o ya conocido del user autenticado. */
  flowCustomerId = signal<string | null>(null);
  /** True cuando el widget confirma que la tarjeta nueva fue enrolada exitosamente. */
  cardEnrolledOk = signal(false);
  /** True mientras se ejecuta prepare-card. */
  preparingCard = signal(false);

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
    department: this._formBuilder.nonNullable.control('', [Validators.required, Validators.min(1)] ),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required, Validators.min(1)]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required, Validators.min(1)]),
    number: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern(/^[0-9A-Za-zÑñ\/\.,\-\s]{1,20}$/)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]),
    isSignUpAcepted: this._formBuilder.nonNullable.control(true, []),
    termsAccepted: this._formBuilder.nonNullable.control(true, [Validators.requiredTrue]),
    discountCodeInput: this._formBuilder.nonNullable.control('', []),
  });
  buttonName = 'Pagar →';

  constructor() {
    // Effect para deshabilitar/habilitar el formulario cuando isProcessing cambia
    effect(() => {
      if (this.isProcessing()) {
        this.form.disable();
      } else {
        this.form.enable();

        // Si el usuario está autenticado, los campos de identidad no son editables
        if (this._authService.isAuthenticated()) {
          this.form.get('email')?.disable({ emitEvent: false });
          this.form.get('nroDocument')?.disable({ emitEvent: false });
          this.form.get('typeDocument')?.disable({ emitEvent: false });
          this.form.get('password')?.disable({ emitEvent: false });
          this.form.get('isSignUpAcepted')?.disable({ emitEvent: false });
        }

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

    // Deshabilitar/habilitar el input de código de descuento según el estado
    effect(() => {
      if (this.isDiscountApplied()) {
        this.form.get('discountCodeInput')?.disable();
      } else {
        this.form.get('discountCodeInput')?.enable();
      }
    });
  }

  ngOnInit() {
    this._metaAnalytics.trackCustomEvent('ViewContent', {
      content_name: 'Checkout Compra Única Creatina 250gr',
      content_ids: ['creatina-monohidratada-250-gr'],
      content_type: 'product',
      value: this._shoppingCartService.getTotalByShoppingCart(this._shoppingCartService.getShoppingCart()),
      currency: 'PEN'
    });

    // Resolver el producto canónico de compra única desde BD vía slug.
    // Reemplaza el UUID hardcodeado anterior. Si falla, log + toast pero
    // no bloquea el flujo: el `createOrderRequest` validará que el
    // producto esté cargado antes de enviar el checkout.
    this._productService.getBySlug(CREATINA_PRODUCT_SLUGS.CREATINE_ONE_PURCHASE)
      .subscribe({
        next: r => this.onePurchaseProduct.set(r.data.product),
        error: err => {
          console.error('No se pudo cargar el producto de compra única', err);
          this._toastService.error('Ups!', 'No pudimos cargar el catálogo. Recarga la página.');
        },
      });

    // Si hay flowCustomerId (en summary o en el perfil autenticado), cargar la tarjeta
    this.hydrateEnrolledCard();

    const cartSubscription = this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
      if (shoppingCart && shoppingCart.items.length > 0) {
        this.shoppingCart = shoppingCart;
        this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
        this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
        if (shoppingCart.items.find(item => item.product.name === 'Creatina Monohidratada 250 gr')) {
          this.cartHas250Creatine.set(true);
        }
        this.recalculateTotal();
      }
      else if (!this.allowNavigation()) {
        this._router.navigate(['/bolsa']);
      }
    });
    this.subscriptions.push(cartSubscription);

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

    // Re-preparar tarjeta cuando el email cambia (flag registro activo + ADD_CARD)
    const emailCardRefreshSub = this.form.get('email')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      filter(email => !!email && this.isValidEmail(email))
    ).subscribe(() => this.refreshPrepareCardIfActive());

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

    // Re-preparar tarjeta cuando el documento cambia (flag registro activo + ADD_CARD)
    const docCardRefreshSub = this.form.get('nroDocument')?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged(),
      filter(doc => !!doc && doc.length >= 8)
    ).subscribe(() => this.refreshPrepareCardIfActive());

    this.subscriptions.push(emailCardRefreshSub!, docCardRefreshSub!);

    if (this._authService.isAuthenticated()) {
      this.setValuesInFormFromAuthUser();
    } else {
      this.setValuesInFormFromSummary();
    }

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

    this.form.get('department')?.valueChanges.subscribe(() => {
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
    const control = this.form.get('email');
    if (control && !control.hasError('email')) {
      this._userService.validateEmail(email).pipe(
        catchError(() => EMPTY)
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ ...control.errors, emailExists: true });
          control.markAsTouched();
        } else {
          const errors = { ...control.errors };
          delete errors['emailExists'];
          control.setErrors(Object.keys(errors).length ? errors : null);
          localStorage.setItem('isEmailInvalid', 'false');
        }
      });
    }
  }

  private validatePhoneWithServer(phone: string): void {
    const control = this.form.get('cellphone');
    if (control && !control.hasError('pattern')) {
      this._userService.validatePhone(phone).pipe(
        catchError(() => EMPTY)
      ).subscribe(response => {
        if (response.data.exists) {
          control.setErrors({ ...control.errors, cellphoneExists: true });
          control.markAsTouched();
        } else {
          const errors = { ...control.errors };
          delete errors['cellphoneExists'];
          control.setErrors(Object.keys(errors).length ? errors : null);
        }
      });
    }
  }

  private validateDocumentWithServer(document: string): void {
    const control = this.form.get('nroDocument');
    const typeDoc = this.form.get('typeDocument')?.value;

    if (control && !control.hasError('pattern') && typeDoc) {
      this._userService.validateDocument(document, typeDoc).pipe(
        catchError(() => EMPTY)
      ).subscribe((response: { data: { exists: boolean } }) => {
        if (response.data.exists) {
          control.setErrors({ ...control.errors, nroDocumentExists: true });
          control.markAsTouched();
        } else {
          const errors = { ...control.errors };
          delete errors['nroDocumentExists'];
          control.setErrors(Object.keys(errors).length ? errors : null);
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
    if (this.isOutsideLimaMetropolitana()) {
      if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 1) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana);
      if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 4) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 2);
      if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 10) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 3);
      if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 16) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 4);
    }
    this.revalidateDiscountCode();
    this.recalculateTotal();
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
    this.revalidateDiscountCode();
    this.recalculateTotal();
  }

  /**
   * Revalida el código aplicado cuando el carrito cambia.
   * Si las condiciones ya no se cumplen, elimina el descuento automáticamente.
   */
  private revalidateDiscountCode(): void {
    if (!this.isDiscountApplied()) return;

    const creatina250Units = this.shoppingCart.items
      ?.filter(item => item.product.name === 'Creatina Monohidratada 250 gr')
      ?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    const code = this.discountCode();

    if (code === 'MAGRO9' && creatina250Units !== 1) {
      this.resetDiscount();
      this._toastService.warning('Descuento eliminado', 'El código MAGRO9 aplica solo para 1 unidad de Creatina 250 gr.');
    } else if (code === 'M2X100' && creatina250Units !== 2) {
      this.resetDiscount();
      this._toastService.warning('Descuento eliminado', 'El código M2X100 aplica solo para 2 unidades de Creatina 250 gr.');
    }
  }

  private resetDiscount(): void {
    this.discountCode.set('');
    this.discountAmount.set(0);
    this.isDiscountApplied.set(false);
    this.discountError.set('');
    this.form.get('discountCodeInput')?.setValue('');
  }

  /**
   * Aplica un código de descuento llamando al backend.
   *
   * El backend (POST /api/v1/coupons/validate) valida estado, fechas,
   * usos, subtotal mínimo, productos elegibles y qty mínima por
   * producto. Si pasa, devuelve `{ type, value, amount }` y aquí lo
   * persistimos en signals. Si falla, mapeamos el `code` del error a un
   * mensaje amigable.
   */
  applyDiscountCode(): void {
    const rawCode: string = this.form.get('discountCodeInput')?.value ?? '';
    const code = rawCode.trim();

    if (!code) {
      this.discountError.set('Por favor, ingresa un código de descuento');
      return;
    }

    const subtotal = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
    const items = (this.shoppingCart.items ?? []).map(it => ({
      product_id: it.product.id,
      quantity: it.quantity,
    }));

    if (items.length === 0 || subtotal <= 0) {
      this.discountError.set('Tu carrito está vacío.');
      return;
    }

    this.isApplyingDiscount.set(true);
    this.discountError.set('');

    this._couponService.validateCoupon({ code, items, subtotal }).pipe(
      finalize(() => this.isApplyingDiscount.set(false)),
    ).subscribe({
      next: response => {
        const data = response.data;
        this.discountCode.set(data.code);
        this.discountType.set(data.discount_type);
        this.discountValue.set(data.discount_value);
        this.discountAmount.set(data.discount_amount);
        this.isDiscountApplied.set(true);
        this.discountError.set('');
        this._toastService.success('¡Éxito!', 'Código de descuento aplicado');
        this.recalculateTotal();
        this.saveUserDataForOnePurchase();
      },
      error: err => {
        const errorCode: string | undefined = err?.error?.error?.code;
        this.discountError.set(this.mapCouponErrorToMessage(errorCode));
        this.isDiscountApplied.set(false);
        this.discountAmount.set(0);
        this.discountCode.set('');
        this.discountType.set(null);
        this.discountValue.set(0);
      },
    });
  }

  /**
   * Mapea los códigos de error del backend a mensajes amigables.
   * Lista canónica en api.magrolabs.com/src/api/v1/services/coupon.service.ts.
   */
  private mapCouponErrorToMessage(errorCode: string | undefined): string {
    switch (errorCode) {
      case 'COUPON_NOT_FOUND':
        return 'Código de descuento inválido o no disponible.';
      case 'COUPON_NOT_STARTED':
        return 'Este código de descuento aún no está activo.';
      case 'COUPON_EXPIRED':
        return 'Este código de descuento ya expiró.';
      case 'COUPON_USAGE_EXCEEDED':
        return 'Este código de descuento alcanzó su límite de usos.';
      case 'COUPON_MIN_SUBTOTAL_NOT_MET':
        return 'Tu carrito no alcanza el monto mínimo para este código.';
      case 'COUPON_PRODUCT_NOT_ELIGIBLE':
        return 'Este código no aplica a los productos en tu carrito.';
      case 'COUPON_QTY_NOT_MET':
        return 'No alcanzas la cantidad mínima de producto requerida por este código.';
      case 'INVALID_COUPON_VALIDATE_PAYLOAD':
        return 'Datos inválidos para validar el cupón.';
      default:
        return 'No pudimos validar el código. Intenta nuevamente.';
    }
  }

  get isAuthUser(): boolean {
    return this._authService.isAuthenticated();
  }

  /**
   * Elimina el código de descuento aplicado
   */
  removeDiscountCode(): void {
    this.discountCode.set('');
    this.discountAmount.set(0);
    this.discountType.set(null);
    this.discountValue.set(0);
    this.isDiscountApplied.set(false);
    this.discountError.set('');
    this.form.get('discountCodeInput')?.setValue('');
    this.recalculateTotal();
    this.saveUserDataForOnePurchase();
    this._toastService.info('Información', 'Código de descuento eliminado');
  }

  /**
   * Recalcula el total del carrito incluyendo el descuento
   */
  private recalculateTotal(): void {
    let baseTotal = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);

    // Agregar costo de envío si está fuera de Lima Metropolitana
    if (this.isOutsideLimaMetropolitana()) {
      baseTotal += this.precioEnvioFueraLimaMetropolitana();
    }

    // Aplicar descuento si está activo
    if (this.isDiscountApplied() && this.discountAmount() > 0) {
      baseTotal = Math.max(0, baseTotal - this.discountAmount());
    }

    this.shoppingCart.total = baseTotal;
  }

  get firtNameErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('firtName')) e.push('*Nombres es obligatorio');
    if (this.hasValidatorError('firtName')) e.push('*Solo se permite más de 3 letras');
    return e;
  }

  get lastNameErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('lastName')) e.push('*Apellidos es obligatorio');
    if (this.hasValidatorError('lastName')) e.push('*Solo se permite más de 3 letras');
    return e;
  }

  get emailErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('email')) e.push('*Correo es obligatorio');
    if (this.hasExistEmail()) e.push('*El correo ya está registrado');
    if (this.hasInvalidEmail()) e.push('*Correo inválido o no existente');
    if (this.hasValidatorError('email') && !this.hasRequiredError('email') && !this.hasExistEmail() && !this.hasInvalidEmail()) e.push('*Formato de correo inválido');
    return e;
  }

  get passwordErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('password')) e.push('*Contraseña es obligatorio');
    if (this.hasValidatorError('password')) e.push('*Debe contener mínimo 8 caracteres');
    return e;
  }

  get streetAddressErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('streetAddress')) e.push('*Campo obligatorio');
    if (this.hasValidatorError('streetAddress')) e.push('*Solo se permite más de 3 caracteres');
    return e;
  }

  get departmentErrors(): string[] {
    return this.hasRequiredError('department') ? ['*Departamento es obligatorio'] : [];
  }

  get provinceErrors(): string[] {
    return this.hasRequiredError('province') ? ['*Provincia es obligatorio'] : [];
  }

  get districtErrors(): string[] {
    return this.hasRequiredError('district') ? ['*Distrito es obligatorio'] : [];
  }

  get postalCodeErrors(): string[] {
    return this.hasValidatorError('postalCode') ? ['*Solo se permite 5 dígitos'] : [];
  }

  get numberErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('number')) e.push('*Campo obligatorio');
    if (this.hasValidatorError('number') && !this.hasRequiredError('number')) e.push('*Formato: números, letras, / . , -');
    return e;
  }

  get referenceErrors(): string[] {
    const e: string[] = [];
    if (this.hasRequiredError('reference')) e.push('*Campo obligatorio');
    if (this.hasValidatorError('reference')) e.push('*Se permite de 3 a 250 caracteres');
    return e;
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
    this.departmentUbigeo = event.target.value;
    this.provinceUbigeo = '';
    this.districtUbigeo = '';
    this.provinces$ = this._addressService.getProvinces(this.departmentUbigeo);
    this.districts$ = this._addressService.getDistricts('');
    this.form.get('province')?.setValue('');
    this.form.get('district')?.setValue('');
    this.form.get('province')?.enable();
    this.form.get('district')?.disable();
  }

  selectProvince(event: any): void {
    this.provinceUbigeo = event.target.value;
    this.districtUbigeo = '';
    this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
    this.form.get('district')?.setValue('');
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

  /**
   * Listener del componente <app-payment-method>. Sincroniza la selección
   * (CARD_ENROLLED, ADD_CARD, CARD_PORTAL, YAPE) con el flowPaymentMethod
   * usado para crear el body del checkout.
   *
   * Si el cliente cambia a una opción distinta de ADD_CARD, invalidamos
   * el token y el flag cardEnrolledOk: Flow no permite reusar tokens tras
   * handleCardSubscribed, así que si el cliente vuelve a ADD_CARD,
   * pediremos un token nuevo automáticamente vía enrollmentRequested.
   */
  onPaymentSelectionChanged(event: PaymentMethodSelection): void {
    const previousSelection = this.paymentSelection();
    this.paymentSelection.set(event.selection);
    this.selectPaymentMethod(event.flowMethod);

    // Si nos alejamos de ADD_CARD, invalidar token (no se puede reusar en Flow).
    // No tocamos enrolledCard ni flowCustomerId — esos pueden seguir vigentes
    // si la tarjeta ya quedó guardada exitosamente.
    if (previousSelection === 'ADD_CARD' && event.selection !== 'ADD_CARD') {
      this.flowToken.set(null);
      this.cardEnrolledOk.set(false);
    }

    // Persistir los datos del formulario en el summary para que sobrevivan un refresh.
    this.saveUserDataForOnePurchase();
  }

  /**
   * Listener del componente <app-payment-method>. Cuando el cliente selecciona
   * "Agregar Tarjeta" y aún no hay token, pedimos prepare-card al backend.
   */
  onEnrollmentRequested(): void {
    if (this.flowToken() || this.preparingCard()) return;

    // Validar que el form tenga lo mínimo para identificar al cliente.
    const email = this.form.get('email')?.value?.trim();
    const firstName = this.form.get('firtName')?.value?.trim();
    const lastName = this.form.get('lastName')?.value?.trim();
    if (!email || !firstName || !lastName) {
      this._toastService.warning('Completa tus datos', 'Necesitamos tu nombre y correo antes de registrar la tarjeta.');
      return;
    }

    this.preparingCard.set(true);
    this._checkoutService.prepareCard({
      email,
      first_name: firstName,
      last_name: lastName,
      documentNumber: this.form.get('nroDocument')?.value || undefined,
      urlReturn: this.ENV.flowUrlReturn,
      // Si ya tenemos un customerId del prepare-card previo (cliente alternando
      // entre tarjeta/Yape varias veces), reusarlo para que el backend NO haga
      // createCustomer otra vez. Evita el 502 de "externalId duplicado".
      customerId: this.flowCustomerId() || undefined,
    }).pipe(
      finalize(() => this.preparingCard.set(false))
    ).subscribe({
      next: (resp) => {
        this.flowCustomerId.set(resp.data.customerId);
        this.flowToken.set(resp.data.token);

        // Persistir el customerId en el summary y en el AuthService.
        // El FlowWidgetAddCardComponent lee customerId desde summary.userData
        // o desde authService.getCurrentUser().flowCustomerId al completar el
        // enrolamiento. Si no lo guardamos aquí, el widget hace getCustomer('')
        // y devuelve 400 "Customer not found".
        const existing = this._summaryService.getSummary()?.userData;
        this._summaryService.setUserData({
          ...(existing ?? ({} as UserDataSummary)),
          customerId: resp.data.customerId,
        });
        if (this._authService.isAuthenticated()) {
          this._authService.updateFlowCustomerId(resp.data.customerId);
        }
      },
      error: (err) => {
        const code = err?.error?.code;
        if (code === 'EMAIL_ALREADY_REGISTERED') {
          this._toastService.error(
            'Cuenta existente',
            'Este correo ya está registrado. Inicia sesión para continuar con tu tarjeta guardada.'
          );
          this.focusAndErrorInput(this.emailInput, 'email');
          return;
        }
        this._toastService.error('Ups!',err?.error?.error?.message || 'No pudimos preparar el formulario de tarjeta. Intenta nuevamente.');
      }
    });
  }

  /** Listener del widget interno de Flow. */
  onCardEnrolled(success: boolean): void {
    this.cardEnrolledOk.set(success);
    if (success) {
      // Tras enrolar exitosamente, leemos los datos de la tarjeta para mostrarla
      // como "tarjeta enrolada" y permitir cargo directo.
      const customerId = this.flowCustomerId();
      if (customerId) {
        this._flowService.getCustomer(customerId).subscribe({
          next: (customer) => {
            if (customer.last4CardDigits && customer.creditCardType) {
              this.enrolledCard.set({
                last4: customer.last4CardDigits,
                brand: customer.creditCardType,
              });
            }
          },
          error: () => { /* silencioso — no bloqueamos el pago */ }
        });
      }
      this._toastService.success('¡Tarjeta registrada!', 'Ya puedes confirmar tu pago.');
    } else {
      this._toastService.error('Ups!', 'No se pudo registrar la tarjeta. Intenta con otra.');
    }
  }

  /**
   * Determina si el cliente puede enrolar tarjeta (modo CHARGE).
   * - Cliente autenticado: siempre.
   * - Guest: solo si activó el flag "Registrarse" (isSignUpAcepted).
   * Si está deshabilitado, el componente <app-payment-method> oculta el acordeón.
   */
  canEnrollCard(): boolean {
    if (this._authService.isAuthenticated()) return true;
    return !!this.form.get('isSignUpAcepted')?.value;
  }

  /**
   * Determina si el cliente debe ver la opción "tarjeta vía portal Flow"
   * (redirect, sin enrolar tarjeta). Aplica solo al guest sin flag de registro:
   * no le guardamos la tarjeta, pero le permitimos pagar con ella vía Flow.
   * Mutuamente excluyente con canEnrollCard.
   */
  canPayCardViaPortal(): boolean {
    if (this._authService.isAuthenticated()) return false;
    return !this.form.get('isSignUpAcepted')?.value;
  }

  /**
   * Si el flag de registro está activo y el cliente está en modo ADD_CARD,
   * invalida el token actual y re-solicita prepare-card con los datos actualizados.
   * Llamado cuando el email o el documento cambian mientras el widget está activo.
   */
  private refreshPrepareCardIfActive(): void {
    if (!this.form.get('isSignUpAcepted')?.value) return;
    if (this.paymentSelection() !== 'ADD_CARD') return;
    if (this.preparingCard()) return;

    const email = this.form.get('email')?.value?.trim();
    const firstName = this.form.get('firtName')?.value?.trim();
    const lastName = this.form.get('lastName')?.value?.trim();
    if (!email || !firstName || !lastName) return;

    this.flowToken.set(null);
    this.cardEnrolledOk.set(false);
    this.onEnrollmentRequested();
  }

  /**
   * Carga la tarjeta enrolada del cliente y la expone en el signal `enrolledCard`.
   * Fuente de verdad:
   *   1. summary.userData.customerId  — disponible para guest y autenticado
   *   2. currentUser$.flowCustomerId  — solo autenticado, cargado asíncrono desde cookie
   *
   * Si ninguna fuente tiene customerId, no hay nada que hidratar.
   * Llamado desde ngOnInit (best-effort, falla silenciosamente).
   */
  private hydrateEnrolledCard(): void {
    const summaryCustomerId = this._summaryService.getSummary()?.userData?.customerId;

    // Caso 1: el customerId ya está en el summary (guest o autenticado)
    if (summaryCustomerId) {
      this.flowCustomerId.set(summaryCustomerId);
      this._flowService.getCustomer(summaryCustomerId).subscribe({
        next: (customer) => {
          if (customer.last4CardDigits && customer.creditCardType) {
            this.enrolledCard.set({
              last4: customer.last4CardDigits,
              brand: customer.creditCardType,
            });
          }
        },
        error: () => { /* sin tarjeta o error de Flow — la UI cae al acordeón */ }
      });
      return;
    }

    // Caso 2: no está en el summary pero el usuario está autenticado —
    // esperamos al observable para obtener flowCustomerId desde la cookie.
    if (!this._authService.isAuthenticated()) return;

    this._authService.currentUser$.pipe(
      filter((user): user is NonNullable<typeof user> => !!user),
      take(1),
    ).subscribe(user => {
      const customerId = user.flowCustomerId;
      if (!customerId) return;

      this.flowCustomerId.set(customerId);
      this._flowService.getCustomer(customerId).subscribe({
        next: (customer) => {
          if (customer.last4CardDigits && customer.creditCardType) {
            this.enrolledCard.set({
              last4: customer.last4CardDigits,
              brand: customer.creditCardType,
            });
          }
        },
        error: () => { /* sin tarjeta o error de Flow — la UI cae al acordeón */ }
      });
    });
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

    if (this.buttonName == 'Pagar →') {
      this._metaAnalytics.trackAddPaymentInfo({
        content_ids: this.shoppingCart.items.map(item => item.product.slug.toString()),
        contents: this.shoppingCart.items.map(item => ({
          id: item.product.id.toString(),
          quantity: item.quantity,
          item_price: item.product.price
        })),
        content_type: 'product',
        value: this.shoppingCart.total || 0,
        currency: 'PEN',
        content_category: 'checkout_payment_method'
      });
    }

    const status = this.form.get('isSignUpAcepted')?.value ?? false
      ? ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITH_REGISTRATION
      : ConfirmationStatus.ONE_PURCHASE_SUCCESS_WITHOUT_REGISTRATION;
    localStorage.setItem('status', status.toString());

    this.processPayment();
  }

  /**
   * Procesa el checkout en una sola llamada al backend (POST /api/v1/checkout).
   *
   * El backend ejecuta usuario + dirección + orden en una transacción Prisma
   * y luego inicia el pago en Flow. Si Flow falla post-commit, el backend
   * soft-deletea la orden y devuelve 502; aquí lo manejamos como error genérico.
   *
   * El interceptor de auth agrega el JWT cuando hay sesión iniciada — el
   * backend infiere "cliente nuevo" vs "cliente existente" según haya o no
   * Authorization header.
   */
  private processPayment(): void {
    this.saveUserDataForOnePurchase();

    const summary = this._summaryService.getSummary();
    const knownUserId = summary?.userData?.id;
    const knownAddressId = summary?.address?.id;

    const userRequest = this.createUserRequest();
    const addressRequest = this.createAddressRequest();
    const orderRequest = this.createOrderRequest();
    const paymentRequest = this.createPaymentRequest();

    // Determinar modo de pago:
    // - CHARGE: el cliente seleccionó tarjeta (enrolada o recién agregada vía widget).
    //   Requiere flowCustomerId y, en el caso ADD_CARD, que cardEnrolledOk sea true.
    // - PORTAL: Yape (siempre) o tarjeta sin enrolar (no aplica con esta UI).
    const selection = this.paymentSelection();
    const customerId = this.flowCustomerId();

    if (selection === null) {
      this._toastService.warning('Selecciona método de pago', 'Elige cómo quieres pagar antes de continuar.');
      this.isProcessing.set(false);
      return;
    }

    const useChargeMode =
      (selection === 'CARD_ENROLLED' && !!customerId) ||
      (selection === 'ADD_CARD' && !!customerId && this.cardEnrolledOk());

    if (selection === 'ADD_CARD' && !useChargeMode) {
      this._toastService.warning('Tarjeta pendiente', 'Termina de registrar tu tarjeta antes de pagar.');
      this.isProcessing.set(false);
      return;
    }

    const paymentBody: CheckoutRequest['payment'] = useChargeMode
      ? {
          mode: 'CHARGE',
          paymentMethod: paymentRequest.paymentMethod,
          subject: paymentRequest.subject,
          currency: paymentRequest.currency,
          customerId: customerId!,
        }
      : {
          mode: 'PORTAL',
          paymentMethod: paymentRequest.paymentMethod,
          subject: paymentRequest.subject,
          urlReturn: paymentRequest.urlReturn,
          currency: paymentRequest.currency,
        };

    const checkoutRequest: CheckoutRequest = {
      user: {
        email: userRequest.email,
        password: userRequest.password,
        first_name: userRequest.first_name,
        last_name: userRequest.last_name,
        phone: userRequest.phone,
        documentNumber: userRequest.documentNumber,
        documentType: userRequest.documentType,
        isSignUpAcepted: userRequest.isSignUpAcepted,
      },
      address: {
        ...addressRequest,
        // Solo enviamos id de dirección si el usuario ya estaba registrado
        // (el backend lo usa si además recibe JWT; si no, ignora y crea una nueva).
        ...(knownUserId && knownAddressId ? { id: knownAddressId } : {}),
      },
      order: {
        items: orderRequest.orderItems,
        // Solo enviamos `code_discount`; el backend valida el cupón y
        // resuelve el monto. El campo legacy `discount` (porcentaje)
        // ya no se envía — el backend lo loggea como warning si llega.
        code_discount: orderRequest.code_discount,
        shipping_cost: orderRequest.shipping_cost,
      },
      payment: paymentBody,
    };

    this._checkoutService.processCheckout(checkoutRequest).pipe(
      finalize(() => {
        this.isProcessing.set(false);
      })
    ).subscribe({
      next: (response) => {
        // Persistir sesión si el backend nos devuelve tokens (cliente nuevo o auto-login).
        // Esto permite que si el usuario aprieta "atrás" desde Flow y vuelve al checkout,
        // el JWT siga vivo en cookies y el reentry funcione transparente.
        if (response.data.tokens) {
          this._authService.setSessionFromCheckout(response.data.tokens, {
            id: response.data.user.id,
            email: response.data.user.email,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
            isSignUpAcepted: true,
          });
        }

        // Sincronizar el summary local con el resultado del backend
        const userData = this._summaryService.getSummary()?.userData;
        if (userData) {
          this._summaryService.setUserData({
            ...userData,
            id: response.data.user.id,
            orderId: response.data.order.id,
          });
        }

        this.allowNavigation.set(true);

        // Bifurcación según el modo:
        // - PORTAL: redirigimos al portal de Flow para que el cliente complete el pago.
        // - CHARGE: el cargo ya se ejecutó síncronamente; vamos directo a la confirmación.
        if (response.data.payment) {
          this._toastService.success('¡Listo!', 'Datos guardados correctamente.');
          window.location.href = response.data.payment.url + '?token=' + response.data.payment.token;
          return;
        }

        if (response.data.charge) {
          this._toastService.success('¡Pago confirmado!', 'Tu pedido se procesó exitosamente.');
          this._router.navigate(['/registro/confirmacion'], {
            queryParams: { orderId: response.data.order.id },
          });
          return;
        }

        // Sin payment ni charge — backend respondió mal
        console.error('Respuesta de checkout sin payment ni charge', response);
        this._toastService.error('Ups!', 'Respuesta inesperada del servidor.');
      },
      error: (err) => {
        console.error('Error en checkout: ', err);
        this.handleCheckoutError(err);
      }
    });
  }

  /**
   * Maneja los códigos de error del endpoint POST /api/v1/checkout (saga flow-first).
   *
   * - USER_EXISTS (409): cliente nuevo con email ya registrado y SIN password → enfoca email.
   * - USER_EXISTS_WRONG_PASSWORD (409): email existe pero password no coincide → enfoca password.
   * - ORDER_ALREADY_PAID (409): la orden previa ya se pagó (race con callback de Flow) →
   *   redirige a /registro/confirmacion con el orderId.
   * - PRODUCT_NOT_FOUND / INSUFFICIENT_STOCK (400): problema con el carrito.
   * - ADDRESS_NOT_FOUND (404): dirección referenciada no existe.
   * - PASSWORD_REQUIRED (400): cliente nuevo sin password — error de validación frontend.
   * - FLOW_PAYMENT_INIT_FAILED (502): Flow no pudo iniciar el pago — sin efectos en BD,
   *   el cliente puede reintentar limpio.
   * - DB_FAILED_AFTER_FLOW_INIT (500): caso raro — el pago se inició pero la BD falló.
   *   Persistimos la orphanFlowReference en localStorage para soporte y mostramos
   *   un mensaje específico al cliente.
   * - Cualquier otro: fallback al handler legacy.
   */
  private handleCheckoutError(err: any): void {
    const code = err?.error?.code;

    if (code === 'ORDER_ALREADY_PAID') {
      const orderId = err?.error?.orderId;
      this._toastService.success(
        '¡Ya completaste tu pago!',
        'Te llevamos a la confirmación de tu pedido.'
      );
      this.allowNavigation.set(true);
      this._router.navigate(['/registro/confirmacion'], {
        queryParams: orderId ? { orderId } : undefined,
      });
      return;
    }

    if (code === 'USER_EXISTS_WRONG_PASSWORD') {
      this._toastService.error(
        'Contraseña incorrecta',
        'Este correo ya tiene una cuenta. Ingresa la contraseña correcta o usa "Olvidé mi contraseña".'
      );
      // Foco en password (no hay ViewChild dedicado; setear error para visibilidad)
      const passwordControl = this.form.get('password');
      passwordControl?.setErrors({ wrongPassword: true });
      passwordControl?.markAsTouched();
      return;
    }

    if (code === 'USER_EXISTS') {
      this._toastService.error(
        'Cuenta existente',
        'Este correo ya está registrado. Ingresa tu contraseña para continuar.'
      );
      this.focusAndErrorInput(this.emailInput, 'email');
      return;
    }

    if (code === 'PASSWORD_REQUIRED') {
      this._toastService.error('Falta contraseña', 'Crea una contraseña para continuar.');
      const passwordControl = this.form.get('password');
      passwordControl?.setErrors({ required: true });
      passwordControl?.markAsTouched();
      return;
    }

    if (code === 'INSUFFICIENT_STOCK' || code === 'PRODUCT_NOT_FOUND') {
      const message = err?.error?.message || 'Uno de los productos no está disponible. Revisa tu carrito.';
      this._toastService.error('Ups!', message);
      return;
    }

    if (code === 'ADDRESS_NOT_FOUND') {
      this._toastService.error('Ups!', 'La dirección de envío no es válida. Por favor, revisa los datos.');
      return;
    }

    if (code === 'FLOW_PAYMENT_INIT_FAILED' || code === 'FLOW_INVALID_CREATE_RESPONSE') {
      this._toastService.error(
        'Error al iniciar el pago',
        'No pudimos comunicarnos con el sistema de pagos. Intenta nuevamente en unos momentos.'
      );
      return;
    }

    if (code === 'DB_FAILED_AFTER_FLOW_INIT') {
      const ref = err?.error?.orphanFlowReference;
      if (ref && isPlatformBrowser(this.platformId)) {
        try {
          localStorage.setItem(
            'orphanFlowReference',
            JSON.stringify({ ...ref, timestamp: new Date().toISOString() })
          );
        } catch { /* localStorage puede fallar en SSR/incognito; ignorar */ }
      }
      this._toastService.error(
        'Pago iniciado, pedido no registrado',
        'Si ya pagaste, contacta a soporte mencionando tu correo electrónico. No vuelvas a pagar todavía.'
      );
      return;
    }

    // Compatibilidad con el handler legacy (código 501 de errores de duplicado del backend antiguo).
    if (err?.error?.code === 501) {
      this.handleCustomerError(err);
      return;
    }

    this._toastService.error('Ups!', err?.error?.error?.message || 'Error al procesar tu pedido. Intenta nuevamente.');
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
    // ID del producto canónico resuelto desde BD vía slug (sin hardcode).
    // Si por alguna razón no se cargó (network error), fallback al ID
    // viejo para no romper el flujo — el backend de todos modos validará
    // el precio contra `product.price`.
    const productId = this.onePurchaseProduct()?.id
      ?? '00000009-50eb-4ac3-aa94-1b64fbf32b9c';

    return {
      shipping_address: this._summaryService.getSummary()?.address?.id ?? '',
      payment_method: paymentMethod,
      isLoyaltyWebShow: false,
      orderItems: [
        {
          product_id: productId,
          quantity: this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart)
        }
      ],
      // Enviamos solo el código de cupón. El backend re-valida y resuelve
      // el monto del descuento server-side (paso 3 del refactor de
      // descuentos). El campo legacy `discount` ya no se envía.
      code_discount: this.isDiscountApplied() ? this.discountCode() : undefined,
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

  private setValuesInFormFromAuthUser(): void {
    // Llamamos al endpoint /profile para obtener datos frescos con la dirección incluida.
    // La cookie puede no tener address si la sesión se creó durante un checkout anterior.
    this.isProcessing.set(true);
    this._userService.getCurrentUser().pipe(
      catchError(() => EMPTY),
      finalize(() => this.isProcessing.set(false))
    ).subscribe(user => {
      this.form.get('firtName')?.setValue(user.first_name, { emitEvent: false });
      this.form.get('lastName')?.setValue(user.last_name, { emitEvent: false });
      this.form.get('cellphone')?.setValue(user.phone ?? '', { emitEvent: false });
      this.form.get('nroDocument')?.setValue(user.documentNumber ?? '', { emitEvent: false });
      this.form.get('typeDocument')?.setValue(user.documentType ?? 'DNI', { emitEvent: false });
      this.form.get('email')?.setValue(user.email, { emitEvent: false });
      this.form.get('isSignUpAcepted')?.setValue(false, { emitEvent: false });
      this.form.get('termsAccepted')?.setValue(true, { emitEvent: false });

      // El usuario ya está registrado: la contraseña no es necesaria
      const passwordControl = this.form.get('password');
      passwordControl?.clearValidators();
      passwordControl?.updateValueAndValidity({ emitEvent: false });

      if (user.address) {
        this.hideSearching = true;
        this.isSearched = true;

        this._addressService.getDepartments().pipe(
          map(() => {
            this.departmentUbigeo = user.address!.department_ubigeo;
            this.provinces$ = this._addressService.getProvinces(this.departmentUbigeo);
            return this.departmentUbigeo;
          }),
          switchMap((departmentUbigeo) =>
            this._addressService.getProvinces(departmentUbigeo).pipe(
              map(() => {
                this.provinceUbigeo = user.address!.province_ubigeo;
                this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
                return this.provinceUbigeo;
              })
            )
          ),
          switchMap((provinceUbigeo) =>
            this._addressService.getDistricts(provinceUbigeo).pipe(
              map(() => {
                this.districtUbigeo = user.address!.district_ubigeo;
                return this.districtUbigeo;
              })
            )
          )
        ).subscribe(() => {
          this.form.get('streetAddress')?.setValue(user.address!.avenue ?? '');
          this.form.get('number')?.setValue(user.address!.number ?? '');
          this.form.get('postalCode')?.setValue(user.address!.postalcode ?? '');
          this.form.get('district')?.setValue(user.address!.district_ubigeo);
          this.form.get('province')?.setValue(user.address!.province_ubigeo);
          this.form.get('department')?.setValue(user.address!.department_ubigeo);
          this.form.get('reference')?.setValue(user.address!.reference ?? '');
          this.form.get('district')?.enable();
          this.form.get('province')?.enable();
        });
      }
    });
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
    this.form.get('termsAccepted')?.setValue(summary?.userData?.isTermsAccepted ?? true);

    if (summary?.chosePlan?.discountCode && summary.chosePlan.discountAmount) {
      this.discountCode.set(summary.chosePlan.discountCode);
      this.discountAmount.set(summary.chosePlan.discountAmount);
      this.isDiscountApplied.set(true);
      this.form.get('discountCodeInput')?.setValue(summary.chosePlan.discountCode);
      this.recalculateTotal();
    }

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

  private focusAndErrorInput(input: ElementRef, controlName: string) {
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
      const el = input.nativeElement as HTMLElement;
      const focusTarget = el.tagName === 'INPUT' ? el : (el.querySelector('input') ?? el);
      (focusTarget as HTMLElement).focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      descriptionTwo: 'Compra única de S/' + this.shoppingCart.total + '.',
      quantity: this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart),
      discountCode: this.isDiscountApplied() ? this.discountCode() : undefined,
      discountAmount: this.isDiscountApplied() ? this.discountAmount() : undefined,
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
        if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 1) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana);
        if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 4) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 2);
        if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 10) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 3);
        if (this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart) > 16) this.precioEnvioFueraLimaMetropolitana.set(this.ENV.precioEnvioFueraLimaMetropolitana * 4);
      } else {
        this.isOutsideLimaMetropolitana.set(false);
      }
      this.recalculateTotal();
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
        content_ids: this.shoppingCart.items.map(item => item.product.slug.toString()),
        content_type: 'product',
        num_items: this.shoppingCart.items.length
      });
    }
  }

  get cellphoneErrors(): string[] {
    if (this.hasRequiredError('cellphone')) return ['*El número de celular es obligatorio'];
    if (this.hasExistCellphone()) return ['*El número de celular ya está registrado'];
    if (this.hasValidatorError('cellphone')) return ['*Número inválido, solo se permite 9 dígitos'];
    return [];
  }

  get nroDocumentErrors(): string[] {
    const type = this.form.get('typeDocument')?.value;
    if (this.hasRequiredError('nroDocument')) return ['*Número de documento es obligatorio'];
    if (this.hasValidatorError('nroDocument') && type === 'DNI') return ['*DNI permite 8 dígitos'];
    if (this.hasValidatorError('nroDocument') && type === 'CE') return ['*Carnet Ext. permite 12 alfanuméricos'];
    if (this.hasValidatorError('nroDocument') && type === 'PASSPORT') return ['*Pasaporte permite 12 alfanuméricos'];
    if (this.hasExistDocument()) return ['*El documento ya está registrado'];
    return [];
  }
}