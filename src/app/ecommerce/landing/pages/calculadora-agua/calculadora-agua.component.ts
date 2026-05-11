import { Component, signal } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-calculadora-agua',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent, BreadcrumbComponent],
  templateUrl: './calculadora-agua.component.html',
})
export class CalculadoraAguaComponent {
  NavbarTypeEnum = NavbarTypeEnum;

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Calculadora de Hidratación' },
  ];
  
  peso = signal<number | null>(null);
  aguaRecomendada = signal<number>(0);
  mostrarResultado = signal<boolean>(false);
  pesoInput: number | null = null;

  constructor(
    private titleService: Title,
    private metaService: Meta
  ) {
    this.setMetaTags();
  }

  private setMetaTags(): void {
    this.titleService.setTitle('Calculadora de Hidratación para Creatina | Magrolabs');
    
    this.metaService.updateTag({
      name: 'description',
      content: 'Calcula tu consumo diario de agua ideal para maximizar los efectos de la creatina monohidratada. Hidratación óptima para mejor rendimiento deportivo.'
    });

    this.metaService.updateTag({
      name: 'keywords',
      content: 'calculadora agua creatina, hidratación creatina, consumo agua diario, creatina monohidratada, hidratación deportiva, magrolabs'
    });

    this.metaService.updateTag({
      property: 'og:title',
      content: 'Calculadora de Hidratación para Creatina | Magrolabs'
    });

    this.metaService.updateTag({
      property: 'og:description',
      content: 'Descubre cuánta agua necesitas consumir diariamente para optimizar los efectos de la creatina monohidratada.'
    });

    this.metaService.updateTag({
      property: 'og:type',
      content: 'website'
    });
  }

  calcularAgua(): void {
    if (this.pesoInput && this.pesoInput > 0) {
      this.peso.set(this.pesoInput);
      const resultado = this.pesoInput * 40;
      this.aguaRecomendada.set(resultado);
      this.mostrarResultado.set(true);
    }
  }

  reiniciar(): void {
    this.pesoInput = null;
    this.peso.set(null);
    this.aguaRecomendada.set(0);
    this.mostrarResultado.set(false);
  }

  obtenerVasos(): number {
    return Math.ceil(this.aguaRecomendada() / 250);
  }

  obtenerLitros(): string {
    return (this.aguaRecomendada() / 1000).toFixed(1);
  }
}
