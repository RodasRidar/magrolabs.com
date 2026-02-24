import { Component, signal } from '@angular/core';
import { environment } from '../../../../../../../environments/env';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

interface Product {
  slug: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  color: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent {

  ENV = environment;

  // Lista de productos disponibles
  products = signal<Product[]>([
    {
      slug: 'shaker-negro-magrolabs',
      name: 'Shaker Magrolabs',
      price: 80,
      description: 'Nuestra botella es ideal para mezclar proteina, creatina y llevarlo a donde quieras. Hecho de materiales de alta calidad.',
      imageUrl: 'LoyaltyWebShop/shaker_black.webp',
      color: 'Negro'
    },
    {
      slug: 'guantes-gimnasio-negro',
      name: 'Guantes para gimnasio',
      price: 100,
      description: 'Nuestros guantes deportivos de alta calidad los puedes utilizar para levantar pesas, hacer crossfit, montar bicicleta e ir al gimnasio. Estos guantes tienen una correa de soporte para la muñeca que ayuda a prevenir lesiones mientras te ejercitas.',
      imageUrl: 'LoyaltyWebShop/gloves_black.webp',
      color: 'Negro'
    },
    {
      slug: 'bolsa-negra-magrolabs',
      name: 'Bolsa Magrolabs',
      price: 150,
      description: 'Nuestra bolsa negra deportiva es ideal para llevar tus cosas al gimnasio o al trabajo, con un diseño único y exclusivo.',
      imageUrl: 'LoyaltyWebShop/bag_black.webp',
      color: 'Negro'
    },
    {
      slug: 'bolsa-desert-magrolabs',
      name: 'Bolsa Magrolabs',
      price: 160,
      description: 'Nuestra bolsa crema con logo es ideal para llevar tus cosas al gimnasio o al trabajo, con un diseño único y exclusivo.',
      imageUrl: 'LoyaltyWebShop/bag_desert.png',
      color: 'Desert'
    },
    {
      slug: 'polera-negra-magrolabs',
      name: 'Polera Magrolabs',
      price: 190,
      description: 'Nuestra polera minimalista y exclusiva hecha de algodón 100% orgánico con materiales de alta calidad y prelavado.',
      imageUrl: 'LoyaltyWebShop/hoodie_black.webp',
      color: 'Negro'
    },
    {
      slug: 'polera-desert-magrolabs',
      name: 'Polera Magrolabs',
      price: 200,
      description: 'Nuestra polera minimalista y exclusiva hecha de algodón 100% orgánico con materiales de alta calidad y prelavado.',
      imageUrl: 'LoyaltyWebShop/hoodie_desert.png',
      color: 'Desert'
    }
  ]);

}
