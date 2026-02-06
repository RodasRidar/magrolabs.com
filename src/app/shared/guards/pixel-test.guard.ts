import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';

export const pixelTestGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  
  // Obtener el parámetro PWD de la URL
  const urlPassword = route.queryParamMap.get('PWD');
  
  // Obtener la contraseña del localStorage
  const storedPassword = localStorage.getItem('PIXEL_PWD');
  
  // Si no hay contraseña en localStorage, denegar acceso
  if (!storedPassword) {
    console.warn('No se encontró PIXEL_PWD en localStorage');
    router.navigate(['/']);
    return false;
  }
  
  // Si el parámetro PWD coincide con el localStorage, permitir acceso
  if (urlPassword === storedPassword) {
    return true;
  }
  
  // Si no coincide, denegar acceso
  console.warn('Contraseña incorrecta para acceder a pixel-testing');
  router.navigate(['/']);
  return false;
};
