import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/env';
import { CreateCustomerRequest, CreateCustomerResponse, CreateSubscriptionResponse, EditCustomerRequest, EditCustomerResponse, FlowChargesResponse, FlowCreateSubscriptionRequest, FlowPaymentRequest, FlowPaymentResponse, RegisterCardResponse, RegisterStatusResponse } from '../models/flow.model';
import * as CryptoJS from 'crypto-js';
import { AtPeriodEnd } from './subscription.service';

/**
 * Interfaz para la respuesta de las suscripciones de un cliente
 */
export interface FlowSubscriptionsResponse {
  total: number;
  hasMore: number;
  data: any[];
}

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  private apiUrlLocal = environment.urlApiFlow;
  private apiUrl = environment.flowApiUrl;
  private apiKey = environment.flowApiKey;
  private useProxy = environment.useProxy;

  constructor(private http: HttpClient) { }

  createCustomer(customerData: CreateCustomerRequest): Observable<CreateCustomerResponse> {

    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/create.ts`;
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
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/edit.ts`;
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
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/get.ts`;
      return this.http.get<CreateCustomerResponse>(url, { params: { customerId } });
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

  registerCard(customerId: string): Observable<RegisterCardResponse> {
    
    const url_return = environment.flowUrlReturn;
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/register.ts`;
      return this.http.post<RegisterCardResponse>(url, { customerId, url_return });
    }
    else {
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const url = `${this.apiUrlLocal}/customer/register`;
      const toSign = { apiKey: environment.flowApiKey, customerId, url_return };
      const body = new HttpParams()
        .set('apiKey', environment.flowApiKey)
        .set('customerId', customerId)
        .set('url_return', url_return)
        .set('s', this.getFlowSignature(toSign));
      return this.http.post<RegisterCardResponse>(url, body.toString(), { headers });
    }
  }

  createSubscription(subscriptionData: FlowCreateSubscriptionRequest): Observable<CreateSubscriptionResponse> {
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}subscription/create.ts`;
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

      // if (subscriptionData.subscription_start) {
      //   body.set('subscription_start', subscriptionData.subscription_start);
      // }
      // if (subscriptionData.couponId) {
      //   body.set('couponId', subscriptionData.couponId.toString());
      // }
      if (subscriptionData.trial_period_days) {
        body.set('trial_period_days', subscriptionData.trial_period_days.toString());
      }
      // if (subscriptionData.periods_number) {
      //   body.set('periods_number', subscriptionData.periods_number.toString());
      // }

      return this.http.post<CreateSubscriptionResponse>(url, body.toString(), { headers });
    }
  }

  createPayment(paymentRequest: FlowPaymentRequest): Observable<FlowPaymentResponse> {

    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}payment/create.ts`;
      return this.http.post<FlowPaymentResponse>(url, paymentRequest);
    }
    else {
      const url = `${this.apiUrlLocal}/payment/create`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const toSign = { apiKey: this.apiKey, ...paymentRequest };
      const body = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('amount', paymentRequest.amount.toString())
        .set('currency', paymentRequest.currency)
        .set('commerceOrder', paymentRequest.commerceOrder)
        .set('subject', paymentRequest.subject)
        .set('email', paymentRequest.email)
        .set('urlReturn', paymentRequest.urlReturn)
        .set('urlConfirmation', paymentRequest.urlConfirmation)
        .set('paymentMethod', paymentRequest.paymentMethod?.toString() ?? '9')
        .set('s', this.getFlowSignature(toSign));
      return this.http.post<FlowPaymentResponse>(url, body.toString(), { headers });
    }

  }

  /**
   * Obtiene la lista paginada de suscripciones de un cliente
   * @param customerId Identificador del cliente
   * @param start Número de registro de inicio de la página
   * @param limit Número de registros por página
   * @param filter Filtro por el identificador de la suscripción
   * @returns Observable con la respuesta de suscripciones
   */
  getSubscriptions(
    customerId: string, 
    start?: number, 
    limit?: number, 
    filter?: string
  ): Observable<FlowSubscriptionsResponse> {
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/getSubscriptions`;
      const params: Record<string, string> = {
        apiKey: this.apiKey,
        customerId
      };
      
      if (start !== undefined) params["start"] = start.toString();
      if (limit !== undefined) params["limit"] = limit.toString();
      if (filter !== undefined) params["filter"] = filter;
      
      params["s"] = this.getFlowSignature(params);
      
      return this.http.get<FlowSubscriptionsResponse>(url, { params });
    } else {
      const url = `${this.apiUrlLocal}/customer/getSubscriptions`;
      
      // Construir objeto para firmar
      const toSign: Record<string, string | number> = {
        apiKey: this.apiKey,
        customerId
      };
      
      if (start !== undefined) toSign["start"] = start;
      if (limit !== undefined) toSign["limit"] = limit;
      if (filter !== undefined) toSign["filter"] = filter;
      
      // Construir parámetros
      let params = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('customerId', customerId);
        
      if (start !== undefined) params = params.set('start', start.toString());
      if (limit !== undefined) params = params.set('limit', limit.toString());
      if (filter !== undefined) params = params.set('filter', filter);
      
      // Agregar firma
      params = params.set('s', this.getFlowSignature(toSign));
      
      return this.http.get<FlowSubscriptionsResponse>(url, { params });
    }
  }

  /**
   * Obtiene el historial de cobros de un cliente de Flow
   * @param customerId ID del cliente en Flow
   * @param limit Límite de registros a obtener
   * @returns Observable con la respuesta de cobros
   */
  getCharges(customerId: string, limit: number = 10): Observable<FlowChargesResponse> {
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}customer/getCharges.ts`;
      return this.http.get<FlowChargesResponse>(url, { params: { customerId, limit: limit.toString() } });
    }
    else {
      const url = `${this.apiUrlLocal}/customer/getCharges`;
      const toSign = { apiKey: this.apiKey, customerId, limit: limit.toString() };
      const params = new HttpParams()
        .set('customerId', customerId)
        .set('limit', limit.toString())
        .set('apiKey', this.apiKey)
        .set('s', this.getFlowSignature(toSign));
      return this.http.get<FlowChargesResponse>(url, { params });
    }
  }

  /**
   * Cancela una suscripción en Flow
   * @param subscriptionId ID de la suscripción a cancelar
   * @param atPeriodEnd 0 para cancelación inmediata, 1 para cancelar al final del período vigente
   * @returns Observable con la respuesta de cancelación
   */
  cancelSubscription(subscriptionId: string, atPeriodEnd: AtPeriodEnd): Observable<any> {
    if (environment.production || !this.useProxy) {
      const url = `${this.apiUrl}subscription/cancel.ts`;
      const requestData = {
        apiKey: this.apiKey,
        subscriptionId,
        at_period_end: atPeriodEnd,
        s: this.getFlowSignature({ apiKey: this.apiKey, subscriptionId, at_period_end: atPeriodEnd })
      };
      return this.http.post<any>(url, requestData);
    }
    else {
      const url = `${this.apiUrlLocal}/subscription/cancel`;
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      const toSign = { apiKey: this.apiKey, subscriptionId, at_period_end: atPeriodEnd };
      const body = new HttpParams()
        .set('apiKey', this.apiKey)
        .set('subscriptionId', subscriptionId)
        .set('at_period_end', atPeriodEnd.toString())
        .set('s', this.getFlowSignature(toSign));
      
      return this.http.post<any>(url, body.toString(), { headers });
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


