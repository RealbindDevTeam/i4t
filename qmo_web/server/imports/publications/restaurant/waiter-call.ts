import { Meteor } from 'meteor/meteor';
import { WaiterCallDetails } from '../../../../both/collections/restaurant/waiter-call-detail.collection';

/**
 * Meteor publication waiter call details. userId and restaurantId condition
 * @param { string } _userId
 * @param { string } _restaurant_id
 */
Meteor.publish('countWaiterCallDetailByUsrIdAndRestaurantId', function (_userId : string, _restaurant_id : string ) {
  return WaiterCallDetails.collection.find({ user_id: _userId, restaurant_id: _restaurant_id, state : "waiting" });
});

/**
 * Meteor publication waiter call details. userId and restaurantId condition
 * @param { string } _userId
 */
Meteor.publish('countWaiterCallDetailByUsrId', function ( _userId : string ) {
  return WaiterCallDetails.collection.find({ user_id: _userId, state : "waiting" });
});