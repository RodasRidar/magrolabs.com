import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-preguntas-frecuentes',
    imports: [IconComponent],
    templateUrl: './preguntas-frecuentes.component.html',
    styleUrl: './preguntas-frecuentes.component.css'
})
export class PreguntasFrecuentesComponent {
 ENV = environment

}
