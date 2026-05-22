import { Component, DestroyRef, OnInit, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { ActivatedRoute } from "@angular/router";
import { environment } from "../../../../../environments/env";
import { FooterComponent } from "../../components/footer/footer.component";
import {
  NavbarComponent,
  NavbarTypeEnum,
} from "../../components/navbar/navbar.component";
import { SeoService } from "../../../../shared/services/seo.service";

@Component({
  selector: "app-mi-primera-creatina",
  imports: [FooterComponent, NavbarComponent],
  templateUrl: "./mi-primera-creatina.component.html",
  styleUrl: "./mi-primera-creatina.component.css",
})
export class MiPrimeraCreatinaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);
  private destroyRef = inject(DestroyRef);

  lote = signal<string>("");
  ENV = environment;
  NavbarTypeEnum = NavbarTypeEnum;

  ngOnInit(): void {
    // Obtener el parámetro de query 'lote'
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.lote.set(params["lote"] || "");
      });

    this.configureSeo();
  }

  /**
   * Configura todos los elementos SEO para la página de creatina
   */
  private configureSeo(): void {
    const title =
      "¿Es tu primera vez tomando creatina? Guía completa 2025 | Magrolabs";
    const description =
      "Guía completa para principiantes sobre cómo tomar creatina correctamente. Dosis ideal 0.10g/kg, beneficios, mitos y verdades. Creatina monohidrato 99.9% pura Magrolabs.";
    const keywords =
      "creatina principiantes, primera vez creatina, dosis creatina kg peso, creatina monohidrato, suplementos deportivos, Magrolabs creatina, como tomar creatina, beneficios creatina";
    const baseUrl = "https://magrolabs.com";
    const canonicalUrl = `${baseUrl}/mi-primera-creatina`;
    const imageUrl = `${baseUrl}/package-image.png`;

    // Título y descripción básica
    this.seoService.setTitle(title);
    this.seoService.setDescription(description);
    this.seoService.setKeywords(keywords);

    // Configuración de robots e indexación
    this.seoService.setIndexFollow(true);
    this.seoService.setCanonicalURL(canonicalUrl);

    // Open Graph para Facebook y otras redes sociales
    this.seoService.setOpenGraph({
      title: title,
      description: description,
      image: imageUrl,
      url: canonicalUrl,
      type: "article",
      site_name: "Magrolabs",
      locale: "es_PE",
    });

    // Twitter Card
    this.seoService.setTwitterCard({
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": imageUrl,
      "twitter:site": "@magrolabs",
    });

    // Datos estructurados (JSON-LD) para mejor SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      image: imageUrl,
      url: canonicalUrl,
      datePublished: "2024-01-15",
      dateModified: new Date().toISOString().split("T")[0],
      author: {
        "@type": "Organization",
        name: "Magrolabs",
        url: baseUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Magrolabs",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo-magrolabs.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      articleSection: "Suplementos Deportivos",
      keywords: keywords.split(", "),
      about: {
        "@type": "Thing",
        name: "Creatina Monohidrato",
        description:
          "Suplemento deportivo para aumentar fuerza y masa muscular",
      },
    };

    this.seoService.setStructuredData(structuredData);
  }
}
