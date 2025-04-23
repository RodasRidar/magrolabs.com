import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PROVINCES } from '../data/provincias';
import { DISTRICTS } from '../data/distritos';
import { DEPARTMENTS } from '../data/departamentos';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) { }

  searchAddress(query: string): Observable<PlaceAPI[]> {
    let params = new HttpParams()
      .set('q', query + ' , Lima, Perú')
      .set('format', 'json')
      .set('addressdetails', '1')
      .set('limit', '10');

    return this.http.get<PlaceAPI[]>(this.apiUrl, { params });
  }

  getDepartments(): Observable<Ubigeo[]> {
    return of(DEPARTMENTS);
  }

  getProvinces(departmentUbigeo: string): Observable<Ubigeo[]> {
    return of(PROVINCES[departmentUbigeo as keyof typeof PROVINCES]);
  }

  getDistricts(provinceUbigeo: string): Observable<Ubigeo[]> {
    return of(DISTRICTS[provinceUbigeo as keyof typeof DISTRICTS]);
  }

  getListDepartments(): Ubigeo[] {
    return DEPARTMENTS;
  }

  getListProvinces(departmentUbigeo: string): Ubigeo[] {
    return PROVINCES[departmentUbigeo as keyof typeof PROVINCES];
  }

  getListDistricts(provinceUbigeo: string): Ubigeo[] {
    return DISTRICTS[provinceUbigeo as keyof typeof DISTRICTS];
  }
}

interface AddressAPI {
  quarter: string;
  "ISO3166-2-lvl6": string;
  "ISO3166-2-lvl4": string;
  building?: string;
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  region?: string;
  ISO3166_2_lvl6?: string;
  city?: string;
  state?: string;
  ISO3166_2_lvl4?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

export interface PlaceAPI {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name?: string;
  display_name: string;
  address: AddressAPI;
  boundingbox: [string, string, string, string];
}

export interface Ubigeo {
  id_ubigeo: string;
  nombre_ubigeo: string;
  codigo_ubigeo: string;
  etiqueta_ubigeo: string;
  buscador_ubigeo: string;
  numero_hijos_ubigeo: string;
  nivel_ubigeo: string;
  id_padre_ubigeo: string;
}