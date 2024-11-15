import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StepComponent } from '../../components/step/step.component';
import { StepEnum } from '../../models/step.model';
import { AddressService, PlaceAPI, Ubigeo } from '../../../../shared/services/address-service.service';
import { debounceTime, map, Observable, switchMap } from 'rxjs';
import { state } from '@angular/animations';
import { Router } from '@angular/router';

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

  stepEnum = StepEnum;
  addressList: PlaceAPI[] = [];
  userAddress: PlaceAPI | null = null;

  isSearched = false;
  hideSearching = false;
  departmentEmpty = true;
  provinceEmpty = true;

  departmentUbigeo = '';
  provinceUbigeo = '';
  districtUbigeo = '';

  departments$: Observable<Ubigeo[]> = this._addressService.getDepartments();
  provinces$: Observable<Ubigeo[]> = this._addressService.getProvinces(this.departmentUbigeo);
  districts$: Observable<Ubigeo[]> = this._addressService.getDistricts(this.provinceUbigeo);

  form = this._formBuilder.group<Address>({
    searchAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    streetAddress: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    department: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    province: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]),
    district: this._formBuilder.nonNullable.control({ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]),
    number: this._formBuilder.nonNullable.control('', [Validators.minLength(1)]),
    reference: this._formBuilder.nonNullable.control('', [Validators.minLength(3)]),
    postalCode: this._formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
  });

  ngOnInit(): void {
    this.form.get('searchAddress')?.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this._addressService.searchAddress(value))
    ).subscribe((results: PlaceAPI[]) => {
      console.log(results);
      this.addressList = results;
    });
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
            console.log(this.districtUbigeo) 
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
    console.log(event.target.value);
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

  nextStep(): void {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this._router.navigate(['registro/verificacion']);
  }
}
