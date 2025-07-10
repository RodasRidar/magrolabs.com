import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { AuthService } from '../../../../../../shared/services/auth.service';
import { CreditTransactionService } from '../../../../../../shared/services/credit-transactions.service';
import { catchError, finalize, of } from 'rxjs';
import { UserResponse } from '../../../../../../shared/interfaces/auth.interfaces';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { environment } from '../../../../../../../environments/env';

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
    isOutOfStock: true
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
    isOutOfStock: false
  },
  'shaker-negro-magrolabs': {
    slug: 'shaker-negro-magrolabs',
    name: 'Shaker Negro Magrolabs',
    price: 20,
    description: 'Nuestro shaker es ideal para mezclar proteina, creatina y llevarlo a donde quieras. Hecho de materiales de alta calidad.',
    image: 'LoyaltyWebShop/shaker_black.png',
    color: 'Negro',
    category: 'Accesorios',
    features: ['Resistente', 'Libre de BPA', 'Material: Plástico de alta calidad', 'Color: Negro', 'Capacidad: 600ml', 'Tapa hermética'],
    isOutOfStock: false
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
    isOutOfStock: false
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
    isOutOfStock: false
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
    isOutOfStock: false
  }
};

@Component({
  selector: 'app-clothing',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, NgOptimizedImage, RouterLink],
  templateUrl: './clothing.component.html',
  styleUrl: './clothing.component.css'
})
export class ClothingComponent implements OnInit {

  // Servicios inyectados
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private creditService = inject(CreditTransactionService);
  private _toastService = inject(ToastService);

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
}
