
import { inject, Injectable, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class SeoService {
  constructor(public meta: Meta, public title: Title) { }
  private _document = inject(DOCUMENT);

  /**
   * Sets the canonical URL for the current page.
   * @param url Optional URL to set as canonical. If not provided, the current URL is used.
   */
  setCanonicalURL(url?: string) {
    const canUrl = url == undefined ? this._document.URL : url;
    const head = this._document.head;
    let element: HTMLLinkElement = this._document.querySelector('link[rel="canonical"]') || this._document.createElement('link');

    if (!element) {
      element = this._document.createElement('link') as HTMLLinkElement;
      head.appendChild(element);
    }
    element.setAttribute('rel', 'canonical');
    element.setAttribute('href', canUrl);
  }

  /**
   * Updates the robots meta tag with the appropriate index and follow settings.
   * @param state If true, sets to 'index,follow'; otherwise, 'noindex,nofollow'.
   */
  setIndexFollow(state = true) {
    this.meta.updateTag({ name: 'robots', content: state ? 'index,follow' : 'noindex,nofollow' });
  }

  /**
   * Sets the page title.
   * @param title The title to set.
   */
  setTitle(title: string) {
    this.title.setTitle(title);
  }

  /**
   * Sets the meta description.
   * @param description The description content.
   */
  setDescription(description: string) {
    this.meta.updateTag({ name: 'description', content: description });
  }

  /**
   * Sets the meta keywords.
   * @param keywords A comma-separated string of keywords.
   */
  setKeywords(keywords: string) {
    this.meta.updateTag({ name: 'keywords', content: keywords });
  }

  /**
   * Sets Open Graph meta tags.
   * @param data An object containing Open Graph properties.
   */
  setOpenGraph(data: { [key: string]: string }) {
    for (const property in data) {
      this.meta.updateTag({ property: `og:${property}`, content: data[property] });
    }
  }

  /**
   * Sets Twitter Card meta tags.
   * @param data An object containing Twitter properties.
   */
  setTwitterCard(data: { [key: string]: string }) {
    for (const property in data) {
      this.meta.updateTag({ name: property, content: data[property] });
    }
  }

  /**
   * Sets hreflang link tags for international SEO.
   * @param hreflangs Array of hreflang objects with language and URL.
   */
  setHreflangs(hreflangs: { lang: string; url: string }[]) {
    const head = this._document.head;
    hreflangs.forEach(({ lang, url }) => {
      const link = this._document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      head.appendChild(link);
    });
  }

  /**
 * Adds a structured data script (JSON-LD) to the head.
 * @param jsonLD The JSON object to be added as a script.
 */
  setStructuredData(jsonLD: Object) {
    const script = this._document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(jsonLD);
    this._document.head.appendChild(script);
  }

  /**
   * Configures meta tags for AI crawlers and LLMs (Gemini, ChatGPT, Claude).
   * @param allow If true, allows AI crawlers; otherwise, blocks them.
   */
  setAICrawlers(allow = true) {
    const content = allow ? 'index, follow' : 'noindex, nofollow';
    
    // Google Gemini / Bard
    this.meta.updateTag({ name: 'googlebot-ai', content });
    
    // OpenAI ChatGPT
    this.meta.updateTag({ name: 'OAI-SearchBot', content });
    
    // General AI bots
    this.meta.updateTag({ name: 'ai-content-declaration', content: allow ? 'allowed' : 'disallowed' });
  }

  /**
   * Sets meta tags to describe content for LLMs.
   * @param data Object containing AI-specific metadata.
   */
  setAIMetadata(data: {
    summary?: string;
    contentType?: string;
    audience?: string;
    purpose?: string;
    entityType?: string;
  }) {
    if (data.summary) {
      this.meta.updateTag({ name: 'ai:summary', content: data.summary });
    }
    if (data.contentType) {
      this.meta.updateTag({ name: 'ai:content-type', content: data.contentType });
    }
    if (data.audience) {
      this.meta.updateTag({ name: 'ai:audience', content: data.audience });
    }
    if (data.purpose) {
      this.meta.updateTag({ name: 'ai:purpose', content: data.purpose });
    }
    if (data.entityType) {
      this.meta.updateTag({ name: 'ai:entity-type', content: data.entityType });
    }
  }

  /**
   * Sets FAQ structured data optimized for AI/LLM understanding.
   * @param faqs Array of question-answer pairs.
   */
  setFAQStructuredData(faqs: { question: string; answer: string }[]) {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
    this.setStructuredData(faqSchema);
  }

  /**
   * Sets breadcrumb structured data for better AI navigation context.
   * @param breadcrumbs Array of breadcrumb items with name and url.
   */
  setBreadcrumbStructuredData(breadcrumbs: { name: string; url: string }[]) {
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    };
    this.setStructuredData(breadcrumbSchema);
  }

  /**
   * Sets product structured data optimized for AI shopping assistants.
   * @param product Product information object.
   */
  setProductStructuredData(product: {
    name: string;
    description: string;
    image?: string;
    brand?: string;
    price: number;
    currency: string;
    availability?: string;
    rating?: { value: number; count: number };
    sku?: string;
  }) {
    const productSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description
    };

    if (product.image) productSchema.image = product.image;
    if (product.brand) productSchema.brand = { '@type': 'Brand', name: product.brand };
    if (product.sku) productSchema.sku = product.sku;

    productSchema.offers = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability || 'https://schema.org/InStock'
    };

    if (product.rating) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count
      };
    }

    this.setStructuredData(productSchema);
  }

  /**
   * Sets organization structured data for better AI brand understanding.
   * @param org Organization information object.
   */
  setOrganizationStructuredData(org: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    contactPoint?: { telephone: string; contactType: string };
    sameAs?: string[];
  }) {
    const orgSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: org.name,
      url: org.url
    };

    if (org.logo) orgSchema.logo = org.logo;
    if (org.description) orgSchema.description = org.description;
    if (org.contactPoint) orgSchema.contactPoint = {
      '@type': 'ContactPoint',
      telephone: org.contactPoint.telephone,
      contactType: org.contactPoint.contactType
    };
    if (org.sameAs) orgSchema.sameAs = org.sameAs;

    this.setStructuredData(orgSchema);
  }

  /**
   * Clears all AI-related meta tags.
   */
  clearAIMetadata() {
    this.meta.removeTag('name="googlebot-ai"');
    this.meta.removeTag('name="OAI-SearchBot"');
    this.meta.removeTag('name="ai-content-declaration"');
    this.meta.removeTag('name="ai:summary"');
    this.meta.removeTag('name="ai:content-type"');
    this.meta.removeTag('name="ai:audience"');
    this.meta.removeTag('name="ai:purpose"');
    this.meta.removeTag('name="ai:entity-type"');
  }

}