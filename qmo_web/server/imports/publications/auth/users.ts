import { Meteor } from 'meteor/meteor';
import { Users } from '../../../../both/collections/auth/user.collection';

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