import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal, computed, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { AccordionGroupComponent } from '../../../../../../shared/ui/accordion/accordion-group.component';
import { AccordionItemComponent } from '../../../../../../shared/ui/accordion/accordion-item.component';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../../../shared/ui/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { CreditTransactionService } from '../../../../../../shared/services/credit-transactions.service';
import { catchError, finalize, of } from 'rxjs';
import { UserResponse } from '../../../../../../shared/interfaces/auth.interfaces';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { environment } from '../../../../../../../environments/env';
import { LoyaltyTierImageRoutes } from '../../../../../../shared/interfaces/loyalty.interfaces';
import { LoyaltyService } from '../../../../../../shared/services/loyalty.service';
import { UserDetailResponse } from '../../../../../../shared/interfaces/user.interfaces';
import { UserService } from '../../../../../../shared/services/user.service';
import { LoyaltyProductService } from '../../../../../../shared/services/loyalty-product.service';
import { LoyaltyProduct } from '../../../../../../shared/interfaces/loyalty-product.interfaces';

// Nota: la interfaz `LoyaltyProduct` y el catálogo antes hardcodeados
// (`PRODUCTS_CONFIG`) ahora vienen del backend vía
// `LoyaltyProductService.getBySlug()`. Ver shared/interfaces/loyalty-product.interfaces.ts.

@Component({
    selector: 'app-clothing',
    imports: [ButtonComponent, NgOptimizedImage, RouterLink, AccordionGroupComponent, AccordionItemComponent, BreadcrumbComponent],
    templateUrl: './clothing.component.html',
    styleUrl: './clothing.component.css'
})
export class ClothingComponent implements OnInit {

  // Servicios inyectados
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private creditService = inject(CreditTransactionService);
  private _toastService = inject(ToastService);
  private _loyaltyService = inject(LoyaltyService);
  private _userService = inject(UserService);
  private _loyaltyProductService = inject(LoyaltyProductService);
  private destroyRef = inject(DestroyRef);

  // Signals para el estado del componente
  readonly slug = signal<string>('');
  readonly currentProduct = signal<LoyaltyProduct | null>(null);
  /**
   * True mientras el GET /loyalty-products/by-slug/:slug está en vuelo.
   * Inicializa en `true` para que el primer render (SSR + hidratación) ya
   * pinte el skeleton sin parpadeo. Se desactiva en next/error.
   */
  readonly isLoadingProduct = signal<boolean>(true);
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<UserResponse | null>(null);
  readonly userCredits = signal<number>(0);
  readonly isLoadingCredits = signal<boolean>(false);
  isLoadingBuyProduct = signal<boolean>(false);
  readonly creditsError = signal<string | null>(null);

  // Computed signals para valores derivados
  readonly productName = computed(() => this.currentProduct()?.name || '');

