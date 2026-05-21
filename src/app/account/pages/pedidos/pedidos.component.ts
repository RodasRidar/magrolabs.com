import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { getOrderStatusBadge, StatusBadge } from '../../../shared/utils/status-badge';
import { StepComponent } from '../../../ecommerce/signup/components/step/step.component';

interface ProductOption {
  id: string;
  name: string;
}

@Component({
    selector: 'app-pedidos',
    imports: [CommonModule, FormsModule, RouterModule, CurrencyPipe, ButtonComponent, CardComponent, BadgeComponent, StepComponent],
    templateUrl: './pedidos.component.html',
    styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  private _flowService = inject(FlowService);
  private _authService = inject(AuthService);
  private _seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);
  ENV = environment;
  pedidos = signal<OrderResponse[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  expandedProducts = signal<Record<string, boolean>>({});
  private _router = inject(Router);

  // Filtros client-side. Se aplican sobre `pedidos()` ya cargadas.
  filterStatus = signal<OrderStatus | ''>('');
  filterDateFrom = signal<string>('');
  filterDateTo = signal<string>('');
  filterProductId = signal<string>('');

  // Sheet móvil. `null` = cerrado.
  activeMobileFilter = signal<'status' | 'date' | 'product' | null>(null);

  // Estados para el seguimiento de compra
  mostrarSeguimiento = signal<boolean>(false);
  pedidoSeleccionado = signal<OrderResponse | null>(null);

  // Solo se ofrecen los estados que aparecen en los pedidos cargados. Evita
  // que el select muestre opciones que nunca van a filtrar nada.
  statusOptions = computed<{ value: OrderStatus | ''; label: string }[]>(() => {
    const present = new Set<OrderStatus>();
    for (const pedido of this.pedidos()) {
      present.add(pedido.status as OrderStatus);
    }
    const options: { value: OrderStatus | ''; label: string }[] = [
      { value: '', label: 'Todos' },
    ];
    for (const status of present) {
      options.push({ value: status, label: getOrderStatusBadge(status).label });
    }
    return options;
  });

  // Productos únicos derivados de los pedidos cargados. El select se muestra
  // solo si hay > 2 productos distintos.
  productOptions = computed<ProductOption[]>(() => {
    const seen = new Map<string, string>();
    for (const pedido of this.pedidos()) {
      for (const item of pedido.orderItems) {
        const id = item.product?.id;
        const name = item.product?.name;
        if (id && name && !seen.has(id)) seen.set(id, name);
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  showProductFilter = computed(() => this.productOptions().length > 2);

  hasActiveFilters = computed(() =>
    !!this.filterStatus() ||
    !!this.filterDateFrom() ||
    !!this.filterDateTo() ||
    !!this.filterProductId(),
  );

  // Conteos por chip (para badge numérico en los chips móviles).
  activeStatusCount = computed(() => this.filterStatus() ? 1 : 0);
  activeDateCount = computed(() => (this.filterDateFrom() ? 1 : 0) + (this.filterDateTo() ? 1 : 0));
  activeProductCount = computed(() => this.filterProductId() ? 1 : 0);

  // Pedidos filtrados client-side por estado + rango de fecha + producto.
  // Rango inclusivo. `dateFrom` compara contra inicio del día,
  // `dateTo` contra fin del día.
  pedidosFiltrados = computed<OrderResponse[]>(() => {
    const status = this.filterStatus();
    const productId = this.filterProductId();
    const from = this.filterDateFrom() ? new Date(this.filterDateFrom() + 'T00:00:00') : null;
    const to = this.filterDateTo() ? new Date(this.filterDateTo() + 'T23:59:59') : null;

    return this.pedidos().filter(pedido => {
      if (status && pedido.status !== status) return false;
      if (productId && !pedido.orderItems.some(i => i.product?.id === productId)) return false;
      if (from || to) {
        const created = new Date(pedido.created_at);
        if (from && created < from) return false;
        if (to && created > to) return false;
      }
      return true;
    });
  });

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
    this._seoService.setTitle('Pedidos | Magrolabs');
    
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

    this.orderService.getMyOrders(this.currentPage(), 10).pipe(
      catchError(() => {
        this.error.set('Error al cargar tus pedidos. Por favor, inténtalo nuevamente.');
        return of({
          status: 'error',
          data: {
            orders: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
          },
        } as OrderListResponse);
      }),
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(response => {
      this.pedidos.set(response.data.orders);
      this.totalPages.set(response.data.pagination.totalPages);
      this.initializeExpandedProducts();
    });
  }

  cambiarPagina(pagina: number): void {
    this.currentPage.set(pagina);
    this.cargarPedidos();
  }

  limpiarFiltros(): void {
    this.filterStatus.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterProductId.set('');
  }

  openMobileFilter(filter: 'status' | 'date' | 'product'): void {
    this.activeMobileFilter.set(filter);
  }

  closeMobileFilter(): void {
    this.activeMobileFilter.set(null);
  }

  cancelarPedido(orderId: string): void {
    if (confirm('¿Estás seguro que deseas cancelar este pedido?')) {
      this.orderService.cancelOrder(orderId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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

  orderBadge(status: string | undefined): StatusBadge {
    return getOrderStatusBadge(status);
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

  /**
   * Abre la pantalla de review del producto. El slug viene directo del
   * orderItem.product.slug (lo incluye el backend en su Prisma select).
   * Antes existía un mapping hardcoded ID → slug; ya no es necesario.
   */
  escribirResena(slug: string | undefined): void {
    if (!slug) return;
    window.open(`/productos/creatinas/${slug}?review=true`, '_blank');
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

    this._flowService.createPayment(createPaymentRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
