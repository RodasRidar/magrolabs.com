import { Injectable, ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';
import { ToastComponent } from '../ui/toast/toast.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastClosed$ = new Subject<void>();

  constructor(
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private injector: Injector
  ) {}

  showToast(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title: string
  ): void {
    // Crear dinámicamente el componente ToastComponent
    const factory = this.componentFactoryResolver.resolveComponentFactory(ToastComponent);
    const componentRef = factory.create(this.injector);

    // Configurar las propiedades del componente
    componentRef.instance.type = type;
    componentRef.instance.message = message;
    componentRef.instance.title = title;

    // Manejar el cierre del toast
    componentRef.instance.onClose.subscribe(() => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.toastClosed$.next(); // Emitir evento de cierre
    });

    // Añadir el componente al DOM
    this.appRef.attachView(componentRef.hostView);
    const domElement = (componentRef.hostView as any).rootNodes[0];
    document.body.appendChild(domElement);

    // Opcional: Auto-destruir el toast después de un tiempo
    setTimeout(() => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.toastClosed$.next(); // Emitir evento de cierre
    }, 6000); // 5 segundos
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

  // Método para suscribirse al evento de cierre del toast
  onToastClosed() {
    return this.toastClosed$.asObservable();
  }
}