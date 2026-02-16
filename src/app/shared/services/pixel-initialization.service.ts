import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/env';

@Injectable({
  providedIn: 'root'
})
export class PixelInitializationService {
  private tiktokLoaded = false;
  private metaLoaded = false;
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  /**
   * Inicializa ambos pixels (TikTok y Meta) según la configuración del ambiente
   * Solo se ejecuta en el navegador (cliente)
   */
  initializePixels(): void {
    // Solo ejecutar en el cliente, no en SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.initializeTikTokPixel();
    this.initializeMetaPixel();
  }

  /**
   * Inicializa el pixel de TikTok con el ID del ambiente actual
   */
  private initializeTikTokPixel(): void {
    if (this.tiktokLoaded) {
      console.warn('TikTok Pixel ya está cargado');
      return;
    }

    if (!environment.tiktok.enabled) {
      console.log('TikTok Pixel está deshabilitado en el ambiente actual');
      return;
    }

    const pixelId = environment.tiktok.pixelId;
    console.log(`Inicializando TikTok Pixel: ${pixelId}`);

    // Script de inicialización de TikTok
    (function (w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent", "revokeConsent", "grantConsent"];
      ttq.setAndDefer = function (t: any, e: string) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
        }
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t: string) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e
      };
      ttq.load = function (e: string, n?: any) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = r;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date;
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        o.src = r + "?sdkid=" + e + "&lib=" + t;
        var a = document.getElementsByTagName("script")[0];
        a.parentNode!.insertBefore(o, a);
      };
      
      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');

    this.tiktokLoaded = true;
  }

  /**
   * Inicializa el pixel de Meta (Facebook) con el ID del ambiente actual
   */
  private initializeMetaPixel(): void {
    if (this.metaLoaded) {
      console.warn('Meta Pixel ya está cargado');
      return;
    }

    if (!environment.meta.enabled) {
      console.log('Meta Pixel está deshabilitado en el ambiente actual');
      return;
    }

    const pixelId = environment.meta.pixelId;
    console.log(`Inicializando Meta Pixel: ${pixelId}`);

    // Script de inicialización de Meta
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      var n: any = f.fbq = function () {
        n.callMethod ?
          n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      var t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      var s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    (window as any).fbq('init', pixelId);

    // Agregar noscript para Meta Pixel
    this.addMetaPixelNoscript(pixelId);

    this.metaLoaded = true;
  }

  /**
   * Agrega el elemento noscript de Meta Pixel al body
   */
  private addMetaPixelNoscript(pixelId: string): void {
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);
  }

  /**
   * Verifica si los pixels están cargados
   */
  arePixelsLoaded(): { tiktok: boolean; meta: boolean } {
    return {
      tiktok: this.tiktokLoaded,
      meta: this.metaLoaded
    };
  }
}
