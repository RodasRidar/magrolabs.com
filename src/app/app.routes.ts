import { Routes } from '@angular/router';
// import { LandingComponent } from './ecommerce/landing/landing.component';
// import { SignupComponent } from './ecommerce/signup/signup.component';
// import { CreateAccountComponent } from './ecommerce/signup/pages/create-account/create-account.component';
// import { AddressComponent } from './ecommerce/signup/pages/address/address.component';
// import { ConfirmationComponent } from './ecommerce/signup/pages/confirmation/confirmation.component';
// import { PlansComponent } from './ecommerce/signup/pages/plans/plans.component';
// import { VerificationPaymentComponent } from './ecommerce/signup/pages/verification-payment/verification-payment.component';

export const routes: Routes = [
  {
    path: '',
    // component: LandingComponent,
    loadComponent: () => import('./ecommerce/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'registro',
    // component: SignupComponent,
    children: [
      {
        path: '',
        // component: PlansComponent,
        loadComponent: () => import('./ecommerce/signup/pages/plans/plans.component').then(m => m.PlansComponent)
      },
      {
        path: 'crear-cuenta', 
        // component: CreateAccountComponent,
        loadComponent: () => import('./ecommerce/signup/pages/create-account/create-account.component').then(m => m.CreateAccountComponent)
      },
      {
        path: 'direccion', 
        // component: AddressComponent,
        loadComponent: () => import('./ecommerce/signup/pages/address/address.component').then(m => m.AddressComponent)
      },
      {
        path: 'verificacion', 
        // component: VerificationPaymentComponent,
        loadComponent: () => import('./ecommerce/signup/pages/verification-payment/verification-payment.component').then(m => m.VerificationPaymentComponent)
      },
      {
        path: 'confirmacion', 
        // component: ConfirmationComponent,
        loadComponent: () => import('./ecommerce/signup/pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent)
      },
    ],
    loadComponent: () => import('./ecommerce/signup/signup.component').then(m => m.SignupComponent)
  },
//   {
//     path: '',
//     redirectTo: '/home',
//     pathMatch: 'full',
//     component: LandingComponent,
//   },
{
  path:'**',
  loadComponent: () => import('./shared/pages/not-found/not-found.component')
}
];
