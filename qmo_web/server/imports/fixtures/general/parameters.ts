import { Parameter } from '../../../../both/models/general/parameter.model';
import { Parameters } from '../../../../both/collections/general/parameter.collection';

export function loadParameters() {
    if (Parameters.find().cursor.count() === 0) {
        const parameters: Parameter[] = [
            { _id: '100', name: 'trial_days', value: '15', description: 'trial days to test the iurest system' },
            { _id: '200', name: 'first_advice_days', value: '5', description: 'first advice days before to end trial' },
            { _id: '300', name: 'second_advice_days', value: '3', description: 'second advice days before to end trial' },
            { _id: '400', name: 'third_advice_days', value: '1', description: 'third advice days before to end trial' },
            { _id: '500', name: 'from_email', value: 'Iurest <no-reply@iurest.com>', description: 'default from account email to send messages' },
            { _id: '600', name: 'first_pay_discount', value: '50', description: 'discount in percent to service first pay' }
        ];

        parameters.forEach((parameter: Parameter) => Parameters.insert(parameter));
    }
}