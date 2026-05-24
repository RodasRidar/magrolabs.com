import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';
import { IconComponent } from '../../../../../shared/ui/icon/icon.component';

@Component({
    selector: 'app-condiciones-de-uso',
    imports: [IconComponent],
    templateUrl: './condiciones-de-uso.component.html',
    styleUrl: './condiciones-de-uso.component.css'
})
export class CondicionesDeUsoComponent {
  ENV = environment
 list = [
  {
    title: 'Definiciones y Ámbito',
    description: [
      '“Magrolabs” se refiere a la plataforma y tienda en línea operada por la empresa titular, registrada según legislación peruana.',
      '“Usuario” o “Suscriptor” es la persona natural o jurídica que crea una cuenta, acepta estas Condiciones y contrata servicios o productos de suscripción.',
      'Estas Condiciones rigen el uso de la plataforma, la suscripción de productos y servicios, pagos y comunicaciones electrónicas.'
    ]
  },
  {
    title: 'Suscripción y Renovación Automática',
    description: [
      'La suscripción se renueva automáticamente cada mes, cargando la cuota a través del método de pago vinculado en la cuenta del Usuario, hasta que éste la cancele. El Usuario autoriza expresamente dichos débitos recurrentes.',
      'El método de pago debe ser válido y aceptado en Perú (por ejemplo, tarjeta de débito/crédito o pasarela local). Magrolabs podrá requerir verificación de la cuenta, pudiendo aplicar un cargo único de verificación (por ejemplo, S/1 para vinculación bancaria), siempre con previo aviso y consentimiento explícito del Usuario.',
      'El Usuario puede actualizar sus datos de pago en su cuenta en cualquier momento; Magrolabs no será responsable por débitos fallidos si la información no está vigente.',
      'En caso de impago recurrente, se notificará al Usuario para regularizar; si persiste el impago, la suscripción podrá suspenderse o cancelarse conforme a las normas aplicables.'
    ]
  },
  {
    title: 'Período de Desistimiento / Derecho de Retracto',
    description: [
      'El Usuario cuenta con el derecho de desistimiento conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571): para ventas a distancia, podrá retractarse dentro de los 7 días hábiles siguientes a la recepción del primer producto sin necesidad de indicar causa y sin penalidad.',
      'Para ejercer el desistimiento, el Usuario debe comunicar su decisión a Magrolabs vía su cuenta o canales habilitados, antes de expirado el plazo; los costos de devolución serán a cargo del Usuario salvo que Magrolabs disponga lo contrario en promociones especiales.',
      'Si se ejerce el desistimiento en plazo, se reembolsará cualquier monto cobrado por esa primera entrega dentro de los plazos que fija la ley, utilizando el mismo medio de pago o mediante crédito en tienda según el acuerdo con el Usuario.'
    ]
  },
  {
    title: 'Periodo de Prueba y Primer Envío',
    description: [
      'La suscripción puede incluir un primer envío gratuito o promocional según campaña; este beneficio se aplica una sola vez por cuenta única (único correo electrónico, único RUC/DNI o CLABE de cuenta bancaria y única dirección de envío).',
      'El período para evaluar dicho primer envío entrará dentro del derecho de desistimiento antes mencionado.',
      'En caso de abuso o creación de cuentas duplicadas para obtener beneficios múltiples, Magrolabs cobrará el monto correspondiente a los productos obtenidos sin pago y podrá bloquear la cuenta. Los cargos de verificación inicial no son reembolsables si se detecta abuso.'
    ]
  },
  {
    title: 'Entregas y Débitos Mensuales',
    description: [
      'El cargo de la cuota mensual se efectuará en una fecha aproximada (por ejemplo, día 27 de cada mes) y el envío del producto correspondiente se realizará en el siguiente período (por ejemplo, entre días 10 y 20), siempre que el pago se haya procesado correctamente.',
      'Magrolabs informará en su sitio o mediante notificación al Usuario los plazos de facturación y despacho vigentes. Cualquier cambio en estos plazos será comunicado con al menos 30 días de anticipación.',
      'Si el pago se procesa después de la fecha límite, el envío podrá retrasarse hasta el próximo ciclo; el Usuario será notificado para decidir si mantiene o cancela la suscripción antes de un nuevo intento de débito.'
    ]
  },
  {
    title: 'Membresías Adicionales',
    description: [
      'Un Usuario puede gestionar múltiples suscripciones (p. ej. hasta 10), sujetas a límites internos (p. ej. máximo 5 de cierto tipo). Cada suscripción adicional no incluirá primer envío gratuito a menos que se indique expresamente en la promoción.',
      'El cargo de cada membresía adicional se hará en el siguiente ciclo de pago tras su creación, con la misma mecánica y condiciones generales de suscripción.'
    ]
  },
  {
    title: 'Cancelación de Suscripción',
    description: [
      'El Usuario puede cancelar su suscripción directamente desde su cuenta en Magrolabs en cualquier momento. Para suspender la renovación automática, debe hacerlo antes del vencimiento del periodo de facturación actual (se recomienda con al menos 5 días de anticipación, salvo que se indique otro plazo en el sitio).',
      'Si la cancelación se solicita dentro del periodo de facturación activo, podrá aplicarse un último débito y envío si la cancelación no se gestiona antes de la fecha límite de débito.',
      'Tras la cancelación, la cuenta permanece activa para reactivaciones posteriores, pero no tendrá derecho a beneficios de primer envío salvo que existan promociones específicas para reactivación.'
    ]
  },
  {
    title: 'Modificaciones de Precio y Condiciones',
    description: [
      'Magrolabs podrá modificar precios, cargos o condiciones de la suscripción; dichos cambios no serán aplicables hasta pasados 30 días desde la notificación al Usuario en la cuenta o correo electrónico registrado',
      'Si el Usuario no acepta los cambios, podrá cancelar su suscripción antes de la fecha de vigencia del nuevo precio sin penalidad.',
      'Las promociones especiales o códigos de descuento estarán sujetos a términos especiales anunciados en su momento y no podrán combinarse salvo que se especifique lo contrario.'
    ]
  },
  {
    title: 'Garantía y Devoluciones',
    description: [
      'Los productos cuentan con garantía contra defectos de fabricación o daños en transporte. El Usuario dispondrá de un plazo (p. ej. 90 días) para solicitar reemplazo o reparación según la naturaleza del producto, cumpliendo condiciones específicas: no haber uso indebido, conservar empaque o etiqueta original y no existir pagos pendientes.',
      'Para solicitar reemplazo o devolución bajo garantía, debe hacerlo desde su cuenta o canal designado, cumpliendo los requisitos de documentación e instrucciones de envío. En caso de procedencia, Magrolabs asumirá costos de reposición o envío según normativas de consumo y buenas prácticas.',
      'Esta garantía no limita derechos del consumidor contemplados en la ley, incluyendo responsabilidad por vicios o defectos ocultos detectados posteriormente.'
    ]
  },
  {
    title: 'Datos Personales y Privacidad',
    description: [
      'Magrolabs cumple con la Ley N° 29733 de Protección de Datos Personales y su Reglamento (DS 016-2024-JUS) en vigor desde el 30 de marzo de 2025: recopila, almacena y trata datos del Usuario para finalidades legítimas (p. ej. facturación, envíos, atención al cliente) con base legal y medidas de seguridad apropiadas.',
      'El Usuario puede ejercer sus derechos de acceso, rectificación, cancelación y oposición (ARCO) mediante petición dirigida a Magrolabs, siguiendo los procedimientos publicados en la Política de Privacidad.',
      'Magrolabs no compartirá datos con terceros no autorizados salvo obligaciones legales o con proveedores necesarios para la prestación del servicio (p. ej. empresas de paquetería, pasarelas de pago), siempre con cláusulas de confidencialidad y seguridad.'
    ]
  },
  {
    title: 'Propiedad Intelectual',
    description: [
      'Todo contenido de la plataforma (textos, imágenes, logos, diseños) es propiedad de Magrolabs o de terceros con licencia. Queda prohibida su reproducción, distribución o uso no autorizado.',
      'El Usuario concede a Magrolabs licencia no exclusiva para usar contenido que provea (p. ej. reseñas, imágenes para personalización), con fines de operar la plataforma y servicios relacionados.'
    ]
  },
  {
    title: 'Responsabilidad y Exenciones',
    description: [
      'Magrolabs no será responsable por daños indirectos, lucro cesante o perjuicios derivados de fuerza mayor o caso fortuito en la entrega o proceso de suscripción, salvo obligaciones imperativas en favor del consumidor según la ley peruana (Ley N° 29571).',
      'Magrolabs responderá por incumplimiento o defectos en los productos conforme a la garantía ofrecida y la normativa aplicable en defensa del consumidor.'
    ]
  },
  {
    title: 'Atención al Cliente y Reclamaciones',
    description: [
      'El Usuario podrá presentar consultas o reclamaciones a través de los canales publicados en el sitio (correo electrónico, formulario en línea, chat u otros). Magrolabs dará respuesta dentro de los plazos señalados en normativa de protección al consumidor.',
      'Si no queda conforme con la resolución interna, el Usuario puede acudir a Indecopi o a mecanismos de solución de controversias en línea reconocidos en Perú (SPO – Sistema de Solución de Controversias en Línea).'
    ]
  },
  {
    title: 'Comunicaciones Electrónicas',
    description: [
      'Todas las notificaciones o comunicaciones que Magrolabs envíe al Usuario (facturas, avisos de débito, cambios de condiciones, confirmaciones) se considerarán válidas si se envían al correo registrado o mediante mensajes en la plataforma.',
      'El Usuario debe mantener actualizada su dirección de correo; si no recibe notificaciones por datos desactualizados, seguirá aplicándose lo comunicado en la plataforma o última dirección registrada.'
    ]
  },
  {
    title: 'Legislación Aplicable y Jurisdicción',
    description: [
      'Estas Condiciones se rigen por la legislación peruana, en especial el Código de Protección y Defensa del Consumidor (Ley N° 29571), la Ley de Protección de Datos Personales (Ley N° 29733 y su Reglamento) y demás normas aplicables.',
      'Para cualquier controversia, las partes se someten a la competencia de los órganos previstos por ley (Indecopi, Poder Judicial u otros mecanismos de arbitraje o mediación válidos en Perú), sin perjuicio de medios alternativos de solución pactados de común acuerdo.'
    ]
  },
  {
    title: 'Modificaciones de las Condiciones de Uso',
    description: [
      'Magrolabs puede modificar estas Condiciones periódicamente. Los cambios se notificarán al Usuario con al menos 30 días de anticipación antes de su entrada en vigencia.',
      'Si el Usuario no manifiesta oposición dentro de ese plazo, se entenderá aceptada la modificación. Si no está de acuerdo, podrá cancelar su suscripción antes de la fecha de vigencia de los nuevos términos.'
    ]
  },
  {
    title: 'Disposiciones Finales',
    description: [
      'Si alguna disposición de estas Condiciones se declara nula o inaplicable, las demás disposiciones seguirán vigentes.',
      'La falta de ejercicio de un derecho o la demora en exigir su cumplimiento no implica renuncia a éste.',
      'Para más información o aclaraciones, el Usuario puede consultar la sección de Ayuda en el sitio o contactar Atención al Cliente.'
    ]
  }
];

fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionCondicionesUso

}
