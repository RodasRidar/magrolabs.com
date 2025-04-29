import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { AddressService, PlaceAPI, Ubigeo } from '../../../../shared/services/address-service.service';
import { debounceTime, map, Observable, switchMap, tap, catchError, of, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { SeoService } from '../../../../shared/services/seo.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AddressApiService } from '../../../../shared/services/address-api.service';
import { CreateAddressRequest } from '../../../../shared/interfaces/address.interfaces';
import { UserService } from '../../../../shared/services/user.service';

export interface Address {
  searchAddress: FormControl<string>,
  streetAddress: FormControl<string>,
  department: FormControl<string>,
  province: FormControl<string>,
  district: FormControl<string>,
  number: FormControl<string>,
  reference: FormControl<string>,
  postalCode: FormControl<string>,
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [StepComponent, ButtonComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './address.component.html',
  styleUrl: './address.component.css'
})
export class AddressComponent {

  private _formBuilder = inject(FormBuilder)
  private _addressService = inject(AddressService)
  private _router = inject(Router)
  private _summaryService = inject(SummaryService)
  private _route = inject(ActivatedRoute)
  private _seo = inject(SeoService)
  private _toastService = inject(ToastService)
  private _addressApiService = inject(AddressApiService)
  private _userService = inject(UserService)
  private nextUrl = '';
  stepEnum = StepEnum;
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

  form = this._formBuilder.group<Address>({
    searchAddress: this._formBuilder.nonNullable.control('', [Validators.minLength(3)]),
    streetAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3), Validators.maxLength(70), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,70}$/)]),
    department: this._formBuilder.nonNullable.control('', [Validators.required]),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required]),
    number: this._formBuilder.nonNullable.control('', [Validators.minLength(1), Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9/]{1,6}$/)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.minLength(3), Validators.maxLength(250), Validators.pattern(/^[0-9A-Za-zÑñÁáÉéÍíÓóÚú \.\-\(\)#, ]{3,250}$/)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.minLength(5), Validators.maxLength(5), Validators.pattern(/^[0-9]{5}$/)]),
  });

  ngOnInit() {
    this._seo.title.setTitle('Registro | Dirección de envío');
    this._seo.setCanonicalURL('magrolabs.com/registro/direccion');
    this._seo.setIndexFollow(false);
    this._route.queryParams.subscribe(params => {
      this.nextUrl = params['next'] || '';
    });

    let summary = this._summaryService.getSummary()

    if (!summary?.userData) {
      this._router.navigate(['registro/crear-cuenta']);
    }

    this.form.get('searchAddress')?.valueChanges.pipe(
      debounceTime(300),
      tap(() => this.isSearchingAddress = true),
      switchMap(value => this._addressService.searchAddress(value)),
    ).subscribe((results: PlaceAPI[]) => {
      this.addressList = results;
      this.isSearchingAddress = false;
    });

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

  selectAddress(address: PlaceAPI): void {
    this.userAddress = address;
    this.isSearched = true;
    this.hideSearching = true;
    this._addressService.getDepartments().pipe(
      map((departments) => {
        this.departmentUbigeo = this.findIdUbigeo(address.address.region == 'Province of Lima' ? 'Lima' : address.address.region, departments);
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

  hasRequiredError(field: string) {
    const control = this.form.get(field);
    return control?.hasError('required') && control.touched;
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

  selectDistrict(event: any): void {
    this.districtUbigeo = event.target.value;
  }

  findIdUbigeo(name: string | undefined, list: Ubigeo[]): string {
    if (!name) {
      return '';
    }
    return list.find((x) => x.nombre_ubigeo === name)?.id_ubigeo || '';
  }

  nextStep(): void {
    this.isSaving = true;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.isSaving = false;
      return;
    }
    
    if (!this.isAddressRegistered()) {
      this.form.markAllAsTouched();
      this.isSaving = false;
      return;
    }
    
    // Crear objeto de dirección para el servicio de resumen
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
    
    // Obtener el ID del usuario del servicio de resumen
    const userId = this._summaryService.getSummary()?.userData?.id;
    const addressId = this._summaryService.getSummary()?.address?.id;
    if (userId) {
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
      if(addressSummary.reference !== ''){
        addressRequest.reference = addressSummary.reference;
      }
      if(addressSummary.numero !== ''){
        addressRequest.number = addressSummary.numero;
      }
      if(addressSummary.codigoPostal !== ''){
        addressRequest.postalcode = addressSummary.codigoPostal;
      }
      


      if (addressId) {
        this._addressApiService.updateAddress(addressId, addressRequest)
          .pipe(
            switchMap(response => {
              const addressId = response.data.address.id;
              this._summaryService.setAddress({...addressSummary, id: addressId});
              return this._userService.updateUser(userId, { address_id: addressId });
            }),
            catchError(err => {
              console.error(err);
              this._toastService.error('Ups!', 'Error al guardar la nueva dirección. Por favor, intenta nuevamente.');
              return of(null);
            }),
            finalize(() => {
              this.isSaving = false;
            })
          ).subscribe({
            next: (response) => {
              if (response) {
                this._toastService.success('¡Listo!', 'Dirección guardada correctamente.');
                this.navigateToNextStep();
              }
            },
            error: () => {
              this._toastService.error('Ups!', 'Error al guardar la dirección. Por favor, intenta nuevamente.');
              this.isSaving = false;
            }
          })
      }
      else{
      // Crear dirección en la API y asociarla al usuario
      this._addressApiService.createAddress(addressRequest)
        .pipe(
          switchMap(response => {
            const addressId = response.data.address.id;
            this._summaryService.setAddress({...addressSummary, id: addressId});
            return this._userService.updateUser(userId, {address_id: addressId});
          }),
          catchError(err => {
            console.error(err);
            this._toastService.error('Ups!', 'Error al guardar la dirección. Por favor, intenta nuevamente.');
            return of(null);
          }),
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response) {
              this._toastService.success('¡Listo!', 'Dirección guardada correctamente.');
              this.navigateToNextStep();
            }
          },
          error: () => {
            // Error ya manejado en catchError
            this.isSaving = false;
          }
        });
      }

    } else {
      this._toastService.error('Ups!', 'Error al guardar la dirección. No se encontro el ID usuario.');
      this.isSaving = false;
    }
  }
  
  // Método para navegar al siguiente paso
  private navigateToNextStep(): void {
    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/' + this.nextUrl]);
    } else {
      this._router.navigate(['/registro/verificacion']);
    }
  }

  hasValidatorError(field: string) {
    const control = this.form.get(field);
    return control?.invalid && control?.touched;
  }

  isAddressRegistered() {

    setTimeout(() => {
    }, 10000);

    return true
  }

  limitDigits(nroDigits: number, field: string): void {
    const control = this.form.get(field);
    if (control) {
      const value = control.value?.toString() || '';
      control.setValue(value.slice(0, nroDigits));
    }
  }
}
