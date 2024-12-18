import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const refLinkGuard: CanActivateFn = (route, state) => {
  const _cookieService = inject(CookieService)

  try {
    const track = route.queryParams['track'];
    const codigo = route.queryParams['codigo'];
    if (track) {
      _cookieService.set('track', track, 365, '/');
    }
    if (codigo) {
      _cookieService.set('codigo', codigo, 365, '/');
    }
    return true;
  }
  catch (e) {
    console.error(e);
    return true;
  }
};
