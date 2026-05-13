import { Injectable } from '@angular/core';
import { SHA256 } from 'crypto-es';
import { environment } from '../../../environments/env';

declare global {
  interface Window {
    ttq: any;
  }
}

export interface TikTokContent {
  content_id: string;
  content_type: 'product' | 'product_group';
  content_name: string;
}

export interface TikTokTrackingOptions {
  contents?: TikTokContent[];
  value?: number;
  currency?: string;
}

export interface TikTokIdentifyData {
  email?: string;
  phone_number?: string;
  external_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TiktokAnalyticsService {

  constructor() { 
  }
  /**
   * Verifica si TikTok Pixel está disponible
   */
  private isTikTokAvailable(): boolean {
    return typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function';
  }

  /**
   * Hash de datos PII con SHA-256
   */
  private hashData(data: string): string {
    return SHA256(data.toLowerCase().trim()).toString();
  }

  /**
   * Identifica al usuario con datos PII hasheados
   */
  identify(data: TikTokIdentifyData): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }
    const identifyPayload: any = {};

    if (data.email) {
      identifyPayload.email = this.hashData(data.email);
    }

    if (data.phone_number) {
      identifyPayload.phone_number = this.hashData(data.phone_number);
    }

    if (data.external_id) {
      identifyPayload.external_id = this.hashData(data.external_id);
    }

    try {
      window.ttq.identify(identifyPayload);
      console.log('TikTok Identify enviado:', identifyPayload);
    } catch (error) {
      console.error('Error al enviar TikTok Identify:', error);
    }
  }

  /**
   * Envía evento ViewContent - cuando un usuario ve una página de producto
   */
  trackViewContent(options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }

    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track('ViewContent', payload);
      console.log('TikTok ViewContent enviado:', payload);
    } catch (error) {
      console.error('Error al enviar TikTok ViewContent:', error);
    }
  }

  /**
   * Envía evento AddToCart - cuando un usuario añade un producto al carrito
   */
  trackAddToCart(options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }

    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track('AddToCart', payload);
      console.log('TikTok AddToCart enviado:', payload);
    } catch (error) {
      console.error('Error al enviar TikTok AddToCart:', error);
    }
  }

  /**
   * Envía evento InitiateCheckout - cuando un usuario inicia el proceso de checkout
   */
  trackInitiateCheckout(options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }

    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track('InitiateCheckout', payload);
      console.log('TikTok InitiateCheckout enviado:', payload);
    } catch (error) {
      console.error('Error al enviar TikTok InitiateCheckout:', error);
    }
  }

  /**
   * Envía evento CompleteRegistration - cuando un usuario completa el registro
   */
  trackCompleteRegistration(options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }

    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track('CompleteRegistration', payload);
      console.log('TikTok CompleteRegistration enviado:', payload);
    } catch (error) {
      console.error('Error al enviar TikTok CompleteRegistration:', error);
    }
  }

  /**
   * Envía evento Purchase - cuando un usuario completa una compra
   */
  trackPurchase(options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }

    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track('Purchase', payload);
      console.log('TikTok Purchase enviado:', payload);
    } catch (error) {
      console.error('Error al enviar TikTok Purchase:', error);
    }
  }

  /**
   * Método genérico para enviar cualquier evento personalizado
   */
  trackCustomEvent(eventName: string, options: TikTokTrackingOptions): void {
    if (!this.isTikTokAvailable()) {
      console.warn('TikTok Pixel no está disponible');
      return;
    }

    if (!environment.tiktokTrackingEnabled) {
    return;
    }
    
    const payload: any = {};

    if (options.contents) {
      payload.contents = options.contents;
    }

    if (options.value !== undefined) {
      payload.value = options.value;
    }

    if (options.currency) {
      payload.currency = options.currency;
    }

    try {
      window.ttq.track(eventName, payload);
      console.log(`TikTok ${eventName} enviado:`, payload);
    } catch (error) {
      console.error(`Error al enviar TikTok ${eventName}:`, error);
    }
  }
}
