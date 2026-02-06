import { Routes } from '@angular/router';
import { refLinkGuard } from './shared/guards/ref-link.guard';
import { authGuard } from './shared/guards/auth.guard';
import { notAuthGuard } from './shared/guards/not-auth.guard';
import { pixelTestGuard } from './shared/guards/pixel-test.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ecommerce/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'registro',
    children: [
      {
        path: '',
        loadComponent: () => import('./ecommerce/signup/pages/plans/plans.component').then(m => m.PlansComponent)
      },
      {
        path: 'crear-cuenta',
        loadComponent: () => import('./ecommerce/signup/pages/create-account/create-account.component').then(m => m.CreateAccountComponent)
      },
      {
        path: 'direccion',
        loadComponent: () => import('./ecommerce/signup/pages/address/address.component').then(m => m.AddressComponent)
      },
      {
        path: 'verificacion',
        loadComponent: () => import('./ecommerce/signup/pages/verification-payment/verification-payment.component').then(m => m.VerificationPaymentComponent)
      },
      {
        path: 'confirmacion',
        loadComponent: () => import('./ecommerce/signup/pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      },
    ],
    loadComponent: () => import('./ecommerce/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [refLinkGuard, notAuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./ecommerce/landing/pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'politicas',
    loadComponent: () => import('./ecommerce/landing/pages/politicas/politicas.component').then(m => m.PoliticasComponent),
    children: [
      {
        path: '',
        redirectTo: 'terminos-y-condiciones',
        pathMatch: 'full',
      },
      {
        path: 'terminos-y-condiciones',
        loadComponent: () => import('./ecommerce/landing/pages/politicas/terminos-y-condiciones/terminos-y-condiciones.component').then(m => m.TerminosYCondicionesComponent)
      },
      {
        path: 'condiciones-de-uso',
        loadComponent: () => import('./ecommerce/landing/pages/politicas/condiciones-de-uso/condiciones-de-uso.component').then(m => m.CondicionesDeUsoComponent)
      },
      {
        path: 'privacidad',
        loadComponent: () => import('./ecommerce/landing/pages/politicas/privacidad/privacidad.component').then(m => m.PrivacidadComponent)
      },
      {
        path: 'cookies',
        loadComponent: () => import('./ecommerce/landing/pages/politicas/cookies/cookies.component').then(m => m.CookiesComponent)
      }
    ],
    canActivate: [refLinkGuard]
  },
  {
    path: 'atencion-cliente',
    children: [
      {
        path: '',
        redirectTo: 'preguntas-frecuentes',
        pathMatch: 'full',
      },
      {
        path: 'preguntas-frecuentes',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/preguntas-frecuentes/preguntas-frecuentes.component').then(m => m.PreguntasFrecuentesComponent),
      },
      {
        path: 'contactanos',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/contactanos/contactanos.component').then(m => m.ContactanosComponent),
      },
      {
        path: 'como-funciona',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/como-funciona/como-funciona.component').then(m => m.ComoFuncionaComponent),
      },
      {
        path: 'envio-y-entrega',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/envio-entrega/envio-entrega.component').then(m => m.EnvioEntregaComponent),
      },
      {
        path: 'cambio',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/cambio/cambio.component').then(m => m.CambioComponent),
      },
      {
        path: 'pausar-cancelar',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/pausar-cancelar/pausar-cancelar.component').then(m => m.PausarCancelarComponent),
      },
      {
        path: 'pago',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/pago/pago.component').then(m => m.PagoComponent),
      },
      {
        path: 'programa-loyalty',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/programa-loyalty/programa-loyalty.component').then(m => m.ProgramaLoyaltyComponent),
      },
      {
        path: 'promociones',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/promociones/promociones.component').then(m => m.PromocionesComponent),
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/nosotros/nosotros.component').then(m => m.NosotrosComponent),
      }
    ],
    loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/atencion-cliente.component').then(m => m.AtencionClienteComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'loyalty-webshop',
    children: [
      {
        path: '',
        loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/pages/index/index.component').then(m => m.IndexComponent),
      },
      {
        path: 'articulos/:slug',
        loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/pages/clothing/clothing.component').then(m => m.ClothingComponent),
      },
    ],
    loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/loyalty-webshop.component').then(m => m.LoyaltyWebshopComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'referido-por-amigo',
    loadComponent: () => import('./ecommerce/landing/pages/referido-por-amigo/referido-por-amigo.component').then(m => m.ReferidoPorAmigoComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'productos',
    children: [
      {
        path: '',
        loadComponent: () => import('./ecommerce/landing/pages/productos/pages/index/index.component').then(m => m.IndexComponent)
      },
      {
        path: 'creatinas/:slug',
        loadComponent: () => import('./ecommerce/landing/pages/productos/pages/creatinas/creatinas.component').then(m => m.CreatinasComponent),
      },
    ],
    loadComponent: () => import('./ecommerce/landing/pages/productos/productos.component').then(m => m.ProductosComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'recuperar-password',
    loadComponent: () => import('./ecommerce/landing/pages/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'encuesta',
    loadComponent: () => import('./ecommerce/landing/pages/encuesta/encuesta.component').then(m => m.EncuestaComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'libro-reclamaciones',
    loadComponent: () => import('./ecommerce/landing/pages/libro-reclamaciones/libro-reclamaciones.component').then(m => m.LibroReclamacionesComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'mi-primera-creatina',
    loadComponent: () => import('./ecommerce/landing/pages/mi-primera-creatina/mi-primera-creatina.component').then(m => m.MiPrimeraCreatinaComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'calculadora-agua',
    loadComponent: () => import('./ecommerce/landing/pages/calculadora-agua/calculadora-agua.component').then(m => m.CalculadoraAguaComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'bolsa',
    loadComponent: () => import('./ecommerce/landing/pages/bolsa/bolsa.component').then(m => m.BolsaComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./ecommerce/landing/pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [refLinkGuard]
  },
  {
    path: 'cuenta',
    loadComponent: () => import('./account/account.component').then(m => m.AccountComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'mi-cuenta',
        loadComponent: () => import('./account/pages/cuenta/cuenta.component').then(m => m.CuentaComponent),
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./account/pages/pedidos/pedidos.component').then(m => m.PedidosComponent),
      },
      {
        path: 'credito',
        loadComponent: () => import('./account/pages/credito/credito.component').then(m => m.CreditoComponent),
      },
      {
        path: 'suscripcion',
        loadComponent: () => import('./account/pages/suscripcion/suscripcion.component').then(m => m.SuscripcionComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./account/pages/perfil/perfil.component').then(m => m.PerfilComponent),
      },
    ]
  },
  {
    path: 'pixel-testing',
    loadComponent: () => import('./shared/ui/pixel-testing/pixel-testing.component').then(m => m.PixelTestingComponent),
    canActivate: [pixelTestGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found/not-found.component')
  }
];
