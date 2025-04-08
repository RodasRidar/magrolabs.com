import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
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

}