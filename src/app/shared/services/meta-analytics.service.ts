import { inject, Injectable } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import {
  MetaEventParameters,
  MetaPurchaseParameters,
  MetaSubscribeParameters,
  MetaStartTrialParameters,
  MetaAddToCartParameters,
  MetaInitiateCheckoutParameters,
  MetaCompleteRegistrationParameters,
  MetaAddPaymentInfoParameters,
  MetaAnalyticsConfig
} from '../types/meta-analytics.types';
import { environment } from '../../../environments/env';
import { MetaApiService } from './meta-api.service';
import { SummaryService } from './summary-service.service';

@Injectable({
  providedIn: 'root'
})
export class MetaAnalyticsService {
  private readonly _metaApi = inject(MetaApiService);
  private readonly _summary = inject(SummaryService);

  private config: MetaAnalyticsConfig = {
    pixelId: environment.meta?.pixelId || '',
    enabled: environment.meta?.enabled || false,
    debug: environment.meta?.debug || false
  };
  private isInitialized = false;

  /**
   * Inicializa el servicio de Meta Analytics
   * Se debe llamar una sola vez en la aplicación
   */
  initialize(): void {
    if (!this.config.enabled || !this.config.pixelId || this.isInitialized) {
      return;
    }

    try {
      // Verificar si Meta Pixel ya está cargado
      if (typeof window.fbq === 'function') {
        this.isInitialized = true;
        this.log('Meta Pixel ya está inicializado');
        return;
      }

      // El pixel de Meta se carga en index.html
      // Solo marcamos como inicializado si fbq existe
      if (typeof window.fbq === 'function') {
        this.isInitialized = true;
        this.log('Meta Analytics inicializado correctamente');
      }
    } catch (error) {
      console.error('Error al inicializar Meta Analytics:', error);
    }
  }

  /**
   * Rastrea el evento "Agregar información de pago"
   * Se dispara cuando el usuario agrega información de pago durante el checkout
   */
  trackAddPaymentInfo(parameters?: MetaAddPaymentInfoParameters): void {
    this.trackEvent('AddPaymentInfo', parameters);

    const userData = this._summary.getSummary()?.userData;
    if (userData?.email && userData?.nombre && userData?.apellido) {
      this._metaApi.trackAddPaymentInfo({
        email: userData.email,
        firstName: userData.nombre,
        lastName: userData.apellido,
        contentIds: parameters?.content_ids ?? [],
        value: String(parameters?.value ?? 0),
        contentType: parameters?.content_type,
        currency: parameters?.currency,
        contents: parameters?.contents?.map(c => ({ id: c.id, quantity: c.quantity }))
      }).pipe(catchError(() => EMPTY)).subscribe();
    }
  }

  /**
   * Rastrea el evento "Agregar al carrito"
   * Se dispara cuando se agrega un producto al carrito
   */
  trackAddToCart(parameters: MetaAddToCartParameters): void {
    if (!parameters.value || !parameters.currency) {
      console.warn('MetaAnalytics: AddToCart requiere value y currency');
      return;
    }
    this.trackEvent('AddToCart', parameters);

    const userData = this._summary.getSummary()?.userData;
    this._metaApi.trackAddToCart({
      contentIds: parameters.content_ids ?? [],
      value: String(parameters.value),
      email: userData?.email,
      contentType: parameters.content_type,
      currency: parameters.currency,
      contents: parameters.contents?.map(c => ({ id: c.id, quantity: c.quantity }))
    }).pipe(catchError(() => EMPTY)).subscribe();
  }

  /**
   * Rastrea el evento "Completar registro"
   * Se dispara cuando un usuario completa un registro
   */
  trackCompleteRegistration(parameters?: MetaCompleteRegistrationParameters): void {
    this.trackEvent('CompleteRegistration', parameters);

    const userData = this._summary.getSummary()?.userData;
    if (userData?.email && userData?.nombre && userData?.apellido) {
      this._metaApi.trackCompleteRegistration({
        email: userData.email,
        firstName: userData.nombre,
        lastName: userData.apellido
      }).pipe(catchError(() => EMPTY)).subscribe();
    }
  }

