import { EmailContent } from '../../../../both/models/general/email-content.model';
import { EmailContents } from '../../../../both/collections/general/email-content.collection';

export function loadEmailContents() {
    if (EmailContents.find().cursor.count() === 0) {
        const emailContents: EmailContent[] = [
            {
                _id: '100',
                language: 'en',
                lang_dictionary: [
                    { label: 'trial_email_subject', traduction: 'Your trial period will end soon' },
                    { label: 'greetVar', traduction: 'Hello' },
                    { label: 'welcomeMsgVar', traduction: 'We got a request to reset you password, if it was you click the button above.' },
                    { label: 'btnTextVar', traduction: 'Reset' },
                    { label: 'beforeMsgVar', traduction: 'If you do not want to change the password, ignore this message.' },
                    { label: 'regardVar', traduction: 'Thanks, Iurest team.' },
                    { label: 'followMsgVar', traduction: 'Follow us on social networks' },
                    { label: 'reminderMsgVar', traduction: 'Remember that your Iurest trial period end at: ' },
                    { label: 'instructionMsgVar', traduction: 'If you want to continue using all the system features, entering with your email or username and select the menu Restaurants > Administration > Edit restaurant > # Tables' }
                ]
            },
            {
                _id: '200',
                language: 'es',
                lang_dictionary: [
                    { label: 'trial_email_subject', traduction: 'Tu periodo de prueba terminará pronto' },
                    { label: 'greetVar', traduction: 'Hola' },
                    { label: 'welcomeMsgVar', traduction: 'Hemos recibido una petición para cambiar tu contraseña, si fuiste tu haz click en el botón abajo' },
                    { label: 'btnTextVar', traduction: 'Cambiar' },
                    { label: 'beforeMsgVar', traduction: 'Si no quieres cambiar la contraseña, ignora este mensaje.' },
                    { label: 'regardVar', traduction: 'Gracias, equipo Iurest' },
                    { label: 'followMsgVar', traduction: 'Siguenos en redes sociales' },
                    { label: 'reminderMsgVar', traduction: 'Recuerda que tu periodo de prueba de Iurest finaliza el: ' },
                    { label: 'instructionMsgVar', traduction: 'Si deseas seguir usando todas las funcionalidades del sistema, ingresa con tu usuario o correo y selecciona el menú Restaurante > Administración > Editar restaurante > # Mesas' }
                ]
            }
        ];

        emailContents.forEach((emailContent: EmailContent) => EmailContents.insert(emailContent));
    }
}