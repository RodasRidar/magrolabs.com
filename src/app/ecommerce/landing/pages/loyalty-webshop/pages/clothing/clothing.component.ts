import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-clothing',
  standalone: true,
  imports: [CurrencyPipe, ButtonComponent, NgOptimizedImage, RouterLink],
  templateUrl: './clothing.component.html',
  styleUrl: './clothing.component.css'
})
export class ClothingComponent {

  private route = inject(ActivatedRoute);
  productName = '';
  productPrice = 0;
  productDescription = '';
  isOutOfStock = false;
  isLogged = false;
  slug = '';

  ngOnInit() {

    // get the slug from the URL
    this.slug = this.route.snapshot.params['slug'];
    // this.productService.getProduct(slug).subscribe(product => {
    //   this.product = product;
    // });
    this.isOutOfStock = true;
    this.productName = 'Guantes para gimnasio';
    this.productPrice = 120;
    this.productDescription = 'Nuestros guantes deportivos de alta calidad los puedes utilizar para levantar pesas, hacer crossfit, montar bicicleta e ir al gimnasio. Estos guantes tienen una correa de soporte para la muñeca que ayuda a prevenir lesiones mientras te ejercitas.'
  }
}
