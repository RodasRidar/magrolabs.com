import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmailService, WelcomeEmailResponse } from './email.service';
import { environment } from '../../../environments/env';

describe('EmailService', () => {
  let service: EmailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmailService]
    });
    service = TestBed.inject(EmailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', () => {
      const testEmail = 'test@example.com';
      const mockResponse: WelcomeEmailResponse = {
        success: true,
        message: 'Email enviado exitosamente'
      };

      service.sendWelcomeEmail(testEmail).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiMagroLabs}/email/welcome`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: testEmail });
      req.flush(mockResponse);
    });
  });

  describe('sendWelcomeEmailWithValidation', () => {
    it('should send email when valid email is provided', () => {
      const testEmail = 'valid@example.com';
      const mockResponse: WelcomeEmailResponse = {
        success: true,
        message: 'Email enviado exitosamente'
      };

      service.sendWelcomeEmailWithValidation(testEmail).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiMagroLabs}/email/welcome`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: testEmail });
      req.flush(mockResponse);
    });

    it('should throw error when invalid email is provided', () => {
      const invalidEmail = 'invalid-email';

      expect(() => {
        service.sendWelcomeEmailWithValidation(invalidEmail);
      }).toThrowError('Formato de email inválido');
    });

    it('should validate email format correctly', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'valid_email@test-domain.org'
      ];

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@example',
        ''
      ];

      validEmails.forEach(email => {
        expect(() => {
          service.sendWelcomeEmailWithValidation(email);
        }).not.toThrow();
      });

      invalidEmails.forEach(email => {
        expect(() => {
          service.sendWelcomeEmailWithValidation(email);
        }).toThrowError('Formato de email inválido');
      });
    });
  });
}); 