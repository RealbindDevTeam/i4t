import { CcPaymentMethod } from '../../../../both/models/payment/cc-payment-method.model';
import { CcPaymentMethods } from '../../../../both/collections/payment/cc-payment-methods.collection'

export function loadCcPaymentMethods() {
    if (CcPaymentMethods.find().cursor.count() == 0) {
        const ccPaymentMethods: CcPaymentMethod[] = [
            { _id: '10', is_active: true, name: 'Visa', payu_code: 'VISA' },
            { _id: '20', is_active: true, name: 'MasterCard', payu_code: 'MASTERCARD' },
            { _id: '30', is_active: true, name: 'American Express', payu_code: 'AMEX' },
            { _id: '40', is_active: true, name: 'Diners Club', payu_code: 'DINERS' }
        ];
        ccPaymentMethods.forEach((ccPaymentMethod: CcPaymentMethod) => { CcPaymentMethods.insert(ccPaymentMethod) });
    }
}