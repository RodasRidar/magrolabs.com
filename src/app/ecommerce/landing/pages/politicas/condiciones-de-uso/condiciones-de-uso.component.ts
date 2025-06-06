import { Component } from '@angular/core';
import { environment } from '../../../../../../environments/env';
import { title } from 'process';

@Component({
  selector: 'app-condiciones-de-uso',
  standalone: true,
  imports: [],
  templateUrl: './condiciones-de-uso.component.html',
  styleUrl: './condiciones-de-uso.component.css'
})
export class CondicionesDeUsoComponent {
  ENV = environment
  list = [
    {
      title: 'Suscripción',
      description:[
        '1.1. Tu suscripción a Magrolabs se renueva automáticamente cada mes hasta que la canceles. La cancelación se realiza a través de la cuenta creada al registrarse. Al registrarte, también proporcionas un método de pago. Método de pago significa un método válido, aceptado y mencionado en la página de registro del país correspondiente, que puede actualizarse ocasionalmente. Al registrarte, te pedimos que pagues 1,00€ como costos de verificación, para que podamos vincular tu número de cuenta bancaria a tu cuenta y prevenir fraudes. Nos das permiso para debitar mensualmente las cuotas de tu suscripción a través de tu método de pago, a menos que canceles tu suscripción dentro del período de reflexión de 14 días.',
        '1.2. Solo puedes elegir el diseño de tu primer bóxer o conjunto gratis durante el registro. Luego, recibirás cada mes un nuevo bóxer o hipster. El diseño será una sorpresa hasta que llegue a tu buzón. No puedes intercambiar el diseño del mes por un bóxer o hipster/bralette lanzado anteriormente. Las condiciones anteriores también se aplican a la membresía de Socks y Undershirt, sin embargo, el primer par de Socks/Undershirt gratis no es a elección propia.'
      ]
    },
    {
      title: 'Periodo de reflexión',
      description:[
        '2.1. Período de reflexión. Tu suscripción a Magrolabs comienza con un período de reflexión de 14 días, a menos que se indique lo contrario durante el proceso de registro. Después de recibir tu primer bóxer o conjunto gratis, puedes probarlo durante 14 días. Si cancelas dentro del período de reflexión, no pagas nada y tu suscripción termina. Después de tus primeros 14 días, aplicamos un plazo de cancelación de un mes. Si cancelas antes del día 20 del mes, se realizará un último pago y una última entrega.',
        '2.2 Cuenta única. Cada cuenta única tiene derecho a un bóxer o conjunto gratis. Una cuenta única consiste en un correo electrónico único, número de cuenta bancaria único y una dirección única. Cada número de cuenta bancaria, dirección y/o correo electrónico puede usarse una sola vez. En caso de abuso, se cobrará el precio de todos los productos obtenidos sin pagar suscripción. En el caso de una cuenta duplicada, los costos de verificación de 1,00€ no se reembolsarán.',
        '2.3 Membresías adicionales. Un usuario puede crear de 1 a 10 membresías a través de su cuenta, con un máximo de 5 membresías de Men/Women/Boys y un máximo de 5 membresías de Socks/Undershirt. Las membresías creadas se cargarán en el siguiente débito. Para una membresía adicional, el primer bóxer o conjunto no es gratis.',
        '2.4 Registro. Tu período de reflexión de 14 días comienza desde el momento en que recibes tu primer bóxer o conjunto. Te informamos por correo electrónico cuando termina tu período de reflexión. Dentro del período de reflexión, puedes cancelar tu membresía de inmediato. Si no lo haces, tu suscripción se activará automáticamente. Después del período de reflexión, se aplica un plazo de cancelación de un mes para cancelar tu suscripción.',
        '2.5. Oferta. Magrolabs determinará a su discreción si alguien es elegible para el período de reflexión y puede limitar las condiciones o la duración para evitar abusos. Nos reservamos el derecho de cobrar por varios bóxers o conjuntos gratis obtenidos por cuenta.',
        '2.6. Cuotas de suscripción. Debemos las cuotas de suscripción mensuales al final del período de reflexión a través de tu método de pago, a menos que canceles tu membresía antes de que termine el período de reflexión de 14 días.',
        '2.7. Plazo de cancelación. La suscripción a Magrolabs se renueva automáticamente después de tu período de reflexión de 14 días. Durante el período de reflexión de 14 días, puedes cancelar el contrato de inmediato. Una vez que tu suscripción esté activa, podrás cancelarla mensualmente.',
      ]
    },
    {
      title: 'Periodo de reflexión',
      description:[
        '2.1. Período de reflexión. Tu suscripción a Magrolabs comienza con un período de reflexión de 14 días, a menos que se indique lo contrario durante el proceso de registro. Después de recibir tu primer bóxer o conjunto gratis, puedes probarlo durante 14 días. Si cancelas dentro del período de reflexión, no pagas nada y tu suscripción termina. Después de tus primeros 14 días, aplicamos un plazo de cancelación de un mes. Si cancelas antes del día 20 del mes, se realizará un último pago y una última entrega.',
        '2.2 Cuenta única. Cada cuenta única tiene derecho a un bóxer o conjunto gratis. Una cuenta única consiste en un correo electrónico único, número de cuenta bancaria único y una dirección única. Cada número de cuenta bancaria, dirección y/o correo electrónico puede usarse una sola vez. En caso de abuso, se cobrará el precio de todos los productos obtenidos sin pagar suscripción. En el caso de una cuenta duplicada, los costos de verificación de 1,00€ no se reembolsarán.',
        '2.3 Membresías adicionales. Un usuario puede crear de 1 a 10 membresías a través de su cuenta, con un máximo de 5 membresías de Men/Women/Boys y un máximo de 5 membresías de Socks/Undershirt. Las membresías creadas se cargarán en el siguiente débito. Para una membresía adicional, el primer bóxer o conjunto no es gratis.',
        '2.4 Registro. Tu período de reflexión de 14 días comienza desde el momento en que recibes tu primer bóxer o conjunto. Te informamos por correo electrónico cuando termina tu período de reflexión. Dentro del período de reflexión, puedes cancelar tu membresía de inmediato. Si no lo haces, tu suscripción se activará automáticamente. Después del período de reflexión, se aplica un plazo de cancelación de un mes para cancelar tu suscripción.',
        '2.5. Oferta. Magrolabs determinará a su discreción si alguien es elegible para el período de reflexión y puede limitar las condiciones o la duración para evitar abusos. Nos reservamos el derecho de cobrar por varios bóxers o conjuntos gratis obtenidos por cuenta.',
        '2.6. Cuotas de suscripción. Debemos las cuotas de suscripción mensuales al final del período de reflexión a través de tu método de pago, a menos que canceles tu membresía antes de que termine el período de reflexión de 14 días.',
        '2.7. Plazo de cancelación. La suscripción a Magrolabs se renueva automáticamente después de tu período de reflexión de 14 días. Durante el período de reflexión de 14 días, puedes cancelar el contrato de inmediato. Una vez que tu suscripción esté activa, podrás cancelarla mensualmente.',
      ]
    },
    {
      title: 'Período de prueba gratis',
      description:[
        '3.1. Cuotas de suscripción. Las cuotas de suscripción de Magrolabs se debitan mensualmente a través del método de pago vinculado al registrarte.',
        '3.2. Débito y entrega. Las cuotas de suscripción de Magrolabs se debitan antes de que se entregue el producto correspondiente. El débito se realiza alrededor del día 27 de cada mes, y la entrega se realiza a partir del día 17 del mes siguiente',
        '3.3. Método de pago. Para participar en Magrolabs, debes proporcionar un método de pago válido. Puedes consultar o modificar tus medios de pago en tu cuenta, en el menú superior "Datos personales! y luego en el menú lateral "Datos de pago". Para utilizar y vincular algunos métodos de pago, el proveedor puede cobrarte ciertas tasas, como tasas por transacciones internacionales u otras tasas por procesar tus medios de pago. Los impuestos locales pueden variar según los métodos de pago. Para más información, ponte en contacto con el proveedor de tu método de pago.',
        '3.4. Cancelación. Puedes cancelar tu suscripción a Magrolabs en cualquier momento en línea a través de tu cuenta creada durante el registro. Después de cancelar, mantienes acceso a tu cuenta de Magrolabs, donde puedes reactivar tu membresía. La cancelación se puede realizar en tu cuenta en "Membresías" . Después de cancelar, se enviará automáticamente un correo electrónico de confirmación a la dirección de correo electrónico registrada.',
        '3.5. Modificaciones. Podemos cambiar nuestra suscripción y el precio de nuestro servicio de vez en cuando. Sin embargo, los cambios de precio o cambios en nuestra suscripción no serán efectivos hasta 20 días después de la notificación.',
        '3.6. Supresión de datos. Puede utilizar el "Derecho de inspección" para obtener una visión general de los datos personales que tenemos registrados sobre ti. Puedes modificar tus datos y utilizar el "Derecho de rectificación". Puedes modificar tú mismo la mayoría de los datos online a través de tu cuenta. Haz clic en el siguiente enlace: Aquí para obtener más información sobre la modificación o supresión de tus datos.',
      ]
    },
    {
      title: 'Garantía de devolución',
      description:[
        '4.1. Devoluciones. Si tu producto de Magrolabs se rompe dentro de los 90 días (por uso normal), te enviaremos un nuevo producto sin costo (debes cumplir con las condiciones para enviar una solicitud de devolución, ver el punto 4.2. Condiciones). Solo recibirás un nuevo producto al enviar una solicitud de devolución en tu cuenta. Ve a la sección "Pedidos" y selecciona una solicitud de devolución para el producto correspondiente. Si calificas para un producto de reemplazo, tu solicitud será aprobada. Serás notificado a través del correo electrónico registrado',
        '4.2. Condiciones. Sólo puede presentar una solicitud de cambio si cumple las tres condiciones siguientes:',
        'El producto no debe haber sido recibido hace más de 90 días. No debe haber ningún pago pendiente. Cualquier solicitud de cambio anterior debe haber sido completada.'
      ]
    },
    {
      title: 'Facturación y cancelación',
      description: [
        '5.1. Reactivación. Cuando cancelas tu suscripción, tu cuenta permanece activa. Puedes iniciar sesión en cualquier momento para ver tus datos y reactivar tu suscripción. Al reactivar, se aplicará el siguiente débito. No recibirás un bóxer o conjunto gratis al reactivar, ya que lo recibiste al registrarte, a menos que reactives con una promoción específica.',
        '5.2. Miembro activo. Al reactivar tu suscripción, vuelves a ser un miembro activo. No tienes período de reflexión y se aplica un plazo de cancelación de un mes.',
        '5.3. Cancelación. Aseguramos que debes pasar por al menos dos pasos para poder reactivar la suscripción. Si decides no reactivar, contáctanos aquí.'
      ]
    },
    {
      title: 'Loyalty',
      description: [
        '6.1. Loyalty Durante tu membresía recibirás un crédito de compra con un máximo de 200 euros. Solo recibirás un nuevo crédito de tienda una vez que el crédito recibido anteriormente se haya gastado en la tienda web.',
      ]
    },
    {
      title: 'Descuentos',
      description: [
        '7.1. Edad. Debes tener al menos dieciocho años o ser mayor de edad en tu Provincia, Región o País para convertirte en miembro y unirte a Magrolabs.',
        '7.2. El miembro que creó la cuenta de Magrolabs y cuyo método de pago se utiliza para las cuotas de suscripción (también llamado el usuario), tiene acceso y control sobre la cuenta de Magrolabs. Además, el usuario es responsable de todas las actividades que ocurren a través de la cuenta. Eres responsable de la exactitud de los datos que nos proporcionas con respecto a tu cuenta y de actualizarlos cuando sea necesario. Podemos cancelar o bloquear temporalmente tu cuenta para protegerte a ti, a Magrolabs o a nuestros socios contra el robo de identidad u otras actividades fraudulentas.'
      ]
    },
    {
      title: 'Otros',
      description: [
        '8.1. Legislación aplicable. Las presentes Condiciones de Uso se regirán e interpretarán de conformidad con la legislación peruana. Estas Condiciones no limitan la protección obligatoria del consumidor a la que pueda tener derecho en virtud de la legislación aplicable en su país.',
        '8.2. Atención al Cliente. Si quieres saber más sobre nuestro servicio o necesitas ayuda con tu cuenta, visita nuestra página de ayuda e información. Para ello, ve a .',
        '8.3. Continuidad de las disposiciones. Si una o más disposiciones de estas Condiciones de uso se consideran inválidas, ilegales o inaplicables, la validez, legalidad y aplicabilidad de las disposiciones restantes no se verán afectadas.',
        '8.4. Modificaciones de las Condiciones de Uso. Magrolabs podrá modificar periódicamente las presentes Condiciones de Uso. Te notificaremos al menos 30 días antes de que dichos cambios te apliquen.',
        '8.5. Comunicación electrónica. Te enviaremos información sobre tu Cuenta (como autorizaciones de pago, facturas, cambios de contraseña, cambios en tu(s) método(s) de pago, mensajes de confirmación y avisos) únicamente en formato electrónico, por ejemplo, por correo electrónico a la dirección de correo electrónico que proporcionaste al registrarte.',

      ]
    }
  ]
fechaUltimaActualizacion = this.ENV.fechaUltimaActualizacionCondicionesUso

}
