import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const notAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // La pantalla de confirmación es el destino post-checkout: el cliente
  // queda autenticado tras el registro implícito y debe poder verla para
  // que se disparen los side-effects (emails, analytics, modal de bienvenida,
  // decremento de unidades, cleanup) y vea los detalles de su pedido.
  // Las demás rutas de /registro siguen bloqueadas para autenticados.
  const pathOnly = state.url.split('?')[0];
  if (pathOnly === '/registro/confirmacion') {
    return true;
  }

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }
      router.navigate(['/cuenta/mi-cuenta']);
      return false;
    })
  );
};
