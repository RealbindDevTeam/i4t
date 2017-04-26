import { Meteor } from 'meteor/meteor';
import { WaiterCallDetails } from '../../../../both/collections/restaurant/waiter-call-detail.collection';

/**
 * Meteor publication waiter call details. userId
 * @param { string } _userId
 */
Meteor.publish('countWaiterCallDetailByUsrId', function ( _userId : string ) {
  return WaiterCallDetails.collection.find({ user_id: _userId, status : { $in : ["waiting", "completed"] } });
});

/**
 * Meteor publication waiter call details. userId (Waiter id)
 * @param { string } _waiterId
 */
Meteor.publish('waiterCallDetailByWaiterId', function ( _waiterId : string ) {
  return WaiterCallDetails.collection.find({ waiter_id: _waiterId, status : "completed" });
});