import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Invoices } from '../../../../both/collections/restaurant/invoice.collection';

/**
 * This method return Invoices by UserId
 * @param {string} _pUserId
 */
Meteor.publish('getInvoicesByUserId', function( _pUserId : string ){
    check(_pUserId, String);
    return Invoices.collection.find({ customer_id : _pUserId });
});