import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SubscriptionOrderService } from './subscription-order.service';
import { environment } from '../../../environments/env';
import {
  OrderStatusEnum,
  PaginatedSubscriptionOrdersResponse,
  SubscriptionOrder,
  SubscriptionOrderResponse
} from '../interfaces/subscription-order.interface';

describe('SubscriptionOrderService', () => {
  let service: SubscriptionOrderService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiMagroLabs}/api/v1/subscription-orders`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubscriptionOrderService]
    });
    
    service = TestBed.inject(SubscriptionOrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllSubscriptionOrders', () => {
    it('should return subscription orders with default pagination', () => {
      const mockSubscriptionOrder: SubscriptionOrder = {
        id: '1',
        subscription_id: 'sub-1',
        order_id: 'order-1',
        status: OrderStatusEnum.PENDING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: PaginatedSubscriptionOrdersResponse = {
        subscriptionOrders: [mockSubscriptionOrder],
        pagination: { total: 1, totalPages: 1, page: 1, limit: 10 }
      };

      service.getAllSubscriptionOrders().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}?page=1&limit=10&includeDeleted=false`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should add filters when provided', () => {
      const mockSubscriptionOrder: SubscriptionOrder = {
        id: '1',
        subscription_id: 'sub-1',
        order_id: 'order-1',
        status: OrderStatusEnum.PROCESSING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: PaginatedSubscriptionOrdersResponse = {
        subscriptionOrders: [mockSubscriptionOrder],
        pagination: { total: 1, totalPages: 1, page: 1, limit: 10 }
      };

      service
        .getAllSubscriptionOrders(1, 10, true, '123', OrderStatusEnum.PROCESSING)
        .subscribe(response => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        `${apiUrl}?page=1&limit=10&includeDeleted=true&subscriptionId=123&status=PROCESSING`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getSubscriptionOrderById', () => {
    it('should return a subscription order by id', () => {
      const mockSubscriptionOrder: SubscriptionOrder = {
        id: '1',
        subscription_id: 'sub-1',
        order_id: 'order-1',
        status: OrderStatusEnum.PENDING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: SubscriptionOrderResponse = {
        subscriptionOrder: mockSubscriptionOrder
      };

      const orderId = '1';

      service.getSubscriptionOrderById(orderId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${orderId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getOrdersBySubscriptionId', () => {
    it('should return orders for a specific subscription', () => {
      const mockSubscriptionOrder: SubscriptionOrder = {
        id: '1',
        subscription_id: 'sub-123',
        order_id: 'order-1',
        status: OrderStatusEnum.PENDING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: PaginatedSubscriptionOrdersResponse = {
        subscriptionOrders: [mockSubscriptionOrder],
        pagination: { total: 1, totalPages: 1, page: 1, limit: 10 }
      };

      const subscriptionId = 'sub-123';

      service.getOrdersBySubscriptionId(subscriptionId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/subscription/${subscriptionId}?page=1&limit=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('createSubscriptionOrder', () => {
    it('should create a new subscription order', () => {
      const mockData = {
        subscription_id: 'sub-123',
        order_id: 'order-123'
      };

      const mockSubscriptionOrder: SubscriptionOrder = {
        id: '1',
        subscription_id: mockData.subscription_id,
        order_id: mockData.order_id,
        status: OrderStatusEnum.PENDING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: SubscriptionOrderResponse = {
        subscriptionOrder: mockSubscriptionOrder
      };

      service.createSubscriptionOrder(mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  });

  describe('updateSubscriptionOrder', () => {
    it('should update an existing subscription order', () => {
      const orderId = '1';
      const mockData = {
        tracking_number: 'track-123',
        notes: 'Updated notes'
      };

      const mockSubscriptionOrder: SubscriptionOrder = {
        id: orderId,
        subscription_id: 'sub-123',
        order_id: 'order-123',
        tracking_number: mockData.tracking_number,
        notes: mockData.notes,
        status: OrderStatusEnum.PROCESSING,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: SubscriptionOrderResponse = {
        subscriptionOrder: mockSubscriptionOrder
      };

      service.updateSubscriptionOrder(orderId, mockData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${orderId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockData);
      req.flush(mockResponse);
    });
  });

  describe('updateSubscriptionOrderStatus', () => {
    it('should update a subscription order status', () => {
      const orderId = '1';
      const statusData = { status: OrderStatusEnum.SHIPPED };

      const mockSubscriptionOrder: SubscriptionOrder = {
        id: orderId,
        subscription_id: 'sub-123',
        order_id: 'order-123',
        status: OrderStatusEnum.SHIPPED,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      };

      const mockResponse: SubscriptionOrderResponse = {
        subscriptionOrder: mockSubscriptionOrder
      };

      service.updateSubscriptionOrderStatus(orderId, statusData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${orderId}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(statusData);
      req.flush(mockResponse);
    });
  });

  describe('deleteSubscriptionOrder', () => {
    it('should delete a subscription order', () => {
      const orderId = '1';

      service.deleteSubscriptionOrder(orderId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/${orderId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
}); 