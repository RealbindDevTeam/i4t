import { Meteor } from 'meteor/meteor';
import { PaymentMethods } from '../../../../both/collections/general/paymentMethod.collection';

/**
 * Meteor publication paymentMethods
 */
Meteor.publish( 'paymentMethods', function publishPaymentMethods(){
    return PaymentMethods.find( { } );
});