import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';

@Component({
  selector: 'app-terminos-y-condiciones',
  standalone: true,
  imports: [],
  templateUrl: './terminos-y-condiciones.component.html',
  styleUrl: './terminos-y-condiciones.component.css'
})
export class TerminosYCondicionesComponent {
  ENV = environment
  list = [
    {
      title: 'Artículo 1 - Definiciones',
      description: [
        'Para los efectos de estos Términos y Condiciones, se entiende por:',
        '- Sitio Web: La tienda en línea de Magrolabs, accesible en https://magrolabs.com/.',
        '- Usuario/Miembro: Toda persona natural que se registra en el Sitio Web, adquiere una membresía y, por tanto, es un consumidor final.',
        '- Créditos: La moneda virtual de Magrolabs, acumulada por los Miembros a través del programa de lealtad, utilizada como único medio de pago para los productos.',
        '- Producto: Todos los bienes ofrecidos en el Sitio Web, incluyendo suplementos, ropa y artículos deportivos.',
        '- Proveedor: La empresa Magrolabs S.A.C., identificada con RUC 20614056577.'
      ]
    },
    {
      title: 'Artículo 2 - Identidad del empresario',
      description: [
        'Razón Social: Magrolabs S.A.C.',
        'RUC: 20614056577',
        'Dirección de domicilio legal: Cal. 2 de Mayo Mza. B Lote. 04 Apv. Buenavista Baja, Lurín, Lima, Perú',
        'Correo electrónico de contacto: hola@magrolabs.com',
        'Teléfono de contacto: +51961737705'
      ]
    },
    {
      title: 'Artículo 3 - Aplicabilidad',
      description: [
        'Estos Términos y Condiciones se aplican a toda oferta, pedido y acuerdo contractual realizado a través del Sitio Web de Magrolabs entre el Proveedor y el Usuario.',
        'Antes de que se celebre el contrato, el texto de estas condiciones generales se pondrá a disposición del Usuario de forma electrónica. Al realizar un pedido, el Usuario declara haber leído y aceptado estos términos.'
      ]
    },
    {
      title: 'Artículo 4 - La oferta',
      description: [
        'La oferta de productos y sus precios expresados en Créditos son válidos mientras estén visibles en el Sitio Web y dentro de los límites del stock disponible.',
        'La descripción de los productos será lo más precisa posible, pero las imágenes son de carácter referencial. La oferta inicial de "creatina gratis" está sujeta a los términos de la membresía y se entrega una sola vez por miembro.',
        'Magrolabs se reserva el derecho de modificar la oferta de productos en cualquier momento.'
      ]
    },
    {
      title: 'Artículo 5 - El acuerdo',
      description: [
        'El acuerdo se considera perfeccionado en el momento en que el Usuario finaliza el proceso de canje de un producto, utiliza sus Créditos para ello y acepta expresamente los presentes Términos y Condiciones.',
        'Magrolabs confirmará la recepción del pedido mediante un correo electrónico dirigido a la dirección proporcionada por el Usuario, detallando los productos canjeados y la dirección de entrega.'
      ]
    },
    {
      title: 'Artículo 6 - Derecho de desistimiento en la entrega de productos',
      description: [
        'Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571), el Usuario tiene el derecho de desistimiento ("derecho de arrepentimiento") de la compra sin necesidad de justificación, en un plazo de 15 días calendario desde la recepción del producto.',
        'Para ejercer este derecho, el producto no debe haber sido utilizado y debe ser devuelto en su empaque original y con los sellos de seguridad intactos. El Usuario deberá comunicar su decisión a través de los canales de contacto de Magrolabs.'
      ]
    },
    {
      title: 'Artículo 7 - Costes en caso de retirada',
      description: [
        'Si el Usuario ejerce su derecho de desistimiento, deberá asumir el costo directo de la devolución de los productos.',
        'Una vez que Magrolabs reciba y verifique el estado del producto devuelto, procederá a la reversión de los Créditos utilizados en la compra a la cuenta del Usuario en un plazo no mayor a 15 días hábiles. No se reembolsarán los gastos de envío originales, si los hubiera.'
      ]
    },
    {
      title: 'Artículo 8 - Exclusión del derecho de revocación',
      description: [
        'El derecho de desistimiento no será aplicable en los siguientes casos:',
        '- Productos como suplementos cuyo sello de seguridad haya sido abierto o vulnerado, por razones de protección de la salud e higiene.',
        '- Ropa o artículos deportivos que muestren señales de haber sido usados, lavados o alterados de su condición original.',
        '- Productos confeccionados conforme a las especificaciones personalizadas del consumidor.'
      ]
    },
    {
      title: 'Artículo 9 - El precio',
      description: [
        'Todos los precios de los productos en el Sitio Web están expresados en "Nuevos soles". A excepción de los productos de la Loyalty webshop que se venden en "Créditos", que son la única forma de pago aceptada y se obtienen a través del programa de lealtad de Magrolabs.',
        'Los precios en Créditos incluyen el Impuesto General a las Ventas (IGV) y demás tributos aplicables. Los costos de envío no están incluidos, a excepción de las promociones específicas como el envío gratuito a Lima Metropolitana.'
      ]
    },
    {
      title: 'Artículo 10 - Conformidad y garantía',
      description: [
        'Magrolabs garantiza que los productos se ajustan a la descripción proporcionada y son idóneos para el uso normal al que se destinan, en conformidad con la garantía legal establecida en el Código de Protección y Defensa del Consumidor.',
        'En caso de un producto defectuoso, el Usuario deberá contactar a Magrolabs para gestionar la reparación, sustitución o el reembolso de Créditos correspondiente, según lo estipula la ley.'
      ]
    },
    {
      title: 'Artículo 11 - Entrega y realización',
      description: [
        'La entrega de los productos se realizará en la dirección indicada por el Usuario durante el proceso de compra. Es responsabilidad del Usuario proporcionar una dirección válida y completa.',
        'El envío es gratuito únicamente para direcciones dentro de Lima Metropolitana. Para otras zonas del país, el costo y tiempo de envío serán especificados antes de finalizar la compra. El plazo de entrega estimado para Lima es de 3 a 6 días hábiles.',
        'El riesgo de pérdida o daño del producto se transfiere al Usuario en el momento de la entrega.'
      ]
    },
    {
      title: 'Artículo 12 - Duración de las transacciones',
      description: [
        'La relación contractual para cada compra es de ejecución instantánea y concluye con la entrega satisfactoria del producto.',
        'La membresía que otorga los Créditos es de carácter continuo y se rige por sus propias condiciones. Los créditos no tienen fecha de vencimiento.'
      ]
    },
    {
      title: 'Artículo 13 - Pago',
      description: [
        'El pago de los productos se realizará con tarjeta de crédito o débito, o con transferencia bancaria, o con pago en efectivo, o con billeteras electrónicas.',
        'El pago de los productos de la Loyalty webshop se realizará única y exclusivamente mediante el uso de los "Créditos" acumulados en la cuenta del Miembro.',
        'El pedido no será procesado hasta que el sistema haya debitado exitosamente el monto total en Créditos del saldo de la cuenta del Usuario.'
      ]
    },
    {
      title: 'Artículo 14 - Procedimiento de reclamación',
      description: [
        'Magrolabs cuenta con un Libro de Reclamaciones Virtual, conforme a lo dispuesto por el INDECOPI y la Ley N° 29571.',
        'Ante cualquier queja o reclamo, el Usuario puede registrarlo en dicho libro a través del enlace disponible en el Sitio Web. Magrolabs dará respuesta al reclamo en un plazo no mayor a 15 días hábiles, según lo establece la normativa vigente.'
      ]
    },
    {
      title: 'Artículo 15 - Litigios',
      description: [
        'Estos Términos y Condiciones se rigen e interpretan de acuerdo con las leyes de la República del Perú.',
        'Cualquier controversia que surja en relación con estos términos será sometida a la jurisdicción de los jueces y tribunales del distrito judicial de Lima, Cercado.'
      ]
    },
    {
      title: 'Artículo 16 - Disposiciones adicionales o divergentes',
      description: [
        'Magrolabs se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en el Sitio Web y entrarán en vigor desde su publicación.',
        'Si alguna cláusula de estos términos fuera declarada nula, las demás cláusulas permanecerán vigentes y se interpretarán en el sentido de la voluntad de las partes.'
      ]
    }
  ];

  fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionTerminosCondiciones

}
