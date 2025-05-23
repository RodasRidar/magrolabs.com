import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service';
import { OrderListResponse, OrderResponse, OrderStatus, OrderItemResponse } from '../../../shared/interfaces/order.interfaces';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FlowService } from '../../../shared/services/flow.service';
import { FlowPaymentMethod, FlowPaymentRequest } from '../../../shared/models/flow.model';
import { AuthService } from '../../../shared/services/auth.service';
import { environment } from '../../../../environments/env';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, ButtonComponent],
  templateUrl: './pedidos.component.html',
})
export class PedidosComponent implements OnInit {
  private _flowService = inject(FlowService);
  private _authService = inject(AuthService);
  ENV = environment;
  pedidos = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  selectedStatus = signal<OrderStatus | undefined | 'undefined'>(undefined);
  expandedProducts = signal<Record<string, boolean>>({});

  // Estados para el seguimiento de compra
  mostrarSeguimiento = signal<boolean>(false);
  pedidoSeleccionado = signal<OrderResponse | null>(null);

  statusOptions = [
    { value: undefined, label: 'Todos' },
    { value: 'PAID', label: 'Pagado' },
    { value: 'PENDING_PAYMENT', label: 'Pendiente' },
    { value: 'PROCESSING', label: 'En proceso' },
    { value: 'SHIPPED', label: 'Enviado' },
    { value: 'DELIVERED', label: 'Entregado' },
    { value: 'CANCELLED', label: 'Cancelado' },
    { value: 'REFUNDED', label: 'Reembolsado' },
    { value: 'REJECTED', label: 'Rechazado' }
  ];

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos(): void {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.selectedStatus() == 'undefined') {
      this.orderService.getMyOrders(
        this.currentPage(),
        10
      ).pipe(
        catchError(err => {
          this.error.set('Error al cargar tus pedidos. Por favor, inténtalo nuevamente.');
          return of({
            status: 'error',
            data: {
              orders: [],
              pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
              }
            }
          } as OrderListResponse);
        }),
        finalize(() => this.isLoading.set(false))
      ).subscribe(response => {
        console.log(response);
        this.pedidos.set(response.data.orders);
        this.totalPages.set(response.data.pagination.totalPages);
        this.initializeExpandedProducts();
      });
    } else {
      this.orderService.getMyOrders(
        this.currentPage(),
        10,
        this.selectedStatus() as OrderStatus
      ).pipe(
        catchError(err => {
          this.error.set('Error al cargar tus pedidos. Por favor, inténtalo nuevamente.');
          return of({
            status: 'error',
            data: {
              orders: [],
              pagination: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0
              }
            }
          } as OrderListResponse);
        }),
        finalize(() => this.isLoading.set(false))
      ).subscribe(response => {
        this.pedidos.set(response.data.orders);
        this.totalPages.set(response.data.pagination.totalPages);
        this.initializeExpandedProducts();
      });
    }
  }

  cambiarPagina(pagina: number): void {
    this.currentPage.set(pagina);
    this.cargarPedidos();
  }

  filtrarPorEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedStatus.set(selectElement.value as OrderStatus | undefined);
    this.currentPage.set(1);
    this.cargarPedidos();
  }

  cancelarPedido(orderId: string): void {
    if (confirm('¿Estás seguro que deseas cancelar este pedido?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          this.cargarPedidos();
        },
        error: () => {
          this.error.set('No se pudo cancelar el pedido. Por favor, inténtalo nuevamente.');
        }
      });
    }
  }

  formatearFechaCompleta(fecha: string): string {
    //TODO: Corregir validacion e incorporar fecha de creacion y actualizacion
    if (!fecha) return '';
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerTextoEstado(estado: string): string {
    const textos: Record<string, string> = {
      'PAID': 'Pagado',
      'PENDING_PAYMENT': 'Pendiente de pago',
      'PROCESSING': 'En proceso',
      'SHIPPED': 'Enviado',
      'DELIVERED': 'Entregado',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Reembolsado',
      'REJECTED': 'Rechazado'
    };

    return textos[estado] || estado;
  }

  generarArrayPaginas(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  toggleProductExpand(productId: string): void {
    const currentExpanded = this.expandedProducts();
    this.expandedProducts.set({
      ...currentExpanded,
      [productId]: !currentExpanded[productId]
    });
  }

  isProductExpanded(productId: string): boolean {
    return !!this.expandedProducts()[productId];
  }

  initializeExpandedProducts(): void {
    const expandedState: Record<string, boolean> = {};
    this.pedidos().forEach(pedido => {
      pedido.orderItems.forEach(item => {
        expandedState[item.id] = false;
      });
    });
    this.expandedProducts.set(expandedState);
  }

  getImageUrl(item: OrderItemResponse): string {
    if (item.product && item.product.images && item.product.images.length > 0) {
      return item.product.images[0].image_url;
    }
    return '/product-img-not-found';
  }

  escribirResena(orderId: string, productId: string): void {
    // Aquí se implementaría la lógica para redirigir a la página de escribir reseña
    // o mostrar un modal para escribir la reseña
    console.log(`Escribir reseña para producto ${productId} de la orden ${orderId}`);
  }

  seguirCompra(orderId: string): void {
    const pedido = this.pedidos().find(p => p.id === orderId);
    if (pedido) {
      this.pedidoSeleccionado.set(pedido);
      this.mostrarSeguimiento.set(true);
    }
  }

  cerrarSeguimiento(): void {
    this.mostrarSeguimiento.set(false);
    this.pedidoSeleccionado.set(null);
  }

  descargarBoleta(orderId: string): void {
    //TODO Implementar la lógica para descargar la boleta
    alert(`Para descargar la boleta del Pedido #${orderId.slice(0, 8)}, por favor contacta al número de WhatsApp +${this.ENV.telefonoAtencionClientes}.`);
  }

  pagarPedido(orderId: string, totalAmount: number, orderNumber: string): void {
    let createPaymentRequest = this.createPaymentRequest(totalAmount, orderNumber);
    createPaymentRequest.commerceOrder = orderId;

    this._flowService.createPayment(createPaymentRequest).subscribe({
      next: (paymentResponse) => {
        window.location.href = paymentResponse.url + '?token=' + paymentResponse.token;
      },
      error: (err) => {
        console.error('Error al redirigir el pago:', err);
      }
    });
  }
  
  private createPaymentRequest(totalAmount: number, orderNumber: string): FlowPaymentRequest {

    const user = this._authService.getCurrentUser();
    return {
      amount: totalAmount,
      currency: 'PEN',
      commerceOrder: orderNumber,
      subject: 'Pago de Pedido #' + orderNumber.slice(0, 8),
      email: user?.email ?? '',
      paymentMethod: FlowPaymentMethod.DEBIT_CREDIT_CARD,
      urlReturn: this.ENV.flowUrlReturnPagoPorAdmin,
      urlConfirmation: this.ENV.flowUrlConfirmation
    };
  }
}
