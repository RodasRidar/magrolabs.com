import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  PLATFORM_ID,
  createComponent,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { ToastComponent } from '../ui/toast/toast.component';

const AUTO_DISMISS_MS = 5000;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastClosed$ = new Subject<void>();

  showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title: string,
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // API moderna (Angular 14+): createComponent reemplaza ComponentFactoryResolver.
    const componentRef: ComponentRef<ToastComponent> = createComponent(ToastComponent, {
      environmentInjector: this.environmentInjector,
    });

    componentRef.instance.type = type;
    componentRef.instance.message = message;
    componentRef.instance.title = title;

    // Cleanup centralizado: corre una sola vez por toast, sin importar el origen
    // (click del usuario, timeout o navegación que destruye el host).
    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      clearTimeout(autoTimer);
      closeSub.unsubscribe();
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.toastClosed$.next();
    };

    const closeSub = componentRef.instance.onClose.subscribe(() => dispose());
    const autoTimer = setTimeout(dispose, AUTO_DISMISS_MS);

    this.appRef.attachView(componentRef.hostView);
    const domElement = (componentRef.hostView as unknown as { rootNodes: Node[] }).rootNodes[0];
    if (domElement) {
      document.body.appendChild(domElement);
    }
  }

  success(title: string, message: string): void {
    this.showToast('success', message, title);
  }

  error(title: string, message: string): void {
    this.showToast('error', message, title);
  }

  warning(title: string, message: string): void {
    this.showToast('warning', message, title);
  }

  info(title: string, message: string): void {
    this.showToast('info', message, title);
  }

  /** Observable que emite cada vez que se cierra un toast. */
  onToastClosed() {
    return this.toastClosed$.asObservable();
  }
}
