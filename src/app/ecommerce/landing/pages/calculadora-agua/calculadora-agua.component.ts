import { Component, computed, OnInit, inject, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { SeoService } from "../../../../shared/services/seo.service";
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from "../../../../shared/ui/breadcrumb/breadcrumb.component";
import { CardComponent } from "../../../../shared/ui/card/card.component";
import { InputComponent } from "../../../../shared/ui/input/input.component";
import { ButtonComponent } from "../../../../shared/ui/button/button.component";
import { AlertComponent } from "../../../../shared/ui/alert/alert.component";
import { BadgeComponent } from "../../../../shared/ui/badge/badge.component";
import { AccordionGroupComponent } from "../../../../shared/ui/accordion/accordion-group.component";
import { AccordionItemComponent } from "../../../../shared/ui/accordion/accordion-item.component";
import {
  NavbarComponent,
  NavbarTypeEnum,
} from "../../components/navbar/navbar.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: "app-calculadora-agua",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    BreadcrumbComponent,
    CardComponent,
    InputComponent,
    ButtonComponent,
    AlertComponent,
    BadgeComponent,
    AccordionGroupComponent,
    AccordionItemComponent,
  ],
  templateUrl: "./calculadora-agua.component.html",
})
export class CalculadoraAguaComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  readonly NavbarTypeEnum = NavbarTypeEnum;

  readonly breadcrumbItems: BreadcrumbItem[] = [
    { label: "Inicio", link: "/" },
    { label: "Calculadora de hidratación" },
  ];

  readonly pesoControl = new FormControl<string>("", { nonNullable: true });
  readonly peso = signal<number | null>(null);
  readonly aguaMl = signal<number>(0);
  readonly mostrarResultado = signal(false);

  readonly litros = computed(() => (this.aguaMl() / 1000).toFixed(1));
  readonly vasos = computed(() => Math.ceil(this.aguaMl() / 250));

  ngOnInit(): void {
    this.configureSeo();
  }

  calcular(): void {
    const parsed = this.parseInput(this.pesoControl.value);
    if (parsed === null) return;
    this.peso.set(parsed);
    this.aguaMl.set(parsed * 40);
    this.mostrarResultado.set(true);
  }

  reiniciar(): void {
    this.pesoControl.reset("");
    this.peso.set(null);
    this.aguaMl.set(0);
    this.mostrarResultado.set(false);
  }

  private parseInput(value: string | null | undefined): number | null {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0 || num > 300) return null;
    return num;
  }

  private configureSeo(): void {
    const title = "Calculadora de hidratación para creatina | Magrolabs";
    const description =
      "Descubre cuánta agua tomar al día según tu peso para potenciar la absorción de la creatina monohidratada. Guía rápida con calculadora interactiva.";
    const keywords =
      "calculadora agua creatina, hidratación creatina, consumo agua diario, creatina monohidratada, hidratación deportiva, magrolabs";
    const baseUrl = "https://magrolabs.com";
    const canonicalUrl = `${baseUrl}/calculadora-agua`;
    const imageUrl = `${baseUrl}/package-image.png`;

    this.seoService.setTitle(title);
    this.seoService.setDescription(description);
    this.seoService.setKeywords(keywords);
    this.seoService.setIndexFollow(true);
    this.seoService.setCanonicalURL(canonicalUrl);

    this.seoService.setOpenGraph({
      title,
      description,
      image: imageUrl,
      url: canonicalUrl,
      type: "article",
      site_name: "Magrolabs",
      locale: "es_PE",
    });

    this.seoService.setTwitterCard({
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": imageUrl,
      "twitter:site": "@magrolabs",
    });

    this.seoService.setStructuredData({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: imageUrl,
      url: canonicalUrl,
      datePublished: "2025-05-16",
      dateModified: new Date().toISOString().split("T")[0],
      author: { "@type": "Organization", name: "Magrolabs", url: baseUrl },
      publisher: {
        "@type": "Organization",
        name: "Magrolabs",
        logo: { "@type": "ImageObject", url: `${baseUrl}/logo-magrolabs.png` },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      articleSection: "Nutrición deportiva",
      keywords: keywords.split(", "),
    });

    this.seoService.setFAQStructuredData([
      {
        question: "¿Qué pasa si no tomo suficiente agua con la creatina?",
        answer:
          "Una hidratación insuficiente puede limitar la efectividad de la creatina y, en algunos casos, causar calambres musculares o malestar digestivo.",
      },
      {
        question: "¿Puedo tomar más agua de la recomendada?",
        answer:
          "Sí, especialmente si entrenas intensamente o vives en clima cálido. La fórmula de 40 ml por kg es una base mínima.",
      },
      {
        question: "¿Cuándo debo tomar mi creatina monohidratada?",
        answer:
          "Puedes tomarla en cualquier momento del día. Lo más importante es la constancia diaria.",
      },
      {
        question: "¿La creatina me hará retener agua de forma negativa?",
        answer:
          "No. La creatina retiene agua dentro de las células musculares, lo que aumenta el volumen y la fuerza, sin causar hinchazón subcutánea.",
      },
    ]);
  }
}
