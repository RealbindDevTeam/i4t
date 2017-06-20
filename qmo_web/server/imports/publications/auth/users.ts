import { Meteor } from 'meteor/meteor';
import { Users } from '../../../../both/collections/auth/user.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { check } from 'meteor/check';

/*Meteor.publish('getUserProfile', function () {
    return Users.find({_id: this.userId});
});*/

Meteor.publish('getUserSettings', function () {
    return Users.find({ _id: this.userId }, { fields: { username: 1, "services.profile.name": 1, "services.facebook": 1, "services.twitter": 1, "services.google": 1 } });
});

/**
 * Meteor publish, get all users
 */
Meteor.publish('getUsers', function () {
    return Users.find({});
});

/**
 * Meteor publish. Get user by Id
 */
Meteor.publish('getUserByUserId', function ( _usrId : string ) {
    return Users.find({ _id : _usrId });
});

/**
 * Meteor publication return users with restaurant and table Id conditions
 * @param {string} _pRestaurantId
 * @param {string} _pTableId
 */
Meteor.publish( 'getUserByTableId', function( _pRestaurantId: string, _pTableId ){
    check( _pRestaurantId, String );
    check( _pTableId, String );
    let _lUsers: string[] = [];
    UserDetails.find( { current_restaurant: _pRestaurantId, current_table: _pTableId } ).fetch().forEach( (user) => {
        _lUsers.push( user.user_id );
    });
    return Users.find( { _id: { $in: _lUsers } } );
});