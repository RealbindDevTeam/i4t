import { Meteor } from 'meteor/meteor';
import { Restaurants, RestaurantImages, RestaurantImageThumbs } from '../../../../both/collections/restaurant/restaurant.collection';
import { UserDetails } from '../../../../both/collections/auth/user-detail.collection';
import { check } from 'meteor/check';
import { Accounts } from '../../../../both/collections/restaurant/account.collection';

/**
 * Meteor publication restaurants with creation user condition
 * @param {string} _userId
 */
Meteor.publish( 'restaurants', function (_userId:string ){
    check( _userId, String );
    return Restaurants.collection.find( { creation_user: _userId } );
});

/**
 * Meteor publication restaurantImages with user Id condition
 * @param {string} _userId 
 */
Meteor.publish( 'restaurantImages', function( _userId:string ) {
    check( _userId, String );
    return RestaurantImages.collection.find( { userId: _userId } );
});

/**
 * Meteor publication restaurantImages with user Id condition
 * @param {string} _userId 
 */
Meteor.publish( 'restaurantImagesByRestaurantWork', function( _userId : string ) {
    check( _userId, String );
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    return RestaurantImages.collection.find( { restaurantId: user_detail.restaurant_work } );
});

/**
 * Meteor publications restaurantByCurrentUser
 * @param {string} _userId
 */

Meteor.publish('getRestaurantByCurrentUser', function( _userId: string){
    check( _userId, String);
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    return Restaurants.collection.find({_id: user_detail.current_restaurant});
});

/**
 * Meteor publications restaurantByRestaurantWork
 * @param {string} _userId
 */

Meteor.publish('getRestaurantByRestaurantWork', function( _userId: string){
    check( _userId, String);
    var user_detail = UserDetails.collection.findOne({ user_id: _userId });
    return Restaurants.collection.find({_id: user_detail.restaurant_work});
});

/**
 * Meteor publication restaurantImageThumbs with user Id condition
 * @param {string} _userId 
 */
Meteor.publish( 'restaurantImageThumbs', function( _userId:string ) {
    check( _userId, String );
    return RestaurantImageThumbs.collection.find( { userId: _userId } );
});