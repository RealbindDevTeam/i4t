import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Payment } from '../../../../both/models/restaurant/payment.model';
import { Payments } from '../../../../both/collections/restaurant/payment.collection';

/**
 * Meteor publication payments with userId condition
 * @param {string} _userId
 */
Meteor.publish( 'getUserPayments', function( _userId: string ){
    check( _userId, String );
    return Payments.collection.find( { creation_user: _userId } );
});

/**
 * Meteor publication payments with userId and restaurant conditions
 * @param {string} _userId
 * @param {string} _restaurantId
 */
Meteor.publish( 'getUserPaymentsByRestaurant', function( _userId: string, _restaurantId: string ) {
    check( _userId, String );
    check( _restaurantId, String );
    return Payments.collection.find( { creation_user: _userId, restaurantId: _restaurantId } );
});

/**
 * Meteor publication payments with userId, restaurantId and tableId conditions
 * @param {string} _userId
 * @param {string} _restaurantId
 * @param {string} _tableId
 */
Meteor.publish( 'getUserPaymentsByRestaurantAndTable', function( _userId: string, _restaurantId: string, _tableId: string, _status: string[] ) {
    check( _userId, String );
    check( _restaurantId, String );
    check( _tableId, String );
    return Payments.collection.find( { creation_user: _userId, restaurantId: _restaurantId, tableId: _tableId, status: { $in: _status } } );
});

/**
 * Meteor publication payments with resturantId and tableId conditions
 * @param {string} _restaurantId
 * @param {string} _tableId
 */
Meteor.publish( 'getPaymentsToWaiter', function( _restaurantId: string, _tableId: string ) {
    check( _restaurantId, String );
    check( _tableId, String );
    return Payments.collection.find( { restaurantId: _restaurantId, tableId: _tableId, status: 'PAYMENT.NO_PAID' } );
});