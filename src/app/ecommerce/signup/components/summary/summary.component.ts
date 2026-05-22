import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Summary } from '../../../../shared/models/summary.model';
import { SummaryService } from '../../../../shared/services/summary-service.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AddressService, Ubigeo } from '../../../../shared/services/address-service.service';

@Component({
    selector: 'app-summary',
    imports: [CommonModule],
    templateUrl: './summary.component.html'
})
export class SummaryComponent implements OnInit {

  private _addressService = inject(AddressService);
  private _summaryService = inject(SummaryService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);


  summaryState$ = this._summaryService.summaryState$;
  summary: Summary = {} as Summary
  iframeReady = false
  nextUrl = '';
  currentUrl = '';

  isUserDataDisable = false;
  isAddressDisable = false;
  isChooseDisable = false;
  isConfirmation = false;

  districts: Ubigeo[] = [];
  provinces: Ubigeo[] = [];
  showFinalSummary = false

  ngOnInit(): void {

    this.summary = this._summaryService.getSummary() ?? {} as Summary;
    this.setAddress();

    this._route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(param => {
      this.nextUrl = param['next'] || '';
      this.showFinalSummary = false;

      if (this._router.url.split('/').pop()?.split('?').shift() === 'registro' && this.nextUrl !== '') {
        this.isChooseDisable = true;
      } else {
        this.isChooseDisable = false;
      }

      if (this._router.url.split('/').pop()?.split('?').shift() === 'crear-cuenta') {
        this.isChooseDisable = false;
        this.isUserDataDisable = true;
        this.isAddressDisable = true;
      }
      else if (this._router.url.split('/').pop()?.split('?').shift() === 'direccion') {
        this.isChooseDisable = false;
        this.isUserDataDisable = false;
        this.isAddressDisable = true;
      }
      else if (this._router.url.split('/').pop()?.split('?').shift() === 'verificacion') {
        this.isChooseDisable = false;
        this.isUserDataDisable = false;
        this.isAddressDisable = false;
      }
      else if (this._router.url.split('/').pop()?.split('?').shift() === 'confirmacion') {
        this.isConfirmation = true;
        this.isAddressDisable = true;
        this.isUserDataDisable = true;
        this.showFinalSummary = true;
      }
    });

    this._router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      this.showFinalSummary = false;
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.url.split('/').pop()?.split('?').shift() || '';

        if (this._router.url.split('/').pop()?.split('?').shift() === 'registro' && this.nextUrl !== '') {
          this.isChooseDisable = true;
        } else {
          this.isChooseDisable = false;
        }

        if (this._router.url.split('/').pop()?.split('?').shift() === 'crear-cuenta') {
          this.isChooseDisable = false;
          this.isUserDataDisable = true;
          this.isAddressDisable = true;
        }
        else if (this._router.url.split('/').pop()?.split('?').shift() === 'direccion') {
          this.isChooseDisable = false;
          this.isUserDataDisable = false;
          this.isAddressDisable = true;
        }
        else if (this._router.url.split('/').pop()?.split('?').shift() === 'verificacion') {
          this.isChooseDisable = false;
          this.isUserDataDisable = false;
          this.isAddressDisable = false;
        }
        else if (this._router.url.split('/').pop()?.split('?').shift() === 'confirmacion') {
          this.isConfirmation = true;
          this.isAddressDisable = true;
          this.isUserDataDisable = true;
          this.showFinalSummary = true;
        }
        this.setAddress();
      }
    });
  }

  changeChoose() {
    if (this.nextUrl !== '') {
      this._router.navigate(['registro'], { queryParams: { next: this._router.url.split('/').pop()?.split('?').shift() } });
    }
    else {
      this._router.navigate(['registro'], { queryParams: { next: this._router.url.split('/').pop() } });
    }
  }

  changeUserData() {
    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/crear-cuenta'], { queryParams: { next: this._router.url.split('/').pop()?.split('?').shift() } });
    }
    else {
      this._router.navigate(['/registro/crear-cuenta'], { queryParams: { next: this._router.url.split('/').pop() } });
    }
  }

  changeAddress() {
    if (this.nextUrl !== '') {
      this._router.navigate(['/registro/direccion'], { queryParams: { next: this._router.url.split('/').pop()?.split('?').shift() } });
    }
    else {
      this._router.navigate(['/registro/direccion'], { queryParams: { next: this._router.url.split('/').pop() } });
    }
  }

  districtName() {
    return this.districts.filter(x => x.id_ubigeo == this.summary.address?.distrito)[0]?.nombre_ubigeo ?? '';
  }

  provinceName() {
    return this.provinces.find(x => x.id_ubigeo == this.summary.address?.provincia)?.nombre_ubigeo ?? '';
  }

  setAddress() {
    const provincia = this.summary.address?.provincia ?? '';
    if (provincia) {
      this._addressService.getDistricts(provincia)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((data) => {
          this.districts = data;
        });
    }

    const departamento = this.summary.address?.department ?? '';
    if (departamento) {
      this._addressService.getProvinces(departamento)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((data) => {
          this.provinces = data;
        });
    }
  }

  onIframeLoad() {
    // Retrasa la visibilidad del iframe por 3 segundos
    setTimeout(() => {
      this.iframeReady = true;
    }, 3000); // 3 segundos
  }
}

