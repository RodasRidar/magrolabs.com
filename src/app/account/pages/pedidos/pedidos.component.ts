import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../shared/services/order.service';
import { OrderListResponse, OrderResponse, OrderStatus, OrderItemResponse } from '../../../shared/interfaces/order.interfaces';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { FlowService } from '../../../shared/services/flow.service';
import { FlowPaymentMethod, FlowPaymentRequest } from '../../../shared/models/flow.model';
import { AuthService } from '../../../shared/services/auth.service';
import { environment } from '../../../../environments/env';
import { SeoService } from '../../../shared/services/seo.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { BadgeComponent, BadgeColor } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './pedidos.component.html',
})
export class PedidosComponent implements OnInit {
  private _flowService = inject(FlowService);
  private _authService = inject(AuthService);
  private _seoService = inject(SeoService);
  ENV = environment;
  pedidos = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  selectedStatus = signal<OrderStatus | undefined | 'undefined'>(undefined);
  expandedProducts = signal<Record<string, boolean>>({});
  private _router = inject(Router);

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
    // Configuración SEO para página de pedidos de usuario
    this.configureSEO();
    
    this.cargarPedidos();
  }

  /**
   * Configura los metadatos SEO para la página de pedidos de usuario.
   * Esta página no debe ser indexada por los motores de búsqueda debido a que contiene
   * información privada del usuario sobre sus compras y pedidos.
   */
  private configureSEO(): void {
    // Establecer el título de la página
    this._seoService.setTitle('Mis Pedidos | Magrolabs');
    
    // Configurar para que no sea indexada por robots
    this._seoService.setIndexFollow(false);
    
    // Establecer descripción (aunque no se indexe, es buena práctica)
    this._seoService.setDescription('Historial de pedidos y compras de usuario de Magrolabs. Acceso restringido.');
    
    // Configurar meta robots adicionales para mayor seguridad
    this._seoService.meta.updateTag({ name: 'robots', content: 'noindex,nofollow,noarchive,nosnippet,noimageindex' });
    
    // Configurar X-Robots-Tag para mayor protección
    this._seoService.meta.updateTag({ name: 'X-Robots-Tag', content: 'noindex,nofollow' });
    
    // Evitar caché del contenido en buscadores
    this._seoService.meta.updateTag({ name: 'cache-control', content: 'no-cache, no-store, must-revalidate' });
    this._seoService.meta.updateTag({ name: 'pragma', content: 'no-cache' });
    this._seoService.meta.updateTag({ name: 'expires', content: '0' });
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
    
    // La fecha de la BD viene como si fuera UTC, pero es hora de Lima
    // Sumamos 5 horas para compensar
    const date = new Date(fecha);
    date.setHours(date.getHours() + 5);
    
    // Formatear en hora de Lima
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Lima'
    });
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

  getOrderStatusColor(status: string): BadgeColor {
    const map: Record<string, BadgeColor> = {
      PENDING_PAYMENT: 'yellow',
      PROCESSING:      'blue',
      SHIPPED:         'indigo',
      DELIVERED:       'green',
      CANCELLED:       'red',
      REJECTED:        'red',
      PAID:            'gray',
      REFUNDED:        'gray',
    };
    return map[status] ?? 'gray';
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
    const pedidos = this.pedidos();
    
    pedidos.forEach((pedido, index) => {
      // La última orden (primera en la lista) se muestra expandida
      const isUltimaOrden = index === 0;
      
      pedido.orderItems.forEach(item => {
        expandedState[item.id] = isUltimaOrden;
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

  escribirResena(productId: string): void {
    const slug = this.getSlug(productId);
    window.open(`/productos/creatinas/${slug}?review=true`, '_blank');
  }

  private getSlug(productId: string): string {
    const auxSlug: { [key: string]: string } = {
      '00000001-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
      '00000003-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
      '00000002-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-100-gr',
      '00000004-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-3-kg',
      '00000005-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-3-kg',
      '00000006-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
      '00000007-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
      '00000008-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-100-gr',
      '00000009-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
      '000000010-50eb-4ac3-aa94-1b64fbf32b9c': 'creatina-monohidratada-250-gr',
    };
    
    return auxSlug[productId] || productId;
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

  /**
   * Genera la URL de seguimiento de Olva Courier
   * @param trackingNumber - Número de tracking en formato "25-36710008"
   * @returns URL completa de seguimiento o null si el formato es inválido
   */
  generarUrlOlvaCourier(trackingNumber: string | undefined): string | null {
    console.log('Generando URL de seguimiento para tracking number:', trackingNumber);
    if (!trackingNumber) return null;
    
    // Normalizar diferentes tipos de guiones a guion estándar
    // Esto maneja: guion normal (-), guion no rompible (‑), guion medio (–), guion largo (—)
    const trackingNormalizado = trackingNumber.replace(/[-‑–—]/g, '-');
    
    // Separar el número de tracking por el guion
    const partes = trackingNormalizado.split('-');
    
    // Validar que tenga exactamente 2 partes
    if (partes.length !== 2) return null;
    
    const emision = partes[0]; // "25"
    const tracking = partes[1]; // "36710008"
    
    return `https://tracking.olvaexpress.pe/?emision=${emision}&tracking=${tracking}`;
  }

  /**
   * Abre el seguimiento de Olva Courier en una nueva pestaña
   */
  abrirSeguimientoOlva(): void {
    const trackingNumber = this.pedidoSeleccionado()?.trackingNumber;
    const url = this.generarUrlOlvaCourier(trackingNumber);
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Número de seguimiento no disponible o inválido');
    }
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
      amount: localStorage.getItem('TEST-PROD-TWO-SOLES') == 'TEST-PROD-TWO-SOLES' ? 2 : totalAmount,
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
