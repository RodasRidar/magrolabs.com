import { TestBed } from '@angular/core/testing';
import { MetaAnalyticsService } from './meta-analytics.service';

describe('MetaAnalyticsService', () => {
  let service: MetaAnalyticsService;
  let mockFbq: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetaAnalyticsService);

    // Mock window.fbq
    mockFbq = jasmine.createSpy('fbq');
    (window as any).fbq = mockFbq;
  });

  afterEach(() => {
    // Limpiar mock
    delete (window as any).fbq;
    mockFbq.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should not initialize if disabled in config', () => {
      service.setEnabled(false);
      service.initialize();
      expect(service.getStatus().initialized).toBeFalsy();
    });

    it('should initialize when enabled and fbq exists', () => {
      service.setEnabled(true);
      service.initialize();
      expect(service.getStatus().initialized).toBeTruthy();
    });
  });

  describe('trackAddToCart', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track AddToCart event with required parameters', () => {
      const parameters = {
        value: 100,
        currency: 'USD',
        content_name: 'Test Product'
      };

      service.trackAddToCart(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'AddToCart', parameters);
    });

    it('should warn if required parameters are missing', () => {
      spyOn(console, 'warn');
      
      service.trackAddToCart({} as any);

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: AddToCart requiere value y currency');
      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('trackPurchase', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track Purchase event with required parameters', () => {
      const parameters = {
        value: 250,
        currency: 'USD',
        transaction_id: 'TXN123'
      };

      service.trackPurchase(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'Purchase', parameters);
    });

    it('should warn if required parameters are missing', () => {
      spyOn(console, 'warn');
      
      service.trackPurchase({} as any);

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: Purchase requiere value y currency');
      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('trackInitiateCheckout', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track InitiateCheckout event with parameters', () => {
      const parameters = {
        value: 150,
        currency: 'USD',
        num_items: 2
      };

      service.trackInitiateCheckout(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'InitiateCheckout', parameters);
    });

    it('should warn if required parameters are missing', () => {
      spyOn(console, 'warn');
      
      service.trackInitiateCheckout({} as any);

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: InitiateCheckout requiere value y currency');
      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('trackCompleteRegistration', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track CompleteRegistration event', () => {
      const parameters = {
        content_name: 'Newsletter Signup',
        status: true
      };

      service.trackCompleteRegistration(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'CompleteRegistration', parameters);
    });

    it('should track CompleteRegistration event without parameters', () => {
      service.trackCompleteRegistration();

      expect(mockFbq).toHaveBeenCalledWith('track', 'CompleteRegistration');
    });
  });

  describe('trackAddPaymentInfo', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track AddPaymentInfo event with parameters', () => {
      const parameters = {
        value: 100,
        currency: 'USD'
      };

      service.trackAddPaymentInfo(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'AddPaymentInfo', parameters);
    });

    it('should track AddPaymentInfo event without parameters', () => {
      service.trackAddPaymentInfo();

      expect(mockFbq).toHaveBeenCalledWith('track', 'AddPaymentInfo');
    });
  });

  describe('trackStartTrial', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track StartTrial event with required parameters', () => {
      const parameters = {
        value: 0,
        currency: 'USD',
        predicted_ltv: 100
      };

      service.trackStartTrial(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'StartTrial', parameters);
    });

    it('should warn if required parameters are missing', () => {
      spyOn(console, 'warn');
      
      service.trackStartTrial({} as any);

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: StartTrial requiere value y currency');
      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('trackSubscribe', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should track Subscribe event with required parameters', () => {
      const parameters = {
        value: 299,
        currency: 'USD',
        predicted_ltv: 1200
      };

      service.trackSubscribe(parameters);

      expect(mockFbq).toHaveBeenCalledWith('track', 'Subscribe', parameters);
    });

    it('should warn if required parameters are missing', () => {
      spyOn(console, 'warn');
      
      service.trackSubscribe({} as any);

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: Subscribe requiere value y currency');
      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('parameter cleaning', () => {
    beforeEach(() => {
      service.setEnabled(true);
    });

    it('should remove undefined and null parameters', () => {
      const parameters = {
        value: 100,
        currency: 'USD',
        content_name: 'Test',
        undefined_param: undefined,
        null_param: null
      };

      service.trackAddToCart(parameters as any);

      expect(mockFbq).toHaveBeenCalledWith('track', 'AddToCart', {
        value: 100,
        currency: 'USD',
        content_name: 'Test'
      });
    });
  });

  describe('service disabled', () => {
    beforeEach(() => {
      service.setEnabled(false);
      spyOn(console, 'log');
    });

    it('should not send events when disabled', () => {
      service.trackPurchase({ value: 100, currency: 'USD' });

      expect(mockFbq).not.toHaveBeenCalled();
    });
  });

  describe('fbq not available', () => {
    beforeEach(() => {
      service.setEnabled(true);
      delete (window as any).fbq;
      spyOn(console, 'warn');
    });

    it('should warn when fbq is not available', () => {
      service.trackPurchase({ value: 100, currency: 'USD' });

      expect(console.warn).toHaveBeenCalledWith('MetaAnalytics: Meta Pixel no está disponible');
    });
  });

  describe('getStatus', () => {
    it('should return service status', () => {
      const status = service.getStatus();

      expect(status.initialized).toBeDefined();
      expect(status.enabled).toBeDefined();
      expect(status.pixelId).toBeDefined();
      expect(typeof status.initialized).toBe('boolean');
      expect(typeof status.enabled).toBe('boolean');
      expect(typeof status.pixelId).toBe('string');
    });
  });

  describe('setEnabled', () => {
    it('should enable/disable the service', () => {
      service.setEnabled(false);
      expect(service.getStatus().enabled).toBeFalsy();

      service.setEnabled(true);
      expect(service.getStatus().enabled).toBeTruthy();
    });
  });
});