import { Meteor } from 'meteor/meteor';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';
import { UserDetail } from '../../../../both/models/auth/user-detail.model';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
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

/**
 * Meteor publication account by userId
 * @param {string} userId
 */
Meteor.publish( 'getAccountsByUserId', function( _userId : string ){
    check( _userId, String );
    let _lUserDetail: UserDetail = UserDetails.findOne({ user_id: _userId });
    if( _lUserDetail ){
        if(_lUserDetail.current_restaurant !== "" && _lUserDetail.current_table !== ""){
            return Accounts.collection.find( { restaurantId : _lUserDetail.current_restaurant, tableId : _lUserDetail.current_table } );
        } else {
            return;
        }
    } else {
        return;
    }

});