import { Routes } from '@angular/router';
import { LandingComponent } from './ecommerce/landing/landing.component';
import { SignupComponent } from './ecommerce/signup/signup.component';
import { CreateAccountComponent } from './ecommerce/signup/pages/create-account/create-account.component';
import { AddressComponent } from './ecommerce/signup/pages/address/address.component';
import { ConfirmationComponent } from './ecommerce/signup/pages/confirmation/confirmation.component';
import { PlansComponent } from './ecommerce/signup/pages/plans/plans.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'registro',
    component: SignupComponent,
    children: [
      {
        path: '', 
        component: PlansComponent,
      },
      {
        path: 'crear-cuenta', 
        component: CreateAccountComponent
      },
      {
        path: 'direccion', 
        component: AddressComponent
      },
      {
        path: 'confirmacion', 
        component: ConfirmationComponent
      },
    ],
  },
//   {
//     path: '',
//     redirectTo: '/home',
//     pathMatch: 'full',
//     component: LandingComponent,
//   },
];
