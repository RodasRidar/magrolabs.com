import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { CreateCustomerRequest, CreateCustomerResponse, CreateSubscriptionRequest, CreateSubscriptionResponse, EditCustomerRequest, EditCustomerResponse, RegisterCardResponse, RegisterStatusResponse } from '../models/flow.model';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private apiUrlLocal = environment.urlApiFlow;
  private apiUrl = `https://magrolabs.com/api/flow`;
  private apiKey = environment.flowApiKey;

  constructor(private http: HttpClient) { }
  // 📌 2. Crear un Cliente
  createCustomer(customerData: CreateCustomerRequest): Observable<CreateCustomerResponse> {

    if (environment.production) {
      const url = `https://magrolabs.com/customer/create`;
      return this.http.post<CreateCustomerResponse>(url, customerData);
    }
    else {
      const url = `${this.apiUrlLocal}/customer/create`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const toSign = { apiKey: this.apiKey, ...customerData };
      const body = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('name', customerData.name)
        .set('email', customerData.email)
        .set('externalId', customerData.externalId)
        .set('s', this.getFlowSignature(toSign));
      return this.http.post<CreateCustomerResponse>(url, body.toString(), { headers });
    }

  }

  editCustomer(customerData: EditCustomerRequest): Observable<EditCustomerResponse> {
    if (environment.production) {
      const url = `https://magrolabs.com/customer/edit`;
      return this.http.post<CreateCustomerResponse>(url, customerData);
    }
    else {
      const url = `${this.apiUrlLocal}/customer/edit`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const toSign = { apiKey: this.apiKey, ...customerData };
      const body = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('name', customerData.name)
        .set('email', customerData.email)
        .set('externalId', customerData.externalId)
        .set('customerId', customerData.customerId)
        .set('s', this.getFlowSignature(toSign));

      return this.http.post<EditCustomerResponse>(url, body.toString(), { headers });
    }
  }

  getCustomer(customerId: string): Observable<CreateCustomerResponse> {
    if (environment.production) {
      const url = `https://magrolabs.com/customer/get`;
      return this.http.post<CreateCustomerResponse>(url, customerId);
    }
    else {
      const url = `${this.apiUrlLocal}/customer/get`;
      const toSign = { apiKey: environment.flowApiKey, customerId };
      const params = new HttpParams()
        .set('customerId', customerId)
        .set('apiKey', environment.flowApiKey)
        .set('s', this.getFlowSignature(toSign));
      return this.http.get<CreateCustomerResponse>(url, { params });
    }
  }

  // 📌 3. Registrar Tarjeta para Cliente
  registerCard(customerId: string): Observable<RegisterCardResponse> {
    if (environment.production) {
      const url = `https://magrolabs.com/customer/register`;
      return this.http.post<RegisterCardResponse>(url, customerId);
    }
    else {
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const url = `${this.apiUrlLocal}/customer/register`;
      const url_return = 'http://magrolabs.com/registro/verificacion';
      const toSign = { apiKey: environment.flowApiKey, customerId, url_return };
      const body = new HttpParams()
        .set('apiKey', environment.flowApiKey)
        .set('customerId', customerId)
        .set('url_return', url_return)
        .set('s', this.getFlowSignature(toSign));
      return this.http.post<RegisterCardResponse>(url, body.toString(), { headers });
    }
  }

  // 📌 4. Obtener estatus del registro
  // getRegisterStatus(suscriptionToken: string): Observable<RegisterStatusResponse> {
  //   const url = `${this.apiUrlLocal}/customer/getRegisterStatus`;
  //   const toSign = { apiKey: environment.flowApiKey, token: suscriptionToken };
  //   const params = new HttpParams()
  //     .set('token', suscriptionToken)
  //     .set('apiKey', environment.flowApiKey)
  //     .set('s', this.getFlowSignature(toSign));
  //   return this.http.get<RegisterStatusResponse>(url, { params });
  // }

  createSubscription(subscriptionData: CreateSubscriptionRequest): Observable<CreateSubscriptionResponse> {
    if (environment.production) {
      const url = `${this.apiUrl}/subscription/create`;
      return this.http.post<CreateSubscriptionResponse>(url, subscriptionData);
    }
    else {
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const url = `${this.apiUrlLocal}/subscription/create`;
      const toSign = { apiKey: this.apiKey, planId: subscriptionData.planId, customerId: subscriptionData.customerId };
      const body = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('planId', subscriptionData.planId)
        .set('customerId', subscriptionData.customerId)
        .set('s', this.getFlowSignature(toSign));

      if (subscriptionData.subscription_start) {
        body.set('subscription_start', subscriptionData.subscription_start);
      }
      if (subscriptionData.couponId) {
        body.set('couponId', subscriptionData.couponId.toString());
      }
      if (subscriptionData.trial_period_days) {
        body.set('trial_period_days', subscriptionData.trial_period_days.toString());
      }
      if (subscriptionData.periods_number) {
        body.set('periods_number', subscriptionData.periods_number.toString());
      }

      return this.http.post<CreateSubscriptionResponse>(url, body.toString(), { headers });
    }
  }

  /**
 * 📌 Método para generar la firma HMAC-SHA256 segun formato de Flow
 * @param params Objeto con los parámetros a firmar
 * @param secretKey Clave secreta para firmar los datos
 * @returns Firma en formato hexadecimal
 */
  private getFlowSignature(params: Record<string, string | number>): string {
    // Ordenar las claves alfabéticamente
    const sortedKeys = Object.keys(params).sort();

    // Concatenar clave-valor en un solo string
    const concatenatedString = sortedKeys
      .map(key => `${key}${params[key].toString()}`)
      .join('')

    // Generar la firma HMAC-SHA256 en Base64
    const signature = CryptoJS.HmacSHA256(concatenatedString, environment.flowSecretKey);
    return signature.toString(CryptoJS.enc.Hex);
  }


}


