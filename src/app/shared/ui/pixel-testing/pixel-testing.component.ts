import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetaAnalyticsService } from '../../services/meta-analytics.service';
import { PixelInitializationService } from '../../services/pixel-initialization.service';
import { TiktokAnalyticsService } from '../../services/tiktok-analytics.service';


@Component({
  selector: 'app-pixel-testing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pixel-testing.component.html',
  styleUrls: ['./pixel-testing.component.css']
})
export class PixelTestingComponent {
  private tiktokService = inject(TiktokAnalyticsService);
  private metaService = inject(MetaAnalyticsService);
  private pixelInitService = inject(PixelInitializationService);

  // Estado de los pixels
  pixelsStatus = {
    tiktok: false,
    meta: false
  };

  metaStatus = {
    initialized: false,
    enabled: false,
    pixelId: ''
  };

  // Datos de prueba para formularios
  testData = {
    email: 'test@example.com',
    phone: '+51987654321',
    externalId: 'user123',
    productId: 'creatina-250gr',
    productName: 'Creatina 250gr',
    value: 55,
    currency: 'PEN'
  };

  // Logs de eventos
  eventLogs: string[] = [];

  ngOnInit() {
    this.updatePixelStatus();
  }

  updatePixelStatus() {
    this.pixelsStatus = this.pixelInitService.arePixelsLoaded();
    this.metaStatus = this.metaService.getStatus();
  }

  // ==================== TikTok Events ====================

  testTikTokIdentify() {
    this.tiktokService.identify({
      email: this.testData.email,
      phone_number: this.testData.phone,
      external_id: this.testData.externalId
    });
    this.addLog('TikTok - Identify enviado con datos hasheados');
  }

  testTikTokViewContent() {
    this.tiktokService.trackViewContent({
      contents: [{
        content_id: this.testData.productId,
        content_type: 'product',
        content_name: this.testData.productName
      }],
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`TikTok - ViewContent: ${this.testData.productName}`);
  }

  testTikTokAddToCart() {
    this.tiktokService.trackAddToCart({
      contents: [{
        content_id: this.testData.productId,
        content_type: 'product',
        content_name: this.testData.productName
      }],
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`TikTok - AddToCart: ${this.testData.productName} - ${this.testData.currency} ${this.testData.value}`);
  }

  testTikTokInitiateCheckout() {
    this.tiktokService.trackInitiateCheckout({
      contents: [{
        content_id: this.testData.productId,
        content_type: 'product',
        content_name: this.testData.productName
      }],
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`TikTok - InitiateCheckout: ${this.testData.currency} ${this.testData.value}`);
  }

  testTikTokCompleteRegistration() {
    this.tiktokService.trackCompleteRegistration({
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog('TikTok - CompleteRegistration');
  }

  testTikTokPurchase() {
    this.tiktokService.trackPurchase({
      contents: [{
        content_id: this.testData.productId,
        content_type: 'product',
        content_name: this.testData.productName
      }],
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`TikTok - Purchase: ${this.testData.currency} ${this.testData.value}`);
  }

  // ==================== Meta Events ====================

  testMetaViewContent() {
    this.metaService.trackCustomEvent('ViewContent', {
      content_name: this.testData.productName,
      content_ids: [this.testData.productId],
      content_type: 'product',
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`Meta - ViewContent: ${this.testData.productName}`);
  }

  testMetaAddToCart() {
    this.metaService.trackAddToCart({
      content_name: this.testData.productName,
      content_ids: [this.testData.productId],
      content_type: 'product',
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog(`Meta - AddToCart: ${this.testData.productName} - ${this.testData.currency} ${this.testData.value}`);
  }

  testMetaInitiateCheckout() {
    this.metaService.trackInitiateCheckout({
      content_ids: [this.testData.productId],
      contents: [{ id: this.testData.productId, quantity: 1 }],
      value: this.testData.value,
      currency: this.testData.currency,
      num_items: 1
    });
    this.addLog(`Meta - InitiateCheckout: ${this.testData.currency} ${this.testData.value}`);
  }

  testMetaAddPaymentInfo() {
    this.metaService.trackAddPaymentInfo({
      content_ids: [this.testData.productId],
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog('Meta - AddPaymentInfo');
  }

  testMetaCompleteRegistration() {
    this.metaService.trackCompleteRegistration({
      content_name: 'Registro completado',
      status: true,
      value: this.testData.value,
      currency: this.testData.currency
    });
    this.addLog('Meta - CompleteRegistration');
  }

  testMetaPurchase() {
    this.metaService.trackPurchase({
      content_ids: [this.testData.productId],
      contents: [{ id: this.testData.productId, quantity: 1 }],
      value: this.testData.value,
      currency: this.testData.currency,
      num_items: 1
    });
    this.addLog(`Meta - Purchase: ${this.testData.currency} ${this.testData.value}`);
  }

  testMetaStartTrial() {
    this.metaService.trackStartTrial({
      content_name: 'Trial de Creatina',
      value: this.testData.value,
      currency: this.testData.currency,
      predicted_ltv: 300
    });
    this.addLog(`Meta - StartTrial: ${this.testData.currency} ${this.testData.value}`);
  }

  testMetaSubscribe() {
    this.metaService.trackSubscribe({
      content_name: 'Suscripción Creatina Mensual',
      value: this.testData.value,
      currency: this.testData.currency,
      predicted_ltv: 660
    });
    this.addLog(`Meta - Subscribe: ${this.testData.currency} ${this.testData.value}`);
  }

  // ==================== Utilidades ====================

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.eventLogs.unshift(`[${timestamp}] ${message}`);
    if (this.eventLogs.length > 50) {
      this.eventLogs.pop();
    }
  }

  clearLogs() {
    this.eventLogs = [];
  }

  testAllTikTokEvents() {
    this.testTikTokIdentify();
    setTimeout(() => this.testTikTokViewContent(), 500);
    setTimeout(() => this.testTikTokAddToCart(), 1000);
    setTimeout(() => this.testTikTokInitiateCheckout(), 1500);
    setTimeout(() => this.testTikTokCompleteRegistration(), 2000);
    setTimeout(() => this.testTikTokPurchase(), 2500);
    this.addLog('🚀 Ejecutando todos los eventos de TikTok en secuencia...');
  }

  testAllMetaEvents() {
    this.testMetaViewContent();
    setTimeout(() => this.testMetaAddToCart(), 500);
    setTimeout(() => this.testMetaInitiateCheckout(), 1000);
    setTimeout(() => this.testMetaAddPaymentInfo(), 1500);
    setTimeout(() => this.testMetaCompleteRegistration(), 2000);
    setTimeout(() => this.testMetaStartTrial(), 2500);
    setTimeout(() => this.testMetaSubscribe(), 3000);
    setTimeout(() => this.testMetaPurchase(), 3500);
    this.addLog('🚀 Ejecutando todos los eventos de Meta en secuencia...');
  }
}
