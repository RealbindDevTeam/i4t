import { Parameter } from '../../../../both/models/general/parameter.model';
import { Parameters } from '../../../../both/collections/general/parameter.collection';

export function loadParameters() {
    if (Parameters.find().cursor.count() === 0) {
        const parameters: Parameter[] = [
            { _id: '100', name: 'start_payment_day', value: '1', description: 'initial day of month to validate client payment' },
            { _id: '200', name: 'end_payment_day', value: '5', description: 'final day of month to validate client payment' },
            { _id: '300', name: 'from_email', value: 'Iurest <no-reply@iurest.com>', description: 'default from account email to send messages' },
            { _id: '400', name: 'first_pay_discount', value: '50', description: 'discount in percent to service first pay' },
            { _id: '500', name: 'colombia_tax_iva', value: '19', description: 'Colombia tax iva to monthly iurest payment' },
            { _id: '600', name: 'payu_script_p_tag', value: 'url(https://maf.pagosonline.net/ws/fp?id=', description: 'url for security script for payu form in <p> tag' },
            { _id: '700', name: 'payu_script_img_tag', value: 'https://maf.pagosonline.net/ws/fp/clear.png?id=', description: 'url for security script for payu form in <img> tag' },
            { _id: '800', name: 'payu_script_script_tag', value: 'https://maf.pagosonline.net/ws/fp/check.js?id=', description: 'url for security script for payu form in <script> tag' },
            { _id: '900', name: 'payu_script_object_tag', value: 'https://maf.pagosonline.net/ws/fp/fp.swf?id=', description: 'url for security script for payu form in <object> tag' },
            { _id: '1000', name: 'payu_payments_url', value: 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi', description: 'url for connect payu payments API'},
            { _id: '2000', name: 'payu_reports_url', value: 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi', description: 'url for connect payu reports API'},
            { _id: '3000', name: 'ip_public_service_url', value: 'https://api.ipify.org?format=json', description: 'url for retrieve the client public ip'},
            { _id: '4000', name: 'payu_pay_info_url', value: 'http://192.168.0.10:9000/api/getCusPayInfo', description: 'url for retrieve credentials for payu payment'}
        ];

        parameters.forEach((parameter: Parameter) => Parameters.insert(parameter));
    }
}