  /**
   * Rastrea el evento "Iniciar pago"
   * Se dispara cuando el usuario inicia el proceso de checkout
   */
  trackInitiateCheckout(parameters: MetaInitiateCheckoutParameters): void {
    if (!parameters.value || !parameters.currency) {
      console.warn('MetaAnalytics: InitiateCheckout requiere value y currency');
      return;
    }
    this.trackEvent('InitiateCheckout', parameters);

    const userData = this._summary.getSummary()?.userData;
    this._metaApi.trackInitiateCheckout({
      email: userData?.email,
      contentIds: parameters.content_ids ?? [],
      contentType: parameters.content_type,
      value: String(parameters.value),
      currency: parameters.currency,
      numItems: parameters.num_items,
    }).pipe(catchError(() => EMPTY)).subscribe();
  }

  /**
   * Rastrea el evento "Comprar"
   * Se dispara cuando se completa una compra
   */
  trackPurchase(parameters: MetaPurchaseParameters): void {
    if (!parameters.value || !parameters.currency) {
      console.warn('MetaAnalytics: Purchase requiere value y currency');
      return;
    }
    this.trackEvent('Purchase', parameters);

    const userData = this._summary.getSummary()?.userData;
    if (userData?.email && userData?.nombre && userData?.apellido) {
      this._metaApi.trackPurchase({
        email: userData.email,
        firstName: userData.nombre,
        lastName: userData.apellido,
        contentIds: parameters.content_ids ?? [],
        value: String(parameters.value),
        contentType: parameters.content_type,
        currency: parameters.currency
      }).pipe(catchError(() => EMPTY)).subscribe();
    }
  }

  /**
   * Rastrea el evento "Iniciar prueba"
   * Se dispara cuando el usuario inicia una prueba gratuita
   */
  trackStartTrial(parameters: MetaStartTrialParameters): void {
    if (!parameters.value || !parameters.currency) {
      console.warn('MetaAnalytics: StartTrial requiere value y currency');
      return;
    }
    this.trackEvent('StartTrial', parameters);
  }

  /**
   * Rastrea el evento "Suscribirse"
   * Se dispara cuando el usuario inicia una suscripción de pago
   */
  trackSubscribe(parameters: MetaSubscribeParameters): void {
    if (!parameters.value || !parameters.currency) {
      console.warn('MetaAnalytics: Subscribe requiere value y currency');
      return;
    }
    this.trackEvent('Subscribe', parameters);
  }

  trackPageView(): void {
    this.trackEvent('PageView');
  }

  /**
   * Método genérico para rastrear eventos personalizados
   */
  trackCustomEvent(eventName: string, parameters?: MetaEventParameters): void {
    this.trackEvent(eventName, parameters);
  }

  /**
   * Método privado para enviar eventos a Meta
   */
  private trackEvent(eventName: string, parameters?: MetaEventParameters): void {
    if (!this.config.enabled) {
      this.log(`Meta Analytics deshabilitado - Evento no enviado: ${eventName}`, parameters);
      return;
    }

    if (!this.config.pixelId) {
      console.warn('MetaAnalytics: Pixel ID no configurado');
      return;
    }

    if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
      console.warn('MetaAnalytics: Meta Pixel no está disponible');
      return;
    }

    try {
      // Limpiar parámetros undefined
      const cleanParameters = this.cleanParameters(parameters);
      
      if (cleanParameters && Object.keys(cleanParameters).length > 0) {
        window.fbq('track', eventName, cleanParameters);
        this.log(`Evento enviado: ${eventName}`, cleanParameters);
      } else {
        window.fbq('track', eventName);
        this.log(`Evento enviado: ${eventName}`);
      }
    } catch (error) {
      console.error(`Error al enviar evento ${eventName} a Meta:`, error);
    }
  }

  /**
   * Limpia los parámetros removiendo valores undefined y null
   */
  private cleanParameters(parameters?: MetaEventParameters): MetaEventParameters | undefined {
    if (!parameters) return undefined;

    const cleaned: MetaEventParameters = {};
    
    Object.keys(parameters).forEach(key => {
      const value = parameters[key];
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  /**
   * Logging condicional basado en la configuración de debug
   */
  private log(message: string, data?: any): void {
    if (this.config.debug) {
      if (data) {
        console.log(`[MetaAnalytics] ${message}`, data);
      } else {
        console.log(`[MetaAnalytics] ${message}`);
      }
    }
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus(): { initialized: boolean; enabled: boolean; pixelId: string } {
    return {
      initialized: this.isInitialized,
      enabled: this.config.enabled,
      pixelId: this.config.pixelId ? '***' + this.config.pixelId.slice(-4) : 'No configurado'
    };
  }

  /**
   * Habilita o deshabilita el tracking
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log(`Meta Analytics ${enabled ? 'habilitado' : 'deshabilitado'}`);
  }
}