import { Component, inject } from '@angular/core';
import { environment } from '../../../../../environments/env';
import { NavbarComponent, NavbarTypeEnum } from '../../components/navbar/navbar.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { AccordionGroupComponent } from '../../../../shared/ui/accordion/accordion-group.component';
import { AccordionItemComponent } from '../../../../shared/ui/accordion/accordion-item.component';

@Component({
  selector: 'app-referido-por-amigo',
  standalone: true,
  imports: [NavbarComponent, ButtonComponent, NgOptimizedImage, RouterLink, FooterComponent, AccordionGroupComponent, AccordionItemComponent],
  templateUrl: './referido-por-amigo.component.html',
  styleUrl: './referido-por-amigo.component.css'
})
export class ReferidoPorAmigoComponent {
  private _route = inject(ActivatedRoute);

  ENV = environment;
  navbarTypeEnum = NavbarTypeEnum
  ref = '';
  name = '';
  isRefered = false;

  ngOnInit(){
    this._route.queryParams.subscribe(param => {
      this.ref = param['codigo'] || '';
      this.name = param['nombre'] || '';
      if(this.isReferedValid()){
        this.isRefered = true;
      }
    });
  }

  isReferedValid(){
    if(!this.ref || !this.name)
      return false;
    if(this.ref === '' || this.name === '')
      return false;
    return true;
  }
}
