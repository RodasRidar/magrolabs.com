import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

/**
 * Cache de fetches a SVGs en `/svg/*.svg` para reusarlos como `innerHTML`.
 * Requisito: el SVG debe usar `fill="currentColor"` para heredar color del padre.
 *
 * Cada path se fetcha una sola vez. `shareReplay(1)` garantiza que múltiples
 * suscriptores concurrentes compartan la misma respuesta. En SSR el HttpClient
 * resuelve el archivo desde disco (vía `withFetch`); en cliente el navegador
 * lo cachea automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class SvgIconLoader {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cache = new Map<string, Observable<SafeHtml>>();

  load(path: string): Observable<SafeHtml> {
    const cached = this.cache.get(path);
    if (cached) return cached;

    const stream = this.http
      .get(path, { responseType: 'text' })
      .pipe(
        map((svg) => this.sanitizer.bypassSecurityTrustHtml(svg)),
        catchError(() => of(this.sanitizer.bypassSecurityTrustHtml(''))),
        shareReplay(1),
      );

    this.cache.set(path, stream);
    return stream;
  }
}
