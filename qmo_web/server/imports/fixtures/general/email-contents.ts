import { EmailContent } from '../../../../both/models/general/email-content.model';
import { EmailContents } from '../../../../both/collections/general/email-content.collection';

export function loadEmailContents() {
    if (EmailContents.find().cursor.count() === 0) {
        const emailContents: EmailContent[] = [
            {
                _id: '100',
                language: 'en',
                lang_dictionary: [
                    { label: 'chargeSoonEmailSubjectVar', traduction: 'Your monthly Iurest service will end soon' },
                    { label: 'greetVar', traduction: 'Hello' },
                    { label: 'welcomeMsgVar', traduction: 'We got a request to reset you password, if it was you click the button above.' },
                    { label: 'btnTextVar', traduction: 'Reset' },
                    { label: 'beforeMsgVar', traduction: 'If you do not want to change the password, ignore this message.' },
                    { label: 'regardVar', traduction: 'Thanks, Iurest team.' },
                    { label: 'followMsgVar', traduction: 'Follow us on social networks' },
                    { label: 'reminderChargeSoonMsgVar', traduction: 'Remember that your monthly Iurest service period end at: ' },
                    { label: 'instructionchargeSoonMsgVar', traduction: 'If you want to continue using all the system features, entering with your email or username and select the menu Restaurants > Administration > Edit restaurant > # Tables' }
                ]
            },
            {
                _id: '200',
                language: 'es',
                lang_dictionary: [
                    { label: 'chargeSoonEmailSubjectVar', traduction: 'Tu servicio mensual de Iurest terminará pronto' },
                    { label: 'greetVar', traduction: 'Hola' },
                    { label: 'welcomeMsgVar', traduction: 'Hemos recibido una petición para cambiar tu contraseña, si fuiste tu haz click en el botón abajo' },
                    { label: 'btnTextVar', traduction: 'Cambiar' },
                    { label: 'beforeMsgVar', traduction: 'Si no quieres cambiar la contraseña, ignora este mensaje.' },
                    { label: 'regardVar', traduction: 'Gracias, equipo Iurest' },
                    { label: 'followMsgVar', traduction: 'Siguenos en redes sociales' },
                    { label: 'reminderChargeSoonMsgVar', traduction: 'Recuerda que tu servicio de Iurest mensual finaliza el: ' },
                    { label: 'instructionchargeSoonMsgVar', traduction: 'Si deseas seguir usando todas las funcionalidades del sistema, ingresa con tu usuario o correo y selecciona el menú Restaurante > Administración > Editar restaurante > # Mesas' }
                ]
            }
        ];
        emailContents.forEach((emailContent: EmailContent) => EmailContents.insert(emailContent));
    }
}