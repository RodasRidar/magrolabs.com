import { Component, inject } from '@angular/core';
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

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NavbarComponent, OrderSummaryItemComponent, ReactiveFormsModule, CommonModule, RouterLink, PaymentMethodComponent, ButtonComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  paymentMethod = '';
  navbarTypeEnum = NavbarTypeEnum;
  ENV = environment;
  cartHas250Creatine = false;
  private _shoppingCartService = inject(ShoppingCartService);
  private _formBuilder = inject(FormBuilder)
  private _router = inject(Router)

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
    password: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    searchAddress: this._formBuilder.nonNullable.control('', [Validators.minLength(3)]),
    streetAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(70), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,70}$/)]),
    department: this._formBuilder.nonNullable.control('', [Validators.required]),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    number: this._formBuilder.nonNullable.control('', [Validators.minLength(1), Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9/]{1,6}$/)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]),
  });


  ngOnInit() {

    this._shoppingCartService.shoppingCart$.subscribe(shoppingCart => {
      if (shoppingCart && shoppingCart.items.length > 0) {
        this.shoppingCart = shoppingCart;
        this.shoppingCart.totalItems = this._shoppingCartService.getTotalItemsByShoppingCart(this.shoppingCart);
        this.shoppingCart.total = this._shoppingCartService.getTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.subTotal = this._shoppingCartService.getSubTotalByShoppingCart(this.shoppingCart);
        this.shoppingCart.totalDiscount = this._shoppingCartService.getTotalDiscountByShoppingCart(this.shoppingCart);
        if(shoppingCart.items.find(item => item.product.name === 'Creatina Monohidratada 250 gr')){
          this.cartHas250Creatine = true;
        }
      }
      else{
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
            this.provinceUbigeo = this.findIdUbigeo(address.address.city === 'Lima Metropolitana' ? 'Lima' : address.address.city, provinces);
            this.districts$ = this._addressService.getDistricts(this.provinceUbigeo);
            return this.provinceUbigeo ?? '3927';
          })
        )
      ),
      switchMap((provinceUbigeo) =>
        this._addressService.getDistricts(provinceUbigeo).pipe(
          map((districts) => {
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

  selectPaymentMethod(paymentMethod: string) {
    this.paymentMethod = paymentMethod;
  }

  Pay(){
    alert('Pago realizado con éxito');
  }
}
