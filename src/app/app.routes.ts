import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ecommerce/landing/landing.component').then(m => m.LandingComponent)
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
    loadComponent: () => import('./ecommerce/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./ecommerce/landing/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'politicas',
    loadComponent: () => import('./ecommerce/landing/pages/politicas/politicas.component').then(m => m.PoliticasComponent)
  },
  {
    path: 'atencion-cliente',
    loadComponent: () => import('./ecommerce/landing/pages/atencion-cliente/atencion-cliente.component').then(m => m.AtencionClienteComponent)
  },
  {
    path: 'como-funciona',
    loadComponent: () => import('./ecommerce/landing/pages/como-funciona/como-funciona.component').then(m => m.ComoFuncionaComponent)
  },
  {
    path: 'loyalty-webshop',
    children: [
      {
        path: '',
        loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/pages/index/index.component').then(m => m.IndexComponent)
      },
      {
        path: 'articulos/:slug',
        loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/pages/clothing/clothing.component').then(m => m.ClothingComponent),
      },
    ],
    loadComponent: () => import('./ecommerce/landing/pages/loyalty-webshop/loyalty-webshop.component').then(m => m.LoyaltyWebshopComponent)
  },
  {
    path: 'referido-por-amigo',
    loadComponent: () => import('./ecommerce/landing/pages/referido-por-amigo/referido-por-amigo.component').then(m => m.ReferidoPorAmigoComponent)
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
    loadComponent: () => import('./ecommerce/landing/pages/productos/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'recuperar-password',
    loadComponent: () => import('./ecommerce/landing/pages/recuperar-password/recuperar-password.component').then(m => m.RecuperarPasswordComponent)
  },
  {
    path: 'encuesta',
    loadComponent: () => import('./ecommerce/landing/pages/encuesta/encuesta.component').then(m => m.EncuestaComponent)
  },
  //   {
  //     path: '',
  //     redirectTo: '/home',
  //     pathMatch: 'full',
  //     component: LandingComponent,
  //   },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found/not-found.component')
  }
];
