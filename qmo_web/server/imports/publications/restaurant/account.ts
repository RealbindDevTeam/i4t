import { Meteor } from 'meteor/meteor';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';
import { check } from 'meteor/check';

/**
 * Meteor publication accounts with restaurantId condition and tableId condition
 * @param {string} _restaurantId
 * @param {string} _status
 */
Meteor.publish( 'getAccountsByTableRestaurant', function( _restaurantId:string, _status:string ){
    check( _restaurantId, String );
    check( _status, String );
    return Accounts.collection.find( { restaurantId: _restaurantId, status: _status } );
});

/**
 * Meteor publication account by tableId
 * @param {string} _tableId
 */
Meteor.publish( 'getAccountsByTableId', function( _tableId : string ){
    check( _tableId, String );
    return Accounts.collection.find( { tableId : _tableId } );
});