  readonly breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    { label: 'Inicio', link: '/' },
    { label: 'Tienda de Lealtad', link: '/loyalty-webshop' },
    { label: this.productName() || 'Artículo' },
  ]);
  readonly productPrice = computed(() => this.currentProduct()?.price || 0);
  readonly productDescription = computed(() => this.currentProduct()?.description || '');
  readonly productImage = computed(() => this.currentProduct()?.image || '');
  readonly productColor = computed(() => this.currentProduct()?.color || '');
  readonly productFeatures = computed(() => this.currentProduct()?.features || []);
  readonly isOutOfStock = computed(() => this.currentProduct()?.is_out_of_stock || false);
  readonly isLogged = computed(() => this.isAuthenticated());
  readonly magropointImg = computed(() => this.currentProduct()?.magropoint_img || '');
  readonly tier = computed(() => this.currentProduct()?.tier || '');
  readonly isTierValid = computed(() => {
    switch (this.currentProduct()?.tier.toLocaleLowerCase()) {
      case 'oro':
        console.log('isTierValid', this.tierDisplayName());
        if(this.tierDisplayName() == 'carbon' || this.tierDisplayName() == 'bronce' || this.tierDisplayName() == 'plata') {
          return false
        }else{
          return true
        }
      case 'platino':
        if(this.tierDisplayName() == 'carbon' || this.tierDisplayName() == 'bronce' || this.tierDisplayName() == 'plata' || this.tierDisplayName() == 'oro') {
          return false
        }else{
          return true
        }
      case 'diamante':
        if(this.tierDisplayName() == 'diamante' ) {
          return true
        }else{
          return false
        }
      case 'plata':
        if(this.tierDisplayName() == 'carbon' || this.tierDisplayName() == 'bronce') {
          return false
        }else{
          return true
        }
      case 'bronce':
        if(this.tierDisplayName() == 'carbon') {
          return false
        }else{
          return true
        }
      default:
        return false;
    }
  });

  // Computed para mostrar información de créditos
  readonly canAffordProduct = computed(() => {
    const product = this.currentProduct();
    const credits = this.userCredits();
    return product ? credits >= product.price : false;
  });

  readonly creditsDifference = computed(() => {
    const product = this.currentProduct();
    const credits = this.userCredits();
    return product ? Math.abs(credits - product.price) : 0;
  });

     user: UserDetailResponse | null = null;
    // Tier y imagen dinámica
    tierImageRoutes: LoyaltyTierImageRoutes | null = null;
    tierDisplayName = signal<string>('MagroPoints');
    isLoadingTier = true;
  
  constructor() {
    // Effect para cargar créditos cuando el usuario cambia
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.loadUserCredits(user.id);
      }
    });
  }

  ngOnInit(): void {
    this.loadRouteData();
    this.loadAuthState();
    this.loadUserData();
  }

  buyProduct() {
    console.log('buyProduct');
    this.isLoadingBuyProduct.set(true);
    //emular llamado de 3 seggundos y mostar toast de error para que se comunique con ENV.numero 
    setTimeout(() => {
     this._toastService.error('Ups!', 'No se pudo canjear el producto, por favor intenta más tarde o contacta a soporte: +'+ environment.telefonoAtencionClientes);
     this.isLoadingBuyProduct.set(false);
    }, 2000);
   }

  /**
   * Cargar datos de la ruta y producto desde el backend.
   * Reemplaza el lookup en `PRODUCTS_CONFIG` hardcodeado por una
   * consulta al endpoint `GET /api/v1/loyalty-products/by-slug/:slug`.
   *
   * El template muestra un skeleton mientras `isLoadingProduct() === true`
   * y un estado "no encontrado" si termina la carga pero `currentProduct`
   * sigue en null.
   */
  private loadRouteData(): void {
    const slugFromRoute = this.route.snapshot.params['slug'];
    this.slug.set(slugFromRoute);
    this.isLoadingProduct.set(true);

    this._loyaltyProductService
      .getBySlug(slugFromRoute)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => {
          this.currentProduct.set(r.data.loyaltyProduct);
          this.isLoadingProduct.set(false);
        },
        error: err => {
          console.error(`Product not found for slug: ${slugFromRoute}`, err);
          this.currentProduct.set(null);
          this.isLoadingProduct.set(false);
        },
      });
  }

  /**
   * Cargar estado de autenticación
   */
  private loadAuthState(): void {
    // Cargar estado inicial de autenticación
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.currentUser.set(this.authService.getCurrentUser());

    // Suscribirse a cambios en el estado de autenticación
    this.authService.isAuthenticated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(isAuth => {
        this.isAuthenticated.set(isAuth);
      });

    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.currentUser.set(user);
      });
  }

  /**
   * Cargar créditos del usuario
   */
  private loadUserCredits(userId: string): void {
    this.isLoadingCredits.set(true);
    this.creditsError.set(null);

    this.creditService.getTotalCredits(userId).pipe(
      catchError(error => {
        console.error('Error loading user credits:', error);
        this.creditsError.set('Error al cargar los créditos');
        return of(null);
      }),
      finalize(() => this.isLoadingCredits.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(response => {
      if (response && response.status === 'success') {
        const credits = parseFloat(response.data.totalCredits) || 0;
        this.userCredits.set(credits);
      }
    });
  }

  /**
   * Helper síncrono que retorna el producto cargado solo si su slug
   * matchea el solicitado. Si lo solicitas por un slug distinto al
   * actualmente cargado, devuelve null (el caller debería navegar a la
   * ruta nueva, que dispara loadRouteData).
   */
  getProductBySlug(slug: string): LoyaltyProduct | null {
    const current = this.currentProduct();
    return current && current.slug === slug ? current : null;
  }

  /**
   * Refrescar créditos del usuario
   */
  refreshUserCredits(): void {
    const user = this.currentUser();
    if (user) {
      this.loadUserCredits(user.id);
    }
  }

    private loadUserData() {
    this._userService.getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          console.log('user', user);
          this.user = user;
          // Cargar créditos y tier después de obtener el usuario
          this.loadUserTier();
        },
        error: (error) => {
          console.error('Error al cargar datos del usuario:', error);
        }
      });
  }

    private loadUserTier() {
    this.isLoadingTier = true;
    const userId = this.user?.id;

    if (userId) {
      this._loyaltyService.getUserTierInfo(userId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (tierInfo) => {
            this.tierImageRoutes = tierInfo.imageRoutes;
            this.tierDisplayName.set(tierInfo.displayName.toLocaleLowerCase());
            this.isLoadingTier = false;
          },
          error: (error) => {
            console.error('Error al obtener tier del usuario:', error);
            // Mantener valores por defecto en caso de error
            this.tierImageRoutes = null;
            this.tierDisplayName.set('MagroPoints');
            this.isLoadingTier = false;
          }
        });
    } else {
      this.isLoadingTier = false;
    }
  }
}
