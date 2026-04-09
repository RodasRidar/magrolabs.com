import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/env';
import {
  MetaTrackResponse,
  TrackAddPaymentInfoRequest,
  TrackAddToCartRequest,
  TrackCompleteRegistrationRequest,
  TrackLoginRequest,
  TrackPurchaseRequest,
} from '../interfaces/meta.interfaces';

@Injectable({
  providedIn: 'root'
})
export class MetaApiService {
  private readonly API_URL = `${environment.apiMagroLabs}/track`;

  constructor(private http: HttpClient) { }

  trackLogin(body: TrackLoginRequest): Observable<MetaTrackResponse> {
    return this.http.post<MetaTrackResponse>(`${this.API_URL}/login`, body)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  trackCompleteRegistration(body: TrackCompleteRegistrationRequest): Observable<MetaTrackResponse> {
    return this.http.post<MetaTrackResponse>(`${this.API_URL}/complete-registration`, body)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  trackAddToCart(body: TrackAddToCartRequest): Observable<MetaTrackResponse> {
    return this.http.post<MetaTrackResponse>(`${this.API_URL}/add-to-cart`, body)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  trackAddPaymentInfo(body: TrackAddPaymentInfoRequest): Observable<MetaTrackResponse> {
    return this.http.post<MetaTrackResponse>(`${this.API_URL}/add-payment-info`, body)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }

  trackPurchase(body: TrackPurchaseRequest): Observable<MetaTrackResponse> {
    return this.http.post<MetaTrackResponse>(`${this.API_URL}/purchase`, body)
      .pipe(
        catchError(error => throwError(() => error))
      );
  }
}
