import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/env';
import { HeaderComponent } from '../../../signup/components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-mi-primera-creatina',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, NavbarComponent],
  templateUrl: './mi-primera-creatina.component.html',
  styleUrl: './mi-primera-creatina.component.css'
})
export class MiPrimeraCreatinaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  
  lote = signal<string>('');
  ENV = environment;
  NavbarTypeEnum = NavbarTypeEnum;
  ngOnInit(): void {
    // Obtener el parámetro de query 'lote'
    this.route.queryParams.subscribe(params => {
      this.lote.set(params['lote'] || '');
    });
  }
} 