import { NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
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

// Interfaz para el producto
interface LoyaltyProduct {
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  color: string;
  category: string;
  features: string[];
  isOutOfStock: boolean;
  tier: string;
  magropointImg: string;
}

// Configuración estática de productos
const PRODUCTS_CONFIG: Record<string, LoyaltyProduct> = {
  'guantes-gimnasio-negro': {
    slug: 'guantes-gimnasio-negro',
    name: 'Guantes para gimnasio',
    price: 100,
    description: 'Nuestros guantes deportivos de alta calidad los puedes utilizar para levantar pesas, hacer crossfit, montar bicicleta e ir al gimnasio. Estos guantes tienen una correa de soporte para la muñeca que ayuda a prevenir lesiones mientras te ejercitas.',
    image: 'LoyaltyWebShop/gloves_black.png',
    color: 'Negro',
    category: 'Accesorios',
    features: ['Resistente', 'Transpirable', 'Material: Cuero sintético', 'Color: Negro', 'Talla: S, M, L, XL', 'Correa de soporte para muñeca'],
    isOutOfStock: true,
    tier: 'PLATA',
    magropointImg: '/Magropoints/PLATA/magropoints_plata_cc_254x254.png'
  },
  'polera-negra-magrolabs': {
    slug: 'polera-negra-magrolabs',
    name: 'Polera Negra Magrolabs',
    price: 190,
    description: 'Nuestra polera minimalista y exclusiva hecha de algodón 100% orgánico con materiales de alta calidad y prelavado.',
    image: 'LoyaltyWebShop/hoodie_black.png',
    color: 'Negro',
    category: 'Ropa',
    features: ['Resistente', 'Transpirable', 'Material: Algodón 100% orgánico', 'Color: Negro', 'Talla: S, M, L, XL', 'Prelavado'],
    isOutOfStock: true,
    tier: 'DIAMANTE',
    magropointImg: '/Magropoints/DIAMANTE/magropoints_diamante_cc_254x254.png'
  },
  'shaker-negro-magrolabs': {
    slug: 'shaker-negro-magrolabs',
    name: 'Shaker Negro Magrolabs',
    price: 80,
    description: 'Nuestro botella es ideal para mezclar proteina, creatina y llevarlo a donde quieras. Hecho de materiales de alta calidad.',
    image: 'LoyaltyWebShop/shaker_black.png',
    color: 'Negro',
    category: 'Accesorios',
    features: ['Resistente', 'Libre de BPA', 'Material: Plástico de alta calidad', 'Color: Negro', 'Capacidad: 600ml', 'Tapa hermética'],
    isOutOfStock: true,
    tier: 'BRONCE',
    magropointImg: '/Magropoints/BRONCE/magropuntos_bronce_cc_254x254.png'
  },
  'bolsa-negra-magrolabs': {
    slug: 'bolsa-negra-magrolabs',
    name: 'Bolsa Negra Magrolabs',
    price: 150,
    description: 'Nuestra bolsa negra deportiva es ideal para llevar tus cosas al gimnasio o al trabajo, con un diseño único y exclusivo.',
    image: 'LoyaltyWebShop/bag_black.png',
    color: 'Negro',
    category: 'Accesorios',
    features: ['Resistente', 'Impermeable', 'Material: Lona sintética', 'Color: Negro', 'Múltiples compartimentos', 'Correa ajustable'],
    isOutOfStock: true,
    tier: 'ORO',
    magropointImg: '/Magropoints/ORO/magropoints_oro_cc_254x254.png'
  },
  'polera-desert-magrolabs': {
    slug: 'polera-desert-magrolabs',
    name: 'Polera Desert Magrolabs',
    price: 200,
    description: 'Nuestra polera minimalista y exclusiva hecha de algodón 100% orgánico con materiales de alta calidad y prelavado.',
    image: 'LoyaltyWebShop/hoodie_desert.png',
    color: 'Desert',
    category: 'Ropa',
    features: ['Resistente', 'Transpirable', 'Material: Algodón 100% orgánico', 'Color: Desert', 'Talla: S, M, L, XL', 'Prelavado'],
    isOutOfStock: true,
    tier: 'DIAMANTE',
    magropointImg: '/Magropoints/DIAMANTE/magropoints_diamante_cc_254x254.png'
  },
  'bolsa-desert-magrolabs': {
    slug: 'bolsa-desert-magrolabs',
    name: 'Bolsa Desert Magrolabs',
    price: 160,
    description: 'Nuestra bolsa crema con logo es ideal para llevar tus cosas al gimnasio o al trabajo, con un diseño único y exclusivo.',
    image: 'LoyaltyWebShop/bag_desert.png',
    color: 'Desert',
    category: 'Accesorios',
    features: ['Resistente', 'Impermeable', 'Material: Lona sintética', 'Color: Desert', 'Múltiples compartimentos', 'Correa ajustable'],
    isOutOfStock: true,
    tier: 'PLATINO',
    magropointImg: '/Magropoints/PLATINO/magropoints_platinos_cc_254x254.svg'
  }
};

@Component({
  selector: 'app-clothing',
  standalone: true,
  imports: [ButtonComponent, NgOptimizedImage, RouterLink],
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

  // Signals para el estado del componente
  readonly slug = signal<string>('');
  readonly currentProduct = signal<LoyaltyProduct | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly currentUser = signal<UserResponse | null>(null);
  readonly userCredits = signal<number>(0);
  readonly isLoadingCredits = signal<boolean>(false);
  isLoadingBuyProduct = signal<boolean>(false);
  readonly creditsError = signal<string | null>(null);

  // Computed signals para valores derivados
  readonly productName = computed(() => this.currentProduct()?.name || '');
  readonly productPrice = computed(() => this.currentProduct()?.price || 0);
  readonly productDescription = computed(() => this.currentProduct()?.description || '');
  readonly productImage = computed(() => this.currentProduct()?.image || '');
  readonly productColor = computed(() => this.currentProduct()?.color || '');
  readonly productFeatures = computed(() => this.currentProduct()?.features || []);
  readonly isOutOfStock = computed(() => this.currentProduct()?.isOutOfStock || false);
  readonly isLogged = computed(() => this.isAuthenticated());
  readonly magropointImg = computed(() => this.currentProduct()?.magropointImg || '');
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
    }, {allowSignalWrites: true});
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
   * Cargar datos de la ruta y producto
   */
  private loadRouteData(): void {
    const slugFromRoute = this.route.snapshot.params['slug'];
    this.slug.set(slugFromRoute);
    
    const product = PRODUCTS_CONFIG[slugFromRoute];
    if (product) {
      this.currentProduct.set(product);
    } else {
      console.error(`Product not found for slug: ${slugFromRoute}`);
    }
  }

  /**
   * Cargar estado de autenticación
   */
  private loadAuthState(): void {
    // Cargar estado inicial de autenticación
    this.isAuthenticated.set(this.authService.isAuthenticated());
    this.currentUser.set(this.authService.getCurrentUser());

    // Suscribirse a cambios en el estado de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);
    });

    // Suscribirse a cambios en el usuario actual
    this.authService.currentUser$.subscribe(user => {
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
      finalize(() => this.isLoadingCredits.set(false))
    ).subscribe(response => {
      if (response && response.status === 'success') {
        const credits = parseFloat(response.data.totalCredits) || 0;
        this.userCredits.set(credits);
      }
    });
  }

  /**
   * Obtener el producto actual por slug
   */
  getProductBySlug(slug: string): LoyaltyProduct | null {
    return PRODUCTS_CONFIG[slug] || null;
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
    this._userService.getCurrentUser().subscribe({
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
      this._loyaltyService.getUserTierInfo(userId).subscribe({
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
